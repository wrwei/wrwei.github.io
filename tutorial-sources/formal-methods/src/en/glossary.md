---
title: Glossary
lead: Every term the series defines, in alphabetical order, with a short definition, its Chinese equivalent and the sections that explain it.
---

A term with two meanings lists both. Symbols and notation are in the [cheat sheet](cheatsheet_EN.html#notation), and Isabelle's messages in [Troubleshooting](troubleshooting_EN.html). The numbers in the last column are sections of the modules: 7.2.1 is Module 7, Section 7.2.1.

[A](#g-a) · [B](#g-b) · [C](#g-c) · [D](#g-d) · [E](#g-e) · [F](#g-f) · [G](#g-g) · [H](#g-h) · [I](#g-i) · [K](#g-k) · [L](#g-l) · [M](#g-m) · [N](#g-n) · [O](#g-o) · [P](#g-p) · [Q](#g-q) · [R](#g-r) · [S](#g-s) · [T](#g-t) · [U](#g-u) · [V](#g-v) · [W](#g-w)

## Terms from A to Z {#terms}

<div class="section-anchor" id="g-a"></div>

### A

| Term | Meaning | Section |
|---|---|---|
| **abstract syntax**<br>抽象语法 | The structure of a program as a tree: each node is an operation and its children are its operands. In Isabelle it is a datatype. | [14.2.1](module_14_EN.html#syntax) |
| **abstraction function**<br>抽象函数 | A function that maps each concrete value or state to the abstract one it represents, such as `set_of` from search trees to sets. | [12.5.1](module_12_EN.html#bst-trees), [13.7.1](module_13_EN.html#two-models) |
| **accumulator**<br>累加器 | An argument in which a function collects its result as it goes. Inductions about such functions usually need `arbitrary:`. | [11.1.1](module_11_EN.html#running-total) |
| **α-equivalent**<br>α 等价的 | Formulas that differ only in the names of their bound variables, such as ∃y. R x y and ∃z. R x z, are α-equivalent; they mean the same. | [3.5.2](module_03_EN.html#substitution) |
| **antecedent**<br>前件 | In A ⟶ B, the formula A; B is the consequent. | [2.1](module_02_EN.html#connectives) |
| **antisymmetric**<br>反对称的 | A relation R is antisymmetric if (x, y) ∈ R and (y, x) ∈ R imply x = y. | [4.2.3](module_04_EN.html#rel-props) |
| **application**<br>函数应用 | Applying a function f to an argument a, written `f a`, without parentheses or commas. Application groups to the left: `f x y` is `(f x) y`. | [8.2.1](module_08_EN.html#lambda) |
| **apply script**<br>apply 脚本 | A proof written as a sequence of `apply` steps that ends with `done`. | [5.4.2](module_05_EN.html#induction-state) |
| **Archive of Formal Proofs**<br>形式化证明档案库 | An online library of checked Isabelle developments. | [1.4](module_01_EN.html#trust) |
| **argument**<br>论证 | Premises together with a conclusion. An argument is valid if its conclusion is a logical consequence of its premises. | [2.6](module_02_EN.html#consequence) |
| **arity**<br>元数 | (1) The number of arguments of a symbol. (2) In Isabelle, the record that a type belongs to a type class, as in the message No type arity light :: numeral. | [3.2](module_03_EN.html#language), [8.6.2](module_08_EN.html#classes) |
| **assignment**<br>指派 | A choice of a value in the domain for every variable. Whether a formula with free variables is true depends on it. | [3.3](module_03_EN.html#structures) |
| **assumption**<br>假设 | A formula you may use without proving it: a leaf of a derivation, or a formula before ⟹ in a subgoal. | [6.2](module_06_EN.html#systems), [7.1.2](module_07_EN.html#meta-goals) |
| **atom**<br>原子命题 | A proposition that is not built from other propositions, written as a name such as A or `fire`. Also called an atomic proposition. | [2.1](module_02_EN.html#connectives) |
| **atomic formula**<br>原子公式 | In predicate logic, a predicate applied to terms, P t₁ … tₙ, or an equation t₁ = t₂ between terms. | [3.2.2](module_03_EN.html#atoms) |
| **auxiliary lemma**<br>辅助引理 | A lemma proved first because a larger proof needs it. The goal on which the larger proof gets stuck usually shows what it must say. | [11.3](module_11_EN.html#lemmas), [14.5.1](module_14_EN.html#paper) |
| **axiom**<br>公理 | An inference rule without premises. | [6.2](module_06_EN.html#systems) |

<div class="section-anchor" id="g-b"></div>

### B

| Term | Meaning | Section |
|---|---|---|
| **backward search**<br>反向搜索 | Finding a proof by starting from the goal: choose a rule whose conclusion matches it, and its premises become subgoals. Isabelle works this way. | [6.7](module_06_EN.html#search) |
| **base case**<br>基础情形 | The case of a recursive definition or an induction that does not use the function or the hypothesis, such as 0 or the empty list. | [5.1.2](module_05_EN.html#nat-functions), [5.3.1](module_05_EN.html#principle) |
| **base type**<br>基本类型 | A type that is a name, such as `bool`, `nat` or `int`. | [8.1.1](module_08_EN.html#types) |
| **β-reduction**<br>β 归约 | The step that applies `λx. t` to an argument a: the result is t with a in place of x. | [8.2.1](module_08_EN.html#lambda) |
| **biconditional**<br>双条件 | A ⟷ B, read "A if and only if B": true when A and B have the same truth value. Module 2 calls it equivalence; Isabelle prints it as `=`. | [2.1](module_02_EN.html#connectives) |
| **bijective**<br>双射的 | Both injective and surjective: the function pairs the elements of two sets one to one. Isabelle writes `bij f`. | [4.6.2](module_04_EN.html#inj-surj) |
| **binary search tree**<br>二叉搜索树 | A binary tree that stores keys so that the keys in the left subtree of a node are smaller than the node's key and those in the right subtree larger; its operations must preserve this invariant. | [12.5](module_12_EN.html#bst) |
| **binary tree**<br>二叉树 | Either empty, or a node that holds an element and two smaller trees, its left and right subtrees. | [5.2.2](module_05_EN.html#trees) |
| **bound variable**<br>约束变元 | An occurrence of a variable in the scope of a quantifier for that variable. Renaming it throughout the scope changes nothing. | [3.2.4](module_03_EN.html#scope) |
| **bounded quantifier**<br>有界量词 | ∀x ∈ A. P x, "for all x in A, P x", short for ∀x. x ∈ A ⟶ P x. | [4.2.3](module_04_EN.html#rel-props) |

<div class="section-anchor" id="g-c"></div>

### C

| Term | Meaning | Section |
|---|---|---|
| **calculation**<br>链式计算 | In Isar, a chain of steps t₁ R t₂, t₂ R t₃, …, each with its own proof, from which Isabelle derives t₁ R tₙ by transitivity. It is written with `also` and `finally`. | [10.4.1](module_10_EN.html#calc-eq) |
| **call by value**<br>传值调用 | An order of evaluation that evaluates the arguments of a call before the call itself. | [5.1.3](module_05_EN.html#rewriting) |
| **Cantor's theorem**<br>康托尔定理 | No function maps a set onto its power set, so some sets are larger than others. The proof is the diagonal argument. | [4.7.4](module_04_EN.html#cantor) |
| **cardinality**<br>基数 | The number of elements of a finite set A, written |A|. Isabelle writes `card A`. | [4.7.1](module_04_EN.html#finite) |
| **Cartesian product**<br>笛卡儿积 | A × B, the set of all pairs (a, b) with a ∈ A and b ∈ B. | [4.2.1](module_04_EN.html#products) |
| **case analysis**<br>情形分析 | A proof that splits into cases that together cover every possibility, and proves the claim in each. | [6.1](module_06_EN.html#informal), [10.5](module_10_EN.html#cases) |
| **case expression**<br>case 表达式 | A term that takes a value apart by matching it against patterns, with one branch per pattern, such as a `case` on an option with branches for `None` and `Some x`. | [8.3.4](module_08_EN.html#case) |
| **case split**<br>情形拆分 | Splitting a goal that contains an `if` or a `case` into one case per possibility. The simplifier splits `if` by itself, `case` only when asked with `split:`. | [9.3.3](module_09_EN.html#splits) |
| **CDCL (conflict-driven clause learning)**<br>冲突驱动的子句学习（CDCL） | After a conflict, a SAT solver adds a clause that rules out the decisions that caused it, so that the search never makes the same mistake twice. | [2.8](module_02_EN.html#sat) |
| **classical logic**<br>经典逻辑 | The logic in which A ∨ ¬A holds for every A. Natural deduction needs (RAA), or an equivalent rule, to derive it. | [6.5](module_06_EN.html#classical) |
| **classical reasoner**<br>经典推理器 | Isabelle's search methods built on natural-deduction rules, such as `blast`, `auto`, `force` and `fastforce`. They backtrack when a choice fails. | [7.9](module_07_EN.html#blast), [9.4](module_09_EN.html#classical) |
| **clause**<br>子句 | A disjunction of literals, such as ¬A ∨ B ∨ ¬C; a single literal counts as a clause too. | [2.7](module_02_EN.html#normal-forms) |
| **closure**<br>闭包 | The smallest relation that contains R and has a given property: reflexive, symmetric or transitive. | [4.5.1](module_04_EN.html#closure-def) |
| **code generation**<br>代码生成 | Translating HOL definitions into Standard ML, OCaml, Haskell or Scala with `export_code`. `value` uses the same machinery. | [8.8](module_08_EN.html#codegen) |
| **codomain**<br>陪域 | For a function f : A → B, the set B. | [4.6.1](module_04_EN.html#fun-def) |
| **compiler**<br>编译器 | A program that translates programs of one language into another, here arithmetic expressions into code for a stack machine. | [14.4](module_14_EN.html#compiler) |
| **compiler correctness**<br>编译器正确性 | Running the compiled code agrees with the meaning of the source: here, `exec (compile e) s stk = eval e s # stk`. | [14.4.2](module_14_EN.html#correct) |
| **complement**<br>补集 | −A, the elements of the type that are not in A. Isabelle writes `- A`. | [4.1.2](module_04_EN.html#sets-ops) |
| **complete**<br>完备的 | A proof system is complete if it derives every logical consequence. A proof method is complete for a logic if, given unlimited time, it proves every valid formula of it. | [6.3](module_06_EN.html#soundness), [9.4.1](module_09_EN.html#blast) |
| **complete induction**<br>完全归纳法 | Another name for strong induction: the step may use the claim for every smaller value. In Isabelle, `rule: less_induct`. | [5.6](module_05_EN.html#strong), [11.8](module_11_EN.html#complete) |
| **completeness theorem**<br>完备性定理 | Gödel's theorem (1929/1930) that every valid first-order formula can be proved. | [3.9](module_03_EN.html#decidability) |
| **composition**<br>复合 | R O S takes an R-step followed by an S-step. For functions, (g ∘ f) x = g (f x), read "g after f". | [4.2.4](module_04_EN.html#rel-ops), [4.6.3](module_04_EN.html#inverse) |
| **compositional**<br>组合式的 | A semantics is compositional if the meaning of each node is computed from the meanings of its children. | [14.2.2](module_14_EN.html#eval) |
| **computation induction**<br>计算归纳法 | Induction that follows the recursion of a function f: one case per defining equation and one hypothesis per recursive call. In Isabelle, `rule: f.induct`. | [11.5.3](module_11_EN.html#f-induct) |
| **conclusion**<br>结论 | The formula that an argument, a rule or a derivation reaches. In a subgoal, the formula after ⟹. | [2.6](module_02_EN.html#consequence), [6.2](module_06_EN.html#systems) |
| **concrete syntax**<br>具体语法 | The text of a program, with its parentheses and spaces, as opposed to its abstract syntax. | [14.2.1](module_14_EN.html#syntax) |
| **conditional rewrite rule**<br>条件重写规则 | A rule H ⟹ l = r, which the simplifier uses only after it has proved the condition H by simplification. | [9.3.1](module_09_EN.html#conditional) |
| **conjunction**<br>合取 | A ∧ B, read "A and B": true when both are true. | [2.1](module_02_EN.html#connectives) |
| **conjunctive normal form (CNF)**<br>合取范式 | A conjunction of clauses, such as (A ∨ ¬B) ∧ (¬A ∨ C ∨ D) ∧ ¬C. SAT solvers work on it. | [2.7.2](module_02_EN.html#cnf-dnf) |
| **connective**<br>联结词 | A symbol that builds a larger formula from smaller ones: ¬, ∧, ∨, ⟶ and ⟷. | [2.1](module_02_EN.html#connectives) |
| **consequent**<br>后件 | In A ⟶ B, the formula B. | [2.1](module_02_EN.html#connectives) |
| **consistent**<br>一致的 | A set of requirements is consistent if their conjunction is satisfiable: some valuation makes all of them true. | [2.9](module_02_EN.html#requirements) |
| **constant**<br>常量 | A symbol that names a single object, such as `alice` or 0. In Isabelle, a name that has been defined or declared, as opposed to a variable. | [3.2](module_03_EN.html#language) |
| **constant folding**<br>常量折叠 | An optimisation that replaces the parts of a program whose value does not depend on the state by their value, and removes operations that have no effect. | [14.6.1](module_14_EN.html#folding) |
| **constructor**<br>构造子 | One of the functions that build the values of a datatype, such as `[]` and `#` for lists, or `Red` for traffic lights. | [5.2.2](module_05_EN.html#trees), [8.3.1](module_08_EN.html#enumerations) |
| **contingent**<br>偶然式 | A formula that is satisfiable but not a tautology: true in some rows of its truth table and false in others. | [2.4](module_02_EN.html#classify) |
| **contradiction**<br>矛盾式 | A formula that is true under no valuation; also called unsatisfiable. | [2.4](module_02_EN.html#classify) |
| **contrapositive**<br>逆否命题 | The contrapositive of A ⟶ B is ¬B ⟶ ¬A. Both say the same, so proving one proves the other. | [6.1](module_06_EN.html#informal) |
| **converse (of a relation)**<br>逆关系 | R⁻¹, which reverses every pair of R. Isabelle writes `r¯`. | [4.2.4](module_04_EN.html#rel-ops) |
| **converse (of an implication)**<br>逆命题 | The converse of A ⟶ B is B ⟶ A, which says something different. Proving it instead is a common mistake. | [6.1](module_06_EN.html#informal) |
| **correctness theorem**<br>正确性定理 | A theorem stating that for every input, the result of the implementation has the property of the specification. | [12.1](module_12_EN.html#verify) |
| **countable**<br>可数的 | A set is countable if there is an injective function from it to ℕ: it is finite, or its elements can be listed as a₀, a₁, a₂, … | [4.7.3](module_04_EN.html#countable) |
| **counterexample**<br>反例 | Something that makes a claim false: a valuation, values of the free variables, or a run that reaches a bad state. | [2.4](module_02_EN.html#classify), [13.3](module_13_EN.html#invariants) |
| **counterexample to induction**<br>归纳反例 | A state and an event that break the step case of an invariant proof: the state satisfies the invariant, and the event leads out of it. | [13.5.1](module_13_EN.html#fails) |
| **counterexample trace**<br>反例轨迹 | A run, written as a list of events, from an initial state to a state that violates a property. | [4.5.2](module_04_EN.html#reachability), [13.6](module_13_EN.html#traces) |
| **countermodel**<br>反模型 | A structure, with an assignment for the free variables, in which a formula is false. One countermodel refutes validity. | [3.4](module_03_EN.html#validity) |
| **Curry–Howard correspondence**<br>柯里–霍华德对应 | Intuitionistic proofs can be read as programs: a proof of A ⟶ B is a function from evidence for A to evidence for B. Rocq and Lean are built on this idea. | [6.5.1](module_06_EN.html#intuitionistic) |
| **currying**<br>柯里化 | Writing a function of several arguments as a function that takes the first argument and returns a function of the rest, after the logician Haskell Curry. | [8.2.2](module_08_EN.html#currying) |

<div class="section-anchor" id="g-d"></div>

### D

| Term | Meaning | Section |
|---|---|---|
| **data refinement**<br>数据精化 | Showing that a concrete data structure implements an abstract model: with an abstraction function and an invariant, every concrete operation corresponds to its abstract one. | [12.6.1](module_12_EN.html#refine-pattern) |
| **datatype**<br>数据类型 | A type whose values are built from constructors; values built differently are different. It is defined with the command `datatype`. | [5.2.2](module_05_EN.html#trees), [8.3.1](module_08_EN.html#enumerations) |
| **De Morgan's laws**<br>德摩根律 | ¬(A ∧ B) ≡ ¬A ∨ ¬B and ¬(A ∨ B) ≡ ¬A ∧ ¬B. | [2.5](module_02_EN.html#equivalence) |
| **decidable**<br>可判定的 | A question is decidable if some algorithm answers it correctly for every input and always terminates. | [3.9](module_03_EN.html#decidability) |
| **decision problem**<br>判定问题 | A yes-or-no question about inputs, such as "is this number prime?"; as a set, a subset of ℕ. | [4.7.4](module_04_EN.html#cantor) |
| **decision procedure**<br>判定过程 | A program that decides, for every formula of some kind, whether it holds, and proves it if it does, such as `linarith`. | [9.5](module_09_EN.html#arith) |
| **derivable**<br>可推导的 | Γ ⊢ A, "A is derivable from Γ": some derivation has the conclusion A and all its open assumptions in Γ. | [6.2](module_06_EN.html#systems) |
| **derivation**<br>推导 | A tree of formulas in which every formula is an assumption or follows from the formulas directly above it by a rule. | [6.2](module_06_EN.html#systems), [11.6.1](module_11_EN.html#ev) |
| **destruction rule**<br>拆解规则 | A rule with the connective in its major premise and a part of that premise as its conclusion, such as `conjunct1`, `mp` and `spec`. It is used with `drule` and `frule`. | [7.2.3](module_07_EN.html#rules-shapes) |
| **diagonal argument**<br>对角线论证 | Cantor's proof that no function f maps a set onto its power set: the set of elements x that are not in f x is not a value of f. | [4.7.4](module_04_EN.html#cantor) |
| **difference**<br>差集 | A − B, the elements of A that are not in B. | [4.1.2](module_04_EN.html#sets-ops) |
| **discharge**<br>解除（假设） | A rule such as (⟶I) discharges an assumption: the conclusion no longer depends on it. A discharged assumption is written [A]¹. | [6.4.2](module_06_EN.html#imp) |
| **disjoint**<br>不相交的 | Two sets are disjoint if they have no element in common: A ∩ B = ∅. | [4.1.2](module_04_EN.html#sets-ops) |
| **disjunction**<br>析取 | A ∨ B, read "A or B": true when at least one of them is true. | [2.1](module_02_EN.html#connectives) |
| **disjunctive normal form (DNF)**<br>析取范式 | A disjunction of conjunctions of literals, such as (A ∧ ¬B) ∨ (¬A ∧ C) ∨ D. | [2.7.2](module_02_EN.html#cnf-dnf) |
| **domain (of a function)**<br>定义域 | For a function f : A → B, the set A. | [4.6.1](module_04_EN.html#fun-def) |
| **domain (of a structure)**<br>论域 | The non-empty set of objects that the variables range over. | [3.3](module_03_EN.html#structures) |
| **DPLL procedure**<br>DPLL 过程 | The search on which SAT solvers are based: unit propagation, decisions, and going back to the latest decision after a conflict. | [2.8](module_02_EN.html#sat) |
| **dual**<br>对偶 | The law obtained by swapping ∪ and ∩ (and ∅ and UNIV). The dual of a law of sets holds as well. | [4.1.3](module_04_EN.html#sets-laws) |

<div class="section-anchor" id="g-e"></div>

### E

| Term | Meaning | Section |
|---|---|---|
| **effect**<br>效果 | How an event changes the state of a state machine. | [13.1](module_13_EN.html#machines) |
| **eigenvariable**<br>本征变元 | The name a in the rules (∀I) and (∃E). It must be fresh: this is the eigenvariable condition. | [6.6](module_06_EN.html#quantifiers) |
| **element**<br>元素 | A member of a set: x ∈ A means that x is an element of A. | [4.1.1](module_04_EN.html#sets-notation) |
| **elimination rule**<br>消去规则 | A rule that says how to use a formula with a given connective. In Isabelle its major premise contains the connective, and it is used with `erule`. | [6.4](module_06_EN.html#connectives), [7.2.3](module_07_EN.html#rules-shapes) |
| **empty set**<br>空集 | ∅, the set without elements. Isabelle writes `{}`. | [4.1.1](module_04_EN.html#sets-notation) |
| **enumeration**<br>枚举类型 | A datatype whose constructors take no arguments, such as the four states of a traffic light. | [8.3.1](module_08_EN.html#enumerations) |
| **equisatisfiable**<br>等可满足的 | Two formulas are equisatisfiable if one is satisfiable exactly when the other is. | [2.7.2](module_02_EN.html#cnf-dnf) |
| **equivalence class**<br>等价类 | The set of the elements related to x by an equivalence relation, written [x]. | [4.3](module_04_EN.html#equivalence) |
| **equivalence relation**<br>等价关系 | A relation that is reflexive, symmetric and transitive. Its equivalence classes form a partition. | [4.3](module_04_EN.html#equivalence) |
| **evaluation**<br>求值 | Computing the value of a term by rewriting it with the defining equations until none applies. | [5.1.3](module_05_EN.html#rewriting) |
| **event**<br>事件 | A kind of step of a state machine, such as pressing a button. It can happen when its guard holds, and changes the state by its effect. | [13.1](module_13_EN.html#machines) |
| **existential quantifier**<br>存在量词 | ∃: ∃x. φ says that φ holds for at least one x. | [3.2.3](module_03_EN.html#quantifiers) |
| **extensionality**<br>外延性 | Two sets are equal when they have the same elements. | [4.1.1](module_04_EN.html#sets-notation) |

<div class="section-anchor" id="g-f"></div>

### F

| Term | Meaning | Section |
|---|---|---|
| **fact**<br>事实 | In Isar, a proved statement that a proof can use: an assumption, the result of `have` or `show`, or a lemma. | [10.3.1](module_10_EN.html#facts-then) |
| **fairness**<br>公平性 | An assumption that rules out unfair runs, such as "an event whose guard stays true is eventually taken". Proofs of liveness need it. | [13.8.1](module_13_EN.html#liveness) |
| **falsum (⊥)**<br>恒假（⊥） | ⊥, read "bottom" or "falsum": the formula that is false in every valuation and every structure. Isabelle writes `False`. | [6.4.5](module_06_EN.html#not) |
| **finite model**<br>有限模型 | A model in which every type is finite. Nitpick searches for one that makes a claim false. | [9.7.2](module_09_EN.html#nitpick) |
| **fixed variable**<br>固定变量 | A variable bound by ⋀ in a subgoal, or introduced by `fix` in Isar. It stands for an arbitrary value, and unification never replaces it. Isabelle also calls it a parameter. | [7.6.1](module_07_EN.html#quantifiers-all), [10.2.4](module_10_EN.html#shape-fix) |
| **formal language**<br>形式语言 | A language with an exact grammar, so that every statement has one reading; the first ingredient of a formal method. | [1.2](module_01_EN.html#formal) |
| **formal method**<br>形式化方法 | A way of specifying or verifying a system in a language with a precise mathematical meaning, so that claims about the system can be checked by calculation or proof. | [1.2](module_01_EN.html#formal) |
| **formal specification**<br>形式化规约 | A specification written in a formal language. | [1.2](module_01_EN.html#formal) |
| **formula**<br>公式 | An expression built by the formation rules: from atoms (or atomic formulas), `True` and `False`, with the connectives and, in predicate logic, the quantifiers. | [2.2.1](module_02_EN.html#formation), [3.2.3](module_03_EN.html#quantifiers) |
| **forward chaining**<br>前向链接 | In Isar, passing facts to the next claim, whose proof method then receives them; `then`, `from` and `with` do it. | [10.3.1](module_10_EN.html#facts-then) |
| **free variable**<br>自由变元 | An occurrence of a variable that no quantifier binds; in Isabelle, a name that is not a constant. The free variables of a lemma are implicitly universal. | [3.2.4](module_03_EN.html#scope), [8.1.2](module_08_EN.html#terms) |
| **fresh**<br>新的 | A name is fresh if it does not occur free where a rule forbids it: in the conclusion, in the quantified formula or in the open assumptions. | [6.6](module_06_EN.html#quantifiers) |
| **function**<br>函数 | A relation in which every element of the domain is related to exactly one element of the codomain. In HOL a function is a value like any other. | [4.6.1](module_04_EN.html#fun-def) |
| **function symbol**<br>函数符号 | A symbol that names an operation whose result is an object, such as `owner` or +. | [3.2](module_03_EN.html#language) |
| **functional correctness**<br>功能正确性 | Correctness about which result a program computes, not about how long it takes or how much memory it uses. | [12.1](module_12_EN.html#verify) |

<div class="section-anchor" id="g-g"></div>

### G

| Term | Meaning | Section |
|---|---|---|
| **generalise**<br>推广 | To prove a claim for all values of a variable at once, so that the induction hypothesis can be used with other values. `arbitrary:` does this. | [11.2](module_11_EN.html#generalise), [14.5.1](module_14_EN.html#paper) |
| **genuine**<br>真实的（反例） | A Nitpick counterexample is genuine when Nitpick has checked that it falsifies the claim. A potentially spurious one might disappear in a larger model. | [9.7.2](module_09_EN.html#nitpick) |
| **goal**<br>目标 | The statement still to be proved. | [1.7.3](module_01_EN.html#first-prove) |
| **guard**<br>守卫条件 | (1) A predicate such as `user` that says which kind an object is, in a domain with several kinds (Module 3). (2) The condition under which an event of a state machine can happen (Module 13). | [3.7](module_03_EN.html#specifications), [13.1](module_13_EN.html#machines) |

<div class="section-anchor" id="g-h"></div>

### H

| Term | Meaning | Section |
|---|---|---|
| **Hasse diagram**<br>哈斯图 | A drawing of a partial order on a finite set: smaller elements lower, and a line only where one element covers another. | [4.4.2](module_04_EN.html#hasse) |
| **head**<br>头部 | The first element x of a list x # xs. | [5.2.1](module_05_EN.html#lists) |
| **higher-order logic (HOL)**<br>高阶逻辑 | A typed logic in which functions and predicates are values, so variables and quantifiers may range over them. It is the logic of Isabelle/HOL. | [1.4](module_01_EN.html#trust), [3.8](module_03_EN.html#types) |

<div class="section-anchor" id="g-i"></div>

### I

| Term | Meaning | Section |
|---|---|---|
| **identity relation**<br>恒等关系 | Equality on a set A: the relation {(x, x). x ∈ A}. | [4.2.2](module_04_EN.html#rel-def) |
| **image**<br>像 | The set of everything related by R to an element of S, or the values of f on S. Isabelle writes ```r `` S``` and `` f ` A ``. | [4.2.4](module_04_EN.html#rel-ops), [4.6.1](module_04_EN.html#fun-def) |
| **implementation**<br>实现 | The program that does the work: it says how to compute the result. | [12.1](module_12_EN.html#verify) |
| **implication**<br>蕴涵 | A ⟶ B, read "A implies B" or "if A then B": false only when A is true and B false. | [2.1](module_02_EN.html#connectives) |
| **inclusion–exclusion**<br>容斥原理 | For finite sets, |A ∪ B| = |A| + |B| − |A ∩ B|: the sum counts the common elements twice. | [4.7.1](module_04_EN.html#finite) |
| **incomparable**<br>不可比较的 | Two elements of a partial order are incomparable if neither is below the other, such as {1} and {2} under ⊆. | [4.4.1](module_04_EN.html#partial-orders) |
| **incompleteness theorems**<br>不完备性定理 | Gödel's theorems (1931): no proof system whose axioms a program can check, and which proves only true statements, proves every truth about the natural numbers. | [3.9](module_03_EN.html#decidability) |
| **induction**<br>归纳 | Proving a claim for every value by proving it for the smallest values and showing that it passes from smaller values to larger ones. Mathematical, structural, strong and rule induction are kinds of it. | [5.3.1](module_05_EN.html#principle) |
| **induction hypothesis (IH)**<br>归纳假设 | The assumption, in the induction step, that the claim holds for the smaller value. In Isabelle's subgoals it stands before ⟹; in Isar it is `c.IH`. | [5.3.1](module_05_EN.html#principle) |
| **induction step**<br>归纳步骤 | The part of an induction that proves the claim for n + 1, or for a larger value, from the induction hypothesis. | [5.3.1](module_05_EN.html#principle) |
| **inductive definition**<br>归纳定义 | A definition of a predicate by introduction rules. It holds exactly for what finitely many rule applications derive: it is the smallest predicate closed under the rules. | [11.6](module_11_EN.html#inductive) |
| **inductive invariant**<br>归纳不变式 | A property that holds in every initial state and is preserved by every step. It then holds in every reachable state. | [13.3](module_13_EN.html#invariants) |
| **inference rule**<br>推理规则 | A rule with zero or more premises and one conclusion, which says what may be derived from what. | [6.2](module_06_EN.html#systems) |
| **initial method**<br>初始方法 | The method after `proof`, which turns the goal into the pending goals of the block. | [10.2.1](module_10_EN.html#shape-blocks) |
| **initial state**<br>初始状态 | A state in which a state machine may start. | [13.1](module_13_EN.html#machines) |
| **injective**<br>单射的 | Different inputs give different outputs: f x = f y implies x = y. Isabelle writes `inj f`. | [4.6.2](module_04_EN.html#inj-surj) |
| **inner syntax**<br>内层语法 | The language of terms and types, written between quotation marks. | [1.7.2](module_01_EN.html#first-compute) |
| **instance**<br>实例 | A type that belongs to a type class: `nat` and `int` are instances of the class `plus`. | [8.6.2](module_08_EN.html#classes) |
| **interactive theorem proving**<br>交互式定理证明 | Writing definitions, theorems and their proofs in an expressive logic, with a program that checks every step and automation that helps. | [1.3](module_01_EN.html#landscape) |
| **interpretation**<br>解释 | What a structure makes each constant, function symbol and predicate symbol mean. | [3.3](module_03_EN.html#structures) |
| **intersection**<br>交集 | A ∩ B, the elements that are in both A and B. | [4.1.2](module_04_EN.html#sets-ops) |
| **introduction rule**<br>引入规则 | A rule that says how to prove a formula with a given connective; it is used with `rule`. For an inductive definition, one of its defining rules. | [6.4](module_06_EN.html#connectives), [7.2.3](module_07_EN.html#rules-shapes), [11.6](module_11_EN.html#inductive) |
| **intuitionistic logic**<br>直觉主义逻辑 | Natural deduction without (RAA): A ∨ ¬A and ¬¬A ⟶ A are not derivable, and proofs can be read as programs. | [6.5.1](module_06_EN.html#intuitionistic) |
| **invariant**<br>不变式 | A property that keeps holding. In Module 5, one that holds initially and is preserved by every step; in Module 13, one that holds in every reachable state; for a data structure, one that every value built by its operations has. | [5.8](module_05_EN.html#invariants), [12.5.3](module_12_EN.html#bst-invariant), [13.3](module_13_EN.html#invariants) |
| **inverse**<br>逆函数 | g is an inverse of f : A → B if g (f a) = a and f (g b) = b for all a and b. A function has one exactly when it is bijective; Isabelle writes `inv f`. | [4.6.3](module_04_EN.html#inverse) |
| **irreflexive**<br>反自反的 | A relation is irreflexive on A if no element of A is related to itself. | [4.2.3](module_04_EN.html#rel-props) |
| **Isabelle/HOL**<br>Isabelle/HOL | Isabelle with higher-order logic, the proof assistant this series uses. | [1.4](module_01_EN.html#trust) |
| **Isabelle/jEdit**<br>Isabelle/jEdit | Isabelle's prover IDE: an editor in which Isabelle checks the text as you type. | [1.6](module_01_EN.html#tour) |
| **Isabelle/Pure**<br>Isabelle/Pure | Pure, Isabelle's meta-logic: rules and goals are written in it with ⟹, ⋀ and ≡, and HOL is defined inside it. | [7.1.1](module_07_EN.html#meta-pure) |
| **Isar**<br>Isar | Isabelle's language of structured proofs, short for "Intelligible semi-automated reasoning": each step states a fact, and Isabelle checks it. | [10.1](module_10_EN.html#why) |

<div class="section-anchor" id="g-k"></div>

### K

| Term | Meaning | Section |
|---|---|---|
| **kernel**<br>内核 | The small part of an LCF-style prover that implements the inference rules. Every theorem is built by it. | [1.4](module_01_EN.html#trust) |

<div class="section-anchor" id="g-l"></div>

### L

| Term | Meaning | Section |
|---|---|---|
| **λ-abstraction**<br>λ 抽象 | `λx. t`, the function without a name that maps each x to t. | [8.2.1](module_08_EN.html#lambda) |
| **law of excluded middle**<br>排中律 | A ∨ ¬A: every proposition is true or false. Natural deduction derives it only with (RAA). | [2.4](module_02_EN.html#classify), [6.5](module_06_EN.html#classical) |
| **LCF approach**<br>LCF 方法 | An architecture in which theorems are values of an abstract type that only the kernel's inference rules can create, so that bugs in proof tools cannot produce false theorems. | [1.4](module_01_EN.html#trust) |
| **least element**<br>最小元素 | An element below every element of a partial order; the greatest element is above every element. | [4.4.2](module_04_EN.html#hasse) |
| **lemma**<br>引理 | A statement to be proved, in Isabelle stated with `lemma`. `theorem` and `corollary` mean the same. | [1.7.3](module_01_EN.html#first-prove) |
| **lexicographic order**<br>字典序 | The order of a dictionary on pairs: compare the first components, and only if they are equal, the second ones. | [5.7.2](module_05_EN.html#measures) |
| **linear arithmetic**<br>线性算术 | Formulas built from variables, numbers, +, −, =, < and ≤ and the connectives, in which a variable may be multiplied by a number but not by another variable. `linarith` decides it. | [9.5](module_09_EN.html#arith) |
| **list**<br>列表 | Either the empty list `[]` or `x # xs`, a head x in front of a tail xs. All elements of a list have the same type. | [5.2.1](module_05_EN.html#lists) |
| **list comprehension**<br>列表推导式 | `[e. x ← xs, P x]`, the list of the values of e for the elements x of xs that satisfy P x. | [8.5.2](module_08_EN.html#comprehension) |
| **listing**<br>列举法 | Describing a set by naming its elements between braces, as in {2, 3, 5, 7}. | [4.1.1](module_04_EN.html#sets-notation) |
| **literal**<br>文字 | An atom or a negated atom, such as A or ¬A. | [2.7](module_02_EN.html#normal-forms) |
| **liveness property**<br>活性性质 | A property saying that something good eventually happens, such as a request being served. An invariant cannot express it. | [13.8.1](module_13_EN.html#liveness) |
| **logical consequence**<br>逻辑推论 | ψ is a logical consequence of φ₁, …, φₙ, written φ₁, …, φₙ ⊨ ψ, if every valuation (or structure) that makes all the φᵢ true makes ψ true. | [2.6](module_02_EN.html#consequence), [3.4](module_03_EN.html#validity) |
| **logical equivalence**<br>逻辑等价 | φ ≡ ψ: the two formulas have the same truth value under every valuation. | [2.5](module_02_EN.html#equivalence) |

<div class="section-anchor" id="g-m"></div>

### M

| Term | Meaning | Section |
|---|---|---|
| **main connective**<br>主联结词 | The connective at the root of a formula's parse tree; the formula is named after it, and it decides which rules apply. | [2.2.1](module_02_EN.html#formation), [6.4](module_06_EN.html#connectives) |
| **major premise**<br>主前提 | The first premise of an elimination or destruction rule: the one that contains the connective. | [7.2.3](module_07_EN.html#rules-shapes) |
| **many-sorted logic**<br>多类逻辑 | A typed logic: every argument and result of a symbol has a sort, and each variable ranges over the domain of one sort. | [3.8](module_03_EN.html#types) |
| **matching**<br>匹配 | Finding terms for the variables of an equation that make its left side identical to a part of the goal: unification in one direction only. | [9.2.1](module_09_EN.html#rewriting) |
| **mathematical induction**<br>数学归纳法 | Prove P(0), and P(n) ⟶ P(n + 1) for an arbitrary n; then P(n) holds for every natural number n. | [5.3.1](module_05_EN.html#principle) |
| **measure**<br>度量 | A function from the arguments of a recursive function to the natural numbers that gets smaller at every recursive call. It proves that the recursion terminates. | [5.7.2](module_05_EN.html#measures), [8.7.2](module_08_EN.html#termination-messages) |
| **meta-logic**<br>元逻辑 | A logic for stating rules and proofs about another logic, the object logic. In Isabelle it is Pure. | [7.1.1](module_07_EN.html#meta-pure) |
| **minimal element**<br>极小元素 | An element of a partial order with no element strictly below it; a maximal element has none strictly above it. A partial order can have several. | [4.4.2](module_04_EN.html#hasse) |
| **mode**<br>证明模式 | The first line of every proof state: `proof (prove)` after a claim, `proof (state)` inside a block, `proof (chain)` after facts have been picked up. It tells you what may come next. | [10.2.1](module_10_EN.html#shape-blocks) |
| **model**<br>模型 | A valuation or a structure that makes a formula true. | [2.4](module_02_EN.html#classify), [3.3](module_03_EN.html#structures) |
| **model checking**<br>模型检测 | Exploring every reachable state of a finite model to check a property; the answer is "holds" or a counterexample trace. A model checker, such as SPIN or TLC, does it. | [1.3](module_01_EN.html#landscape), [13.1](module_13_EN.html#machines) |
| **modus ponens**<br>肯定前件式 | From A ⟶ B and A, conclude B: the rule (⟶E), `mp` in Isabelle. | [2.6](module_02_EN.html#consequence), [6.4.2](module_06_EN.html#imp) |
| **multiset**<br>多重集 | A collection in which order does not matter but the number of copies of each element does; also called a bag. `mset xs` is the multiset of the elements of a list. | [12.2.2](module_12_EN.html#isort-spec) |

<div class="section-anchor" id="g-n"></div>

### N

| Term | Meaning | Section |
|---|---|---|
| **named case**<br>命名情形 | In Isar, a case of `cases` or `induction`, entered with `case c` or `case (c x y …)`; it assumes the facts of the case and, in an induction, sets `?case`. | [10.6.1](module_10_EN.html#induction-skeleton) |
| **natural deduction**<br>自然演绎 | A proof system with an introduction rule and an elimination rule for each connective, in which you may make assumptions and discharge them. Isabelle is built around it. | [6.4](module_06_EN.html#connectives) |
| **natural numbers**<br>自然数 | 0, 1, 2, …, built from 0 and the successor `Suc`; the type `nat`. | [5.1.1](module_05_EN.html#peano) |
| **negation**<br>否定 | ¬A, read "not A": true when A is false. | [2.1](module_02_EN.html#connectives) |
| **negation normal form (NNF)**<br>否定范式 | A formula with only ¬, ∧ and ∨, in which every ¬ stands directly in front of an atom. | [2.7.1](module_02_EN.html#nnf) |
| **Nitpick**<br>Nitpick | Isabelle's counterexample finder: it searches with a SAT solver for a finite model that makes a claim false. | [2.4](module_02_EN.html#classify), [9.7.2](module_09_EN.html#nitpick) |
| **normal form**<br>范式 | (1) A standard shape of formula: NNF, CNF or DNF. (2) In rewriting, a term that no rule can rewrite any further. | [2.7](module_02_EN.html#normal-forms), [9.2.1](module_09_EN.html#rewriting) |
| **NP-complete**<br>NP 完全的 | A problem in NP into which every problem in NP can be translated efficiently. SAT was the first problem shown to be NP-complete (Cook, 1971). | [2.8](module_02_EN.html#sat) |

<div class="section-anchor" id="g-o"></div>

### O

| Term | Meaning | Section |
|---|---|---|
| **object logic**<br>对象逻辑 | The logic in which formulas are written; in Isabelle/HOL, HOL, with ¬ ∧ ∨ ⟶ ∀ ∃ and =. | [7.1.1](module_07_EN.html#meta-pure) |
| **open assumption**<br>未解除的假设 | An assumption that no rule below it discharges. The conclusion of a derivation depends only on its open assumptions. | [6.4.2](module_06_EN.html#imp) |
| **option type**<br>选项类型 | `'a option`, with the values `None` and `Some x`: the type of results that may be missing. | [8.3.3](module_08_EN.html#options) |
| **outer syntax**<br>外层语法 | The language of commands such as `value` and `lemma`, which stay outside the quotation marks. | [1.7.2](module_01_EN.html#first-compute) |
| **overlapping equations**<br>重叠的等式 | Equations of `fun` whose patterns can match the same argument. `fun` uses the first one that matches. | [8.4.3](module_08_EN.html#patterns) |
| **overloading**<br>重载 | One name with several meanings, chosen by the type, such as + on `nat` and on `int`. Isabelle organises it with type classes. | [8.6.2](module_08_EN.html#classes) |

<div class="section-anchor" id="g-p"></div>

### P

| Term | Meaning | Section |
|---|---|---|
| **pair**<br>有序对 | (a, b), with first component a and second component b; (a, b) = (c, d) when a = c and b = d. `fst` and `snd` return the components. | [4.2.1](module_04_EN.html#products), [8.3.3](module_08_EN.html#options) |
| **parse tree**<br>语法树 | The tree that shows how a formula is built from its parts, with the main connective at the root. | [2.2.1](module_02_EN.html#formation) |
| **parser**<br>语法分析器 | The program that turns the text of a program into its abstract syntax. | [14.2.1](module_14_EN.html#syntax) |
| **partial application**<br>部分应用 | Applying a curried function to fewer arguments than it can take. The result is a function, such as `(+) 3`. | [8.2.2](module_08_EN.html#currying) |
| **partial correctness**<br>部分正确性 | The guarantee that every result a program returns agrees with the logic, without a promise that it returns at all. | [8.8](module_08_EN.html#codegen), [12.7.1](module_12_EN.html#guarantee) |
| **partial function**<br>部分函数 | A relation in which every input has at most one output, such as the function computed by a program that may loop. HOL models it as a total function with an `option` result. | [4.6.1](module_04_EN.html#fun-def) |
| **partial order**<br>偏序 | A relation that is reflexive, antisymmetric and transitive, such as ⊆ or divisibility. | [4.4.1](module_04_EN.html#partial-orders) |
| **partition**<br>划分 | A set of non-empty subsets of A, its blocks, such that every element of A is in exactly one block. | [4.3](module_04_EN.html#equivalence) |
| **pattern matching**<br>模式匹配 | Choosing an equation by the shape of the argument: the left-hand side of each equation contains a pattern, such as `Red` or `x # xs`. | [8.3.1](module_08_EN.html#enumerations) |
| **pending goal**<br>待证目标 | A goal of an Isar proof block that a `show` still has to solve before `qed`. | [10.2.1](module_10_EN.html#shape-blocks) |
| **permutation**<br>排列 | A list ys is a permutation of xs if it has the same elements, each as often: `mset ys = mset xs`. | [12.2.2](module_12_EN.html#isort-spec) |
| **permutative rule**<br>置换规则 | A rewrite rule whose two sides are the same up to the order of the variables, such as commutativity. The simplifier uses it only to put terms into a fixed order. | [9.3.4](module_09_EN.html#loops) |
| **pigeonhole principle**<br>鸽巢原理 | There is no injective function from a finite set into a smaller one. | [4.7.2](module_04_EN.html#pigeonhole) |
| **polymorphic**<br>多态的 | A function whose type contains a type variable, such as `rev :: 'a list ⇒ 'a list`, works for every instance of that type. | [8.1.1](module_08_EN.html#types) |
| **postfix notation**<br>后缀表示法 | Writing the operands before the operator, as the code for a stack machine does; also called reverse Polish notation. | [14.4.1](module_14_EN.html#compiling) |
| **power set**<br>幂集 | The set of all subsets of A. Isabelle writes `Pow A`; a set of n elements has 2ⁿ subsets. | [4.1.2](module_04_EN.html#sets-ops) |
| **predicate**<br>谓词 | A property or relation that holds or does not hold of objects. In Isabelle, a function to `bool`, such as `P :: 'a ⇒ bool`. | [3.1](module_03_EN.html#beyond), [3.8](module_03_EN.html#types) |
| **predicate logic**<br>谓词逻辑 | Propositional logic extended with terms, predicates and the quantifiers ∀ and ∃; also called first-order logic. | [3.1](module_03_EN.html#beyond) |
| **predicate symbol**<br>谓词符号 | A symbol that names a property or a relation, such as `admin` or <. | [3.2](module_03_EN.html#language) |
| **premise**<br>前提 | A formula that an argument or a rule starts from. In Isabelle, a premise of a rule stands before ⟹. | [2.6](module_02_EN.html#consequence), [6.2](module_06_EN.html#systems) |
| **Presburger arithmetic**<br>Presburger 算术 | Linear arithmetic over the integers and natural numbers, with quantifiers, divisibility, and `div` and `mod` by numbers. It is decidable, and `presburger` decides it. | [9.5](module_09_EN.html#arith) |
| **prime number**<br>素数 | A natural number p ≥ 2 whose only divisors are 1 and p. | [5.6](module_05_EN.html#strong) |
| **primitive recursion**<br>原始递归 | Recursion with one equation per constructor and recursive calls only on the immediate parts of the argument. `primrec` accepts only this. | [8.4.2](module_08_EN.html#fun-primrec) |
| **principle of explosion**<br>爆炸原理 | From inconsistent premises, or from ⊥, anything follows; in Latin, ex falso quodlibet. | [2.6](module_02_EN.html#consequence) |
| **priority**<br>优先级 | How tightly a connective binds. In Isabelle, ¬ binds most tightly, then ∧, then ∨, then ⟶ and ⟷. | [2.2.2](module_02_EN.html#priorities) |
| **proof**<br>证明 | A chain of steps, each justified by a rule, from the assumptions to the conclusion. | [6.1](module_06_EN.html#informal) |
| **proof assistant**<br>证明助手 | A program that checks proofs written in a formal logic and helps you find them; also called an interactive theorem prover. | [1.4](module_01_EN.html#trust) |
| **proof block**<br>证明块 | `proof m … qed`: proves the goal stated directly before it. The steps inside establish facts and solve the pending goals. | [10.2.1](module_10_EN.html#shape-blocks) |
| **proof by contradiction**<br>反证法 | To prove A, assume ¬A and derive a contradiction: the rule (RAA), `ccontr` in Isabelle. | [6.1](module_06_EN.html#informal), [6.5](module_06_EN.html#classical) |
| **proof method**<br>证明方法 | A step that Isabelle applies to a goal, such as `simp`, `auto`, `blast`, `rule` or `induction`. | [5.4.2](module_05_EN.html#induction-state) |
| **proof outline**<br>证明大纲 | The skeleton of the cases that Isabelle/jEdit shows after `proof (cases …)` or `proof (induction …)`; click it to insert it. | [10.5.1](module_10_EN.html#cases-bool) |
| **proof state**<br>证明状态 | The list of subgoals that remain. The proof is complete when it is empty. | [7.3.2](module_07_EN.html#backward-rule) |
| **proof system**<br>证明系统 | A language of formulas with inference rules for deriving statements step by step, so simple that a computer can check every step. | [1.2](module_01_EN.html#formal), [6.2](module_06_EN.html#systems) |
| **proper subset**<br>真子集 | A ⊂ B: A ⊆ B and A ≠ B. | [4.1.1](module_04_EN.html#sets-notation) |
| **proposition**<br>命题 | A statement that is either true or false. | [2.1](module_02_EN.html#connectives) |
| **propositional logic**<br>命题逻辑 | The logic of the connectives not, and, or, implies and if and only if, applied to propositions. | [2.1](module_02_EN.html#connectives) |
| **prover IDE**<br>证明器集成开发环境 | An editor in which the prover checks the text continuously, as you type; Isabelle/jEdit is one. | [1.6](module_01_EN.html#tour) |
| **pure function**<br>纯函数 | A function whose result depends on nothing but its arguments. Every function in HOL is pure. | [6.8](module_06_EN.html#equality) |

<div class="section-anchor" id="g-q"></div>

### Q

| Term | Meaning | Section |
|---|---|---|
| **quantifier**<br>量词 | ∀ ("for all") or ∃ ("there exists"); it binds a variable in its scope. | [3.2.3](module_03_EN.html#quantifiers) |
| **queue**<br>队列 | A waiting line: elements join at the back and leave from the front, so the first to join is the first to leave. | [12.6.2](module_12_EN.html#queue) |
| **Quickcheck**<br>Quickcheck | Isabelle's tester: it runs a claim as a program on many small values of its free variables and reports a counterexample. | [1.7.5](module_01_EN.html#first-refute), [9.7.1](module_09_EN.html#quickcheck) |

<div class="section-anchor" id="g-r"></div>

### R

| Term | Meaning | Section |
|---|---|---|
| **RAA (reductio ad absurdum)**<br>归谬法（RAA） | The rule: to prove A, assume ¬A and derive ⊥. It makes natural deduction classical; in Isabelle it is `ccontr`. | [6.5](module_06_EN.html#classical) |
| **range**<br>值域 | The image of the whole domain: all values of f. Isabelle writes `range f`. | [4.6.1](module_04_EN.html#fun-def) |
| **reachable state**<br>可达状态 | A state that some run leads to from an initial state. | [4.5.2](module_04_EN.html#reachability), [13.1](module_13_EN.html#machines) |
| **record**<br>记录 | A tuple whose components, its fields, have names. `cars s` selects a field and `s⦇cars := Amber⦈` updates it. | [13.4.1](module_13_EN.html#records) |
| **recursive case**<br>递归情形 | A case of a recursive definition that calls the function on smaller arguments. | [5.1.2](module_05_EN.html#nat-functions) |
| **recursive datatype**<br>递归数据类型 | A datatype that refers to itself in its definition, such as lists, stacks and trees. | [8.3.2](module_08_EN.html#recursive) |
| **recursive definition**<br>递归定义 | A definition of a function by equations in which the function may also appear on the right-hand side, called only on smaller arguments. | [5.1.2](module_05_EN.html#nat-functions) |
| **refinement**<br>精化 | A concrete model refines an abstract one if an abstraction function maps its initial states to initial states and each of its steps to an abstract step or a stutter step. Invariants then carry over. | [12.6.1](module_12_EN.html#refine-pattern), [13.7.1](module_13_EN.html#two-models) |
| **reflexive**<br>自反的 | A relation is reflexive on A if every element of A is related to itself. | [4.2.3](module_04_EN.html#rel-props) |
| **reflexive–transitive closure**<br>自反传递闭包 | R*, the pairs joined by a path of zero or more R-steps. Isabelle writes `r⇧*`. | [4.5.1](module_04_EN.html#closure-def) |
| **relation**<br>关系 | A set of pairs: a relation from A to B is a subset of A × B. | [4.2.2](module_04_EN.html#rel-def) |
| **rewrite rule**<br>重写规则 | An equation l = r that is used from left to right only. | [5.1.3](module_05_EN.html#rewriting), [9.2.1](module_09_EN.html#rewriting) |
| **rewriting**<br>重写 | Replacing, again and again, a part of a term that matches the left side of an equation by the right side. | [5.1.3](module_05_EN.html#rewriting), [9.2.1](module_09_EN.html#rewriting) |
| **rule induction**<br>规则归纳法 | Proving a property of everything an inductive definition derives: one case per rule, with an induction hypothesis for each premise about the predicate. In Isabelle, `rule: I.induct`. | [11.6.2](module_11_EN.html#rule-induction) |
| **rule inversion**<br>规则反演 | Reasoning backwards from a fact I t: only the rules whose conclusion can match t could have derived it, so their premises hold. | [11.6.3](module_11_EN.html#inversion) |
| **run**<br>运行 | A sequence of states that starts in an initial state and follows the transition relation. | [13.1](module_13_EN.html#machines) |

<div class="section-anchor" id="g-s"></div>

### S

| Term | Meaning | Section |
|---|---|---|
| **safe**<br>安全的 | A step or rule is safe if it never turns a provable goal into unprovable subgoals, as `conjI` and `impI` do; unsafe ones, such as `disjI1` and `allE`, may. | [6.7](module_06_EN.html#search), [9.4](module_09_EN.html#classical) |
| **safety property**<br>安全性质 | A property saying that something bad never happens: it must hold in every reachable state. | [4.5.2](module_04_EN.html#reachability), [13.3](module_13_EN.html#invariants) |
| **SAT (satisfiability problem)**<br>可满足性问题（SAT） | Given a propositional formula, usually in CNF, is it satisfiable? | [2.8](module_02_EN.html#sat) |
| **SAT solver**<br>SAT 求解器 | A program that decides whether a propositional formula is satisfiable and, if it is, returns a satisfying valuation. | [2.8](module_02_EN.html#sat) |
| **satisfiable**<br>可满足的 | True under at least one valuation, or in at least one structure. | [2.4](module_02_EN.html#classify), [3.4](module_03_EN.html#validity) |
| **schematic variable**<br>图式变量 | A variable with a question mark, such as `?P`, which Isabelle may replace by any term of the right type; also called an unknown. | [7.2.1](module_07_EN.html#rules-thm) |
| **scope**<br>辖域 | The part of a formula in which a quantifier's variable refers to it. In Isabelle it extends as far to the right as possible. | [3.2.4](module_03_EN.html#scope) |
| **semantics**<br>语义 | A precise mathematical definition of what each statement or program of a language means; the second ingredient of a formal method. | [1.2](module_01_EN.html#formal), [14.2.2](module_14_EN.html#eval) |
| **semantics-preserving**<br>保持语义的 | An optimisation is semantics-preserving, or correct, if the optimised program has the same meaning as the original in every state. | [14.6.1](module_14_EN.html#folding) |
| **semi-decidable**<br>半可判定的 | Some algorithm answers "yes" for every input whose answer is yes, but may run for ever on the others. Validity in predicate logic is semi-decidable. | [3.9](module_03_EN.html#decidability) |
| **sentence**<br>语句 | A formula with no free variables; also called a closed formula. | [3.2.4](module_03_EN.html#scope) |
| **set**<br>集合 | A collection of elements, determined by its elements alone. In Isabelle every set has an element type, as in `nat set`. | [4.1.1](module_04_EN.html#sets-notation) |
| **set-builder notation**<br>描述法 | {x. P x}, the set of all x for which P x holds. | [4.1.1](module_04_EN.html#sets-notation) |
| **side condition**<br>附加条件 | An extra condition of a rule, such as the eigenvariable condition, or a premise of an introduction rule that does not mention the predicate being defined. | [6.6](module_06_EN.html#quantifiers), [11.6](module_11_EN.html#inductive) |
| **simp rule**<br>化简规则 | A theorem that the simplifier uses without being told. `[simp]` makes a lemma a simp rule. | [5.5.3](module_05_EN.html#lemmas), [9.2.3](module_09_EN.html#simp-rules) |
| **simp set**<br>化简规则集 | All the simp rules at a point of a theory: the equations of `fun` and `primrec`, the facts of `datatype` and the lemmas marked `[simp]`, but not definitions. | [9.2.3](module_09_EN.html#simp-rules) |
| **simplifier**<br>化简器 | Isabelle's rewriting engine, the method `simp`: it rewrites a goal with equations, from left to right, until it becomes `True` or no rule applies. | [1.7.3](module_01_EN.html#first-prove), [9.2.1](module_09_EN.html#rewriting) |
| **size**<br>大小 | The measure that `fun` tries first: for a natural number the number itself, for a list its length, and for a value of another datatype the number of its constructors that take arguments. | [8.7.2](module_08_EN.html#termination-messages) |
| **Skolem constant**<br>斯科伦常量 | In Nitpick's answer, a value it chose for a bound variable, such as the element at which a ∀ fails. | [3.4](module_03_EN.html#validity) |
| **Sledgehammer**<br>Sledgehammer | A tool that hands a goal and relevant library facts to external provers, and turns a proof one of them finds into an Isabelle proof that the kernel checks. | [9.8](module_09_EN.html#sledgehammer) |
| **SMT solver**<br>SMT 求解器 | A SAT solver extended with numbers, arrays and other data, such as Z3 and cvc5. | [1.3](module_01_EN.html#landscape), [2.8](module_02_EN.html#sat) |
| **sort (in Isabelle)**<br>类别 | A set of type classes, written {c₁, …, cₙ}. A type variable can be restricted to a sort, as in `'a::{one, plus}`. | [8.6.2](module_08_EN.html#classes) |
| **sort (in many-sorted logic)**<br>类别（多类逻辑中） | In a many-sorted logic, another word for type: each symbol's arguments and results have one. | [3.8](module_03_EN.html#types) |
| **soundness**<br>可靠性 | A proof system is sound if everything it derives is a logical consequence: Γ ⊢ A implies Γ ⊨ A. | [6.3](module_06_EN.html#soundness) |
| **specification**<br>规约 | A precise statement of what a system must do, without saying how. | [1.2](module_01_EN.html#formal), [12.1](module_12_EN.html#verify) |
| **stack**<br>栈 | A list of values that is used only at one end, its top. | [14.3](module_14_EN.html#machine) |
| **stack machine**<br>栈机 | A machine whose instructions take their operands from the top of a stack and leave their result there. | [14.3](module_14_EN.html#machine) |
| **stack underflow**<br>栈下溢 | An instruction that finds fewer values on the stack than it needs. | [14.3](module_14_EN.html#machine) |
| **standard rule**<br>标准规则 | The rule that `proof` with no method applies, chosen by the main connective of the goal, or an elimination rule for the facts passed to it. | [10.2.6](module_10_EN.html#shape-start) |
| **state**<br>状态 | What a system holds at one moment. For expressions, a function from variable names to values. | [13.1](module_13_EN.html#machines), [14.2.1](module_14_EN.html#syntax) |
| **state machine**<br>状态机 | A set of states, a set of initial states and a transition relation; also called a transition system. | [4.5.2](module_04_EN.html#reachability), [13.1](module_13_EN.html#machines) |
| **strengthen**<br>加强 | To prove a stronger claim, or invariant, than the one you want, so that the induction step goes through. | [11.2.3](module_11_EN.html#strengthen), [13.5.2](module_13_EN.html#strengthen-invar) |
| **strict order**<br>严格序 | A relation that is irreflexive and transitive, such as <. | [4.4.1](module_04_EN.html#partial-orders) |
| **strong induction**<br>强归纳法 | Induction in which the step may assume the claim for every smaller value; also called complete or course-of-values induction. | [5.6](module_05_EN.html#strong) |
| **structural induction**<br>结构归纳法 | Induction that follows how the values of a datatype are built: one case per constructor, with a hypothesis for each smaller part. | [5.5](module_05_EN.html#structural) |
| **structure**<br>结构 | A non-empty domain together with an interpretation of every symbol of the vocabulary; also called a model or an interpretation. | [3.3](module_03_EN.html#structures) |
| **structured proof**<br>结构化证明 | A proof written as a text of statements, each checked by Isabelle, that can be read without running it; in Isabelle, written in Isar. | [10.1](module_10_EN.html#why) |
| **stutter step**<br>停顿步 | A step of a concrete machine that the abstraction function maps to no change of the abstract state. | [13.7.1](module_13_EN.html#two-models) |
| **sub-formula**<br>子公式 | A formula at a node of another formula's parse tree, the formula itself included. | [2.2.1](module_02_EN.html#formation) |
| **subgoal**<br>子目标 | One of the goals a proof still has to prove, of the form `⋀x₁ … xₖ. ⟦H₁; …; Hₙ⟧ ⟹ C`. | [5.4.2](module_05_EN.html#induction-state), [7.3.2](module_07_EN.html#backward-rule) |
| **subset**<br>子集 | A ⊆ B: every element of A is an element of B. | [4.1.1](module_04_EN.html#sets-notation) |
| **substitution**<br>代入 | φ[t/x], φ with the term t for every free x; also the rule (=E), which replaces equals by equals. | [3.5.2](module_03_EN.html#substitution), [6.8](module_06_EN.html#equality) |
| **successor**<br>后继 | `Suc n`, the number n + 1. | [5.1.1](module_05_EN.html#peano) |
| **surjective**<br>满射的 | Every element of the codomain is a value: f[A] = B. Isabelle writes `surj f`. | [4.6.2](module_04_EN.html#inj-surj) |
| **symmetric**<br>对称的 | A relation R is symmetric if (x, y) ∈ R implies (y, x) ∈ R. | [4.2.3](module_04_EN.html#rel-props) |

<div class="section-anchor" id="g-t"></div>

### T

| Term | Meaning | Section |
|---|---|---|
| **tail**<br>尾部 | The rest xs of a list x # xs, after its head. | [5.2.1](module_05_EN.html#lists) |
| **tail recursion**<br>尾递归 | A function is tail-recursive when the recursive call is the last thing it does, so that it can run as a loop. | [11.1.1](module_11_EN.html#running-total) |
| **tautology**<br>重言式 | A formula true under every valuation; also called valid. | [2.4](module_02_EN.html#classify) |
| **temporal logic**<br>时序逻辑 | A logic whose operators speak about runs, such as □ P ("always P") and ◇ P ("eventually P"); model checkers check its formulas. | [13.8.1](module_13_EN.html#liveness) |
| **term**<br>项 | An expression that names an object: a variable, a constant, or a function applied to terms. In HOL every expression is a term, formulas included. | [3.2.1](module_03_EN.html#terms), [8.1.2](module_08_EN.html#terms) |
| **termination**<br>终止性 | Every evaluation of a function stops. `fun` accepts a recursive definition only after proving it, with a measure. | [5.7.1](module_05_EN.html#why-terminate) |
| **termination order**<br>终止序 | The measure, or lexicographic combination of measures, that `fun` reports after proving termination, such as `size <*mlex*> {}`. | [5.7.2](module_05_EN.html#measures), [8.7.2](module_08_EN.html#termination-messages) |
| **theorem**<br>定理 | A formula derivable without assumptions. In Isabelle, a proved statement, which only the kernel can create. | [6.2](module_06_EN.html#systems) |
| **theory**<br>理论 | An Isabelle file of definitions, statements and proofs, like a module in a programming language. Theory T lives in the file T.thy. | [1.7](module_01_EN.html#first) |
| **theory exports**<br>理论导出 | Files that belong to a theory, such as the code that `export_code` generates. The File Browser shows them under `isabelle-export:`. | [8.8](module_08_EN.html#codegen), [12.7](module_12_EN.html#export) |
| **this**<br>this | In Isar, the fact produced by the last step; `then` passes it to the next claim. | [10.3.1](module_10_EN.html#facts-then) |
| **topological sort**<br>拓扑排序 | A list of all elements in an order that respects a partial order, such as a schedule of tasks. | [4.4.2](module_04_EN.html#hasse) |
| **total (function)**<br>全函数 | A function is total if it has a value for every argument. Every HOL function is total. | [4.6.1](module_04_EN.html#fun-def), [5.7.1](module_05_EN.html#why-terminate) |
| **total (relation)**<br>完全的（关系） | A relation is total on A if any two different elements of A are related one way or the other. | [4.2.3](module_04_EN.html#rel-props) |
| **total order**<br>全序 | A partial order that is also total; also called a linear order (`linorder` in Isabelle). | [4.4.1](module_04_EN.html#partial-orders) |
| **trace**<br>轨迹 | A run written as the list of its events, with the states they lead to. | [13.1](module_13_EN.html#machines) |
| **trace (of the simplifier)**<br>化简跟踪 | The rewriting steps of the simplifier, one by one, as `using [[simp_trace]]` shows them. | [9.3.5](module_09_EN.html#tracing) |
| **transition relation**<br>迁移关系 | The relation of a state machine that says which state can follow which in one step. | [4.5.2](module_04_EN.html#reachability), [13.1](module_13_EN.html#machines) |
| **transitive**<br>传递的 | A relation R is transitive if (x, y) ∈ R and (y, z) ∈ R imply (x, z) ∈ R. | [4.2.3](module_04_EN.html#rel-props) |
| **transitive closure**<br>传递闭包 | R⁺, the pairs joined by a path of one or more R-steps. Isabelle writes `r⇧+`. | [4.5.1](module_04_EN.html#closure-def) |
| **truncated subtraction**<br>截断减法 | Subtraction on `nat`: m − n is 0 whenever m ≤ n. | [8.6.1](module_08_EN.html#nat-int) |
| **trusted base**<br>可信基 | Everything a verified result still relies on: the proof checker and the assumptions about the compiler, the hardware and the environment. | [1.2](module_01_EN.html#formal) |
| **truth table**<br>真值表 | A table with one row for each valuation of a formula's atoms, giving the formula's value in each row; n atoms give 2ⁿ rows. | [2.3](module_02_EN.html#truth-tables) |
| **Tseitin transformation**<br>Tseitin 变换 | Turns a formula into an equisatisfiable CNF that grows only in proportion to it, by giving each sub-formula a new atom as its name. | [2.7.2](module_02_EN.html#cnf-dnf) |
| **tuple**<br>元组 | A list (d₁, …, dₙ) of n elements, in order; a 2-tuple is a pair. | [3.3](module_03_EN.html#structures) |
| **type**<br>类型 | The kind of value a term stands for, such as `nat` or `'a list ⇒ nat`. Isabelle checks types before anything else. | [8.1.1](module_08_EN.html#types) |
| **type annotation**<br>类型标注 | `t :: τ` tells Isabelle that t has type τ, as in `value "2 + 3 :: nat"`. | [1.7.2](module_01_EN.html#first-compute), [8.1.2](module_08_EN.html#terms) |
| **type class**<br>类型类 | A named collection of types that provide certain operations, sometimes with laws, such as `plus`, `numeral` and `linorder`. | [8.6.2](module_08_EN.html#classes) |
| **type constructor**<br>类型构造子 | A name such as `list` or `option` that builds a type from other types; it is written after its arguments, as in `nat list`. | [8.1.1](module_08_EN.html#types) |
| **type inference**<br>类型推断 | Computing the type of every part of a term from the types of the constants in it. | [8.1.2](module_08_EN.html#terms) |
| **type unification**<br>类型合一 | Finding types that make two types equal. When it fails, Isabelle reports "Type unification failed". | [8.1.4](module_08_EN.html#type-errors) |
| **type variable**<br>类型变量 | A variable such as `'a`, read "alpha", that stands for any type. | [3.4](module_03_EN.html#validity), [8.1.1](module_08_EN.html#types) |

<div class="section-anchor" id="g-u"></div>

### U

| Term | Meaning | Section |
|---|---|---|
| **uncountable**<br>不可数的 | Not countable, such as the set of all sets of natural numbers, by Cantor's diagonal argument. | [4.7.4](module_04_EN.html#cantor) |
| **undecidable**<br>不可判定的 | No algorithm answers the question correctly for every input. Validity in predicate logic is undecidable (Church and Turing, 1936). | [3.9](module_03_EN.html#decidability) |
| **unification**<br>合一 | Making two terms identical by choosing values for their schematic variables. Isabelle does it whenever it applies a rule. | [7.3.4](module_07_EN.html#backward-unification) |
| **uninterpreted**<br>未解释的 | Declared without a definition, as with `consts`: Isabelle proves a lemma about such symbols only if it holds whatever they mean. | [3.8](module_03_EN.html#types) |
| **union**<br>并集 | A ∪ B, the elements that are in A or in B. | [4.1.2](module_04_EN.html#sets-ops) |
| **unit propagation**<br>单元传播 | In the DPLL procedure: if every literal of a clause but one is false, the remaining literal must be true, so set it. | [2.8](module_02_EN.html#sat) |
| **universal quantifier**<br>全称量词 | ∀: ∀x. φ says that φ holds whichever object x stands for. | [3.2.3](module_03_EN.html#quantifiers) |
| **universe**<br>全集 | The set of every element of a type. Isabelle calls it `UNIV`. | [4.1.1](module_04_EN.html#sets-notation) |
| **unsatisfiable**<br>不可满足的 | True under no valuation, or in no structure. | [2.4](module_02_EN.html#classify), [3.4](module_03_EN.html#validity) |
| **unspecified**<br>未指定的 | A value of a total function about which nothing is known, such as `hd []`; `value` stops with an exception on it. | [8.4.3](module_08_EN.html#patterns) |

<div class="section-anchor" id="g-v"></div>

### V

| Term | Meaning | Section |
|---|---|---|
| **vacuously true**<br>空真的 | An implication whose antecedent is false is true whatever its consequent is: it is vacuously true. | [2.3](module_02_EN.html#truth-tables) |
| **valid**<br>有效的 | True in every structure under every assignment; for a propositional formula, a tautology. | [2.4](module_02_EN.html#classify), [3.4](module_03_EN.html#validity) |
| **validation**<br>确认 | Checking that the specification describes what is actually wanted: "are we building the right product?". | [1.2](module_01_EN.html#formal) |
| **valuation**<br>赋值 | An assignment of a truth value, T or F, to each atom. | [2.3](module_02_EN.html#truth-tables) |
| **value**<br>值 | A term that no equation can rewrite any more: the result of an evaluation. | [5.1.3](module_05_EN.html#rewriting) |
| **variable capture**<br>变元捕获 | When a variable of a substituted term ends up bound by a quantifier, changing the meaning; renaming bound variables first avoids it. | [3.5.2](module_03_EN.html#substitution) |
| **variant**<br>变式 | A measure for a loop: a quantity that decreases at every step, which shows that the loop stops. | [5.8.1](module_05_EN.html#loop-invariant) |
| **verification**<br>验证 | Showing that an implementation meets its specification: "are we building the product right?". | [1.2](module_01_EN.html#formal) |
| **verified**<br>经过验证的 | A program is verified when its correctness theorem has been proved. | [12.1](module_12_EN.html#verify) |
| **vocabulary**<br>词汇表 | The non-logical symbols of a language, each with its arity: constants, function symbols and predicate symbols; also called a signature. | [3.2](module_03_EN.html#language) |

<div class="section-anchor" id="g-w"></div>

### W

| Term | Meaning | Section |
|---|---|---|
| **well-founded**<br>良基的 | A relation is well-founded if it has no infinite descending chain. Isabelle writes `wf r`. | [4.4.3](module_04_EN.html#well-founded) |
| **well-founded induction**<br>良基归纳法 | Induction along any well-founded relation; structural and strong induction are special cases. | [5.6](module_05_EN.html#strong) |
| **well-order**<br>良序 | A linear order with no infinite descending chain, such as < on `nat`. `less_induct` holds for it. | [11.8](module_11_EN.html#complete) |
| **witness**<br>见证 | An element that makes an ∃ true, or that shows that a ∀-property fails. | [3.3](module_03_EN.html#structures), [4.2.3](module_04_EN.html#rel-props) |
