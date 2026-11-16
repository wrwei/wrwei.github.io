---
title: Induction in depth
part: 3
lead: Learn what to do when the obvious induction gets stuck. You will read a failed induction from its proof state, generalise or strengthen the claim, find the missing lemma, follow a function's own recursion, prove facts about predicates defined by rules, and choose the right kind of induction for each goal.
minutes: 220
needs: Modules 5 and 7 to 10
goals:
  - Diagnose a stuck induction from its proof state and generalise the goal with arbitrary
  - Strengthen a claim, or find and prove an auxiliary lemma, when the induction hypothesis is too weak
  - Prove facts about recursive functions by computation induction with rule f.induct
  - Define predicates with inductive and reason about them by rule induction and rule inversion
  - Prove facts about trees, and use complete induction with less_induct
  - Choose the kind of induction that fits a goal
imports: Main
---

## When the obvious induction gets stuck {#stuck}

In Module 5 you proved claims about every list with `by (induction xs) auto`, and in Module 10 you wrote
the same proofs in Isar, case by case. Many proofs about functional programs really are that short. But
sooner or later you state a claim that is true, start an induction, and Isabelle stops with a goal it
cannot prove. This module is about that moment: how to read the stuck goal, what it tells you, and how
to change the proof so that it goes through. The same techniques carry the verification work of
Part IV; the compiler proof of Module 14, for example, rests on a generalised induction.

Recall what an induction proof over lists does. To prove a claim $P\ xs$ for every list, you prove it
for `[]` (the **base case**) and you prove it for `x # xs` while assuming it for `xs` (the **step
case**). The assumption is the **induction hypothesis**, IH for short. The point to keep in mind for the
whole module: the IH is the claim itself, for the smaller list, *with every other variable unchanged*.

### A running total {#running-total}

Module 10 added up the items of a bill with `mysum`, which recurses directly on the list. A loop in a
language like Python does the same job with a running total:

```text
total = 0
for x in xs:
    total = total + x
return total
```

A functional program has no loops. It uses a recursive function with an extra argument that carries the
running total from one call to the next:

```isabelle
fun sumacc :: "nat list ⇒ nat ⇒ nat" where
  "sumacc [] acc = acc"
| "sumacc (x # xs) acc = sumacc xs (acc + x)"
```

```output
consts
  sumacc :: "nat list ⇒ nat ⇒ nat"

Found termination order: "(λp. size_list size (fst p)) <*mlex*> {}"
```

```isabelle
value "sumacc [3, 1, 4] 0"
```

```output
"8"
  :: "nat"
```

::: definition Accumulator and tail recursion
An **accumulator** is an argument in which a function collects its result as it goes. A function is
**tail-recursive** when the recursive call is the last thing it does: nothing remains to be done after
the call returns, so a compiler can run it as a loop, without a call stack.
:::

Evaluate `sumacc [3, 1, 4] 0` by hand, one equation at a time:

$$
\mathit{sumacc}\ [3,1,4]\ 0 = \mathit{sumacc}\ [1,4]\ 3 = \mathit{sumacc}\ [4]\ 4
= \mathit{sumacc}\ [\,]\ 8 = 8
$$

The list gets shorter and the accumulator grows. The library function `sum_list` adds up a list
directly, so the natural claim is that the loop computes the same total: `sumacc xs 0 = sum_list xs`.

::: example The proof attempt on paper
Prove `sumacc xs 0 = sum_list xs` by induction on `xs`.

- Base case: `sumacc [] 0 = 0` and `sum_list [] = 0`. Done.
- Step case: assume the IH `sumacc xs 0 = sum_list xs` and show
  `sumacc (x # xs) 0 = sum_list (x # xs)`. The right-hand side is `x + sum_list xs`. The left-hand side
  is `sumacc xs (0 + x)`, that is, `sumacc xs x`. So you need `sumacc xs x = x + sum_list xs`.

The IH says what `sumacc xs` returns when the accumulator is `0`. The step needs it for the accumulator
`x`. The two do not meet, and the proof is stuck.
:::

### What Isabelle shows {#stuck-isabelle}

Isabelle gets stuck in exactly the same place. The usual one-line proof fails:

```isabelle fails
lemma "sumacc xs 0 = sum_list xs"
  by (induction xs) auto
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ⋀a xs. sumacc xs 0 = sum_list xs ⟹ sumacc xs a = a + sum_list xs
```

To see where, run the proof one step at a time with `apply`:

```isabelle
lemma "sumacc xs 0 = sum_list xs"
  apply (induction xs)
```

```output state
proof (prove)
goal (2 subgoals):
 1. sumacc [] 0 = sum_list []
 2. ⋀a xs.
       sumacc xs 0 = sum_list xs ⟹ sumacc (a # xs) 0 = sum_list (a # xs)
```

Subgoal 1 is the base case and subgoal 2 the step case. Read subgoal 2 aloud: "for all `a` and `xs`, if
`sumacc xs 0 = sum_list xs`, then `sumacc (a # xs) 0 = sum_list (a # xs)`". Isabelle has called the
head of the list `a`; the IH stands before ⟹. Now let `auto` do what it can:

```isabelle
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a xs. sumacc xs 0 = sum_list xs ⟹ sumacc xs a = a + sum_list xs
```

`auto` has solved the base case and simplified the step case as far as it can. What is left is the goal
you met on paper: the IH speaks about `sumacc xs 0`, the conclusion about `sumacc xs a`. No rewriting
turns one into the other. The proof is abandoned:

```isabelle
  oops
```

::: keyidea
A stuck goal is information, not only a failure. Compare the IH with the conclusion and ask what differs.
Here they differ in one argument: the IH fixes the accumulator to `0`, but the recursive call changes
it. When a function changes an argument in its recursive call, the claim must speak about every value of
that argument.
:::

## Generalising and strengthening the goal {#generalise}

### Replace the constant by a variable {#gen-variable}

The trace of `sumacc [3, 1, 4] 0` above suggests what `sumacc` computes for any accumulator: the
accumulator plus the sum of the rest of the list. At every call, `acc + sum_list xs` is 8. So the
general claim is

$$
\mathit{sumacc}\ xs\ acc = acc + \mathit{sum\_list}\ xs
$$

and the original claim is the case `acc = 0`. In the words of Module 5, the claim is a **loop
invariant**: a property that holds before and after every iteration (Figure 11.1).

::: figure id=fig-11-1
The accumulator changes in every call. The claim with `0` describes the first call only; the general
claim holds at every call, so the induction hypothesis can be used at the next one.
:::

Replacing the `0` by `acc` blindly would give `sumacc xs acc = sum_list xs`, which is false. Before you
try to prove a generalisation, test it. Quickcheck (Module 9) finds the problem at once:

```isabelle
lemma "sumacc xs acc = sum_list xs"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  xs = []
  acc = 1
Evaluated terms:
  sumacc xs acc = 1
  sum_list xs = 0
```

The correct generalisation passes the test, so try to prove it:

```isabelle
lemma "sumacc xs acc = acc + sum_list xs"
  apply (induction xs)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a xs.
       sumacc xs acc = acc + sum_list xs ⟹
       sumacc xs (acc + a) = acc + (a + sum_list xs)
```

```isabelle
  oops
```

Still stuck, but the goal has changed. The IH is about `sumacc xs acc`, the conclusion about
`sumacc xs (acc + a)`. The reason: `acc` is a free variable of the lemma, so it is **fixed** for the
whole induction (Module 7). Induction on `xs` proves the claim for one arbitrary but fixed `acc`, and
the IH is about that same `acc`.

### Generalise with arbitrary {#arbitrary}

On paper, the fix is to prove the claim *for all values of `acc` at once*, by induction on `xs`. Then
the IH says "for every `acc'`, `sumacc xs acc' = acc' + sum_list xs`", and the step uses it with
`acc' = acc + x`:

$$
\mathit{sumacc}\ (x \# xs)\ acc = \mathit{sumacc}\ xs\ (acc + x) \overset{\text{IH}}{=} (acc + x) +
\mathit{sum\_list}\ xs = acc + \mathit{sum\_list}\ (x \# xs)
$$

In Isabelle you ask for this by adding `arbitrary: acc` to the induction:

```isabelle
lemma "sumacc xs acc = acc + sum_list xs"
  apply (induction xs arbitrary: acc)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀acc. sumacc [] acc = acc + sum_list []
 2. ⋀a xs acc.
       (⋀acc. sumacc xs acc = acc + sum_list xs) ⟹
       sumacc (a # xs) acc = acc + sum_list (a # xs)
```

The IH in subgoal 2 is now `(⋀acc. sumacc xs acc = acc + sum_list xs)`, which reads "for an arbitrary
`acc`, `sumacc xs acc = acc + sum_list xs`" (Module 7): it holds for every value of `acc`. The
simplifier may use it with any accumulator, in particular with `acc + a`:

```isabelle
  apply auto
  done
```

::: definition Generalising an induction
`induction x arbitrary: y₁ … yₖ` proves the goal by induction on `x` for all values of `y₁ … yₖ` at
once. In each case the variables `y₁ … yₖ` are bound by ⋀ in the induction hypothesis, so the
hypothesis can be used with any values, not only with the ones in the conclusion.
:::

Here is the same proof in Isar, with the step written out as a calculation. The second step is the IH,
used with `acc + x` in place of `acc`:

```isabelle
lemma sumacc_sum: "sumacc xs acc = acc + sum_list xs"
proof (induction xs arbitrary: acc)
  case Nil
  show ?case by simp
next
  case (Cons x xs)
  have "sumacc (x # xs) acc = sumacc xs (acc + x)" by simp
  also have "… = (acc + x) + sum_list xs" by (rule Cons.IH)
  also have "… = acc + sum_list (x # xs)" by simp
  finally show ?case .
qed
```

The claim you wanted first now follows from the general one:

```isabelle
lemma sumacc_total: "sumacc xs 0 = sum_list xs"
  by (simp add: sumacc_sum)
```

::: trouble
Leave out `arbitrary: acc` and the Isar proof fails at the step that uses the IH:

```isabelle fails
lemma "sumacc xs acc = acc + sum_list xs"
proof (induction xs)
  case Nil
  show ?case by simp
next
  case (Cons x xs)
  have "sumacc (x # xs) acc = sumacc xs (acc + x)" by simp
  also have "… = (acc + x) + sum_list xs" by (rule Cons.IH)
  also have "… = acc + sum_list (x # xs)" by simp
  finally show ?case .
qed
```

```output result
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. sumacc xs (acc + x) = acc + x + sum_list xs
```

The goal is about `acc + x`, but `Cons.IH` is only about the fixed `acc`, so the rule does not fit.
When `rule` with an IH fails like this, check whether a variable must be generalised.
:::

::: tip
Which variables go after `arbitrary:`? Those that change in the recursive calls, here the accumulator.
Look at the right-hand sides of the defining equations: every argument that is not passed on unchanged
is a candidate. Never list the induction variable itself. Generalising a variable that does not need it
seldom breaks a proof, but it adds ⋀-quantifiers that automation then has to instantiate.
:::

### Strengthen the statement {#strengthen}

Sometimes no variable needs generalising, and the induction is still stuck, because the claim is too
*weak* to be a useful IH. A small mathematical example shows the effect.

```isabelle
fun oddsum :: "nat ⇒ nat" where
  "oddsum 0 = 0"
| "oddsum (Suc n) = oddsum n + (2 * n + 1)"
```

`oddsum n` adds the first `n` odd numbers, $1 + 3 + \dots + (2n - 1)$:

```isabelle
value "oddsum 4"
```

```output
"16"
  :: "nat"
```

::: example A claim that is too weak
Claim: the sum of the first $n$ odd numbers is a perfect square, $\exists k.\ \mathit{oddsum}\ n = k
\cdot k$ ("there is a $k$ such that …"). Try induction on $n$. The base case holds with $k = 0$. In the
step, the IH says $\mathit{oddsum}\ n = k \cdot k$ for *some* $k$, and you must show that
$k \cdot k + 2n + 1$ is a square. That is true when $k = n$, but the IH does not say which $k$ it is.
It has forgotten the one fact the step needs.

Now claim more: $\mathit{oddsum}\ n = n \cdot n$. The IH becomes $\mathit{oddsum}\ n = n \cdot n$, and
the step is arithmetic: $n \cdot n + 2n + 1 = (n + 1) \cdot (n + 1)$. The stronger claim is easier to
prove, and the weak one follows from it with $k = n$.
:::

Isabelle shows the forgotten fact directly. After `auto`, the IH mentions some `k`, unrelated to `n`:

```isabelle
lemma "∃k. oddsum n = k * k"
  apply (induction n)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀n k. oddsum n = k * k ⟹ ∃ka. Suc (k * k + 2 * n) = ka * ka
```

```isabelle
  oops
```

The strengthened claim goes through, and the weak claim follows with `blast`, which finds the witness
`n`:

```isabelle
lemma oddsum_square: "oddsum n = n * n"
  by (induction n) auto

lemma "∃k. oddsum n = k * k"
  using oddsum_square by blast
```

::: note
The mathematician George Pólya called this effect the *inventor's paradox* (*How to Solve It*, 1945):
the more ambitious plan can have the better chance of success. In induction the reason is plain. What
you prove is also what you may assume in the step, so a stronger claim gives you a stronger IH.
Generalising with `arbitrary:` is the same idea: a claim for all accumulators is stronger than a claim
for one.
:::

## Auxiliary lemmas {#lemmas}

Generalising changes the claim. Sometimes the claim is fine, and the step needs a fact about another
function that the simplifier does not know. You met this in Module 5: reversing a list twice needed a
lemma about reversing an append, and the stuck goal pointed to it. This section turns that experience
into a method and applies it to a new example.

A binary counter stores a number as a list of bits, the least significant bit first: `[True, False, True]`
is $1 + 0 \cdot 2 + 1 \cdot 4 = 5$. `val` computes the value of a bit list, `inc` adds one and passes the
carry on, and `counter n` is what the counter shows after `n` increments, starting from the empty list:

```isabelle
fun val :: "bool list ⇒ nat" where
  "val [] = 0"
| "val (b # bs) = (if b then 1 else 0) + 2 * val bs"

fun inc :: "bool list ⇒ bool list" where
  "inc [] = [True]"
| "inc (b # bs) = (if b then False # inc bs else True # bs)"

fun counter :: "nat ⇒ bool list" where
  "counter 0 = []"
| "counter (Suc n) = inc (counter n)"
```

```isabelle
value "counter 6"
```

```output
"[False, True, True]"
  :: "bool list"
```

Six is 110 in binary, and the list holds its bits from right to left. The counter should count
correctly, `val (counter n) = n`:

```isabelle
lemma "val (counter n) = n"
  apply (induction n)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀n. val (counter n) = n ⟹ val (inc (counter n)) = Suc n
```

```isabelle
  oops
```

Read the stuck goal. The IH is `val (counter n) = n`, and the conclusion needs
`val (inc (counter n)) = Suc n`. The simplifier knows what `inc` does to `[]` and to `b # bs`, but
`counter n` is neither, so no equation of `inc` applies. Generalising does not help: no variable is
fixed in the wrong way. What is missing is a fact about `val` and `inc`.

Which fact? Look at the subterm the simplifier cannot touch, `val (inc (counter n))`. The inner
`counter n` is an accident of this proof; the fact should hold for every bit list there. Write `bs` for
it and compute an example:

```isabelle
value "val (inc [True, True, False])"
```

```output
"4"
  :: "nat"
```

`[True, True, False]` is 3, and incrementing it gives 4. So the conjecture is
`val (inc bs) = Suc (val bs)`: incrementing adds one to the value. Test it before proving it:

```isabelle
lemma "val (inc bs) = Suc (val bs)"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found no counterexample.
```

No counterexample. The lemma has its own short induction on the bit list, in which `auto` splits the
`if` of `inc` into the two cases for the lowest bit. The attribute `[simp]` adds the lemma to the
simplifier's rules (Module 9), so that later proofs use it automatically:

```isabelle
lemma val_inc [simp]: "val (inc bs) = Suc (val bs)"
  by (induction bs) auto

lemma val_counter: "val (counter n) = n"
  by (induction n) auto
```

With the lemma available, the stuck goal rewrites in two steps: `val (inc (counter n))` becomes
`Suc (val (counter n))` by the lemma, and then `Suc n` by the IH.

::: keyidea
From a stuck goal to an auxiliary lemma:

1. Find the subterm that the simplifier cannot rewrite, such as `val (inc (counter n))`.
2. Replace the parts that are specific to this proof by fresh variables (`counter n` becomes `bs`).
3. Guess the right-hand side from examples with `value`, and test the conjecture with `quickcheck`.
4. Prove the lemma, usually by its own induction; add it with `[simp]` or `simp add:`, and retry.
:::

For a function from the library, the lemma you need usually exists already. Module 5's lemma about
reversing an append, for example, is in the library for `rev`. `find_theorems` (Module 9) searches for
it by pattern; the underscores stand for any term:

```isabelle
find_theorems "rev (_ @ _)"
```

```output result
find_theorems
  "rev (_ @ _)"

found 1 theorem(s):
  List.rev_append: rev (?xs @ ?ys) = rev ?ys @ rev ?xs
```

::: pitfall
Do not state the stuck goal itself as the lemma. `val (inc (counter n)) = Suc n` mentions the specific
list `counter n`, and an induction on `n` only moves the problem: its step needs
`val (inc (inc (counter n)))`. The lemma has to be more general than the goal. Sledgehammer (Module 9) does not help here either: it
searches for a proof from facts that already exist, and it does not do induction, so it cannot invent
`val_inc` for you.
:::

## Induction on trees {#trees}

Lists are not the only data structure. In Module 5 you met binary trees. Each module has a theory of
its own, so this one defines its own copy, with the constructors `Lf` (leaf) and `Nd` (node), and four
functions on it: the number of nodes, the height, the mirror image and the in-order traversal (left
subtree, node, right subtree).

```isabelle
datatype 'a btree = Lf | Nd "'a btree" 'a "'a btree"

fun nodes :: "'a btree ⇒ nat" where
  "nodes Lf = 0"
| "nodes (Nd l x r) = nodes l + 1 + nodes r"

fun height :: "'a btree ⇒ nat" where
  "height Lf = 0"
| "height (Nd l x r) = max (height l) (height r) + 1"

fun mirror :: "'a btree ⇒ 'a btree" where
  "mirror Lf = Lf"
| "mirror (Nd l x r) = Nd (mirror r) x (mirror l)"

fun inorder :: "'a btree ⇒ 'a list" where
  "inorder Lf = []"
| "inorder (Nd l x r) = inorder l @ [x] @ inorder r"
```

```isabelle
value "inorder (mirror (Nd (Nd Lf 1 Lf) (2::nat) (Nd Lf 3 Lf)))"
```

```output
"[3, 2, 1]"
  :: "nat list"
```

Mirroring a tree reverses its traversal. Induction on a tree has one case for each constructor, and the
case for `Nd` has two induction hypotheses, one for each subtree:

```isabelle
lemma "inorder (mirror t) = rev (inorder t)"
  apply (induction t)
```

```output state
proof (prove)
goal (2 subgoals):
 1. inorder (mirror Lf) = rev (inorder Lf)
 2. ⋀t1 x2 t2.
       ⟦inorder (mirror t1) = rev (inorder t1);
        inorder (mirror t2) = rev (inorder t2)⟧
       ⟹ inorder (mirror (Nd t1 x2 t2)) = rev (inorder (Nd t1 x2 t2))
```

Isabelle names the parts of the node `t1`, `x2` and `t2`. Both IHs are needed, and `auto` uses them
together with the library's `rev_append`, which you found above:

```isabelle
  apply auto
  done
```

### A size–height relation {#size-height}

A tree of height $h$ has at most $2^h - 1$ nodes: each level can hold at most twice as many nodes as the
one above it. Written without subtraction, `nodes t < 2 ^ height t`. On paper the step goes like this.
Let $h$ be the larger of the two subtree heights. Each subtree has fewer than $2^h$ nodes, because its
own height is at most $h$. So the whole tree has at most $(2^h - 1) + 1 + (2^h - 1) = 2^{h+1} - 1$
nodes, fewer than $2^{h+1}$.

The automatic proof does not find this argument:

```isabelle
lemma "nodes t < 2 ^ height t"
  apply (induction t)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀t1 t2.
       ⟦nodes t1 < 2 ^ height t1; nodes t2 < 2 ^ height t2⟧
       ⟹ Suc (nodes t1 + nodes t2) < 2 * 2 ^ max (height t1) (height t2)
```

```isabelle
  oops
```

The simplifier has unfolded the definitions, but the IHs mention `2 ^ height t1` and `2 ^ height t2`,
while the conclusion mentions `2 ^ max (height t1) (height t2)`. The missing link is the monotonicity
of powers: $2^{a} \le 2^{\max\,a\,b}$. In Isar you can supply it in small steps. The command
`let ?h = "…"` gives a long term a short name inside the proof:

```isabelle
lemma nodes_height: "nodes t < 2 ^ height t"
proof (induction t)
  case Lf
  show ?case by simp
next
  case (Nd l x r)
  let ?h = "max (height l) (height r)"
  have "(2::nat) ^ height l ≤ 2 ^ ?h" by simp
  with Nd.IH(1) have l: "nodes l < 2 ^ ?h" by linarith
  have "(2::nat) ^ height r ≤ 2 ^ ?h" by simp
  with Nd.IH(2) have r: "nodes r < 2 ^ ?h" by linarith
  have "nodes (Nd l x r) = nodes l + 1 + nodes r" by simp
  also have "… < 2 ^ ?h + 2 ^ ?h" using l r by linarith
  also have "… = 2 ^ height (Nd l x r)" by simp
  finally show ?case .
qed
```

`Nd.IH(1)` and `Nd.IH(2)` are the two induction hypotheses, for `l` and for `r`, in the order of the
constructor's arguments. The `(2::nat)` annotations tell Isabelle which type of numbers the inequalities
are about.

## Computation induction {#computation}

Structural induction follows the shape of the data: one case per constructor. Many functions do not
recurse that way. They look back more than one step, or take two arguments and shorten one or the other,
or test a condition first. For such functions it pays to follow the recursion of the function instead.

### Following the recursion of fib {#fib}

Module 5 proved `fib n < 2 ^ n` only after strengthening the claim. Plain induction on `n` gives an IH
for `n` alone, but `fib (Suc (Suc n))` is made from `fib n` and `fib (Suc n)`. Every function defined
with `fun` comes with an induction rule that follows its own recursion (Module 8 mentioned it); for
`fib` it is called `fib.induct`:

```isabelle
fun fib :: "nat ⇒ nat" where
  "fib 0 = 0"
| "fib (Suc 0) = 1"
| "fib (Suc (Suc n)) = fib n + fib (Suc n)"

lemma "fib n < 2 ^ n"
  apply (induction n rule: fib.induct)
```

```output state
proof (prove)
goal (3 subgoals):
 1. fib 0 < 2 ^ 0
 2. fib (Suc 0) < 2 ^ Suc 0
 3. ⋀n. ⟦fib n < 2 ^ n; fib (Suc n) < 2 ^ Suc n⟧
        ⟹ fib (Suc (Suc n)) < 2 ^ Suc (Suc n)
```

There is one case for each equation of `fib`, and the third case has two IHs, one for each recursive
call: exactly the two facts that the step needs. The original claim goes through without strengthening:

```isabelle
  apply auto
  done
```

### A function on two lists {#merge}

`merge` combines two sorted lists into one sorted list, as in merge sort. At each step it compares the
two heads and takes the smaller one:

```isabelle
fun merge :: "nat list ⇒ nat list ⇒ nat list" where
  "merge [] ys = ys"
| "merge xs [] = xs"
| "merge (x # xs) (y # ys) =
     (if x ≤ y then x # merge xs (y # ys) else y # merge (x # xs) ys)"
```

```output
consts
  merge :: "nat list ⇒ nat list ⇒ nat list"

Found termination order:
  "(λp. size_list size (snd p)) <*mlex*>
   (λp. size_list size (fst p)) <*mlex*> {}"
```

The termination order shows that neither argument shrinks in every call. The first recursive call
shortens the first list, the second call the second list. Isabelle measures each list by its size
(`size_list`) and combines the two sizes lexicographically (`<*mlex*>`): in every call, either the
second list gets smaller, or it stays the same and the first list gets smaller.

```isabelle
value "merge [1, 4, 6] [2, 3, 7]"
```

```output
"[1, 2, 3, 4, 6, 7]"
  :: "nat list"
```

Merging should lose no element: `length (merge xs ys) = length xs + length ys`. Try structural
induction on `xs`, already generalised over `ys`:

```isabelle
lemma "length (merge xs ys) = length xs + length ys"
  apply (induction xs arbitrary: ys)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a xs ys.
       (⋀ys. length (merge xs ys) = length xs + length ys) ⟹
       length (merge (a # xs) ys) = Suc (length xs + length ys)
```

```isabelle
  oops
```

The goal is stuck at `merge (a # xs) ys`, because `merge` can only be unfolded once the shape of `ys` is
known. A case split on `ys` would get further, but in the branch where the head of `ys` is smaller,
`merge` calls itself with `a # xs` again. That list is not shorter than `a # xs`, so the IH for `xs` does
not apply. Structural induction on either list does not match the recursion.

### The induction rule of a function {#f-induct}

As for `fib`, the induction rule of `merge` follows the function's own recursion. It is called
`merge.induct`:

```isabelle
thm merge.induct
```

```output result
⟦⋀ys. ?P [] ys; ⋀v va. ?P (v # va) [];
 ⋀x xs y ys.
    ⟦x ≤ y ⟹ ?P xs (y # ys); ¬ x ≤ y ⟹ ?P (x # xs) ys⟧
    ⟹ ?P (x # xs) (y # ys)⟧
⟹ ?P ?a0.0 ?a1.0
```

Read it from the inside. To prove `?P ?a0.0 ?a1.0` for all arguments, prove three cases, one for each
defining equation. The third case comes with two IHs, one for each recursive call, and each IH carries
the condition under which that call happens: `x ≤ y` for the first call, `¬ x ≤ y` for the second.
Figure 11.2 shows the correspondence.

::: figure id=fig-11-2
Computation induction for `merge`: one case per equation and one induction hypothesis per recursive
call, with the condition of the `if` as its premise. In a run, each call shortens one list or the other.
:::

Case 2 uses the variable names `v` and `va`. `fun` reads the equations in order, so the second equation
only applies when the first does not, that is, when the first list is not empty. `fun` makes this
explicit by replacing `xs` in the second equation with `v # va`. You can see the result in
`merge.simps`, the equations as Isabelle stores them:

```isabelle
thm merge.simps
```

```output result
  merge [] ?ys = ?ys
  merge (?v # ?va) [] = ?v # ?va
  merge (?x # ?xs) (?y # ?ys) =
  (if ?x ≤ ?y then ?x # merge ?xs (?y # ?ys) else ?y # merge (?x # ?xs) ?ys)
```

Now apply the rule. You give the variables in the order of the function's arguments:

```isabelle
lemma "length (merge xs ys) = length xs + length ys"
  apply (induction xs ys rule: merge.induct)
```

```output state
proof (prove)
goal (3 subgoals):
 1. ⋀ys. length (merge [] ys) = length [] + length ys
 2. ⋀v va. length (merge (v # va) []) = length (v # va) + length []
 3. ⋀x xs y ys.
       ⟦x ≤ y ⟹ length (merge xs (y # ys)) = length xs + length (y # ys);
        ¬ x ≤ y ⟹ length (merge (x # xs) ys) = length (x # xs) + length ys⟧
       ⟹ length (merge (x # xs) (y # ys)) =
          length (x # xs) + length (y # ys)
```

```isabelle
  apply auto
  done
```

::: definition Computation induction
For a function `f` defined with `fun`, the rule `f.induct` has one case for each defining equation
(after overlapping equations have been made disjoint) and, in each case, one induction hypothesis for
each recursive call on the right-hand side, under the conditions that lead to the call. You use it with
`induction x₁ … xₙ rule: f.induct`, where `x₁ … xₙ` are the arguments of `f` in the goal. The rule is
sound because `f` terminates: it is induction along the termination order.
:::

In Isar, the cases of `merge.induct` are numbered `1`, `2` and `3`, after the equations. With the cursor
on the `proof` line, Isabelle prints a *proof outline* with these case names as an information message,
which you can copy into the theory. Because `3.IH` starts with a digit, it must be written in quotes,
`"3.IH"`, and its parts are `"3.IH"(1)` and `"3.IH"(2)`:

```isabelle
lemma set_merge: "set (merge xs ys) = set xs ∪ set ys"
proof (induction xs ys rule: merge.induct)
  case (1 ys)
  show ?case by simp
next
  case (2 x xs)
  show ?case by simp
next
  case (3 x xs y ys)
  show ?case
  proof (cases "x ≤ y")
    case True
    then show ?thesis using "3.IH"(1) by auto
  next
    case False
    then show ?thesis using "3.IH"(2) by auto
  qed
qed
```

Notice `case (2 x xs)`: you may rename the variables `v va` of a case to anything you like.

::: pitfall
- Without quotes, `3.IH` is not read as one name, and Isabelle reports a confusing error, for example
  `Bad context for command "qed"`. Write `"3.IH"`.
- Give the variables in the order of the function's arguments. With
  `induction ys xs rule: merge.induct` the cases of the rule are matched against the wrong variables,
  and the proof fails with goals that make no sense.
:::

## Inductive definitions {#inductive}

So far every new notion was a function: you said how to compute it. Some notions are more naturally
described by the ways you can *establish* them. "0 is even, and if $n$ is even, so is $n + 2$." "The empty
word is balanced; a balanced word in brackets is balanced; two balanced words side by side are
balanced." "Every state is reachable from itself; if $b$ is reachable from $a$ and one step leads from
$b$ to $c$, then $c$ is reachable from $a$." Grammars, reachability in state machines, type systems and
the meaning of programs are all defined this way, by **rules**.

::: definition Inductive definition
An **inductive definition** of a predicate $I$ is a list of rules of the form
$$I\ a_1 \Imp \dots \Imp I\ a_n \Imp I\ a$$
called **introduction rules** ($n$ may be 0, and a rule may have further premises that do not mention
$I$, called side conditions). $I\ x$ holds exactly when it can be derived by finitely many rule
applications. Equivalently, $I$ is the *smallest* predicate closed under the rules: it holds
for what the rules force, and for nothing else.
:::

### Even numbers {#ev}

In Isabelle, `inductive` defines a predicate by its rules. Each rule may have a name:

```isabelle
inductive ev :: "nat ⇒ bool" where
  ev_0: "ev 0"
| ev_SS: "ev n ⟹ ev (Suc (Suc n))"
```

Rule `ev_0` says that 0 is even. Rule `ev_SS` reads "if `n` is even, then `n + 2` is even"; the formula
before ⟹ is the rule's **premise**, the one after it the **conclusion**. Isabelle defines `ev` from the
rules and then proves them as theorems, in keeping with the LCF approach of Module 1. When you put the
cursor on the definition, the Output panel reports the steps: "Proving monotonicity", "Proving the
introduction rules" and so on. The rules are available as `ev.intros`:

```isabelle
thm ev.intros
```

```output result
  ev 0
  ev ?n ⟹ ev (Suc (Suc ?n))
```

A **derivation** combines rules into a tree, like the proof trees of Module 6: each rule application
draws a line under its premises, with the conclusion below. Here is the derivation that 4 is even:

```prooftree
ev 4   (ev_SS)
  ev 2   (ev_SS)
    ev 0   (ev_0)
```

In Isabelle, apply the rules backwards, as in Module 7. Write the number with `Suc`, for a reason the
next trouble box explains:

```isabelle
lemma "ev (Suc (Suc (Suc (Suc 0))))"
  apply (rule ev_SS)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ev (Suc (Suc 0))
```

```isabelle
  apply (rule ev_SS)
  apply (rule ev_0)
  done
```

Each `rule` step corresponds to one line of the derivation, read from the bottom up.

::: trouble
With the numeral `4` the first step fails:

```isabelle fails
lemma "ev 4"
  apply (rule ev_SS)
```

```output
*** Failed to apply proof method⌂:
*** goal (1 subgoal):
***  1. ev 4
```

`rule` must make the goal `ev 4` and the conclusion `ev (Suc (Suc ?n))` identical by instantiating
`?n`. That is a matter of syntax, and `4` is not written with `Suc`. No arithmetic happens during this
matching. Either write the number with `Suc`, or let the simplifier convert the numeral first:
`numeral_eq_Suc` rewrites a numeral to `Suc` of its predecessor.

```isabelle
lemma "ev 4"
  by (simp add: ev.intros numeral_eq_Suc)
```
:::

### Rule induction {#rule-induction}

The rules say how to show that a number is even. How do you prove that *every* even number has some
property? Every fact `ev n` has a finite derivation, built from `ev_0` at the top and steps `ev_SS`.
If a property holds for `0`, and every application of `ev_SS` passes it on from `n` to `Suc (Suc n)`,
then it holds at every line of every derivation, so for every even number. This is induction over
derivations (Figure 11.3).

::: definition Rule induction
To prove $I\ x \Imp P\ x$ for an inductively defined $I$, prove for each rule
$I\ a_1 \Imp \dots \Imp I\ a_n \Imp I\ a$ that $P\ a$ follows from the premises $I\ a_1, …, I\ a_n$
and the induction hypotheses $P\ a_1, …, P\ a_n$; side conditions of the rule may be assumed as well.
Rules without premises about $I$ give base cases.
:::

::: figure id=fig-11-3
A derivation, here of a balanced word from Section 11.7. Rule induction proves a property for the
conclusion of every rule from the property of its premises, so the property travels down the
derivation to the root.
:::

Isabelle generates this rule as `ev.induct`:

```isabelle
thm ev.induct
```

```output result
⟦ev ?x; ?P 0; ⋀n. ⟦ev n; ?P n⟧ ⟹ ?P (Suc (Suc n))⟧ ⟹ ?P ?x
```

The first premise `ev ?x` says that the rule applies to an even `?x`. The other two are the cases: `?P 0`
for rule `ev_0`, and for rule `ev_SS` the step from `?P n` to `?P (Suc (Suc n))`, where `ev n` may be
assumed too. As an example, the library defines `even n` as "2 divides n". Every number with
a derivation is even in that sense:

```isabelle
lemma "ev n ⟹ even n"
  apply (induction rule: ev.induct)
```

```output state
proof (prove)
goal (2 subgoals):
 1. even 0
 2. ⋀n. ⟦ev n; even n⟧ ⟹ even (Suc (Suc n))
```

The method finds `ev n` among the premises and inducts on it. Subgoal 2 has two assumptions: `ev n` is
the premise of rule `ev_SS`, and `even n` is the IH. `auto` knows that adding 2 keeps a number even:

```isabelle
  apply auto
  done
```

In Isar, the cases of a rule induction are named after the rules. In case `ev_SS`, the IH is
`ev_SS.IH` and the premise of the rule is `ev_SS.hyps`:

```isabelle
lemma ev_even: "ev n ⟹ even n"
proof (induction rule: ev.induct)
  case ev_0
  show ?case by simp
next
  case (ev_SS n)
  from ev_SS.IH show ?case by simp
qed
```

When the statement has further premises, they become part of the claim that is proved by induction,
and in each case they are available as `.prems`. Here is a proof that the sum of two even numbers is
even, by rule induction on `ev m`:

```isabelle
lemma ev_add: "ev m ⟹ ev n ⟹ ev (m + n)"
proof (induction rule: ev.induct)
  case ev_0
  then show ?case by simp
next
  case (ev_SS k)
  then have "ev (k + n)" by simp
  then show ?case by (simp add: ev.ev_SS)
qed
```

In case `ev_SS`, the IH is `ev n ⟹ ev (k + n)`, the premise `ev n` is `ev_SS.prems`, and `then` passes
all of them to `simp`. The conclusion `ev (Suc (Suc k) + n)` follows by the rule `ev_SS`, which must
now be called `ev.ev_SS`.

::: trouble
Inside a proof, `case ev_SS` introduces facts under the name `ev_SS`, and they hide the rule of the same
name. Using the short name gives the case's facts, not the rule:

```isabelle fails
lemma "ev m ⟹ ev n ⟹ ev (m + n)"
proof (induction rule: ev.induct)
  case ev_0
  then show ?case by simp
next
  case (ev_SS k)
  then have "ev (k + n)" by simp
  then show ?case by (simp add: ev_SS)
qed
```

```output result
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ev (Suc (Suc (k + n)))
```

Use the qualified name `ev.ev_SS` for the rule.
:::

### Rule inversion {#inversion}

Rule induction proves facts about *all* even numbers. Often you know one fact, say `ev (Suc (Suc n))`,
and want to know what it implies. Ask which rule could have derived it. Not `ev_0`, whose conclusion
`ev 0` has the wrong shape. Only `ev_SS`, and only from the premise `ev n`. So `ev n` holds. In the
same way, no rule at all has a conclusion of the form `ev (Suc 0)`, so `ev 1` cannot be derived: 1 is not
even.

::: definition Rule inversion
**Rule inversion** reasons backwards from a fact $I\ t$: it considers every rule whose conclusion can
match $t$, and in each such case concludes that the rule's premises hold. A case whose conclusion cannot
match $t$ is impossible and drops out.
:::

Isabelle generates the general rule `ev.cases` with every definition. The command `inductive_cases`
derives the inversion rule for a particular shape of fact:

```isabelle
inductive_cases ev_SSE: "ev (Suc (Suc n))"
inductive_cases ev_1E: "ev (Suc 0)"
```

```output all
theorem ev_SSE: ⟦ev (Suc (Suc ?n)); ev ?n ⟹ ?P⟧ ⟹ ?P

theorem ev_1E: ev (Suc 0) ⟹ ?P
```

`ev_SSE` says: from `ev (Suc (Suc n))`, anything `?P` that follows from `ev n` follows. `ev_1E` has no
case left, so from `ev (Suc 0)` anything follows. Such rules are **elimination rules** (Module 7), and
you give them to `auto` with `elim:`. Here is a negative fact, which no introduction rule could prove:

```isabelle
lemma "¬ ev (Suc (Suc (Suc 0)))"
  by (auto elim: ev_SSE ev_1E)
```

In Isar, pass the fact to `proof cases`. The impossible case `ev_0` needs no proof; only `ev_SS`
remains:

```isabelle
lemma ev_SS_inv: "ev (Suc (Suc n)) ⟹ ev n"
proof -
  assume "ev (Suc (Suc n))"
  then show "ev n"
  proof cases
    case ev_SS
    then show ?thesis by simp
  qed
qed
```

When no case is possible, `cases` closes the goal by itself:

```isabelle
lemma "¬ ev (Suc 0)"
proof
  assume "ev (Suc 0)"
  then show False by cases
qed
```

### Inductive or recursive? {#versus}

You could have defined evenness by a recursive function instead, with equations for `0`, `Suc 0` and
`Suc (Suc n)`. Both styles have their uses:

| | Inductive (`inductive`) | Recursive (`fun`) |
|---|---|---|
| You write | rules that build evidence | equations that compute |
| Termination | not needed | must be proved |
| Positive facts (`ev 4`) | apply the rules | evaluate |
| Negative facts (`¬ ev 3`) | rule inversion | evaluate |
| Facts about all members | rule induction | computation induction |
| `value` | not by default | yes |

The last row deserves a demonstration. An inductive predicate is not a program, and `value` cannot run
it:

```isabelle fails
value "ev (Suc (Suc 0))"
```

```output
*** No code equations for ev,
*** requested by dependencies
***
```

(Isabelle can turn many inductive predicates into programs with the command `code_pred`; this series
does not need it.) Prefer a recursive function when the notion is a computation you want to run. Prefer an
inductive definition when there is no terminating recursion: reachability in a state machine that has
cycles, a grammar with concatenation, the evaluation of a program that may loop. Rule induction then
gives you exactly the cases that matter.

::: pitfall
The predicate being defined may appear in the premises of its rules only *positively*, not under a
negation. A rule such as "if `odd' n` does not hold, then `odd' (Suc n)` holds" does not describe a
smallest predicate, and Isabelle rejects it. It starts the usual proofs, then reports that a proof
failed. The goal it could not prove, `mono (…)`, says that the rules must be *monotone*: when more
facts `odd' n` hold, the rules may not derive fewer conclusions. A negated premise does exactly that.

```isabelle fails
inductive odd' :: "nat ⇒ bool" where
  "¬ odd' n ⟹ odd' (Suc n)"
```

```output
Proofs for inductive predicate(s) "odd'"

  Proving monotonicity ...

  Proving the introduction rules ...

  Proving the elimination rules ...

  Proving the induction rule ...

  Proving the simplification rules ...

*** Proof failed.
***  1. ⋀x y xa n. x (?x10 x y xa n) ⟶ y (?x10 x y xa n) ⟹ y n ⟶ x n
*** The error(s) above occurred for the goal statement⌂:
*** mono (λp x. ∃n. x = Suc n ∧ ¬ p n)
```
:::

## Reachability and grammars {#reach}

Two kinds of inductive definition turn up again and again in verification: reachability in a transition
system, and the words of a grammar. Both lead to rule inductions that need the techniques of
Section 11.2 as well.

### Reachability {#closure}

A **transition relation** `r` says which state can follow which: `r a b` means one step leads from `a`
to `b`. The states reachable from `a` are those you reach in zero or more steps. This is the
reflexive–transitive closure of `r` from Module 4, here as an inductive predicate:

```isabelle
inductive steps :: "('a ⇒ 'a ⇒ bool) ⇒ 'a ⇒ 'a ⇒ bool" for r where
  stay: "steps r a a"
| step: "r a b ⟹ steps r b c ⟹ steps r a c"
```

Rule `stay` takes zero steps. Rule `step` takes one step from `a` to `b` and then any number from `b` to
`c`. The clause `for r` declares that `r` is a fixed parameter: it is the same in every rule, unlike `a`,
`b` and `c`, and Isabelle then generates a simpler induction rule. The library's `r⇧*` of Module 4 is
defined in the same way (with `inductive_set`, in the theory `Transitive_Closure`), except that its
second rule adds the extra step at the end.

Take a small workflow from an issue tracker. A ticket moves from *to do* to *doing*, from *doing* to
*review*, and from *review* back to *doing* or on to *done*. The moves are four rules without premises:

```isabelle
datatype status = Todo | Doing | Review | Done

inductive move :: "status ⇒ status ⇒ bool" where
  "move Todo Doing"
| "move Doing Review"
| "move Review Doing"
| "move Review Done"
```

A ticket can be finished, and `blast` finds the derivation from the rules:

```isabelle
lemma "steps move Todo Done"
  by (blast intro: move.intros step stay)
```

Reachability is transitive. The proof is a rule induction on the first premise:

```isabelle
lemma steps_trans: "steps r a b ⟹ steps r b c ⟹ steps r a c"
  apply (induction rule: steps.induct)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀a. steps r a c ⟹ steps r a c
 2. ⋀a b ca.
       ⟦r a b; steps r b ca; steps r ca c ⟹ steps r b c; steps r ca c⟧
       ⟹ steps r a c
```

The induction is on `steps r a b`, so the claim proved by induction is "`steps r b c` implies
`steps r a c`". Subgoal 1 is case `stay`. In subgoal 2, case `step`, Isabelle has renamed the
rule's third variable to `ca`, because the lemma already uses `c`. The assumptions are the rule's
premises `r a b` and `steps r b ca`, the IH `steps r ca c ⟹ steps r b c`, and the lemma's second
premise `steps r ca c`. The IH and that premise give `steps r b c`, and rule `step` adds the first step:

```isabelle
  apply (auto intro: step)
  done
```

::: trouble
`induction rule: steps.induct` always inducts on the *first* premise. With the premises the other way
round, it inducts on the wrong one, and the proof fails:

```isabelle fails
lemma "steps r b c ⟹ steps r a b ⟹ steps r a c"
  by (induction rule: steps.induct) (auto intro: step)
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ⋀aa b c.
***        ⟦r aa b; steps r b c; steps r a b ⟹ steps r a c; steps r a aa⟧
***        ⟹ steps r a c
```

Put the premise you want to induct on first.
:::

### Constants in the premise {#constants}

Here is a safety property of the workflow: a ticket that is done stays done. The obvious rule induction
produces goals that make no sense:

```isabelle
lemma "steps move Done s ⟹ s = Done"
  apply (induction rule: steps.induct)
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀a. a = a
 2. ⋀a b c. ⟦move a b; steps move b c; c = b⟧ ⟹ c = a
```

```isabelle
  oops
```

Subgoal 2 asks to prove `c = a` from `c = b`, which is false in general, and `Done` has disappeared. The
rule `steps.induct` is about `steps r x y` for *variables* `x` and `y`. Given the constant `Done` in
place of `x`, the method abstracted every `Done` in the goal into the rule's variable, and the claim lost
its meaning. The remedy is the generalisation of Section 11.2: replace the constant by a variable and
record its value as a premise.

```isabelle
lemma done_stays: "steps move a s ⟹ a = Done ⟹ s = Done"
  by (induction rule: steps.induct) (auto elim: move.cases)
```

In case `step`, the equation `a = Done` turns the rule's premise into `move Done b`, and rule inversion
with `move.cases` shows that no move leaves `Done`: the case is impossible. The `induction` method can also introduce the variable for you: in
`induction Done s rule: steps.induct`, a term that is not a variable stands for a fresh variable with an
equation, and the cases come out right:

```isabelle
lemma "steps move Done s ⟹ s = Done"
  apply (induction Done s rule: steps.induct)
```

```output state
proof (prove)
goal (2 subgoals):
 1. Done = Done
 2. ⋀b c. ⟦move Done b; steps move b c; b = Done ⟹ c = Done⟧ ⟹ c = Done
```

```isabelle
  apply (auto elim: move.cases)
  done
```

::: pitfall
Rule induction needs variables in the inductive premise. If an argument is a constant or a compound
term, generalise it by hand (`a = Done` as an extra premise), or name the terms after `induction`. Module
13 meets the same situation: the reachable states of a system all start from one fixed initial state.
:::

### A grammar: balanced brackets {#grammar}

A context-free grammar is an inductive definition too. Take words of brackets, with `LP` for "(" and `RP`
for ")". The balanced words are given by the grammar $B \to \varepsilon \mid (\,B\,) \mid B\,B$:

```isabelle
datatype paren = LP | RP

inductive bal :: "paren list ⇒ bool" where
  bal_nil: "bal []"
| bal_wrap: "bal w ⟹ bal (LP # w @ [RP])"
| bal_cat: "bal v ⟹ bal w ⟹ bal (v @ w)"
```

Figure 11.3 above shows a derivation of the word `(())()`. A parser does not search for derivations; it
checks a word in one pass, counting the brackets that are open:

```isabelle
fun chk :: "paren list ⇒ nat ⇒ bool" where
  "chk [] n = (n = 0)"
| "chk (LP # w) n = chk w (Suc n)"
| "chk (RP # w) 0 = False"
| "chk (RP # w) (Suc n) = chk w n"
```

`chk w n` reads the word `w` with `n` brackets already open. A closing bracket with nothing open is an
error, and at the end every bracket must be closed:

```isabelle
value "chk [LP, LP, RP, RP, LP, RP] 0"
```

```output
"True"
  :: "bool"
```

```isabelle
value "chk [RP, LP] 0"
```

```output
"False"
  :: "bool"
```

Is the checker right? One direction: it accepts every balanced word, `bal w ⟹ chk w 0`. Rule induction
on `bal w` gets stuck:

```isabelle
lemma "bal w ⟹ chk w 0"
  apply (induction rule: bal.induct)
  apply auto
```

```output state
proof (prove)
goal (2 subgoals):
 1. ⋀w. ⟦bal w; chk w 0⟧ ⟹ chk (w @ [RP]) (Suc 0)
 2. ⋀v w. ⟦bal v; chk v 0; bal w; chk w 0⟧ ⟹ chk (v @ w) 0
```

```isabelle
  oops
```

In subgoal 1 (rule `bal_wrap`), the IH is about `w` read on its own from count 0. The goal reads `w` with
one bracket open and then the closing `RP`. Subgoal 2 (rule `bal_cat`) has the same problem: after `v`
come further brackets. The IH is too special in two ways, so generalise both. A balanced word, followed by
anything, leaves the count unchanged:

```isabelle
lemma bal_chk: "bal w ⟹ chk (w @ v) n = chk v n"
  apply (induction arbitrary: v n rule: bal.induct)
```

```output state
proof (prove)
goal (3 subgoals):
 1. ⋀v n. chk ([] @ v) n = chk v n
 2. ⋀w v n.
       ⟦bal w; ⋀v n. chk (w @ v) n = chk v n⟧
       ⟹ chk ((LP # w @ [RP]) @ v) n = chk v n
 3. ⋀v w va n.
       ⟦bal v; ⋀va n. chk (v @ va) n = chk va n; bal w;
        ⋀v n. chk (w @ v) n = chk v n⟧
       ⟹ chk ((v @ w) @ va) n = chk va n
```

```isabelle
  apply auto
  done
```

Now each IH holds for every continuation `v` and every count `n`, and `auto` uses them with the values
the cases need. The claim about the checker is the special case `v = []` and `n = 0`. The attribute
`[of w "[]" 0]` instantiates the variables of `bal_chk` in the order in which they first occur:

```isabelle
corollary bal_chk0: "bal w ⟹ chk w 0"
  using bal_chk[of w "[]" 0] by simp
```

The other direction, that every word the checker accepts is balanced, is true as well, but its proof
needs further lemmas about `bal`; this module leaves it out.

## Complete induction {#complete}

Some arguments need the claim not for the predecessor of $n$ but for some smaller number. Module 5
called this strong induction; it is also known as **complete induction**.

::: example Powers of two
Every positive number is a power of two times an odd number: $40 = 2^3 \cdot 5$, $12 = 2^2 \cdot 3$,
$7 = 2^0 \cdot 7$. In binary, the power counts the zeros at the end: $40$ is $101000_2$, and
$101_2 = 5$. Proof for $n > 0$, assuming the claim for all smaller positive numbers:

- If $n$ is odd, take $2^0 \cdot n$.
- If $n$ is even, then $n = 2h$ with $0 < h < n$. The claim for $h$ gives $h = 2^k \cdot m$ with $m$
  odd, so $n = 2^{k+1} \cdot m$.

The claim for $n - 1$ would be no use: the decomposition of 39 says nothing about 40. The step needs
$h = n / 2$.
:::

In Isabelle, complete induction on natural numbers is the rule `less_induct`:

```isabelle
thm less_induct
```

```output result
(⋀x. (⋀y. y < x ⟹ ?P y) ⟹ ?P x) ⟹ ?P ?a
```

To prove `?P ?a`, prove `?P x` for an arbitrary `x`, assuming `?P y` for every `y < x`. The rule holds
for every type whose order is a **well-order**, a linear order with no infinite descending chain
($x_1 > x_2 > x_3 > \dots$); `nat` is one. For `nat` the library also has `nat_less_induct`, the same
principle stated with ∀. Applied to the claim:

```isabelle
lemma "0 < (n::nat) ⟹ ∃k m. n = 2 ^ k * m ∧ odd m"
  apply (induction n rule: less_induct)
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀x. ⟦⋀y. ⟦y < x; 0 < y⟧ ⟹ ∃k m. y = 2 ^ k * m ∧ odd m; 0 < x⟧
        ⟹ ∃k m. x = 2 ^ k * m ∧ odd m
```

```isabelle
  oops
```

The premise `0 < n` has become part of the claim: the IH may be used for a `y` that is both smaller than
`x` and positive. In Isar the single case is called `less`, and its IH is `less.IH`:

```isabelle
lemma odd_part: "0 < (n::nat) ⟹ ∃k m. n = 2 ^ k * m ∧ odd m"
proof (induction n rule: less_induct)
  case (less n)
  show ?case
  proof (cases "even n")
    case False
    then have "n = 2 ^ 0 * n ∧ odd n" by simp
    then show ?thesis by blast
  next
    case True
    then obtain h where h: "n = 2 * h" by (rule evenE)
    with less.prems have "h < n" and "0 < h" by simp_all
    then obtain k m where "h = 2 ^ k * m ∧ odd m" using less.IH by blast
    with h have "n = 2 ^ Suc k * m ∧ odd m" by simp
    then show ?thesis by blast
  qed
qed
```

The library rule `evenE` turns `even n` into a witness `h` with `n = 2 * h`. The IH is applied to `h`
after `h < n` and `0 < h` have been shown, the two conditions the IH asks for.

::: trouble
Leave out the annotation `(n::nat)` and the induction fails with an alarming message:

```isabelle fails
lemma "0 < n ⟹ ∃k m. n = 2 ^ k * m ∧ odd m"
  apply (induction n rule: less_induct)
```

```output
*** exception THM 0 raised⌂:
***   infer_instantiate_types: type ?'a of variable ?a
***   cannot be unified with type 'a of term n
***   (⋀x. (⋀y. y < x ⟹ ?P y) ⟹ ?P x) ⟹
***   ?P ?a
```

The numbers in the claim could belong to any type with `0`, `^` and `odd`, so Isabelle gives `n` a type
variable. The proof state shows the symptom as `(2::'a)`. `less_induct` is stated for well-ordered
types, and Isabelle cannot match it with a type it knows nothing about. Annotate the
variable, `(n::nat)`, and the error goes away.
:::

::: note
Complete induction and computation induction are close relatives. `fib.induct` and `merge.induct` are
complete induction along the termination orders of `fib` and `merge`, cut to the shape of their
recursion. When a function recurses on `n div 2`, on `n - 2` or on a shorter list of any kind, its own
induction rule is usually the most convenient form of complete induction. Exercise 11.7 proves the
bound on `fib` with `less_induct` as well.
:::

## Choosing the induction {#choose}

Most failed inductions fall into a few patterns. First choose the induction from the shape of the goal:

| The goal is about | Use | In Isabelle |
|---|---|---|
| a function defined by one equation per constructor | structural induction | `induction xs` |
| a function whose recursion changes another argument | structural induction, generalised | `induction xs arbitrary: acc` |
| a function with its own pattern of recursion | computation induction | `induction xs ys rule: f.induct` |
| a premise `I x` with `I` defined by `inductive` | rule induction | `induction rule: I.induct` |
| what a single fact `I t` implies | rule inversion | `cases`, `inductive_cases` |
| a step that needs some smaller value | complete induction | `induction n rule: less_induct` |

Then, if the proof gets stuck, read the stuck goal and compare the IH with the conclusion:

| The stuck goal shows | Remedy |
|---|---|
| the IH fixes an argument (`0`, `[]`, `acc`) that the conclusion needs with another value | generalise: a variable instead of a constant, and `arbitrary:` |
| an IH that is true but says too little (`∃k. …`) | strengthen the claim |
| a subterm the simplifier cannot rewrite, such as `val (inc (counter n))` | an auxiliary lemma, generalised, as `[simp]` |
| an IH about the wrong argument, or about the wrong list | computation induction |
| goals that make no sense after rule induction | variables in the inductive premise, or `induction t rule: …` |
| a fact about a term built from constructors | rule inversion |

::: tip
Before you start a long proof by hand, check the claim with `quickcheck`, and try `auto` after each
`apply (induction …)`. The goal that `auto` leaves behind is the quickest guide to what is missing.
:::

## What you learned {#summary}

- An induction gets stuck when its **induction hypothesis** is too weak. Read the stuck goal and compare
  the IH with the conclusion: the difference tells you what to change.
- If a recursive call changes an argument, as an **accumulator** does, **generalise** the claim to every
  value of that argument and use `induction xs arbitrary: acc`; the IH is then bound by ⋀.
- If the IH is true but too weak, **strengthen** the claim (`oddsum n = n * n` rather than "a square").
- If the simplifier cannot rewrite a subterm such as `val (inc (counter n))`, find an **auxiliary
  lemma**: generalise the subterm, test with `value` and `quickcheck`, prove it, add it to the simplifier.
- Induction on a tree has one IH per subtree (`Nd.IH(1)`, `Nd.IH(2)`).
- **Computation induction** with `rule: f.induct` has one case per defining equation and one IH per
  recursive call (two in the last case of `fib`); in Isar the cases are numbered, and `"3.IH"` needs
  quotes.
- An **inductive definition** (`inductive`) defines the smallest predicate closed under its rules.
  **Rule induction** (`rule: I.induct`) proves facts about all its members and works on the first
  premise, whose arguments must be variables; **rule inversion** (`cases`, `inductive_cases`) draws
  conclusions from one fact, including negative facts.
- **Complete induction** with `less_induct` lets the step use the claim for any smaller value.

## Exercises {#exercises}

:::: exercise Read a stuck goal {#ex-11-1} ★
Here is a tail-recursive list reversal, which stacks the elements of its first argument onto the
second:

```isabelle
fun itrev :: "'a list ⇒ 'a list ⇒ 'a list" where
  "itrev [] ys = ys"
| "itrev (x # xs) ys = itrev xs (x # ys)"

lemma "itrev xs [] = rev xs"
  apply (induction xs)
  apply auto
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀a xs. itrev xs [] = rev xs ⟹ itrev xs [a] = rev xs @ [a]
```

```isabelle
  oops
```

1. Compare the IH with the conclusion. Which argument differs?
2. Generalise the claim. What should `itrev xs ys` equal for every `ys`? Check your answer on
   `itrev [1, 2] [3]`.
3. Prove the general claim and derive `itrev xs [] = rev xs` from it.

::: solution
1. The IH is about `itrev xs []`, the conclusion about `itrev xs [a]`: the second argument, the
   accumulator, differs.
2. `itrev xs ys` reverses `xs` onto the front of `ys`: `itrev xs ys = rev xs @ ys`. For example,
   `itrev [1, 2] [3] = itrev [2] [1, 3] = itrev [] [2, 1, 3] = [2, 1, 3]`, and
   `rev [1, 2] @ [3] = [2, 1, 3]`. With `ys = []` the claim becomes the original one.
3. The accumulator changes in the recursive call, so it goes after `arbitrary:`:

```isabelle
lemma itrev_rev: "itrev xs ys = rev xs @ ys"
  by (induction xs arbitrary: ys) auto

lemma "itrev xs [] = rev xs"
  by (simp add: itrev_rev)
```
:::
::::

:::: exercise Which induction? {#ex-11-2} ★
For each goal, say which kind of induction you would try first, and on what. Use the functions and
predicates of this module.

1. `nodes (mirror t) = nodes t`
2. `steps r a b ⟹ r b c ⟹ steps r a c`
3. `count_list (merge xs ys) z = count_list xs z + count_list ys z`
4. `sumacc (xs @ ys) acc = sumacc ys (sumacc xs acc)`
5. `ev n ⟹ ¬ ev (Suc n)`
6. `0 < n ⟹ n div 2 < n` for natural numbers

::: solution
1. Structural induction on `t`: `mirror` and `nodes` have one equation per constructor.
2. Rule induction on `steps r a b`, the first premise; `c` appears only in the conclusion and in
   `r b c`, which becomes part of the claim.
3. Computation induction with `merge.induct` on `xs ys`, as for `length` in Section 11.5.
4. Structural induction on `xs` with `arbitrary: acc`: the accumulator changes in the recursive call.
5. Rule induction on `ev n`, with rule inversion in both cases: `¬ ev (Suc 0)` by `ev_1E`, and in case
   `ev_SS`, `ev (Suc (Suc (Suc n)))` would give `ev (Suc n)` by `ev_SSE`, against the IH.
6. No induction at all: this is linear arithmetic about `div`, which `simp` or `arith` proves. Not
   every goal about numbers needs induction; check with automation first.

In Isabelle, one line each:

```isabelle
lemma "nodes (mirror t) = nodes t"
  by (induction t) auto

lemma "steps r a b ⟹ r b c ⟹ steps r a c"
  by (induction rule: steps.induct) (auto intro: step stay)

lemma "count_list (merge xs ys) z = count_list xs z + count_list ys z"
  by (induction xs ys rule: merge.induct) auto

lemma "sumacc (xs @ ys) acc = sumacc ys (sumacc xs acc)"
  by (induction xs arbitrary: acc) auto

lemma "ev n ⟹ ¬ ev (Suc n)"
  by (induction rule: ev.induct) (auto elim: ev_SSE ev_1E)

lemma "0 < n ⟹ (n::nat) div 2 < n"
  by simp
```
:::
::::

:::: exercise Two derivations {#ex-11-3} ★
The word `()()()` is balanced. Draw two different derivations of it with the rules of `bal`. Does it
matter for rule induction that a word can have several derivations?

::: solution
Write ε for the empty word. Both derivations first derive `()` from ε with `bal_wrap`. Then:

- Derivation 1: `bal_cat` joins `()` and `()` into `()()`, and a second `bal_cat` joins `()()` and `()`
  into `()()()`.
- Derivation 2: `bal_cat` joins `()` and `()` into `()()`, and a second `bal_cat` joins `()` and `()()`
  into `()()()`.

They differ in how the three parts are grouped, like $(a + b) + c$ and $a + (b + c)$. A grammar with
several derivations for one word is called **ambiguous**. For rule induction this does not matter: the
proof shows that *every* rule passes the property on, so the property holds whichever derivation
exists.
:::
::::

:::: exercise Flattening with an accumulator {#ex-11-4} ★★
The function `inorder` uses `@` at every node, which makes it slow on large trees. Define the
accumulator version

```text
flat Lf acc = acc
flat (Nd l x r) acc = flat l (x # flat r acc)
```

and prove `flat t [] = inorder t`. Which generalisation do you need?

::: solution
`flat t acc` puts the traversal of `t` in front of `acc`, so the general claim is
`flat t acc = inorder t @ acc`. Both recursive calls pass a different accumulator, so generalise `acc`:

```isabelle
fun flat :: "'a btree ⇒ 'a list ⇒ 'a list" where
  "flat Lf acc = acc"
| "flat (Nd l x r) acc = flat l (x # flat r acc)"

lemma flat_inorder: "flat t acc = inorder t @ acc"
  by (induction t arbitrary: acc) auto

lemma "flat t [] = inorder t"
  by (simp add: flat_inorder)
```

In case `Nd`, the IH for `r` is used with accumulator `acc`, and the IH for `l` with `x # flat r acc`.
:::
::::

:::: exercise More even numbers {#ex-11-5} ★★
1. Prove `ev (n + n)` for every `n`.
2. Prove `ev m ⟹ ev (m * n)`. Which induction works best here? You may use `ev_add`.

::: solution
1. Structural induction on `n`. In the step, `Suc n + Suc n` simplifies to `Suc (Suc (n + n))`, and rule
   `ev_SS` applies to the IH:

```isabelle
lemma ev_double: "ev (n + n)"
proof (induction n)
  case 0
  show ?case by (simp add: ev_0)
next
  case (Suc n)
  then show ?case by (simp add: ev_SS)
qed
```

2. Induction on `n`, not rule induction on `ev m`: `m * Suc n` simplifies to `m + m * n`, and `ev_add`
   combines `ev m` with the IH `ev (m * n)`. (Rule induction on `ev m` would lead to
   `ev (n + (n + k * n))`, which needs more lemmas.)

```isabelle
lemma "ev m ⟹ ev (m * n)"
proof (induction n)
  case 0
  show ?case by (simp add: ev_0)
next
  case (Suc n)
  then have "ev (m * n)" by simp
  with Suc.prems have "ev (m + m * n)" by (rule ev_add)
  then show ?case by simp
qed
```

In the step, `Suc.IH` is `ev m ⟹ ev (m * n)` and `Suc.prems` is `ev m`; `then` passes both to `simp`.
:::
::::

:::: exercise Words the checker rejects {#ex-11-6} ★★
Prove `¬ bal [RP, LP]` and `¬ bal [LP]`. Rule inversion alone is awkward here: rule `bal_cat` can
split `[RP, LP]` in several ways, among them `[] @ [RP, LP]`, which leads back to the same question. Use
the checker instead.

::: solution
By `bal_chk0`, a balanced word passes the check; `simp` computes that these words do not:

```isabelle
lemma "¬ bal [RP, LP]"
proof
  assume "bal [RP, LP]"
  then have "chk [RP, LP] 0" by (rule bal_chk0)
  then show False by simp
qed

lemma "¬ bal [LP]"
proof
  assume "bal [LP]"
  then have "chk [LP] 0" by (rule bal_chk0)
  then show False by simp
qed
```

A proved property of all members (here: "passes the check") is often the easiest way to show that
something is not a member.
:::
::::

:::: exercise Fibonacci by complete induction {#ex-11-7} ★★
Prove Module 5's bound `fib n < 2 ^ n` once more, this time with `less_induct`. Distinguish the three forms
of `n` with `cases n rule: fib.cases`, which has one case for each equation of `fib`.

::: solution
In the third case `n = Suc (Suc k)`. Both `k` and `Suc k` are smaller than `n`, so the IH applies to
both:

```isabelle
lemma "fib n < 2 ^ n"
proof (induction n rule: less_induct)
  case (less n)
  show ?case
  proof (cases n rule: fib.cases)
    case 1
    then show ?thesis by simp
  next
    case 2
    then show ?thesis by simp
  next
    case (3 k)
    have "fib k < 2 ^ k" by (rule less.IH) (simp add: 3)
    moreover have "fib (Suc k) < 2 ^ Suc k" by (rule less.IH) (simp add: 3)
    ultimately show ?thesis using 3 by simp
  qed
qed
```

Each IH is used as a rule: `rule less.IH` reduces `fib k < 2 ^ k` to `k < n`, which follows from the
case's fact `n = Suc (Suc k)`, named `3`. (Passing `less.IH` to `simp` instead does not work here: the
simplifier first rewrites `2 ^ Suc k` to `2 * 2 ^ k`, and then the IH no longer matches.) `fib.cases`
is the case analysis that `fun` generates together with `fib.induct`. Compare the three
proofs of the bound: by strengthening (Module 5), by computation induction (Section 11.5) and by
complete induction. Computation induction gives the shortest proof, because `fib.induct` provides
induction hypotheses for exactly the calls that `fib` makes.
:::
::::

:::: exercise Even in both senses {#ex-11-8} ★★★
Prove `even n ⟹ ev n` by complete induction, and conclude `ev n ⟷ even n`. Hint: for `n ≥ 2`, the
claim for `n - 2` helps.

::: solution
If `n = 0`, rule `ev_0` applies. Otherwise `n` is even and not 0, so it is at least 2: `n = Suc (Suc k)`
with `even k` and `k < n`. The IH gives `ev k`, and rule `ev_SS` gives `ev n`.

```isabelle
lemma even_ev: "even n ⟹ ev n"
proof (induction n rule: less_induct)
  case (less n)
  show ?case
  proof (cases n)
    case 0
    then show ?thesis by (simp add: ev_0)
  next
    case (Suc m)
    with less.prems obtain k where "n = Suc (Suc k)" by (cases m) auto
    with less.prems have "even k" and "k < n" by simp_all
    then have "ev k" using less.IH by blast
    with ‹n = Suc (Suc k)› show ?thesis by (simp add: ev_SS)
  qed
qed

lemma "ev n ⟷ even n"
  using ev_even even_ev by blast
```

`cases m` excludes `n = Suc 0`: then `n` would be odd, which contradicts `less.prems`. The text
`‹n = Suc (Suc k)›` in cartouches refers to the fact with that statement. Computation induction with a
function that recurses on `n - 2` would work as well; complete induction needs no extra function.
:::
::::

:::: exercise Merging sorted lists {#ex-11-9} ★★★
The point of `merge` is that it keeps lists sorted. Prove
`sorted xs ⟹ sorted ys ⟹ sorted (merge xs ys)` with the library's `sorted`. You will need `set_merge`
from Section 11.5. Why?

::: solution
Computation induction with `merge.induct`. In case 3 with `x ≤ y`, the result is
`x # merge xs (y # ys)`. It is sorted if `merge xs (y # ys)` is sorted (the IH) and `x` is at most every
element of `merge xs (y # ys)`. The second part is a statement about the *elements* of a merge, and
`set_merge` turns it into a statement about the elements of `xs` and `y # ys`, which the premises
cover. The case `¬ x ≤ y` is symmetric. `auto` does all of this:

```isabelle
lemma "sorted xs ⟹ sorted ys ⟹ sorted (merge xs ys)"
  by (induction xs ys rule: merge.induct) (auto simp: set_merge)
```

Without `set_merge`, the simplifier is stuck at goals about `set (merge xs (y # ys))`: this is the
auxiliary-lemma situation of Section 11.3, with the lemma already proved.
:::
::::

## Check yourself {#quiz}

```quiz
? An induction on `xs` gets stuck with the goal `⋀a xs. f xs 0 = g xs ⟹ f xs a = a + g xs`. What is the most likely fix?
- [ ] Add `f.simps` to the simplifier
- [ ] Use `less_induct` instead of structural induction
- [x] Generalise: prove the claim for every value of the second argument, with `arbitrary:`
- [ ] Use `blast` instead of `auto`
> The IH fixes the second argument to `0`, but the conclusion needs it with value `a`. The claim must speak about every value of that argument, and the induction must not fix it.

? What does `arbitrary: acc` change in an induction?
- [x] `acc` is bound by ⋀ in the induction hypothesis, so the hypothesis holds for every value of `acc`
- [ ] Isabelle chooses a value for `acc` that makes the proof work
- [ ] The induction is done on `acc` instead of the list
- [ ] `acc` is removed from the goal
> The claim is proved for all values of `acc` at once, so in the step the IH can be used with the value the recursive call passes, such as `acc + x`.

? How many cases and induction hypotheses does `f.induct` have for a function `f` defined by `fun`?
- [ ] One case per constructor of the argument type, one IH per case
- [ ] Always two cases, base and step
- [ ] One case per recursive call, no IH
- [x] One case per defining equation, one IH per recursive call in that equation
> Computation induction follows the recursion of the function. An IH can carry a condition, such as `x ≤ y`, when the call happens only under that condition.

? An inductive definition of `ev` has rules `ev 0` and `ev n ⟹ ev (Suc (Suc n))`. Why is `ev 1` false?
- [ ] Because `value "ev 1"` returns `False`
- [x] Because no derivation ends in `ev 1`: no rule has a conclusion of that form
- [ ] Because 1 is odd in the library
- [ ] It is not false; nothing excludes it
> The predicate holds exactly for what the rules can derive. Rule inversion makes this formal: no rule's conclusion matches `ev (Suc 0)`, so the fact is impossible.

? You try `apply (induction rule: steps.induct)` on `steps move Done s ⟹ s = Done` and get goals such as `c = b ⟹ c = a`. Why?
- [ ] The lemma is false
- [ ] Rule induction only works for `nat`
- [ ] `blast` should have been used first
- [x] The inductive premise has a constant where the rule expects a variable, so the claim lost its meaning
> Rule induction is about `steps r x y` for variables `x` and `y`. Generalise: state `steps move a s ⟹ a = Done ⟹ s = Done`, or write `induction Done s rule: steps.induct`.

? In a proof by `induction n rule: less_induct`, what may you assume when you prove the claim for `n`?
- [ ] The claim for `n - 1` only
- [ ] Nothing: `less_induct` has no induction hypothesis
- [x] The claim for every `y < n`
- [ ] The claim for every `y > n`
> Complete induction lets the step use any smaller value, such as `n div 2` or `n - 3`, not only the predecessor.
```
