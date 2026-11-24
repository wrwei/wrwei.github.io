---
template: formal-methods-zh.html
---

# Isabelle 模型验证练习

[用 Isabelle 学形式化方法](../../index_ZH.html) · [项目指南](index.md) · [速查表](reference.md) · [下载示例](../../../isabelle/examples/isabelle-tutorial.zip) · [English](../exercises.md){ hreflang=en }

读完指南后试做这些练习。请在文件副本中实验，方便随时回到原来的完整示例。`Exercise_Answers.thy` 导入 `Isabelle_Tutorial.thy` 并包含以下每个答案。

## 练习 1 修改角度上限 { #exercise-1-change-the-angle-limit }

为 0 到 60 之间的整数角度定义 `angle_ok_60`。证明被接受的角度至多为 60。求值 60 和 90 以检查你对定义的理解。

<details markdown="1"><summary>查看定义与证明</summary>

<!-- checked: Exercise_Answers.thy -->

```isabelle
definition angle_ok_60 :: "int ⇒ bool" where
  "angle_ok_60 a ⟷ 0 ≤ a ∧ a ≤ 60"

lemma sixty_degree_guard_sound:
  "angle_ok_60 a ⟹ a ≤ 60"
  by (simp add: angle_ok_60_def)
```
下界与上界应归入谓词。该引理通过展开谓词得证。更强的不变式会在其结论中同时保留这两个界。

</details>

## 练习 2 提取守卫条件 { #exercise-2-extract-a-guard-condition }

证明由 `may_open` 接受的每个操作都以未锁定的盖子开始。除了现有的守卫条件外，对目标无需任何假设。

<details markdown="1"><summary>查看证明</summary>

<!-- checked: Exercise_Answers.thy -->

```isabelle
lemma admitted_open_starts_unlatched:
  "may_open s target ⟹ ¬ lid_latched s"
  by (simp add: may_open_def)
```
</details>

## 练习 3 要求对象静止 { #exercise-3-require-a-stationary-object }

用布尔值 `moving` 表示对象是否在运动。定义守卫 `stationary_open`，要求 `may_open s target` 成立且对象静止。证明新守卫蕴涵 `¬ moving`，并复用已有的不变式保持定理。

<details markdown="1"><summary>查看定义与两条证明</summary>

<!-- checked: Exercise_Answers.thy -->

```isabelle
definition stationary_open :: "lid_state ⇒ int ⇒ bool ⇒ bool" where
  "stationary_open s target moving ⟷ may_open s target ∧ ¬ moving"

lemma stationary_guard_requires_stop:
  "stationary_open s target moving ⟹ ¬ moving"
  by (simp add: stationary_open_def)

lemma stationary_open_preserves_invariant:
  "stationary_open s target moving ⟹ lid_invariant (set_lid_angle s target)"
  using opening_preserves_invariant
  by (auto simp: stationary_open_def)
```
是否在运动是本练习中的一个独立参数。一个更大的模型可以将其包含在状态记录中，并定义观测和操作如何改变它。

</details>

## 练习 4 缺少证据时拒绝操作 { #exercise-4-withhold-unresolved-evidence }

利用`check_result`数据类型，证明除`Supported`外的任何结果均不授予权限。复用`permission_requires_support`而非重复其案例分析。

<details markdown="1"><summary>查看证明</summary>

<!-- checked: Exercise_Answers.thy -->

```isabelle
lemma non_supported_withholds:
  "result ≠ Supported ⟹ ¬ permitted result"
  by (simp add: permission_requires_support)
```
</details>

## 练习 5 找出遗漏的守卫条件 { #exercise-5-find-a-missing-guard-condition }

在副本中，从 `may_open` 移除 `angle_ok target`。从 `demo_lid` 开始并选择目标 120。初始角度合规、盖子未锁住、容器有支撑，但这次更新会破坏不变式。解释为何自动化无法证明该弱化守卫下的原始保持性陈述。

<details markdown="1"><summary>查看具体反例</summary>

<!-- checked: Exercise_Answers.thy -->

```isabelle
lemma unguarded_counterexample:
  "lid_invariant demo_lid ∧ ¬ lid_latched demo_lid ∧ lid_supported demo_lid ∧
    ¬ lid_invariant (set_lid_angle demo_lid 120)"
  by (simp add: demo_lid_def lid_invariant_def angle_ok_def set_lid_angle_def)
```
原理论无需修改 `may_open` 即可证明该引理。它说明，其余初始条件不足以保证这次更新保持不变式。该错误的保持性陈述仅存在于你的实验副本中。

</details>

## 练习 6 找出错误的转换 { #exercise-6-find-an-invalid-translation }

在教程理论中找到 `bad_lower`，它把源角度与上限对调。对源角度 120、上限 90 的例子，分别判断源模型是否合规，以及转换结果是否通过检查，并解释这种差异。

<details markdown="1"><summary>查看错误的映射与反例</summary>

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
definition bad_lower :: "source_lid ⇒ checker_lid" where
  "bad_lower m = ⦇checker_angle = source_limit m, checker_limit = source_angle m⦈"

lemma swapped_fields_can_admit_invalid_source:
  "¬ source_ok ⦇source_angle = 120, source_limit = 90⦈ ∧
    checker_accepts (bad_lower ⦇source_angle = 120, source_limit = 90⦈)"
  by (simp add: source_ok_def checker_accepts_def bad_lower_def)
```
对正确的转换，`lower_preserves_satisfaction` 给出等价性。错误转换后，检查器看到的是角度 90、上限 120。除了证明检查器本身的正确性，还需要证明源模型到检查器输入的转换正确。

</details>

## 练习 7 使用语义保持定理 { #exercise-7-use-a-preservation-theorem }

证明可靠性方向：如果 `lower m` 通过检查，那么源模型满足规约。请复用教程中已经证明的等价关系。

<details markdown="1"><summary>查看证明</summary>

<!-- checked: Exercise_Answers.thy -->

```isabelle
lemma translated_acceptance_is_source_valid:
  "checker_accepts (lower m) ⟹ source_ok m"
  by (simp add: lower_preserves_satisfaction)
```
等价关系确立两个蕴含方向。保守分析可能仅支持其中一个方向；该陈述应与可证明的性质相匹配。

</details>

## 练习 8 练习归纳证明 { #exercise-8-practise-induction }

证明反转列表不改变`step_count`。在归纳步骤中复用`step_count_append`。

<details markdown="1"><summary>查看证明</summary>

<!-- checked: Exercise_Answers.thy -->

```isabelle
lemma step_count_reverse:
  "step_count (rev xs) = step_count xs"
  by (induction xs) (simp_all add: step_count_append)
```
空列表情况立即化简。对 `x # xs` 进行反转得到 `rev xs @ [x]`，再用列表拼接引理和归纳假设，即可完成归纳步骤。

</details>

## 检查全部解答 { #check-all-answers }

从包含下载的 `ROOT` 文件的目录运行：

```bash
/path/to/isabelle build -D .
```

会话检查两个理论以及每个答案。[返回指南](index.md#check-the-complete-example-session)。
