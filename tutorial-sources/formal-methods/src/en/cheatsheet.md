---
title: Cheat sheet
lead: The series on one page. How to type and read the symbols, the commands, the proof methods, the rules of natural deduction, Isar, induction and the editor, each with a link to the section that explains it.
---

A message you do not understand? See [Troubleshooting](troubleshooting_EN.html). A word you do not know? See
the [Glossary](glossary_EN.html). The numbers in the last column of each table are sections of the modules:
7.2.2 is Module 7, Section 7.2.2. The Isabelle text on this page is copied from the modules, where Isabelle
checked it.

## Typing symbols {#symbols}

In Isabelle/jEdit, type a symbol's abbreviation, or a backslash and its name, and accept the completion
with <kbd>Tab</kbd>; <kbd>Return</kbd> does not accept it. The **Symbols** panel at the bottom of the window
inserts any symbol with a click, and text copied from these pages works as it is.

| Symbol | Type | Or | Meaning | Section |
|---|---|---|---|---|
| ¬ | `~` | `\not` | not | [2.1](module_02_EN.html#connectives) |
| ∧ | `&` or `/\` | `\and` | and | [1.6](module_01_EN.html#tour) |
| ∨ | <code>&#124;</code> or `\/` | `\or` | or | [1.6](module_01_EN.html#tour) |
| ⟶ | `-->` | `\longrightarrow` | implies | [2.1](module_02_EN.html#connectives) |
| ⟷ | `<-->` | `\longleftrightarrow` | if and only if | [2.1](module_02_EN.html#connectives) |
| ∀ | `!` | `\forall` | for all | [3.2.3](module_03_EN.html#quantifiers) |
| ∃ | `?` | `\exists` | there exists | [3.2.3](module_03_EN.html#quantifiers) |
| ∃! | ∃ then `!` | | there is exactly one | [3.6](module_03_EN.html#equality) |
| ∄ | `~?` | | there is no | [4.4.3](module_04_EN.html#well-founded) |
| ≠ | `~=` | `\noteq` | not equal | [1.6](module_01_EN.html#tour) |
| ≤ | `<=` | | less than or equal | [1.6](module_01_EN.html#tour) |
| ⇒ | `=>` | `\Rightarrow` | function type; `case` branches | [1.6](module_01_EN.html#tour) |
| λ | `%` | `\lambda` | a function without a name | [8.2.1](module_08_EN.html#lambda) |
| ⟹ | `==>` | `\Longrightarrow` | from … infer (Pure) | [7.1.1](module_07_EN.html#meta-pure) |
| ⋀ | `!!` | `\And` | for an arbitrary … (Pure) | [7.1.1](module_07_EN.html#meta-pure) |
| ≡ | `==` | `\equiv` | is defined as (Pure) | [7.1.1](module_07_EN.html#meta-pure) |
| ⟦ ⟧ | `[\|` and `\|]` | | the premises of a rule | [7.1.1](module_07_EN.html#meta-pure) |
| ∈ | `:` | `\in` | is an element of | [4.1.4](module_04_EN.html#sets-isabelle) |
| ∉ | `~:` | `\notin` | is not an element of | [4.1.4](module_04_EN.html#sets-isabelle) |
| ⊆ | `(=` | `\subseteq` | is a subset of | [4.1.4](module_04_EN.html#sets-isabelle) |
| ∪ | `Un` | `\union` | union | [4.1.4](module_04_EN.html#sets-isabelle) |
| ∩ | `Int` | `\inter` | intersection | [4.1.4](module_04_EN.html#sets-isabelle) |
| × | `<*>`, or write `*` | `\times` | pairs, products | [8.1.1](module_08_EN.html#types) |
| ∘ | | `\circ` | composition of functions | [4.6.3](module_04_EN.html#inverse) |
| ¯ | `^-1` | | converse of a relation | [4.2.4](module_04_EN.html#rel-ops) |
| ⇧+, ⇧* | `^+`, `^*` | | transitive, reflexive–transitive closure | [4.5.1](module_04_EN.html#closure-def) |
| ← | `<-` | | generator in a list comprehension | [8.5.2](module_08_EN.html#comprehension) |
| ⦇ ⦈ | `(\|` and `\|)` | | record values and updates | [13.4.1](module_13_EN.html#records) |
| ‹ › | a back-quote, then the completion | | a fact named by its statement | [10.3.2](module_10_EN.html#facts-names) |
| … | `...` | | the previous right-hand side | [10.4.1](module_10_EN.html#calc-eq) |

::: pitfall
Type ⟷ as `<-->`. The shorter `<->` is also the abbreviation of ↔, which jEdit offers first and HOL
rejects.
:::

## Reading the notation aloud {#notation}

| Notation | Read it as | Section |
|---|---|---|
| ¬A | "not A" | [2.1](module_02_EN.html#connectives) |
| A ∧ B | "A and B" | [2.1](module_02_EN.html#connectives) |
| A ∨ B | "A or B" | [2.1](module_02_EN.html#connectives) |
| A ⟶ B | "A implies B", "if A then B" | [2.1](module_02_EN.html#connectives) |
| A ⟷ B | "A if and only if B"; Isabelle prints it as `=` | [2.2.2](module_02_EN.html#priorities) |
| φ ≡ ψ | "φ is equivalent to ψ" | [2.5](module_02_EN.html#equivalence) |
| φ₁, …, φₙ ⊨ ψ | "φ₁, …, φₙ entail ψ" | [2.6](module_02_EN.html#consequence) |
| ∀x. φ | "for all x, φ" | [3.2.3](module_03_EN.html#quantifiers) |
| ∃x. φ | "there exists an x such that φ" | [3.2.3](module_03_EN.html#quantifiers) |
| ∃!x. P x | "there is exactly one x such that P x" | [3.6](module_03_EN.html#equality) |
| $\mathcal M \models \varphi$ | "φ is true in $\mathcal M$" | [3.3](module_03_EN.html#structures) |
| $\varphi[t/x]$ | "φ with t for x" | [3.5.2](module_03_EN.html#substitution) |
| x ∈ A | "x is an element of A", "x is in A" | [4.1.1](module_04_EN.html#sets-notation) |
| {x. P x} | "the set of all x such that P x" | [4.1.1](module_04_EN.html#sets-notation) |
| A ∪ B, A ∩ B, A − B, −A | "A union B", "A intersect B", "A minus B", "the complement of A" | [4.1.2](module_04_EN.html#sets-ops) |
| x R y | "x is related to y by R" | [4.2.2](module_04_EN.html#rel-def) |
| g ∘ f | "g after f" | [4.6.3](module_04_EN.html#inverse) |
| `Suc n` | "successor of n" | [5.1.1](module_05_EN.html#peano) |
| `x # xs` | "x cons xs" | [5.2.1](module_05_EN.html#lists) |
| `'a list` | "alpha list" | [5.2.1](module_05_EN.html#lists) |
| ∀m < n. P(m) | "for all m less than n, P of m" | [5.6](module_05_EN.html#strong) |
| Γ ⊢ A | "Γ derives A", "A is derivable from Γ" | [6.2](module_06_EN.html#systems) |
| ⊥ | "bottom" or "falsum"; Isabelle writes `False` | [6.4.5](module_06_EN.html#not) |
| `A ⟹ B` | "from A, infer B" | [7.1.1](module_07_EN.html#meta-pure) |
| `⟦A₁; A₂; …; Aₙ⟧ ⟹ C` | "from the premises A₁ to Aₙ, infer the conclusion C" | [7.1.1](module_07_EN.html#meta-pure) |
| `⋀x. P x` | "for an arbitrary x, P x" | [7.1.1](module_07_EN.html#meta-pure) |
| `a ≡ b` | "a is defined as b" | [7.1.1](module_07_EN.html#meta-pure) |
| `?P` | a schematic variable: any term may replace it | [7.2.1](module_07_EN.html#rules-thm) |
| `t :: τ` | "t has type τ" | [8.1.1](module_08_EN.html#types) |
| `λx. x + 1` | "lambda x, x plus 1" | [8.2.1](module_08_EN.html#lambda) |
| `?thesis` | "the thesis": the statement being proved | [10.2.5](module_10_EN.html#shape-assms) |
| `?case` | "the case": the claim of the current case | [10.6.1](module_10_EN.html#induction-skeleton) |
| `‹A›` | "the fact A" | [10.3.2](module_10_EN.html#facts-names) |
| `'a::linorder` | "any type 'a in the class linorder" | [12.2.1](module_12_EN.html#isort-program) |
| `∀y∈set ys. P y` | "for every y in ys, P of y" | [12.2.2](module_12_EN.html#isort-spec) |

In Isabelle, ¬ binds most tightly, then ∧, then ∨, then ⟶ and ⟷, which group to the right; `=` binds more
tightly than all of them, and a quantifier's scope runs as far to the right as possible. When you mix ⟶ and
⟷, write the parentheses ([2.2.2](module_02_EN.html#priorities), [3.2.4](module_03_EN.html#scope),
[3.6](module_03_EN.html#equality)).

## Theories {#theory}

Everything you write goes into a theory. The theory `First` lives in the file `First.thy`
([1.7.1](module_01_EN.html#first-file)):

```text
theory First
  imports Main
begin

end
```

A theory that needs a library theory outside `Main` names it after `imports`
([12.2.1](module_12_EN.html#isort-program)):

```text
theory Verify
  imports Main "HOL-Library.Multiset"
begin

end
```

- Commands go between `begin` and `end`, and Isabelle checks them as you type.
- Terms and types go between quotation marks (inner syntax); commands such as `value` and `lemma` stay
  outside (outer syntax) ([1.7.2](module_01_EN.html#first-compute)).
- A string is written between two pairs of single quotes: `''alice''` ([4.2.4](module_04_EN.html#rel-ops)).
- Every theory of the series is in [formal-methods-theories.zip](formal-methods-theories.zip).

## Types and terms {#hol}

### Types {#hol-types}

| Type | Values, for example | Section |
|---|---|---|
| `bool` | `True`, `False` | [8.1.1](module_08_EN.html#types) |
| `nat` | `0`, `Suc 0`, `42` | [8.1.1](module_08_EN.html#types) |
| `int` | `-3`, `7` | [8.1.1](module_08_EN.html#types) |
| `'a list` | `[]`, `[1, 2, 3]` | [8.1.1](module_08_EN.html#types) |
| `'a × 'b` | `(3, True)` | [8.1.1](module_08_EN.html#types) |
| `'a option` | `None`, `Some 5` | [8.1.1](module_08_EN.html#types) |
| `'a ⇒ 'b` | `Suc`, `rev` | [8.1.1](module_08_EN.html#types) |
| `'a set` | `{1, 2, 3}`, `{x. x < 5}`, `{}`, `UNIV` | [4.1.4](module_04_EN.html#sets-isabelle) |
| `string` | `''x''`; another name for `char list` | [14.2.1](module_14_EN.html#syntax) |

- A type annotation fixes a type: `value "2 + 3 :: nat"` ([1.7.2](module_01_EN.html#first-compute),
  [8.1.2](module_08_EN.html#terms)).
- On `nat`, subtraction is truncated: `(2::nat) - 3` is `0` ([8.6.1](module_08_EN.html#nat-int)).
- `a div 0 = 0` and `a mod 0 = a` for every `a` ([8.6.1](module_08_EN.html#nat-int)).
- Isabelle prints negative numbers with a space after the minus sign: `- 1`
  ([8.6.1](module_08_EN.html#nat-int)).

### Sets, relations and functions {#hol-sets}

| You write | Meaning | Section |
|---|---|---|
| `{x ∈ {0..10}. x mod 3 = (0::nat)}` | the elements of a set that satisfy a condition | [4.1.4](module_04_EN.html#sets-isabelle) |
| `Pow A`, `card A`, `finite A` | power set, number of elements, finiteness | [4.7.1](module_04_EN.html#finite) |
| `r O s`, `r¯` | composition and converse of relations | [4.2.4](module_04_EN.html#rel-ops) |
| ```r `` S``` | the image of the set S under r | [4.2.4](module_04_EN.html#rel-ops) |
| `refl_on A r`, `sym r`, `trans r` | reflexive on A, symmetric, transitive | [4.2.4](module_04_EN.html#rel-ops) |
| `equiv A r`, `A // r` | equivalence relation on A; the set of its classes | [4.3](module_04_EN.html#equivalence) |
| `wf r` | r is well-founded | [4.4.3](module_04_EN.html#well-founded) |
| `r⇧+`, `r⇧*` | transitive and reflexive–transitive closure | [4.5.1](module_04_EN.html#closure-def) |
| `inj f`, `surj f`, `bij f`, `inv f` | injective, surjective, bijective; inverse | [4.6.3](module_04_EN.html#inverse) |
| `inj_on f A`, `bij_betw f A B` | the same properties on sets | [4.6.3](module_04_EN.html#inverse) |
| `g ∘ f`, `range f` | composition; the set of all values of f | [4.6.3](module_04_EN.html#inverse), [4.7.4](module_04_EN.html#cantor) |
| `f(a := v)` | f, except that a is mapped to v | [14.2.2](module_14_EN.html#eval) |

### Lists {#hol-lists}

| Function | What it computes | Section |
|---|---|---|
| `x # xs`, `xs @ ys` | x in front of xs; xs followed by ys | [5.2.1](module_05_EN.html#lists) |
| `length xs`, `rev xs`, `sum_list xs` | length, reverse, sum | [5.2.1](module_05_EN.html#lists) |
| `map f xs`, `filter P xs` | f applied to every element; the elements that satisfy P | [8.5.1](module_08_EN.html#library) |
| `foldr f xs e` | the elements combined with f, from the right | [8.5.1](module_08_EN.html#library) |
| `zip xs ys` | pairs of corresponding elements | [8.5.1](module_08_EN.html#library) |
| `take n xs`, `drop n xs` | the first n elements; the rest | [8.5.1](module_08_EN.html#library) |
| `xs ! n`, `[m..<n]` | element number n, from 0; the numbers m to n − 1 | [8.5.1](module_08_EN.html#library) |
| `[e. x ← xs, P x]` | list comprehension | [8.5.2](module_08_EN.html#comprehension) |
| `set xs` | the set of the elements of xs | [10.6.2](module_10_EN.html#induction-names) |
| `sorted xs`, `mset xs` | xs is sorted; the multiset of its elements | [12.2.2](module_12_EN.html#isort-spec) |

`hd []` and `xs ! n` beyond the end are unspecified: `value` stops with an exception on them
([8.5.2](module_08_EN.html#comprehension)).

## Commands {#commands}

### Look and compute {#commands-look}

| Command | Example | What it does | Section |
|---|---|---|---|
| `value` | `value "rev [1, 2, 3 :: nat]"` | evaluates a term and prints it with its type | [1.7.2](module_01_EN.html#first-compute) |
| `term` | `term "x + (1::nat)"` | prints a term with its type, without evaluating it | [8.1.2](module_08_EN.html#terms) |
| `typ` | `typ "nat ⇒ bool list"` | checks a type and prints it | [8.1.1](module_08_EN.html#types) |
| `thm` | `thm conjI` | shows a theorem by its name | [7.2.1](module_07_EN.html#rules-thm) |
| `of` | `thm conjI[of "door_closed" "lift_stopped"]` | replaces a theorem's schematic variables, from left to right | [7.2.1](module_07_EN.html#rules-thm) |
| `find_theorems` | `find_theorems "rev (rev _)"` | searches the library | [9.6](module_09_EN.html#find) |
| `find_consts` | `find_consts "'a list ⇒ 'a set"` | finds functions by their type | [9.6](module_09_EN.html#find) |
| `print_cases` | `print_cases` | inside a proof: lists the cases of an induction | [10.6.2](module_10_EN.html#induction-names) |
| `declare` | `declare [[show_sorts]]` | sets an option: here, sorts are shown in the output | [8.6.2](module_08_EN.html#classes) |

Search criteria for `find_theorems`, which you can combine ([9.6](module_09_EN.html#find)):

| Criterion | Finds theorems |
|---|---|
| `"pattern"` | that contain the pattern; use `_` for any term |
| `name: s` | whose name contains `s` |
| `simp: "term"` | that are equations whose left side matches the term |
| `intro`, `elim`, `dest` | that could be applied as such a rule to the current goal |
| `-` before a criterion | that do not meet it |

### Definitions {#commands-define}

| Command | Defines | You get | Section |
|---|---|---|---|
| `datatype` | a type and its constructors | distinctness and injectivity as simp rules | [5.2.2](module_05_EN.html#trees), [8.3.1](module_08_EN.html#enumerations) |
| `fun` | a function by equations with patterns; termination is proved | `f.simps` (simp rules), `f.induct` | [5.1.2](module_05_EN.html#nat-functions), [8.4.2](module_08_EN.html#fun-primrec) |
| `primrec` | primitive recursion, one equation per constructor | `f.simps` | [8.4.2](module_08_EN.html#fun-primrec) |
| `definition` | a non-recursive constant, one equation | `f_def`, not a simp rule | [8.4.1](module_08_EN.html#definition) |
| `inductive` | the smallest predicate closed under rules | for `ev` below: `ev.intros`, `ev.induct`, `ev.cases` | [11.6.1](module_11_EN.html#ev) |
| `inductive_cases` | an inversion rule for one shape of fact | an elimination rule | [11.6.3](module_11_EN.html#inversion) |
| `record` | a tuple with named fields | selectors, `s⦇cars := Amber⦈` updates | [13.4.1](module_13_EN.html#records) |
| `type_synonym` | a new name for an existing type | nothing new | [14.2.1](module_14_EN.html#syntax) |
| `typedecl`, `consts` | a type and constants, without definitions | uninterpreted symbols | [3.8](module_03_EN.html#types) |

```text
datatype 'a tree2 = Tip | Node "'a tree2" 'a "'a tree2"

fun mirror :: "'a tree2 ⇒ 'a tree2" where
  "mirror Tip = Tip"
| "mirror (Node l x r) = Node (mirror r) x (mirror l)"

definition safe :: "light × light ⇒ bool" where
  "safe p = (fst p = Red ∨ snd p = Red)"

inductive ev :: "nat ⇒ bool" where
  ev_0: "ev 0"
| ev_SS: "ev n ⟹ ev (Suc (Suc n))"
```

### Statements and proofs {#commands-prove}

| Command | What it does | Section |
|---|---|---|
| `lemma name: "…"` | states a claim; `theorem` and `corollary` mean the same | [1.7.3](module_01_EN.html#first-prove) |
| `lemma name [simp]: "…"` | also makes the proved lemma a simp rule | [5.5.3](module_05_EN.html#lemmas) |
| `assumes "…"` `shows "…"` | a lemma with named assumptions, available as `assms` | [10.2.5](module_10_EN.html#shape-assms) |
| `fixes i n :: nat` | declares the lemma's variables with their type | [10.4.2](module_10_EN.html#calc-ineq) |
| `by m`, `by m₁ m₂` | a proof in one line; fails unless no subgoal is left | [5.4.3](module_05_EN.html#by-induction) |
| `apply m` … `done` | an apply script; `done` checks that nothing is left | [5.4.2](module_05_EN.html#induction-state) |
| `proof m` … `qed` | an Isar proof block | [10.2.1](module_10_EN.html#shape-blocks) |
| `oops` | abandons a proof | [1.7.5](module_01_EN.html#first-refute) |
| `sorry` | stands in for a missing proof while you work; a theory with `sorry` is not proved | [10.5.1](module_10_EN.html#cases-bool) |
| `declare name [simp]` | makes a proved lemma a simp rule; `[simp del]` removes it | [9.2.3](module_09_EN.html#simp-rules) |
| `using [[simp_trace]] by simp` | shows every rewriting step of the simplifier | [9.3.5](module_09_EN.html#tracing) |

### Testing {#commands-test}

Test a claim before you try to prove it. Isabelle/jEdit runs Quickcheck on every new lemma by itself;
Nitpick and Sledgehammer run when you call them.

| Command | Options, for example | What it does | Section |
|---|---|---|---|
| `quickcheck` | `[random]`, `[size = 5]`, `[timeout = 30]`, `[expect = counterexample]` | runs the claim on many small values | [1.7.5](module_01_EN.html#first-refute), [9.7.1](module_09_EN.html#quickcheck) |
| `nitpick` | `[card 'a = 2]`, `[card = 6]`, `[satisfy]` | searches for a finite countermodel with a SAT solver; the option `show_consts` also shows the values of constants | [2.4](module_02_EN.html#classify), [3.8](module_03_EN.html#types), [9.7.2](module_09_EN.html#nitpick) |
| `sledgehammer` | `[timeout = 60]` | asks external provers, and suggests a proof to paste | [9.8](module_09_EN.html#sledgehammer) |

### Code {#commands-code}

| Command | What it does | Section |
|---|---|---|
| `export_code next_light duration trace in Haskell module_name Traffic` | translates functions, and what they need, into Haskell | [8.8](module_08_EN.html#codegen) |
| `in SML`, `in OCaml`, `in Scala` | the other target languages | [8.8](module_08_EN.html#codegen) |
| `export_code open …` | also exports type classes and constructors | [12.7](module_12_EN.html#export) |
| `imports Main "HOL-Library.Code_Target_Nat"` | the generated code uses the target language's own integers | [8.8](module_08_EN.html#codegen) |

The code appears as *theory exports*: click the link in the message to open it in the File Browser.

## Proof methods {#methods}

### The simplifier {#methods-simp}

| Method | Uses | Section |
|---|---|---|
| `simp` | the simp set and the assumptions of the first subgoal | [9.2.4](module_09_EN.html#modifiers) |
| `simp add: a b` | the simp set, plus the theorems `a` and `b` | [9.2.4](module_09_EN.html#modifiers) |
| `simp del: a` | the simp set without `a` | [9.2.4](module_09_EN.html#modifiers) |
| `simp only: a b` | only `a` and `b`, plus the assumptions | [9.2.4](module_09_EN.html#modifiers) |
| `simp split: option.split` | also splits `case` on options in the conclusion; `option.splits` and `if_splits` work in the assumptions | [9.3.3](module_09_EN.html#splits) |
| `simp flip: name` | uses the rule `name` from right to left, for this call | [9.3.4](module_09_EN.html#loops) |
| `simp (no_asm)` | ignores the assumptions of the subgoal | [9.3.2](module_09_EN.html#assumptions) |
| `simp_all` | like `simp`, on every subgoal | [9.2.4](module_09_EN.html#modifiers) |

The simp set holds the equations of `fun` and `primrec`, the facts of `datatype` and every lemma marked
`[simp]`, but not definitions: unfold those with `simp add: f_def` ([9.2.3](module_09_EN.html#simp-rules)).

### Logic, sets and search {#methods-search}

| Method | Works on | When it fails | Section |
|---|---|---|---|
| `auto` | all subgoals: simplifies, applies safe rules, searches a little | leaves what it could not prove | [9.4.2](module_09_EN.html#auto) |
| `blast` | first subgoal: search in first-order logic, sets and relations | fails, with no hint | [9.4.1](module_09_EN.html#blast) |
| `force`, `fastforce` | first subgoal: search with rewriting at every step | fails, with no hint | [9.4.3](module_09_EN.html#force) |
| `clarsimp` | first subgoal: safe rules and the simplifier | does not try to finish; leaves the goal tidied | [9.4.4](module_09_EN.html#clarsimp) |
| `metis` | a first-order proof from the facts you name | fails, or runs for a long time | [9.8](module_09_EN.html#sledgehammer) |
| `sat` | propositional tautologies, with Isabelle's own SAT solver | fails with a countermodel | [2.8](module_02_EN.html#sat) |

`auto`, `force`, `fastforce` and `clarsimp` take the simplifier's modifiers, written `simp add:`, `simp del:`
and `split:`, and rules for the search: `intro:`, `elim:` and `dest:`. Examples from the modules:
`auto simp add: grant_def`, `auto split: if_splits`, `auto intro: step`, `auto elim: ev_SSE ev_1E`,
`blast intro: move.intros step stay` ([9.4.4](module_09_EN.html#clarsimp)). Modules 4 and 11 to 13 also
write `auto simp: trans_def`: `simp:` is short for `simp add:`.

### Arithmetic {#methods-arith}

| Method | Proves | Section |
|---|---|---|
| `linarith` | linear arithmetic over `nat`, `int` and `real` | [9.5](module_09_EN.html#arith) |
| `presburger` | linear arithmetic with quantifiers, divisibility, `div` and `mod` by numbers | [9.5](module_09_EN.html#arith) |
| `arith` | `linarith` first, then `presburger` | [9.5](module_09_EN.html#arith) |

Products of variables, such as `x * x ≤ y * y`, are outside all three: find a library lemma
([9.6](module_09_EN.html#find)).

### Rules by hand {#methods-rules}

| Situation | Method | Example | Section |
|---|---|---|---|
| The conclusion has a connective to break up | `rule` | `apply (rule conjI)` | [7.3.2](module_07_EN.html#backward-rule) |
| The conclusion is one of the assumptions | `assumption` | `apply assumption` | [7.3.3](module_07_EN.html#backward-assumption) |
| An assumption has a connective to take apart | `erule` | `apply (erule disjE)` | [7.4.1](module_07_EN.html#assumptions-erule) |
| An assumption gives a new fact | `drule`, or `frule` to keep it | `apply (drule mp)` | [7.4.3](module_07_EN.html#assumptions-drule) |
| Many steps of one kind | `intro`, `elim` | `apply (intro impI conjI)` | [7.4.4](module_07_EN.html#assumptions-intro) |
| You must choose the instance yourself | `rule_tac`, or `of` | `apply (rule_tac x = 3 in exI)` | [7.6.4](module_07_EN.html#quantifiers-inst) |

Fix first, guess later: apply `allI` and `exE`, which fix variables, before `exI`, `allE` and `spec`, which
create unknowns ([7.6.3](module_07_EN.html#quantifiers-order)).

### Induction and cases {#methods-induction}

| Method | What it does | Section |
|---|---|---|
| `induction n` | induction on `n`, following its datatype | [5.4.2](module_05_EN.html#induction-state) |
| `induction xs arbitrary: acc` | the same, for every value of `acc` at once | [11.2.2](module_11_EN.html#arbitrary) |
| `induction xs ys rule: merge.induct` | computation induction, following the recursion of `merge` | [11.5.3](module_11_EN.html#f-induct) |
| `induction rule: ev.induct` | rule induction on the first premise | [11.6.2](module_11_EN.html#rule-induction) |
| `induction n rule: less_induct` | complete induction | [11.8](module_11_EN.html#complete) |
| `cases l` | one case per constructor | [8.3.1](module_08_EN.html#enumerations) |
| `cases "x < lo"` | the condition holds, or it does not | [10.5.1](module_10_EN.html#cases-bool) |
| `cases` | with a fact `I t` passed to it: rule inversion | [11.6.3](module_11_EN.html#inversion) |

## Natural-deduction rules {#rules}

The rules of Module 6 and their names in Isabelle, with the statements as `thm` prints them
([7.2.2](module_07_EN.html#rules-table)). Question marks mark schematic variables.

| Rule | In words | Isabelle | Statement |
|---|---|---|---|
| [(∧I)](module_06_EN.html#and) | to prove A ∧ B, prove A and prove B | `conjI` | `⟦?P; ?Q⟧ ⟹ ?P ∧ ?Q` |
| [(∧E₁)](module_06_EN.html#and) | from A ∧ B, conclude A | `conjunct1` | `?P ∧ ?Q ⟹ ?P` |
| [(∧E₂)](module_06_EN.html#and) | from A ∧ B, conclude B | `conjunct2` | `?P ∧ ?Q ⟹ ?Q` |
| (∧E₁) and (∧E₂) at once | use both parts of A ∧ B | `conjE` | `⟦?P ∧ ?Q; ⟦?P; ?Q⟧ ⟹ ?R⟧ ⟹ ?R` |
| [(∨I₁)](module_06_EN.html#or) | to prove A ∨ B, prove A | `disjI1` | `?P ⟹ ?P ∨ ?Q` |
| [(∨I₂)](module_06_EN.html#or) | to prove A ∨ B, prove B | `disjI2` | `?Q ⟹ ?P ∨ ?Q` |
| [(∨E)](module_06_EN.html#or) | prove the goal from A, and from B | `disjE` | `⟦?P ∨ ?Q; ?P ⟹ ?R; ?Q ⟹ ?R⟧ ⟹ ?R` |
| [(⟶I)](module_06_EN.html#imp) | assume A, prove B | `impI` | `(?P ⟹ ?Q) ⟹ ?P ⟶ ?Q` |
| [(⟶E)](module_06_EN.html#imp) | modus ponens: from A ⟶ B and A, conclude B | `mp` | `⟦?P ⟶ ?Q; ?P⟧ ⟹ ?Q` |
| (⟶E), elimination form | the same, for an assumption A ⟶ B | `impE` | `⟦?P ⟶ ?Q; ?P; ?Q ⟹ ?R⟧ ⟹ ?R` |
| [(¬I)](module_06_EN.html#not) | assume A, prove ⊥ | `notI` | `(?P ⟹ False) ⟹ ¬ ?P` |
| [(¬E)](module_06_EN.html#not) | from ¬A and A, conclude ⊥ (and then anything) | `notE` | `⟦¬ ?P; ?P⟧ ⟹ ?R` |
| [(⊥E)](module_06_EN.html#not) | from ⊥, conclude any formula | `FalseE` | `False ⟹ ?P` |
| [(∀I)](module_06_EN.html#quantifiers) | prove P a for a fresh a | `allI` | `(⋀x. ?P x) ⟹ ∀x. ?P x` |
| [(∀E)](module_06_EN.html#quantifiers) | from ∀x. P x, conclude P t for any t | `spec` | `∀x. ?P x ⟹ ?P ?x` |
| (∀E), elimination form | the same, for an assumption ∀x. P x | `allE` | `⟦∀x. ?P x; ?P ?x ⟹ ?R⟧ ⟹ ?R` |
| [(∃I)](module_06_EN.html#quantifiers) | from P t, conclude ∃x. P x | `exI` | `?P ?x ⟹ ∃x. ?P x` |
| [(∃E)](module_06_EN.html#quantifiers) | name a witness a, assume P a, prove the goal | `exE` | `⟦∃x. ?P x; ⋀x. ?P x ⟹ ?Q⟧ ⟹ ?Q` |
| [(RAA)](module_06_EN.html#classical) | assume ¬A, prove ⊥ | `ccontr` | `(¬ ?P ⟹ False) ⟹ ?P` |
| (RAA), variant | assume ¬A, prove A | `classical` | `(¬ ?P ⟹ ?P) ⟹ ?P` |
| [(=I)](module_06_EN.html#equality) | reflexivity: t = t | `refl` | `?t = ?t` |
| [(=E)](module_06_EN.html#equality) | substitution: replace equals by equals | `subst` | `⟦?s = ?t; ?P ?s⟧ ⟹ ?P ?t` |
| (=E), right to left | the same, with the equation reversed | `ssubst` | `⟦?t = ?s; ?P ?s⟧ ⟹ ?P ?t` |
| none | prove A ⟷ B from both implications | `iffI` | `⟦?P ⟹ ?Q; ?Q ⟹ ?P⟧ ⟹ ?P = ?Q` |
| none | use A ⟷ B in one direction | `iffD1`, `iffD2` | `⟦?Q = ?P; ?Q⟧ ⟹ ?P`, `⟦?P = ?Q; ?Q⟧ ⟹ ?P` |

The same rules as steps of an apply script and of an Isar proof ([10.7.2](module_10_EN.html#translate-rules)).
`ab`, `imp`, `a`, `b`, `na`, `all`, `pa` and `ex` are the names of facts A ∧ B, A ⟶ B, A, B, ¬ A, ∀x. P x,
P a and ∃x. P x.

| Rule | Apply step | Isar |
|---|---|---|
| (⟶I) | `rule impI` | `assume "A"` … `show "B"` |
| (⟶E) | `erule impE` | `from imp a have "B" by (rule mp)` |
| (∧I) | `rule conjI` | `from a b have "A ∧ B" by (rule conjI)` |
| (∧E₁), (∧E₂) | `erule conjE` | `from ab have "A" by (rule conjunct1)` |
| (∨I₁) | `rule disjI1` | `from a have "A ∨ B" by (rule disjI1)` |
| (∨E) | `erule disjE` | `from ‹A ∨ B› show "C" proof` … `next` … `qed` |
| (¬I) | `rule notI` | `assume "A"` … `show False` |
| (¬E) | `erule notE` | `from na a show False by (rule notE)` |
| (∀I) | `rule allI` | `fix x` … `show "P x"` |
| (∀E) | `erule allE` | `from all have "P a" by (rule spec)` |
| (∃I) | `rule exI` | `from pa have "∃x. P x" by (rule exI)` |
| (∃E) | `erule exE` | `from ex obtain a where "P a" by blast` |
| (RAA) | `rule ccontr` | `proof (rule ccontr)` `assume "¬ A"` … `show False` |

## Isar {#isar}

Two proofs from Module 10: natural deduction written forwards, and an induction whose step is a
calculation.

```text
lemma "A ∧ B ⟶ B ∧ A"
proof (rule impI)
  assume ab: "A ∧ B"
  have b: "B" using ab by blast
  have a: "A" using ab by blast
  show "B ∧ A" using b a by blast
qed
```

```text
lemma "mysum (xs @ ys) = mysum xs + mysum ys"
proof (induction xs)
  case Nil
  show ?case by simp
next
  case (Cons x xs)
  have "mysum ((x # xs) @ ys) = x + mysum (xs @ ys)" by simp
  also have "… = x + (mysum xs + mysum ys)" using Cons.IH by simp
  also have "… = mysum (x # xs) + mysum ys" by simp
  finally show ?case .
qed
```

| Element | What it does | Section |
|---|---|---|
| `proof (rule r)` | starts a block by applying the rule r | [10.2.6](module_10_EN.html#shape-start) |
| `proof` | starts a block with the standard rule for the goal | [10.2.6](module_10_EN.html#shape-start) |
| `proof -` | starts a block without changing the goal | [10.2.5](module_10_EN.html#shape-assms) |
| `qed` | closes the block once every pending goal is solved | [10.2.1](module_10_EN.html#shape-blocks) |
| `assume ab: "A ∧ B"` | assumes a premise of the goal, under a name | [10.2.1](module_10_EN.html#shape-blocks) |
| `fix x` | takes an arbitrary value x | [10.2.4](module_10_EN.html#shape-fix) |
| `have b: "B"` | states an intermediate fact, with its own proof | [10.2.2](module_10_EN.html#shape-have) |
| `show "B ∧ A"` | states a claim that solves a pending goal | [10.2.1](module_10_EN.html#shape-blocks) |
| `next` | separates the proofs of different goals or cases | [10.2.3](module_10_EN.html#shape-nested) |
| `then` | passes `this`, the last fact, to the next claim (`from this`) | [10.3.1](module_10_EN.html#facts-then) |
| `from a`, `with a`, `using a` | pass named facts; `with a` is `from a this` | [10.3.2](module_10_EN.html#facts-names) |
| `note both = b a` | collects facts under a name | [10.3.2](module_10_EN.html#facts-names) |
| `hence`, `thus` | old forms of `then have` and `then show` | [10.3.2](module_10_EN.html#facts-names) |
| `obtain a where "admin a"` | introduces a witness for an existential fact (∃E) | [10.3.4](module_10_EN.html#facts-obtain) |
| `moreover` … `ultimately` | collects facts, then passes them all | [10.3.5](module_10_EN.html#facts-moreover) |
| `also` … `finally` | builds a chain of (in)equations; `…` is the previous right-hand side | [10.4.1](module_10_EN.html#calc-eq) |
| `.`, `..` | proof by the fact passed; proof by one standard rule step | [10.4.1](module_10_EN.html#calc-eq), [10.7.1](module_10_EN.html#translate-nd) |
| `assms`, `assms(i)` | the assumptions of the lemma | [10.2.5](module_10_EN.html#shape-assms) |
| `proof (cases "x < lo")` | `case True` … `next` `case False` | [10.5.1](module_10_EN.html#cases-bool) |
| `proof (cases xs)` | `case Nil` … `next` `case (Cons z zs)` | [10.5.2](module_10_EN.html#cases-datatype) |
| `consider (below) "x < lo"` … | your own cases, then `proof cases` and `case below` | [10.5.4](module_10_EN.html#cases-consider) |
| `proof (induction xs)` | `case Nil`, `case (Cons x xs)`, with `?case` | [10.6.1](module_10_EN.html#induction-skeleton) |
| `Cons.IH`, `Cons.prems` | the induction hypothesis; the premises of the claim | [10.6.2](module_10_EN.html#induction-names) |
| `ev_SS.hyps`, `"3.IH"(1)` | the premises of a rule; a numbered case, in quotes | [11.6.2](module_11_EN.html#rule-induction), [11.5.3](module_11_EN.html#f-induct) |

What `proof` with no method does depends on the goal ([10.2.6](module_10_EN.html#shape-start)):

| Goal | Standard rule | Inside the block |
|---|---|---|
| `A ⟶ B` | `impI` | `assume "A"` … `show "B"` |
| `A ∧ B` | `conjI` | `show "A"` … `next` … `show "B"` |
| `A ⟷ B` | `iffI` | `assume "A"` … `show "B"` `next` `assume "B"` … `show "A"` |
| `¬ A` | `notI` | `assume "A"` … `show False` |
| `∀x. P x` | `allI` | `fix x` … `show "P x"` |
| `∃x. P x` | `exI` | `show "P t"` for a witness t of your choice |

## Induction {#induction}

Choose the induction from the shape of the goal ([11.9](module_11_EN.html#choose)):

| The goal is about | Use | In Isabelle | Section |
|---|---|---|---|
| a function defined by one equation per constructor | structural induction | `induction xs` | [5.5](module_05_EN.html#structural) |
| a function whose recursion changes another argument | structural induction, generalised | `induction xs arbitrary: acc` | [11.2.2](module_11_EN.html#arbitrary) |
| a function with its own pattern of recursion | computation induction | `induction xs ys rule: f.induct` | [11.5.3](module_11_EN.html#f-induct) |
| a premise `I x` with `I` defined by `inductive` | rule induction | `induction rule: I.induct` | [11.6.2](module_11_EN.html#rule-induction) |
| what a single fact `I t` implies | rule inversion | `cases`, `inductive_cases` | [11.6.3](module_11_EN.html#inversion) |
| a step that needs some smaller value | complete induction | `induction n rule: less_induct` | [11.8](module_11_EN.html#complete) |

- First try `by (induction xs) auto`, on the argument that the function takes apart
  ([5.4.3](module_05_EN.html#by-induction), [5.5.1](module_05_EN.html#list-induction)).
- In the proof state, read `⋀n.` as "for an arbitrary n"; the induction hypothesis stands to the left of
  `⟹` ([5.4.2](module_05_EN.html#induction-state)).
- Rule induction works on the first premise, whose arguments must be variables
  ([11.7.1](module_11_EN.html#closure), [11.7.2](module_11_EN.html#constants)).
- The cases are named after the constructors (`Nil`, `Cons`, `0`, `Suc`), the rules (`ev_0`, `ev_SS`), the
  equations (`1`, `2`, `3`), or `less` for `less_induct` ([10.6.1](module_10_EN.html#induction-skeleton),
  [11.8](module_11_EN.html#complete)).

When the induction gets stuck, read the goal that is left and compare the induction hypothesis with the
conclusion ([11.9](module_11_EN.html#choose)):

| The stuck goal shows | Remedy | Section |
|---|---|---|
| a term that no equation can rewrite | prove the missing lemma first, as `[simp]` | [5.5.3](module_05_EN.html#lemmas), [11.3](module_11_EN.html#lemmas) |
| the IH fixes an argument (`0`, `[]`, `acc`) that the conclusion needs with another value | generalise: a variable instead of the constant, and `arbitrary:` | [11.2](module_11_EN.html#generalise) |
| an IH that is true but says too little | strengthen the claim | [11.2.3](module_11_EN.html#strengthen), [5.6](module_05_EN.html#strong) |
| an IH about the wrong argument | induction on another variable, or computation induction | [5.5.1](module_05_EN.html#list-induction), [11.5](module_11_EN.html#computation) |
| goals that make no sense after rule induction | variables in the inductive premise | [11.7.2](module_11_EN.html#constants) |
| a fact about a term built from constructors | rule inversion | [11.6.3](module_11_EN.html#inversion) |

## Isabelle/jEdit {#jedit}

### Panels {#jedit-panels}

| Panel | Where | What it shows | Section |
|---|---|---|---|
| **Output** | bottom | the messages of the command at the cursor; tick **Proof state** to see goals there | [1.6](module_01_EN.html#tour) |
| **State** | right | the proof state, while **Proof state** in the Output panel is not ticked | – |
| **Theories** | right | **Prover: ready**, and the progress of each open theory | [1.6](module_01_EN.html#tour) |
| **Documentation** | left | the manuals; **prog-prove** is the tutorial Part III follows | [1.6](module_01_EN.html#tour) |
| **Symbols** | bottom | every symbol, inserted with a click | [1.6](module_01_EN.html#tour) |
| **Query** | bottom | the **Find Theorems** tab, with a **Find:** field and an **Apply** button | [9.6](module_09_EN.html#find) |
| **Sledgehammer** | bottom | **Apply** runs the provers, **Cancel** stops them; click a proof to insert it | [9.8](module_09_EN.html#sledgehammer) |
| **File Browser** | left | generated code, under `isabelle-export:` | [8.8](module_08_EN.html#codegen) |

### Keys and mouse {#jedit-keys}

| Keys | Action | Section |
|---|---|---|
| hover over underlined text | shows its message | [1.6](module_01_EN.html#tour) |
| <kbd>Ctrl</kbd> and hover over a name | shows its type and definition; click to jump there | [1.6](module_01_EN.html#tour) |
| <kbd>Tab</kbd> | accepts a completion, such as a symbol | [1.6](module_01_EN.html#tour) |
| <kbd>Ctrl</kbd>+<kbd>S</kbd> | saves the theory | [1.7.5](module_01_EN.html#first-refute) |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> | shows the tooltip at the cursor | – |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd> | shows the message at the cursor | – |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd> | lists the messages of the current line | – |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>, <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> | jumps to the first error, the last error | – |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>N</kbd>, <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> | jumps to the next error, the previous error | – |

On macOS, use <kbd>Cmd</kbd> instead of <kbd>Ctrl</kbd>.

### Signs to read {#jedit-signs}

| You see | It means | Section |
|---|---|---|
| a blue **i** in the gutter | information, for example from Auto Quickcheck or Auto solve_direct | [1.7.5](module_01_EN.html#first-refute) |
| a red **!** and a red underline | an error in that command | [1.7.5](module_01_EN.html#first-refute) |
| ⌂ in a message | a link to the position the message is about | [1.7.5](module_01_EN.html#first-refute) |
| a name in blue | a free variable, perhaps a misspelt constant | [8.1.2](module_08_EN.html#terms) |
| a line starting with `theorem` above a failed proof | nothing: the red message is what counts | [1.7.5](module_01_EN.html#first-refute) |
| **Proof outline with cases:** | a skeleton for the proof; click it to insert it | [10.5.1](module_10_EN.html#cases-bool) |
