---
title: Proof automation
part: 3
lead: Use Isabelle's automatic tools with understanding. Steer the simplifier, choose the right method for logic, sets and arithmetic, find lemmas and counterexamples, call Sledgehammer, and know what to do when automation fails.
minutes: 210
needs: Modules 1–8, especially induction (Module 5), rules (Module 7) and definitions (Module 8)
goals:
  - Explain how the simplifier rewrites a goal, and steer it with simp rules, `add:`, `del:`, `only:` and `split:`
  - Recognise conditional rules, case splits and rules that loop, and read a simplifier trace
  - Choose between `simp`, `auto`, `blast`, `force`, `fastforce` and the arithmetic methods, and recognise how each one fails
  - Search the library with `find_theorems`, and test claims with Quickcheck and Nitpick before proving them
  - Run Sledgehammer, use the proofs it suggests, and explain why they can be trusted
  - Follow a plan when automation fails
imports: Main
---

## The automation toolbox {#toolbox}

Since Module 1 you have finished proofs with a single word: `by simp`, `by auto`, `by blast`. Each of these
words starts a program that searches for a proof. When it works, it saves you dozens of rule applications.
When it fails, it can leave you puzzled: the goal looked easy, and Isabelle only says that the method failed.
This module opens the toolbox. You will learn how the tools work, what each one is good at, how to steer
them, and what to do when none of them works.

First, a reminder of why it is safe to use tools whose inner workings you do not know in detail. In
Section 1.4 you met the LCF architecture: only the small kernel can make a theorem. Every tool in this
module, however clever, ends by asking the kernel to check each inference. A tool can fail, or run for a
long time, but it cannot turn a false statement into a theorem. This holds even for Sledgehammer, which
calls programs outside Isabelle; Section 9.8 shows how.

| Tool | What it does | Good for |
|---|---|---|
| `simp` | rewrites the goal with equations, from left to right | equations, definitions, functions on lists and numbers |
| `auto` | `simp` plus logical reasoning, on every subgoal | many easy subgoals at once |
| `blast` | searches for a proof with the rules of logic | logic, sets and relations |
| `force`, `fastforce` | logic and rewriting together, on the first subgoal | quantifiers mixed with equations |
| `linarith`, `arith`, `presburger` | decide questions of arithmetic | inequalities; even and odd; `div` and `mod` by numbers |
| `find_theorems` | searches the library | finding the lemma you need |
| `quickcheck`, `nitpick` | search for counterexamples | testing a claim before you try to prove it |
| `sledgehammer` | asks external provers, returns a proof that Isabelle checks | goals that follow from a few library lemmas |

### A running example: access control {#acl}

So that every tool has real work to do, this module uses one example throughout. A document-sharing
service decides who may do what with each document. For every document it keeps an **access-control list**
(ACL): a list of entries, each of which gives one user one permission.

```isabelle
datatype perm = Read | Write | Admin

type_synonym 'u acl = "('u × perm) list"
```

The datatype `perm` has three values. `type_synonym` gives a type a shorter name: `'u acl` is the type
`('u × perm) list`, a list of pairs of a user and a permission. The type variable `'u` is the type of
users. The examples below use strings such as `''ann''`; Isabelle writes a string between two pairs of
single quotes.

```isabelle
fun allows :: "'u acl ⇒ 'u ⇒ perm ⇒ bool" where
  "allows [] u p = False"
| "allows (e # es) u p = (e = (u, p) ∨ allows es u p)"

definition grant :: "'u ⇒ perm ⇒ 'u acl ⇒ 'u acl" where
  "grant u p es = (u, p) # es"

fun revoke :: "'u ⇒ 'u acl ⇒ 'u acl" where
  "revoke u [] = []"
| "revoke u (e # es) = (if fst e = u then revoke u es else e # revoke u es)"
```

`allows es u p` holds when the list `es` gives user `u` permission `p`, that is, when some entry is the
pair `(u, p)`. `grant u p es` adds the entry `(u, p)` at the front. `revoke u es` removes every entry of
user `u`: `fst e` is the first component of the pair `e`, its user. Notice that `grant` is a `definition`
and the other two are defined with `fun`. The difference matters to the simplifier, as you will see in
Section 9.2. A quick test:

```isabelle
value "allows [(''ann'', Read), (''bob'', Write)] ''bob'' Write"
```

```output
"True"
  :: "bool"
```

```isabelle
value "revoke ''ann'' (grant ''ann'' Admin [(''bob'', Write), (''ann'', Read)])"
```

```output
"[(''bob'', Write)]"
  :: "(char list × perm) list"
```

The type in the second answer shows that a string is a list of characters, `char list`.

## Rewriting with the simplifier {#simp}

### Rewriting on paper {#rewriting}

The simplifier does one thing: it **rewrites**. Given an equation `l = r`, it looks for a part of the goal
that has the shape of `l`, and replaces that part with the corresponding instance of `r`. It repeats this
until no equation applies any more. If the goal has become `True`, it is proved.

Here is a worked example with four equations. The first two are the definition of `grant` and the second
equation of `allows`; the other two are laws of logic.

| No. | Equation |
|---|---|
| (1) | `grant u p es = (u, p) # es` |
| (2) | `allows (e # es) u p = (e = (u, p) ∨ allows es u p)` |
| (3) | `(x = x) = True` |
| (4) | `(True ∨ P) = True` |

::: example Rewriting a goal to True
Take the goal `allows (grant u Read es) u Read`: user `u` may read after being granted read access.

1. The subterm `grant u Read es` has the shape of the left side of (1), with `u` for `u`, `Read` for `p`
   and `es` for `es`. Replace it: the goal becomes `allows ((u, Read) # es) u Read`.
2. The whole goal now has the shape of the left side of (2), with `(u, Read)` for `e`. Replace it:
   `(u, Read) = (u, Read) ∨ allows es u Read`.
3. The subterm `(u, Read) = (u, Read)` matches (3), with `(u, Read)` for `x`:
   `True ∨ allows es u Read`.
4. This matches (4): the goal is `True`, and the proof is finished.

Equation (2) never rewrites `allows es u Read`, because `es` is not of the form `e # es`. That part of the
goal stays as it is, but after step 4 it no longer matters.
:::

The variables in an equation are placeholders. In Isabelle's display of theorems they carry a question
mark, `?u`, like the schematic variables of Module 7. To use an equation, the simplifier finds terms for its
variables that make the left side identical to a part of the goal. This is **matching**. It is unification
from Module 7 in one direction only: the variables of the equation may be instantiated, those of the goal
may not.

::: definition Rewriting
A **rewrite rule** is an equation `l = r` that is used from left to right only. To **rewrite** a term with
a set of rules is to replace, again and again, a subterm that is an instance of some left side `l` by the
same instance of the right side `r`. A term that no rule can rewrite is in **normal form**. The simplifier
proves a goal by rewriting it to `True`.
:::

In logic, `l = r` and `r = l` say the same. The simplifier still uses each equation in one direction only,
and that is what makes it fast and predictable: it never has to choose between going forwards and going
back. It also follows a fixed order. Before it rewrites a term, it rewrites the parts of the term, from
the inside out, as Figure 9.1 shows.

::: figure id=fig-09-1
The simplifier at work on `allows (grant u Read es) u Read`. At each step the highlighted part is
rewritten with the rule named on the arrow. Inner parts are rewritten before the term around them.
:::

### Watching it in Isabelle {#simp-only}

You can make Isabelle take the steps of the example one at a time. `simp only: r₁ r₂` rewrites with the
rules `r₁ r₂` and with no others:

```isabelle
lemma "allows (grant u Read es) u Read"
  apply (simp only: grant_def)
```

```output state
proof (prove)
goal (1 subgoal):
 1. allows ((u, Read) # es) u Read
```

`grant_def` is the theorem that the `definition` command created: `grant ?u ?p ?es = (?u, ?p) # ?es`. It
is rule (1). Rule (2) belongs to `allows.simps`, the equations that `fun` proved for `allows`:

```isabelle
  apply (simp only: allows.simps)
```

```output state
proof (prove)
goal (1 subgoal):
 1. (u, Read) = (u, Read) ∨ allows es u Read
```

Even `(u, Read) = (u, Read)` is left untouched, because you allowed no rule that applies to it. Rules (3)
and (4) belong to `simp_thms`, a collection of basic laws of logic:

```isabelle
  apply (simp only: simp_thms)
  done
```

```output state
proof (prove)
goal:
No subgoals!
```

### Where simp rules come from {#simp-rules}

Plain `simp` does not take a list of rules. It uses the **simp set**, a large collection of rules that
grows as theories are loaded:

- the equations of every function defined with `fun` or `primrec`, such as `allows.simps` and
  `revoke.simps`;
- facts that `datatype` proves: the constructors are different (`Read ≠ Write`), and a constructor applied
  to different arguments gives different values, so `((a, b) = (c, d)) = (a = c ∧ b = d)`;
- thousands of library lemmas that carry the attribute `[simp]`, such as `rev (rev xs) = xs`;
- your own lemmas, when you give them `[simp]`.

::: definition Simp rule and simp set
A **simp rule** is a theorem that the simplifier uses without being told. The **simp set** is the
collection of all simp rules at a point of a theory. You make a lemma a simp rule by writing `[simp]` after
its name, or later with `declare name [simp]`; `declare name [simp del]` removes it again.
:::

One thing is missing from the list: definitions. A `definition` is not a simp rule, so `simp` treats
`grant` as an unknown function:

```isabelle fails
lemma "allows (grant u Read es) u Read"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. allows (grant u Read es) u Read
```

"Failed to apply initial proof method" means that `simp` could not change the goal at all: no rule in the
simp set matches any part of it. Tell `simp` to use the definition, with `add:`:

```isabelle
lemma "allows (grant u Read es) u Read"
  by (simp add: grant_def)
```

Why are definitions not simp rules? A definition introduces a new idea, such as "grant a permission". Once
you have proved the properties of the idea that you need, later proofs should use those properties and
not the definition. If you change the definition later, only the proofs of the properties have to change.
So the usual style is to prove a few laws about a defined function, and make the laws simp rules:

```isabelle
lemma allows_grant [simp]:
  "allows (grant u p es) v q = ((u, p) = (v, q) ∨ allows es v q)"
  by (simp add: grant_def)
```

From now on `simp` knows how `allows` and `grant` work together, without looking inside `grant`:

```isabelle
lemma "allows (grant u Read (grant v Write es)) v Write"
  by simp
```

::: pitfall
To the simplifier, `u = v` and `v = u` are different terms. No simp rule turns one into the other: such a
rule could be applied again and again. So the order in which you write an equation can decide whether
`simp` succeeds. State `allows_grant` with the sides of the equation swapped, and the same proof fails:

```isabelle fails
lemma "allows (grant u p es) v q = ((v, q) = (u, p) ∨ allows es v q)"
  by (simp add: grant_def)
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. (u = v ∧ p = q ∨ allows es v q) =
***     (v = u ∧ q = p ∨
***      allows es v
***       q)
```

The simplifier rewrote both sides as far as it could and was left with `u = v ∧ p = q` on the left and
`v = u ∧ q = p` on the right. Write the lemma in the orientation that the definitions produce, or use
`auto` (Section 9.4), which reasons about equality in both directions.
:::

### `add:`, `del:`, `only:` and `simp_all` {#modifiers}

You have now seen most of the ways to change the rules that the simplifier uses. Here they are together.

| Method | Uses |
|---|---|
| `simp` | the simp set and the assumptions of the first subgoal |
| `simp add: a b` | the simp set, plus the theorems `a` and `b` |
| `simp del: a` | the simp set without `a` |
| `simp only: a b` | only `a` and `b`, plus the assumptions |
| `simp_all` | like `simp`, on every subgoal |

`del:` removes a rule for one call, for example a simp rule that rewrites a term into a form you do not
want. Without `allows_grant` the simplifier is back where it started:

```isabelle fails
lemma "allows (grant u Read (grant v Write es)) v Write"
  by (simp del: allows_grant)
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. allows (grant u Read (grant v Write es)) v Write
```

`simp` works on the first subgoal only. After `induction` there are usually several subgoals, and
`simp_all` simplifies them all. Here is a law that later sections need:

```isabelle
lemma allows_append [simp]:
  "allows (es @ fs) u p = (allows es u p ∨ allows fs u p)"
  apply (induction es)
```

```output state
proof (prove)
goal (2 subgoals):
 1. allows ([] @ fs) u p = (allows [] u p ∨ allows fs u p)
 2. ⋀a es.
       allows (es @ fs) u p = (allows es u p ∨ allows fs u p) ⟹
       allows ((a # es) @ fs) u p = (allows (a # es) u p ∨ allows fs u p)
```

```isabelle
  apply simp_all
  done
```

In the second subgoal the simplifier used the induction hypothesis, an assumption of that subgoal, as a
rewrite rule. Section 9.3 explains how simp uses assumptions.

::: keyidea
The simplifier is predictable. It uses the rules of the simp set, plus what you add, from left to right,
and nothing else. When `simp` fails, ask which equation it would have needed, and whether that equation
is in the simp set.
:::

::: trouble
The two messages of a failed `by` mean different things:

- **"Failed to apply initial proof method"**: the method could not do anything with the goal. For `simp`,
  no rule applied at all. Often a definition is not unfolded, or a needed lemma is not a simp rule.
- **"Failed to finish proof"**: the method made progress but did not prove the goal. The message shows what
  is left. Read it: it tells you what the simplifier could not do.
:::

## Steering the simplifier {#steering}

### Conditional rewrite rules {#conditional}

Many useful equations hold only under a condition. Revoking `u`'s entries does not change what another user
`v` may do, but only if `v` really is another user:

```isabelle
lemma revoke_other [simp]: "v ≠ u ⟹ allows (revoke u es) v p = allows es v p"
  by (induction es) auto

lemma revoke_self [simp]: "allows (revoke u es) u p = False"
  by (induction es) auto
```

::: definition Conditional rewrite rule
A **conditional rewrite rule** has the form `H ⟹ l = r`, or `⟦H₁; …; Hₙ⟧ ⟹ l = r` with several
conditions. Before the simplifier replaces an instance of `l` by the same instance of `r`, it tries to prove
the same instance of each condition `Hᵢ`, by simplification. If it cannot, it does not use the rule.
:::

Two concrete users are clearly different, and the simplifier can prove it:

```isabelle
lemma "allows (revoke ''ann'' es) ''bob'' Read = allows es ''bob'' Read"
  by simp
```

To use `revoke_other` here, the simplifier had to prove the condition `''bob'' ≠ ''ann''`. It did, by
simplifying the condition to `True`: the two strings differ in their first character. With variables in
place of the names, the condition cannot be proved, and the rule is not used:

```isabelle fails
lemma "allows (revoke u es) v p = allows es v p"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. allows (revoke u es) v p = allows es v p
```

The simplifier is right to stop: the claim is false when `v = u`.

::: pitfall
The conditions of a rule must be simpler than its left side, or the simplifier can run in circles. The rule
`Suc n < m ⟹ (n < m) = True` is true, but as a simp rule it loops: to rewrite `n < m`, the simplifier must
first prove `Suc n < m`, which the same rule rewrites if it can prove `Suc (Suc n) < m`, and so on. The
simplifier gives up only after 100 nested attempts, the default of its option `simp_depth_limit`.
:::

### How simp uses assumptions {#assumptions}

By default the simplifier uses the assumptions of a subgoal, the formulas before ⟹, as extra rewrite rules,
and it simplifies the assumptions too. It turns each assumption into a rule:

- an equation `t = s` is used to rewrite `t` to `s`;
- a negation `¬ P` becomes `P = False`, so `v ≠ u` becomes `(v = u) = False`;
- any other formula `P` becomes `P = True`;
- `∀x. P x ⟶ Q x` becomes the conditional rule `P ?x ⟹ Q ?x = True`.

So the false claim above becomes true, and provable by `simp`, once you add the assumption it needs:

```isabelle
lemma "v ≠ u ⟹ allows (revoke u es) v p = allows es v p"
  by simp
```

The assumption gave the rule `(v = u) = False`, which proved the condition `v ≠ u` of `revoke_other`. The
last kind of assumption in the list is how simp uses a general fact about all users. Suppose that every
user who may write may also read, and that `u` may write:

```isabelle
lemma "⟦∀w. allows es w Write ⟶ allows es w Read; allows es u Write⟧
       ⟹ allows es u Read"
  by simp
```

The first assumption became the conditional rule `allows es ?w Write ⟹ allows es ?w Read = True`. To
rewrite the goal `allows es u Read` with it, the simplifier had to prove `allows es u Write`, and the second
assumption, now the rule `allows es u Write = True`, did that.

::: tip
Assumptions can also make the simplifier loop. An assumption such as `∀x. f x = g (f x)` becomes a rule
that rewrites `f x` to a term that contains `f x` again. If a goal has such an assumption that the proof
does not need, `simp (no_asm)` ignores the assumptions of the subgoal.
:::

### Case splits {#splits}

A goal that contains `if c then a else b` cannot be simplified much as it is: the simplifier does not know
whether `c` holds. So it **splits** the goal into two cases, one where `c` holds and one where it does not,
with this library rule:

```isabelle
thm if_split
```

```output result
?P (if ?Q then ?x else ?y) = ((?Q ⟶ ?P ?x) ∧ (¬ ?Q ⟶ ?P ?y))
```

Read `?P` as "the rest of the goal around the `if`". The simplifier splits `if`s automatically. You can
watch it in the proof of a law about `revoke`, whose definition contains an `if`:

```isabelle
lemma allows_revoke: "allows (revoke u es) v p = (v ≠ u ∧ allows es v p)"
  apply (induction es)
  apply simp_all
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a es.
       allows (revoke u es) v p = (v ≠ u ∧ allows es v p) ⟹
       (fst a = u ⟶
        (v ≠ u ∧ allows es v p) = (v ≠ u ∧ (a = (v, p) ∨ allows es v p))) ∧
       (fst a ≠ u ⟶
        (a = (v, p) ∨ v ≠ u ∧ allows es v p) =
        (v ≠ u ∧ (a = (v, p) ∨ allows es v p)))
```

The base case is proved. In the step case the simplifier unfolded `revoke u (a # es)`, split the `if` on
`fst a = u` into the two implications you see, and used the induction hypothesis. Then it got stuck. To go
on, it would have to conclude from `a = (v, p)` that `fst a = v`, and the simplifier does not look inside a
pair variable such as `a`. `auto`, which you meet in Section 9.4, first replaces a pair variable by a pair
of two variables, and then finishes:

```isabelle
  apply auto
  done
```

A `case` expression is different: the simplifier does not split it automatically, because for a recursive
datatype that could go on for ever. Here is a function with a `case`. The first entry with the permission
`Admin` names the owner of a document, and only the owner may delete it:

```isabelle
fun owner :: "'u acl ⇒ 'u option" where
  "owner [] = None"
| "owner (e # es) = (if snd e = Admin then Some (fst e) else owner es)"

definition may_delete :: "'u ⇒ 'u acl ⇒ bool" where
  "may_delete u es = (case owner es of None ⇒ False | Some v ⇒ v = u)"
```

The type `'u option` (Module 8) has the values `None` and `Some v`. `snd e` is the second component of `e`,
its permission. After unfolding the definition, the simplifier gets stuck at the `case`:

```isabelle
lemma "may_delete u es = (owner es = Some u)"
  apply (simp add: may_delete_def)
```

```output state
proof (prove)
goal (1 subgoal):
 1. (case owner es of None ⇒ False | Some v ⇒ v = u) = (owner es = Some u)
```

The modifier `split:` names a rule that splits a `case`. For a datatype `t` the rule is called `t.split`,
so for `option` it is `option.split`:

```isabelle
thm option.split
```

```output result
?P (case ?option of None ⇒ ?f1.0 | Some x ⇒ ?f2.0 x) =
((?option = None ⟶ ?P ?f1.0) ∧ (∀x2. ?option = Some x2 ⟶ ?P (?f2.0 x2)))
```

The rule turns the `case` into two implications, one for each constructor, just as `if_split` does for an
`if`. With it, the simplifier finishes:

```isabelle
  apply (simp split: option.split)
  done
```

The same works for lists with `list.split` and for natural numbers with `nat.split`. These rules split a
`case` in the conclusion of a goal. A `case` or an `if` in an assumption needs the variants `option.splits`
and `if_splits`, with an `s` at the end. With `option.split`, the `case` in the assumption stays:

```isabelle fails
lemma "may_delete u es ⟹ owner es = Some u"
  by (simp add: may_delete_def split: option.split)
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. case owner es of None ⇒ False | Some v ⇒ v = u ⟹ owner es = Some u
```

```isabelle
lemma "may_delete u es ⟹ owner es = Some u"
  by (simp add: may_delete_def split: option.splits)
```

### Rules that loop {#loops}

Nothing guarantees that rewriting stops. The library has the simp rule `append_assoc`:
`(xs @ ys) @ zs = xs @ (ys @ zs)`. Suppose you added its mirror image, `xs @ (ys @ zs) = (xs @ ys) @ zs`,
as a simp rule. Then a goal containing `es @ (fs @ gs)` would be rewritten like this:

$$
\texttt{es @ (fs @ gs)} \;\to\; \texttt{(es @ fs) @ gs} \;\to\; \texttt{es @ (fs @ gs)} \;\to\; \cdots
$$

The simplifier would never stop. In Isabelle/jEdit the proof keeps running and never finishes. Remove the
rule from the text, and Isabelle checks the changed text again.

::: pitfall
It is your job to keep the simp set terminating. A rule of thumb: the right side of a simp rule should be
simpler than its left side, and the conditions of a conditional rule simpler than its left side. Never add
both an equation and its mirror image. If you need a simp rule in the other direction for one call, write
`simp flip: name`: it removes the rule and adds its mirror image, for that call only.
:::

Some useful equations look as if they must loop. Granting two permissions in either order gives the same
set of entries, which is an instance of this library rule:

```isabelle
thm insert_commute
```

```output result
insert ?x (insert ?y ?A) = insert ?y (insert ?x ?A)
```

Used again and again, the rule would swap `x` and `y` back and forth. Isabelle recognises such
**permutative** rules, whose two sides are the same up to the order of the variables, and uses them only
when the result is smaller in a fixed order on terms. So the rule swaps two elements into order, and then
stops:

```isabelle
lemma "insert b (insert a A) = X"
  apply (simp only: insert_commute)
  oops
```

```output state
proof (prove)
goal (1 subgoal):
 1. insert a (insert b A) = X
```

The goal `insert a (insert b A) = X` is already in order, so the rule does not apply to it again. Applied
to both sides of an equation, ordered rewriting brings both into the same order:

```isabelle
lemma "set (grant u p (grant v q es)) = set (grant v q (grant u p es))"
  by (simp add: grant_def insert_commute)
```

The same idea handles operators that are associative and commutative, such as `+`, `*`, `∪` and `∩`. With
associativity oriented from left to right and two permutative rules, the simplifier sorts the operands into
a fixed order. For `∪` the three rules, plus one more, are collected under the name `Un_ac`:

```isabelle
thm Un_ac
```

```output result
  ?A ∪ ?B ∪ ?C = ?A ∪ (?B ∪ ?C)
  ?A ∪ (?A ∪ ?B) = ?A ∪ ?B
  ?A ∪ ?B = ?B ∪ ?A
  ?A ∪ (?B ∪ ?C) = ?B ∪ (?A ∪ ?C)
```

```isabelle
lemma "C ∪ B ∪ A = X"
  apply (simp only: Un_ac)
  oops
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∪ (B ∪ C) = X
```

Two unions with the same operands in any order and grouping reach the same normal form, so their equality
is proved by `simp only: Un_ac`. The name `ac_simps` collects such rules for many operators at once.

### Tracing {#tracing}

When the simplifier does something unexpected, you can ask it to report every step. Put
`using [[simp_trace]]` before the method. The double brackets set a configuration option, here for this
proof only:

```isabelle
lemma "allows (grant u Read es) u Read"
  using [[simp_trace]] by simp
```

The **trace** appears in the Output panel, below the proof state. For this proof it reads:

```text
[1]SIMPLIFIER INVOKED ON THE FOLLOWING TERM:
allows (grant u Read es) u Read
[1]Applying instance of rewrite rule "allows_grant":
allows (grant ?u1 ?p1 ?es1) ?v1 ?q1 ≡
(?u1, ?p1) = (?v1, ?q1) ∨ allows ?es1 ?v1 ?q1
[1]Rewriting:
allows (grant u Read es) u Read ≡ (u, Read) = (u, Read) ∨ allows es u Read
[1]Applying instance of rewrite rule "simp_thms(6)":
?x1 = ?x1 ≡ True
[1]Rewriting:
(u, Read) = (u, Read) ≡ True
[1]Applying instance of rewrite rule "simp_thms(30)":
True ∨ ?P1 ≡ True
[1]Rewriting:
True ∨ allows es u Read ≡ True
```

These are the steps of the example in Section 9.2, except that the simplifier used the lemma
`allows_grant` instead of unfolding `grant`. Each "Applying instance of rewrite rule" names a rule:
`simp_thms(6)` is the sixth law in `simp_thms`. The rule is written with `≡`, the equality of Isabelle's
meta-logic in which rewrite rules are stored, and with its variables numbered (`?u1`). Each "Rewriting:"
shows the instance that was used: which part of the goal, and what it became. The `[1]` is the depth.
When the simplifier calls itself to prove the condition of a conditional rule, those steps are marked
`[2]`; they are hidden unless you also raise the option `simp_trace_depth_limit`, whose default is 1, for
example with `using [[simp_trace, simp_trace_depth_limit = 3]]`.

A trace can be long. Isabelle/jEdit shows at most 1000 trace messages for a command, then pauses with the
message "Tracing paused. Stop, or continue with next 100, 1000, 10000 messages?". If that happens with a
small goal, suspect a rule that loops. Remove `using [[simp_trace]]` when you are done.

## Logic and sets: blast, auto and friends {#classical}

The simplifier rewrites. It never searches: it does not try a step, find that it leads nowhere, and go back
to try another. Many goals need such a search. Which assumption should be used? Which value should an
`∃` get? Isabelle's **classical reasoner** answers these questions by searching. It applies the
introduction and elimination rules of natural deduction from Modules 6 and 7, together with the rules
declared for sets and relations, and it backtracks when a choice fails.

::: definition Safe and unsafe rules
A rule is **safe** if applying it to a provable goal always leaves provable subgoals, as `conjI` and `impI`
do. A rule is **unsafe** if it might turn a provable goal into an unprovable one: `disjI1` reduces `P ∨ Q`
to `P`, which may be the wrong choice, and `allE` must guess a term for the variable. The classical reasoner
applies safe rules freely and unsafe rules only with backtracking.
:::

To give the classical reasoner real work, extend the running example with roles. In a larger service,
permissions belong to roles and users have roles. Two relations, sets of pairs as in Module 4, describe
this. `UR` contains `(u, r)` when user `u` has role `r`; `RP` contains `(r, p)` when role `r` grants
permission `p`. A user has a permission when one of the user's roles grants it. Isabelle writes this
composition of relations as `UR O RP`:

```isabelle
thm relcomp_unfold
```

```output result
?r O ?s = {(x, z). ∃y. (x, y) ∈ ?r ∧ (y, z) ∈ ?s}
```

### blast {#blast}

`blast` is a search procedure for first-order logic, the logic of ∀, ∃ and the connectives from
Module 3, with the rules for sets and relations built in. Here is a policy fact: if every role that grants
`Write` also grants `Read`, then every user who may write may read.

```isabelle
lemma "⟦∀r. (r, Write) ∈ RP ⟶ (r, Read) ∈ RP; (u, Write) ∈ UR O RP⟧
       ⟹ (u, Read) ∈ UR O RP"
  by blast
```

On paper the proof needs a role `r` with `(u, r) ∈ UR` and `(r, Write) ∈ RP`, an instance of the `∀` for
that `r`, and the role `r` again as the witness for the `∃` hidden in `O`. `blast` found all three. Giving
users more roles never takes a permission away:

```isabelle
lemma "UR ⊆ UR' ⟹ UR O RP ⊆ UR' O RP"
  by blast
```

`blast` is a **complete** method for first-order logic: given unlimited time, it finds a proof of every
valid first-order formula. In practice it searches only to a limited depth. It does no rewriting and knows
little about equality, so it fails on goals that need definitions unfolded, functions computed or
arithmetic:

```isabelle fails
lemma "allows (grant u Read es) u Read"
  by blast
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. allows (grant u Read es) u Read
```

`blast` either proves the goal or fails with this message. It never leaves a partly proved goal behind, so
when it fails it gives you no hint why.

### auto {#auto}

`auto` combines the two worlds. It simplifies, applies safe rules, and tries a bounded search with unsafe
rules, on every subgoal. It proves the subgoals it can and leaves the rest, simplified, in the proof state.
That makes it good at goals with many easy parts, and at telling you what it could not do. Here is a false
claim about roles: removing the pair `(r, p)` from `RP` does not take permission `p` away from anyone.

```isabelle
lemma "(u, p) ∈ UR O RP ⟹ (u, p) ∈ UR O (RP - {(r, p)})"
  apply auto
  oops
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀y. ⟦(u, y) ∈ UR; (y, p) ∈ RP⟧ ⟹ (u, p) ∈ UR O (RP - {(r, p)})
```

`auto` took the composition apart and left one subgoal, which you can read as a statement about roles. It
is not provable, because the role `y` that gives `u` the permission may be `r` itself. When `auto` leaves a
subgoal that you think should be easy, read it carefully: it may be false, as here, or it may need a lemma
that `auto` does not know. Section 9.7 shows how to tell the difference automatically.

### force and fastforce {#force}

Some goals need search and rewriting at the same time. A storage service keeps every log twice in a row,
so every log in the set `A` is some list `ys` followed by itself. Then every log in `A` has even length:

```isabelle fails
lemma "⟦∀xs ∈ A. ∃ys. xs = ys @ ys; us ∈ A⟧ ⟹ ∃n. length us = n + n"
  by auto
```

```output
```

`auto` could do nothing with this goal, and `blast` fails too, because the proof needs the equation
`length (ys @ ys) = length ys + length ys` in the middle of the search. `fastforce` combines the search of
the classical reasoner with the simplifier at every step:

```isabelle
lemma "⟦∀xs ∈ A. ∃ys. xs = ys @ ys; us ∈ A⟧ ⟹ ∃n. length us = n + n"
  by fastforce
```

`force` does the same with a more thorough search. It sometimes succeeds where `fastforce` fails, and
it can take much longer. Both work on the first subgoal only, and like `blast` they either prove it or
fail.

### clarsimp {#clarsimp}

`clarsimp` applies safe rules and the simplifier. Unlike `auto`, it does not use logic to split a goal
into several subgoals, and it never guesses. It does not try to finish the proof; it tidies the goal so
that you can see what remains:

```isabelle
lemma "∀u. (u, Write) ∈ UR O RP ⟶ (u, Read) ∈ UR O RP"
  apply clarsimp
  oops
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀x y. ⟦(x, y) ∈ UR; (y, Write) ∈ RP⟧ ⟹ (x, Read) ∈ UR O RP
```

`clarsimp` removed the `∀` and the `⟶`, and took apart the assumption `(x, Write) ∈ UR O RP` into a role
`y` with two facts about it. What is left is the heart of the problem, and it is not provable: nothing
says that role `y` grants `Read`.

| Method | Works on | When it fails |
|---|---|---|
| `simp`, `simp_all` | first subgoal; all subgoals | leaves the simplified goal, or fails if nothing changed |
| `auto` | all subgoals | leaves what it could not prove, or fails if nothing changed |
| `blast` | first subgoal | fails, with no hint |
| `force`, `fastforce` | first subgoal | fails, with no hint |
| `clarsimp` | first subgoal | does not try to finish; leaves the goal tidied |

`auto`, `force`, `fastforce` and `clarsimp` accept the simplifier's modifiers, written `simp add:`,
`simp del:` and `split:`, because `add:` alone would be ambiguous. They also accept rules for the
classical reasoner: `intro:`, `elim:` and `dest:`, with the rules of Module 7. So `auto simp add: grant_def`
unfolds `grant`, and `blast intro: r` lets `blast` use a rule `r` of your own.

## Arithmetic {#arith}

Arithmetic gets its own tools, because neither rewriting nor logical search handles it well. A formula of
**linear arithmetic** is built from variables, numbers, `+`, `-`, `=`, `<`, `≤` and the connectives, where
a variable may be multiplied by a number, as in `2 * x`, but not by another variable. For such formulas
there are **decision procedures**: programs that decide, for every formula of the kind, whether it holds,
and prove it if it does.

A storage service gives each user a quota. A new file fits if its size is at most the free space:

```isabelle
lemma "⟦used ≤ quota; new ≤ quota - used⟧ ⟹ used + new ≤ (quota :: nat)"
  by linarith
```

`linarith` proves linear arithmetic over `nat`, `int` and `real`. Subtraction on `nat` is tricky, because
`3 - 5 = 0` for natural numbers, and `linarith` takes care of it by distinguishing the cases
`used ≤ quota` and `quota < used`. In fact `simp` proves this goal too: the simplifier calls a fast but
weaker version of the same procedure. Use `linarith` when `simp` and `auto` leave an arithmetic goal.

`linarith` combines inequalities by adding multiples of them, as you would to solve a system of
inequalities over the real numbers, plus one rule for whole numbers: from `a < b` it concludes
`a + 1 ≤ b`. It does not know that an even number is never odd. Suppose a load balancer sends requests with even numbers to one server
and odd ones to another; no request should go to both:

```isabelle fails
lemma "(2::int) * x ≠ 2 * y + 1"
  by linarith
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. 2 * x ≠ 2 * y + 1
```

`presburger` decides **Presburger arithmetic**: linear arithmetic over the integers and natural numbers,
including quantifiers, divisibility, and `div` and `mod` by numbers.

```isabelle
lemma "(2::int) * x ≠ 2 * y + 1"
  by presburger
```

Quantifiers are no obstacle. A file system stores data in blocks of 3 and 5 kilobytes; every amount of at
least 8 kilobytes can be made up exactly:

```isabelle
lemma "∀n ≥ 8. ∃a b. n = 3 * a + 5 * (b :: nat)"
  by presburger
```

`arith` tries `linarith` first and `presburger` after it, so it proves all three goals above. Products of
variables are a different matter:

```isabelle fails
lemma "(x::nat) ≤ y ⟹ x * x ≤ y * y"
  by linarith
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. x ≤ y ⟹ x * x ≤ y * y
```

`auto` fails too. The fact is simple, but it lies outside linear arithmetic, and so outside what these
methods decide.

::: fact Deciding arithmetic
Presburger arithmetic, the first-order theory of the natural numbers with addition, is decidable (Mojżesz
Presburger, 1929). With multiplication of variables it is not: there is no algorithm that decides, for
every polynomial equation with integer coefficients, whether it has a solution in whole numbers (Yuri
Matiyasevich, 1970, completing work of Martin Davis, Hilary Putnam and Julia Robinson). Over the real
numbers, polynomial equations and inequalities are decidable again (Alfred Tarski), but the known
algorithms take very long on all but small problems.
:::

So there is no complete method for arithmetic with products, and there cannot be one. Isabelle's answer is
the library: it contains thousands of proved facts about multiplication. The next section shows how to find
the one you need, and Section 9.8 shows a tool that finds it for you.

::: tip
Decision procedures need the right type. `2 * x ≠ 2 * y + 1` is false for real numbers (take
`x = y + 1/2`), so no method can prove it without knowing that `x` and `y` are integers. Annotate a type,
as in `(2::int)`, whenever a number could belong to several types.
:::

## Searching the library {#find}

Isabelle's library contains tens of thousands of theorems, and their names follow conventions that take a
while to learn. `find_theorems` searches them by shape and by name. Type it in a theory, or use the **Query**
panel of Isabelle/jEdit: its **Find Theorems** tab has a **Find:** field for the same criteria and an
**Apply** button. A pattern is a term in quotes, with `_` for any term:

```isabelle
find_theorems "rev (rev _)"
```

```output result
find_theorems
  "rev (rev _)"

found 1 theorem(s):
  List.rev_rev_ident: rev (rev ?xs) = ?xs
```

The answer gives the full name, `List.rev_rev_ident`: the theory and the theorem. You can use it as
`rev_rev_ident`. For the multiplication goal of Section 9.5, a pattern alone finds too much:

```isabelle
find_theorems (3) "_ * _ ≤ _ * _"
```

```output result
find_theorems
  "_ * _ ≤ _ * _"

found 31 theorem(s) (3 displayed):
  Nat.mult_le_mono1: ?i ≤ ?j ⟹ ?i * ?k ≤ ?j * ?k
  Nat.mult_le_mono2: ?i ≤ ?j ⟹ ?k * ?i ≤ ?k * ?j
  Nat.Suc_mult_le_cancel1: (Suc ?k * ?m ≤ Suc ?k * ?n) = (?m ≤ ?n)
```

The `(3)` limits the display to three of the matches. Narrow the search instead. Give the type, and add a
second criterion: monotonicity laws usually have `mono` in their name. Several criteria must all hold:

```isabelle
find_theorems "(_::nat) * _ ≤ _ * _" name: mono
```

```output result
find_theorems
  "_ * _ ≤ _ * _"
  name: "mono"

found 3 theorem(s):
  Nat.mult_le_mono1: ?i ≤ ?j ⟹ ?i * ?k ≤ ?j * ?k
  Nat.mult_le_mono2: ?i ≤ ?j ⟹ ?k * ?i ≤ ?k * ?j
  Nat.mult_le_mono: ⟦?i ≤ ?j; ?k ≤ ?l⟧ ⟹ ?i * ?k ≤ ?j * ?l
```

`mult_le_mono` fits: with `x ≤ y` twice, it gives `x * x ≤ y * y`. The simplifier can use it as a
conditional rule, and proves both conditions from the assumption:

```isabelle
lemma "(x::nat) ≤ y ⟹ x * x ≤ y * y"
  by (simp add: mult_le_mono)
```

The criteria you will use most:

| Criterion | Finds theorems |
|---|---|
| `"pattern"` | that contain the pattern somewhere |
| `name: s` | whose name contains `s` |
| `simp: "term"` | that are equations whose left side matches the term, so that they could rewrite it |
| `intro`, `elim`, `dest` | that could be applied as such a rule to the current goal (inside a proof) |
| `-` before a criterion | that do not meet it |

The `simp:` criterion answers the question "what does the simplifier know about this term?":

```isabelle
find_theorems simp: "set (filter _ _)"
```

```output result
find_theorems
  simp: "set (filter _ _)"

found 1 theorem(s):
  List.set_filter: set (filter ?P ?xs) = {x ∈ set ?xs. ?P x}
```

`find_consts` finds functions by their type. Which functions turn a list into a set?

```isabelle
find_consts "'a list ⇒ 'a set"
```

```output result
find_consts
  "'a list ⇒ 'a set"

found 3 constant(s):
  BNF_Greatest_Fixpoint.Succ :: "'a list set ⇒ 'a list ⇒ 'a set"
  List.coset :: "'a list ⇒ 'a set"
  List.list.set :: "'a list ⇒ 'a set"
```

Besides `set`, the answer contains `coset`, and a function whose type contains `'a list ⇒ 'a set` as a
part: `find_consts` also matches types inside larger ones.

::: pitfall
Use `_` in patterns, not variable names. In a pattern, `xs` is not a placeholder: it matches only the
variable `xs` itself, and library theorems are stated with variables of their own. Write `"rev (rev _)"`,
not `"rev (rev xs)"`. For an operator, give a whole term such as `"_ * _"`, not the symbol `*` alone.
:::

## Counterexamples: Quickcheck and Nitpick {#refute}

Trying to prove a false statement wastes time, and automation fails on false statements without saying
that they are false. So test a claim before you try to prove it. Isabelle has two counterexample finders.
Isabelle/jEdit runs Quickcheck automatically on every new `lemma` (Module 1); the examples here call the
tools explicitly, as you can too.

### Quickcheck {#quickcheck}

**Quickcheck** turns the claim into a program and runs it on many values of its free variables. By default
it tries all values up to a small size, systematically. Here is a claim that sounds reasonable: whoever
may write may also read.

```isabelle
lemma "allows es u Write ⟹ allows es u Read"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  es = [(a⇩1, Write)]
  u = a⇩1
```

The counterexample is a list with a single entry. `a₁` is a value of the user type `'u`, about which
Quickcheck knows nothing else. A user who is granted only `Write` may write and not read. The claim is not a
law of ACLs: it is a property that some ACLs have and others lack. Exercise 9.8 turns it into an invariant.

Quickcheck takes options in square brackets:

| Option | Effect |
|---|---|
| `quickcheck [random]` | tests random values instead of all small ones |
| `quickcheck [exhaustive]` | tests all values up to the size bound (the default) |
| `quickcheck [size = 5]` | sets the size bound for the values tested |
| `quickcheck [timeout = 30]` | stops after 30 seconds |
| `quickcheck [expect = counterexample]` | reports an error unless a counterexample is found; also `no_counterexample` |

```isabelle
lemma "allows es u Write ⟹ allows es u Read"
  quickcheck [random]
  oops
```

```output result
Testing conjecture with Quickcheck-random...

Quickcheck found a counterexample:
  es = [(a⇩1, Write)]
  u = a⇩1
```

When a claim involves a function's result, Quickcheck also shows the values of the terms involved. Does
revoking a user's entries after a grant give back the original list?

```isabelle
lemma "revoke u (grant u p es) = es"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  u = a⇩1
  p = Read
  es = [(a⇩1, Read)]
Evaluated terms:
  revoke u (grant u p es) = []
```

The list already contained an entry of user `a₁`, and `revoke` removed that one too. On a true claim
Quickcheck reports that it found nothing:

```isabelle
lemma "allows (revoke u es) v p = (v ≠ u ∧ allows es v p)"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found no counterexample.
```

That is evidence, not proof: Quickcheck tried small values only.

### Nitpick {#nitpick}

**Nitpick** works differently. It looks for a **finite model** that makes the claim false: a small finite
type for each type variable and values for the free variables. It translates the problem into
propositional logic and hands it to a SAT solver. Because it reasons about sets, relations and quantifiers
directly, it is good at the claims that Quickcheck finds hard to run.

A claim about roles: if role `r` grants `Read`, then after taking `r` away from user `u`, the user can no
longer read.

```isabelle
lemma "(r::'r, Read) ∈ RP ⟹ (u::'u, Read) ∉ (UR - {(u, r)}) O RP"
  nitpick [card 'u = 1, card 'r = 2]
  oops
```

```output result varies
Nitpicking formula...

Nitpick found a counterexample for card 'r = 2 and card 'u = 1:
  Free variables:
    RP = {(r⇩1, Read), (r⇩2, Read)}
    UR = {(u⇩1, r⇩1)}
    r = r⇩2
    u = u⇩1
```

The option `card 'r = 2` tells Nitpick to try a type `'r` with exactly two elements. Without the option
it tries sizes 1 to 10 in parallel, and the size of the counterexample it reports can change from run to
run. Nitpick names the elements of each type after the type: `u₁` is a user, `r₁` and `r₂` are roles, and
`p₁` is a permission. Read the counterexample: user `u₁` has both roles, and both grant `p₁`. Take role
`r₂` away, and `u₁` still has `p₁` through `r₁`. A user may get a permission from several roles. Add the
assumption that no other role of `u` grants `p`, and Nitpick finds nothing; `blast` then proves the claim:

```isabelle
lemma "⟦(r::'r, Read) ∈ RP; ∀r'. (u::'u, r') ∈ UR ∧ (r', Read) ∈ RP ⟶ r' = r⟧
       ⟹ (u, Read) ∉ (UR - {(u, r)}) O RP"
  nitpick [card 'u = 1, card 'r = 2]
```

```output result
Nitpicking goal:
  ⟦(r, Read) ∈ RP; ∀r'. (u, r') ∈ UR ∧ (r', Read) ∈ RP ⟶ r' = r⟧
  ⟹ (u, Read) ∉ (UR - {(u, r)}) O RP

Nitpick found no counterexample
```

```isabelle
  by blast
```

A counterexample from Nitpick is **genuine** when Nitpick has checked that it really falsifies the claim.
For claims about infinite types such as `nat`, it may report a counterexample as **potentially
spurious**: one that might disappear in a larger model. Treat those as hints. "No counterexample" is not a
proof either: there may be a counterexample larger than the sizes Nitpick tried. On claims about
recursive functions on lists, Nitpick often runs out of time; Quickcheck is the better tool there.

| | Quickcheck | Nitpick |
|---|---|---|
| Method | runs the claim as a program on many values | searches for a finite model with a SAT solver |
| Strong on | functions on lists and numbers | sets, relations, quantifiers |
| Needs | executable definitions | nothing special |
| Runs automatically in jEdit | yes | no (it can be turned on) |
| Main option | `size` | `card` |

## Sledgehammer {#sledgehammer}

The goal `x * x ≤ y * y` from Section 9.5 needed the lemma `mult_le_mono`. Finding it with `find_theorems`
took some thought. **Sledgehammer** searches for you. It hands the goal, together with a few hundred
library facts that look relevant, to several automatic theorem provers that run outside Isabelle. If one of
them finds a proof, Sledgehammer turns it into a one-line Isabelle proof that you can paste into your theory.

::: figure id=fig-09-2
From a goal to a checked proof. Sledgehammer selects facts, translates the problem for external provers and
reconstructs a proof from the facts that a prover used. Only the last step, checked by the kernel, makes a
theorem.
:::

The provers come with Isabelle (Module 1): E, Vampire, Zipperposition and SPASS are automatic theorem
provers for first-order and higher-order logic; cvc5, veriT and Z3 are SMT solvers, which also know
arithmetic. Isabelle2026 also runs some of its own proof methods, such as `metis` and `auto`, as further
"provers". Nobody needs to trust the external programs or the translation, because their answers are only
used to construct a proof that the kernel checks:

- `metis` is a proof method inside Isabelle that searches for a first-order proof from a short list of
  facts. Searching with three facts is far easier than with thousands, and every step goes through the
  kernel.
- `smt` sends the problem to an SMT solver and replays the solver's proof, step by step, inside Isabelle.
- When an ordinary method such as `simp` or `auto` works with the facts found, Sledgehammer suggests it.

Write `sledgehammer` where the next proof step would go:

```isabelle
lemma "(x::nat) ≤ y ⟹ x * x ≤ y * y"
  sledgehammer
```

```output result varies
Sledgehammering...

metis found a proof...

metis: Try this: by (metis mult_le_mono mult_le_mono1) (82 ms)

cvc5 found a proof...

cvc5: Try this: by (simp add: mult_le_mono) (1 ms)

vampire found a proof...

vampire: Try this: by (simp add: mult_mono') (4 ms)

spass found a proof...

verit found a proof...

verit: Duplicate proof

zipperposition found a proof...

e found a proof...

e: Duplicate proof

zipperposition: Try this: using mult_le_mono by blast (1 ms)

spass: Try this: using mult_le_mono by presburger (1 ms)

Done
```

Read the output from the top. "Sledgehammering..." means that the provers have started. Each
"… found a proof..." comes from one prover, and is followed by its suggestion, "Try this:", with the time
the suggested proof took to check in parentheses. "Duplicate proof" means that a prover found a proof that
was already suggested. "Done" means that all provers have finished. In Isabelle/jEdit you click a
suggestion to insert it. Choose a short and fast one, and replace the `sledgehammer` line with it:

```isabelle
  by (metis mult_le_mono)
```

The lemma is now proved by `metis`, and the kernel has checked every step. The `sledgehammer` command itself
proves nothing: delete it once you have a proof.

Sledgehammer is at its best when a goal follows from a few library facts in a way that the simplifier does
not see. Two segments of a log that commute and have the same length are equal. `simp`, `auto` and
`blast` all fail on this goal, but Sledgehammer finds the library lemma `append_eq_append_conv`, which says
when two appended lists are equal, and suggests a proof such as this one:

```isabelle
lemma "⟦es @ fs = fs @ es; length es = length fs⟧ ⟹ es = fs"
  by (metis append_eq_append_conv)
```

You may not have known that the lemma existed, but Sledgehammer did.

Isabelle/jEdit also has a **Sledgehammer** panel at the bottom of the window. Put the cursor in a proof
and click **Apply**: the provers run in the background while you go on working, and the results appear in
the panel, where a click on a proof inserts it into the text. The **Provers:** field lists the provers to
run, and **Cancel** stops them.

::: tip
Sledgehammer works best on small, first-order goals. Simplify first with `simp` or `auto` and call
Sledgehammer on what is left. It does not do induction, so for a claim about all lists start the induction
yourself and call Sledgehammer on the cases. Options go in square brackets, for example
`sledgehammer [timeout = 60]` to give the provers 60 seconds instead of the default 30.
:::

::: trouble
- **Windows: no prover runs, or a message says that a prover failed to start.** Windows Defender can block
  Isabelle's external provers, as Module 1 warned. Exclude the whole Isabelle folder in **Virus & threat
  protection**, as Isabelle's installation page recommends, and run Sledgehammer again.
- **No prover finds a proof.** The goal may be false: check it with `quickcheck` and `nitpick`. It may need
  induction, or a lemma that is not in the library: prove that lemma first. Or the provers need more time:
  `sledgehammer [timeout = 120]`.
- **The suggested `metis` call fails or runs for a long time.** Try another suggestion from the list.
:::

## When automation fails {#strategy}

No method proves everything; there is no complete proof method for higher-order logic, not even in
principle. Sooner or later every method fails on a goal that you believe is true. Then work through these
steps, roughly in this order.

1. **Is the claim true?** Run `quickcheck` and `nitpick`. If one finds a counterexample, the statement
   needs fixing, not the proof.
2. **Simplify and read.** `apply auto` (or `apply simp`) and read what is left. The remaining subgoals
   show what the tools could not do.
3. **Unfold definitions.** Definitions are not simp rules: add them with `simp add: f_def`.
4. **Split cases.** A `case` needs `split: t.split`; an `if` or `case` in an assumption needs
   `split: if_splits` or `t.splits`.
5. **Use induction** when the claim is about all values of a recursive type and involves a recursive
   function. Start it, then automate the cases.
6. **Find or prove a lemma.** Search with `find_theorems`. If the library has nothing, state the missing
   step as a lemma of its own and prove it first.
7. **Try Sledgehammer** on what is left.
8. **Choose a different method** for the kind of goal (Figure 9.3).

::: figure id=fig-09-3
Which method to try first, by the kind of goal. When the first choice fails, read what it leaves and go
down the list of steps above.
:::

::: example Steps 1, 2, 4 and 5 at work
Prove that the owner of a document may administer it: if `owner es = Some v` then
`allows es v Admin`.

Step 1: `quickcheck` finds no counterexample, so the claim is probably true. Step 5: both `owner` and
`allows` are recursive functions on the list, so start an induction. Step 2: let `auto` do what it can.

```isabelle
lemma owner_admin: "owner es = Some v ⟹ allows es v Admin"
  apply (induction es)
  apply auto
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀a b es.
       ⟦owner es = Some v ⟹ False;
        (if b = Admin then Some (fst (a, b)) else owner es) = Some v;
        ¬ allows es v Admin⟧
       ⟹ a = v
 2. ⋀a b es.
       ⟦owner es = Some v ⟹ False;
        (if b = Admin then Some (fst (a, b)) else owner es) = Some v;
        ¬ allows es v Admin⟧
       ⟹ b = Admin
```

The base case is proved. Two subgoals of the step case remain, and both have an `if` in an assumption:
`auto` split the pair `a` into `a` and `b` but not the `if` in the definition of `owner`. Step 4 says what
to do: an `if` in an assumption needs `split: if_splits`.

```isabelle
  oops

lemma owner_admin: "owner es = Some v ⟹ allows es v Admin"
  apply (induction es)
  apply (auto split: if_splits)
  done
```
:::

The lemma helps with the next claim at once. Only someone who may administer a document may delete it:

```isabelle
lemma "may_delete u es ⟹ allows es u Admin"
  by (simp add: may_delete_def owner_admin split: option.splits)
```

The proof uses steps 3, 4 and 6 together: it unfolds `may_delete`, splits the `case` in the assumption,
and uses the lemma just proved.

::: keyidea
Automation fails for a reason, and the reason is usually visible: in the remaining subgoals, in a
counterexample, or in a trace. Read before you try another method. The fix is most often a definition to
unfold, a case to split, an induction to start, or a lemma to prove first.
:::

## What you learned {#summary}

- The **simplifier** rewrites with equations from left to right, inner parts first, until no rule applies;
  a goal rewritten to `True` is proved. It uses the **simp set**: equations of `fun`, facts from `datatype`,
  and lemmas marked `[simp]`, but not definitions.
- `simp add:`, `simp del:` and `simp only:` change the rules for one call; `simp_all` works on every
  subgoal; `[simp]` and `declare … [simp]` change the simp set.
- A **conditional rule** is used only if the simplifier can prove its conditions. The assumptions of a
  subgoal become rewrite rules too.
- `if` is split automatically; `case` needs `split: t.split`, and splits in assumptions need `if_splits`
  or `t.splits`.
- Rewriting may loop; keep right sides simpler than left sides. **Permutative** rules such as commutativity
  are safe, because Isabelle applies them only to sort terms. `using [[simp_trace]]` shows every step.
- `blast` searches first-order logic, sets and relations; `auto` simplifies and reasons on all subgoals and
  leaves what it cannot prove; `force` and `fastforce` mix search and rewriting; `clarsimp` tidies a goal.
- `linarith` decides linear arithmetic, `presburger` adds divisibility and quantifiers, and `arith` tries
  both. Arithmetic with products of variables is undecidable; use library lemmas.
- `find_theorems` and `find_consts` search the library; Quickcheck and Nitpick search for counterexamples.
- **Sledgehammer** asks external provers for the facts that a proof needs and reconstructs a proof that the
  kernel checks.
- When automation fails: test the claim, read what is left, unfold, split, induct, find or prove a lemma,
  and try Sledgehammer.

## Exercises {#exercises}

:::: exercise Which tool? {#ex-9-1} ★
For each goal, name the method you would try first, and say why. Then check your answers in Isabelle.

1. `rev (rev xs @ ys) = rev ys @ xs`
2. `⟦A ⊆ B; B ∩ C ⊆ D⟧ ⟹ A ∩ C ⊆ D`
3. `⟦(a::int) < b; b < c⟧ ⟹ a + 2 ≤ c`
4. `(n::nat) mod 4 = 1 ⟹ n mod 2 = 1`
5. `allows es u Admin ⟹ allows es u Write`

::: solution
1. `simp`: an equation about the library function `rev`, which the simp set knows well.
2. `blast`: pure reasoning about sets.
3. `linarith`: linear arithmetic. For integers, `a < b` means `a + 1 ≤ b`, and `linarith` knows that.
4. `presburger`: `mod` by a number is Presburger arithmetic. The argument needs the fact that `4 * q + 1`
   is odd, which is beyond `linarith`.
5. `quickcheck`: an ACL that grants only `Admin` is a counterexample, so no method can prove it.

```isabelle
lemma "rev (rev xs @ ys) = rev ys @ xs"
  by simp

lemma "⟦A ⊆ B; B ∩ C ⊆ D⟧ ⟹ A ∩ C ⊆ D"
  by blast

lemma "⟦(a::int) < b; b < c⟧ ⟹ a + 2 ≤ c"
  by linarith

lemma "(n::nat) mod 4 = 1 ⟹ n mod 2 = 1"
  by presburger

lemma "allows es u Admin ⟹ allows es u Write"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  es = [(a⇩1, Admin)]
  u = a⇩1
```
:::
::::

:::: exercise Rewriting by hand {#ex-9-2} ★
Rewrite the term `allows (revoke u [(u, Read)]) u Read` to `False` by hand, using the equations of
`revoke` and `allows` and these laws: `fst (a, b) = a`, `(x = x) = True` and
`(if True then s else t) = s`. Write down each step and the rule it uses. Then confirm in Isabelle that
these rules suffice, with `simp only:`. The two laws about `fst` and `if` are called `fst_conv` and
`if_True`.

::: solution
Inner parts first:

1. `revoke u [(u, Read)]` matches the second equation of `revoke`, with `(u, Read)` for `e` and `[]` for
   `es`: it becomes `if fst (u, Read) = u then revoke u [] else (u, Read) # revoke u []`.
2. In the condition, `fst (u, Read)` becomes `u` by `fst_conv`, and then `u = u` becomes `True` by
   `(x = x) = True`.
3. `if True then revoke u [] else …` becomes `revoke u []` by `if_True`.
4. `revoke u []` becomes `[]` by the first equation of `revoke`.
5. `allows [] u Read` becomes `False` by the first equation of `allows`.

```isabelle
lemma "allows (revoke u [(u, Read)]) u Read = False"
  by (simp only: revoke.simps allows.simps fst_conv simp_thms if_True)
```

After step 5 the lemma reads `False = False`, which `(x = x) = True` from `simp_thms` turns into `True`.
:::
::::

:::: exercise Why did simp fail? {#ex-9-3} ★
These three lemmas are true, but `by simp` fails on each of them. Try each in Isabelle, read the message,
say why the proof fails, and fix it.

1. `set (grant u p es) = insert (u, p) (set es)`
2. `may_delete u es ⟹ owner es ≠ None`, with `by (simp add: may_delete_def)` instead of `by simp`
3. `x ∈ set (revoke u es) ⟹ fst x ≠ u`

::: solution
1. "Failed to apply initial proof method": no rule applies. `grant` is a definition, so the simplifier
   does not unfold it, and no simp rule says anything about `set (grant u p es)`. (`allows_grant` is about
   `allows`, not about `set`.) Add `grant_def`.
2. "Failed to finish proof", and the remaining goal has a `case` on `owner es` in its assumption. A `case`
   in an assumption is split only with `split: option.splits`.
3. "Failed to apply initial proof method". The claim is about all lists and involves the recursive
   function `revoke`, so it needs induction. In the step case the `if` of `revoke` ends up in an assumption,
   which needs `split: if_splits`.

```isabelle
lemma "set (grant u p es) = insert (u, p) (set es)"
  by (simp add: grant_def)

lemma "may_delete u es ⟹ owner es ≠ None"
  by (simp add: may_delete_def split: option.splits)

lemma "x ∈ set (revoke u es) ⟹ fst x ≠ u"
  by (induction es) (auto split: if_splits)
```
:::
::::

:::: exercise More laws for revoke {#ex-9-4} ★★
Prove these three laws. Each needs induction for some of them; choose `simp` or `auto` for the cases.

1. `revoke u (grant u p es) = revoke u es`
2. `revoke u (revoke v es) = revoke v (revoke u es)`
3. `length (revoke u es) ≤ length es`

::: solution
The first needs no induction, only the definition of `grant`. The second and third are about all lists, so
they need induction; `revoke` contains an `if`, which the simplifier splits.

```isabelle
lemma "revoke u (grant u p es) = revoke u es"
  by (simp add: grant_def)

lemma revoke_commute: "revoke u (revoke v es) = revoke v (revoke u es)"
  by (induction es) auto

lemma "length (revoke u es) ≤ length es"
  by (induction es) auto
```

In the third, after splitting the `if`, the step case needs `length (revoke u es) ≤ Suc (length es)` from
the induction hypothesis `length (revoke u es) ≤ length es`: linear arithmetic, which `auto` does.
:::
::::

:::: exercise Splitting a case {#ex-9-5} ★★
Define a function `latest :: "'u acl ⇒ ('u × perm) option"` that returns the first entry of a list, or
`None` for the empty list, using a `case` expression in a `definition`. Then prove:

1. `latest (grant u p es) = Some (u, p)`
2. `(latest es = None) = (es = [])`

::: solution
```isabelle
definition latest :: "'u acl ⇒ ('u × perm) option" where
  "latest es = (case es of [] ⇒ None | e # _ ⇒ Some e)"

lemma "latest (grant u p es) = Some (u, p)"
  by (simp add: latest_def grant_def)

lemma "(latest es = None) = (es = [])"
  by (simp add: latest_def split: list.split)
```

In the first lemma the list is `(u, p) # es`, so the simplifier reduces the `case` without a split: the
datatype's `case` equations are simp rules. In the second the list is the variable `es`, and the `case`
must be split with `list.split`.
:::
::::

:::: exercise Arithmetic for a quota {#ex-9-6} ★★
Prove each goal with an arithmetic method, and say why the method fits. For the last one, find the lemma
you need with `find_theorems`.

1. `⟦used ≤ quota; quota ≤ used + 5⟧ ⟹ quota - used ≤ (5::nat)`
2. `(x::nat) ≤ y ⟹ 3 * x ≤ 3 * y`
3. `even (n::nat) ⟹ ¬ even (n + 1)`
4. `(x::nat) ≤ y ⟹ x * z ≤ y * z`

::: solution
1. `linarith`: linear, with subtraction on `nat`.
2. `linarith`: multiplication by a number is linear.
3. `presburger`: `even n` means that 2 divides `n`, and divisibility by a number is Presburger arithmetic.
4. Products of variables: not linear. `find_theorems "(_::nat) * _ ≤ _ * _" name: mono` (Section 9.6)
   lists `mult_le_mono1: ?i ≤ ?j ⟹ ?i * ?k ≤ ?j * ?k`, which is exactly the claim.

```isabelle
lemma "⟦used ≤ quota; quota ≤ used + 5⟧ ⟹ quota - used ≤ (5::nat)"
  by linarith

lemma "(x::nat) ≤ y ⟹ 3 * x ≤ 3 * y"
  by linarith

lemma "even (n::nat) ⟹ ¬ even (n + 1)"
  by presburger

lemma "(x::nat) ≤ y ⟹ x * z ≤ y * z"
  by (simp add: mult_le_mono1)
```
:::
::::

:::: exercise Refute, fix, prove {#ex-9-7} ★★
A security review claims: "if a user has permission `p`, then after the permission `p` is removed from
role `r`, the user still has `p`". In Isabelle:
`(u, p) ∈ UR O RP ⟹ (u, p) ∈ UR O (RP - {(r, p)})`. Find a counterexample with Nitpick, explain it, then
add an assumption that makes the claim true and prove it with `blast`.

::: solution
```isabelle
lemma "(u::'u, p::perm) ∈ UR O RP ⟹ (u, p) ∈ UR O (RP - {(r::'r, p)})"
  nitpick [card 'u = 1, card 'r = 1]
  oops
```

```output result varies
Nitpicking formula...

Nitpick found a counterexample for card 'r = 1 and card 'u = 1:
  Free variables:
    RP = {(r⇩1, p⇩2)}
    UR = {(u⇩1, r⇩1)}
    p = p⇩2
    r = r⇩1
    u = u⇩1
```

With a single role, the user gets `p` only through `r`; when `r` loses `p`, so does the user. The claim
holds if `u` has `p` through some role other than `r`:

```isabelle
lemma "⟦(u, r') ∈ UR; (r', p) ∈ RP; r' ≠ r⟧ ⟹ (u, p) ∈ UR O (RP - {(r, p)})"
  by blast
```
:::
::::

:::: exercise An invariant {#ex-9-8} ★★★
Call an ACL well formed if every user who may write may also read:

```isabelle
definition wf_acl :: "'u acl ⇒ bool" where
  "wf_acl es = (∀u. allows es u Write ⟶ allows es u Read)"
```

1. Prove that `revoke` keeps an ACL well formed: `wf_acl es ⟹ wf_acl (revoke u es)`.
2. Show with Quickcheck that `grant u Write` does not.
3. Prove that granting `Read` together with `Write` keeps it well formed:
   `wf_acl es ⟹ wf_acl (grant u Read (grant u Write es))`.

::: solution
```isabelle
lemma "wf_acl es ⟹ wf_acl (revoke u es)"
  by (simp add: wf_acl_def allows_revoke)
```

After unfolding, `allows_revoke` rewrites both occurrences of `allows (revoke u es) w …`, and the
assumption, a `∀` over `⟶`, becomes a conditional rewrite rule that finishes the proof (Section 9.3).

```isabelle
lemma "wf_acl es ⟹ wf_acl (grant u Write es)"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  es = []
  u = a⇩1
```

The empty list is well formed, but after granting `Write` alone the user may write and not read.

```isabelle
lemma "wf_acl es ⟹ wf_acl (grant u Read (grant u Write es))"
  by (auto simp add: wf_acl_def)
```

`auto` is needed for the third: after rewriting with `allows_grant`, the goal compares the new entries
with every user `w`, which needs a case distinction on `w = u`.
:::
::::

:::: exercise Loops and orders {#ex-9-9} ★★★
1. The lemma `rev_append` of the library is a simp rule: `rev (xs @ ys) = rev ys @ rev xs`. Explain what
   would happen if you also declared `rev ys @ rev xs = rev (xs @ ys)` as a simp rule.
2. Prove `insert a (insert b (insert c A)) = insert c (insert a (insert b A))` with `simp only:` and a single
   library rule, and explain why the simplifier stops.

::: solution
1. The two rules undo each other: `rev (xs @ ys)` would be rewritten to `rev ys @ rev xs` and back, for ever.
   Neither rule is permutative (their sides are different terms, not the same term with variables swapped),
   so ordered rewriting does not apply, and the simplifier would loop.
2. `insert_commute` is permutative. Isabelle applies it only when the result is smaller in its fixed order
   on terms, so it sorts the inserted elements, like bubble sort, and stops when they are in order. Both
   sides reach the same sorted form.

```isabelle
lemma "insert a (insert b (insert c A)) = insert c (insert a (insert b A))"
  by (simp only: insert_commute)
```
:::
::::

## Check yourself {#quiz}

```quiz
? Why does `by simp` fail on `allows (grant u Read es) u Read` while `by (simp add: grant_def)` succeeds?
- [ ] `simp` cannot handle lists
- [ ] `grant_def` is a conditional rule
- [x] `grant` is defined with `definition`, and definitions are not simp rules
- [ ] `simp` only uses rules written with `[simp]` in the same theory
> The equations of `fun` and many library lemmas are simp rules, but a `definition` is unfolded only when you add its `_def` theorem.

? A simp rule has the form `v ≠ u ⟹ allows (revoke u es) v p = allows es v p`. When does `simp` use it on `allows (revoke a es) b Read`?
- [x] Only if it can prove `b ≠ a`, for example from an assumption of the subgoal
- [ ] Always, since the left side matches
- [ ] Never, since conditional rules are only used by `auto`
- [ ] Only if you write `simp add:` with the rule
> A conditional rule is applied only after the simplifier has proved the instance of its condition, by simplification.

? You call `simp add: add.commute`, adding commutativity `x + y = y + x` to the simp set. Why does `simp` not loop?
- [ ] Isabelle stops every rewriting after 100 steps
- [ ] It is used from right to left only
- [x] It is permutative, and Isabelle applies it only when the result is smaller in a fixed order on terms
- [ ] `simp` never uses rules about `+`
> Ordered rewriting applies a permutative rule only when it brings the term into order, so the rule sorts the operands once and stops.

? Which method fits a goal about sets and relations with ∀ and ∃, and no arithmetic?
- [ ] `linarith`
- [x] `blast`
- [ ] `simp only:`
- [ ] `presburger`
> `blast` searches first-order logic, with the rules for sets and relations built in.

? `linarith` fails on `(x::nat) ≤ y ⟹ x * x ≤ y * y`. What is the reason?
- [ ] The goal is false
- [ ] `linarith` works only on integers
- [ ] The goal needs `presburger`
- [x] The goal multiplies two variables, so it is not linear arithmetic
> Linear arithmetic allows multiplication by numbers only. Arithmetic with products of variables is undecidable in general, so the proof needs a lemma such as `mult_le_mono`.

? Sledgehammer suggests `by (metis mult_le_mono)`. Why can you trust the resulting theorem?
- [ ] Because the external provers are verified programs
- [ ] Because several provers agreed
- [ ] Because Sledgehammer double-checks the translation
- [x] Because `metis` builds the proof inside Isabelle, and the kernel checks every step
> The external provers only point to the facts that are needed. The proof itself is found again by `metis` and checked by the kernel, as for every other method.
```
