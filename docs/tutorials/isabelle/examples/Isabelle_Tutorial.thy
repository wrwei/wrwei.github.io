theory Isabelle_Tutorial
  imports Main
begin

section \<open>1. Definitions and concrete evaluation\<close>

text \<open>
  This standalone teaching theory uses integer degrees and instantaneous state
  updates. It is a teaching model and does not model
  sensing, continuous motion, or a physical controller.
\<close>

definition angle_ok :: "int \<Rightarrow> bool" where
  "angle_ok a \<longleftrightarrow> 0 \<le> a \<and> a \<le> 90"

value "angle_ok 60"
value "angle_ok 120"
value "angle_ok (-10)"

lemma sixty_is_allowed:
  "angle_ok 60"
  by (simp add: angle_ok_def)

lemma angle_guard_sound:
  assumes "angle_ok a"
  shows "0 \<le> a \<and> a \<le> 90"
  using assms
  unfolding angle_ok_def
  by simp

section \<open>2. A state record and an operation\<close>

record lid_state =
  lid_angle :: int
  lid_latched :: bool
  lid_supported :: bool

definition lid_invariant :: "lid_state \<Rightarrow> bool" where
  "lid_invariant s \<longleftrightarrow> angle_ok (lid_angle s)"

definition may_open :: "lid_state \<Rightarrow> int \<Rightarrow> bool" where
  "may_open s target \<longleftrightarrow>
    lid_invariant s \<and> \<not> lid_latched s \<and>
    lid_supported s \<and> angle_ok target"

definition set_lid_angle :: "lid_state \<Rightarrow> int \<Rightarrow> lid_state" where
  "set_lid_angle s target = s\<lparr>lid_angle := target\<rparr>"

definition demo_lid :: lid_state where
  "demo_lid = \<lparr>lid_angle = 0, lid_latched = False, lid_supported = True\<rparr>"

value "may_open demo_lid 60"
value "may_open demo_lid 120"

lemma opening_preserves_invariant:
  assumes "may_open s target"
  shows "lid_invariant (set_lid_angle s target)"
  using assms
  by (auto simp: may_open_def lid_invariant_def set_lid_angle_def)

lemma opening_preserves_support:
  "lid_supported (set_lid_angle s target) = lid_supported s"
  by (simp add: set_lid_angle_def)

lemma unguarded_update_can_break_invariant:
  "\<not> lid_invariant (set_lid_angle s 120)"
  by (simp add: lid_invariant_def set_lid_angle_def angle_ok_def)

section \<open>3. A readable Isar proof\<close>

lemma admitted_target_is_in_range:
  assumes guard: "may_open s target"
  shows "0 \<le> target \<and> target \<le> 90"
proof -
  have target_allowed: "angle_ok target"
    using guard
    by (auto simp: may_open_def)
  from target_allowed show ?thesis
    by (simp add: angle_ok_def)
qed

section \<open>4. Datatypes and case analysis\<close>

datatype check_result = Supported | Unsupported | Unknown

fun permitted :: "check_result \<Rightarrow> bool" where
  "permitted Supported = True" |
  "permitted Unsupported = False" |
  "permitted Unknown = False"

lemma unknown_withholds:
  "\<not> permitted Unknown"
  by simp

lemma permission_requires_support:
  "permitted result \<longleftrightarrow> result = Supported"
  by (cases result) simp_all

section \<open>5. A tiny satisfaction-preservation example\<close>

text \<open>
  Two representations have independently stated numeric predicates. This
  deliberately simple field mapping illustrates a preservation statement.
  It does not prove an Ecore parser, an actual extraction, units, reference
  resolution, or physical applicability. No research contribution is claimed.
\<close>

record source_lid =
  source_angle :: int
  source_limit :: int

record checker_lid =
  checker_angle :: int
  checker_limit :: int

definition source_ok :: "source_lid \<Rightarrow> bool" where
  "source_ok m \<longleftrightarrow>
    0 \<le> source_angle m \<and> source_angle m \<le> source_limit m"

definition lower :: "source_lid \<Rightarrow> checker_lid" where
  "lower m = \<lparr>checker_angle = source_angle m, checker_limit = source_limit m\<rparr>"

definition checker_accepts :: "checker_lid \<Rightarrow> bool" where
  "checker_accepts c \<longleftrightarrow>
    0 \<le> checker_angle c \<and> checker_angle c \<le> checker_limit c"

theorem lower_preserves_satisfaction:
  "checker_accepts (lower m) \<longleftrightarrow> source_ok m"
  by (simp add: checker_accepts_def lower_def source_ok_def)

definition bad_lower :: "source_lid \<Rightarrow> checker_lid" where
  "bad_lower m = \<lparr>checker_angle = source_limit m, checker_limit = source_angle m\<rparr>"

lemma swapped_fields_can_admit_invalid_source:
  "\<not> source_ok \<lparr>source_angle = 120, source_limit = 90\<rparr> \<and>
    checker_accepts (bad_lower \<lparr>source_angle = 120, source_limit = 90\<rparr>)"
  by (simp add: source_ok_def checker_accepts_def bad_lower_def)

section \<open>6. An optional first induction\<close>

fun step_count :: "'a list \<Rightarrow> nat" where
  "step_count [] = 0" |
  "step_count (x # xs) = Suc (step_count xs)"

lemma step_count_append:
  "step_count (xs @ ys) = step_count xs + step_count ys"
  by (induction xs) auto

text \<open>
  Exercises and complete solutions accompany this theory. Try extending the
  guard with a separate moving flag. Then remove angle_ok target in a copy
  and evaluate a target of 120; explain the resulting invariant violation.
\<close>

end
