# Isabelle for model verification

[Guide](index.md) · [Exercises](exercises.md) · [Quick reference](reference.md) · [Download all examples](examples/isabelle-tutorial.zip)

Learn how to turn a model, a constraint and an operation into a machine-checked argument. This guide starts with Isabelle/HOL and develops a small lid model: define an angle limit, admit an opening operation, prove an invariant, and check a translation between two representations.

You need basic programming experience and a willingness to read logical formulas. No previous theorem-proving experience is assumed. Work through the sections in order the first time; use the contents and [quick reference](reference.md) when returning to a topic.

## Start Isabelle and open a theory

Use **Isabelle2025-2** for the examples in this guide. The [official installation page](https://isabelle.in.tum.de/website-Isabelle2025-2/installation.html) provides applications for macOS, Windows and Linux. Start the Isabelle/jEdit application rather than a plain text editor: the application connects the text to the prover.

1. Download and unpack the [example ZIP](examples/isabelle-tutorial.zip).
2. Open `Isabelle_Tutorial.thy` in Isabelle/jEdit.
3. Open the **Output** panel and enable **Proof state**.
4. Place the cursor at a definition or lemma. Read the output for that command before moving on.

The ZIP also contains `Exercise_Answers.thy` and a `ROOT` file defining a build session. Opening the first theory in the IDE is enough to start learning; the session becomes useful when checking all files together.

An Isabelle file is a **theory**. The header names the theory and its imports; `begin` and `end` enclose its declarations:

```isabelle
theory Isabelle_Tutorial
  imports Main
begin

(* Definitions and proofs belong here. *)

end
```

The file must be named `Isabelle_Tutorial.thy`. `Main` supplies the standard HOL theories. Keep one final `end` and insert new examples before it. The downloadable theory already contains the complete sequence.

Isabelle processes the document as you edit. If an error appears, start with the earliest failing command: a later failure may simply depend on an earlier definition that was not accepted. The [official introduction](https://isabelle.in.tum.de/website-Isabelle2025-2/dist/Isabelle2025-2/doc/prog-prove.pdf) explains this theory structure and the proof state.

## Define a property and evaluate examples

HOL is a typed logic. A function has an input and output type, and its mathematical definition describes the result. Define a predicate for integer angles between 0 and 90 degrees:

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
definition angle_ok :: "int ⇒ bool" where
  "angle_ok a ⟷ 0 ≤ a ∧ a ≤ 90"

value "angle_ok 60"
value "angle_ok 120"
value "angle_ok (-10)"
```
`int ⇒ bool` means a function from integers to truth values. `angle_ok a` applies that function to `a`. The expression after `⟷` states exactly when it is true. Degrees are an interpretation we attach to these integers; the type `int` does not itself enforce a unit.

The three `value` commands calculate individual cases: 60 is allowed, 120 is outside the upper bound, and −10 is outside the lower bound. They illustrate the definition. A general theorem will cover every input satisfying its premises.

| Notation | Read it as |
|---|---|
| `x :: int` | `x` has integer type |
| `int ⇒ bool` | A function from integers to Booleans |
| `f x` | Apply `f` to `x` |
| `P ∧ Q`, `P ∨ Q`, `¬ P` | And, or, not |
| `P ⟷ Q` | `P` holds exactly when `Q` holds |
| `P ⟹ Q` | From assumption `P`, conclude `Q` |
| `∀x. P x`, `∃x. P x` | Every `x`, or at least one `x` |

`nat` represents natural numbers, including zero; `int` also represents negative integers. On `nat`, subtraction cannot produce a negative number, so choose the type deliberately. `real` represents mathematical real numbers, rather than machine floating-point values. The running model uses integer degrees to keep the first proofs small.

The downloadable source stores Isabelle symbol escapes such as `\<le>`. Isabelle/jEdit renders them as mathematical symbols such as `≤`.

## Prove a statement for every admitted angle

A `lemma` states a proposition and supplies a proof. This first lemma follows directly from the definition:

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
lemma angle_guard_sound:
  assumes "angle_ok a"
  shows "0 ≤ a ∧ a ≤ 90"
  using assms
  unfolding angle_ok_def
  by simp
```
The variable `a` is arbitrary. The result covers every integer for which the assumption holds.

- `assumes` introduces a premise.
- `shows` gives the required conclusion.
- `using assms` makes the premises available to the proof.
- `unfolding angle_ok_def` replaces the named predicate with its defining expression.
- `by simp` finishes by simplification.

Defining `angle_ok` creates a theorem named `angle_ok_def`. A definition introduces the model; a lemma establishes a consequence of that model. Here the consequence is deliberately immediate so you can see the proof mechanics.

To prove just one concrete instance, the file also contains:

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
lemma sixty_is_allowed:
  "angle_ok 60"
  by (simp add: angle_ok_def)
```
Read a proof as a chain of justified steps. The proof method `simp` rewrites and simplifies; it does not understand the English intention of “opening a lid”. That meaning must be represented by the definitions and the statement you choose.

## Define state and an operation contract

A **record** groups typed observations of an object. This lid has an angle, a latch flag and a support flag:

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
`lid_invariant s` is the property we want the state `s` to satisfy. `may_open s target` is an admission guard: the starting state must satisfy the invariant, the lid must be unlatched, support must be present, and the target angle must be allowed.

`set_lid_angle s target` returns a new record with one changed field. The syntax `s⦇lid_angle := target⦈` retains the other fields. The function is a mathematical state update; the guard is defined separately.

The preservation theorem connects them:

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
lemma opening_preserves_invariant:
  assumes "may_open s target"
  shows "lid_invariant (set_lid_angle s target)"
  using assms
  by (auto simp: may_open_def lid_invariant_def set_lid_angle_def)
```
If the guard holds, the resulting state satisfies the angle invariant. The target is permitted by the guard, and the update puts that target into the angle field. The executing program must enforce admission before applying the update.

This theorem concerns an instantaneous state transition. A trajectory that stays within bounds throughout movement, a correctly identified physical lid, and a controller that follows the trajectory require further models and evidence.

### Explore a concrete guard

Change the inputs, then try the update. Compare the guard calculation with the general theorem above.

<link rel="stylesheet" href="assets/guard.css">
<div class="isabelle-explorer" data-isabelle-explorer>
  <p class="isabelle-explorer-intro"><strong>Angle range: 0° to 90°.</strong> This browser illustration calculates concrete cases of the lesson’s guard. Isabelle checks the general theorem in the downloadable theory.</p>
  <form data-guard-form>
    <div class="isabelle-inputs">
      <label>Current angle in degrees <input name="current" type="number" min="-180" max="180" step="1" value="0" required></label>
      <label>Target angle in degrees <input name="target" type="number" min="-180" max="180" step="1" value="60" required></label>
    </div>
    <div class="isabelle-flags">
      <label><input name="latched" type="checkbox"> Lid is latched</label>
      <label><input name="supported" type="checkbox" checked> Container has support</label>
    </div>
    <div class="isabelle-actions"><button type="submit">Try opening</button><button type="button" data-guard-reset>Reset example</button></div>
  </form>
  <div class="isabelle-result" aria-live="polite" aria-atomic="true">
    <p data-guard-summary>Enable JavaScript to calculate this example, or evaluate the same inputs in Isabelle.</p>
    <ul data-guard-checks></ul>
    <p data-guard-effect></p>
  </div>
  <p>Copy this concrete expression into Isabelle:</p>
  <pre><code data-guard-expression>value "may_open demo_lid 60"</code></pre>
</div>
<script src="assets/guard.js" defer></script>

Try target 120°, a latched lid, or missing support. A false guard withholds the illustrated update; changing the inputs is not a new proof of the theorem.

## Read a structured proof

**Isar** is Isabelle’s language for writing proofs with named assumptions and intermediate facts. The next proof makes its reasoning explicit:

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
`guard` names the assumption. `have` establishes an intermediate fact. `from` selects a fact to use, `show` addresses the current goal, and `?thesis` stands for that goal. `qed` closes the structured proof. This style helps a reviewer see why the conclusion follows. The [Isar reference manual](https://isabelle.in.tum.de/website-Isabelle2025-2/dist/Isabelle2025-2/doc/isar-ref.pdf) explains the commands and proof contexts in detail.

For a larger argument, first write its intended steps in ordinary mathematical prose. Then give each important step a name and prove it in Isar. Very short proofs can remain a single `by` command.

## Use datatypes and induction

A datatype describes explicit alternatives. A three-valued checking result can distinguish support, contradiction and unresolved evidence:

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
The `fun` command defines `permitted` by cases. Only `Supported` permits execution. `Unknown` withholds it without asserting that the requirement has been disproved. `cases result` considers each constructor of the datatype; `simp_all` simplifies the resulting goals.

For a recursive structure, induction lets a finite proof cover arbitrarily large instances. Here `step_count` counts the elements of an abstract sequence:

<!-- checked: Isabelle_Tutorial.thy -->

```isabelle
fun step_count :: "'a list ⇒ nat" where
  "step_count [] = 0" |
  "step_count (x # xs) = Suc (step_count xs)"

lemma step_count_append:
  "step_count (xs @ ys) = step_count xs + step_count ys"
  by (induction xs) auto
```
`[]` is the empty list, `x # xs` adds an element at the front, `Suc` is successor, and `@` appends lists. The induction splits the proof into an empty-list case and a step that assumes the property for `xs` and establishes it for `x # xs`.

This lemma counts sequence entries. Proving that a robot protocol preserves an invariant would additionally require a transition relation, its guards and effects, and an induction over accepted steps.

## Prove that a translation preserves meaning

A source model and a checker may use different representations. The source predicate should express the intended property independently of the translation. In this small example, each representation has an angle and a limit:

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
`lower` maps the source fields to checker fields. The theorem establishes equivalence for this exact mapping and these numeric predicates. A weaker one-way result would establish only that accepted translated inputs satisfy the source property.

A wrong field mapping can invalidate the connection even when the checker itself behaves correctly. The file defines `bad_lower`, which swaps angle and limit, and proves a concrete counterexample: a source angle of 120 with limit 90 is invalid, but the swapped checker input passes. Explore it in [Exercise 6](exercises.md#exercise-6-find-an-invalid-translation).

For a linked engineering model, a useful preservation relation may also need identities, participant roles, units, coordinate frames, model revisions and evidence assumptions. A theorem about the encoded checker input does not by itself establish that a parser or database adapter constructs the right input. State where the formal relation starts, which properties it preserves, and which external assumptions remain.

## Place Isabelle UTP in the picture

Isabelle/HOL is the logical foundation used throughout this guide. **Isabelle/UTP** builds on HOL with reusable semantic theories for programs and modelling languages. It can help express relations between observations, contracts, composition and refinement. The [Isabelle/UTP project](https://isabelle-utp.york.ac.uk/home) and its [Archive of Formal Proofs entry](https://isa-afp.org/entries/UTP.html) explain the framework.

Our tiny `lower` theorem is already expressible in HOL. UTP becomes useful when a larger development benefits from established semantic structures and laws. A refinement claim must name the specification, implementation, observations and relation; its direction should express the intended inclusion of behaviours. Physical applicability still needs a justified connection between those observations and the actual system.

Work through the HOL exercises before adding a UTP dependency. They establish the habits that carry over: precise types, explicit assumptions, small reusable lemmas and a clear interpretation of the result.

## Check the complete example session

From the unpacked examples directory, run:

```bash
/path/to/isabelle build -D .
```

`ROOT` defines the `Isabelle_Web_Tutorial` session and lists both theories. The build checks the tutorial and all exercise answers together. After changing a definition, rerun it and inspect any affected proofs. [Proof-check record](examples/proof-status.json)

When a proof fails, first ask whether the statement is true. Then check the types, the available assumptions and the definitions that need unfolding. Use the [quick reference](reference.md) for proof methods and common errors, and the [exercises](exercises.md) to practise.

## Further reading

- [Programming and Proving in Isabelle/HOL](https://isabelle.in.tum.de/website-Isabelle2025-2/dist/Isabelle2025-2/doc/prog-prove.pdf): types and definitions, simplification, induction, logic and structured proofs.
- [Isabelle/Isar Reference Manual](https://isabelle.in.tum.de/website-Isabelle2025-2/dist/Isabelle2025-2/doc/isar-ref.pdf): command and proof-language reference.
- [Isabelle2025-2 documentation](https://isabelle.in.tum.de/website-Isabelle2025-2/documentation.html): installation, IDE, code generation and proof tools.
- [Isabelle/UTP](https://isabelle-utp.york.ac.uk/home): semantic theory engineering after the HOL foundations.
