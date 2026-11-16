---
title: 术语表
lead: 本系列定义的每一个术语，按汉语拼音排序，附简短的释义、英文原文以及讲解它的章节。
---

有两种含义的术语会把两种含义都列出来。符号和记法见[速查表](cheatsheet_ZH.html#notation)，Isabelle 的消息见[问题排查](troubleshooting_ZH.html)。最后一列的数字是各模块的章节号：7.2.1 指模块 7 的第 7.2.1 节。以英文字母或符号开头的术语（例如 SAT 求解器、λ 抽象）按其英文读音排在相应字母下。

[A](#g-a) · [B](#g-b) · [C](#g-c) · [D](#g-d) · [E](#g-e) · [F](#g-f) · [G](#g-g) · [H](#g-h) · [I](#g-i) · [J](#g-j) · [K](#g-k) · [L](#g-l) · [M](#g-m) · [N](#g-n) · [O](#g-o) · [P](#g-p) · [Q](#g-q) · [R](#g-r) · [S](#g-s) · [T](#g-t) · [W](#g-w) · [X](#g-x) · [Y](#g-y) · [Z](#g-z)

## 术语（按拼音排序） {#terms}

<div class="section-anchor" id="g-a"></div>

### A

| 术语 | 释义 | 出处 |
|---|---|---|
| **α 等价的**<br>α-equivalent | 只在约束变元的名字上不同的公式是 α 等价的，例如 ∃y. R x y 和 ∃z. R x z；它们的含义相同。 | [3.5.2](module_03_ZH.html#substitution) |
| **安全的**<br>safe | 如果一个步骤或规则永远不会把可证的目标变成不可证的子目标（例如 `conjI` 和 `impI`），它就是安全的；不安全的（例如 `disjI1` 和 `allE`）则可能会。 | [6.7](module_06_ZH.html#search), [9.4](module_09_ZH.html#classical) |
| **安全性质**<br>safety property | 说明坏事永远不会发生的性质：它必须在每个可达状态中成立。 | [4.5.2](module_04_ZH.html#reachability), [13.3](module_13_ZH.html#invariants) |
| **apply 脚本**<br>apply script | 由一串 `apply` 步骤组成、以 `done` 结束的证明。 | [5.4.2](module_05_ZH.html#induction-state) |

<div class="section-anchor" id="g-b"></div>

### B

| 术语 | 释义 | 出处 |
|---|---|---|
| **半可判定的**<br>semi-decidable | 存在一个算法，对答案为“是”的每个输入都回答“是”，但对其他输入可能永远运行下去。谓词逻辑中的有效性是半可判定的。 | [3.9](module_03_ZH.html#decidability) |
| **保持语义的**<br>semantics-preserving | 如果优化后的程序在每个状态下都与原程序含义相同，这个优化就是保持语义的，也就是正确的。 | [14.6.1](module_14_ZH.html#folding) |
| **爆炸原理**<br>principle of explosion | 由不一致的前提或由 ⊥ 可以推出任何东西；拉丁语为 ex falso quodlibet。 | [2.6](module_02_ZH.html#consequence) |
| **本征变元**<br>eigenvariable | 规则 (∀I) 和 (∃E) 中的名字 a。它必须是新的：这就是本征变元条件。 | [6.6](module_06_ZH.html#quantifiers) |
| **β 归约**<br>β-reduction | 把 `λx. t` 作用于参数 a 的那一步：结果是把 t 中的 x 换成 a。 | [8.2.1](module_08_ZH.html#lambda) |
| **闭包**<br>closure | 包含 R 并具有某种性质（自反、对称或传递）的最小关系。 | [4.5.1](module_04_ZH.html#closure-def) |
| **编译器**<br>compiler | 把一种语言的程序翻译成另一种语言的程序，这里是把算术表达式翻译成栈机代码。 | [14.4](module_14_ZH.html#compiler) |
| **编译器正确性**<br>compiler correctness | 运行编译出的代码与源程序的含义一致：这里是 `exec (compile e) s stk = eval e s # stk`。 | [14.4.2](module_14_ZH.html#correct) |
| **变式**<br>variant | 循环的度量：每一步都会减小的量，它表明循环会停止。 | [5.8.1](module_05_ZH.html#loop-invariant) |
| **变元捕获**<br>variable capture | 代入的项中的变元被某个量词约束，从而改变了含义；先给约束变元改名就能避免。 | [3.5.2](module_03_ZH.html#substitution) |
| **标准规则**<br>standard rule | 不带方法的 `proof` 所应用的规则，按目标的主联结词选定，或者是针对传给它的事实的消去规则。 | [10.2.6](module_10_ZH.html#shape-start) |
| **并集**<br>union | A ∪ B，属于 A 或属于 B 的元素。 | [4.1.2](module_04_ZH.html#sets-ops) |
| **补集**<br>complement | −A，该类型中不属于 A 的元素。Isabelle 中写作 `- A`。 | [4.1.2](module_04_ZH.html#sets-ops) |
| **不变式**<br>invariant | 始终保持成立的性质。在模块 5 中指初始时成立、并被每一步保持的性质；在模块 13 中指在每个可达状态中都成立的性质；对数据结构来说，指由其操作构造出的每个值都具有的性质。 | [5.8](module_05_ZH.html#invariants), [12.5.3](module_12_ZH.html#bst-invariant), [13.3](module_13_ZH.html#invariants) |
| **不可比较的**<br>incomparable | 如果偏序中两个元素谁也不在谁的下面，它们就是不可比较的，例如在 ⊆ 下的 {1} 和 {2}。 | [4.4.1](module_04_ZH.html#partial-orders) |
| **不可满足的**<br>unsatisfiable | 在任何赋值下（或在任何结构中）都不为真。 | [2.4](module_02_ZH.html#classify), [3.4](module_03_ZH.html#validity) |
| **不可判定的**<br>undecidable | 没有算法能对每个输入都正确回答这个问题。谓词逻辑中的有效性是不可判定的（丘奇和图灵，1936）。 | [3.9](module_03_ZH.html#decidability) |
| **不可数的**<br>uncountable | 不是可数的，例如由康托尔的对角线论证可知，自然数的所有子集组成的集合不可数。 | [4.7.4](module_04_ZH.html#cantor) |
| **不完备性定理**<br>incompleteness theorems | 哥德尔的定理（1931）：任何一个公理可由程序检查、并且只证明真陈述的证明系统，都不能证明关于自然数的全部真理。 | [3.9](module_03_ZH.html#decidability) |
| **不相交的**<br>disjoint | 没有公共元素的两个集合是不相交的：A ∩ B = ∅。 | [4.1.2](module_04_ZH.html#sets-ops) |
| **部分函数**<br>partial function | 每个输入至多有一个输出的关系，例如可能陷入死循环的程序所计算的函数。HOL 把它建模为结果为 `option` 的全函数。 | [4.6.1](module_04_ZH.html#fun-def) |
| **部分应用**<br>partial application | 把柯里化的函数作用于少于它可接受个数的参数。结果是一个函数，例如 `(+) 3`。 | [8.2.2](module_08_ZH.html#currying) |
| **部分正确性**<br>partial correctness | 程序返回的每个结果都与逻辑一致的保证，但不保证它一定会返回。 | [8.8](module_08_ZH.html#codegen), [12.7.1](module_12_ZH.html#guarantee) |

<div class="section-anchor" id="g-c"></div>

### C

| 术语 | 释义 | 出处 |
|---|---|---|
| **case 表达式**<br>case expression | 通过与模式匹配来拆开一个值的项，每个模式一个分支，例如对一个选项值进行 `case`，分别处理 `None` 和 `Some x`。 | [8.3.4](module_08_ZH.html#case) |
| **差集**<br>difference | A − B，属于 A 但不属于 B 的元素。 | [4.1.2](module_04_ZH.html#sets-ops) |
| **拆解规则**<br>destruction rule | 主前提中含有联结词、结论是主前提的一部分的规则，例如 `conjunct1`、`mp` 和 `spec`。它与 `drule` 和 `frule` 一起使用。 | [7.2.3](module_07_ZH.html#rules-shapes) |
| **常量**<br>constant | 指称单个对象的符号，例如 `alice` 或 0。在 Isabelle 中，指已定义或已声明的名字，与变元相对。 | [3.2](module_03_ZH.html#language) |
| **常量折叠**<br>constant folding | 一种优化：把程序中值不依赖于状态的部分替换为它们的值，并去掉不起作用的运算。 | [14.6.1](module_14_ZH.html#folding) |
| **冲突驱动的子句学习（CDCL）**<br>CDCL (conflict-driven clause learning) | 发生冲突后，SAT 求解器添加一个子句，排除导致冲突的那组决策，使搜索不会两次犯同样的错误。 | [2.8](module_02_ZH.html#sat) |
| **重叠的等式**<br>overlapping equations | 模式可以匹配同一个参数的 `fun` 等式。`fun` 使用第一个匹配的等式。 | [8.4.3](module_08_ZH.html#patterns) |
| **重写**<br>rewriting | 反复把项中与等式左边匹配的部分替换为右边。 | [5.1.3](module_05_ZH.html#rewriting), [9.2.1](module_09_ZH.html#rewriting) |
| **重写规则**<br>rewrite rule | 只从左往右使用的等式 l = r。 | [5.1.3](module_05_ZH.html#rewriting), [9.2.1](module_09_ZH.html#rewriting) |
| **重言式**<br>tautology | 在每个赋值下都为真的公式；也称为有效的。 | [2.4](module_02_ZH.html#classify) |
| **重载**<br>overloading | 一个名字根据类型有多种含义，例如 `nat` 和 `int` 上的 +。Isabelle 用类型类来组织重载。 | [8.6.2](module_08_ZH.html#classes) |
| **抽象函数**<br>abstraction function | 把每个具体的值或状态映射为它所表示的抽象值或状态的函数，例如把搜索树映射为集合的 `set_of`。 | [12.5.1](module_12_ZH.html#bst-trees), [13.7.1](module_13_ZH.html#two-models) |
| **抽象语法**<br>abstract syntax | 把程序看作一棵树的结构：每个结点是一个运算，它的子结点是操作数。在 Isabelle 中，抽象语法是一个数据类型。 | [14.2.1](module_14_ZH.html#syntax) |
| **初始方法**<br>initial method | `proof` 后面的方法，它把目标变成证明块中的待证目标。 | [10.2.1](module_10_ZH.html#shape-blocks) |
| **初始状态**<br>initial state | 状态机可以从它开始运行的状态。 | [13.1](module_13_ZH.html#machines) |
| **传递闭包**<br>transitive closure | R⁺，由一步或多步 R 连接起来的有序对。Isabelle 中写作 `r⇧+`。 | [4.5.1](module_04_ZH.html#closure-def) |
| **传递的**<br>transitive | 如果由 (x, y) ∈ R 和 (y, z) ∈ R 可以推出 (x, z) ∈ R，关系 R 就是传递的。 | [4.2.3](module_04_ZH.html#rel-props) |
| **传值调用**<br>call by value | 一种求值顺序：先对调用的参数求值，再执行调用本身。 | [5.1.3](module_05_ZH.html#rewriting) |
| **纯函数**<br>pure function | 结果只依赖于参数的函数。HOL 中的每个函数都是纯函数。 | [6.8](module_06_ZH.html#equality) |
| **词汇表**<br>vocabulary | 一种语言的非逻辑符号及其元数：常量、函数符号和谓词符号；也叫签名。 | [3.2](module_03_ZH.html#language) |
| **存在量词**<br>existential quantifier | ∃：∃x. φ 表示至少有一个 x 使 φ 成立。 | [3.2.3](module_03_ZH.html#quantifiers) |

<div class="section-anchor" id="g-d"></div>

### D

| 术语 | 释义 | 出处 |
|---|---|---|
| **大小**<br>size | `fun` 首先尝试的度量：对自然数是这个数本身，对列表是它的长度，对其他数据类型的值是其中带参数的构造子的个数。 | [8.7.2](module_08_ZH.html#termination-messages) |
| **代码生成**<br>code generation | 用 `export_code` 把 HOL 中的定义翻译成 Standard ML、OCaml、Haskell 或 Scala。`value` 也使用同一套机制。 | [8.8](module_08_ZH.html#codegen) |
| **代入**<br>substitution | φ[t/x]，把 φ 中每个自由的 x 换成项 t；也指规则 (=E)，即用相等的东西替换相等的东西。 | [3.5.2](module_03_ZH.html#substitution), [6.8](module_06_ZH.html#equality) |
| **待证目标**<br>pending goal | Isar 证明块中在 `qed` 之前仍需由 `show` 解决的目标。 | [10.2.1](module_10_ZH.html#shape-blocks) |
| **单射的**<br>injective | 不同的输入给出不同的输出：由 f x = f y 可以推出 x = y。Isabelle 中写作 `inj f`。 | [4.6.2](module_04_ZH.html#inj-surj) |
| **单元传播**<br>unit propagation | DPLL 过程中的一步：如果一个子句中除一个文字外都为假，剩下的那个文字必须为真，于是给它赋值。 | [2.8](module_02_ZH.html#sat) |
| **德摩根律**<br>De Morgan's laws | ¬(A ∧ B) ≡ ¬A ∨ ¬B 以及 ¬(A ∨ B) ≡ ¬A ∧ ¬B。 | [2.5](module_02_ZH.html#equivalence) |
| **等价关系**<br>equivalence relation | 自反、对称且传递的关系。它的等价类构成一个划分。 | [4.3](module_04_ZH.html#equivalence) |
| **等价类**<br>equivalence class | 在一个等价关系下与 x 相关的元素组成的集合，记作 [x]。 | [4.3](module_04_ZH.html#equivalence) |
| **等可满足的**<br>equisatisfiable | 如果一个公式可满足当且仅当另一个公式可满足，这两个公式就是等可满足的。 | [2.7.2](module_02_ZH.html#cnf-dnf) |
| **笛卡儿积**<br>Cartesian product | A × B，所有满足 a ∈ A 且 b ∈ B 的有序对 (a, b) 组成的集合。 | [4.2.1](module_04_ZH.html#products) |
| **递归定义**<br>recursive definition | 用等式定义函数，函数本身也可以出现在等式右边，但只作用于更小的参数。 | [5.1.2](module_05_ZH.html#nat-functions) |
| **递归情形**<br>recursive case | 递归定义中对较小参数调用函数本身的情形。 | [5.1.2](module_05_ZH.html#nat-functions) |
| **递归数据类型**<br>recursive datatype | 在定义中引用自身的数据类型，例如列表、栈和树。 | [8.3.2](module_08_ZH.html#recursive) |
| **定理**<br>theorem | 不需要任何假设就能推导出的公式。在 Isabelle 中指已证明的陈述，只有内核能创建它。 | [6.2](module_06_ZH.html#systems) |
| **定义域**<br>domain (of a function) | 对函数 f : A → B 来说，集合 A。 | [4.6.1](module_04_ZH.html#fun-def) |
| **DPLL 过程**<br>DPLL procedure | SAT 求解器所依据的搜索方法：单元传播、决策，以及发生冲突后回到最近的决策。 | [2.8](module_02_ZH.html#sat) |
| **度量**<br>measure | 从递归函数的参数到自然数的函数，在每次递归调用时都严格变小。它证明了递归会终止。 | [5.7.2](module_05_ZH.html#measures), [8.7.2](module_08_ZH.html#termination-messages) |
| **队列**<br>queue | 排队的队伍：元素从队尾加入、从队首离开，先加入的先离开。 | [12.6.2](module_12_ZH.html#queue) |
| **对称的**<br>symmetric | 如果由 (x, y) ∈ R 可以推出 (y, x) ∈ R，关系 R 就是对称的。 | [4.2.3](module_04_ZH.html#rel-props) |
| **对角线论证**<br>diagonal argument | 康托尔证明“没有函数 f 能把一个集合映射到其幂集上”的方法：由所有不属于 f x 的元素 x 组成的集合不是 f 的值。 | [4.7.4](module_04_ZH.html#cantor) |
| **对偶**<br>dual | 把 ∪ 和 ∩（以及 ∅ 和 UNIV）互换得到的定律。集合定律的对偶也成立。 | [4.1.3](module_04_ZH.html#sets-laws) |
| **对象逻辑**<br>object logic | 书写公式所用的逻辑；在 Isabelle/HOL 中是 HOL，含 ¬ ∧ ∨ ⟶ ∀ ∃ 和 =。 | [7.1.1](module_07_ZH.html#meta-pure) |
| **多重集**<br>multiset | 不计顺序、但计每个元素出现次数的汇集；也叫袋。`mset xs` 是列表元素组成的多重集。 | [12.2.2](module_12_ZH.html#isort-spec) |
| **多类逻辑**<br>many-sorted logic | 带类型的逻辑：符号的每个参数和结果都有一个类别，每个变元只在一个类别的论域中取值。 | [3.8](module_03_ZH.html#types) |
| **多态的**<br>polymorphic | 类型中含有类型变量的函数（例如 `rev :: 'a list ⇒ 'a list`）对该类型的每个实例都适用。 | [8.1.1](module_08_ZH.html#types) |

<div class="section-anchor" id="g-e"></div>

### E

| 术语 | 释义 | 出处 |
|---|---|---|
| **二叉树**<br>binary tree | 要么为空，要么是一个结点，带有一个元素和两棵更小的树，即左子树和右子树。 | [5.2.2](module_05_ZH.html#trees) |
| **二叉搜索树**<br>binary search tree | 一种存放键的二叉树：每个结点左子树中的键都比该结点的键小，右子树中的键都比它大；它的操作必须保持这个不变式。 | [12.5](module_12_ZH.html#bst) |

<div class="section-anchor" id="g-f"></div>

### F

| 术语 | 释义 | 出处 |
|---|---|---|
| **反对称的**<br>antisymmetric | 如果由 (x, y) ∈ R 和 (y, x) ∈ R 可以推出 x = y，关系 R 就是反对称的。 | [4.2.3](module_04_ZH.html#rel-props) |
| **反例**<br>counterexample | 使断言为假的东西：一个赋值、一组自由变元的值，或者一条到达坏状态的运行。 | [2.4](module_02_ZH.html#classify), [13.3](module_13_ZH.html#invariants) |
| **反例轨迹**<br>counterexample trace | 从初始状态到违反某个性质的状态的一条运行，写成事件列表。 | [4.5.2](module_04_ZH.html#reachability), [13.6](module_13_ZH.html#traces) |
| **反模型**<br>countermodel | 使一个公式为假的结构（连同对自由变元的指派）。一个反模型就足以否定有效性。 | [3.4](module_03_ZH.html#validity) |
| **反向搜索**<br>backward search | 从目标出发寻找证明：选一条结论与目标相符的规则，它的前提就成为新的子目标。Isabelle 就是这样工作的。 | [6.7](module_06_ZH.html#search) |
| **反证法**<br>proof by contradiction | 要证明 A，先假设 ¬A 并推出矛盾：即规则 (RAA)，在 Isabelle 中是 `ccontr`。 | [6.1](module_06_ZH.html#informal), [6.5](module_06_ZH.html#classical) |
| **反自反的**<br>irreflexive | 如果 A 中没有元素与自身相关，关系在 A 上就是反自反的。 | [4.2.3](module_04_ZH.html#rel-props) |
| **范式**<br>normal form | （1）公式的一种标准形状：否定范式、合取范式或析取范式。（2）在重写中，指不能再被任何规则重写的项。 | [2.7](module_02_ZH.html#normal-forms), [9.2.1](module_09_ZH.html#rewriting) |
| **否定**<br>negation | ¬A，读作“非 A”：A 为假时为真。 | [2.1](module_02_ZH.html#connectives) |
| **否定范式**<br>negation normal form (NNF) | 只用 ¬、∧ 和 ∨、并且每个 ¬ 都紧挨在原子前面的公式。 | [2.7.1](module_02_ZH.html#nnf) |
| **辅助引理**<br>auxiliary lemma | 因为一个更大的证明需要它而先行证明的引理。更大的证明卡住时剩下的目标通常会显示它应当说什么。 | [11.3](module_11_ZH.html#lemmas), [14.5.1](module_14_ZH.html#paper) |
| **附加条件**<br>side condition | 规则的额外条件，例如本征变元条件，或者引入规则中不涉及被定义谓词的前提。 | [6.6](module_06_ZH.html#quantifiers), [11.6](module_11_ZH.html#inductive) |
| **复合**<br>composition | R O S 先走一步 R，再走一步 S。对函数来说，(g ∘ f) x = g (f x)，读作“g 在 f 之后”。 | [4.2.4](module_04_ZH.html#rel-ops), [4.6.3](module_04_ZH.html#inverse) |
| **赋值**<br>valuation | 给每个原子指定一个真值 T 或 F。 | [2.3](module_02_ZH.html#truth-tables) |

<div class="section-anchor" id="g-g"></div>

### G

| 术语 | 释义 | 出处 |
|---|---|---|
| **高阶逻辑**<br>higher-order logic (HOL) | 一种带类型的逻辑，函数和谓词都是值，因此变元和量词可以取遍它们。它就是 Isabelle/HOL 的逻辑。 | [1.4](module_01_ZH.html#trust), [3.8](module_03_ZH.html#types) |
| **鸽巢原理**<br>pigeonhole principle | 不存在从一个有限集合到更小集合的单射。 | [4.7.2](module_04_ZH.html#pigeonhole) |
| **公理**<br>axiom | 没有前提的推理规则。 | [6.2](module_06_ZH.html#systems) |
| **公平性**<br>fairness | 排除不公平运行的假设，例如“守卫条件一直为真的事件终究会发生”。活性的证明需要它。 | [13.8.1](module_13_ZH.html#liveness) |
| **公式**<br>formula | 按形成规则构造的表达式：由原子（或原子公式）、`True` 和 `False` 出发，用联结词以及（在谓词逻辑中）量词构成。 | [2.2.1](module_02_ZH.html#formation), [3.2.3](module_03_ZH.html#quantifiers) |
| **功能正确性**<br>functional correctness | 关于程序计算出什么结果的正确性，不涉及它花多长时间、用多少内存。 | [12.1](module_12_ZH.html#verify) |
| **构造子**<br>constructor | 构造数据类型的值的函数之一，例如列表的 `[]` 和 `#`，或者交通灯的 `Red`。 | [5.2.2](module_05_ZH.html#trees), [8.3.1](module_08_ZH.html#enumerations) |
| **固定变量**<br>fixed variable | 子目标中由 ⋀ 约束的变量，或在 Isar 中由 `fix` 引入的变量。它代表一个任意的值，合一永远不会替换它。Isabelle 也称之为参数。 | [7.6.1](module_07_ZH.html#quantifiers-all), [10.2.4](module_10_ZH.html#shape-fix) |
| **关系**<br>relation | 有序对的集合：从 A 到 B 的关系是 A × B 的子集。 | [4.2.2](module_04_ZH.html#rel-def) |
| **归谬法（RAA）**<br>RAA (reductio ad absurdum) | 拉丁语 reductio ad absurdum 的缩写，指这样一条规则：要证明 A，假设 ¬A 并推出 ⊥。它使自然演绎成为经典的；在 Isabelle 中是 `ccontr`。 | [6.5](module_06_ZH.html#classical) |
| **归纳**<br>induction | 先证明结论对最小的值成立，再证明它能从较小的值传到较大的值，以此证明它对每个值成立。数学归纳法、结构归纳法、强归纳法和规则归纳法都是它的形式。 | [5.3.1](module_05_ZH.html#principle) |
| **归纳不变式**<br>inductive invariant | 在每个初始状态都成立、并被每一步保持的性质。它因此在每个可达状态中都成立。 | [13.3](module_13_ZH.html#invariants) |
| **归纳步骤**<br>induction step | 归纳中由归纳假设证明结论对 n + 1（或更大的值）成立的那一部分。 | [5.3.1](module_05_ZH.html#principle) |
| **归纳定义**<br>inductive definition | 用引入规则定义谓词。谓词恰好对有限次应用规则所能推导出的对象成立：它是对这些规则封闭的最小谓词。 | [11.6](module_11_ZH.html#inductive) |
| **归纳反例**<br>counterexample to induction | 破坏不变式证明中步骤情形的一个状态和一个事件：该状态满足不变式，而这个事件使系统离开它。 | [13.5.1](module_13_ZH.html#fails) |
| **归纳假设**<br>induction hypothesis (IH) | 归纳步骤中“结论对较小的值成立”的假设。在 Isabelle 的子目标中它位于 ⟹ 前面；在 Isar 中它是 `c.IH`。 | [5.3.1](module_05_ZH.html#principle) |
| **规约**<br>specification | 对系统必须做什么的精确陈述，不说明怎样做。 | [1.2](module_01_ZH.html#formal), [12.1](module_12_ZH.html#verify) |
| **规则反演**<br>rule inversion | 从事实 I t 往回推理：只有结论能与 t 匹配的规则才可能推出它，因此这些规则的前提成立。 | [11.6.3](module_11_ZH.html#inversion) |
| **规则归纳法**<br>rule induction | 证明归纳定义推导出的一切都具有某个性质：每条规则一个情形，每个关于该谓词的前提都有一个归纳假设。在 Isabelle 中用 `rule: I.induct`。 | [11.6.2](module_11_ZH.html#rule-induction) |
| **轨迹**<br>trace | 写成事件列表（以及它们所到达的状态）的运行。 | [13.1](module_13_ZH.html#machines) |

<div class="section-anchor" id="g-h"></div>

### H

| 术语 | 释义 | 出处 |
|---|---|---|
| **哈斯图**<br>Hasse diagram | 有限集合上偏序的一种画法：较小的元素画在下面，只在一个元素覆盖另一个元素时才连线。 | [4.4.2](module_04_ZH.html#hasse) |
| **函数**<br>function | 定义域中每个元素都恰好与陪域中一个元素相关的关系。在 HOL 中，函数和其他东西一样是值。 | [4.6.1](module_04_ZH.html#fun-def) |
| **函数符号**<br>function symbol | 指称一种运算、其结果是一个对象的符号，例如 `owner` 或 +。 | [3.2](module_03_ZH.html#language) |
| **函数应用**<br>application | 把函数 f 作用于参数 a，写作 `f a`，不用括号和逗号。函数应用向左结合：`f x y` 就是 `(f x) y`。 | [8.2.1](module_08_ZH.html#lambda) |
| **合取**<br>conjunction | A ∧ B，读作“A 并且 B”：两者都为真时为真。 | [2.1](module_02_ZH.html#connectives) |
| **合取范式**<br>conjunctive normal form (CNF) | 子句的合取，例如 (A ∨ ¬B) ∧ (¬A ∨ C ∨ D) ∧ ¬C。SAT 求解器处理的就是这种形式。 | [2.7.2](module_02_ZH.html#cnf-dnf) |
| **合一**<br>unification | 通过为图式变量选择值，使两个项完全相同。Isabelle 每次应用规则时都会做合一。 | [7.3.4](module_07_ZH.html#backward-unification) |
| **恒等关系**<br>identity relation | 集合 A 上的相等关系：{(x, x). x ∈ A}。 | [4.2.2](module_04_ZH.html#rel-def) |
| **恒假（⊥）**<br>falsum (⊥) | ⊥，读作 bottom 或 falsum：在每个赋值和每个结构中都为假的公式。Isabelle 中写作 `False`。 | [6.4.5](module_06_ZH.html#not) |
| **后继**<br>successor | `Suc n`，即数 n + 1。 | [5.1.1](module_05_ZH.html#peano) |
| **后件**<br>consequent | 在 A ⟶ B 中，公式 B。 | [2.1](module_02_ZH.html#connectives) |
| **后缀表示法**<br>postfix notation | 把操作数写在运算符之前，栈机代码就是这样；也叫逆波兰表示法。 | [14.4.1](module_14_ZH.html#compiling) |
| **化简跟踪**<br>trace (of the simplifier) | `using [[simp_trace]]` 逐条显示的化简器重写步骤。 | [9.3.5](module_09_ZH.html#tracing) |
| **化简规则**<br>simp rule | 化简器无需告知就会使用的定理。`[simp]` 使一条引理成为化简规则。 | [5.5.3](module_05_ZH.html#lemmas), [9.2.3](module_09_ZH.html#simp-rules) |
| **化简规则集**<br>simp set | 理论中某一处的全部化简规则：`fun` 和 `primrec` 的等式、`datatype` 的事实以及标记为 `[simp]` 的引理，但不包括定义。 | [9.2.3](module_09_ZH.html#simp-rules) |
| **化简器**<br>simplifier | Isabelle 的重写引擎，即方法 `simp`：它用等式从左往右重写目标，直到目标变成 `True` 或没有规则可用。 | [1.7.3](module_01_ZH.html#first-prove), [9.2.1](module_09_ZH.html#rewriting) |
| **划分**<br>partition | 由 A 的若干非空子集（称为块）组成的集合，使 A 的每个元素恰好属于一个块。 | [4.3](module_04_ZH.html#equivalence) |
| **活性性质**<br>liveness property | 说明好事终究会发生的性质，例如请求终究会得到处理。不变式无法表达它。 | [13.8.1](module_13_ZH.html#liveness) |

<div class="section-anchor" id="g-i"></div>

### I

| 术语 | 释义 | 出处 |
|---|---|---|
| **Isabelle/HOL**<br>Isabelle/HOL | 带高阶逻辑的 Isabelle，即本系列使用的证明助手。 | [1.4](module_01_ZH.html#trust) |
| **Isabelle/jEdit**<br>Isabelle/jEdit | Isabelle 的证明器集成开发环境：一个在你输入的同时由 Isabelle 检查文本的编辑器。 | [1.6](module_01_ZH.html#tour) |
| **Isabelle/Pure**<br>Isabelle/Pure | Pure，即 Isabelle 的元逻辑：规则和目标用它的 ⟹、⋀ 和 ≡ 书写，HOL 也在它里面定义。 | [7.1.1](module_07_ZH.html#meta-pure) |
| **Isar**<br>Isar | Isabelle 的结构化证明语言，名字是 Intelligible semi-automated reasoning 的缩写：每一步陈述一个事实，由 Isabelle 检查。 | [10.1](module_10_ZH.html#why) |

<div class="section-anchor" id="g-j"></div>

### J

| 术语 | 释义 | 出处 |
|---|---|---|
| **基本类型**<br>base type | 只是一个名字的类型，例如 `bool`、`nat` 或 `int`。 | [8.1.1](module_08_ZH.html#types) |
| **基础情形**<br>base case | 递归定义或归纳中不用到函数本身或归纳假设的情形，例如 0 或空列表。 | [5.1.2](module_05_ZH.html#nat-functions), [5.3.1](module_05_ZH.html#principle) |
| **基数**<br>cardinality | 有限集合 A 的元素个数，记作 |A|。Isabelle 中写作 `card A`。 | [4.7.1](module_04_ZH.html#finite) |
| **极小元素**<br>minimal element | 偏序中没有任何元素严格位于其下的元素；极大元素则没有任何元素严格位于其上。一个偏序可以有好几个极小元素。 | [4.4.2](module_04_ZH.html#hasse) |
| **集合**<br>set | 由元素组成的汇集，完全由它的元素决定。在 Isabelle 中，每个集合都有元素类型，例如 `nat set`。 | [4.1.1](module_04_ZH.html#sets-notation) |
| **计算归纳法**<br>computation induction | 沿着函数 f 的递归进行的归纳：每个定义等式一个情形，每个递归调用一个归纳假设。在 Isabelle 中用 `rule: f.induct`。 | [11.5.3](module_11_ZH.html#f-induct) |
| **记录**<br>record | 各个分量（字段）都有名字的元组。`cars s` 选取一个字段，`s⦇cars := Amber⦈` 更新它。 | [13.4.1](module_13_ZH.html#records) |
| **加强**<br>strengthen | 证明比所需更强的结论或不变式，使归纳步骤能够通过。 | [11.2.3](module_11_ZH.html#strengthen), [13.5.2](module_13_ZH.html#strengthen-invar) |
| **假设**<br>assumption | 可以不加证明直接使用的公式：推导树的叶子，或者子目标中 ⟹ 前面的公式。 | [6.2](module_06_ZH.html#systems), [7.1.2](module_07_ZH.html#meta-goals) |
| **见证**<br>witness | 使 ∃ 为真的元素，或者表明某个 ∀ 性质不成立的元素。 | [3.3](module_03_ZH.html#structures), [4.2.3](module_04_ZH.html#rel-props) |
| **交互式定理证明**<br>interactive theorem proving | 在表达力强的逻辑中写出定义、定理和证明，由程序检查每一步，并借助自动化完成。 | [1.3](module_01_ZH.html#landscape) |
| **交集**<br>intersection | A ∩ B，同时属于 A 和 B 的元素。 | [4.1.2](module_04_ZH.html#sets-ops) |
| **结构**<br>structure | 一个非空论域，连同对词汇表中每个符号的解释；也叫模型或解释。 | [3.3](module_03_ZH.html#structures) |
| **结构归纳法**<br>structural induction | 按数据类型的值的构造方式进行的归纳：每个构造子一个情形，每个较小的部分有一个归纳假设。 | [5.5](module_05_ZH.html#structural) |
| **结构化证明**<br>structured proof | 由一系列陈述组成、每条陈述都由 Isabelle 检查、不运行也能读懂的证明；在 Isabelle 中用 Isar 书写。 | [10.1](module_10_ZH.html#why) |
| **结论**<br>conclusion | 论证、规则或推导所得出的公式。在子目标中，指 ⟹ 后面的公式。 | [2.6](module_02_ZH.html#consequence), [6.2](module_06_ZH.html#systems) |
| **截断减法**<br>truncated subtraction | `nat` 上的减法：只要 m ≤ n，m − n 就是 0。 | [8.6.1](module_08_ZH.html#nat-int) |
| **解除（假设）**<br>discharge | 像 (⟶I) 这样的规则会解除一个假设：结论不再依赖于它。被解除的假设写作 [A]¹。 | [6.4.2](module_06_ZH.html#imp) |
| **解释**<br>interpretation | 结构赋予每个常量、函数符号和谓词符号的含义。 | [3.3](module_03_ZH.html#structures) |
| **经典逻辑**<br>classical logic | 对每个 A 都有 A ∨ ¬A 成立的逻辑。自然演绎需要 (RAA) 或与之等价的规则才能推出它。 | [6.5](module_06_ZH.html#classical) |
| **经典推理器**<br>classical reasoner | Isabelle 中建立在自然演绎规则之上的搜索方法，例如 `blast`、`auto`、`force` 和 `fastforce`。某个选择失败时它们会回溯。 | [7.9](module_07_ZH.html#blast), [9.4](module_09_ZH.html#classical) |
| **经过验证的**<br>verified | 一个程序的正确性定理被证明之后，它就是经过验证的。 | [12.1](module_12_ZH.html#verify) |
| **精化**<br>refinement | 如果抽象函数把具体模型的初始状态映射为初始状态，并把它的每一步映射为一个抽象步骤或一个停顿步，具体模型就精化了抽象模型。于是不变式可以传递过去。 | [12.6.1](module_12_ZH.html#refine-pattern), [13.7.1](module_13_ZH.html#two-models) |
| **具体语法**<br>concrete syntax | 程序的文本，包括括号和空格，与抽象语法相对。 | [14.2.1](module_14_ZH.html#syntax) |

<div class="section-anchor" id="g-k"></div>

### K

| 术语 | 释义 | 出处 |
|---|---|---|
| **康托尔定理**<br>Cantor's theorem | 没有函数能把一个集合映射到它的幂集上，所以有些集合比另一些集合更大。证明用的是对角线论证。 | [4.7.4](module_04_ZH.html#cantor) |
| **柯里化**<br>currying | 把多参数函数写成接受第一个参数、返回关于其余参数的函数的形式，以逻辑学家哈斯凯尔·柯里（Haskell Curry）命名。 | [8.2.2](module_08_ZH.html#currying) |
| **柯里–霍华德对应**<br>Curry–Howard correspondence | 直觉主义的证明可以读作程序：A ⟶ B 的证明是一个把 A 的证据变成 B 的证据的函数。Rocq 和 Lean 就建立在这个思想之上。 | [6.5.1](module_06_ZH.html#intuitionistic) |
| **可达状态**<br>reachable state | 从某个初始状态出发、某条运行能够到达的状态。 | [4.5.2](module_04_ZH.html#reachability), [13.1](module_13_ZH.html#machines) |
| **可靠性**<br>soundness | 如果一个证明系统推导出的一切都是逻辑推论，即由 Γ ⊢ A 可得 Γ ⊨ A，它就是可靠的。 | [6.3](module_06_ZH.html#soundness) |
| **可满足的**<br>satisfiable | 至少在一个赋值下（或至少在一个结构中）为真。 | [2.4](module_02_ZH.html#classify), [3.4](module_03_ZH.html#validity) |
| **可满足性问题（SAT）**<br>SAT (satisfiability problem) | 给定一个命题公式（通常是合取范式），它是可满足的吗？ | [2.8](module_02_ZH.html#sat) |
| **可判定的**<br>decidable | 如果有一个算法对每个输入都能给出正确答案并且总会终止，这个问题就是可判定的。 | [3.9](module_03_ZH.html#decidability) |
| **可数的**<br>countable | 如果存在从一个集合到 ℕ 的单射，它就是可数的：它是有限的，或者它的元素可以排成 a₀、a₁、a₂…… | [4.7.3](module_04_ZH.html#countable) |
| **可推导的**<br>derivable | Γ ⊢ A，“A 可以由 Γ 推导出”：存在一个结论为 A、所有未解除的假设都在 Γ 中的推导。 | [6.2](module_06_ZH.html#systems) |
| **可信基**<br>trusted base | 经过验证的结果仍然依赖的一切：证明检查器，以及关于编译器、硬件和环境的假设。 | [1.2](module_01_ZH.html#formal) |
| **肯定前件式**<br>modus ponens | 由 A ⟶ B 和 A 得出 B：即规则 (⟶E)，在 Isabelle 中是 `mp`。 | [2.6](module_02_ZH.html#consequence), [6.4.2](module_06_ZH.html#imp) |
| **空集**<br>empty set | ∅，没有元素的集合。Isabelle 中写作 `{}`。 | [4.1.1](module_04_ZH.html#sets-notation) |
| **空真的**<br>vacuously true | 前件为假的蕴涵，无论后件是什么都为真：它是空真的。 | [2.3](module_02_ZH.html#truth-tables) |

<div class="section-anchor" id="g-l"></div>

### L

| 术语 | 释义 | 出处 |
|---|---|---|
| **λ 抽象**<br>λ-abstraction | `λx. t`，把每个 x 映射为 t 的无名函数。 | [8.2.1](module_08_ZH.html#lambda) |
| **LCF 方法**<br>LCF approach | 一种架构：定理是一个抽象类型的值，只有内核的推理规则能创建它们，因此证明工具中的错误不会产生错误的定理。 | [1.4](module_01_ZH.html#trust) |
| **类别**<br>sort (in Isabelle) | 类型类的集合，写作 {c₁, …, cₙ}。类型变量可以被限制到某个类别，例如 `'a::{one, plus}`。 | [8.6.2](module_08_ZH.html#classes) |
| **类别（多类逻辑中）**<br>sort (in many-sorted logic) | 在多类逻辑中是“类型”的另一个说法：符号的每个参数和结果都有一个类别。 | [3.8](module_03_ZH.html#types) |
| **类型**<br>type | 项所代表的值的种类，例如 `nat` 或 `'a list ⇒ nat`。Isabelle 首先检查类型。 | [8.1.1](module_08_ZH.html#types) |
| **类型变量**<br>type variable | 代表任意类型的变量，例如 `'a`，读作 alpha。 | [3.4](module_03_ZH.html#validity), [8.1.1](module_08_ZH.html#types) |
| **类型标注**<br>type annotation | `t :: τ` 告诉 Isabelle：t 的类型是 τ，例如 `value "2 + 3 :: nat"`。 | [1.7.2](module_01_ZH.html#first-compute), [8.1.2](module_08_ZH.html#terms) |
| **类型构造子**<br>type constructor | 由其他类型构造出类型的名字，例如 `list` 或 `option`；它写在参数之后，例如 `nat list`。 | [8.1.1](module_08_ZH.html#types) |
| **类型合一**<br>type unification | 寻找使两个类型相等的类型。失败时 Isabelle 报告“Type unification failed”。 | [8.1.4](module_08_ZH.html#type-errors) |
| **类型类**<br>type class | 提供某些运算（有时还附带定律）的一组类型，有名字，例如 `plus`、`numeral` 和 `linorder`。 | [8.6.2](module_08_ZH.html#classes) |
| **类型推断**<br>type inference | 根据项中常量的类型算出项的每一部分的类型。 | [8.1.2](module_08_ZH.html#terms) |
| **累加器**<br>accumulator | 函数在计算过程中用来逐步收集结果的参数。关于这类函数的归纳通常需要 `arbitrary:`。 | [11.1.1](module_11_ZH.html#running-total) |
| **理论**<br>theory | 包含定义、陈述和证明的 Isabelle 文件，就像编程语言中的模块。理论 T 存放在文件 T.thy 中。 | [1.7](module_01_ZH.html#first) |
| **理论导出**<br>theory exports | 属于某个理论的文件，例如 `export_code` 生成的代码。File Browser 在 `isabelle-export:` 下显示它们。 | [8.8](module_08_ZH.html#codegen), [12.7](module_12_ZH.html#export) |
| **联结词**<br>connective | 由较小的公式构成较大公式的符号：¬、∧、∨、⟶ 和 ⟷。 | [2.1](module_02_ZH.html#connectives) |
| **链式计算**<br>calculation | Isar 中由 t₁ R t₂、t₂ R t₃……组成、每一步各有证明的链，Isabelle 由传递性从中推出 t₁ R tₙ。用 `also` 和 `finally` 书写。 | [10.4.1](module_10_ZH.html#calc-eq) |
| **良基的**<br>well-founded | 如果一个关系没有无限下降链，它就是良基的。Isabelle 中写作 `wf r`。 | [4.4.3](module_04_ZH.html#well-founded) |
| **良基归纳法**<br>well-founded induction | 沿任意良基关系进行的归纳；结构归纳法和强归纳法都是它的特例。 | [5.6](module_05_ZH.html#strong) |
| **良序**<br>well-order | 没有无限下降链的线性序，例如 `nat` 上的 <。`less_induct` 对它成立。 | [11.8](module_11_ZH.html#complete) |
| **量词**<br>quantifier | ∀（“对所有”）或 ∃（“存在”）；它在自己的辖域中约束一个变元。 | [3.2.3](module_03_ZH.html#quantifiers) |
| **列表**<br>list | 要么是空列表 `[]`，要么是 `x # xs`，即头部 x 放在尾部 xs 前面。列表的所有元素属于同一类型。 | [5.2.1](module_05_ZH.html#lists) |
| **列表推导式**<br>list comprehension | `[e. x ← xs, P x]`，xs 中满足 P x 的元素 x 所对应的 e 的值组成的列表。 | [8.5.2](module_08_ZH.html#comprehension) |
| **列举法**<br>listing | 在花括号中列出元素来描述集合，例如 {2, 3, 5, 7}。 | [4.1.1](module_04_ZH.html#sets-notation) |
| **论域**<br>domain (of a structure) | 变元取值范围所在的那个非空对象集合。 | [3.3](module_03_ZH.html#structures) |
| **论证**<br>argument | 由前提和结论组成。如果结论是前提的逻辑推论，论证就是有效的。 | [2.6](module_02_ZH.html#consequence) |
| **逻辑等价**<br>logical equivalence | φ ≡ ψ：两个公式在每个赋值下真值都相同。 | [2.5](module_02_ZH.html#equivalence) |
| **逻辑推论**<br>logical consequence | 如果使所有 φᵢ 为真的每个赋值（或结构）也使 ψ 为真，ψ 就是 φ₁, …, φₙ 的逻辑推论，记作 φ₁, …, φₙ ⊨ ψ。 | [2.6](module_02_ZH.html#consequence), [3.4](module_03_ZH.html#validity) |

<div class="section-anchor" id="g-m"></div>

### M

| 术语 | 释义 | 出处 |
|---|---|---|
| **满射的**<br>surjective | 陪域中的每个元素都是某个值：f[A] = B。Isabelle 中写作 `surj f`。 | [4.6.2](module_04_ZH.html#inj-surj) |
| **矛盾式**<br>contradiction | 在任何赋值下都不为真的公式；也称为不可满足的。 | [2.4](module_02_ZH.html#classify) |
| **枚举类型**<br>enumeration | 构造子都不带参数的数据类型，例如交通灯的四种状态。 | [8.3.1](module_08_ZH.html#enumerations) |
| **幂集**<br>power set | A 的所有子集组成的集合。Isabelle 中写作 `Pow A`；n 个元素的集合有 2ⁿ 个子集。 | [4.1.2](module_04_ZH.html#sets-ops) |
| **描述法**<br>set-builder notation | {x. P x}，所有使 P x 成立的 x 组成的集合。 | [4.1.1](module_04_ZH.html#sets-notation) |
| **命名情形**<br>named case | 在 Isar 中，用 `case c` 或 `case (c x y …)` 进入的 `cases` 或 `induction` 的情形；它假定该情形的事实，在归纳中还会设定 `?case`。 | [10.6.1](module_10_ZH.html#induction-skeleton) |
| **命题**<br>proposition | 非真即假的陈述。 | [2.1](module_02_ZH.html#connectives) |
| **命题逻辑**<br>propositional logic | 关于“非”“并且”“或者”“蕴涵”“当且仅当”这些联结词作用于命题的逻辑。 | [2.1](module_02_ZH.html#connectives) |
| **模式匹配**<br>pattern matching | 根据参数的形状选择等式：每个等式的左边含有一个模式，例如 `Red` 或 `x # xs`。 | [8.3.1](module_08_ZH.html#enumerations) |
| **模型**<br>model | 使一个公式为真的赋值或结构。 | [2.4](module_02_ZH.html#classify), [3.3](module_03_ZH.html#structures) |
| **模型检测**<br>model checking | 遍历有限模型的每个可达状态来检查一条性质；结果是“成立”或一条反例轨迹。做这件事的程序叫模型检测器，例如 SPIN 或 TLC。 | [1.3](module_01_ZH.html#landscape), [13.1](module_13_ZH.html#machines) |
| **目标**<br>goal | 仍有待证明的陈述。 | [1.7.3](module_01_ZH.html#first-prove) |

<div class="section-anchor" id="g-n"></div>

### N

| 术语 | 释义 | 出处 |
|---|---|---|
| **内层语法**<br>inner syntax | 项和类型的语言，写在引号之间。 | [1.7.2](module_01_ZH.html#first-compute) |
| **内核**<br>kernel | LCF 风格证明器中实现推理规则的那一小部分。每个定理都由它构造。 | [1.4](module_01_ZH.html#trust) |
| **逆否命题**<br>contrapositive | A ⟶ B 的逆否命题是 ¬B ⟶ ¬A。两者意思相同，所以证明了一个也就证明了另一个。 | [6.1](module_06_ZH.html#informal) |
| **逆关系**<br>converse (of a relation) | R⁻¹，把 R 中的每个有序对反过来。Isabelle 中写作 `r¯`。 | [4.2.4](module_04_ZH.html#rel-ops) |
| **逆函数**<br>inverse | 如果对所有 a 和 b 都有 g (f a) = a 且 f (g b) = b，g 就是 f : A → B 的逆函数。函数有逆函数当且仅当它是双射；Isabelle 中写作 `inv f`。 | [4.6.3](module_04_ZH.html#inverse) |
| **逆命题**<br>converse (of an implication) | A ⟶ B 的逆命题是 B ⟶ A，两者意思不同。误证逆命题是常见的错误。 | [6.1](module_06_ZH.html#informal) |
| **Nitpick**<br>Nitpick | Isabelle 的反例搜索器：它借助 SAT 求解器寻找一个使断言为假的有限模型。 | [2.4](module_02_ZH.html#classify), [9.7.2](module_09_ZH.html#nitpick) |
| **NP 完全的**<br>NP-complete | 属于 NP、并且 NP 中每个问题都能高效地转化为它的问题。SAT 是第一个被证明为 NP 完全的问题（库克，1971）。 | [2.8](module_02_ZH.html#sat) |

<div class="section-anchor" id="g-o"></div>

### O

| 术语 | 释义 | 出处 |
|---|---|---|
| **偶然式**<br>contingent | 可满足但不是重言式的公式：在真值表的某些行为真，在另一些行为假。 | [2.4](module_02_ZH.html#classify) |

<div class="section-anchor" id="g-p"></div>

### P

| 术语 | 释义 | 出处 |
|---|---|---|
| **排列**<br>permutation | 如果列表 ys 与 xs 含有相同的元素、每个元素出现的次数也相同，即 `mset ys = mset xs`，ys 就是 xs 的一个排列。 | [12.2.2](module_12_ZH.html#isort-spec) |
| **排中律**<br>law of excluded middle | A ∨ ¬A：每个命题非真即假。自然演绎只有借助 (RAA) 才能推出它。 | [2.4](module_02_ZH.html#classify), [6.5](module_06_ZH.html#classical) |
| **判定过程**<br>decision procedure | 对某一类公式中的每一个都能判定其是否成立、成立时还能给出证明的程序，例如 `linarith`。 | [9.5](module_09_ZH.html#arith) |
| **判定问题**<br>decision problem | 关于输入的是非问题，例如“这个数是素数吗？”；作为集合，它是 ℕ 的一个子集。 | [4.7.4](module_04_ZH.html#cantor) |
| **陪域**<br>codomain | 对函数 f : A → B 来说，集合 B。 | [4.6.1](module_04_ZH.html#fun-def) |
| **匹配**<br>matching | 为等式中的变元找到项，使等式左边与目标的某一部分完全相同：这是只朝一个方向进行的合一。 | [9.2.1](module_09_ZH.html#rewriting) |
| **偏序**<br>partial order | 自反、反对称且传递的关系，例如 ⊆ 或整除。 | [4.4.1](module_04_ZH.html#partial-orders) |
| **Presburger 算术**<br>Presburger arithmetic | 整数和自然数上的线性算术，带量词、整除以及按常数的 `div` 和 `mod`。它是可判定的，`presburger` 可以判定它。 | [9.5](module_09_ZH.html#arith) |

<div class="section-anchor" id="g-q"></div>

### Q

| 术语 | 释义 | 出处 |
|---|---|---|
| **迁移关系**<br>transition relation | 状态机中说明哪个状态可以在一步之内跟在哪个状态之后的关系。 | [4.5.2](module_04_ZH.html#reachability), [13.1](module_13_ZH.html#machines) |
| **前件**<br>antecedent | 在 A ⟶ B 中，A 是前件，B 是后件。 | [2.1](module_02_ZH.html#connectives) |
| **前提**<br>premise | 论证或规则的出发公式。在 Isabelle 中，规则的前提写在 ⟹ 前面。 | [2.6](module_02_ZH.html#consequence), [6.2](module_06_ZH.html#systems) |
| **前向链接**<br>forward chaining | 在 Isar 中，把事实传给下一个断言，由它的证明方法接收；`then`、`from` 和 `with` 都起这个作用。 | [10.3.1](module_10_ZH.html#facts-then) |
| **强归纳法**<br>strong induction | 归纳步骤可以假定结论对所有更小的值都成立的归纳；也叫完全归纳法或累积归纳法。 | [5.6](module_05_ZH.html#strong) |
| **情形拆分**<br>case split | 把含有 `if` 或 `case` 的目标按每种可能拆成若干情形。化简器会自动拆分 `if`，而 `case` 只有用 `split:` 指明时才拆分。 | [9.3.3](module_09_ZH.html#splits) |
| **情形分析**<br>case analysis | 把证明分成合起来覆盖所有可能性的若干情形，并在每种情形下证明结论。 | [6.1](module_06_ZH.html#informal), [10.5](module_10_ZH.html#cases) |
| **求值**<br>evaluation | 用定义等式反复重写一个项，直到没有等式可用，从而算出它的值。 | [5.1.3](module_05_ZH.html#rewriting) |
| **全称量词**<br>universal quantifier | ∀：∀x. φ 表示无论 x 代表哪个对象，φ 都成立。 | [3.2.3](module_03_ZH.html#quantifiers) |
| **全函数**<br>total (function) | 对每个参数都有值的函数是全函数。HOL 中的每个函数都是全函数。 | [4.6.1](module_04_ZH.html#fun-def), [5.7.1](module_05_ZH.html#why-terminate) |
| **全集**<br>universe | 某个类型所有元素组成的集合。Isabelle 称之为 `UNIV`。 | [4.1.1](module_04_ZH.html#sets-notation) |
| **全序**<br>total order | 同时也是完全关系的偏序；也叫线性序（Isabelle 中的 `linorder`）。 | [4.4.1](module_04_ZH.html#partial-orders) |
| **确认**<br>validation | 检查规约描述的是否正是真正想要的东西：“我们构建的是否是正确的产品？”。 | [1.2](module_01_ZH.html#formal) |
| **Quickcheck**<br>Quickcheck | Isabelle 的测试工具：它把断言当作程序，在自由变元的许多较小值上运行，并报告反例。 | [1.7.5](module_01_ZH.html#first-refute), [9.7.1](module_09_ZH.html#quickcheck) |

<div class="section-anchor" id="g-r"></div>

### R

| 术语 | 释义 | 出处 |
|---|---|---|
| **容斥原理**<br>inclusion–exclusion | 对有限集合，|A ∪ B| = |A| + |B| − |A ∩ B|：两个基数之和把公共元素算了两次。 | [4.7.1](module_04_ZH.html#finite) |

<div class="section-anchor" id="g-s"></div>

### S

| 术语 | 释义 | 出处 |
|---|---|---|
| **SAT 求解器**<br>SAT solver | 判定命题公式是否可满足、并在可满足时给出一个满足它的赋值的程序。 | [2.8](module_02_ZH.html#sat) |
| **时序逻辑**<br>temporal logic | 其算子谈论运行的逻辑，例如 □ P（“总是 P”）和 ◇ P（“终究 P”）；模型检测器检查它的公式。 | [13.8.1](module_13_ZH.html#liveness) |
| **实例**<br>instance | 属于某个类型类的类型：`nat` 和 `int` 都是类型类 `plus` 的实例。 | [8.6.2](module_08_ZH.html#classes) |
| **实现**<br>implementation | 实际完成工作的程序：它说明怎样计算结果。 | [12.1](module_12_ZH.html#verify) |
| **事件**<br>event | 状态机的一类步骤，例如按下按钮。当它的守卫条件成立时可以发生，并按它的效果改变状态。 | [13.1](module_13_ZH.html#machines) |
| **事实**<br>fact | 在 Isar 中，证明可以使用的已证明陈述：假设、`have` 或 `show` 的结果，或者引理。 | [10.3.1](module_10_ZH.html#facts-then) |
| **守卫条件**<br>guard | （1）在含有多类对象的论域中，说明一个对象属于哪一类的谓词，例如 `user`（模块 3）。（2）状态机中某个事件可以发生的条件（模块 13）。 | [3.7](module_03_ZH.html#specifications), [13.1](module_13_ZH.html#machines) |
| **数据精化**<br>data refinement | 证明一个具体数据结构实现了一个抽象模型：借助抽象函数和不变式，每个具体操作都与相应的抽象操作对应。 | [12.6.1](module_12_ZH.html#refine-pattern) |
| **数据类型**<br>datatype | 其值由构造子构造的类型；以不同方式构造的值互不相同。用 `datatype` 命令定义。 | [5.2.2](module_05_ZH.html#trees), [8.3.1](module_08_ZH.html#enumerations) |
| **数学归纳法**<br>mathematical induction | 证明 P(0)，再对任意的 n 证明 P(n) ⟶ P(n + 1)；于是 P(n) 对每个自然数 n 都成立。 | [5.3.1](module_05_ZH.html#principle) |
| **双射的**<br>bijective | 既是单射又是满射：函数把两个集合的元素一一配对。Isabelle 中写作 `bij f`。 | [4.6.2](module_04_ZH.html#inj-surj) |
| **双条件**<br>biconditional | A ⟷ B，读作“A 当且仅当 B”：A 和 B 真值相同时为真。模块 2 称之为等价；Isabelle 把它显示为 `=`。 | [2.1](module_02_ZH.html#connectives) |
| **斯科伦常量**<br>Skolem constant | Nitpick 的答案中为某个约束变元选定的值，例如使一个 ∀ 不成立的那个元素。 | [3.4](module_03_ZH.html#validity) |
| **Sledgehammer**<br>Sledgehammer | 把目标连同相关的库事实交给外部证明器，并把其中某个证明器找到的证明变成由内核检查的 Isabelle 证明的工具。 | [9.8](module_09_ZH.html#sledgehammer) |
| **SMT 求解器**<br>SMT solver | 扩展了数、数组和其他数据的 SAT 求解器，例如 Z3 和 cvc5。 | [1.3](module_01_ZH.html#landscape), [2.8](module_02_ZH.html#sat) |
| **素数**<br>prime number | 大于或等于 2、并且只有 1 和它自身两个因数的自然数 p。 | [5.6](module_05_ZH.html#strong) |

<div class="section-anchor" id="g-t"></div>

### T

| 术语 | 释义 | 出处 |
|---|---|---|
| **this**<br>this | 在 Isar 中，上一步产生的事实；`then` 把它传给下一个断言。 | [10.3.1](module_10_ZH.html#facts-then) |
| **条件重写规则**<br>conditional rewrite rule | 形如 H ⟹ l = r 的规则，化简器只有在通过化简证明了条件 H 之后才使用它。 | [9.3.1](module_09_ZH.html#conditional) |
| **停顿步**<br>stutter step | 具体机器中被抽象函数映射为抽象状态没有变化的步骤。 | [13.7.1](module_13_ZH.html#two-models) |
| **头部**<br>head | 列表 x # xs 的第一个元素 x。 | [5.2.1](module_05_ZH.html#lists) |
| **Tseitin 变换**<br>Tseitin transformation | 给每个子公式起一个新原子作为名字，从而把公式变成一个等可满足的合取范式，其规模只与原公式成正比增长。 | [2.7.2](module_02_ZH.html#cnf-dnf) |
| **图式变量**<br>schematic variable | 带问号的变量，例如 `?P`，Isabelle 可以用任何类型合适的项替换它；也叫未知量。 | [7.2.1](module_07_ZH.html#rules-thm) |
| **推导**<br>derivation | 由公式组成的树，其中每个公式要么是假设，要么由紧挨在它上方的公式通过一条规则得到。 | [6.2](module_06_ZH.html#systems), [11.6.1](module_11_ZH.html#ev) |
| **推广**<br>generalise | 对某个变元的所有值一起证明结论，使归纳假设可以用于其他的值。`arbitrary:` 就是做这件事的。 | [11.2](module_11_ZH.html#generalise), [14.5.1](module_14_ZH.html#paper) |
| **推理规则**<br>inference rule | 有零个或多个前提和一个结论的规则，说明可以由什么推导出什么。 | [6.2](module_06_ZH.html#systems) |
| **拓扑排序**<br>topological sort | 按照与某个偏序一致的顺序列出所有元素，例如任务的安排。 | [4.4.2](module_04_ZH.html#hasse) |

<div class="section-anchor" id="g-w"></div>

### W

| 术语 | 释义 | 出处 |
|---|---|---|
| **外层语法**<br>outer syntax | `value`、`lemma` 等命令的语言，写在引号外面。 | [1.7.2](module_01_ZH.html#first-compute) |
| **外延性**<br>extensionality | 两个集合在元素相同时相等。 | [4.1.1](module_04_ZH.html#sets-notation) |
| **完备的**<br>complete | 如果一个证明系统能推导出每个逻辑推论，它就是完备的。如果一个证明方法在时间不受限制时能证明某种逻辑的每个有效公式，它对这种逻辑就是完备的。 | [6.3](module_06_ZH.html#soundness), [9.4.1](module_09_ZH.html#blast) |
| **完备性定理**<br>completeness theorem | 哥德尔的定理（1929/1930）：每个有效的一阶公式都可以被证明。 | [3.9](module_03_ZH.html#decidability) |
| **完全的（关系）**<br>total (relation) | 如果 A 中任意两个不同的元素都以某个方向相关，关系在 A 上就是完全的。 | [4.2.3](module_04_ZH.html#rel-props) |
| **完全归纳法**<br>complete induction | 强归纳法的另一个名称：归纳步骤可以使用结论对所有更小值成立。在 Isabelle 中用 `rule: less_induct`。 | [5.6](module_05_ZH.html#strong), [11.8](module_11_ZH.html#complete) |
| **尾部**<br>tail | 列表 x # xs 中头部之后的其余部分 xs。 | [5.2.1](module_05_ZH.html#lists) |
| **尾递归**<br>tail recursion | 如果递归调用是函数做的最后一件事，函数就是尾递归的，它可以像循环一样运行。 | [11.1.1](module_11_ZH.html#running-total) |
| **未解除的假设**<br>open assumption | 下方没有任何规则解除的假设。推导的结论只依赖于它的未解除的假设。 | [6.4.2](module_06_ZH.html#imp) |
| **未解释的**<br>uninterpreted | 像用 `consts` 那样只声明而不定义：关于这类符号的引理，只有在无论它们表示什么都成立时，Isabelle 才能证明。 | [3.8](module_03_ZH.html#types) |
| **未指定的**<br>unspecified | 全函数的一个一无所知的值，例如 `hd []`；`value` 对它求值时会因异常而停止。 | [8.4.3](module_08_ZH.html#patterns) |
| **谓词**<br>predicate | 对对象成立或不成立的性质或关系。在 Isabelle 中是返回 `bool` 的函数，例如 `P :: 'a ⇒ bool`。 | [3.1](module_03_ZH.html#beyond), [3.8](module_03_ZH.html#types) |
| **谓词符号**<br>predicate symbol | 指称性质或关系的符号，例如 `admin` 或 <。 | [3.2](module_03_ZH.html#language) |
| **谓词逻辑**<br>predicate logic | 加上了项、谓词以及量词 ∀ 和 ∃ 的命题逻辑；也叫一阶逻辑。 | [3.1](module_03_ZH.html#beyond) |
| **文字**<br>literal | 原子或原子的否定，例如 A 或 ¬A。 | [2.7](module_02_ZH.html#normal-forms) |

<div class="section-anchor" id="g-x"></div>

### X

| 术语 | 释义 | 出处 |
|---|---|---|
| **析取**<br>disjunction | A ∨ B，读作“A 或者 B”：至少一个为真时为真。 | [2.1](module_02_ZH.html#connectives) |
| **析取范式**<br>disjunctive normal form (DNF) | 文字合取的析取，例如 (A ∧ ¬B) ∨ (¬A ∧ C) ∨ D。 | [2.7.2](module_02_ZH.html#cnf-dnf) |
| **辖域**<br>scope | 公式中量词的变元指向该量词的那一部分。在 Isabelle 中，辖域向右延伸得尽可能远。 | [3.2.4](module_03_ZH.html#scope) |
| **线性算术**<br>linear arithmetic | 由变元、数、+、−、=、<、≤ 和联结词构成的公式，其中变元可以乘以数，但不能乘以另一个变元。`linarith` 可以判定它。 | [9.5](module_09_ZH.html#arith) |
| **项**<br>term | 指称一个对象的表达式：变元、常量，或者作用于项的函数。在 HOL 中每个表达式都是项，公式也不例外。 | [3.2.1](module_03_ZH.html#terms), [8.1.2](module_08_ZH.html#terms) |
| **像**<br>image | 与 S 中某个元素有关系 R 的所有元素组成的集合，或者 f 在 S 上的所有值。Isabelle 中写作 ```r `` S``` 和 `` f ` A ``。 | [4.2.4](module_04_ZH.html#rel-ops), [4.6.1](module_04_ZH.html#fun-def) |
| **消去规则**<br>elimination rule | 说明如何使用含某个联结词的公式的规则。在 Isabelle 中，它的主前提含有该联结词，与 `erule` 一起使用。 | [6.4](module_06_ZH.html#connectives), [7.2.3](module_07_ZH.html#rules-shapes) |
| **效果**<br>effect | 事件如何改变状态机的状态。 | [13.1](module_13_ZH.html#machines) |
| **新的**<br>fresh | 如果一个名字不在规则禁止的地方（结论、被量化的公式或未解除的假设中）自由出现，它就是新的。 | [6.6](module_06_ZH.html#quantifiers) |
| **形式化方法**<br>formal method | 用具有精确数学含义的语言来描述或验证系统的方法，使关于系统的断言可以通过计算或证明来检查。 | [1.2](module_01_ZH.html#formal) |
| **形式化规约**<br>formal specification | 用形式语言写成的规约。 | [1.2](module_01_ZH.html#formal) |
| **形式化证明档案库**<br>Archive of Formal Proofs | 一个在线的、经过检查的 Isabelle 项目库。 | [1.4](module_01_ZH.html#trust) |
| **形式语言**<br>formal language | 有精确语法、使每个陈述只有一种读法的语言；形式化方法的第一个要素。 | [1.2](module_01_ZH.html#formal) |
| **选项类型**<br>option type | `'a option`，其值为 `None` 和 `Some x`：可能缺失的结果的类型。 | [8.3.3](module_08_ZH.html#options) |

<div class="section-anchor" id="g-y"></div>

### Y

| 术语 | 释义 | 出处 |
|---|---|---|
| **严格序**<br>strict order | 反自反且传递的关系，例如 <。 | [4.4.1](module_04_ZH.html#partial-orders) |
| **验证**<br>verification | 表明一个实现满足它的规约：“我们是否在正确地构建产品？”。 | [1.2](module_01_ZH.html#formal) |
| **一致的**<br>consistent | 如果一组需求的合取是可满足的，即某个赋值使它们全部为真，这组需求就是一致的。 | [2.9](module_02_ZH.html#requirements) |
| **引理**<br>lemma | 有待证明的陈述，在 Isabelle 中用 `lemma` 陈述。`theorem` 和 `corollary` 的意思相同。 | [1.7.3](module_01_ZH.html#first-prove) |
| **引入规则**<br>introduction rule | 说明如何证明含某个联结词的公式的规则，与 `rule` 一起使用。对归纳定义来说，指它的定义规则之一。 | [6.4](module_06_ZH.html#connectives), [7.2.3](module_07_ZH.html#rules-shapes), [11.6](module_11_ZH.html#inductive) |
| **优先级**<br>priority | 联结词结合的紧密程度。在 Isabelle 中 ¬ 结合得最紧，其次是 ∧，再次是 ∨，然后是 ⟶ 和 ⟷。 | [2.2.2](module_02_ZH.html#priorities) |
| **有界量词**<br>bounded quantifier | ∀x ∈ A. P x，读作“对 A 中所有 x，P x 成立”，是 ∀x. x ∈ A ⟶ P x 的简写。 | [4.2.3](module_04_ZH.html#rel-props) |
| **有限模型**<br>finite model | 其中每个类型都有限的模型。Nitpick 搜索的就是使断言为假的有限模型。 | [9.7.2](module_09_ZH.html#nitpick) |
| **有效的**<br>valid | 在每个结构、每个指派下都为真；对命题公式来说，就是重言式。 | [2.4](module_02_ZH.html#classify), [3.4](module_03_ZH.html#validity) |
| **有序对**<br>pair | (a, b)，第一个分量是 a，第二个分量是 b；当 a = c 且 b = d 时 (a, b) = (c, d)。`fst` 和 `snd` 返回各个分量。 | [4.2.1](module_04_ZH.html#products), [8.3.3](module_08_ZH.html#options) |
| **语法分析器**<br>parser | 把程序文本变成抽象语法的程序。 | [14.2.1](module_14_ZH.html#syntax) |
| **语法树**<br>parse tree | 表示公式如何由各部分构成的树，主联结词位于树根。 | [2.2.1](module_02_ZH.html#formation) |
| **语句**<br>sentence | 没有自由变元的公式；也叫闭公式。 | [3.2.4](module_03_ZH.html#scope) |
| **语义**<br>semantics | 用数学精确定义一种语言的每个陈述或程序的含义；形式化方法的第二个要素。 | [1.2](module_01_ZH.html#formal), [14.2.2](module_14_ZH.html#eval) |
| **元逻辑**<br>meta-logic | 用来陈述关于另一种逻辑（对象逻辑）的规则和证明的逻辑。在 Isabelle 中是 Pure。 | [7.1.1](module_07_ZH.html#meta-pure) |
| **元数**<br>arity | （1）一个符号的参数个数。（2）在 Isabelle 中，指“某个类型属于某个类型类”的记录，例如消息 No type arity light :: numeral 中的 arity。 | [3.2](module_03_ZH.html#language), [8.6.2](module_08_ZH.html#classes) |
| **元素**<br>element | 集合的成员：x ∈ A 表示 x 是 A 的元素。 | [4.1.1](module_04_ZH.html#sets-notation) |
| **元组**<br>tuple | 按顺序排列的 n 个元素 (d₁, …, dₙ)；二元组就是有序对。 | [3.3](module_03_ZH.html#structures) |
| **原始递归**<br>primitive recursion | 每个构造子一个等式、递归调用只作用于参数的直接组成部分的递归。`primrec` 只接受这种形式。 | [8.4.2](module_08_ZH.html#fun-primrec) |
| **原子公式**<br>atomic formula | 谓词逻辑中作用于项的谓词 P t₁ … tₙ，或者项之间的等式 t₁ = t₂。 | [3.2.2](module_03_ZH.html#atoms) |
| **原子命题**<br>atom | 不由其他命题构成的命题，写成一个名字，例如 A 或 `fire`。也简称原子。 | [2.1](module_02_ZH.html#connectives) |
| **约束变元**<br>bound variable | 处在关于该变元的量词辖域中的变元出现。在整个辖域中给它改名不改变含义。 | [3.2.4](module_03_ZH.html#scope) |
| **运行**<br>run | 从初始状态出发、沿着迁移关系前进的状态序列。 | [13.1](module_13_ZH.html#machines) |
| **蕴涵**<br>implication | A ⟶ B，读作“A 蕴涵 B”或“如果 A，那么 B”：只有在 A 为真而 B 为假时才为假。 | [2.1](module_02_ZH.html#connectives) |

<div class="section-anchor" id="g-z"></div>

### Z

| 术语 | 释义 | 出处 |
|---|---|---|
| **栈**<br>stack | 只在一端（栈顶）使用的值的列表。 | [14.3](module_14_ZH.html#machine) |
| **栈机**<br>stack machine | 其指令从栈顶取操作数、并把结果留在栈顶的机器。 | [14.3](module_14_ZH.html#machine) |
| **栈下溢**<br>stack underflow | 指令发现栈上的值少于它所需要的个数。 | [14.3](module_14_ZH.html#machine) |
| **真实的（反例）**<br>genuine | 如果 Nitpick 已经核实一个反例确实能否定断言，这个反例就是真实的。“可能虚假”的反例在更大的模型中可能消失。 | [9.7.2](module_09_ZH.html#nitpick) |
| **真值表**<br>truth table | 对公式原子的每个赋值各占一行、给出公式在每一行的值的表；n 个原子有 2ⁿ 行。 | [2.3](module_02_ZH.html#truth-tables) |
| **真子集**<br>proper subset | A ⊂ B：A ⊆ B 并且 A ≠ B。 | [4.1.1](module_04_ZH.html#sets-notation) |
| **正确性定理**<br>correctness theorem | 陈述“对每个输入，实现的结果都具有规约要求的性质”的定理。 | [12.1](module_12_ZH.html#verify) |
| **证明**<br>proof | 从假设到结论的一串步骤，每一步都有规则作依据。 | [6.1](module_06_ZH.html#informal) |
| **证明大纲**<br>proof outline | 在 `proof (cases …)` 或 `proof (induction …)` 之后 Isabelle/jEdit 显示的各情形的骨架；点击即可插入。 | [10.5.1](module_10_ZH.html#cases-bool) |
| **证明方法**<br>proof method | Isabelle 作用于目标的一个步骤，例如 `simp`、`auto`、`blast`、`rule` 或 `induction`。 | [5.4.2](module_05_ZH.html#induction-state) |
| **证明块**<br>proof block | `proof m … qed`：证明紧挨在它前面陈述的目标。块内的步骤建立事实并解决待证目标。 | [10.2.1](module_10_ZH.html#shape-blocks) |
| **证明模式**<br>mode | 每个证明状态的第一行：陈述一个断言后是 `proof (prove)`，在证明块内是 `proof (state)`，拾取事实后是 `proof (chain)`。它告诉你下一步可以写什么。 | [10.2.1](module_10_ZH.html#shape-blocks) |
| **证明器集成开发环境**<br>prover IDE | 在你输入的同时由证明器持续检查文本的编辑器；Isabelle/jEdit 就是一个。 | [1.6](module_01_ZH.html#tour) |
| **证明系统**<br>proof system | 由公式语言和推理规则组成、一步一步推导陈述的系统，规则简单到计算机可以检查每一步。 | [1.2](module_01_ZH.html#formal), [6.2](module_06_ZH.html#systems) |
| **证明助手**<br>proof assistant | 检查用形式逻辑写成的证明、并帮助你找到证明的程序；也叫交互式定理证明器。 | [1.4](module_01_ZH.html#trust) |
| **证明状态**<br>proof state | 剩下的子目标列表。它为空时证明就完成了。 | [7.3.2](module_07_ZH.html#backward-rule) |
| **直觉主义逻辑**<br>intuitionistic logic | 没有 (RAA) 的自然演绎：A ∨ ¬A 和 ¬¬A ⟶ A 不可推导，而证明可以读作程序。 | [6.5.1](module_06_ZH.html#intuitionistic) |
| **值**<br>value | 不能再被任何等式重写的项：求值的结果。 | [5.1.3](module_05_ZH.html#rewriting) |
| **值域**<br>range | 整个定义域的像，即 f 的所有值。Isabelle 中写作 `range f`。 | [4.6.1](module_04_ZH.html#fun-def) |
| **指派**<br>assignment | 为每个变元在论域中选定一个值。含自由变元的公式是否为真取决于指派。 | [3.3](module_03_ZH.html#structures) |
| **置换规则**<br>permutative rule | 两边只在变元顺序上不同的重写规则，例如交换律。化简器只用它把项排成固定的顺序。 | [9.3.4](module_09_ZH.html#loops) |
| **终止性**<br>termination | 函数的每次求值都会停止。`fun` 只有在用度量证明了终止性之后才接受递归定义。 | [5.7.1](module_05_ZH.html#why-terminate) |
| **终止序**<br>termination order | `fun` 证明终止性之后报告的度量或度量的字典序组合，例如 `size <*mlex*> {}`。 | [5.7.2](module_05_ZH.html#measures), [8.7.2](module_08_ZH.html#termination-messages) |
| **主联结词**<br>main connective | 公式语法树根部的联结词；公式以它命名，也由它决定可以使用哪些规则。 | [2.2.1](module_02_ZH.html#formation), [6.4](module_06_ZH.html#connectives) |
| **主前提**<br>major premise | 消去规则或拆解规则的第一个前提，即含有联结词的那个前提。 | [7.2.3](module_07_ZH.html#rules-shapes) |
| **状态**<br>state | 系统在某一时刻保存的内容。对表达式来说，是从变元名到值的函数。 | [13.1](module_13_ZH.html#machines), [14.2.1](module_14_ZH.html#syntax) |
| **状态机**<br>state machine | 由一组状态、一组初始状态和一个迁移关系组成；也叫迁移系统。 | [4.5.2](module_04_ZH.html#reachability), [13.1](module_13_ZH.html#machines) |
| **子公式**<br>sub-formula | 另一个公式语法树上某个结点处的公式，包括该公式本身。 | [2.2.1](module_02_ZH.html#formation) |
| **子集**<br>subset | A ⊆ B：A 的每个元素都是 B 的元素。 | [4.1.1](module_04_ZH.html#sets-notation) |
| **子句**<br>clause | 文字的析取，例如 ¬A ∨ B ∨ ¬C；单个文字也算一个子句。 | [2.7](module_02_ZH.html#normal-forms) |
| **子目标**<br>subgoal | 证明中仍需证明的目标之一，形如 `⋀x₁ … xₖ. ⟦H₁; …; Hₙ⟧ ⟹ C`。 | [5.4.2](module_05_ZH.html#induction-state), [7.3.2](module_07_ZH.html#backward-rule) |
| **字典序**<br>lexicographic order | 有序对上的词典顺序：先比较第一个分量，只有相等时才比较第二个分量。 | [5.7.2](module_05_ZH.html#measures) |
| **自反传递闭包**<br>reflexive–transitive closure | R*，由零步或多步 R 连接起来的有序对。Isabelle 中写作 `r⇧*`。 | [4.5.1](module_04_ZH.html#closure-def) |
| **自反的**<br>reflexive | 如果 A 中每个元素都与自身相关，关系在 A 上就是自反的。 | [4.2.3](module_04_ZH.html#rel-props) |
| **自然数**<br>natural numbers | 0、1、2……，由 0 和后继 `Suc` 构造；即类型 `nat`。 | [5.1.1](module_05_ZH.html#peano) |
| **自然演绎**<br>natural deduction | 对每个联结词都有引入规则和消去规则、可以作出假设并解除假设的证明系统。Isabelle 就是围绕它设计的。 | [6.4](module_06_ZH.html#connectives) |
| **自由变元**<br>free variable | 不受任何量词约束的变元出现；在 Isabelle 中，指不是常量的名字。引理中的自由变元隐含地是全称的。 | [3.2.4](module_03_ZH.html#scope), [8.1.2](module_08_ZH.html#terms) |
| **组合式的**<br>compositional | 如果每个结点的含义都由其子结点的含义算出，这种语义就是组合式的。 | [14.2.2](module_14_ZH.html#eval) |
| **最小元素**<br>least element | 在偏序中位于所有元素之下的元素；最大元素则位于所有元素之上。 | [4.4.2](module_04_ZH.html#hasse) |
