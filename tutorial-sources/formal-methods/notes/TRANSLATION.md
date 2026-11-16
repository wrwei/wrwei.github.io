# Translating the Formal Methods series into Simplified Chinese

The Chinese edition is a faithful, fluent translation of the English one, for the same readers:
beginners in logic and proof. It is not a summary: every explanation, box, table, exercise, solution
and quiz question is translated. `src/zh/module_01.md` and `src/zh/index.md` are the reference
translations; match them.

## 1. What stays exactly as it is

`node tools/check.mjs` compares each Chinese page with the English one and fails if these differ:

- every ` ```isabelle `, ` ```output `, ` ```prooftree `, ` ```truthtable ` and ` ```terminal ` block,
  including its first line (`isabelle fails`, `output state` …), byte for byte. Isabelle text,
  Isabelle's messages, formulas in proof trees and truth tables stay as they are;
- every `## … {#id}` and `### … {#id}` id, and their order;
- `::: figure id=…` and `::: widget name=…`, in the same order (captions are translated; for an
  `image=` figure, translate the `alt="…"` text and keep `image=`);
- the OS tab names `::: tab Windows`, `::: tab macOS`, `::: tab Linux`;
- exercises: same ids and stars, same order; every task and solution translated;
- the numbers of definition, example, fact, isabelle, trouble and solution boxes;
- the quiz: same questions in the same order, the same option marked `[x]`;
- the front matter `minutes`, `part`, `imports` and the number of `goals`.

Mathematics in `$…$` stays as it is, except words inside `\text{…}` or `\mathit{…}` that are English
prose (translate those only if they are not names; `\mathit{sorted}` is a name and stays).

Links between the series' pages change language: `module_04_EN.html` becomes `module_04_ZH.html`,
`cheatsheet_EN.html` becomes `cheatsheet_ZH.html`. Links to the site's other series also change:
`../math/module_02_EN.html` becomes `../math/module_02_ZH.html`, `../math/index.html` becomes
`../math/index_ZH.html`. External links stay.

## 2. What readers see on screen

Isabelle/jEdit has an English interface, and Isabelle's messages are English. So:

- keep an English label in bold and give a Chinese gloss in full-width brackets the first time it
  appears in a module: **Output**（输出）面板, **Proof state**（证明状态）复选框, **File → Save As…**
  （文件 → 另存为）. After that, the English label alone;
- Isabelle's messages quoted in prose stay in English, with a translation the first time:
  “Failed to finish proof”（未能完成证明）;
- the page's own buttons and box labels are Chinese on Chinese pages (the build adds them): name them in
  Chinese in the text: **复制** (Copy), **如果出了问题** (the trouble box), **在 Isabelle 中检验** (the
  Isabelle box), **查看解答** (Show solution); widgets show Chinese buttons on Chinese pages.

## 3. Terms

Use these everywhere. At a term's first use in a module, add the English in brackets:
重言式（tautology）. After that, Chinese only. Not in titles, leads or goals.

| English | 中文 |
|---|---|
| formal method(s) | 形式化方法 |
| formal / formalise | 形式化的 / 形式化 |
| specification / formal specification | 规约 / 形式化规约 |
| implementation | 实现 |
| verification / validation | 验证 / 确认 |
| proof / prove | 证明 |
| proof assistant | 证明助手 |
| interactive theorem proving | 交互式定理证明 |
| (automatic) theorem prover | （自动）定理证明器 |
| model checking / model checker | 模型检测 / 模型检测器 |
| SAT solving / SMT solving / solver | SAT 求解 / SMT 求解 / 求解器 |
| testing / property-based testing | 测试 / 基于性质的测试 |
| kernel | 内核 |
| trusted base | 可信基 |
| sound / soundness | 可靠的 / 可靠性 |
| complete / completeness | 完备的 / 完备性 |
| theorem / lemma | 定理 / 引理 |
| proposition / propositional logic | 命题 / 命题逻辑 |
| predicate / predicate logic / first-order logic | 谓词 / 谓词逻辑 / 一阶逻辑 |
| higher-order logic | 高阶逻辑 |
| connective | 联结词 |
| parse tree / sub-formula | 语法树 / 子公式 |
| conjunction / disjunction / negation | 合取 / 析取 / 否定 |
| implication / biconditional (iff) | 蕴涵 / 双条件（当且仅当） |
| truth table / truth value / valuation | 真值表 / 真值 / 赋值 |
| tautology / contradiction | 重言式 / 矛盾式 |
| satisfiable / valid | 可满足的 / 有效的 |
| logical consequence | 逻辑推论 |
| logical equivalence | 逻辑等价 |
| argument form | 论证形式 |
| normal form, NNF, CNF, DNF | 范式，否定范式，合取范式，析取范式 |
| quantifier, universal, existential | 量词，全称量词，存在量词 |
| free / bound variable | 自由变元 / 约束变元 |
| scope | 辖域 |
| term | 项 |
| structure, domain, interpretation | 结构，论域，解释 |
| model / countermodel / counterexample | 模型 / 反模型 / 反例 |
| substitution / variable capture | 代入 / 变元捕获 |
| decidable / undecidable / semi-decidable | 可判定的 / 不可判定的 / 半可判定的 |
| set, element, subset, power set | 集合，元素，子集，幂集 |
| union, intersection, difference, complement | 并集，交集，差集，补集 |
| Cartesian product, tuple, pair | 笛卡儿积，元组，有序对 |
| relation; reflexive, symmetric, antisymmetric, transitive | 关系；自反，对称，反对称，传递 |
| equivalence relation, equivalence class, partition | 等价关系，等价类，划分 |
| partial order, total order, well-founded | 偏序，全序，良基的 |
| closure, transitive closure, reachability | 闭包，传递闭包，可达性 |
| function; injective, surjective, bijective; inverse; composition | 函数；单射，满射，双射；逆；复合 |
| cardinality, countable | 基数，可数 |
| induction; mathematical, strong, structural induction | 归纳；数学归纳法，强归纳法，结构归纳法 |
| base case / step case / induction hypothesis | 基础情形 / 归纳步骤 / 归纳假设 |
| recursion / recursive definition | 递归 / 递归定义 |
| recursive case / base case (of a definition) | 递归情形 / 基础情形 |
| equation, defining equation (of a function) | 等式，定义等式（not 方程） |
| constructor / pattern / successor | 构造子 / 模式 / 后继 |
| head / tail (of a list); node; total function | 头部 / 尾部；结点；全函数 |
| simplification rule (simp rule) | 化简规则 |
| termination order / lexicographic order | 终止序 / 字典序 |
| complete (course-of-values) induction / well-founded induction | 完全归纳法（累积归纳法） / 良基归纳法 |
| termination / measure | 终止性 / 度量 |
| invariant | 不变式 |
| natural deduction | 自然演绎 |
| introduction rule / elimination rule | 引入规则 / 消去规则 |
| derivation / derivable | 推导 / 可推导的 |
| assumption / discharge (an assumption) | 假设 / 解除（假设） |
| proof by contradiction | 反证法 |
| proof state, goal, subgoal | 证明状态，目标，子目标 |
| proof method | 证明方法 |
| simplifier / rewriting / rewrite rule | 化简器 / 重写 / 重写规则 |
| theory (Isabelle) | 理论 |
| inner syntax / outer syntax | 内层语法 / 外层语法 |
| type, type variable, type class | 类型，类型变量，类型类 |
| datatype | 数据类型 |
| schematic variable / unification | 图式变量 / 合一 |
| meta-logic / object logic | 元逻辑 / 对象逻辑 |
| structured proof | 结构化证明 |
| state machine, state, transition | 状态机，状态，迁移 |
| reachable state | 可达状态 |
| refinement / abstraction function | 精化 / 抽象函数 |
| compiler / stack machine | 编译器 / 栈机 |
| code generation | 代码生成 |
| trace / counterexample trace | 轨迹 / 反例轨迹 |
| cheat sheet / troubleshooting / glossary | 速查表 / 问题排查 / 术语表 |

Names stay in English: Isabelle, Isabelle/HOL, Isabelle/jEdit, Isabelle/Pure, HOL, Isar, LCF, ML,
Quickcheck, Nitpick, Sledgehammer, Rocq, Coq, Lean, HOL4, ACL2, seL4, CompCert, TLA+, Z3, cvc5, SAT, SMT,
and Isabelle's commands, methods and lemma names (`lemma`, `simp`, `conjI` …).

## 4. Style

- Natural, friendly Chinese for beginners, as a good Chinese textbook would write it, not word for
  word. Use 你. Keep the English edition's short sentences and direct instructions.
- Full-width punctuation in Chinese text: ，。：；？！“”（）、. Half-width inside code, formulas,
  numbers and English words.
- A space between Chinese characters and Latin letters, digits or inline code: 用 `simp` 证明；第 3 节；
  150 分钟. No space next to full-width punctuation.
- Each Chinese paragraph is one line in the source: a line break between Chinese characters shows as a
  space.
- English italics become bold in Chinese text.
- Logic read aloud: “∀x. P x” 读作“对所有 x，P x 成立”; “A ⟶ B” 读作“如果 A，那么 B” (or “A 蕴涵 B”).
- Section headings: `## 小结 {#summary}`, `## 练习 {#exercises}`, `## 自测题 {#quiz}`.
- Module titles are short: "Propositional logic" → 命题逻辑.
- A Chinese page may add a short sentence of its own where Chinese readers need it (for example, that
  Isabelle's interface has no Chinese version). It may not add or remove blocks, boxes, tabs, figures
  or quiz questions.

## 5. Check

```terminal
$ node tools/check.mjs
$ node tools/build.mjs
```

Fix every error that concerns your files. Then screenshot the page
(`node tools/shot.mjs out/site/module_NN_ZH.html --out out/shots/zh-mNN --pages 40`) and look at it.
