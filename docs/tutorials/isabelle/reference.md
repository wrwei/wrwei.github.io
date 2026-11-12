# Isabelle quick reference

[Guide](index.md) · [Exercises](exercises.md) · [Download examples](examples/isabelle-tutorial.zip)

Use this page while reading or editing a theory. The [guide](index.md) explains each idea with a complete running example.

## Files and commands

| Item | Purpose |
|---|---|
| `Name.thy` | A theory whose header says `theory Name` |
| `imports Main` | Standard HOL foundations |
| `ROOT` | Sessions and their theory files |
| `definition` | Introduce a mathematical definition |
| `fun` | Define a function by equations, with termination obligations where needed |
| `datatype` | Define a type by its constructors |
| `record` | Define a type with named fields |
| `lemma`, `theorem` | State a proposition and prove it |
| `value "expression"` | Calculate a concrete expression |
| `thm name` | Display an established fact |
| `term "expression"` | Inspect a term and its inferred type |

Run a session from the directory containing `ROOT`:

```bash
/path/to/isabelle build -D .
```

To open the editor from a terminal:

```bash
/path/to/isabelle jedit Isabelle_Tutorial.thy
```

The application launcher provides the same IDE without a terminal. Keep shell commands outside the theory buffer.

## Types and logical notation

| Notation | Meaning |
|---|---|
| `bool` | Truth values |
| `nat` | Natural numbers including zero |
| `int` | Mathematical integers |
| `real` | Mathematical real numbers |
| `'a list` | Lists with element type `'a` |
| `'a set` | Sets of elements of type `'a` |
| `'a ⇒ 'b` | Functions from `'a` to `'b` |
| `x :: int` | A type annotation |
| `P ∧ Q`, `P ∨ Q`, `¬ P` | Logical conjunction, disjunction and negation |
| `P ⟶ Q` | HOL implication, inside a logical formula |
| `P ⟹ Q` | Isabelle rule implication, used for premises and conclusions |
| `P ⟷ Q` | Logical equivalence |
| `∀x. P x`, `∃x. P x` | Universal and existential quantification |
| `x ∈ A` | Set membership |
| `[]`, `x # xs`, `xs @ ys` | Empty list, list constructor and append |
| `s⦇field := value⦈` | Update a record field |

Terms and types appear inside double quotes where the outer command expects inner syntax. An ambiguous numeral may need a type annotation, such as `(0 :: int)`. Function application is `f x y`; its function type is `a ⇒ b ⇒ c`, with arrows associating to the right.

## Proof vocabulary

| Command | Purpose |
|---|---|
| `assumes a: "P"` | Introduce and optionally name a premise |
| `shows "Q"` | State the conclusion |
| `using a` | Supply an available fact |
| `unfolding name_def` | Expand a definition |
| `have h: "P"` | Establish an intermediate fact |
| `from h show "Q"` | Address a goal using a selected fact |
| `show ?thesis` | Address the current thesis |
| `proof -` … `qed` | A structured proof |
| `by method` | Finish using a proof method |

`assms` refers to assumptions introduced by an `assumes` statement; `?thesis` refers to the current conclusion. A theorem can have assumptions and still be fully proved: the result is conditional on those assumptions. Replacing the proof with `sorry` admits the result without completing its proof, so it is unsuitable for the checked examples.

## Proof methods

| Method or tool | Start here when |
|---|---|
| `simp` | The goal follows by rewriting and simplification |
| `simp add: f_def` | A definition needs to be expanded |
| `auto` | Simplification and logical reasoning need to work together |
| `cases x` | A Boolean or datatype has distinct cases |
| `induction xs` | A list or recursive structure needs an inductive argument |
| `linarith` | Linear equalities and inequalities need combining |
| `sledgehammer` | You need help finding relevant facts and a proof command |

A failed method may indicate a false statement, a missing assumption, an unsuitable formulation, or a need for another lemma. It does not establish which explanation is correct. Sledgehammer suggestions become useful proofs when their proposed commands replay successfully in Isabelle. See the [official proof automation introduction](https://isabelle.in.tum.de/website-Isabelle2025-2/dist/Isabelle2025-2/doc/prog-prove.pdf).

## Common problems

| Symptom | Check |
|---|---|
| Theory name does not match filename | Match `theory Name` with `Name.thy` |
| Unknown constant or type | Check spelling, imports and the first earlier error |
| Type unification fails | Inspect the inferred type; distinguish `nat`, `int`, `real` and function types |
| A definition stays opaque | Add its generated `name_def` fact to simplification |
| The proof has remaining goals | Read each goal and the facts actually available in that context |
| Arithmetic behaves unexpectedly | Check the number type, especially natural-number subtraction |
| A statement is false for one case | Use that case to repair the model, guard or intended conclusion |
| A `value` command works but a lemma fails | Concrete evaluation and a general proof ask different questions |

The [Isar manual](https://isabelle.in.tum.de/website-Isabelle2025-2/dist/Isabelle2025-2/doc/isar-ref.pdf) is the detailed command reference. The [exercises](exercises.md) include complete answers whose proofs are checked with the tutorial session.
