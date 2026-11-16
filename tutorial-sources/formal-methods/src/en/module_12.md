---
title: Verifying functional programs
part: 4
lead: Prove that a program does what its specification says, for every input. You will verify insertion sort, a binary search tree and a queue made of two lists, see why a specification needs each of its parts, and turn the verified functions into Haskell code.
minutes: 230
needs: Modules 1–11, especially Module 8 (functions), Module 10 (Isar) and Module 11 (auxiliary lemmas)
goals:
  - Separate a specification (what a program must do) from an implementation (how it does it), and state the theorem that connects them
  - Verify insertion sort against the specification "sorted, and a permutation of the input", finding the lemmas the proofs need
  - Explain why each half of a specification is needed, and catch weak specifications with Quickcheck and Nitpick
  - Verify a binary search tree with an invariant and an abstraction function
  - Prove a queue made of two lists correct by data refinement, and say where its invariant is needed
  - Export verified functions as Haskell code, and say what the generated code is and is not guaranteed to do
imports: Main "HOL-Library.Multiset"
---

## What it means to verify a program {#verify}

Module 1 began with a requirement from a school's software: *"Sort the list of scores before printing
it."* It turned the sentence into a formula about the input list xs and the output list ys,

$$
\mathit{sorted}(ys) \;\land\; \mathit{mset}(ys) = \mathit{mset}(xs),
$$

and promised that a proof could show that a sorting program meets it for every input. Parts II and III
gave you the tools: functions defined with `fun` (Module 8), automation (Module 9), structured proofs
(Module 10) and the art of finding the right induction and the missing lemma (Module 11). This module puts
them together and keeps the promise.

Three things are involved in every verification, and it pays to keep them apart.

::: definition Implementation, specification, correctness theorem
The **implementation** is the program that does the work: here, a function defined with `fun`. It says
*how* to compute the result.

The **specification** is a property that every acceptable result must have. It says *what* the result
must be, not how to compute it.

A **correctness theorem** states that for every input, the result of the implementation has the property
of the specification. A program is **verified** when its correctness theorem has been proved.
:::

For sorting, the implementation in this module is insertion sort, a function `isort`. The specification
is the formula above. The correctness theorem joins them:

$$
\forall xs.\; \mathit{sorted}(\mathit{isort}\ xs) \land \mathit{mset}(\mathit{isort}\ xs) = \mathit{mset}(xs)
$$

::: figure id=fig-12-1
Verification connects two separate descriptions. The specification says what a sorted copy of a list is;
the implementation says how insertion sort computes one. The correctness theorem, proved once, connects
them for every list.
:::

Why write two descriptions of the same thing? Because they serve different readers.

- **The specification is for people.** It should be short and close to what was meant, so that you can
  check by reading it that it says the right thing. This is validation (Module 1), and it is easier the
  less the specification says about computation.
- **The implementation is for the computer.** It should be fast, use little memory, or fit the data
  structures at hand. Clever implementations are hard to check by reading.
- **The proof is the bridge.** Once the theorem is proved, nobody has to read the implementation to trust
  it: it is enough to read the specification and know that Isabelle has checked the proof.

One specification also serves many implementations. Insertion sort, merge sort and quicksort all meet the
same sorting specification; each needs its own proof, but the statement of the theorem is the same.

Specifications come in two kinds, and this module uses both. A **property** describes the result
directly, as `sorted` and `mset` do for sorting. A **model** describes a simple version of the data and
its operations, such as a mathematical set or a plain list, and the theorem says that the clever version
behaves like the simple one. Sections 12.5 and 12.6 develop the second kind.

::: keyidea
A test checks the implementation on one input. A correctness theorem covers every input, but it is
only as good as its specification: a proof against a specification that says too little proves too
little. Section 12.4 shows what happens when half of a specification is missing.
:::

::: note
The correctness in this module is **functional correctness**: it is about which result a program
computes. How long it takes and how much memory it uses are other properties, with specifications of
their own. They can be verified too, but this module does not; Section 12.6 points to a library theory
that does it for one of the programs here.
:::

## Insertion sort and its specification {#isort}

### The program {#isort-program}

Insertion sort is the way many people sort a hand of cards: take the cards one at a time and insert each
into its place among the cards already sorted. As a recursive function it reads: to sort a list x # xs,
sort the tail xs, then insert x at the right place. Inserting x into a sorted list walks along the list
until it meets an element that is not smaller than x, and puts x in front of it.

::: example Insertion sort on paper
Write `ins x ys` for inserting x into the sorted list ys, and `isort` for the sort. Then

$$
\begin{aligned}
\mathit{isort}\ [3, 1, 2]
&= \mathit{ins}\ 3\ (\mathit{ins}\ 1\ (\mathit{ins}\ 2\ [\,]))
 = \mathit{ins}\ 3\ (\mathit{ins}\ 1\ [2]) \\
&= \mathit{ins}\ 3\ [1, 2]
 = 1 \mathbin{\#} \mathit{ins}\ 3\ [2]
 = 1 \mathbin{\#} 2 \mathbin{\#} \mathit{ins}\ 3\ [\,]
 = [1, 2, 3].
\end{aligned}
$$

`ins 1 [2]` puts 1 in front at once, because 1 ≤ 2. `ins 3 [1, 2]` passes 1 and 2, because neither is
at least 3, and arrives at the end of the list.
:::

Start a new theory for this module, for example `Verify.thy`. Its header imports a theory from Isabelle's
library **HOL-Library** besides `Main`:

```isabelle norun
theory Verify
  imports Main "HOL-Library.Multiset"
begin

end
```

The Isabelle text of this module goes between `begin` and `end`. HOL-Library comes with Isabelle, but it
is not part of `Main`; `"HOL-Library.Multiset"` names its theory `Multiset`, which defines the function
`mset` of the specification. When you open a theory with this import, Isabelle/jEdit first loads
`Multiset` and the theories it builds on, and only then checks your own text. That takes a little while,
and the progress shows in the **Theories** panel. It happens each time you start Isabelle/jEdit, because
the library theory is not part of the prebuilt HOL image.

Now the two functions:

```isabelle
fun ins :: "'a::linorder ⇒ 'a list ⇒ 'a list" where
  "ins x [] = [x]"
| "ins x (y # ys) = (if x ≤ y then x # y # ys else y # ins x ys)"
```

```output
consts
  ins :: "'a ⇒ 'a list ⇒ 'a list"

Found termination order: "(λp. length (snd p)) <*mlex*> {}"
```

```isabelle
fun isort :: "'a::linorder list ⇒ 'a list" where
  "isort [] = []"
| "isort (x # xs) = ins x (isort xs)"
```

```output
consts
  isort :: "'a list ⇒ 'a list"

Found termination order: "length <*mlex*> {}"
```

The type `'a::linorder` reads "any type `'a` in the class `linorder`". Module 8 introduced type
classes; `linorder` is the class of **linearly ordered** types, whose `≤` is reflexive, transitive and
antisymmetric and relates any two values one way or the other: x ≤ y or y ≤ x. The natural numbers and
the integers are linearly ordered, so `isort` sorts lists of either. Isabelle's answer prints the types
without the class, as it does by default (Module 8 showed how to make sorts visible). The names `ins`
and `isort` are chosen so as not to clash with the library's own insertion sort, `insort` and `sort`.

Test the program before you try to prove anything about it:

```isabelle
value "isort [3, 1, 4, 1, 5, 9, 2, 6 :: int]"
```

```output
"[1, 1, 2, 3, 4, 5, 6, 9]"
  :: "int list"
```

::: trouble
If you leave out `::linorder`, Isabelle does not know that `≤` exists for the type `'a`:

```isabelle fails
fun ins_any :: "'a ⇒ 'a list ⇒ 'a list" where
  "ins_any x [] = [x]"
| "ins_any x (y # ys) = (if x ≤ y then x # y # ys else y # ins_any x ys)"
```

```output
*** Type unification failed: Variable 'a::type not of sort ord
***
*** Type error in application: incompatible operand type
***
*** Operator:  (≤) :: ??'a ⇒ ??'a ⇒ bool
*** Operand:   x :: 'a
***
```

A plain `'a` stands for any type at all, including types that have no `≤`; in Isabelle's words, its sort
is `type`, the sort of all types. The message says that such a variable is not of sort `ord`, the class
of types with `≤` and `<`. The **sort** after `::` (Module 8) restricts `'a` to types that have them.
`'a::ord` would be enough to make the definition type-check, but the proofs below need the laws of a
linear order, so use `linorder`.
:::

### The specification {#isort-spec}

The specification has two halves, both made of library functions.

**Sorted.** `sorted` from the library says that each element of a list is at most every element after
it:

```isabelle
thm sorted_simps
```

```output
  sorted [] = True
  sorted (?x # ?ys) = ((∀y∈set ?ys. ?x ≤ y) ∧ sorted ?ys)
```

The question marks mark schematic variables (Module 7): the equations hold for every x and ys. Read the
second equation aloud: "x # ys is sorted if and only if x is at most every y in ys, and ys is sorted".
`set ys` is the set of the elements of ys, and `∀y∈set ys. P y` reads "for every y in ys, P of y". Try
it on two lists:

```isabelle
value "sorted [1, 2, 2, 5 :: nat]"
value "sorted [1, 3, 2 :: nat]"
```

```output all
"True"
  :: "bool"

"False"
  :: "bool"
```

**A permutation.** Sortedness alone is not enough, as Module 1 noticed: the empty list is sorted. The
result must also contain the same elements as the input, each as often. Sets cannot say "as often", so the
specification uses multisets.

::: definition Multiset and permutation
A **multiset** (or *bag*) is a collection in which order does not matter but the number of copies of each
element does. `mset xs` is the multiset of the elements of the list xs; `count M x` is the number of
copies of x in M. A list ys is a **permutation** of xs if it has the same elements, each as often:
`mset ys = mset xs`.
:::

```isabelle
value "mset [2, 1, 2 :: nat] = mset [1, 2, 2]"
value "mset [1, 2 :: nat] = mset [1, 2, 2]"
value "count (mset [2, 1, 2 :: nat]) 2"
```

```output all
"True"
  :: "bool"

"False"
  :: "bool"

"2"
  :: "nat"
```

`[2, 1, 2]` and `[1, 2, 2]` are permutations of each other; `[1, 2]` has one 2 too few. In proofs you
meet multisets through the two equations that define `mset`:

```isabelle
thm mset.simps
```

```output
  mset [] = {#}
  mset (?a # ?x) = add_mset ?a (mset ?x)
```

The second equation reads "the multiset of a # x is the multiset of x with one more copy of a". `{#}` is
the empty multiset and `add_mset a M` is M with one more copy of a. So
`mset [3, 1] = add_mset 3 (add_mset 1 {#})`, which Isabelle also writes `{#3, 1#}`. When `value`
computes a multiset, though, it shows it as `mset` of a list:

```isabelle
value "mset [3, 1 :: nat]"
```

```output
"mset [3, 1]"
  :: "nat multiset"
```

To compute with multisets, Isabelle represents each one by a list of its elements, and `value` prints
that representation. Section 12.6 comes back to this.

::: definition The sorting specification
A function `f :: 'a::linorder list ⇒ 'a list` **meets the sorting specification** if for every list xs,
`sorted (f xs)` and `mset (f xs) = mset xs`: the result is sorted, and it is a permutation of the input.
:::

Before you spend time on a proof, test the claim. Quickcheck (Module 9) tries to refute it:

```isabelle
lemma "sorted (isort xs) ∧ mset (isort xs) = mset xs"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found no counterexample.
```

Quickcheck tried every list up to a small size and found no counterexample. That is encouraging, not
conclusive: a bug might show only on longer lists. In Isabelle/jEdit you do not even need the command,
because Auto Quickcheck tries every new `lemma` statement and marks the line with a blue **i** when it
finds a counterexample (Module 1). Now prove it.

## Proving insertion sort correct {#isort-proof}

The correctness theorem is a conjunction, so prove its halves separately and join them at the end.
Both halves follow the same plan, the one Module 11 taught: try the obvious induction, read the goal on
which automation gets stuck, and find the lemma that is missing.

### Sorted: the obvious attempt {#sorted-attempt}

`isort` is defined by recursion on the list, so try induction on the list:

```isabelle fails
lemma "sorted (isort xs)"
  by (induction xs) auto
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ⋀a xs. sorted (isort xs) ⟹ sorted (ins a (isort xs))
```

The base case is solved; the induction step is not. Read the goal that is left. Its premise is the
induction hypothesis, `sorted (isort xs)`, and its conclusion is `sorted (ins a (isort xs))`, where a
is Isabelle's name for the head of the list. So the step needs one fact: **inserting into a sorted list
gives a sorted list**. That fact is about `ins` alone; `isort` only supplies the sorted list. Following
Module 11's recipe, replace the specific list `isort xs` by a variable, and state the fact as a lemma of
its own:

$$
\mathit{sorted}\ xs \Longrightarrow \mathit{sorted}\ (\mathit{ins}\ x\ xs)
$$

### The lemmas about ins {#ins-lemmas}

On paper, the lemma follows by induction on xs. For the empty list, `ins x [] = [x]` is sorted. For
y # ys, look at the two branches of `ins`:

- If x ≤ y, the result is x # y # ys. It is sorted because x ≤ y, y is at most every element of ys (the
  list y # ys is sorted), so x is too, and y # ys is sorted.
- Otherwise y < x, and the result is y # ins x ys. The tail `ins x ys` is sorted by the induction
  hypothesis, because ys is sorted. And y must be at most every element of `ins x ys`. Which elements are
  those? Those of ys, and x. y is at most each of them: at most x because y < x, at most the elements of
  ys because y # ys is sorted.

The second branch uses a fact that is so obvious on paper that it is easy to overlook: the elements of
`ins x ys` are x and the elements of ys. Isabelle does not overlook it. Start the proof of the lemma and
look at the goals that `auto` leaves:

```isabelle
lemma "sorted xs ⟹ sorted (ins x xs)"
  apply (induction xs)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a xs xa.
       ⟦sorted (ins x xs); ∀x∈set xs. a ≤ x; sorted xs; ¬ x ≤ a;
        xa ∈ set (ins x xs)⟧
       ⟹ a ≤ xa
```

```isabelle
  oops
```

One goal remains, from the branch where ¬ x ≤ a: the head a must be at most every element xa of
`ins x xs`. (The bound x in `∀x∈set xs. a ≤ x` is a different x from the one being inserted; Isabelle
reuses the name.) `auto` knows that a is at most every element of xs and that ¬ x ≤ a, but nothing about
which elements `ins x xs` has: exactly the fact the paper proof used without comment. State it as a
lemma. It has its own, easy induction:

```isabelle
lemma set_ins: "set (ins x xs) = insert x (set xs)"
  by (induction xs) auto
```

`insert x A` is the set A with x added, `{x} ∪ A`. With `set_ins` available, the lemma about
sortedness goes through. Here it is in Isar, following the paper proof case by case:

```isabelle
lemma sorted_ins: "sorted xs ⟹ sorted (ins x xs)"
proof (induction xs)
  case Nil
  show ?case by simp
next
  case (Cons y ys)
  show ?case
  proof (cases "x ≤ y")
    case True
    with Cons.prems show ?thesis by auto
  next
    case False
    with Cons show ?thesis by (auto simp: set_ins)
  qed
qed
```

In the case x ≤ y, the premise `Cons.prems`, that y # ys is sorted, is all `auto` needs. In the other
case it also needs the induction hypothesis (passed with the whole of `Cons`) and the new lemma. Once you
know which facts each step needs, the whole induction fits on one line as well; the Isar version shows a
reader where each fact is used.

```isabelle
lemma "sorted xs ⟹ sorted (ins x xs)"
  by (induction xs) (auto simp: set_ins)
```

Now the theorem's first half is the original induction, with the lemma passed to `auto`:

```isabelle
lemma sorted_isort: "sorted (isort xs)"
  by (induction xs) (auto simp: sorted_ins)
```

### A permutation {#perm-proof}

The second half goes the same way. Try the obvious induction and look at the step:

```isabelle
lemma "mset (isort xs) = mset xs"
  apply (induction xs)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a xs.
       mset (isort xs) = mset xs ⟹
       mset (ins a (isort xs)) = add_mset a (mset xs)
```

```isabelle
  oops
```

The step needs the multiset of `ins a (isort xs)`. With the hypothesis `mset (isort xs) = mset xs`,
the goal would follow from a fact about `ins` alone: inserting x adds one copy of x to the multiset. As
before, generalise `isort xs` to any list:

```isabelle
lemma mset_ins: "mset (ins x xs) = add_mset x (mset xs)"
  by (induction xs) auto

lemma mset_isort: "mset (isort xs) = mset xs"
  by (induction xs) (auto simp: mset_ins)
```

Notice that `mset_ins` holds for every list, sorted or not: `ins` never loses or duplicates an element,
wherever it stops.

### The correctness theorem {#isort-theorem}

The two halves give the theorem. `proof` without a method applies the standard rule for `∧` (Module 10),
which leaves one goal for each half:

```isabelle
theorem isort_correct: "sorted (isort xs) ∧ mset (isort xs) = mset xs"
proof
  show "sorted (isort xs)" by (rule sorted_isort)
next
  show "mset (isort xs) = mset xs" by (rule mset_isort)
qed
```

Insertion sort is verified: for every list of every linearly ordered type, `isort` returns a sorted
permutation of its input.

::: keyidea
Proofs about programs are found from the top down and written from the bottom up. You start with the
theorem, try induction, and read the goal on which automation stops; the goal tells you which lemma about
a smaller function is missing, often after you generalise a specific term to a variable. The finished
theory lists the lemmas first (`set_ins`, `sorted_ins`, `mset_ins`) and the theorem last.
:::

::: tip
When a goal mentions a library function, such as `mset` of an appended list, the lemma you need is
probably in the library already. Search for it with `find_theorems` (Module 9) before you prove it
yourself. For functions of your own, such as `ins`, the lemmas are yours to state.
:::

## Why a specification needs both halves {#halves}

A verified program is only as good as its specification, so look at the specification as critically as
at the program. Would one half have been enough? Two deliberately wrong "sorting" functions answer the
question.

```isabelle
definition sort_drop :: "'a::linorder list ⇒ 'a list" where
  "sort_drop xs = []"

definition sort_keep :: "'a::linorder list ⇒ 'a list" where
  "sort_keep xs = xs"
```

`sort_drop` throws the list away; `sort_keep` returns it unchanged. Neither sorts. But `sort_drop` meets
the first half of the specification, because the empty list is sorted:

```isabelle
lemma "sorted (sort_drop xs)"
  by (simp add: sort_drop_def)
```

Its failure shows only in the second half, and Quickcheck finds it at once:

```isabelle
lemma "mset (sort_drop xs) = mset xs"
  quickcheck
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  xs = [a⇩1]
Evaluated terms:
  mset (sort_drop xs) = mset []
  mset xs = mset [a⇩1]
```

The counterexample is a list with one element, a₁. Quickcheck tests a claim about an unknown element type
on small types whose values it calls a₁, a₂, a₃ and so on. The evaluated terms show the two sides of the
equation, each multiset printed as `mset` of a list, as `value` prints it: the empty multiset on the
left, a multiset with a₁ on the right. Nitpick (Module 9) agrees. It tries several sizes of the element
type at once, so which counterexample it reports first can vary from run to run; the option
`card 'a = 2` fixes the size of `'a` to two values:

```isabelle
  nitpick [card 'a = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2:
  Free variable:
    xs = [a⇩1]
```

```isabelle
  oops
```

`sort_keep` is the mirror image. It meets the second half, since every list is a permutation of itself:

```isabelle
lemma "mset (sort_keep xs) = mset xs"
  by (simp add: sort_keep_def)
```

and fails the first:

```isabelle
lemma "sorted (sort_keep xs)"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  xs = [a⇩2, a⇩1]
```

Quickcheck's small types are ordered by the index of their values, a₁ < a₂ < a₃, so the list
`[a₂, a₁]` is out of order, and `sort_keep` returns it unchanged.

Each half rules out one kind of wrong program. "Sorted" rules out programs that leave elements out of
order; "permutation" rules out programs that lose, add or duplicate elements. Only together do they say
what sorting means.

Are the two halves together enough, or could a wrong program still meet both? They are enough: for each
input, exactly one list is sorted and a permutation of it. The library proves this about its own sorting
function `sort`:

```isabelle
thm properties_for_sort
```

```output
⟦mset ?ys = mset ?xs; sorted ?ys⟧ ⟹ sort ?xs = ?ys
```

Read it as: if ys is a permutation of xs and ys is sorted, then ys is `sort xs`. So every function that
meets the specification computes the same results as `sort`; Exercise 12.7 uses this to prove
`isort xs = sort xs`. The specification pins down the result for every input.

::: pitfall
A common weakening of the specification uses sets instead of multisets: `sorted ys ∧ set ys = set xs`.
It looks right, and it is wrong. A function that sorts and also removes duplicates, turning
`[2, 1, 2]` into `[1, 2]`, meets it. For scores in a school this loses a pupil's mark whenever two pupils
have the same score. Exercise 12.8 builds such a function and lets Quickcheck expose it.
:::

::: note
Not every specification has to pin down the result. A specification that allows several results is useful
when any of them will do: "return some element of the list", "return a shortest path". But then
"meets the specification" is all the theorem promises, and the users of the program must not rely on
which result they get.
:::

## Binary search trees {#bst}

Sorting is a function from inputs to outputs. Many programs instead keep data in a structure and offer
operations on it: insert a key, ask whether a key is present. Such a structure is correct if the
operations behave as they should on the data the structure represents. A **binary search tree** is the
standard example.

To find a name in a sorted phone book you do not read it from the first page: you open it in the middle,
see whether the name comes before or after, and repeat in the half that remains. A binary search tree
stores keys so that every search can work like that. Each node holds a key; the keys in its left subtree
are smaller, the keys in its right subtree larger. To look for a key, compare it with the key at the root
and go left or right. A search follows a single path from the root, so it takes at most as many steps as
the tree is high. In a well-balanced tree with n keys that is about log₂ n steps, far fewer than n.

### Trees and the set they represent {#bst-trees}

The trees are those of Module 11: a tree is either a leaf `Lf`, which holds nothing, or a node
`Nd l x r` with a left subtree l, a key x and a right subtree r.

```isabelle
datatype 'a btree = Lf | Nd "'a btree" 'a "'a btree"
```

A search tree stands for a set of keys: the set of all keys in its nodes. This is what a user of the tree
cares about. Which shape the tree has, and where each key sits, is the tree's business. Define the set as
a function:

```isabelle
fun set_of :: "'a btree ⇒ 'a set" where
  "set_of Lf = {}"
| "set_of (Nd l x r) = set_of l ∪ {x} ∪ set_of r"
```

`set_of` is the **abstraction function** of search trees: it maps each tree, the concrete data, to the
set it represents, the abstract value. Section 12.6 makes the idea general.

::: note
The `datatype` command defines such a function by itself, called `set_btree`, together with others such
as `map_btree` (the Isabelle manual on datatypes, `datatypes.pdf`, lists them). Its equations, with
variable names that Isabelle generated, say the same as those of `set_of`:

```isabelle
thm btree.set
```

```output
  set_btree Lf = {}
  set_btree (Nd ?x21.0 ?x22.0 ?x23.0) =
  set_btree ?x21.0 ∪ {?x22.0} ∪ set_btree ?x23.0
```

This module defines its own function, so that the abstraction function is visible in the theory.
:::

### Search and insertion {#bst-ops}

Searching compares the key with the key of the node and goes left, goes right, or stops:

```isabelle
fun isin :: "'a::linorder ⇒ 'a btree ⇒ bool" where
  "isin x Lf = False"
| "isin x (Nd l y r) = (if x < y then isin x l else if y < x then isin x r else True)"
```

Insertion searches in the same way. If it finds the key, the tree stays as it is; if it reaches a leaf,
the key was not there, and the leaf becomes a new node:

```isabelle
fun tinsert :: "'a::linorder ⇒ 'a btree ⇒ 'a btree" where
  "tinsert x Lf = Nd Lf x Lf"
| "tinsert x (Nd l y r) =
     (if x < y then Nd (tinsert x l) y r
      else if y < x then Nd l y (tinsert x r)
      else Nd l y r)"
```

Here is a tree with six keys to try them on; Figure 12.2 draws it.

```isabelle
definition t0 :: "int btree" where
  "t0 = Nd (Nd (Nd Lf 1 Lf) 2 (Nd Lf 4 Lf)) 5 (Nd Lf 8 (Nd Lf 9 Lf))"

value "set_of t0"
value "isin 4 t0"
value "isin 7 t0"
```

```output all
consts
  t0 :: "int btree"

"{5, 2, 1, 4, 8, 9}"
  :: "int set"

"True"
  :: "bool"

"False"
  :: "bool"
```

A set has no order: Isabelle prints the keys in the order in which the generated code collected them, and
`{5, 2, 1, 4, 8, 9}` is the same set as `{1, 2, 4, 5, 8, 9}`. The search for 4 goes left at 5 and right
at 2, and finds 4. The search for 7 goes right at 5, left at 8, and reaches a leaf: 7 is not there. Inserting 6 takes the same path as the search for 7, and puts a
new node where that search ended:

```isabelle
value "tinsert 6 t0"
```

```output
"Nd (Nd (Nd Lf 1 Lf) 2 (Nd Lf 4 Lf)) 5 (Nd (Nd Lf 6 Lf) 8 (Nd Lf 9 Lf))"
  :: "int btree"
```

::: figure id=fig-12-2
The search tree `t0` before and after `tinsert 6`. Insertion follows the path of a search (right at 5,
left at 8) and replaces the leaf where the search ends by a new node. Every key in a left subtree is
smaller than the key above it, and every key in a right subtree is larger: the invariant `bst`.
:::

### The invariant {#bst-invariant}

The search only works if the keys are in the right places. In this tree, 6 sits in the left subtree of
5, where only smaller keys belong:

```isabelle
value "isin 6 (Nd (Nd Lf 1 (Nd Lf 6 Lf)) 5 (Lf :: int btree))"
```

```output
"False"
  :: "bool"
```

The key 6 is in the tree, but the search goes right at 5 and finds a leaf. The functions are not wrong;
they assume something about the tree that this tree does not satisfy. That assumption is the tree's
invariant.

::: definition Invariant of a data structure
An **invariant** of a data structure is a property that every value built by its operations has, and
that the operations may rely on. The operations must **preserve** it: if their input satisfies the
invariant, so does their output.
:::

For search trees, the invariant is that at every node, all keys of the left subtree are smaller than the
node's key and all keys of the right subtree are larger:

```isabelle
fun bst :: "'a::linorder btree ⇒ bool" where
  "bst Lf = True"
| "bst (Nd l x r) =
     (bst l ∧ bst r ∧ (∀y ∈ set_of l. y < x) ∧ (∀y ∈ set_of r. x < y))"
```

`∀y ∈ set_of l. y < x` reads "every key y of l is less than x". Check it on the two trees:

```isabelle
value "bst t0"
value "bst (Nd (Nd Lf 1 (Nd Lf 6 Lf)) 5 (Lf :: int btree))"
```

```output all
"True"
  :: "bool"

"False"
  :: "bool"
```

The specification of search trees now has three parts, and Section 12.6 shows that they are an instance
of a general pattern:

1. Insertion preserves the invariant: `bst t ⟹ bst (tinsert x t)`.
2. Insertion inserts: `set_of (tinsert x t) = insert x (set_of t)`.
3. Search is correct: `bst t ⟹ isin x t = (x ∈ set_of t)`.

The second and third parts say that `tinsert` and `isin` do to the tree what `insert` and `∈` do to the
set it represents. The third holds only for trees that satisfy the invariant, as the tree with 6 in the
wrong place showed.

### A wrong invariant {#bst-wrong}

The invariant must say the right thing, and that is easy to get wrong. A tempting simplification
compares each node only with its two children: the left child's key must be smaller, the right child's
larger. It is easier to state and quicker to check:

```isabelle
fun bst_local :: "'a::linorder btree ⇒ bool" where
  "bst_local Lf = True"
| "bst_local (Nd l x r) =
     (bst_local l ∧ bst_local r ∧
      (case l of Lf ⇒ True | Nd _ y _ ⇒ y < x) ∧
      (case r of Lf ⇒ True | Nd _ y _ ⇒ x < y))"
```

The pattern `Nd _ y _` matches any node and names only its key; `_` stands for a part you do not need.
Is search correct for trees with this invariant? Ask Quickcheck before trying to prove it:

```isabelle
lemma "bst_local t ⟹ isin x t = (x ∈ set_of t)"
  quickcheck
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  t = Nd Lf a⇩2 (Nd (Nd Lf a⇩1 Lf) a⇩3 Lf)
  x = a⇩1
Evaluated terms:
  isin x t = False
  x ∈ set_of t = True
```

```isabelle
  oops
```

Draw the tree. Its root holds a₂ and has an empty left subtree. The right child holds a₃, and the left
child of that node holds a₁. Each node is in order with its children: a₃ is larger than a₂, and a₁ is
smaller than a₃. So `bst_local` holds. But a₁ is smaller than a₂ and sits in a₂'s right subtree. The
search for a₁ compares it with a₂, goes left and finds a leaf: `isin` answers False, although a₁ is in
the tree. The evaluated terms show exactly this.

::: pitfall
An invariant about a recursive structure usually has to speak about whole subtrees, not only about
neighbours. If a property holds between neighbours only, check with Quickcheck or Nitpick that it
implies what the operations need, before you build proofs on it.
:::

### Proving the search tree correct {#bst-proofs}

Start with the first part of the specification, the invariant, and try the obvious induction:

```isabelle
lemma "bst t ⟹ bst (tinsert x t)"
  apply (induction t)
  apply auto
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀t1 x2 t2 xa.
       ⟦bst (tinsert x t1); bst (tinsert x t2); bst t1; bst t2;
        ∀y∈set_of t1. y < x2; ∀x∈set_of t2. x2 < x; x2 < x; ¬ x < x2;
        xa ∈ set_of (tinsert x t2)⟧
       ⟹ x2 < xa
 2. ⋀t1 x2 t2 y.
       ⟦bst (tinsert x t1); bst (tinsert x t2); bst t1; bst t2;
        ∀y∈set_of t1. y < x2; ∀x∈set_of t2. x2 < x; ¬ x2 < x; x < x2;
        y ∈ set_of (tinsert x t1)⟧
       ⟹ y < x2
```

```isabelle
  oops
```

Two goals remain, one for each direction in which `tinsert` descends. Look at the first: insertion went
right (x2 < x, where x2 is the key at the node), and the goal asks that x2 be smaller than every key xa
of `tinsert x t2`. The premises say that x2 is smaller than every key of t2 and smaller than x. That
would be enough if `auto` knew that the keys of `tinsert x t2` are x and the keys of t2, which is the
second part of the specification. Prove it first, and pass it to `auto`:

```isabelle
lemma set_of_tinsert: "set_of (tinsert x t) = insert x (set_of t)"
  by (induction t) auto

lemma bst_tinsert: "bst t ⟹ bst (tinsert x t)"
  by (induction t) (auto simp: set_of_tinsert)
```

The lemma `set_of_tinsert` is the second part of the specification. It plays the role that `set_ins`
played for insertion sort: the invariant talks about the keys in subtrees, so preserving it requires
knowing which keys insertion adds.

The third part, correctness of search, needs no new lemma. Try the obvious induction:

```isabelle
lemma isin_set_of: "bst t ⟹ isin x t = (x ∈ set_of t)"
  by (induction t) auto
```

It works at once. It is still worth knowing why it holds, because the argument shows where the invariant
is needed. On paper: take a tree Nd l y r that satisfies the invariant, and compare x with y. There are
three cases.

- **x < y.** The search continues in l, and by the induction hypothesis it answers whether x ∈ set_of l.
  That is the right answer, because x cannot be y, and x cannot be in r, whose keys are all larger than
  y.
- **x = y.** The search stops and answers True, which is right.
- **y < x.** The mirror image of the first case.

The invariant is used twice in each of the outer cases: once for the induction hypothesis, which needs
the subtree to be a search tree, and once to rule out the other subtree. `auto` found both uses by itself,
because the definition of `bst` is a simplification rule.

## Data refinement {#refinement}

The search tree was verified in a particular way. Its specification did not describe trees at all; it
described sets, and the proofs related the tree operations to set operations through the abstraction
function. This way of verifying a data structure is called data refinement, and it applies to almost
every data structure.

### The pattern {#refine-pattern}

::: definition Data refinement
An **abstract model** is a simple mathematical type with operations whose meaning is clear, such as
sets with `{}`, `insert` and `∈`. A **concrete data structure** implements it with a type and operations
of its own, chosen for efficiency. They are connected by an **abstraction function** α, which maps each
concrete value to the abstract value it represents, and an **invariant** I on concrete values. The
concrete structure **refines** the model if:

1. the concrete empty value represents the abstract one and satisfies I;
2. every concrete operation preserves I;
3. on values that satisfy I, every concrete operation corresponds to its abstract one: applying the
   concrete operation and then α gives the same as applying α and then the abstract operation; and every
   query, such as a search, gives the answer the abstract query gives.
:::

Condition 3 is often drawn as a square, as in Figure 12.3: going along the top and then down gives the
same result as going down and then along the bottom. Diagrams of this kind are called **commuting
squares**.

For search trees the pieces are:

| | Abstract model | Concrete structure |
|---|---|---|
| Values | `'a set` | `'a btree` satisfying `bst` |
| Empty | `{}` | `Lf` |
| Insert | `insert x A` | `tinsert x t` |
| Member | `x ∈ A` | `isin x t` |
| Connection | | α = `set_of`, I = `bst` |

`set_of Lf = {}` and `bst Lf` hold by the definitions, `bst_tinsert` is condition 2, and
`set_of_tinsert` and `isin_set_of` are condition 3.

The reward comes when you use the data structure. A program that uses search trees can be reasoned about
with sets, which you know well, instead of with trees. Here is a fact about trees proved without looking
at a single tree, from the three lemmas alone:

```isabelle
lemma "bst t ⟹ isin y (tinsert x t) = (y = x ∨ isin y t)"
  by (simp add: bst_tinsert isin_set_of set_of_tinsert)
```

The simplifier turns both sides into statements about `set_of t`, where the claim is a law of sets. The
proof never looks inside `isin` or `tinsert`: if you replaced the trees by balanced trees with the same
three lemmas, this proof would not change.

### A queue made of two lists {#queue}

A **queue** is a waiting line: elements join at the back and leave from the front, so the first to
join is the first to leave. The abstract model is a list, with the front of the queue at the head of
the list. Joining is `xs @ [x]`, leaving is `tl xs`, and the element at the front is `hd xs`.

As a program, the plain list is slow: `xs @ [x]` copies the whole list, so a queue of n elements costs n
steps for each element that joins. A classic functional implementation uses two lists. The **front**
list holds the first elements, in order; the **back** list holds the last elements in reverse order, so
that joining the queue puts an element at the head of the back list in one step. Elements leave from the
head of the front list. When the front list runs empty, the back list is reversed and becomes the new
front list.

```isabelle
datatype 'a queue = Queue "'a list" "'a list"
```

A value `Queue f b` has the front list f and the back list b. The queue it represents is the front list
followed by the back list reversed. That is the abstraction function:

```isabelle
fun list_of :: "'a queue ⇒ 'a list" where
  "list_of (Queue f b) = f @ rev b"
```

```isabelle
value "list_of (Queue [1, 2] [4, 3 :: nat])"
```

```output
"[1, 2, 3, 4]"
  :: "nat list"
```

Now the operations. `refill` moves the back list to the front when the front list is empty; `enq`
(enqueue) adds an element at the back, `deq` (dequeue) removes the front element, and `first` returns it.

```isabelle
definition qempty :: "'a queue" where
  "qempty = Queue [] []"

fun refill :: "'a queue ⇒ 'a queue" where
  "refill (Queue [] b) = Queue (rev b) []"
| "refill q = q"

fun enq :: "'a ⇒ 'a queue ⇒ 'a queue" where
  "enq x (Queue f b) = refill (Queue f (x # b))"

fun deq :: "'a queue ⇒ 'a queue" where
  "deq (Queue [] b) = Queue [] b"
| "deq (Queue (x # f) b) = refill (Queue f b)"

fun first :: "'a queue ⇒ 'a" where
  "first (Queue f b) = hd f"
```

The second equation of `refill` applies only when the first does not, that is, when the front list is
not empty (Module 8 explained how `fun` resolves overlapping patterns). Try the operations:

```isabelle
value "enq 5 (Queue [1, 2] [4, 3 :: nat])"
value "deq (Queue [1] [4, 3, 2 :: nat])"
```

```output all
"Queue [1, 2] [5, 4, 3]"
  :: "nat queue"

"Queue [2, 3, 4] []"
  :: "nat queue"
```

Adding 5 puts it at the head of the back list. Removing 1 empties the front list, so `refill` reverses
the back list into the front: `[4, 3, 2]` becomes `[2, 3, 4]`. Every element is moved from the back to the front
at most once, so on average each operation takes a constant number of steps, although a single `deq`
may take longer. (That is a claim about running time, which this module does not prove; the theory
`Queue_2Lists`, described at the end of this section, does.)

`first` returns the head of the front list. That is the right answer only if the front list is
empty only when the whole queue is: otherwise the first element might be waiting in the back list. The
operations keep this true, because `refill` never leaves an empty front list in front of a non-empty
back list. It is the invariant of the queue:

```isabelle
fun qinv :: "'a queue ⇒ bool" where
  "qinv (Queue f b) = (f = [] ⟶ b = [])"
```

::: figure id=fig-12-3
The two-list queue as a commuting square. Along the top, the concrete operation `enq 5`; along the
bottom, the abstract operation, appending `[5]`; the abstraction function `list_of` goes down on both
sides. Both paths from the top left corner give the list `[1, 2, 3, 4, 5]`.
:::

### Proving the queue correct {#queue-proof}

The specification follows the pattern of Definition 12.5, with lists as the abstract model:

| | Abstract model | Queue |
|---|---|---|
| Empty | `[]` | `qempty` |
| Join at the back | `xs @ [x]` | `enq x q` |
| Leave at the front | `tl xs` | `deq q` |
| Front element | `hd xs` | `first q` |
| Connection | | α = `list_of`, I = `qinv` |

Start with the empty queue, which needs only the definition of `qempty`:

```isabelle
lemma list_of_qempty: "list_of qempty = []"
  by (simp add: qempty_def)
```

Next, `enq`. A queue is always of the form `Queue f b`, so split the proof into that one case with
`cases q` (Module 10) and try `auto`:

```isabelle
lemma "list_of (enq x q) = list_of q @ [x]"
  apply (cases q)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀x1 x2.
       q = Queue x1 x2 ⟹
       list_of (refill (Queue x1 (x # x2))) = x1 @ rev x2 @ [x]
```

```isabelle
  oops
```

`cases q` names the two lists of the queue x1 and x2. `auto` has unfolded `enq` on the left and
`list_of q` on the right, but it is stuck at `list_of (refill (Queue x1 (x # x2)))`. The equations of `refill` depend on
whether the front list x1 is empty, and `auto` does not split on that by itself. You could tell it to,
but there is a better way: state once and for all what `refill` does to the list a queue represents,
namely nothing. That lemma will serve every operation that calls `refill`:

```isabelle
lemma list_of_refill: "list_of (refill q) = list_of q"
  by (cases q rule: refill.cases) auto

lemma list_of_enq: "list_of (enq x q) = list_of q @ [x]"
  by (cases q) (simp add: list_of_refill)
```

`cases q rule: refill.cases` splits the proof into the cases of the equations of `refill`: a queue with
an empty front list, and one with a non-empty front list. It is the case analysis that follows a
function's patterns, as `rule: f.induct` is the induction that follows its recursion (Module 11). Note
that `list_of_enq` has no premise: `enq` is correct on every queue, invariant or not, because it only
ever adds to the back.

Is `deq` correct on every queue too? Ask Quickcheck before proving:

```isabelle
lemma "list_of (deq q) = tl (list_of q)"
  quickcheck
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  q = Queue [] [a⇩1]
Evaluated terms:
  list_of (deq q) = [a⇩1]
  tl (list_of q) = []
```

```isabelle
  oops
```

The queue `Queue [] [a₁]` has an empty front list and one element in the back list. It represents the
list `[a₁]`, so removing the front element should leave the empty list. But `deq` sees an empty front
list and returns the queue unchanged. This queue breaks the invariant, and no sequence of `enq` and
`deq` starting from `qempty` builds it. So the correspondence for `deq` holds only under the invariant,
and the invariant is needed exactly when the front list is empty. The Isar proof makes that visible:

```isabelle
lemma list_of_deq:
  assumes "qinv q"
  shows "list_of (deq q) = tl (list_of q)"
proof (cases q)
  case (Queue f b)
  show ?thesis
  proof (cases f)
    case Nil
    with Queue assms have "b = []" by simp
    with Nil Queue show ?thesis by simp
  next
    case (Cons x f')
    with Queue show ?thesis by (simp add: list_of_refill)
  qed
qed
```

With an empty front list, the invariant says that the back list is empty too, so the queue is empty and
`deq` correctly leaves it as it is. With a non-empty front list, `deq` removes its head, and `refill`
does not change the list. The remaining parts are short:

```isabelle
lemma first_correct: "qinv q ⟹ list_of q ≠ [] ⟹ first q = hd (list_of q)"
  by (cases q) auto

lemma qinv_refill: "qinv (refill q)"
  by (cases q rule: refill.cases) auto

lemma qinv_qempty: "qinv qempty"
  by (simp add: qempty_def)

lemma qinv_enq: "qinv (enq x q)"
  by (cases q) (simp add: qinv_refill)

lemma qinv_deq: "qinv q ⟹ qinv (deq q)"
  by (cases q rule: deq.cases) (auto simp: qinv_refill)
```

`first_correct` has two premises: the invariant, and that the queue is not empty, because `hd []` has
no specified value. The lemmas `qinv_qempty`, `qinv_enq` and `qinv_deq` say that every queue built from `qempty` with
`enq` and `deq` satisfies the invariant, so the premise `qinv q` of `list_of_deq` and `first_correct` always holds for
the queues a program can build.

### Verified data structures in practice {#practice}

Search trees and queues are textbook examples, but the pattern is the one used for verified software in
general.

- **Isabelle's own library.** The Isabelle distribution contains the session HOL-Data_Structures, a
  collection of verified functional data structures (in the folder `src/HOL/Data_Structures` of your
  Isabelle installation). Its theory `Queue_Spec` states the queue specification of this section, with
  an emptiness test as well (Exercise 12.6): eight properties, with an abstraction function `list` and an
  invariant `invar`. `Queue_2Lists` proves them for the two-list queue and bounds its running time.
  `Set_Specs` states the set specification of Section 12.5, with deletion as well, and theories such as
  `Tree_Set`, `AVL_Set` and `RBT_Set` prove it for unbalanced, AVL and red-black trees.
- **The code generator.** When Isabelle generates code for sets, it represents a finite set by a list of
  its elements, a data refinement built into the library; importing `HOL-Library.RBT_Set` switches to
  red-black trees. Multisets are represented by lists too, which is why `value` printed `mset [3, 1]` in
  Section 12.2.
- **Large systems.** The seL4 proof (Module 1) is a refinement proof on a large scale: it shows that the
  kernel's C code refines an executable specification, which in turn refines an abstract specification
  of what the kernel does.

::: keyidea
Data refinement separates two questions: what a data structure means (the abstract model) and how it is
built (the concrete structure). The abstraction function connects them, and the invariant records what
the concrete operations assume. Programs that use the structure are reasoned about with the model only.
:::

## From verified functions to running code {#export}

Module 8 showed how `export_code` translates HOL functions into Standard ML, OCaml, Haskell or Scala.
Applied to verified functions, it turns them into verified programs, with a guarantee that the end of
this section makes precise. Export everything this module has verified, as one Haskell module. One
addition first: Haskell code that uses search trees needs an empty tree to start from, so give the empty
tree a name of its own (the reason for not using `Lf` follows below):

```isabelle
definition tempty :: "'a btree" where
  "tempty = Lf"

export_code isort tempty isin tinsert qempty enq deq first
  in Haskell module_name Verified
```

```output
See theory exports
```

As in Module 8, the batch build and the Output panel only say where the code went: Isabelle stores
generated code as **theory exports**, files that belong to the theory, instead of printing it. In
Isabelle/jEdit, *theory exports* in the message is a link. Click it, and the File Browser opens the
folder of code exported by your theory, under the virtual address `isabelle-export:`. There, the folder
`export1` holds the file `Verified.hs`: `export_code` numbers the exports of a theory `export1`,
`export2`, … unless you name the folder yourself with the option `file_prefix`.

Open `Verified.hs` and you find your theory again, in Haskell. The datatypes have become Haskell `data`
declarations: `Btree` with the constructors `Lf` and `Nd`, and `Queue` with the constructor `Queue`.
Each function has the equations that `fun` derived from yours, with `#` written `:` and `rev` written
`reverse`, and the functions that the exported ones need are there too: `ins`, `refill` and the
library's `hd`. The comparisons `≤` and `<` have become `less_eq` and `less`, the operations of a Haskell
type class `Ord` that Isabelle generates from its own class `ord`; the classes `preorder`, `order` and
`linorder` become Haskell classes too (Module 8 compared type classes with Haskell's). The first lines of the module list
what it exports: the functions, and the types `Btree` and `Queue` without their constructors.

That last point protects the invariants. Other Haskell code can build trees only from `tempty` with
`tinsert`, and queues only from `qempty` with `enq` and `deq`, so it cannot build a tree that breaks
`bst` or a queue that breaks `qinv`. Had the list named the constructor `Lf` instead of `tempty`,
Isabelle would have exported the type `Btree` with all its constructors, `Nd` included, and with them
the power to build any tree at all.

One more thing stays inside the module: the classes `Ord`, `Preorder` and `Order` on which `Linorder`
builds. As exported here, other Haskell code cannot say how to compare the elements of its own types,
so it cannot yet call `isort` or the tree functions. Writing `export_code open …` exports everything:
the classes with their operations, and the datatypes with their constructors. Then the functions can be
used on any type, but the protection of the invariants is gone. Choosing what to export is part of
designing the interface of verified code.

### What is guaranteed {#guarantee}

Every function in the generated module comes from equations that Isabelle has proved: the equations of
your `fun` and `definition` commands, which are theorems (Module 8). The code generator translates each
equation into an equation of the target language and adds the definitions it needs from the library. So
when the generated `isort` returns a list, that list is the value of `isort` in the logic, and the
correctness theorem says that it is sorted and a permutation of the input. This guarantee, that every
result the program produces is a result the logic agrees with, is called **partial correctness**: it
speaks about the results the program returns, not about whether it returns at all.

What the guarantee rests on is the trusted base of Module 1, enlarged by the steps after the proof:

- **The code generator.** Its translation of equations into the target language happens outside the
  kernel. Isabelle's code generation manual (`codegen.pdf`) explains that the last steps, translation
  and printing, are carried out outside the logic and are kept as thin as possible, so that there is
  little code to trust. Little is not nothing.
- **The target compiler and its run-time system**: the Haskell compiler, its libraries, garbage
  collector and integer arithmetic.
- **The machine**: the hardware, the operating system, and limits that the logic does not know about.
  In the logic `isort` works on lists of any length; a real computer runs out of memory or stack at some
  length.
- **The code around it.** The theorems about `isin`, `deq` and `first` assume the invariants `bst` and
  `qinv`. The generated module keeps them safe from other Haskell code, as described above, but not
  from code that edits the generated file or exports the constructors: a tree or queue that breaks its
  invariant voids the promise.
- **The specification.** A verified function does what its specification says. Whether that is what
  the users need is still validation.

::: note
Some correspondences between HOL and the target language are set up by hand, and they belong to the
trusted base as well. Even the default set-up has a few: the generated code uses Haskell's own lists,
Booleans and `reverse`. Library theories such as `HOL-Library.Code_Target_Nat`, which Module 8
mentioned, add more: they make the generated code use the target language's own integers instead of a
datatype of natural numbers. That is faster, and it is safe as long as the target's integers behave like
mathematical ones, which Haskell's `Integer` does; but the kernel does not check it.
:::

## What you learned {#summary}

- To **verify** a program is to prove a **correctness theorem**: for every input, the result of the
  **implementation** (how) has the property of the **specification** (what). The specification is
  written for people to read and validate; the implementation for the computer.
- **Insertion sort** meets the sorting specification: `sorted (isort xs) ∧ mset (isort xs) = mset xs`.
  `mset` from `HOL-Library.Multiset` turns a list into the multiset of its elements; `mset ys = mset xs`
  says that ys is a permutation of xs.
- Proofs about programs are found from the top down: try induction, read the goal on which `auto` stops,
  generalise it into a lemma about a smaller function (`set_ins`, `sorted_ins`, `mset_ins`), and prove
  that first.
- Each half of a specification rules out its own kind of wrong program: `[]` is sorted, and the input
  itself is a permutation. Test specifications with Quickcheck and Nitpick before proving, and test them
  against deliberately wrong programs. Sets instead of multisets would let duplicates disappear.
- A **binary search tree** is verified with an **abstraction function** (`set_of`) and an
  **invariant** (`bst`): insertion preserves the invariant and inserts into the set, and search answers
  membership in the set. An invariant that compares only neighbours is too weak.
- **Data refinement** is the general pattern: a concrete structure, an abstract model, an abstraction
  function and an invariant, with the concrete operations corresponding to the abstract ones. The
  two-list queue refines lists, and needs its invariant for `deq` and `first`.
- `export_code` turns verified functions into code, stored as theory exports. The generated code is
  partially correct relative to the proved equations; the code generator, the compiler, the machine and
  the calling code remain in the trusted base. Exporting types without their constructors keeps other
  code from breaking the invariants.

## Exercises {#exercises}

:::: exercise Which functions sort? {#ex-12-1} ★
Decide on paper which of these functions meet the sorting specification of Definition 12.3, and why.
Then check your answers in Isabelle: prove the claims that hold from `sorted_isort` and `mset_isort`, and
let Quickcheck refute the others.

1. `isort (rev xs)`
2. `rev (isort xs)`
3. `isort (isort xs)`
4. `remdups (isort xs)`, where `remdups` removes repeated elements from a list

::: solution
1. **Meets it.** `isort` sorts any list, so the result is sorted, and
   `mset (isort (rev xs)) = mset (rev xs) = mset xs`: reversing does not change the multiset.
2. **Does not.** The result is a permutation of xs, but in descending order. Quickcheck's
   counterexample below, `xs = [a₁, a₂]`, is turned into `[a₂, a₁]`.
3. **Meets it.** Sorting a sorted list changes nothing, and in any case `isort` returns a sorted
   permutation of `isort xs`, which is a permutation of xs.
4. **Does not.** The result is sorted but loses repeated elements, so it is not a permutation:
   `[a₁, a₁]` becomes `[a₁]`.

```isabelle
lemma "sorted (isort (rev xs)) ∧ mset (isort (rev xs)) = mset xs"
  by (simp add: sorted_isort mset_isort)

lemma "sorted (isort (isort xs)) ∧ mset (isort (isort xs)) = mset xs"
  by (simp add: sorted_isort mset_isort)

lemma "sorted (rev (isort xs))"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  xs = [a⇩1, a⇩2]
```

```isabelle
lemma "mset (remdups (isort xs)) = mset xs"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  xs = [a⇩1, a⇩1]
Evaluated terms:
  mset (remdups (isort xs)) = mset [a⇩1]
  mset xs = mset [a⇩1, a⇩1]
```

In the first proof `simp` also uses the library's `mset_rev`, `mset (rev xs) = mset xs`, which is a
simp rule.
:::
::::

:::: exercise A queue by hand {#ex-12-2} ★
For each queue, write down the list it represents and say whether it satisfies `qinv`:
`Queue [1] [3, 2]`, `Queue [] [2, 1]`, `Queue [] []`. Then work out `deq (Queue [1] [3, 2])` and
`enq 4 qempty` by hand, using the equations of Section 12.6. Check your answers with `value`.

::: solution
`Queue [1] [3, 2]` represents `[1] @ rev [3, 2] = [1, 2, 3]` and satisfies the invariant (its front list
is not empty). `Queue [] [2, 1]` represents `[1, 2]` but breaks the invariant: its front list is empty
while its back list is not. `Queue [] []` represents `[]` and satisfies the invariant.

`deq (Queue [1] [3, 2]) = refill (Queue [] [3, 2]) = Queue [2, 3] []`, which represents `[2, 3]`, the
tail of `[1, 2, 3]`. `enq 4 qempty = refill (Queue [] [4]) = Queue [4] []`.

```isabelle
value "list_of (Queue [1] [3, 2 :: nat])"
value "qinv (Queue [] [2, 1 :: nat])"
value "deq (Queue [1] [3, 2 :: nat])"
value "enq 4 (qempty :: nat queue)"
```

```output all
"[1, 2, 3]"
  :: "nat list"

"False"
  :: "bool"

"Queue [2, 3] []"
  :: "nat queue"

"Queue [4] []"
  :: "nat queue"
```
:::
::::

:::: exercise Search trees by hand {#ex-12-3} ★
Which of these trees satisfy `bst`? Draw each one first.

1. `Nd (Nd Lf 2 Lf) 3 (Nd Lf 1 Lf)`
2. `Nd Lf 1 (Nd (Nd Lf 2 Lf) 3 Lf)`
3. `Nd (Nd Lf 1 (Nd Lf 4 Lf)) 3 (Nd Lf 5 Lf)`

Where does `tinsert 3 t0` put the key 3, with `t0` from Section 12.5? Check your answers with `value`.

::: solution
1. **No**: 1 is in the right subtree of 3 but smaller than 3.
2. **Yes**: 2 and 3 are larger than 1 and lie to its right; 2 lies to the left of 3.
3. **No**: 4 is in the left subtree of 3 but larger than 3. Every node is bigger than its left child
   and smaller than its right child, so the tree satisfies `bst_local` of Section 12.5: this is the
   kind of tree on which the wrong invariant fails.

`tinsert 3 t0` goes left at 5, right at 2, and left at 4, where it finds a leaf, so 3 becomes the left
child of 4.

```isabelle
value "bst (Nd (Nd Lf 2 Lf) 3 (Nd Lf 1 Lf) :: int btree)"
value "bst (Nd Lf 1 (Nd (Nd Lf 2 Lf) 3 Lf) :: int btree)"
value "bst (Nd (Nd Lf 1 (Nd Lf 4 Lf)) 3 (Nd Lf 5 Lf) :: int btree)"
value "bst_local (Nd (Nd Lf 1 (Nd Lf 4 Lf)) 3 (Nd Lf 5 Lf) :: int btree)"
value "tinsert 3 t0"
```

```output all
"False"
  :: "bool"

"True"
  :: "bool"

"False"
  :: "bool"

"True"
  :: "bool"

"Nd (Nd (Nd Lf 1 Lf) 2 (Nd (Nd Lf 3 Lf) 4 Lf)) 5 (Nd Lf 8 (Nd Lf 9 Lf))"
  :: "int btree"
```
:::
::::

:::: exercise Sorting keeps the length {#ex-12-4} ★★
Prove `length (isort xs) = length xs` in two ways.

1. By induction, with a lemma about the length of `ins x xs`.
2. Without induction, from `mset_isort`. Use `find_theorems` to find a library fact that relates the
   size of `mset xs` to the length of xs.

::: solution
1. The lemma and the induction:

   ```isabelle
   lemma length_ins: "length (ins x xs) = Suc (length xs)"
     by (induction xs) auto

   lemma "length (isort xs) = length xs"
     by (induction xs) (auto simp: length_ins)
   ```

2. The number of elements of a multiset, counted with their copies, is `size`. Search for facts about
   the size of `mset`:

   ```isabelle
   find_theorems "size (mset _)"
   ```

   ```output result
   find_theorems
     "size (mset _)"

   found 1 theorem(s):
     Multiset.size_mset: size (mset ?xs) = length ?xs
   ```

   `size_mset` is a simp rule, so `simp` turns the sizes into lengths:

   ```isabelle
   lemma "length (isort xs) = length xs"
   proof -
     have "size (mset (isort xs)) = size (mset xs)" by (simp add: mset_isort)
     then show ?thesis by simp
   qed
   ```

The second proof shows a benefit of a strong specification: other facts follow from it without new
inductions.
:::
::::

:::: exercise A bug in insertion {#ex-12-5} ★★
A colleague's insertion has a bug:

```isabelle
fun ins_bad :: "'a::linorder ⇒ 'a list ⇒ 'a list" where
  "ins_bad x [] = [x]"
| "ins_bad x (y # ys) = (if x ≤ y then x # ys else y # ins_bad x ys)"

fun isort_bad :: "'a::linorder list ⇒ 'a list" where
  "isort_bad [] = []"
| "isort_bad (x # xs) = ins_bad x (isort_bad xs)"
```

Find the bug by reading. Then test each half of the specification with Quickcheck. Which half catches
the bug, and why does the other not?

::: solution
In the case x ≤ y, `ins_bad` returns `x # ys` and forgets y. Quickcheck finds no counterexample to the
first half:

```isabelle
lemma "sorted (isort_bad xs)"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found no counterexample.
```

but refutes the second:

```isabelle
lemma "mset (isort_bad xs) = mset xs"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  xs = [a⇩1, a⇩1]
Evaluated terms:
  mset (isort_bad xs) = mset [a⇩1]
  mset xs = mset [a⇩1, a⇩1]
```

Dropping y does not disorder the list: x ≤ y and y is at most every element of ys, so `x # ys` is still
sorted. In fact `sorted (isort_bad xs)` holds for every list, by an induction like the one for `sorted_ins`. Only the permutation half notices that
an element is lost. The fix is the equation of `ins`: `x # y # ys`.
:::
::::

:::: exercise Is the queue empty? {#ex-12-6} ★★
Add an operation that tests whether a queue is empty by looking at the front list only:

```isabelle
fun isempty :: "'a queue ⇒ bool" where
  "isempty (Queue f b) = (f = [])"
```

State its correctness in the style of Section 12.6: it should agree with the abstract test
`list_of q = []`. First let Quickcheck show that the claim needs the invariant, then prove it with the
invariant.

::: solution
```isabelle
lemma "isempty q = (list_of q = [])"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  q = Queue [] [a⇩1]
Evaluated terms:
  isempty q = True
  list_of q = [] = False
```

The counterexample has an empty front list and a non-empty back list: `isempty` answers True for a
queue that is not empty. Such a queue breaks the invariant, and with the invariant as a premise the
claim holds:

```isabelle
lemma isempty_correct: "qinv q ⟹ isempty q = (list_of q = [])"
  by (cases q) auto
```
:::
::::

:::: exercise The specification determines the result {#ex-12-7} ★★★
Prove `isort xs = sort xs`, where `sort` is the library's sorting function. Use `properties_for_sort`
(Section 12.4) with `mset_isort` and `sorted_isort`, and no induction.

::: solution
`properties_for_sort` concludes `sort xs = ys` from `mset ys = mset xs` and `sorted ys`. With
`ys = isort xs`, its two premises are exactly `mset_isort` and `sorted_isort`, in this order, so `rule`
can use them as the facts that discharge the premises:

```isabelle
lemma isort_sort: "isort xs = sort xs"
proof -
  have "sort xs = isort xs"
    using mset_isort sorted_isort by (rule properties_for_sort)
  then show ?thesis by simp
qed
```

The proof never looks at how `isort` works. Any function with the two properties is equal to `sort`, so
this lemma could be proved for merge sort or quicksort in the same way.
:::
::::

:::: exercise Tree sort and a weak specification {#ex-12-8} ★★★
Sort a list by inserting its elements into a search tree and reading the tree from left to right:

```isabelle
fun inorder :: "'a btree ⇒ 'a list" where
  "inorder Lf = []"
| "inorder (Nd l x r) = inorder l @ [x] @ inorder r"

fun build :: "'a::linorder list ⇒ 'a btree" where
  "build [] = Lf"
| "build (x # xs) = tinsert x (build xs)"

definition tsort :: "'a::linorder list ⇒ 'a list" where
  "tsort xs = inorder (build xs)"
```

1. Prove that `tsort` meets the weak specification of Section 12.4:
   `sorted (tsort xs) ∧ set (tsort xs) = set xs`. You need lemmas about `set (inorder t)`,
   `sorted (inorder t)`, `bst (build xs)` and `set_of (build xs)`; the library lemma `sorted_append`
   describes when an appended list is sorted.
2. Show with Quickcheck that `tsort` does not meet the sorting specification, and explain why.

::: solution
1. Four lemmas, then the claim:

   ```isabelle
   lemma set_inorder: "set (inorder t) = set_of t"
     by (induction t) auto

   lemma sorted_inorder: "bst t ⟹ sorted (inorder t)"
     by (induction t) (auto simp: sorted_append set_inorder intro: less_imp_le less_trans)

   lemma bst_build: "bst (build xs)"
     by (induction xs) (auto simp: bst_tinsert)

   lemma set_of_build: "set_of (build xs) = set xs"
     by (induction xs) (auto simp: set_of_tinsert)

   lemma "sorted (tsort xs) ∧ set (tsort xs) = set xs"
     by (simp add: tsort_def sorted_inorder bst_build set_inorder set_of_build)
   ```

   `sorted_inorder` is the hard one. With `sorted_append` and `set_inorder` alone, `auto` stops at a goal
   `x ≤ xa` for a key x of the left subtree and a key xa of the right subtree: it has `x < x2` and
   `x2 < xa` for the key x2 at the node, but does not chain them. The library rules `less_trans`
   (from `x < y` and `y < z` conclude `x < z`) and `less_imp_le` (from `x < y` conclude `x ≤ y`), given
   to `auto` with `intro:` (Module 9), supply the missing steps.

2. Quickcheck refutes the sorting specification at once:

   ```isabelle
   lemma "mset (tsort xs) = mset xs"
     quickcheck
     oops
   ```

   ```output result
   Testing conjecture with Quickcheck-exhaustive...

   Quickcheck found a counterexample:
     xs = [a⇩1, a⇩1]
   Evaluated terms:
     mset (tsort xs) = mset [a⇩1]
     mset xs = mset [a⇩1, a⇩1]
   ```

   A search tree stores a set: `tinsert` leaves the tree unchanged when the key is already there. So
   `tsort` removes duplicates. It satisfies the weak specification with sets, which is exactly why that
   specification is too weak.
:::
::::

## Check yourself {#quiz}

```quiz
? What does a correctness theorem for a program state?
- [ ] That the program passes all of its tests
- [ ] That the specification says what the users want
- [x] That for every input, the program's result has the property the specification describes
- [ ] That the program terminates quickly on every input
> The theorem connects implementation and specification for all inputs. Whether the specification is what the users want is validation.

? `sort_drop xs = []` for every list. Which half of the sorting specification does it meet?
- [x] `sorted (sort_drop xs)`, but not `mset (sort_drop xs) = mset xs`
- [ ] `mset (sort_drop xs) = mset xs`, but not `sorted (sort_drop xs)`
- [ ] Both halves
- [ ] Neither half
> The empty list is sorted, but it is not a permutation of a non-empty list. Only the permutation half catches it.

? Why does the sorting specification use `mset` rather than `set`?
- [ ] `set` cannot be used in Isabelle proofs
- [ ] `mset` makes the proofs shorter
- [ ] `set` would not allow the elements to be reordered
- [x] With `set`, a function that drops repeated elements would meet the specification
> `set [2, 1, 2] = set [1, 2]`, so sets cannot tell whether an element was lost from a group of equal ones. Multisets count copies.

? Search is correct only for trees that satisfy the invariant `bst`. Why does `bst` compare a node's key with all keys in its subtrees, not only with its children?
- [ ] Comparing with children only would make `bst` impossible to compute
- [x] A tree can have every node in order with its children and still have a key on the wrong side of an ancestor, where search misses it
- [ ] Isabelle cannot express comparisons with children
- [ ] It does not matter; both invariants make search correct
> Quickcheck found such a tree for `bst_local`: the key is in the left subtree of a node although it is larger than that node's key.

? What is `list_of (Queue [1, 2] [5, 4, 3])`?
- [ ] `[1, 2, 5, 4, 3]`
- [ ] `[3, 4, 5, 1, 2]`
- [x] `[1, 2, 3, 4, 5]`
- [ ] `[5, 4, 3, 2, 1]`
> The abstraction function is `f @ rev b`: the front list followed by the reversed back list.

? `export_code` generates Haskell code for a verified function. Which statement is right?
- [ ] The Haskell code is checked by Isabelle's kernel
- [ ] The generated program can never crash or run out of memory
- [ ] Nothing about the program is guaranteed, since the code generator is not verified
- [x] Every result the program returns agrees with the logic, provided the code generator, the compiler and the machine work as assumed
> The guarantee is partial correctness relative to the trusted base, which now includes the code generator and the target compiler.
```
