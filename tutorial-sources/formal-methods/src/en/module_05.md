---
title: Induction and recursion
part: 1
lead: Define functions on numbers, lists and trees by recursion and evaluate them step by step; prove that a property holds for every input by induction, on paper and in Isabelle; and see why every recursive definition must terminate.
minutes: 240
needs: Modules 1–4, especially well-founded relations (Module 4)
goals:
  - Define functions on natural numbers, lists and binary trees by recursion, and evaluate them by rewriting
  - Prove a statement for every natural number by induction, naming the base case, the induction step and the induction hypothesis
  - Use strong induction, and structural induction on lists and trees
  - Explain why a recursive definition must terminate, and justify termination with a measure
  - Prove properties by induction in Isabelle, and read the base case and the step in the proof state
  - Show with an invariant that a property holds after any number of steps of a loop or a machine
imports: Main
---

## Recursive definitions {#recursion}

A loop repeats a piece of work until it is done. Mathematics describes repetition differently: with a
**recursive definition**, which defines a function in terms of itself on smaller arguments. "The sum
0 + 1 + ⋯ + n is the sum up to n − 1, plus n" is such a definition. Recursive definitions are short and
exact, and you can compute with them. They come with a matching proof method, **induction**, which
proves a statement for every one of infinitely many inputs at once.

Recursion and induction are the heart of Isabelle/HOL. Almost every function you define in this series is
recursive, and almost every proof about such a function is by induction. This module teaches both, first
on paper and then in Isabelle.

### Natural numbers, built from zero {#peano}

Every natural number can be reached from 0 by adding 1 often enough: 3 is 0 + 1 + 1 + 1. Giuseppe Peano
made this observation the basis of arithmetic in 1889, and it is the basis of everything in this module.

::: definition Natural numbers
The **natural numbers** $\N = \{0, 1, 2, \dots\}$ are built from two constructors: $0$ is a natural
number, and if $n$ is a natural number, so is its **successor** $\mathit{Suc}\ n$ (read "successor of
n"), which is $n + 1$. Nothing else is a natural number. Different constructions give different numbers:
$0 \neq \mathit{Suc}\ n$, and $\mathit{Suc}\ m = \mathit{Suc}\ n$ only if $m = n$.
:::

So every natural number is either 0 or `Suc m` for exactly one `m`: 3 is `Suc (Suc (Suc 0))`. Isabelle's
type `nat` is built in exactly this way. It prints numbers as numerals, but `3` and `Suc (Suc (Suc 0))`
are the same value:

```isabelle
value "Suc (Suc (Suc 0))"
```

```output
"3"
  :: "nat"
```

That every number is either 0 or a successor is what makes recursive definitions work. To define a
function on all of $\N$, it is enough to say what it does at 0, and what it does at $n + 1$ in terms of
what it does at $n$.

### Four functions on numbers {#nat-functions}

Here is the sum $0 + 1 + \dots + n$ as a recursive definition. Call it $\mathit{sum\_upto}$:

$$
\begin{aligned}
\mathit{sum\_upto}(0) &= 0\\
\mathit{sum\_upto}(n+1) &= \mathit{sum\_upto}(n) + (n+1)
\end{aligned}
$$

The first equation is the **base case**. The second, the **recursive case**, defines the sum up to $n + 1$
by the sum up to $n$, which is a smaller instance of the same problem. Since every number is either 0 or
$n + 1$ for some $n$, the two equations cover every number, each exactly once.

::: definition Recursive definition
A **recursive definition** defines a function by equations in which the function may also appear on the
right-hand side. The equations cover every possible argument. The **base cases** do not use the
function; the **recursive cases** call it on smaller arguments.
:::

Three more functions follow the same pattern: the factorial $n! = 1 \cdot 2 \cdot \ldots \cdot n$, called
$\mathit{fac}$ here; the power $x^n$, called $\mathit{pow}$; and the Fibonacci numbers
0, 1, 1, 2, 3, 5, 8, 13, …, in which each number is the sum of the two before it.

| Function | Base cases | Recursive case |
|---|---|---|
| sum $0 + 1 + \dots + n$ | $\mathit{sum\_upto}(0) = 0$ | $\mathit{sum\_upto}(n+1) = \mathit{sum\_upto}(n) + (n+1)$ |
| factorial $n!$ | $\mathit{fac}(0) = 1$ | $\mathit{fac}(n+1) = \mathit{fac}(n) \cdot (n+1)$ |
| power $x^n$ | $\mathit{pow}(x, 0) = 1$ | $\mathit{pow}(x, n+1) = \mathit{pow}(x, n) \cdot x$ |
| Fibonacci | $\mathit{fib}(0) = 0$, $\mathit{fib}(1) = 1$ | $\mathit{fib}(n+2) = \mathit{fib}(n) + \mathit{fib}(n+1)$ |

$\mathit{pow}$ has two arguments, and the recursion is on the second one, the exponent; $x$ stays the same
in every call. $\mathit{fib}$ needs two base cases, because its recursive case looks two steps back.

::: isabelle
In Isabelle, `fun` defines a function by such equations, separated by `|`. The patterns use `Suc n` where
the paper uses $n + 1$:

```isabelle
fun sum_upto :: "nat ⇒ nat" where
  "sum_upto 0 = 0"
| "sum_upto (Suc n) = sum_upto n + Suc n"
```

```output
consts
  sum_upto :: "nat ⇒ nat"

Found termination order: "size <*mlex*> {}"
```

Isabelle reports the new constant and its type, and that it has found a "termination order"; Section 5.7
explains what that means. The other three functions:

```isabelle
fun fac :: "nat ⇒ nat" where
  "fac 0 = 1"
| "fac (Suc n) = fac n * Suc n"

fun pow :: "nat ⇒ nat ⇒ nat" where
  "pow x 0 = 1"
| "pow x (Suc n) = pow x n * x"

fun fib :: "nat ⇒ nat" where
  "fib 0 = 0"
| "fib (Suc 0) = 1"
| "fib (Suc (Suc n)) = fib n + fib (Suc n)"
```

The pattern `Suc 0` matches only the number 1, and `Suc (Suc n)` matches every number from 2 on, with
`n` two less. Now compute some values:

```isabelle
value "[sum_upto 3, fac 5, pow 2 10, fib 10]"
```

```output
"[6, 120, 1024, 55]"
  :: "nat list"
```
:::

### Evaluation is rewriting {#rewriting}

How do you compute $\mathit{sum\_upto}(3)$ from the equations? Read each equation from left to right as a
**rewrite rule**: wherever a term matches its left-hand side, you may replace it by its right-hand side.
Since $3 = 2 + 1$, the recursive case applies with $n = 2$, and so on down to 0:

$$
\begin{aligned}
\mathit{sum\_upto}(3) &= \mathit{sum\_upto}(2) + 3\\
&= \mathit{sum\_upto}(1) + 2 + 3\\
&= \mathit{sum\_upto}(0) + 1 + 2 + 3\\
&= 0 + 1 + 2 + 3\\
&= 6
\end{aligned}
$$

Three steps use the recursive case, one the base case, and the last one does the arithmetic. Every step
is justified by an equation, so the chain is also a proof that $\mathit{sum\_upto}(3) = 6$.

::: definition Evaluation by rewriting
To **evaluate** a term by **rewriting**, repeatedly choose a part of the term that matches the left-hand
side of an equation and replace it by the right-hand side, with the variables of the equation replaced by
the parts they matched. When no equation applies any more, the term is a **value**: the result.
:::

Often several parts of a term could be rewritten. This module does what most programming languages do and
evaluates the arguments of a call before the call itself (**call by value**): it always rewrites the
leftmost call, or arithmetic operation, whose arguments are already values. For the functions of this
module, the order changes the terms you see along the way, but never the final value.

::: note
Isabelle's `value` command does not rewrite step by step: it turns the equations into a program and runs
it, which is much faster. The simplifier `simp`, on the other hand, does rewrite: it uses the defining
equations of every function defined with `fun` as rewrite rules, as you will see in Section 5.4.
:::

## Lists and trees {#data}

Numbers are built from `0` and `Suc`. Lists and trees are built in the same way, from a few constructors,
and recursion on them works exactly as on numbers.

### Lists {#lists}

Isabelle's lists, which you met in Module 1, have two constructors: `[]` is the **empty list**, and
`x # xs` (read "x cons xs") puts an element `x` in front of a list `xs`. The list `[1, 2, 3]` is short for
`1 # (2 # (3 # []))`, and since `#` groups to the right you can write it as `1 # 2 # 3 # []`. All
elements of a list have the same type: `nat list` is the type of lists of natural numbers, and `'a list`
(read "alpha list") the type of lists whose elements have some type `'a`.

::: definition Lists
Every list is either the **empty list** `[]` or `x # xs`: a **head** `x` in front of a **tail** `xs`.
Nothing else is a list, and lists built differently are different: `x # xs ≠ []`, and
`x # xs = y # ys` only if `x = y` and `xs = ys`.
:::

```isabelle
value "1 # 2 # [3 :: nat]"
```

```output
"[1, 2, 3]"
  :: "nat list"
```

Isabelle prints the result in the short notation. A function on lists needs one equation for `[]` and
one for `x # xs`. Here are four: the length of a list, appending two lists, reversing a list, and the sum
of a list of numbers.

```isabelle
fun len :: "'a list ⇒ nat" where
  "len [] = 0"
| "len (x # xs) = len xs + 1"

fun app :: "'a list ⇒ 'a list ⇒ 'a list" where
  "app [] ys = ys"
| "app (x # xs) ys = x # app xs ys"

fun reverse :: "'a list ⇒ 'a list" where
  "reverse [] = []"
| "reverse (x # xs) = app (reverse xs) [x]"

fun lsum :: "nat list ⇒ nat" where
  "lsum [] = 0"
| "lsum (x # xs) = x + lsum xs"
```

Read the second equation of `app` as: to put `x # xs` in front of `ys`, put `xs` in front of `ys` and then
`x` in front of the result. The second equation of `reverse` says: reverse the tail, then append the head
at the end. This module refers to equations by function and number: `app.2` is the second equation of
`app`. Isabelle calls it `app.simps(2)`.

The library has all four functions, under the names `length`, `@` (which you met in Module 1), `rev` and
`sum_list`. The library's theory `List.thy` defines `@` and `rev` by exactly these equations, for example
`[] @ ys = ys` and `(x # xs) @ ys = x # xs @ ys`; `length` and `sum_list` are defined differently but
satisfy the same equations. You define your own versions here to see how they work, and because Isabelle
then has to prove every fact about them from scratch, with your help.

`value` works with variables as well as numbers:

```isabelle
value "reverse [a, b, c]"
```

```output
"[c, b, a]"
  :: "'a list"
```

### Binary trees: your first datatype {#trees}

Lists are one example of a **datatype**, a type whose values are built from constructors. You can define
your own. A **binary tree** is either empty, or a node that holds an element and two smaller trees, its
left and right subtrees:

```isabelle
datatype 'a tree2 = Tip | Node "'a tree2" 'a "'a tree2"
```

Read it as: a tree with elements of type `'a` is either `Tip`, the empty tree, or `Node l x r`, with a
left subtree `l`, an element `x` and a right subtree `r`. The types of the arguments of `Node` follow its
name; each type that is more than a single name or type variable goes in quotation marks. Isabelle
comes with a library theory of trees whose type is called `tree` (it is not part of `Main`), so this one
is called `tree2` to keep the two apart.

::: definition Datatype
A **datatype** is a type whose values are built from **constructors**. Every value is built by applying
the constructors finitely often, and values built differently are different. The command `datatype`
introduces a new type with its constructors, and Isabelle proves automatically that different
constructors give different values and that each constructor is injective.
:::

The tree on the left of Figure 5.1 has four nodes and five tips. Three functions on trees: `mirror` swaps
left and right everywhere, `nodes` counts the nodes and `tips` counts the tips.

```isabelle
fun mirror :: "'a tree2 ⇒ 'a tree2" where
  "mirror Tip = Tip"
| "mirror (Node l x r) = Node (mirror r) x (mirror l)"

fun nodes :: "'a tree2 ⇒ nat" where
  "nodes Tip = 0"
| "nodes (Node l x r) = nodes l + nodes r + 1"

fun tips :: "'a tree2 ⇒ nat" where
  "tips Tip = 1"
| "tips (Node l x r) = tips l + tips r"
```

Each recursive case calls the function twice, once for each subtree. Both subtrees are smaller than the
tree, and that is all a recursive definition needs.

::: figure id=fig-05-1
A tree `t` and its mirror image. Tips are drawn as small squares. `mirror` swaps the left and right
subtrees at every node: the subtree with 4 and 3 moves to the left, and is mirrored itself on the way.
:::

```isabelle
value "mirror (Node (Node Tip 1 Tip) 2 (Node (Node Tip 3 Tip) 4 Tip) :: nat tree2)"
```

```output
"Node (Node Tip 4 (Node Tip 3 Tip)) 2 (Node Tip 1 Tip)"
  :: "nat tree2"
```

The annotation `:: nat tree2` says that the elements are natural numbers, as `:: nat` did for numbers in
Module 1.

### Step through an evaluation {#stepper}

Rewriting works on lists and trees exactly as on numbers. Here is `reverse [1, 2]`, one equation per step,
with the equation named on the right:

```text
  reverse [1, 2]
= app (reverse [2]) [1]             by reverse.2
= app (app (reverse []) [2]) [1]    by reverse.2
= app (app [] [2]) [1]              by reverse.1
= app [2] [1]                       by app.1
= 2 # app [] [1]                    by app.2
= 2 # [1]                           by app.1
```

and `2 # [1]` is the list `[2, 1]`. Notice how `reverse` builds a pile of calls to `app` and only then
starts to append. The stepper below performs such evaluations for every function of this module.

::: widget name=eval-stepper
Choose a function and its argument, then press **Next** to rewrite the highlighted part of the term; the
equation used lights up in the definition above it. Start with `sum_upto` and 3, then try `reverse` with
`[1, 2, 3]` and `mirror` with the tree of Figure 5.1. Finally choose `fib` with 5, press **Run to end**,
and read the count of calls. Then try `fib` with 10.
:::

The count for `fib` shows a problem. `fib 5` calls `fib 3` and `fib 4`; but `fib 4` calls `fib 3` again,
and computes from scratch everything that the first call already computed (Figure 5.2). The number of
calls grows like the Fibonacci numbers themselves: computing `fib n` takes $2 \cdot \mathit{fib}(n+1) - 1$
calls, which is 15 calls for `fib 5` and more than 2.6 million for `fib 30`.

::: figure id=fig-05-2
The calls made to compute `fib 5`. Each call of `fib` on a number of 2 or more makes two further calls.
`fib 3` is computed twice and `fib 2` three times, each time from scratch.
:::

As a definition, `fib` is fine: it says exactly what the Fibonacci numbers are. As a program it is slow.
A program that keeps the last two values computes `fib n` in about n steps. Proving that such a faster
program computes the same function as the clear definition is a typical verification task, and Modules 11
and 12 do such proofs.

## Mathematical induction {#induction}

`value` can compute $\mathit{sum\_upto}(n)$ for any single $n$, and so can a test. But a claim such as
$2 \cdot \mathit{sum\_upto}(n) = n \cdot (n+1)$ for every $n$ is about infinitely many numbers, and, as
Module 1 showed, no amount of testing covers them all. You need an argument that works for every $n$ at
once. Induction is such an argument.

### The principle {#principle}

Suppose you have shown two things: the claim holds for 0; and whenever it holds for some number $n$, it
also holds for $n + 1$. Then it holds for 0, therefore for 1, therefore for 2, and so on. Every natural
number is reached from 0 in finitely many steps of $+1$, so the claim reaches every number. Figure 5.3
shows the usual picture: a row of dominoes.

::: figure id=fig-05-3
Induction as a row of dominoes. The base case pushes over the first domino. The induction step says that
any domino that falls knocks over the next one. Together they make every domino fall, however far along
the row it stands.
:::

::: fact Mathematical induction
Let $P(n)$ be a statement about a natural number $n$. If

1. **base case:** $P(0)$ holds, and
2. **induction step:** for every $n$, $P(n)$ implies $P(n+1)$,

then $P(n)$ holds for every natural number $n$. In the induction step, the assumption $P(n)$ is called the
**induction hypothesis**, IH for short.
:::

In the logical notation of Modules 2 and 3: $P(0) \land (\forall n.\ P(n) \imp P(n+1)) \imp (\forall n.\ P(n))$. Read it as
"if P of 0, and for all n, P of n implies P of n plus 1, then for all n, P of n".

Why is this a valid way to prove something? Here is a second argument besides the dominoes. Suppose $P$
failed for some number. Among the numbers where it fails, take the smallest, $m$. It is not 0, because
$P(0)$ holds. So $m = k + 1$ for some $k$, and $P(k)$ holds because $k < m$ and $m$ was the smallest
failure. But then the induction step gives $P(k + 1)$, that is $P(m)$: a contradiction. The argument
uses one property of $\N$: every non-empty set of natural numbers has a smallest element. In the words of
Module 4, the order $<$ on $\N$ is **well-founded**: there is no infinite descending chain
$n_0 > n_1 > n_2 > \cdots$. Sections 5.6 and 5.7 build on this.

Induction need not start at 0. To prove $P(n)$ for every $n \ge k$, prove $P(k)$ and, for every $n \ge k$,
that $P(n)$ implies $P(n + 1)$.

### A first proof by induction {#first-proof}

::: example The sum formula
**Claim.** For every natural number $n$, $2 \cdot \mathit{sum\_upto}(n) = n \cdot (n + 1)$.

**Proof** by induction on $n$. Let $P(n)$ be the statement $2 \cdot \mathit{sum\_upto}(n) = n \cdot (n+1)$.

*Base case*, $P(0)$: by the first equation of $\mathit{sum\_upto}$,
$2 \cdot \mathit{sum\_upto}(0) = 2 \cdot 0 = 0 = 0 \cdot (0 + 1)$.

*Induction step.* Let $n$ be any natural number, and assume the IH:
$2 \cdot \mathit{sum\_upto}(n) = n \cdot (n+1)$. Show $P(n+1)$, that is
$2 \cdot \mathit{sum\_upto}(n+1) = (n+1) \cdot (n+2)$:

$$
\begin{aligned}
2 \cdot \mathit{sum\_upto}(n+1) &= 2 \cdot (\mathit{sum\_upto}(n) + (n+1)) && \text{by sum\_upto.2}\\
&= 2 \cdot \mathit{sum\_upto}(n) + 2 \cdot (n+1) && \text{arithmetic}\\
&= n \cdot (n+1) + 2 \cdot (n+1) && \text{by the IH}\\
&= (n+1) \cdot (n+2) && \text{arithmetic}
\end{aligned}
$$

By induction, $P(n)$ holds for every $n$.
:::

Dividing by 2 gives the familiar formula $0 + 1 + \dots + n = n(n+1)/2$. The claim keeps the factor 2 on
the left so that it needs no division, which makes it easier to state exactly and to prove: on natural
numbers, division rounds down.

### Writing an induction proof {#writing}

::: tip
An induction proof has five parts. Write all of them, every time.

1. Say which variable you do induction on, and state $P(n)$ exactly.
2. **Base case:** prove $P(0)$.
3. **Induction step:** take an arbitrary $n$ and write down the IH, $P(n)$.
4. Write down the goal $P(n + 1)$ and prove it. Mark the step where you use the IH. If you never use it,
   either the proof is wrong or it did not need induction.
5. Conclude: by induction, $P(n)$ holds for every $n$.
:::

The second example proves an inequality. Inequalities are a little less mechanical than equations,
because you have to decide what to estimate.

::: example Powers of two grow faster than n
**Claim.** For every natural number $n$, $n < \mathit{pow}(2, n)$.

**Proof** by induction on $n$.

*Base case:* $0 < 1 = \mathit{pow}(2, 0)$, by pow.1.

*Induction step.* Assume the IH, $n < \mathit{pow}(2, n)$, and show $n + 1 < \mathit{pow}(2, n+1)$. On
natural numbers, $n < \mathit{pow}(2, n)$ means $\mathit{pow}(2, n) \ge n + 1$, and in particular
$\mathit{pow}(2, n) \ge 1$. So

$$
\mathit{pow}(2, n+1) = \mathit{pow}(2, n) \cdot 2 = \mathit{pow}(2, n) + \mathit{pow}(2, n) \;\ge\; (n + 1) + 1 \;>\; n + 1,
$$

using pow.2 and then the IH for both summands. By induction, the claim holds for every $n$.
:::

::: pitfall
**Both parts are needed.** Take $P(n)$: "$n = n + 1$". The induction step holds: if $n = n + 1$, then
adding 1 to both sides gives $n + 1 = n + 2$. But the base case $0 = 1$ is false, and so is the claim. A
step without a base case proves nothing.

**The step must work for every $n$, the smallest included.** A well-known false proof claims that in
every group of $n \ge 1$ horses, all horses have the same colour. Base case: one horse has one colour.
Step: from a group of $n + 1$ horses, take out one horse; the remaining $n$ have the same colour by the IH.
Put it back and take out a different horse; again the remaining $n$ have the same colour. The two groups
overlap, so all $n + 1$ horses have the same colour. The flaw: for $n = 1$, the two groups contain one
horse each and do not overlap. The step fails from 1 to 2, so the dominoes stop after the first.
:::

## Induction in Isabelle {#isabelle-induction}

Isabelle checks induction proofs too. You state the lemma and tell Isabelle to use induction; Isabelle
then shows the base case and the induction step as separate goals, which you prove. Reading these goals is
the main skill of this section.

### Why simp is not enough {#simp-not-enough}

Try the sum formula with the simplifier alone:

```isabelle fails
lemma "2 * sum_upto n = n * (n + 1)"
  by simp
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. 2 * sum_upto n = n + n * n
```

The simplifier has rewritten `n * (n + 1)` into `n + n * n`, but it could not touch `sum_upto n`. Neither
equation of `sum_upto` matches it: the first needs `0`, the second `Suc` of something, and `n` is an
arbitrary number that the simplifier knows nothing about. Induction splits the proof into exactly these
two cases.

### Base case and step in the proof state {#induction-state}

State the lemma again, give it a name, and ask for induction on `n`:

```isabelle
lemma sum_formula: "2 * sum_upto n = n * (n + 1)"
  apply (induction n)
```

```output state
proof (prove)
goal (2 subgoals):
 1. 2 * sum_upto 0 = 0 * (0 + 1)
 2. ⋀n. 2 * sum_upto n = n * (n + 1) ⟹
        2 * sum_upto (Suc n) = Suc n * (Suc n + 1)
```

`apply` applies a **proof method** to the goal and shows what is left to prove; the method
`induction n` does induction on `n`. The one goal has become two **subgoals**. Subgoal 1 is the base case:
the claim with `0` for `n`. Subgoal 2 is the induction step, and it contains two new symbols:

- `⋀n.` (type `\And` or `!!`) means "for an arbitrary n": in this subgoal, `n` stands for any number, and
  nothing is known about it except what the subgoal says.
- `A ⟹ B` (type `==>`) means "A implies B": to prove the subgoal, prove `B`, and you may assume `A`.

To the left of `⟹` is the IH; to the right, the claim for `Suc n`, which is $n + 1$. Side by side with the
paper proof of Example 5.1:

| Paper proof | Isabelle's subgoals |
|---|---|
| Base case $P(0)$ | `1. 2 * sum_upto 0 = 0 * (0 + 1)` |
| Take an arbitrary $n$ | `2. ⋀n.` |
| Assume the IH $P(n)$ | `2 * sum_upto n = n * (n + 1) ⟹` |
| Show $P(n + 1)$ | `2 * sum_upto (Suc n) = Suc n * (Suc n + 1)` |

Now prove the subgoals one at a time. `simp` works on the first subgoal:

```isabelle
  apply simp
```

```output state
proof (prove)
goal (1 subgoal):
 1. ⋀n. 2 * sum_upto n = n * (n + 1) ⟹
        2 * sum_upto (Suc n) = Suc n * (Suc n + 1)
```

The base case is gone: `simp` rewrote `sum_upto 0` to `0` with the first equation, and both sides to `0`.
What remains is the step. Apply `simp` again:

```isabelle
  apply simp
```

```output state
proof (prove)
goal:
No subgoals!
```

In the step, `simp` used the second equation of `sum_upto`, the IH (the simplifier uses the assumptions
to the left of `⟹`) and arithmetic: the same three things the paper proof used. No subgoals are left, and
`done` ends the proof:

```isabelle
  done
```

The lemma is now a theorem called `sum_formula`, which later proofs can use.

::: note
A proof written as a sequence of `apply` steps ending in `done` is an **apply script**. Module 7 builds
proofs step by step in this style, and Module 10 introduces Isar, a proof language that reads more like
the paper proofs. For now, apply scripts are the best way to look at the proof state between steps:
put the cursor after any line to see the state at that point.
:::

### The whole proof in one line {#by-induction}

Once you know how a proof goes, you can write it in one line:

```isabelle
lemma "2 * sum_upto n = n * (n + 1)"
  by (induction n) simp_all

lemma pow_gt: "n < pow 2 n"
  by (induction n) auto
```

`by m₁ m₂` applies the method `m₁`, then `m₂`, and fails unless no subgoals are left. `simp` would not do
as `m₂`, because it works only on the first subgoal; `simp_all` simplifies all subgoals, and `auto`
works on all subgoals too, combining simplification with logical reasoning. For an induction whose base
case and step follow from the definitions and the IH, `by (induction n) auto` is the first thing to try.

::: trouble
- **`Failed to finish proof` after `by simp` or `by auto`, with `sum_upto n` (or another recursive
  function applied to a variable) still in the goal.** The proof needs induction: write
  `by (induction n) auto`.
- **`Failed to finish proof` after `by (induction n) auto`.** Look at the remaining subgoal. Sections 5.5
  and 5.6 show the common causes: induction on the wrong variable, a missing lemma, and an induction
  hypothesis that is too weak.
- **The proof state does not show.** Tick **Proof state** in the Output panel (Module 1), and put the
  cursor at the end of the `apply` line.
:::

## Structural induction {#structural}

Induction on natural numbers follows the way numbers are built, from `0` and `Suc`. Every datatype is
built from its constructors in the same way, so every datatype has an induction principle of the same
shape, called **structural induction**.

### Induction on lists {#list-induction}

::: fact Structural induction on lists
Let $P(xs)$ be a statement about a list $xs$. If

1. $P([\,])$ holds, and
2. for every $x$ and $xs$, $P(xs)$ implies $P(x \mathbin{\#} xs)$,

then $P(xs)$ holds for every list $xs$.
:::

This is valid for the same reason as induction on numbers: every list is built from `[]` by finitely many
uses of `#`. In fact it is induction on the length of the list in disguise. The proofs below write
equations in Isabelle's notation, one step per line, as in the evaluation of `reverse [1, 2]`.

::: example Length of an append
**Claim.** For all lists `xs` and `ys`, `len (app xs ys) = len xs + len ys`.

Which variable should the induction be on? `app` takes its first argument apart (app.2) and leaves the
second alone. So do induction on `xs` and keep `ys` fixed: $P(xs)$ is
`len (app xs ys) = len xs + len ys`.

*Base case*, `xs = []`:

```text
  len (app [] ys)
= len ys                     by app.1
= 0 + len ys                 arithmetic
= len [] + len ys            by len.1
```

*Induction step.* Assume the IH, `len (app xs ys) = len xs + len ys`, and show the claim for `x # xs`:

```text
  len (app (x # xs) ys)
= len (x # app xs ys)        by app.2
= len (app xs ys) + 1        by len.2
= len xs + len ys + 1        by the IH
= (len xs + 1) + len ys      arithmetic
= len (x # xs) + len ys      by len.2
```
:::

::: isabelle
The induction method works on lists in the same way:

```isabelle
lemma len_app: "len (app xs ys) = len xs + len ys"
  apply (induction xs)
```

```output state
proof (prove)
goal (2 subgoals):
 1. len (app [] ys) = len [] + len ys
 2. ⋀a xs.
       len (app xs ys) = len xs + len ys ⟹
       len (app (a # xs) ys) = len (a # xs) + len ys
```

These are the base case and the step of Example 5.3. Isabelle calls the head of the list `a` rather than
`x`; the name does not matter, because `⋀a xs` makes both arbitrary. `auto` proves both subgoals:

```isabelle
  apply auto
  done
```

Induction on the other variable fails:

```isabelle fails
lemma "len (app xs ys) = len xs + len ys"
  by (induction ys) auto
```

```output
*** Failed to finish proof⌂:
*** goal (2 subgoals):
***  1. len (app xs []) = len xs
***  2. ⋀a ys.
***        len (app xs ys) = len xs + len ys ⟹
***        len (app xs (a # ys)) = Suc (len xs + len ys)
```

Every remaining subgoal contains `app xs` applied to something, and the equations of `app` cannot
rewrite it, because `xs` is neither `[]` nor of the form `x # xs`. The rule of thumb: do induction on the
argument that the function takes apart.
:::

### Induction on trees {#tree-induction}

::: fact Structural induction on trees
Let $P(t)$ be a statement about a tree $t$. If

1. $P(\mathit{Tip})$ holds, and
2. for all $l$, $x$ and $r$, $P(l)$ and $P(r)$ together imply $P(\mathit{Node}\ l\ x\ r)$,

then $P(t)$ holds for every tree $t$.
:::

The step now has two induction hypotheses, one for each subtree, because a node is built from two smaller
trees.

::: example Mirroring twice
**Claim.** For every tree `t`, `mirror (mirror t) = t`.

*Base case:* `mirror (mirror Tip) = mirror Tip = Tip`, by mirror.1 twice.

*Induction step.* Assume both IHs, `mirror (mirror l) = l` and `mirror (mirror r) = r`:

```text
  mirror (mirror (Node l x r))
= mirror (Node (mirror r) x (mirror l))             by mirror.2
= Node (mirror (mirror l)) x (mirror (mirror r))    by mirror.2
= Node l x r                                        by the two IHs
```
:::

::: isabelle
```isabelle
lemma mirror_mirror: "mirror (mirror t) = t"
  apply (induction t)
```

```output state
proof (prove)
goal (2 subgoals):
 1. mirror (mirror Tip) = Tip
 2. ⋀t1 x2 t2.
       ⟦mirror (mirror t1) = t1; mirror (mirror t2) = t2⟧
       ⟹ mirror (mirror (Node t1 x2 t2)) = Node t1 x2 t2
```

The notation `⟦A; B⟧ ⟹ C` is short for "A and B imply C". Both IHs are there, for the subtrees that
Isabelle calls `t1` and `t2`.

```isabelle
  apply auto
  done
```
:::

Structural induction also relates different measures of size. A tree with $n$ nodes has $n + 1$ tips,
whatever its shape: the tree in Figure 5.1 has 4 nodes and 5 tips. The proof is short. Base case:
`tips Tip = 1 = nodes Tip + 1`. Step:

```text
  tips (Node l x r)
= tips l + tips r                          by tips.2
= (nodes l + 1) + (nodes r + 1)            by the two IHs
= (nodes l + nodes r + 1) + 1              arithmetic
= nodes (Node l x r) + 1                   by nodes.2
```

```isabelle
lemma tips_nodes: "tips t = nodes t + 1"
  by (induction t) auto
```

### When the induction needs a lemma {#lemmas}

Reversing a list twice gives the list back. Try to prove it the usual way:

```isabelle fails
lemma "reverse (reverse xs) = xs"
  by (induction xs) auto
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ⋀a xs.
***        reverse (reverse xs) = xs ⟹ reverse (app (reverse xs) [a]) = a # xs
```

The base case went through, the step did not. `auto` unfolded `reverse (reverse (a # xs))` to
`reverse (app (reverse xs) [a])` and got stuck: the IH speaks about `reverse (reverse xs)`, but the goal
applies `reverse` to an `app`, and no equation says how to do that. Rewriting with the definitions cannot
help; a fact about `reverse` and `app` is missing. The stuck goal tells you what to look for: how does
`reverse` act on an `app`? Reversing two appended lists reverses both parts and swaps them.

::: example Reverse of an append
The proof needs two simple facts about `app`. Both are proved by induction on `xs`:

- **Lemma A**, `app xs [] = xs`. Base case: `app [] [] = []` by app.1. Step:
  `app (x # xs) [] = x # app xs [] = x # xs`, by app.2 and the IH.
- **Lemma B**, `app (app xs ys) zs = app xs (app ys zs)`. Base case: both sides are `app ys zs`, by app.1.
  Step: `app (app (x # xs) ys) zs = app (x # app xs ys) zs = x # app (app xs ys) zs`, which is
  `x # app xs (app ys zs)` by the IH, and that is `app (x # xs) (app ys zs)` by app.2.

**Lemma C**, `reverse (app xs ys) = app (reverse ys) (reverse xs)`, by induction on `xs`. Base case:
`reverse (app [] ys) = reverse ys`, which is `app (reverse ys) []` by Lemma A, and `reverse [] = []`. Step:

```text
  reverse (app (x # xs) ys)
= reverse (x # app xs ys)                      by app.2
= app (reverse (app xs ys)) [x]                by reverse.2
= app (app (reverse ys) (reverse xs)) [x]      by the IH
= app (reverse ys) (app (reverse xs) [x])      by Lemma B
= app (reverse ys) (reverse (x # xs))          by reverse.2
```

**Theorem**, `reverse (reverse xs) = xs`, by induction on `xs`. Base case: `reverse (reverse []) = []` by
reverse.1 twice. Step, using `reverse [x] = app [] [x] = [x]`:

```text
  reverse (reverse (x # xs))
= reverse (app (reverse xs) [x])               by reverse.2
= app (reverse [x]) (reverse (reverse xs))     by Lemma C
= app [x] xs                                   by reverse [x] = [x] and the IH
= x # xs                                       by app.2 and app.1
```
:::

::: isabelle
In Isabelle, prove the lemmas first and mark each with `[simp]`:

```isabelle
lemma app_nil [simp]: "app xs [] = xs"
  by (induction xs) auto

lemma app_assoc [simp]: "app (app xs ys) zs = app xs (app ys zs)"
  by (induction xs) auto

lemma reverse_app [simp]: "reverse (app xs ys) = app (reverse ys) (reverse xs)"
  by (induction xs) auto

lemma reverse_reverse: "reverse (reverse xs) = xs"
  by (induction xs) auto
```

The attribute `[simp]` makes a lemma a **simplification rule**: from then on, `simp` and `auto` use it
to rewrite, in the same way as the defining equations. That is how the proof of `reverse_app` uses
`app_nil` and `app_assoc`, and the proof of `reverse_reverse` uses `reverse_app`. If you try
`reverse_app` before the two lemmas, it gets stuck with goals that need them, exactly as
`reverse_reverse` got stuck without `reverse_app`. Module 9 explains which lemmas make good
simplification rules.
:::

::: keyidea
When an induction gets stuck, read the stuck goal. It usually contains a term that no equation can
rewrite, such as `reverse (app (reverse xs) [a])`. Find the general fact about that term, prove it as a
lemma (often by induction itself), declare it `[simp]`, and try again. Module 11 develops this into a
method.
:::

## Strong induction {#strong}

In ordinary induction, the step may use only $P(n)$ to prove $P(n + 1)$: the domino immediately before. Some
proofs need more. The Fibonacci numbers look two steps back, and a divisor of a number can be any smaller
number, not only the one before.

::: fact Strong induction
Let $P(n)$ be a statement about a natural number $n$. If, for every $n$, $P(m)$ for all $m < n$ (the
induction hypothesis) implies $P(n)$, then $P(n)$ holds for every natural number $n$.
:::

In symbols: $(\forall n.\ (\forall m < n.\ P(m)) \imp P(n)) \imp (\forall n.\ P(n))$. Here
$\forall m < n.\ P(m)$ reads "for all m less than n, P of m" and is short for
$\forall m.\ m < n \imp P(m)$, like the bounded quantifier $\forall x \in A$ of Module 4. Strong induction
is also called **complete induction** or course-of-values induction. There is no separate base case. For
$n = 0$ there is no $m < 0$, so the IH says nothing and $P(0)$ must be proved without help; in practice, a
proof by strong induction treats the smallest values separately.

Strong induction is no stronger than ordinary induction; it follows from it. Apply ordinary induction to
the statement $Q(n)$: "$P(m)$ holds for every $m < n$". $Q(0)$ holds because there is no $m < 0$. If
$Q(n)$ holds, then $P(n)$ holds by the assumption of strong induction, so $P(m)$ holds for every
$m < n + 1$: that is $Q(n + 1)$. Hence $Q(n)$ holds for every $n$, and $P(n)$ follows from $Q(n + 1)$.

::: definition Prime number
A natural number $p$ is **prime** if $p \ge 2$ and its only divisors are 1 and $p$. A **prime factor** of
$n$ is a prime number that divides $n$.
:::

::: example Every number from 2 on has a prime factor
**Claim.** Every natural number $n \ge 2$ has a prime factor.

**Proof** by strong induction on $n$, with $P(n)$: "if $n \ge 2$, then $n$ has a prime factor". Let
$n \ge 2$, and assume $P(m)$ for every $m < n$.

- If $n$ is prime, $n$ itself is a prime factor of $n$.
- If $n$ is not prime, it has a divisor $a$ with $1 < a < n$. By the IH, $P(a)$ holds, and since
  $a \ge 2$, $a$ has a prime factor $p$. As $p$ divides $a$ and $a$ divides $n$, $p$ divides $n$.

For $n < 2$ there is nothing to prove. By strong induction, $P(n)$ holds for every $n$.
:::

Ordinary induction would not help here: knowing that $n - 1$ has a prime factor says nothing about $n$.
The divisor $a$ can be any number below $n$, so the proof needs $P$ for all of them.

::: example A bound on the Fibonacci numbers
**Claim.** For every natural number $n$, $\mathit{fib}(n) < 2^n$.

**Proof** by strong induction on $n$. Assume $\mathit{fib}(m) < 2^m$ for every $m < n$.

- $n = 0$: $\mathit{fib}(0) = 0 < 1 = 2^0$.
- $n = 1$: $\mathit{fib}(1) = 1 < 2 = 2^1$.
- $n \ge 2$: then $n = k + 2$, and both $k$ and $k + 1$ are smaller than $n$. By the IH for both,

$$
\mathit{fib}(k+2) = \mathit{fib}(k) + \mathit{fib}(k+1) < 2^k + 2^{k+1} < 2^{k+1} + 2^{k+1} = 2^{k+2}.
$$
:::

::: isabelle
Plain induction on `n` fails, for the reason given above:

```isabelle fails
lemma "fib n < 2 ^ n"
  by (induction n) auto
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. ⋀n. fib n < 2 ^ n ⟹ fib (Suc n) < 2 * 2 ^ n
```

The IH speaks about `fib n` only, but `fib (Suc n)` is the sum of the two values before it, and it cannot
even be unfolded: `Suc n` matches neither `Suc 0` nor `Suc (Suc m)` as long as nothing is known about
`n`. (`2 ^ n` is the library's power function, defined by recursion on `n` like `pow`; it has the same
values as `pow 2 n`.)

The repair is the trick that derived strong induction from ordinary induction: prove a stronger
statement that carries the two previous values along.

```isabelle
lemma fib_bound: "fib n < 2 ^ n ∧ fib (Suc n) < 2 ^ Suc n"
  apply (induction n)
```

```output state
proof (prove)
goal (2 subgoals):
 1. fib 0 < 2 ^ 0 ∧ fib (Suc 0) < 2 ^ Suc 0
 2. ⋀n. fib n < 2 ^ n ∧ fib (Suc n) < 2 ^ Suc n ⟹
        fib (Suc n) < 2 ^ Suc n ∧ fib (Suc (Suc n)) < 2 ^ Suc (Suc n)
```

Now the IH contains both `fib n` and `fib (Suc n)`, which is exactly what `fib (Suc (Suc n))` needs:

```isabelle
  apply auto
  done
```

Module 11 shows two more direct ways: induction that follows the recursion of `fib` (`fib.induct`), and
strong induction itself (`less_induct`).
:::

Strong induction is induction along the order $<$ on $\N$, and it works because that order is
well-founded. The same holds for every well-founded relation $R$ (Module 4): if $P(x)$ follows whenever
$P(y)$ holds for every $y$ with $(y, x) \in R$, then $P(x)$ holds for every $x$. This is called
**well-founded induction**. Structural induction is a special case, with $R$ relating `xs` to `x # xs`,
and `l` and `r` to `Node l x r`.

## Termination {#termination}

Every function so far stops on every input: each recursive call works on a smaller argument, and
arguments cannot get smaller forever. This section explains why Isabelle insists on that, and how it
checks it.

### Why recursion must terminate {#why-terminate}

In a programming language you can write a function that never stops; calling it makes the program hang,
and that is all. In logic the danger is worse. Look at this "definition":

$$
\mathit{bad}(n) = \mathit{bad}(n) + 1
$$

If there were a function $\mathit{bad}$ on $\N$ with this property, subtracting $\mathit{bad}(n)$ from both
sides would give $0 = 1$. An equation in a definition is a claim that something is true, and this one is
false for every function. If Isabelle accepted it as it stands, you could prove $0 = 1$, and from a false
statement every statement follows (Module 2): every theorem would become worthless.

So Isabelle never takes the equations of a `fun` on trust. It constructs a function from them and then
proves the equations as theorems, and that proof needs an argument that the recursion terminates. `fun`
searches for one automatically. For `bad` there is none:

```isabelle fails
fun bad :: "nat ⇒ nat" where
  "bad n = bad n + 1"
```

```output
consts
  bad :: "nat ⇒ nat"

*** Unfinished subgoals:
*** (a, 1, <):
***  1. False
*** Calls:
***   a) n ~> n
*** Measures:
***   1) size
*** Result matrix:
***     1
*** a:  <=
***
*** Could not find lexicographic termination order.
```

The first lines only announce the name and type of the new constant; the definition as a whole fails,
and `bad` is not defined afterwards. Read the error from the bottom up. Isabelle could not find a
termination order. It looked at one recursive call, `a)`, from `n` to `n` (the arrow `~>` means "calls"),
and at one measure, `size`, which for a number is the number itself. To accept the definition it must
show that the measure gets strictly smaller (`<`) at the call; for this call that means proving `False`,
which cannot be done. The result matrix records the best it found: the measure stays the same or gets
smaller (`<=`), which is not enough.

::: keyidea
In HOL every function is **total**: it has a value for every argument. A recursive definition whose
recursion terminates determines exactly one function, so it is safe. `fun` proves termination before it
accepts a definition, and so a definition made with `fun` can never make the logic inconsistent.
:::

Not every non-terminating equation is contradictory: every function satisfies $f(n) = f(n)$. But Isabelle
does not try to tell harmless cases from harmful ones; it accepts a recursive definition by `fun` only
when it can prove termination.

### Measures {#measures}

::: definition Measure
A **measure** for a recursive definition is a function $m$ from the arguments to $\N$ that gets strictly
smaller at every recursive call: whenever the definition of $f(a)$ calls $f(b)$, $m(b) < m(a)$.
:::

::: fact Termination by a measure
If a recursive definition has a measure, every evaluation of the function terminates.
:::

The reason is the well-foundedness of $\N$ from Section 5.3: an evaluation that never stopped would make
infinitely many nested calls with arguments $a_0, a_1, a_2, \dots$, and then
$m(a_0) > m(a_1) > m(a_2) > \cdots$ would be an infinite descending chain of natural numbers. There is
none.

| Functions | Recursive calls | Measure |
|---|---|---|
| `sum_upto`, `fac` | `f (Suc n)` calls `f n` | the number |
| `fib` | `fib (Suc (Suc n))` calls `fib n` and `fib (Suc n)` | the number |
| `pow` | `pow x (Suc n)` calls `pow x n` | the second argument |
| `len`, `reverse`, `lsum` | `f (x # xs)` calls `f xs` | the length of the list |
| `app` | `app (x # xs) ys` calls `app xs ys` | the length of the first list |
| `mirror`, `nodes`, `tips` | `f (Node l x r)` calls `f l` and `f r` | the number of nodes |

These are the termination orders that Isabelle reports. For `sum_upto` it said `size <*mlex*> {}`: the
measure is `size`, which for a number is the number itself, for a list its length and for a tree its
number of nodes. Read `f <*mlex*> {}` as "the measure `f`". For the list functions Isabelle writes
`length` instead of `size`, for example `length <*mlex*> {}` for `reverse`.

Sometimes no single measure decreases at every call. The Ackermann function is a famous example:

```isabelle
fun ack :: "nat ⇒ nat ⇒ nat" where
  "ack 0 n = Suc n"
| "ack (Suc m) 0 = ack m 1"
| "ack (Suc m) (Suc n) = ack m (ack (Suc m) n)"
```

```output
consts
  ack :: "nat ⇒ nat ⇒ nat"

Found termination order:
  "(λp. size (fst p)) <*mlex*> (λp. size (snd p)) <*mlex*> {}"
```

In the call from `ack (Suc m) (Suc n)` to `ack (Suc m) n` the first argument stays the same, and in the
outer call `ack m (ack (Suc m) n)` the second argument can be any number at all. But at every call the
pair of arguments gets smaller in the **lexicographic order**, the order of a dictionary: compare the
first arguments, and only if they are equal, compare the second ones. That is the termination order
Isabelle found. The arguments form a pair `p`; `fst p` and `snd p` are its first and second components;
and `λp. size (fst p)` (read "lambda p") is the function that maps `p` to the size of its first
component. The order uses that measure first and the size of the second argument after it. The
lexicographic order on pairs of natural numbers is well-founded too, so it proves termination in the same
way as a measure does.

The Ackermann function is famous because it grows so fast. Small arguments give small values:

```isabelle
value "ack 2 3"
```

```output
"9"
  :: "nat"
```

But `ack 4 2` is already $2^{65536} - 3$, a number with 19,729 decimal digits.

### When `fun` cannot prove termination {#no-measure}

A beginner's version of the sum:

```isabelle fails
fun sum_down :: "nat ⇒ nat" where
  "sum_down n = sum_down (n - 1) + n"
```

```output
consts
  sum_down :: "nat ⇒ nat"

*** Unfinished subgoals:
*** (a, 1, <):
***  1. ⋀n. n - Suc 0 < n
*** Calls:
***   a) n ~> n - 1
*** Measures:
***   1) size
*** Result matrix:
***     1
*** a:  <=
***
*** Could not find lexicographic termination order.
```

This time the unfinished subgoal is `n - Suc 0 < n`, that is $n - 1 < n$, and it is false for $n = 0$.
Subtraction on natural numbers cannot go below 0, so `0 - 1 = 0` in Isabelle, and `sum_down 0` would call
`sum_down 0` for ever. The definition forgot its base case. Unlike `bad`, it is not contradictory: for
$n = 0$ it says `sum_down 0 = sum_down 0 + 0`, which holds whatever the value of `sum_down 0` is. But it
leaves that value open, and `fun` rejects the definition all the same, because it cannot prove
termination. Pattern matching, as in `sum_upto`, prevents this mistake: there the recursive equation
applies only to `Suc n`, where `n` really is smaller.

Sometimes a function does terminate, but `fun` cannot see why. It tries only measures built from the sizes
of the arguments, combined lexicographically. A function that counts upwards, such as
`sum_from i n = (if n < i then 0 else i + sum_from (i + 1) n)`, terminates because $n + 1 - i$ decreases
at every call, yet neither argument gets smaller, so `fun` gives up. For such definitions Isabelle has
the more general command `function`, with which you supply the measure yourself; Module 8 returns to
termination.

::: note
For some functions nobody knows a measure. The Collatz function counts the steps of a famous process:

$$
\mathit{collatz}(n) = \begin{cases}
0 & \text{if } n \le 1\\
\mathit{collatz}(n / 2) + 1 & \text{if } n \text{ is even}\\
\mathit{collatz}(3n + 1) + 1 & \text{otherwise}
\end{cases}
$$

Computers have checked that it terminates for every $n$ up to astronomically large bounds, but whether it
terminates for every $n$ is an open problem, the Collatz conjecture, posed by Lothar Collatz in 1937.
Isabelle's `fun` rejects this definition, and nobody can supply a termination proof by hand either:
such a proof would settle the conjecture.
:::

## Invariants {#invariants}

Induction proves facts about recursive functions. It also proves facts about processes that run step by
step, such as loops, protocols and machines. The tool for that is an invariant.

::: definition Invariant
An **invariant** of a process is a property of its state that holds in the initial state and is
**preserved** by every step: if it holds before a step, it holds after the step.
:::

::: fact Invariants hold in every reachable state
If $I$ is an invariant of a process, then $I$ holds in every state that the process reaches, after any
number of steps.
:::

The proof is by induction on the number of steps $k$. After 0 steps, the process is in its initial state,
where $I$ holds. If $I$ holds after $k$ steps, the next step preserves it, so $I$ holds after $k + 1$ steps.

### A loop {#loop-invariant}

This program sums the numbers from 1 to `n` with a loop:

```text
i := 0
s := 0
while i < n:
    i := i + 1
    s := s + i
return s
```

**Claim.** The loop returns $\mathit{sum\_upto}(n)$. Take as invariant
$I$: "$s = \mathit{sum\_upto}(i)$ and $i \le n$".

- **Initially** $i = 0$ and $s = 0 = \mathit{sum\_upto}(0)$, and $0 \le n$.
- **Preserved.** Assume $I$ and that the loop runs once more, so $i < n$. Afterwards $i' = i + 1$ and
  $s' = s + (i + 1) = \mathit{sum\_upto}(i) + (i + 1) = \mathit{sum\_upto}(i + 1) = \mathit{sum\_upto}(i')$,
  by sum_upto.2; and $i' \le n$ because $i < n$.
- **At the end** the condition $i < n$ is false, so $i \ge n$; together with $i \le n$ this gives $i = n$,
  and the invariant says $s = \mathit{sum\_upto}(n)$.

With Example 5.1, the loop returns $n(n+1)/2$. It also terminates: $n - i$ is a natural number that
decreases by 1 at every step, a measure, which for loops is called a **variant**. Notice that the
invariant needs the part $i \le n$, although the claim is only about $s$: without it, the exit condition
$i \ge n$ would not give $i = n$. Finding an invariant that is strong enough is the creative part of such
a proof. This way of reasoning about loops goes back to Robert Floyd (1967) and Tony Hoare (1969).

### A machine {#machine-invariant}

A ticket machine accepts 5-cent and 10-cent coins and returns every other coin. Its state is the credit,
which starts at 0. Can the credit ever be exactly 12 cents? Whatever the customers do, the answer is no,
and an invariant shows why. Take $I$: "the credit is a multiple of 5".

- **Initially** the credit is 0, a multiple of 5.
- **Preserved.** A 5-cent or 10-cent coin adds 5 or 10, which keeps the credit a multiple of 5. Any other
  coin is returned, and the credit does not change.

So every credit the machine reaches is a multiple of 5, and 12 is not. The argument covers every sequence
of coins, of any length: infinitely many runs, which no amount of testing could try.

::: isabelle
Describe a run by the list of coins inserted, latest first, and compute the credit by recursion over the
list:

```isabelle
fun insert_coin :: "nat ⇒ nat ⇒ nat" where
  "insert_coin c m = (if c = 5 ∨ c = 10 then m + c else m)"

fun credit :: "nat list ⇒ nat" where
  "credit [] = 0"
| "credit (c # cs) = insert_coin c (credit cs)"

value "credit [10, 3, 5]"
```

```output
"15"
  :: "nat"
```

The 3-cent coin was returned. `m mod 5` is the remainder of `m` divided by 5 (the `%` operator of many
programming languages), so the invariant is `credit cs mod 5 = 0`, for every run `cs`:

```isabelle
lemma credit_mod: "credit cs mod 5 = 0"
  apply (induction cs)
```

```output state
proof (prove)
goal (2 subgoals):
 1. credit [] mod 5 = 0
 2. ⋀a cs. credit cs mod 5 = 0 ⟹ credit (a # cs) mod 5 = 0
```

The base case is the initial state; the step says that one more coin `a` preserves the invariant.
Induction over the list of coins is induction over the number of steps.

```isabelle
  apply auto
  done
```
:::

Module 13 makes this its main method. It describes systems as state machines, defines their reachable
states in Isabelle, and proves safety properties with invariants. When a property is not an invariant by
itself, the remedy is the one you used for the Fibonacci bound in Section 5.6: prove a stronger statement
that is. For more practice with induction proofs and loop invariants, see
[Proof methods, induction, and invariants](../math/module_04_EN.html) in the Mathematical Foundations
series.

## What you learned {#summary}

- Natural numbers are built from `0` and `Suc`, lists from `[]` and `#`, and trees from `Tip` and
  `Node`. A recursive definition gives one equation for each way a value can be built, and calls the
  function only on smaller arguments. `datatype` defines new types of this kind.
- Evaluation is rewriting with the defining equations. The order of rewriting changes the intermediate
  terms but not the value. Clear definitions can be slow programs: the naive `fib` repeats work.
- **Mathematical induction:** prove $P(0)$, and $P(n) \imp P(n+1)$ for an arbitrary $n$; then $P(n)$
  holds for every $n$. Both parts are needed, and the step must work for every $n$.
- **Structural induction** does the same for lists and trees, with one IH per smaller part. **Strong
  induction** may assume $P(m)$ for every $m < n$. All of them rest on well-founded orders.
- In Isabelle, `apply (induction n)` turns a goal into the base case and the step. Read `⋀n.` as "for an
  arbitrary n" and `⟹` as "implies"; the IH stands to the left of `⟹`. `by (induction xs) auto` proves
  what follows from the definitions and the IH. When it gets stuck, induct on the argument the function
  takes apart, or prove the lemma that the stuck goal needs and declare it `[simp]`.
- `fun` accepts a recursive definition only after proving that it terminates, with a measure or a
  lexicographic combination of measures that decreases at every call. Without that check, a "definition"
  such as $f(n) = f(n) + 1$ could prove $0 = 1$.
- An **invariant** holds initially and is preserved by every step, so by induction on the number of steps
  it holds in every reachable state.

## Exercises {#exercises}

:::: exercise Evaluate by hand {#ex-5-1} ★
Evaluate each term by rewriting, one equation per step, and name the equation used at each step:

1. `pow 3 2`
2. `app [a] [b, c]`
3. `mirror (Node Tip a (Node Tip b Tip))`

Then check the results with `value`, and with the stepper in Section 5.2.

::: solution
```text
  pow 3 2
= pow 3 1 * 3                   by pow.2, since 2 = Suc 1
= pow 3 0 * 3 * 3               by pow.2, since 1 = Suc 0
= 1 * 3 * 3                     by pow.1
= 3 * 3                         arithmetic
= 9                             arithmetic
```

```text
  app [a] [b, c]
= a # app [] [b, c]             by app.2
= a # [b, c]                    by app.1
```

which is the list `[a, b, c]`.

```text
  mirror (Node Tip a (Node Tip b Tip))
= Node (mirror (Node Tip b Tip)) a (mirror Tip)              by mirror.2
= Node (Node (mirror Tip) b (mirror Tip)) a (mirror Tip)     by mirror.2
= Node (Node Tip b (mirror Tip)) a (mirror Tip)              by mirror.1
= Node (Node Tip b Tip) a (mirror Tip)                       by mirror.1
= Node (Node Tip b Tip) a Tip                                by mirror.1
```

The stepper takes the same steps. With `value`:

```isabelle
value "pow 3 2"
value "app [a] [b, c]"
value "mirror (Node Tip a (Node Tip b Tip))"
```

```output all
"9"
  :: "nat"

"[a, b, c]"
  :: "'a list"

"Node (Node Tip b Tip) a Tip"
  :: "'a tree2"
```
:::
::::

:::: exercise What is wrong with this proof? {#ex-5-2} ★
**Claim:** for every natural number $n$, the number $n^2 + n$ is odd.

**Proof:** assume that $n^2 + n$ is odd. Then
$(n + 1)^2 + (n + 1) = (n^2 + n) + 2(n + 1)$ is an odd number plus an even number, so it is odd. By
induction, $n^2 + n$ is odd for every $n$.

Find the mistake. Is the claim true?

::: solution
The induction step is correct, but the proof has no base case, and the base case is false:
$0^2 + 0 = 0$ is even. The claim is false for every $n$: $n^2 + n = n(n + 1)$ is the product of two
consecutive numbers, one of which is even, so $n^2 + n$ is always even. The step shows only that if
$n^2 + n$ were odd for one $n$, it would be odd for all larger $n$ too. Without a first domino, nothing
falls.
:::
::::

:::: exercise The sum of an append {#ex-5-3} ★★
Prove on paper that `lsum (app xs ys) = lsum xs + lsum ys` for all lists of numbers `xs` and `ys`. On which
variable do you do induction? Then write down the two subgoals you expect after `apply (induction xs)`,
compare them with Isabelle's, and finish the proof in Isabelle.

::: solution
Induction on `xs`, because `app` takes its first argument apart. Base case:
`lsum (app [] ys) = lsum ys = 0 + lsum ys = lsum [] + lsum ys`, by app.1 and lsum.1. Step, with the IH
`lsum (app xs ys) = lsum xs + lsum ys`:

```text
  lsum (app (x # xs) ys)
= lsum (x # app xs ys)           by app.2
= x + lsum (app xs ys)           by lsum.2
= x + (lsum xs + lsum ys)        by the IH
= (x + lsum xs) + lsum ys        arithmetic
= lsum (x # xs) + lsum ys        by lsum.2
```

In Isabelle:

```isabelle
lemma lsum_app: "lsum (app xs ys) = lsum xs + lsum ys"
  apply (induction xs)
```

```output state
proof (prove)
goal (2 subgoals):
 1. lsum (app [] ys) = lsum [] + lsum ys
 2. ⋀a xs.
       lsum (app xs ys) = lsum xs + lsum ys ⟹
       lsum (app (a # xs) ys) = lsum (a # xs) + lsum ys
```

The subgoals are the base case and the step above, with `a` for `x`.

```isabelle
  apply auto
  done
```
:::
::::

:::: exercise Odd numbers {#ex-5-4} ★★
The sum of the first $n$ odd numbers, $1 + 3 + \dots + (2n - 1)$, is defined by
$\mathit{odds}(0) = 0$ and $\mathit{odds}(n + 1) = \mathit{odds}(n) + (2n + 1)$. Prove by induction that
$\mathit{odds}(n) = n^2$. Then define `odds` in Isabelle and prove the same lemma there.

::: solution
Base case: $\mathit{odds}(0) = 0 = 0^2$. Step: assume $\mathit{odds}(n) = n^2$. Then
$\mathit{odds}(n + 1) = \mathit{odds}(n) + 2n + 1 = n^2 + 2n + 1 = (n + 1)^2$, using the definition and
then the IH. By induction, $\mathit{odds}(n) = n^2$ for every $n$.

```isabelle
fun odds :: "nat ⇒ nat" where
  "odds 0 = 0"
| "odds (Suc n) = odds n + (2 * n + 1)"

lemma odds_square: "odds n = n * n"
  by (induction n) auto
```
:::
::::

:::: exercise Paying with two coins {#ex-5-5} ★★
Show by strong induction that every amount of at least 12 cents can be paid exactly with 4-cent and
5-cent coins. Hint: deal with 12, 13, 14 and 15 directly; for larger amounts, look at the amount minus 4.

::: solution
Let $P(n)$ be: "if $n \ge 12$, then $n = 4a + 5b$ for some natural numbers $a$ and $b$". Let $n \ge 12$
and assume $P(m)$ for every $m < n$.

- $12 = 4 \cdot 3$, $13 = 4 \cdot 2 + 5$, $14 = 4 + 5 \cdot 2$ and $15 = 5 \cdot 3$.
- If $n \ge 16$, then $12 \le n - 4 < n$, so by the IH $n - 4 = 4a + 5b$ for some $a$ and $b$, and
  $n = 4(a + 1) + 5b$.

By strong induction, $P(n)$ holds for every $n$. The step reaches four numbers back, not one, which is
why strong induction is the convenient tool here. The bound 12 is the best possible: 11 cannot be paid,
because $11 = 4a + 5b$ has no solution in natural numbers.
:::
::::

:::: exercise Breaking chocolate {#ex-5-6} ★★
A chocolate bar has $m \times n$ squares. You break it into single squares. Each break takes one piece and
splits it into two pieces along a line between the squares. Find an invariant that relates the number of
pieces to the number of breaks made so far, and use it to show that every way of breaking the bar takes
exactly $m \cdot n - 1$ breaks.

::: solution
Invariant: *pieces = breaks + 1*. Initially there is 1 piece and there have been 0 breaks. Each break
turns one piece into two, so it adds 1 to both numbers and preserves the equation. By the invariant, when
the bar is in $m \cdot n$ single squares, the number of breaks is $m \cdot n - 1$, in whatever order you
break. The process also terminates: $m \cdot n - \text{pieces}$ is a measure, a natural number that
decreases by 1 at every break.
:::
::::

:::: exercise In-order traversal {#ex-5-7} ★★★
The function `inorder` lists the elements of a tree from left to right, using the library's `@`:

```text
inorder Tip = []
inorder (Node l x r) = inorder l @ [x] @ inorder r
```

1. Prove on paper that `inorder (mirror t) = rev (inorder t)`. You may use the library facts
   `rev (xs @ ys) = rev ys @ rev xs`, `(xs @ ys) @ zs = xs @ (ys @ zs)` and `rev [x] = [x]`.
2. Define `inorder` in Isabelle, and prove `length (inorder t) = nodes t` and
   `inorder (mirror t) = rev (inorder t)`.

::: solution
1. By structural induction on `t`. Base case: `inorder (mirror Tip) = inorder Tip = [] = rev []`, which is
   `rev (inorder Tip)`. Step, with the IHs `inorder (mirror l) = rev (inorder l)` and
   `inorder (mirror r) = rev (inorder r)`:

   ```text
     inorder (mirror (Node l x r))
   = inorder (Node (mirror r) x (mirror l))            by mirror.2
   = inorder (mirror r) @ [x] @ inorder (mirror l)     by inorder.2
   = rev (inorder r) @ [x] @ rev (inorder l)           by the two IHs
   = rev (inorder r) @ rev [x] @ rev (inorder l)       since rev [x] = [x]
   = rev (inorder l @ [x] @ inorder r)                 by the law for rev of @, twice
   = rev (inorder (Node l x r))                        by inorder.2
   ```

   The step "twice" also uses associativity of `@` to regroup the three parts.

2. In Isabelle:

   ```isabelle
   fun inorder :: "'a tree2 ⇒ 'a list" where
     "inorder Tip = []"
   | "inorder (Node l x r) = inorder l @ [x] @ inorder r"

   lemma length_inorder: "length (inorder t) = nodes t"
     by (induction t) auto

   lemma inorder_mirror: "inorder (mirror t) = rev (inorder t)"
     by (induction t) auto
   ```

   Both proofs go through with `auto` because the library has already proved the facts about `@`, `rev`
   and `length` that they need, such as `rev_append` and `length_append`, and declared them as
   simplification rules.
:::
::::

:::: exercise Which definitions terminate? {#ex-5-8} ★★★
For each definition, decide whether every evaluation terminates. If it does, give a measure; if not,
give an argument on which it runs for ever. Then predict whether `fun` accepts the definition, and check
in Isabelle.

1. `half 0 = 0`, `half (Suc 0) = 0` and `half (Suc (Suc n)) = half n + 1`
2. `nbits n = (if n = 0 then 0 else nbits (n div 2) + 1)`
3. `nbits2 n = nbits2 (n div 2) + 1`
4. `count_up i n = (if i < n then count_up (i + 1) n + 1 else 0)`

(`n div 2` is $n / 2$ rounded down.)

::: solution
1. Terminates, with measure $n$: the call goes from $n + 2$ to $n$. `fun` accepts it.
2. Terminates, with measure $n$: the recursive call happens only when $n \ne 0$, and then
   $n \mathbin{\mathrm{div}} 2 < n$. `fun` accepts it, because it takes the condition of the `if` into
   account when it compares the arguments.

   ```isabelle
   fun half :: "nat ⇒ nat" where
     "half 0 = 0"
   | "half (Suc 0) = 0"
   | "half (Suc (Suc n)) = half n + 1"

   fun nbits :: "nat ⇒ nat" where
     "nbits n = (if n = 0 then 0 else nbits (n div 2) + 1)"
   ```

   ```output all
   consts
     half :: "nat ⇒ nat"

   Found termination order: "size <*mlex*> {}"

   consts
     nbits :: "nat ⇒ nat"

   Found termination order: "size <*mlex*> {}"
   ```

3. Does not terminate for $n = 0$: `0 div 2 = 0`, so `nbits2 0` calls `nbits2 0` again. Worse, the
   equation for $n = 0$ reads `nbits2 0 = nbits2 0 + 1`, the contradiction of `bad`. `fun` rejects it:

   ```isabelle fails
   fun nbits2 :: "nat ⇒ nat" where
     "nbits2 n = nbits2 (n div 2) + 1"
   ```

   ```output
   consts
     nbits2 :: "nat ⇒ nat"

   *** Unfinished subgoals:
   *** (a, 1, <):
   ***  1. ⋀n. n div 2 < n
   *** Calls:
   ***   a) n ~> n div 2
   *** Measures:
   ***   1) size
   *** Result matrix:
   ***     1
   *** a:  <=
   ***
   *** Could not find lexicographic termination order.
   ```

   The unfinished subgoal `n div 2 < n` is false for $n = 0$.

4. Terminates, with measure $n - i$, which decreases by 1 at every call while $i < n$. But neither
   argument gets smaller, so `fun` cannot find a termination order: the same situation as `sum_from` in
   Section 5.7. Module 8 returns to such definitions.

   ```isabelle fails
   fun count_up :: "nat ⇒ nat ⇒ nat" where
     "count_up i n = (if i < n then count_up (i + 1) n + 1 else 0)"
   ```

   ```output
   consts
     count_up :: "nat ⇒ nat ⇒ nat"

   *** Unfinished subgoals:
   *** (a, 1, <):
   ***  1. ⋀i n. i < n ⟹ False
   *** (a, 2, <):
   ***  1. ⋀i n. i < n ⟹ False
   *** (a, 2, <=):
   ***  1. ⋀i n. i < n ⟹ False
   *** (a, 3, <):
   ***  1. ⋀i n. i < n ⟹ False
   *** Calls:
   ***   a) (i, n) ~> (i + 1, n)
   *** Measures:
   ***   1) λp. size (snd p)
   ***   2) λp. size (fst p)
   ***   3) size
   *** Result matrix:
   ***     1  2  3
   *** a:  <= ?  <=
   ***
   *** Could not find lexicographic termination order.
   ```
:::
::::

## Check yourself {#quiz}

```quiz
? In the induction step of a proof of $P(n)$ for all $n$, what may you assume?
- [ ] $P(n + 1)$
- [x] $P(n)$, for an arbitrary $n$, in order to prove $P(n + 1)$
- [ ] $P(n)$ for every $n$
- [ ] Nothing: the step must be proved without assumptions
> The induction hypothesis is $P(n)$ for the $n$ at hand. Assuming $P(n + 1)$, or $P(n)$ for every $n$, would assume what you set out to prove.

? After `apply (induction xs)`, Isabelle shows the subgoal `⋀a xs. P xs ⟹ P (a # xs)`. What does it say?
- [ ] $P$ holds for `a` and for `xs`
- [ ] `P xs` and `P (a # xs)` are equivalent
- [x] For arbitrary `a` and `xs`: if `P xs` holds, then `P (a # xs)` holds
- [ ] There are `a` and `xs` such that `P (a # xs)` holds
> `⋀` makes `a` and `xs` arbitrary. To the left of `⟹` is the induction hypothesis, to the right the statement to prove.

? Why does Isabelle insist that every function defined with `fun` terminates?
- [x] Otherwise a definition such as `f n = f n + 1` could be used to prove a false statement such as `0 = 1`
- [ ] Because `value` would run for ever
- [ ] Because non-terminating functions cannot be compiled
- [ ] Because termination makes the simplifier faster
> In HOL every function is total, and the equations of a definition are claims of truth. A recursion that does not terminate may have no solution at all, and accepting such equations would make the logic inconsistent. `fun` does not try to tell such cases from harmless ones, so it insists on a termination proof.

? Which measure shows that `app` terminates?
- [ ] The length of the second argument
- [ ] The sum of the elements
- [x] The length of the first argument
- [ ] The length of the result
> `app (x # xs) ys` calls `app xs ys`: the first argument loses an element, while the second stays the same.

? To prove $P(n)$ you need $P(m)$ for some $m$ that can be any number smaller than $n$. Which proof method fits?
- [ ] Ordinary induction, because every $m < n$ is reached from 0
- [ ] Structural induction on lists
- [ ] A proof by cases on whether $n$ is even
- [x] Strong induction
> Strong induction lets you assume $P(m)$ for every $m < n$, not only $P(n - 1)$.

? `by (induction xs) auto` fails, and the remaining goal contains `reverse (app (reverse xs) [a])`. What is usually the best next step?
- [ ] Do induction on a variable that does not occur in the goal
- [x] Prove a lemma about how `reverse` acts on `app`, declare it `[simp]`, and try again
- [ ] Replace `auto` by `simp`
- [ ] Give up: the statement must be false
> The stuck goal shows which fact is missing. With the lemma `reverse (app xs ys) = app (reverse ys) (reverse xs)` as a simplification rule, the proof goes through.
```
