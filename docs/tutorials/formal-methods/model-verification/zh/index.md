---
template: formal-methods-zh.html
---

# Isabelle 模型验证

[用 Isabelle 学形式化方法](../../index_ZH.html) · [练习](exercises.md) · [速查表](reference.md) · [下载全部示例](../../../isabelle/examples/isabelle-tutorial.zip) · [English](../index.md){ hreflang=en }

本项目用 Isabelle/HOL 验证一个简单的盖子模型。你将定义角度限制，规定何时允许打开盖子，证明操作保持不变式，并检查两种模型表示之间的转换是否保持语义。

本项目用到[模块 13](../../module_13_ZH.html#invariants)中的带守卫操作和不变式。项目中的语义保持证明采用与[模块 14](../../module_14_ZH.html#proof)的编译器正确性定理相同的思路。

掌握基本编程知识即可开始。初学时请顺序阅读各节。复习时可用目录定位主题，也可查阅[速查表](reference.md)。

## 启动 Isabelle 并打开理论文件 { #start-isabelle-and-open-a-theory }

本指南中的示例使用 **Isabelle2025-2**。[官方安装页面](https://isabelle.in.tum.de/website-Isabelle2025-2/installation.html) 提供了适用于 macOS、Windows 和 Linux 的应用程序。请在 Isabelle/jEdit 中打开理论文件，这样编辑器才能调用证明器检查文档。

1. 下载并解压 [示例压缩包](../../../isabelle/examples/isabelle-tutorial.zip)。
2. 在 Isabelle/jEdit 中打开 `Isabelle_Tutorial.thy`。
3. 打开 **Output**（输出）面板并勾选 **Proof state**（证明状态）。
4. 将光标置于定义或引理处。在继续之前，阅读该命令的输出。

压缩包还包含练习解答 `Exercise_Answers.thy` 和用于定义会话的 `ROOT` 文件。在 Isabelle/jEdit 中打开教程理论即可开始学习。要集中检查全部文件，可以构建该会话。

Isabelle 用**理论**（theory）组织定义和证明。文件头给出理论的名称及其导入的理论。声明写在 `begin` 与 `end` 之间：

```isabelle
theory Isabelle_Tutorial
  imports Main
begin

(* Definitions and proofs belong here. *)

end
```

文件必须命名为 `Isabelle_Tutorial.thy`。`Main` 提供标准 HOL 理论。请把新示例放在最后一个 `end` 之前。下载的理论文件已包含本项目的完整示例。

Isabelle 在编辑时处理文档。若出现错误，应从最早失败的命令开始排查：后续失败可能仅依赖于未被接受的早期定义。[官方介绍](https://isabelle.in.tum.de/website-Isabelle2025-2/dist/Isabelle2025-2/doc/prog-prove.pdf) 解释了该理论结构与证明状态。

## 定义性质并求值 { #define-a-property-and-evaluate-examples }

HOL 是一种类型化逻辑。函数具有输入和输出类型，其数学定义描述了结果。为 0 到 90 度之间的整数角度定义谓词：

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
definition angle_ok :: "int ⇒ bool" where
  "angle_ok a ⟷ 0 ≤ a ∧ a ≤ 90"

value "angle_ok 60"
value "angle_ok 120"
value "angle_ok (-10)"
```
`int ⇒ bool` 表示从整数到真值的函数。`angle_ok a` 将该函数应用于 `a`。`⟷` 后的表达式精确陈述了其成立的条件。度数是我们赋予这些整数的解释；类型 `int` 本身不强制单位。

三个`value`命令计算各个案例：60 是允许的，120 超出上界，−10 超出下界。它们说明了定义。一般定理将涵盖满足其前提的每个输入。

| 符号 | 将其读作 |
|---|---|
| `x :: int` | `x` 具有整数类型 |
| `int ⇒ bool` | 从整数到布尔值的函数 |
| `f x` | 将 `f` 应用于 `x` |
| `P ∧ Q`, `P ∨ Q`, `¬ P` | 合取、析取、否定 |
| `P ⟷ Q` | `P` 当且仅当 `Q` 成立 |
| `P ⟹ Q` | 由假设 `P` 得出结论 `Q` |
| `∀x. P x`, `∃x. P x` | 对每个 `x`，`P x` 成立。存在某个 `x`，使 `P x` 成立。 |

`nat` 表示包括零的自然数，`int` 表示所有整数，包括负整数。`nat` 类型的减法结果不会为负，因此应根据模型选择类型。`real` 表示数学上的实数。为便于证明，本项目用整数表示角度。

可下载的源代码存储了 Isabelle 符号转义，例如 `\<le>`。Isabelle/jEdit 将它们渲染为数学符号，例如 `≤`。

## 证明所有允许的角度都满足该性质 { #prove-a-statement-for-every-admitted-angle }

`lemma` 命令陈述一个命题并要求给出证明。下面的引理直接由定义得出：

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
lemma angle_guard_sound:
  assumes "angle_ok a"
  shows "0 ≤ a ∧ a ≤ 90"
  using assms
  unfolding angle_ok_def
  by simp
```
变量`a`是任意的。该结果涵盖假设成立的所有整数。

- `assumes` 引入前提。
- `shows` 给出了所需的结论。
- `using assms` 使前提对证明可用。
- `unfolding angle_ok_def` 用其定义表达式替换命名谓词。
- `by simp` 通过化简完成。

定义`angle_ok`会生成名为`angle_ok_def`的定理。定义引入模型，引理确立该模型的一个推论。此处推论被刻意设为直接可得，以便展示证明机制。

为了证明单个具体实例，该文件还包含：

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
lemma sixty_is_allowed:
  "angle_ok 60"
  by (simp add: angle_ok_def)
```
将证明读作一系列有理由的步骤。证明方法 `simp` 进行重写和化简；它不理解“打开盖子”的英语意图。该含义必须由你选择的定义和陈述来表示。

## 定义状态与操作契约 { #define-state-and-an-operation-contract }

**记录**（record）把描述对象的多个属性组织在一起，每个字段都有自己的类型。这里用三个字段表示盖子的角度、是否锁住及容器是否有支撑：

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
record lid_state =
  lid_angle :: int
  lid_latched :: bool
  lid_supported :: bool

definition lid_invariant :: "lid_state ⇒ bool" where
  "lid_invariant s ⟷ angle_ok (lid_angle s)"

definition may_open :: "lid_state ⇒ int ⇒ bool" where
  "may_open s target ⟷
    lid_invariant s ∧ ¬ lid_latched s ∧
    lid_supported s ∧ angle_ok target"

definition set_lid_angle :: "lid_state ⇒ int ⇒ lid_state" where
  "set_lid_angle s target = s⦇lid_angle := target⦈"
```
`lid_invariant s` 是我们希望状态 `s` 满足的性质。`may_open s target` 是操作的守卫条件。它要求当前状态满足不变式、盖子未锁住、容器有支撑，并且目标角度在允许的范围内。

`set_lid_angle s target` 返回一个更改了一个字段的记录。语法 `s⦇lid_angle := target⦈` 保留其他字段。该函数是数学状态更新；守卫单独定义。

下面的不变式保持定理把守卫与状态更新联系起来：

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
lemma opening_preserves_invariant:
  assumes "may_open s target"
  shows "lid_invariant (set_lid_angle s target)"
  using assms
  by (auto simp: may_open_def lid_invariant_def set_lid_angle_def)
```
守卫条件成立时，更新后的状态满足角度不变式。守卫检查了目标角度，更新则把该值写入角度字段。实际执行程序需要先检查守卫，再执行更新。

这条定理只涉及一次瞬时状态迁移。要证明运动全程的角度合规，还需要为实际盖子、运动轨迹和跟踪轨迹的控制器建立模型并提供证据。

### 试用守卫条件 { #explore-a-concrete-guard }

改变输入后尝试更新，再把具体的守卫结果与上面的一般定理对照。

<link rel="stylesheet" href="../assets/guard.css">
<div class="isabelle-explorer" data-isabelle-explorer lang="zh-CN">
  <p class="isabelle-explorer-intro"><strong>角度范围为 0° 至 90°。</strong> 这个浏览器演示计算守卫条件在具体输入下的结果。可下载的理论文件中包含由 Isabelle 检查的一般定理。</p>
  <form data-guard-form>
    <div class="isabelle-inputs">
      <label>当前角度（度） <input name="current" type="number" min="-180" max="180" step="1" value="0" required></label>
      <label>目标角度（度） <input name="target" type="number" min="-180" max="180" step="1" value="60" required></label>
    </div>
    <div class="isabelle-flags">
      <label><input name="latched" type="checkbox"> 盖子已锁住</label>
      <label><input name="supported" type="checkbox" checked> 容器有支撑</label>
    </div>
    <div class="isabelle-actions"><button type="submit">尝试打开</button><button type="button" data-guard-reset>重置示例</button></div>
  </form>
  <div class="isabelle-result" aria-live="polite" aria-atomic="true">
    <p data-guard-summary>启用 JavaScript 可运行此示例，也可以在 Isabelle 中对相同的输入求值。</p>
    <ul data-guard-checks></ul>
    <p data-guard-effect></p>
  </div>
  <p>将这段表达式复制到 Isabelle 中：</p>
  <pre><code data-guard-expression>value "may_open demo_lid 60"</code></pre>
</div>
<script src="../assets/guard.js" defer></script>

试着将目标设为 120°、锁住盖子或撤去支撑。条件为假时，演示会拒绝更新。改变输入只是在检验具体例子，定理另有一般性的证明。

## 阅读结构化证明 { #read-a-structured-proof }

**Isar** 是 Isabelle 中用于编写带有命名假设和中间事实的证明的语言。下一个证明使推理过程显式化：

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
lemma admitted_target_is_in_range:
  assumes guard: "may_open s target"
  shows "0 ≤ target ∧ target ≤ 90"
proof -
  have target_allowed: "angle_ok target"
    using guard
    by (auto simp: may_open_def)
  from target_allowed show ?thesis
    by (simp add: angle_ok_def)
qed
```
`guard` 命名假设。`have` 确立中间事实。`from` 选择要使用的事实，`show` 处理当前目标，`?thesis` 代表该目标。`qed` 关闭结构化证明。这种风格有助于审查者理解结论为何成立。[Isar 参考手册](https://isabelle.in.tum.de/website-Isabelle2025-2/dist/Isabelle2025-2/doc/isar-ref.pdf) 详细解释了命令和证明上下文。

对于较大的论证，首先用通常的数学语言写出其预期步骤，然后为每个重要步骤命名并在 Isar 中证明它。非常简短的证明可以保持为单个 `by` 命令。

## 使用数据类型与归纳法 { #use-datatypes-and-induction }

数据类型可以明确列出可能的取值。这里的检查结果有三种，分别表示证据支持、证据反对和证据尚不足以判断：

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
datatype check_result = Supported | Unsupported | Unknown

fun permitted :: "check_result ⇒ bool" where
  "permitted Supported = True" |
  "permitted Unsupported = False" |
  "permitted Unknown = False"

lemma unknown_withholds:
  "¬ permitted Unknown"
  by simp

lemma permission_requires_support:
  "permitted result ⟷ result = Supported"
  by (cases result) simp_all
```
用 `fun` 分情形定义 `permitted`。只有 `Supported` 才允许执行。遇到 `Unknown` 时先拒绝操作，但这并不表明要求已被证伪。`cases result` 分别考虑每个构造子，`simp_all` 化简得到的所有子目标。

对于递归结构，归纳法使有限证明能够覆盖任意大的实例。此处 `step_count` 计算抽象序列的元素数量：

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
fun step_count :: "'a list ⇒ nat" where
  "step_count [] = 0" |
  "step_count (x # xs) = Suc (step_count xs)"

lemma step_count_append:
  "step_count (xs @ ys) = step_count xs + step_count ys"
  by (induction xs) auto
```
`[]` 是空列表，`x # xs` 在头部添加元素，`Suc` 是后继，`@` 连接列表。归纳法将证明分解为空列表情形和基于 `xs` 的性质并建立 `x # xs` 性质的步骤。

这个引理说明如何计算操作序列的长度。若要证明机器人协议保持不变式，还要定义迁移关系、各迁移的守卫与效果，并对允许的步骤作归纳。

## 证明转换保持语义 { #prove-that-a-translation-preserves-meaning }

源模型与检查器可能使用不同的表示。应直接在源模型上定义要验证的性质，再另行定义转换。在这个例子中，两种表示都有角度和角度上限：

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
record source_lid =
  source_angle :: int
  source_limit :: int

record checker_lid =
  checker_angle :: int
  checker_limit :: int

definition source_ok :: "source_lid ⇒ bool" where
  "source_ok m ⟷
    0 ≤ source_angle m ∧ source_angle m ≤ source_limit m"

definition lower :: "source_lid ⇒ checker_lid" where
  "lower m = ⦇checker_angle = source_angle m, checker_limit = source_limit m⦈"

definition checker_accepts :: "checker_lid ⇒ bool" where
  "checker_accepts c ⟷
    0 ≤ checker_angle c ∧ checker_angle c ≤ checker_limit c"

theorem lower_preserves_satisfaction:
  "checker_accepts (lower m) ⟷ source_ok m"
  by (simp add: checker_accepts_def lower_def source_ok_def)
```
`lower` 将源模型的字段映射到检查器的字段。对于这个映射和这两个数值谓词，定理给出等价关系。较弱的单向定理只需要说明：转换后的输入一旦被接受，源模型就满足原性质。

错误的字段映射即使在校验器行为正确的情况下也可能使连接失效。该文件定义了`bad_lower`，它交换角度和极限，并证明了一个具体的反例：源角度为 120 且极限为 90 的情况是无效的，但交换后的校验器输入却通过了。在[练习 6](exercises.md#exercise-6-find-an-invalid-translation)中探索它。

对于链接的工程模型，一个合适的语义保持关系可能还要纳入对象标识、参与者角色、单位、坐标系、模型版本和证据假设。关于编码的检查器输入的定理本身并不能证明解析器或数据库适配器构造了正确的输入。说明形式关系从何处开始，它保留了哪些性质，以及哪些外部假设仍然有效。

## 了解 Isabelle/UTP 的作用 { #place-isabelle-utp-in-the-picture }

Isabelle/HOL 是本指南中使用的逻辑基础。**Isabelle/UTP** 在 HOL 之上构建，提供用于程序和建模语言的可重用语义理论。它有助于表达观测之间的关系、契约、组合与精化。[Isabelle/UTP 项目](https://isabelle-utp.york.ac.uk/home) 及其[形式化证明档案条目](https://isa-afp.org/entries/UTP.html) 解释了该框架。

这里关于 `lower` 的定理可以直接在 HOL 中表达。当更大的开发受益于既有的语义结构和定律时，UTP 变得有用。精化陈述要明确规约、实现、观测内容和关系。关系的方向应体现所要求的行为包含关系。若要把结论用于实物系统，还需要说明观测量与实际系统之间的联系。

在添加 UTP 依赖之前，先完成 HOL 练习。它们确立了可迁移的习惯：精确的类型、显式的假设、小型可复用的引理以及对结果的清晰解释。

## 检查完整示例会话 { #check-the-complete-example-session }

进入解压后的示例目录并运行：

```bash
/path/to/isabelle build -D .
```

`ROOT` 定义了 `Isabelle_Web_Tutorial` 会话并列出所有理论。构建过程同时检查教程与所有习题解答。修改定义后需重新运行并检查受影响的证明。[证明检查记录](../../../isabelle/examples/proof-status.json)

当证明失败时，首先询问该命题是否为真，然后检查类型、可用假设以及需要展开的定义，使用[速查表](reference.md)中的证明方法和常见错误，并通过[练习](exercises.md)进行练习。

## 延伸阅读 { #further-reading }

- [Isabelle/HOL 中的编程与证明](https://isabelle.in.tum.de/website-Isabelle2025-2/dist/Isabelle2025-2/doc/prog-prove.pdf)：类型与定义、化简、归纳、逻辑与结构化证明。
- [Isabelle/Isar 参考手册](https://isabelle.in.tum.de/website-Isabelle2025-2/dist/Isabelle2025-2/doc/isar-ref.pdf)。可查阅命令和证明语言。
- [Isabelle2025-2 文档](https://isabelle.in.tum.de/website-Isabelle2025-2/documentation.html): 安装、IDE、代码生成与证明工具。
- [Isabelle/UTP](https://isabelle-utp.york.ac.uk/home)：在 HOL 基础之后的语义理论工程。
