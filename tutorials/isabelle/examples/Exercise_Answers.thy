theory Exercise_Answers
  imports Isabelle_Tutorial
begin

text \<open>Complete answers to the website exercises.\<close>

definition angle_ok_60 :: "int \<Rightarrow> bool" where
  "angle_ok_60 a \<longleftrightarrow> 0 \<le> a \<and> a \<le> 60"

lemma sixty_degree_guard_sound:
  "angle_ok_60 a \<Longrightarrow> a \<le> 60"
  by (simp add: angle_ok_60_def)

lemma admitted_open_starts_unlatched:
  "may_open s target \<Longrightarrow> \<not> lid_latched s"
  by (simp add: may_open_def)

definition stationary_open :: "lid_state \<Rightarrow> int \<Rightarrow> bool \<Rightarrow> bool" where
  "stationary_open s target moving \<longleftrightarrow> may_open s target \<and> \<not> moving"

lemma stationary_guard_requires_stop:
  "stationary_open s target moving \<Longrightarrow> \<not> moving"
  by (simp add: stationary_open_def)

lemma stationary_open_preserves_invariant:
  "stationary_open s target moving \<Longrightarrow> lid_invariant (set_lid_angle s target)"
  using opening_preserves_invariant
  by (auto simp: stationary_open_def)

lemma non_supported_withholds:
  "result \<noteq> Supported \<Longrightarrow> \<not> permitted result"
  by (simp add: permission_requires_support)

lemma unguarded_counterexample:
  "lid_invariant demo_lid \<and> \<not> lid_latched demo_lid \<and> lid_supported demo_lid \<and>
    \<not> lid_invariant (set_lid_angle demo_lid 120)"
  by (simp add: demo_lid_def lid_invariant_def angle_ok_def set_lid_angle_def)

lemma translated_acceptance_is_source_valid:
  "checker_accepts (lower m) \<Longrightarrow> source_ok m"
  by (simp add: lower_preserves_satisfaction)

lemma step_count_reverse:
  "step_count (rev xs) = step_count xs"
  by (induction xs) (simp_all add: step_count_append)

end
