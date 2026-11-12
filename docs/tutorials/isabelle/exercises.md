# Isabelle exercises

[Guide](index.md) · [Quick reference](reference.md) · [Download examples](examples/isabelle-tutorial.zip)

Try these after reading the guide. Use a copy of the files for experiments so you can return to the complete examples. `Exercise_Answers.thy` imports `Isabelle_Tutorial.thy` and contains every answer below.

## Exercise 1 Change the angle limit

Define `angle_ok_60` for integer angles between 0 and 60. Prove that an accepted angle is at most 60. Evaluate 60 and 90 to check your interpretation of the definition.

<details markdown="1"><summary>Show the definition and proof</summary>

<!-- checked: Exercise_Answers.thy -->

```isabelle
definition angle_ok_60 :: "int ⇒ bool" where
  "angle_ok_60 a ⟷ 0 ≤ a ∧ a ≤ 60"

lemma sixty_degree_guard_sound:
  "angle_ok_60 a ⟹ a ≤ 60"
  by (simp add: angle_ok_60_def)
```
The lower and upper bounds belong in the predicate. The lemma follows by unfolding it. A stronger invariant would retain both bounds in its conclusion.

</details>

## Exercise 2 Extract a guard condition

Prove that every operation admitted by `may_open` starts with an unlatched lid. You need no assumption about the target beyond the existing guard.

<details markdown="1"><summary>Show the proof</summary>

<!-- checked: Exercise_Answers.thy -->

```isabelle
lemma admitted_open_starts_unlatched:
  "may_open s target ⟹ ¬ lid_latched s"
  by (simp add: may_open_def)
```
</details>

## Exercise 3 Require a stationary object

Introduce a Boolean `moving` observation and a guard `stationary_open` requiring both `may_open s target` and a stationary object. Prove that this new guard implies `¬ moving`, and reuse the existing invariant theorem.

<details markdown="1"><summary>Show the definition and both proofs</summary>

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
The moving observation is a separate parameter in this exercise. A larger model can include it in its state record and define how observations and operations change it.

</details>

## Exercise 4 Withhold unresolved evidence

Using the `check_result` datatype, prove that any result other than `Supported` withholds permission. Reuse `permission_requires_support` instead of repeating its case analysis.

<details markdown="1"><summary>Show the proof</summary>

<!-- checked: Exercise_Answers.thy -->

```isabelle
lemma non_supported_withholds:
  "result ≠ Supported ⟹ ¬ permitted result"
  by (simp add: permission_requires_support)
```
</details>

## Exercise 5 Find a missing guard condition

In a copy, remove `angle_ok target` from `may_open`. Start with `demo_lid` and choose target 120. The starting invariant, latch and support conditions still hold, but the update breaks the invariant. Explain why automation cannot prove the original preservation statement for that weakened guard.

<details markdown="1"><summary>Show the concrete counterexample</summary>

<!-- checked: Exercise_Answers.thy -->

```isabelle
lemma unguarded_counterexample:
  "lid_invariant demo_lid ∧ ¬ lid_latched demo_lid ∧ lid_supported demo_lid ∧
    ¬ lid_invariant (set_lid_angle demo_lid 120)"
  by (simp add: demo_lid_def lid_invariant_def angle_ok_def set_lid_angle_def)
```
This lemma is proved in the original theory without changing `may_open`: it shows that the other starting conditions alone cannot justify the update. The false preservation statement belongs only in your experimental copy.

</details>

## Exercise 6 Find an invalid translation

Read `bad_lower` in the tutorial theory. It swaps the source angle and limit. For source angle 120 and limit 90, calculate source validity and checker acceptance. Explain how a correct numeric checker can accept an incorrectly translated input.

<details markdown="1"><summary>Show the faulty mapping and counterexample</summary>

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
definition bad_lower :: "source_lid ⇒ checker_lid" where
  "bad_lower m = ⦇checker_angle = source_limit m, checker_limit = source_angle m⦈"

lemma swapped_fields_can_admit_invalid_source:
  "¬ source_ok ⦇source_angle = 120, source_limit = 90⦈ ∧
    checker_accepts (bad_lower ⦇source_angle = 120, source_limit = 90⦈)"
  by (simp add: source_ok_def checker_accepts_def bad_lower_def)
```
The good translation satisfies `lower_preserves_satisfaction`. The faulty translation does not: the checker sees angle 90 and limit 120. Source-to-checker correctness is an additional obligation to correctness of the checker itself.

</details>

## Exercise 7 Use a preservation theorem

Prove only the soundness direction: acceptance of `lower m` implies source validity. Reuse the equivalence theorem already established in the tutorial.

<details markdown="1"><summary>Show the proof</summary>

<!-- checked: Exercise_Answers.thy -->

```isabelle
lemma translated_acceptance_is_source_valid:
  "checker_accepts (lower m) ⟹ source_ok m"
  by (simp add: lower_preserves_satisfaction)
```
An equivalence establishes two implications. Conservative analyses may support just one direction; the statement should match the property you can justify.

</details>

## Exercise 8 Practise induction

Prove that reversing a list does not change `step_count`. Reuse `step_count_append` in the inductive step.

<details markdown="1"><summary>Show the proof</summary>

<!-- checked: Exercise_Answers.thy -->

```isabelle
lemma step_count_reverse:
  "step_count (rev xs) = step_count xs"
  by (induction xs) (simp_all add: step_count_append)
```
The empty-list case simplifies immediately. Reversing `x # xs` produces `rev xs @ [x]`, so the append lemma and induction hypothesis establish the step.

</details>

## Check all answers

From the directory containing the downloaded `ROOT` file, run:

```bash
/path/to/isabelle build -D .
```

The session checks both theories and every answer. [Return to the guide](index.md#check-the-complete-example-session).
