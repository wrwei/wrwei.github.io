---
title: Sets, relations and functions
part: 1
lead: Describe collections with sets, connect their elements with relations, find the states a system can reach, compare the sizes of sets with functions, and see why some infinite sets are larger than others, with examples and proofs checked in Isabelle.
minutes: 210
needs: Modules 1–3
goals:
  - Describe sets by listing and by set-builder notation, and prove set laws by turning them into propositional logic
  - Decide whether a relation is reflexive, symmetric, antisymmetric, transitive or total, with a witness whenever a property fails
  - Recognise equivalence relations and their partitions, partial orders and their Hasse diagrams, and well-founded relations
  - Compute the closures of a relation and use them to find the states a system can reach
  - Classify functions as injective, surjective or bijective, and use them to compare the sizes of sets
  - Explain the pigeonhole principle and Cantor's diagonal argument, and check both in Isabelle
imports: Main
---

## Sets {#sets}

Specifications talk about collections all the time: the users who may read a file, the states a system
can reach, the messages in transit. Mathematics has one notion for all of them, the **set**, and many
specification languages are built on it: Z and B on set theory, Alloy on relations, TLA+ on sets and
functions. This module builds the vocabulary in layers: sets, then **relations**, which connect
elements, then **functions**, and finally the sizes of sets. Everything rests on the logic of Modules 2
and 3; you will see that the laws of sets are laws of logic in disguise. For more practice with the
mathematics, see "Sets, relations, and discrete structures" in
[Mathematical Foundations](../math/module_03_EN.html).

### Elements and set-builder notation {#sets-notation}

A set is a collection of things, called its **elements**, determined entirely by which things belong
to it. $x \in A$ reads "x is an element of A", or "x is in A"; $x \notin A$ reads
"x is not in A" and abbreviates $\lnot (x \in A)$.

There are two ways to describe a set. A **listing** names its elements between braces:
$\{2, 3, 5, 7\}$. **Set-builder notation** describes them by a property: $\{x.\; P\,x\}$ reads "the set
of all x such that P x". The primes below 10 form the set $\{x.\; x \text{ is prime} \land x < 10\}$,
which is $\{2, 3, 5, 7\}$ again. Many books write $\{x \mid P(x)\}$; this series writes
$\{x.\; P\,x\}$, as Isabelle does. A common variant takes the elements from a given set:
$\{x \in A.\; P\,x\}$ means $\{x.\; x \in A \land P\,x\}$.

Set-builder notation connects sets with the predicates of Module 3. Something belongs to
$\{x.\; P\,x\}$ exactly when it has the property $P$:

$$
a \in \{x.\; P\,x\} \iff P\,a
$$

So a set and a predicate carry the same information. In Isabelle/HOL, a set of elements of some type
is, in effect, a predicate on that type.

::: definition Set
A **set** is a collection of elements; $x \in A$ means that $x$ is an element of $A$. A set can be
given by a **listing** such as $\{1, 2, 3\}$, or by **set-builder notation** $\{x.\; P\,x\}$, the set
of all $x$ for which $P\,x$ holds. In Isabelle/HOL every set has an element type: a set of natural
numbers has type `nat set`, and all its elements are natural numbers.
:::

When are two sets equal? When they have the same elements. Nothing else counts: not the order in which
you list them, not how you describe them.

::: definition Extensionality
Two sets are **equal** when they have the same elements:

$$
A = B \iff (\forall x.\; x \in A \iff x \in B)
$$
:::

So $\{1, 2, 3\} = \{3, 1, 2\} = \{1, 1, 2, 3\}$, and $\{x.\; x \in \Z \land x^2 = 1\} = \{-1, 1\}$.

::: definition Subset, empty set, universe
$A$ is a **subset** of $B$, written $A \subseteq B$, when every element of $A$ is an element of $B$:
$\forall x.\; x \in A \imp x \in B$. It is a **proper subset**, $A \subset B$, when also $A \neq B$.
The **empty set** $\emptyset$ has no elements; Isabelle writes it `{}`. The **universe** contains every
element of the type; Isabelle calls it `UNIV`.
:::

::: fact Subsets and equality
For all sets $A$ and $B$:

1. $\emptyset \subseteq A$ and $A \subseteq A$.
2. $A = B \iff A \subseteq B \land B \subseteq A$.
:::

For the first, $x \in \emptyset$ is false for every $x$, so $x \in \emptyset \imp x \in A$ is vacuously
true (Module 2); vacuous truth will come back in this module. And $x \in A \imp x \in A$ holds whatever
$x$ is. The second combines extensionality with the law $(p \iff q) \iff (p \imp q) \land (q \imp p)$.
It is also how you usually prove two sets equal: show that each is a subset of the other.

Because HOL is typed (Module 3), a universe is always the universe of one type: `UNIV :: bool set` is
$\{\mathit{True}, \mathit{False}\}$, and `UNIV :: nat set` contains all natural numbers. There is no set
of absolutely everything, and Section 4.7 shows why that is a good thing.

::: example Who may do what
A file server has the users alice, bob, carol and dave. Those who may read a certain file form the set
$R = \{\mathit{alice}, \mathit{bob}, \mathit{carol}\}$, those who may write it
$W = \{\mathit{bob}, \mathit{dave}\}$, and the administrators $D = \{\mathit{bob}\}$. Then
$D \subseteq W$ holds: every administrator may write. The policy "writers must be able to read" is
the statement $W \subseteq R$, and it is violated, with dave as the witness: $\mathit{dave} \in W$ but
$\mathit{dave} \notin R$.
:::

::: pitfall
Keep $\in$ and $\subseteq$ apart. $1 \in \{1, 2\}$ is about an element, $\{1\} \subseteq \{1, 2\}$ about
a set, and both are true. In HOL, $\{1\} \in \{1, 2\}$ is not even false: it is a type error, because
the elements of $\{1, 2\}$ are numbers and $\{1\}$ is a set. In the same way, $\emptyset$ and
$\{\emptyset\}$ differ: the first has no elements, the second has one.
:::

### Operations on sets {#sets-ops}

Each operation on sets is a logical connective applied to membership.

::: definition Union, intersection, difference, complement
$$
\begin{aligned}
A \cup B &= \{x.\; x \in A \lor x \in B\} && \text{union}\\
A \cap B &= \{x.\; x \in A \land x \in B\} && \text{intersection}\\
A - B &= \{x.\; x \in A \land x \notin B\} && \text{difference}\\
-A &= \{x.\; x \notin A\} && \text{complement}
\end{aligned}
$$

$A$ and $B$ are **disjoint** when $A \cap B = \emptyset$. Isabelle writes `A ∪ B`, `A ∩ B`, `A - B`
and `- A`.
:::

Read them as "A union B", "A intersect B", "A minus B" and "the complement of A". The complement
contains everything of the type that is not in $A$. Figure 4.1 draws the four operations.

::: figure id=fig-04-1
The four operations as Venn diagrams. The rectangle is the universe, each circle a set, and the shaded
region the result. Under each diagram is the condition on $x$ that the region stands for.
:::

On the file server, $R \cap W = \{\mathit{bob}\}$ may read and write, $R - W$ (alice and carol) may only
read, and $W - R = \{\mathit{dave}\}$ is the user who violates the policy.

::: definition Power set
The **power set** $\pow(A)$ of a set $A$ is the set of all its subsets:
$\pow(A) = \{B.\; B \subseteq A\}$. Isabelle writes `Pow A`.
:::

$\pow(\{1, 2, 3\})$ has eight elements: $\emptyset$, $\{1\}$, $\{2\}$, $\{3\}$, $\{1, 2\}$, $\{1, 3\}$,
$\{2, 3\}$ and $\{1, 2, 3\}$. Choosing a subset means deciding for each element whether it is in or
out, so a set of $n$ elements has $2^n$ subsets. Power sets grow fast: a program with forty on-off
feature flags has $2^{40}$ configurations, more than a million million, one for each subset of the
flags.

### Set laws are logic in disguise {#sets-laws}

Since every operation is defined by a connective, every law of the connectives (Module 2) gives a law
of sets. Each law in the table also has a **dual**, with $\cup$ and $\cap$ swapped (and $\emptyset$ and
$\mathit{UNIV}$), that holds as well.

| Name | Law of sets | Law of logic behind it |
|---|---|---|
| Commutativity | $A \cup B = B \cup A$ | $p \lor q \iff q \lor p$ |
| Associativity | $A \cap (B \cap C) = (A \cap B) \cap C$ | $p \land (q \land r) \iff (p \land q) \land r$ |
| Distributivity | $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$ | $p \land (q \lor r) \iff (p \land q) \lor (p \land r)$ |
| De Morgan | $-(A \cup B) = -A \cap -B$ | $\lnot (p \lor q) \iff \lnot p \land \lnot q$ |
| Identity | $A \cup \emptyset = A$ | $p \lor \mathit{False} \iff p$ |
| Complement | $A \cup -A = \mathit{UNIV}$ | $p \lor \lnot p \iff \mathit{True}$ |
| Double complement | $-(-A) = A$ | $\lnot \lnot p \iff p$ |
| Absorption | $A \cup (A \cap B) = A$ | $p \lor (p \land q) \iff p$ |

::: fact Set laws from propositional laws
Translate an equation between sets built with $\cup$, $\cap$, $-$ and complement into propositional
logic: replace each set $A$ by a proposition $p_A$ that stands for "$x \in A$", $\cup$ by $\lor$, $\cap$
by $\land$, $A - B$ by $p_A \land \lnot p_B$, complement by $\lnot$, $\emptyset$ by $\mathit{False}$ and
$\mathit{UNIV}$ by $\mathit{True}$. The equation holds for all sets exactly when the two formulas are
equivalent, that is, when their biconditional is a tautology.
:::

If the formulas are equivalent, every $x$ is in the left set exactly when it is in the right one, and
extensionality makes the sets equal. If they are not, the truth table has a row where they differ: put
a single element $x$ into exactly those sets whose propositions are true in that row, and $x$ is in one
side but not the other. So a falsifying row is a counterexample with one element.

::: example Distributivity, step by step
To prove $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$, take any $x$ and rewrite its membership:

$$
\begin{aligned}
x \in A \cap (B \cup C)
  &\iff x \in A \land (x \in B \lor x \in C) && \text{definitions of } \cap \text{ and } \cup\\
  &\iff (x \in A \land x \in B) \lor (x \in A \land x \in C) && \text{distributivity of } \land \text{ over } \lor\\
  &\iff x \in (A \cap B) \cup (A \cap C) && \text{definitions of } \cap \text{ and } \cup
\end{aligned}
$$

This holds for every $x$, so the sets are equal by extensionality. The middle step is the only real
work, and it is propositional. Write $A$, $B$ and $C$ for "$x \in A$", "$x \in B$" and "$x \in C$",
and the build checks it with a truth table:

```truthtable
A ∧ (B ∨ C) ⟷ A ∧ B ∨ A ∧ C
A ∧ (B ∨ C)
A ∧ B ∨ A ∧ C
```

Each row is one region of a Venn diagram with three circles: the row where $A$ and $C$ are true and
$B$ is false is the region of the elements in $A$ and $C$ but not in $B$. A tautology says that the
two sides agree on every region.
:::

::: example A law that fails
Is $A - (B - C) = (A - B) - C$? Translate both sides:

```truthtable
A ∧ ¬(B ∧ ¬C) ⟷ A ∧ ¬B ∧ ¬C
A ∧ ¬(B ∧ ¬C)
A ∧ ¬B ∧ ¬C
```

The formulas differ in the two rows where $A$ and $C$ are true. Take the one with $B$ false: an element
$x$ in $A$ and $C$ but not in $B$. With $A = \{x\}$, $B = \emptyset$ and $C = \{x\}$, the left side is
$\{x\} - (\emptyset - \{x\}) = \{x\}$ and the right side is $(\{x\} - \emptyset) - \{x\} = \emptyset$.
Set difference, like the subtraction of numbers, is not associative.
:::

### Sets in Isabelle {#sets-isabelle}

::: isabelle
Type the new symbols with their names after a backslash, or with the abbreviations in the table.
Difference and complement use the ordinary minus sign `-`.

| Symbol | Type | Meaning |
|---|---|---|
| ∈ | `\in` or `:` | is an element of |
| ∉ | `\notin` or `~:` | is not an element of |
| ⊆ | `\subseteq` or `(=` | is a subset of |
| ∪ | `\union` or `Un` | union |
| ∩ | `\inter` or `Int` | intersection |

`value` computes with finite sets, as in Module 1:

```isabelle
value "{1, 2, 3} ∪ {3, 4 :: nat}"
```

```output
"{2, 1, 3, 4}"
  :: "nat set"
```

One annotation, `:: nat`, fixes the element type of the whole expression. Isabelle lists the elements
in whatever order its computation produced them; by extensionality the order does not matter.
Set-builder notation works when the elements come from a finite set. `{0..10}` is the set of numbers
from 0 to 10, and `mod` gives the remainder:

```isabelle
value "{x ∈ {0..10}. x mod 3 = (0::nat)}"
```

```output
"{0, 3, 6, 9}"
  :: "nat set"
```

The power set of a set of numbers is a set of sets of numbers, a `nat set set`:

```isabelle
value "Pow {1, 2, 3 :: nat}"
```

```output
"{{2, 3}, {2}, {}, {3}, {1, 3}, {1}, {1, 2}, {1, 2, 3}}"
  :: "nat set set"
```

Mixing up $\in$ and $\subseteq$ is a type error, as the pitfall above said:

```isabelle fails
value "{1} ∈ {1, 2 :: nat}"
```

```output
*** Type unification failed: Clash of types "nat" and "_ set"
***
*** Type error in application: incompatible operand type
***
*** Operator:  (∈) {1} :: ??'a set set ⇒ bool
*** Operand:   {1, 2} :: nat set
***
```

The operator `(∈) {1}` ("is {1} an element of …") needs a set of sets, a `??'a set set`; the operand is
a set of numbers. Write `{1} ⊆ {1, 2}` or `1 ∈ {1, 2}`, depending on what you mean.

Now prove a law. State it:

```isabelle
lemma "A ∩ (B ∪ C) = A ∩ B ∪ A ∩ C"
```

```output state
proof (prove)
goal (1 subgoal):
 1. A ∩ (B ∪ C) = A ∩ B ∪ A ∩ C
```

Isabelle prints `A ∩ B ∪ A ∩ C` without brackets because $\cap$ binds more tightly than $\cup$, as
$\land$ binds more tightly than $\lor$. `A`, `B` and `C` are free, so the lemma claims the law for all
sets (Module 3). Prove it:

```isabelle
  by auto
```

`auto` does what the paper proof did: it applies extensionality, replaces each membership by its
definition and finishes with propositional reasoning. `blast` works as well; on sets these two are the
usual tools.

```isabelle
lemma "- (A ∪ B) = - A ∩ - B"
  by auto

lemma "x ∈ {y. P y} ⟷ P x"
  by simp
```

A false law cannot be proved, but Nitpick (Module 2) finds a counterexample. The option
`card 'a = 1` makes it search a universe with one element, which is enough, as you saw above:

```isabelle
lemma "A - (B - C) = (A - B) - (C :: 'a set)"
  nitpick [card 'a = 1]
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 1:
  Free variables:
    A = {a⇩1}
    B = {}
    C = {a⇩1}
```

The counterexample is the row of the truth table found above: a₁ is in `A` and `C` but not in `B`.
Isabelle/jEdit's automatic Quickcheck may flag the lemma as soon as you type it.
:::

::: pitfall
The annotation `(C :: 'a set)` matters. Of the operations above, only `-` also exists for other types,
so without it Isabelle reads the lemma as a claim about subtraction in general. Nitpick then finds a
counterexample in which `A`, `B` and `C` are not sets at all, and suspects the problem:

```isabelle
lemma "A - (B - C) = A - B - C"
  nitpick [card 'a = 2]
  oops
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2:
  Free variables:
    A = a⇩1
    B = a⇩1
    C = a⇩1

Hint: Maybe you forgot a type constraint?
```

`∪`, `∩`, `⊆` and `∈` exist only for sets, so a lemma that uses one of them needs no annotation.
:::

::: trouble
- **`Clash of types "nat" and "bool"` in set-builder notation.** In Isabelle, `|` is a way to type
  $\lor$, so the book notation $\{x \mid x < 5\}$ does not work:

  ```isabelle fails
  value "{x | x < (5::nat)}"
  ```

  ```output
  *** Type unification failed: Clash of types "nat" and "bool"
  ***
  *** Type error in application: incompatible operand type
  ***
  *** Operator:  (<) x :: bool ⇒ bool
  *** Operand:   5 :: nat
  ***
  ```

  Isabelle read the set with the single element `x ∨ x < 5`, so `x` would have to be both a truth
  value and a number. Write `{x. x < 5}`, with a dot.
- **`Wellsortedness error` … `not of sort enum` from `value`.** `value` cannot compute
  `{x. x < (5::nat)}` with this representation: the evaluator has no finite list over which to search.
  Take the elements from a finite set, as in `{x ∈ {0..10}. x < 5}`. The issue is executable
  representation and code equations, rather than a prohibition on reasoning about infinite sets.
  For example, membership in some infinite sets is computable even though listing every element is not.
:::

## Relations {#relations}

A set says which things there are. A **relation** says how they are connected: which user has which
role, which function calls which, which state of a system can follow which.

### Pairs and products {#products}

An **ordered pair** $(a, b)$ has a first component $a$ and a second component $b$. Unlike a set, a pair
has an order: $(1, 2) \neq (2, 1)$, although $\{1, 2\} = \{2, 1\}$. Two pairs are equal when their
components are: $(a, b) = (c, d) \iff a = c \land b = d$. In Isabelle a pair `(a, b)` has a type such
as `nat × string`, read "nat times string".

::: definition Cartesian product
The **Cartesian product** of $A$ and $B$ is the set of all pairs whose first component is in $A$ and
whose second component is in $B$:

$$
A \times B = \{(a, b).\; a \in A \land b \in B\}
$$
:::

For example, $\{1, 2\} \times \{x, y\} = \{(1, x), (1, y), (2, x), (2, y)\}$. A product of finite sets
has $|A| \cdot |B|$ elements, where $|A|$ is the number of elements of $A$. A database table with the
columns name and age is a subset of $\mathit{Names} \times \mathit{Ages}$.

### Relations as sets of pairs {#rel-def}

::: definition Relation
A (binary) **relation** from $A$ to $B$ is a subset $R \subseteq A \times B$; a relation **on** $A$ is
a subset of $A \times A$. Instead of $(x, y) \in R$ one also writes $x \mathrel{R} y$, "x is related to
y by R". In Isabelle a relation on a type `'a` has the type `'a rel`, short for `('a × 'a) set`.
:::

A relation is nothing but the set of the pairs that are related. The order $<$ on $\{1, 2, 3\}$ is the
set $\{(1, 2), (1, 3), (2, 3)\}$. Equality on $A$ is the **identity relation**
$\mathit{Id}_A = \{(x, x).\; x \in A\}$. "function $f$ calls function $g$" is the **call graph** of a
program, and "the system can move from state $s$ to state $t$ in one step" is its **transition
relation** (Section 4.5).

A relation on a small finite set can be drawn as a **directed graph**, with an arrow from $x$ to $y$ for
each pair $(x, y)$ and a loop at $x$ for $(x, x)$, or as a **matrix**, with a mark in row $x$ and
column $y$ for each pair. The widget below shows both.

### Properties of relations {#rel-props}

Six properties come up again and again. They use the **bounded quantifier** $\forall x \in A.\; P\,x$,
"for all x in A, P x", which means $\forall x.\; x \in A \imp P\,x$.

::: definition Properties of relations
A relation $R$ on $A$ is

$$
\begin{aligned}
&\textbf{reflexive} \text{ on } A && \text{if } \forall x \in A.\; (x, x) \in R\\
&\textbf{irreflexive} \text{ on } A && \text{if } \forall x \in A.\; (x, x) \notin R\\
&\textbf{symmetric} && \text{if } \forall x\, y.\; (x, y) \in R \imp (y, x) \in R\\
&\textbf{antisymmetric} && \text{if } \forall x\, y.\; (x, y) \in R \land (y, x) \in R \imp x = y\\
&\textbf{transitive} && \text{if } \forall x\, y\, z.\; (x, y) \in R \land (y, z) \in R \imp (x, z) \in R\\
&\textbf{total} \text{ on } A && \text{if } \forall x \in A.\; \forall y \in A.\; x \neq y \imp (x, y) \in R \lor (y, x) \in R
\end{aligned}
$$
:::

In the graph, each property has a shape you can check by eye:

| Property | In the graph |
|---|---|
| Reflexive | a loop at every node |
| Irreflexive | no loops at all |
| Symmetric | every arrow has a partner going back |
| Antisymmetric | no pair of arrows going both ways between different nodes |
| Transitive | every path of two arrows $x \to y \to z$ has a shortcut $x \to z$ |
| Total | any two different nodes are joined by an arrow, in at least one direction |

Some books ask totality also for $x = y$; this series follows Isabelle and asks it only for different
elements, so that $<$ counts as total. To show that a property holds you check every case; to show
that it fails, one **witness** is enough. Each property is a $\forall$-statement, and by the law
$\lnot (\forall x.\; P\,x) \iff (\exists x.\; \lnot P\,x)$ of Module 3 it fails exactly when some
instance fails. A witness against transitivity is a triple $x, y, z$ with $(x, y)$ and $(y, z)$ in $R$
but $(x, z)$ not.

::: example Three relations on {1, 2, 3}
1. $\le$, that is $\{(1,1), (2,2), (3,3), (1,2), (1,3), (2,3)\}$, is reflexive, antisymmetric,
   transitive and total. It is not symmetric: $(1, 2)$ is in it and $(2, 1)$ is not.
2. "one less than", $\{(1, 2), (2, 3)\}$, is irreflexive and antisymmetric. It is not transitive:
   $(1, 2)$ and $(2, 3)$ are in it but $(1, 3)$ is not. Nor is it total: neither $(1, 3)$ nor
   $(3, 1)$ is in it.
3. "has the same parity as", $\{(1,1), (2,2), (3,3), (1,3), (3,1)\}$, is reflexive, symmetric and
   transitive. It is not antisymmetric: $(1, 3)$ and $(3, 1)$ are in it, but $1 \neq 3$.
:::

::: pitfall
- **Antisymmetric is not "not symmetric".** Equality is both symmetric and antisymmetric;
  $\{(1, 2), (2, 1), (1, 3)\}$ is neither. Likewise, $\{(1, 1)\}$ on $\{1, 2\}$ is neither reflexive
  nor irreflexive.
- **Vacuous truth.** The empty relation is symmetric, antisymmetric and transitive: these properties
  are implications whose premises never hold.
- **Transitivity includes the case $x = z$.** $\{(1, 2), (2, 1)\}$ is not transitive: $(1, 2)$ and
  $(2, 1)$ demand $(1, 1)$.
:::

::: widget name=relation-explorer
Click the cells of the grid to add or remove pairs; the graph and the properties update as you click,
with a witness for every property that fails. Load **Cycle**: which properties fail, and why? Then add
the transitive closure (Section 4.5) and see which pairs it adds. Can you build a relation that is
symmetric and antisymmetric but not empty?
:::

### Composition and converse {#rel-ops}

::: definition Converse, composition and image
The **converse** (or inverse) of $R$ reverses every pair: $R^{-1} = \{(y, x).\; (x, y) \in R\}$.
The **composition** of $R$ and $S$ takes an $R$-step followed by an $S$-step:

$$
R \mathbin{O} S = \{(x, z).\; \exists y.\; (x, y) \in R \land (y, z) \in S\}
$$

The **image** of a set $X$ under $R$ is the set of everything related to an element of $X$:
$R[X] = \{y.\; \exists x \in X.\; (x, y) \in R\}$. Isabelle writes `r¯` (type `^-1`), `r O s`, and
for the image ```r `` X```, with two backquotes.
:::

The converse of $<$ is $>$, and the converse of "is a parent of" is "is a child of"; in the graph, it
turns every arrow round. Composing "is a parent of" with itself gives "is a grandparent of". Books also
write composition as $R \mathbin{;} S$, or as $S \circ R$ by analogy with functions (Section 4.6),
which reverses the order; Isabelle's $R \mathbin{O} S$ reads from left to right.

::: example Roles and permissions
Many systems assign users roles and assign permissions to those roles;
this is **role-based access control**. With

$$
\begin{aligned}
\mathit{UR} &= \{(\mathit{alice}, \mathit{admin}), (\mathit{bob}, \mathit{guest})\}\\
\mathit{RP} &= \{(\mathit{admin}, \mathit{read}), (\mathit{admin}, \mathit{write}), (\mathit{guest}, \mathit{read})\}
\end{aligned}
$$

the permissions of the users are the composition $\mathit{UR} \mathbin{O} \mathit{RP}$, which relates
alice to read and write, and bob to read.
:::

::: fact Properties as equations
For relations $R$, $S$ and $T$:

1. $(R \mathbin{O} S) \mathbin{O} T = R \mathbin{O} (S \mathbin{O} T)$ and
   $(R \mathbin{O} S)^{-1} = S^{-1} \mathbin{O} R^{-1}$.
2. $R$ is symmetric exactly when $R^{-1} = R$.
3. $R$ is transitive exactly when $R \mathbin{O} R \subseteq R$.
4. $R$ is reflexive on $A$ exactly when $\mathit{Id}_A \subseteq R$.
:::

Take the third. $R \mathbin{O} R \subseteq R$ says that whenever some $y$ has $(x, y) \in R$ and
$(y, z) \in R$, then $(x, z) \in R$. That is transitivity, with the $\exists y$ moved out of the
premise by the law $((\exists y.\; P\,y) \imp Q) \iff (\forall y.\; P\,y \imp Q)$ of Module 3.

::: isabelle
A string in Isabelle is written between two pairs of single quotes, `''alice''`; its type prints as
`char list`, a list of characters. Products need `×` (type `\times` or `<*>`):

```isabelle
value "{1, 2 :: nat} × {''x'', ''y''}"
```

```output
"{(1, ''x''), (1, ''y''), (2, ''x''), (2, ''y'')}"
  :: "(nat × char list) set"
```

Isabelle names the six properties `refl_on A r`, `irrefl_on A r`, `sym_on A r`, `antisym_on A r`,
`trans_on A r` and `total_on A r`, where `A` is the set the relation is on. Without `_on` and the set,
as in `refl r`, `sym r` and `trans r`, they speak about the whole type. For finite relations, `value`
decides them:

```isabelle
value "refl_on {1, 2, 3} {(1::nat, 1), (2, 2), (1, 2)}"
value "trans_on {1, 2, 3} {(1::nat, 2), (2, 3)}"
value "trans_on {1, 2, 3} {(1::nat, 2), (2, 3), (1, 3)}"
```

```output all
"False"
  :: "bool"

"False"
  :: "bool"

"True"
  :: "bool"
```

The first relation lacks `(3, 3)`; the second lacks the shortcut `(1, 3)`, which the third has.
Composition computes too, and a line break inside the quotes is allowed:

```isabelle
value "{(''alice'', ''admin''), (''bob'', ''guest'')}
     O {(''admin'', ''read''), (''admin'', ''write''), (''guest'', ''read'')}"
```

```output
"{(''alice'', ''read''), (''alice'', ''write''), (''bob'', ''read'')}"
  :: "(char list × char list) set"
```

To prove the facts above for all relations, `auto` must see the definitions of `trans` and `sym`: by
itself, it does not replace `trans r` by what it means. The library states the definitions as
theorems, `trans_def` and `sym_def`, and `auto simp: trans_def` hands one of them to `auto`, which then
rewrites `trans r` into the ∀-formula of the definition and proves the rest as before. Module 9
explains this mechanism in depth.

```isabelle
lemma "trans r ⟷ r O r ⊆ r"
  by (auto simp: trans_def)

lemma "sym r ⟷ r¯ = r"
  by (auto simp: sym_def)

lemma "(r O s)¯ = s¯ O r¯"
  by auto
```
:::

## Equivalence relations and partitions {#equivalence}

Specifications often care about things only up to some detail: two account numbers may belong to the
same customer, two inputs may have to be treated alike, two times may show the same position on a
clock. "Has the same … as" relations share three properties.

::: definition Equivalence relation and class
An **equivalence relation** on $A$ is a relation on $A$ that is reflexive on $A$, symmetric and
transitive. The **equivalence class** of $x \in A$ is the set of the elements related to it, the image
of $\{x\}$:

$$
[x] = R[\{x\}] = \{y.\; (x, y) \in R\}
$$
:::

::: example Remainders
On $\{0, 1, \dots, 8\}$, let $x \sim y$ when $x \bmod 3 = y \bmod 3$: $x$ and $y$ leave the same
remainder on division by 3. Every number has the same remainder as itself, "the same" does not depend
on the order, and two equalities chain, so this is an equivalence relation. Its classes are

$$
[0] = \{0, 3, 6\} \qquad [1] = \{1, 4, 7\} \qquad [2] = \{2, 5, 8\}
$$

A class has many names, $[4] = [1] = [7]$: any element of a class can **represent** it.
:::

The classes do not overlap, and together they cover the set. This is no accident.

::: definition Partition
A **partition** of $A$ is a set of non-empty subsets of $A$, its **blocks**, such that every element of
$A$ is in exactly one block: the blocks are pairwise disjoint and their union is $A$.
:::

::: fact Equivalence relations and partitions
The equivalence classes of an equivalence relation on $A$ form a partition of $A$. Conversely, every
partition of $A$ defines an equivalence relation, "is in the same block as", whose classes are the
blocks.
:::

Here is the proof of the first half. The classes are subsets of $A$, because $R$ is a relation on $A$.
Reflexivity puts every $x$ into its own class, so the classes are non-empty and cover $A$. It remains to
show that two classes that meet are equal. Suppose $z$ is in $[x]$ and in $[y]$, so $(x, z) \in R$ and
$(y, z) \in R$. By symmetry $(z, y) \in R$, and by transitivity $(x, y) \in R$. Now for any $w \in [y]$,
transitivity turns $(x, y)$ and $(y, w)$ into $(x, w)$, so $w \in [x]$. Hence $[y] \subseteq [x]$; the
same argument with $x$ and $y$ swapped gives $[x] \subseteq [y]$, and Fact 4.1 gives $[x] = [y]$. For the
second half: every element is in some block (reflexive), the wording is symmetric, and two blocks that
share an element are the same block (transitive).

Equivalence relations appear wherever software ignores a detail. **Equivalence partitioning**, a
standard way of designing tests, splits the inputs into classes that the program should treat alike
(parcels up to 1 kg, up to 5 kg, heavier) and tests one representative of each, plus the boundaries.
And for any function $f$, "has the same value under $f$" is an equivalence relation. In Module 12, $f$
is an abstraction function, which maps each data structure to the abstract value it represents: two
structures that represent the same value are equivalent in this sense.

::: isabelle
Isabelle writes `equiv A r` for "r is an equivalence relation on A", ```r `` {x}``` for the class of
`x`, and `A // r` ("A modulo r") for the set of all classes, the partition. Here they are for the
example, with the relation built by set-builder notation over a product:

```isabelle
value "{(x, y) ∈ {0..8::nat} × {0..8}. x mod 3 = y mod 3} `` {4}"
```

```output
"{1, 4, 7}"
  :: "nat set"
```

```isabelle
value "{0..8::nat} // {(x, y) ∈ {0..8} × {0..8}. x mod 3 = y mod 3}"
```

```output
"{{2, 5, 8}, {1, 4, 7}, {0, 3, 6}}"
  :: "nat set set"
```

For all natural numbers the relation is an equivalence; the proof unfolds the definitions:

```isabelle
lemma "equiv UNIV {(x, y). x mod 3 = (y::nat) mod 3}"
  by (auto simp: equiv_def refl_on_def sym_def trans_def)
```

The library proves the main fact of this section once and for all, as `quotient_disj`: two classes are
equal or disjoint. With `simp add:` you hand a theorem to the simplifier:

```isabelle
lemma "equiv A r ⟶ X ∈ A // r ⟶ Y ∈ A // r ⟶ X = Y ∨ X ∩ Y = {}"
  by (simp add: quotient_disj)
```
:::

## Orders and well-foundedness {#orders}

Orders compare things: version numbers, priorities, deadlines, "must happen before" in a schedule.
Some compare any two elements; many do not.

### Partial and total orders {#partial-orders}

::: definition Partial, total and strict orders
A **partial order** on $A$ is a relation on $A$ that is reflexive on $A$, antisymmetric and transitive.
A **total order** (or linear order) is a partial order that is also total on $A$. A **strict order** is
a relation that is irreflexive and transitive.
:::

Partial orders are usually written $\le$ and strict orders $<$, and each gives the other:
$x < y \iff x \le y \land x \neq y$, and $x \le y \iff x < y \lor x = y$. A strict order is
**asymmetric**: $x < y$ and $y < x$ would give $x < x$ by transitivity, which irreflexivity forbids.

::: example Orders, total and partial
- $\le$ on numbers is a total order.
- $\subseteq$ on $\pow(A)$ is a partial order. If $A$ contains two different elements, it is not total:
  for example, when $1, 2 \in A$, $\{1\}$ and $\{2\}$ are **incomparable**, as neither is a subset
  of the other. If $A$ has at most one element, its subsets do form a total order.
- Divisibility on the positive integers, $a \mid b$ when $b = k \cdot a$ for some integer $k$, is a
  partial order, and 2 and 3 are incomparable.
:::

### Hasse diagrams {#hasse}

The graph of a partial order has many arrows: a loop at every node, and a shortcut for every path. A
**Hasse diagram** of a partial order on a finite set leaves out what the properties imply. It puts
smaller elements lower, draws no loops and no arrowheads, and draws a line from $x$ up to $y$ only when
$y$ **covers** $x$: $x < y$ with nothing strictly between them. Then $x \le y$ exactly when an upward
path leads from $x$ to $y$, allowing a path of zero edges when $x = y$.

::: figure id=fig-04-2
Two Hasse diagrams. Left: the subsets of $\{1, 2, 3\}$, ordered by $\subseteq$. Right: the divisors of
12, ordered by divisibility. Each line goes up from an element to an element that covers it.
:::

In a partial order, $m$ is **minimal** when no element is strictly below it, and **least** when it is
below every element; **maximal** and **greatest** are the same notions upside down. In Figure 4.2,
$\emptyset$ and 1 are least, $\{1, 2, 3\}$ and 12 greatest. A partial order can have several minimal
elements and no least one: in $\{2, 3, 4, 6\}$ ordered by divisibility, 2 and 3 are minimal, 4 and 6
maximal. In a project plan with no cyclic dependencies, "is a prerequisite of" is a strict order;
adding equality gives a partial order. Its minimal tasks have no unfinished prerequisites. Listing
tasks in an order that respects the dependencies, a **topological sort**, gives a valid dependency
order; durations and resource constraints are further scheduling questions.

### Well-founded relations {#well-founded}

On the natural numbers, every descending chain $n > m > k > \dots$ stops after at most $n$ steps. On
the integers, $0 > -1 > -2 > \dots$ never stops. This difference is what makes induction and
termination proofs work.

::: definition Well-founded relation
Read $(y, x) \in R$ as "$y$ is smaller than $x$". $R$ is **well-founded** when there is no infinite
descending chain: no infinite sequence $x_0, x_1, x_2, \dots$ with $(x_{i+1}, x_i) \in R$ for every $i$.
:::

Equivalently, a fact this series uses without proof, every non-empty set $S$ has an $R$-**minimal**
element: some $m \in S$ such that no $y \in S$ has $(y, m) \in R$.

- $<$ on $\N$ is well-founded. $<$ on $\Z$ is not, nor is $<$ on the non-negative fractions:
  $1 > \tfrac{1}{2} > \tfrac{1}{4} > \dots$ never stops.
- A well-founded relation is irreflexive, since $(x, x) \in R$ gives the chain $x, x, x, \dots$. So $<$
  on $\N$ is well-founded and $\le$ is not.
- A relation on a finite set is well-founded exactly when it has no cycle. (The library proves this as
  `wf_iff_acyclic_if_finite`.)

::: keyidea
Well-founded relations are why programs terminate and why induction is sound.

- **Termination.** If each iteration of a loop, or each recursive call, moves to a smaller value in a
  well-founded relation, the computation stops: an infinite computation would be an infinite descending
  chain, provided the work between decreases also terminates. Euclid's algorithm returns $m$ when
  $n = 0$; otherwise it makes the recursive call `gcd n (m mod n)`. Its second argument decreases
  because $m \bmod n < n$ whenever $n > 0$. When you define a function with `fun`, Isabelle looks for such a relation; that is the
  "termination order" it reported in Module 1.
- **Induction.** To prove $P\,x$ for all $x$, it suffices to prove $P\,x$ assuming that $P$ holds for
  everything smaller than $x$ (this proof is the induction step). If $P$ failed somewhere, the
  counterexamples would have a minimal element $m$; $P$ holds below $m$, so the induction step proves
  $P\,m$, a contradiction.

Module 5 builds both ideas on this foundation.
:::

::: isabelle
Isabelle writes `wf r` for "r is well-founded", with the same reading: `(y, x) ∈ r` means that `y` is
smaller. The library proves that `<` on the natural numbers is well-founded, as `wf_less`:

```isabelle
lemma "wf {(x, y). x < (y::nat)}"
  by (simp add: wf_less)
```

The command `thm` displays a theorem of the library by its name. This one says that well-founded means
"no infinite descending chain":

```isabelle
thm wf_iff_no_infinite_down_chain
```

```output result
wf ?r = (∄f. ∀i. (f (Suc i), f i) ∈ ?r)
```

The chain is a function `f` on the natural numbers, `f 0`, `f 1`, `f 2`, … , and `Suc i` is `i + 1`.
`∄` reads "there is no", and `=` between two truth values is $\iff$ (Module 3). The question mark in
`?r` marks a variable of the theorem, which can be any relation; Module 7 says more. Finally, two
incomparable sets show that $\subseteq$ is not total:

```isabelle
value "{1::nat} ⊆ {2} ∨ {2} ⊆ {1::nat}"
```

```output
"False"
  :: "bool"
```
:::

## Closures and reachability {#closures}

A relation often lacks a property you need. "calls" is not transitive, but "can call, directly or
indirectly" is; "can move in one step" is not, but "can reach" is. A **closure** adds the pairs that
are missing, and nothing else.

### Closures {#closure-def}

::: definition Closures
The **reflexive**, **symmetric** or **transitive closure** of $R$ is the smallest relation that contains
$R$ and has the property; "smallest" means that it is contained in every other such relation.
For the paper definitions, take $R \subseteq A \times A$ and keep closures on the chosen carrier $A$.

- Reflexive closure on $A$: $R \cup \mathit{Id}_A$. Symmetric closure: $R \cup R^{-1}$.
- Transitive closure: $R^+ = R \cup (R \mathbin{O} R) \cup (R \mathbin{O} R \mathbin{O} R) \cup \dots$,
  so $(x, y) \in R^+$ when a path of one or more $R$-steps leads from $x$ to $y$.
- **Reflexive-transitive closure** on $A$: $R^* = \mathit{Id}_A \cup R^+$, paths of zero or more steps.

Isabelle writes `r⇧+` and `r⇧*` (type `r^+` and `r^*`), and calls them `trancl` and `rtrancl`.
:::

Isabelle's `r⇧*` uses the whole element type as its carrier, so it includes `(x, x)` even for values
outside a finite set being drawn. To restrict it to $A$, take its intersection with $A \times A$.
For reachability from initial states in $A$, a relation contained in $A \times A$ cannot leave $A$,
so this distinction does not change the reachable states.

::: example A chain and its closure
For $R = \{(1, 2), (2, 3), (3, 4)\}$, paths of two steps give $R \mathbin{O} R = \{(1, 3), (2, 4)\}$,
paths of three steps give $\{(1, 4)\}$, and there are none longer. So

$$
R^+ = \{(1, 2), (2, 3), (3, 4), (1, 3), (2, 4), (1, 4)\}
$$

which is $<$ on $\{1, 2, 3, 4\}$; $R^*$ adds the pairs $(x, x)$ and gives $\le$. Figure 4.3, left,
draws $R$ with the pairs that $R^+$ adds.
:::

On a set with $n$ elements, every reachable pair has a path of at most $n$ steps. For different
endpoints, remove repeated loops to get a path of at most $n-1$ steps. For equal endpoints in $R^+$,
keep a shortest non-empty cycle, which has at most $n$ steps; a zero-step path would not suffice for
$R^+$. So you
can compute $R^+$ by adding the pairs of $R \mathbin{O} R$, then of $R \mathbin{O} R \mathbin{O} R$, and
so on, until nothing changes. The **Transitive closure** button of the widget in Section 4.2 computes
the same relation.

::: pitfall
- **Zero steps count in $R^*$.** $(x, x) \in R^*$ for every $x$, even when $R$ has no loop at $x$;
  $R^+$ contains $(x, x)$ only when a cycle passes through $x$.
- **The order of closures matters.** The smallest equivalence relation containing $R$ is
  $(R \cup R^{-1})^*$: symmetric first, then reflexive and transitive. For $R = \{(1, 3), (2, 3)\}$ it
  relates 1 and 2, through $1 \to 3 \to 2$, but $R^* \cup (R^*)^{-1}$ does not.
:::

### Reachability in a state machine {#reachability}

Module 1 described model checkers, which explore every reachable state of a system. Reachability is
the reflexive-transitive closure.

::: definition State machine and reachability
A **state machine** consists of a set of **states**, a set $I$ of **initial** states, and a
**transition relation** $T$: $(s, t) \in T$ when the system can move from $s$ to $t$ in one step. The
**reachable** states are those $t$ with $(s, t) \in T^*$ for some $s \in I$, that is, the image
$T^*[I]$. A **safety property** says that no reachable state is bad.
:::

::: example A door with a lock
A door is open or closed, and its bolt locked or unlocked: four states, CL (closed and locked), CU
(closed, unlocked), OU (open, unlocked) and OL (open and locked). OL is bad: the bolt sticks out of an
open door and will damage the frame. The transitions are *unlock* (CL to CU), *lock* (CU to CL),
*open* (CU to OU) and *close* (OU to CU), and the door starts in CL.

From CL the door can only go to CU, from CU to CL or OU, and from OU back to CU. So the reachable
states are CL, CU and OU, and the safety property "the door is never open and locked" holds. Now
suppose a designer makes the lock button work in every state. That adds a transition from OU to OL,
and OL becomes reachable along CL, CU, OU, OL: a **counterexample trace**, the kind of answer a model
checker gives when a property fails.
:::

::: figure id=fig-04-3
Left: the relation $\{(1, 2), (2, 3), (3, 4)\}$ (solid) and the pairs its transitive closure adds
(dashed). Right: the door as a state machine. The green states are reachable from CL; the red dashed
transition is the one the designer added, which makes the bad state OL reachable.
:::

Real systems have billions of states, or infinitely many, which is why model checkers compute
reachability by machine and why Module 13 proves safety properties with invariants instead.

::: isabelle
To give the door's transition relation a name, use `definition`. Like `fun` in Module 1, it introduces
a new constant with its type and a defining equation, but it allows no recursion, and a set written out
pair by pair needs none (Module 8 says more about both commands):

```isabelle
definition door :: "(string × string) set" where
  "door = {(''CL'', ''CU''), (''CU'', ''CL''), (''CU'', ''OU''), (''OU'', ''CU'')}"
```

```output
consts
  door :: "(char list × char list) set"
```

The reachable states are the image of the initial state under the reflexive-transitive closure:

```isabelle
value "door⇧* `` {''CL''}"
```

```output
"{''OU'', ''CU'', ''CL''}"
  :: "char list set"
```

The bad state is not reachable, until the extra transition is added:

```isabelle
value "''OL'' ∈ door⇧* `` {''CL''}"
value "''OL'' ∈ (door ∪ {(''OU'', ''OL'')})⇧* `` {''CL''}"
```

```output all
"False"
  :: "bool"

"True"
  :: "bool"
```

The transitive closure of the chain:

```isabelle
value "{(1::nat, 2), (2, 3), (3, 4)}⇧+"
```

```output
"{(1, 2), (2, 3), (3, 4), (2, 4), (1, 3), (1, 4)}"
  :: "(nat × nat) set"
```

And for all relations, $R^+$ contains $R$ and is transitive, and taking the reflexive-transitive
closure twice adds nothing:

```isabelle
lemma "r ⊆ r⇧+"
  by auto

lemma "trans (r⇧+)"
  by simp

lemma "(r⇧*)⇧* = r⇧*"
  by simp
```
:::

## Functions {#functions}

Mathematically, a function is a relation in which every input has exactly one output.

### Functions as relations {#fun-def}

::: definition Function
A **function** $f$ from $A$ to $B$, written $f : A \to B$, is a relation $f \subseteq A \times B$ in
which every $a \in A$ is related to exactly one $b \in B$, written $f\,a = b$. $A$ is the **domain** of
$f$ and $B$ its **codomain**. The **image** of a set $S \subseteq A$ is $f[S] = \{f\,a.\; a \in S\}$,
and the image of the whole domain is the **range** of $f$.
:::

The codomain says where the values may lie, the range where they do lie: for squaring on $\N$, the
codomain is $\N$ and the range is $\{0, 1, 4, 9, \dots\}$.

In HOL, functions are not sets of pairs: `nat ⇒ nat` is a type of its own (Module 1), and its elements
are written with $\lambda$. `λn. 2 * n` is the function that takes `n` to `2 * n`, written $n \mapsto 2n$
in mathematics (type `\lambda` or `%`). Every HOL function is **total**: it has a value for every
element of its argument type. (This sense of "total" has nothing to do with the total relations of
Section 4.2.) A relation in which every input has *at most* one output is a **partial function**, such
as the input-output relation of a deterministic program that may not return a result. A mathematical
partial function can be represented in HOL by a total function returning the type `option` of Module 8:
either a value or `None`. This representation records undefinedness; it does not make a potentially
non-terminating program executable as a terminating HOL function. Isabelle writes the image of
a set as `` f ` A `` (one backquote) and the range as `range f`.

### Injective, surjective, bijective {#inj-surj}

::: definition Injective, surjective, bijective
A function $f : A \to B$ is

- **injective** (one-to-one) when different inputs give different outputs:
  $\forall x \in A.\; \forall y \in A.\; f\,x = f\,y \imp x = y$;
- **surjective** (onto $B$) when every element of $B$ is an output:
  $\forall b \in B.\; \exists a \in A.\; f\,a = b$, that is, $f[A] = B$;
- **bijective** when it is both: it pairs the elements of $A$ and $B$ one to one.
:::

::: example Four functions on numbers
- $n \mapsto 2n$ on $\N$ is injective, since $2x = 2y$ implies $x = y$, but not surjective: 1 is not an
  output.
- $n \mapsto n \operatorname{div} 2$ on $\N$ (division rounding down) is surjective but not injective:
  0 and 1 both give 0.
- $n \mapsto n + 1$ on $\N$ is injective but not surjective: 0 is not an output.
- $n \mapsto n + 1$ on $\Z$ is bijective: every integer $m$ is the output for exactly one input, $m - 1$.
:::

The last two have the same formula and different properties: surjectivity depends on the domain and
codomain. In software, injectivity means "no collisions". For example, for a fixed key, deterministic
encryption with exact decryption must map different plaintexts to different ciphertexts; otherwise
decryption could not recover both messages correctly.

### Inverses and composition {#inverse}

::: definition Composition and inverse
The **composition** of $f : A \to B$ and $g : B \to C$ is $g \circ f : A \to C$, with
$(g \circ f)\,x = g\,(f\,x)$: first $f$, then $g$, read "g after f". A function $g : B \to A$ is an
**inverse** of $f$ when $g\,(f\,a) = a$ for all $a \in A$ and $f\,(g\,b) = b$ for all $b \in B$.
:::

::: fact Composition and inverses
1. If $f$ and $g$ are injective, so is $g \circ f$; if they are surjective, so is $g \circ f$. So the
   composition of two bijections is a bijection.
2. A function has an inverse exactly when it is bijective. The inverse is then unique, written $f^{-1}$,
   and its graph is the converse of the graph of $f$.
3. For bijections, $(g \circ f)^{-1} = f^{-1} \circ g^{-1}$.
:::

For injectivity in the first part: if $g\,(f\,x) = g\,(f\,y)$, then $f\,x = f\,y$ because $g$ is
injective, and $x = y$ because $f$ is. The third part is the socks-and-shoes rule: socks go on first
and come off last. A message that was compressed and then encrypted is decrypted first.

::: isabelle
Isabelle's names are `inj f`, `surj f` and `bij f` for functions on whole types, `inj_on f A` and
`bij_betw f A B` for functions on sets, `inv f` for the inverse and `g ∘ f` for composition (type
`\circ`). State that doubling is injective:

```isabelle
lemma "inj (λn::nat. 2 * n)"
```

```output state
proof (prove)
goal (1 subgoal):
 1. inj ((*) 2)
```

Isabelle prints `λn. 2 * n` in a shorter form, `(*) 2`: multiplication with its first argument fixed
to 2. As in Section 4.2, the proof needs the definition, here `inj_def`:

```isabelle
  by (auto simp: inj_def)
```

More of the examples, and the first part of the fact:

```isabelle
lemma "¬ surj (λn::nat. n + 1)"
  by (auto simp: surj_def)

lemma "bij (λn::int. n + 1)"
  by (auto simp: bij_def inj_def surj_def)

lemma "inj f ⟶ inj g ⟶ inj (g ∘ f)"
  by (auto simp: inj_def)
```

`inv f` is defined for every HOL function. Injectivity guarantees that it undoes `f` on every input:

```isabelle
lemma "inj f ⟶ inv f (f x) = x"
  by simp
```

On finite sets `value` decides these properties. Adding 1 and taking the remainder by 3 rotates
$\{0, 1, 2\}$, a bijection of the set onto itself:

```isabelle
value "bij_betw (λx::nat. (x + 1) mod 3) {0, 1, 2} {0, 1, 2}"
```

```output
"True"
  :: "bool"
```
:::

::: pitfall
When `f` is not surjective, `inv f y` still has a value for a `y` outside the range, because every HOL
function is total, but no inverse law is guaranteed there. Injectivity gives the left-inverse law
`inv f (f x) = x`; surjectivity gives the right-inverse law `f (inv f y) = y`. Bijectivity gives both.
:::

## Counting: cardinality and Cantor's theorem {#cardinality}

For finite sets you count. For infinite sets you cannot, but you can still compare sizes with
functions, and the comparison holds a surprise.

### Finite sets {#finite}

::: definition Cardinality
The **cardinality** $|A|$ of a finite set $A$ is its number of elements. Isabelle writes `card A`, and
`finite A` for "A is finite".
:::

::: fact Counting rules
For finite sets $A$ and $B$:

1. $|A \cup B| = |A| + |B| - |A \cap B|$, so $|A \cup B| = |A| + |B|$ when $A$ and $B$ are disjoint.
2. $|A \times B| = |A| \cdot |B|$ and $|\pow(A)| = 2^{|A|}$.
3. If there is an injective function from $A$ to $B$, then $|A| \le |B|$; if there is a bijection, then
   $|A| = |B|$.
:::

The first rule is **inclusion–exclusion**: $|A| + |B|$ counts the elements of $A \cap B$ twice. On the
file server, $|R \cup W| = 3 + 2 - 1 = 4$. The third rule compares sizes without counting, by pairing
off elements, and that idea still works for infinite sets.

### The pigeonhole principle {#pigeonhole}

::: fact The pigeonhole principle
If $A$ and $B$ are finite and $|A| > |B|$, then no function $f : A \to B$ is injective: two different
elements of $A$ have the same image. When $B$ is non-empty, every function $f : A \to B$ maps at least
$\lceil |A| / |B| \rceil$ elements of $A$ to some one element of $B$. If $B$ is empty and $A$ is not,
there is no function $A \to B$ at all.
:::

If more pigeons than holes fly into the holes, some hole holds two pigeons. Among any 13 people, two
were born in the same month. A hash table with 1000 keys and 256 buckets has a bucket with at least
$\lceil 1000/256 \rceil = 4$ keys, whatever the hash function. And no lossless compression program
makes every file shorter: there are $2^n$ files of $n$ bits but only
$2^0 + 2^1 + \dots + 2^{n-1} = 2^n - 1$ shorter ones, so two files would get the same compressed form.

::: isabelle
`card` counts, and repeated elements count once:

```isabelle
value "card {1, 2, 3, 2, 1 :: nat}"
value "card (Pow {1, 2, 3 :: nat})"
```

```output all
"3"
  :: "nat"

"8"
  :: "nat"
```

Thirteen numbers have only twelve possible remainders by 12, so the remainder is not injective on
them:

```isabelle
value "inj_on (λn::nat. n mod 12) {0..12}"
```

```output
"False"
  :: "bool"
```

The library proves the counting rules for all finite sets. The rule for power sets is `card_Pow`:

```isabelle
lemma "finite A ⟶ card (Pow A) = 2 ^ card A"
  by (simp add: card_Pow)
```

The pigeonhole principle is `pigeonhole`. It speaks about the image `` f ` A `` of Section 4.6: if the
image has fewer elements than `A`, two elements of `A` share an image, so `f` is not injective on `A`.

```isabelle
lemma "card (f ` A) < card A ⟶ ¬ inj_on f A"
  by (simp add: pigeonhole)
```
:::

::: pitfall
In Isabelle, `card` of an infinite set is 0. That keeps `card` a total function, but statements about
`card` usually need the assumption `finite A`, as in the lemma about power sets above.

```isabelle
lemma "card (UNIV :: nat set) = 0"
  by simp
```
:::

### Countable sets {#countable}

For infinite sets, take the third counting rule as the definition: two sets have the **same
cardinality** when there is a bijection between them. Strange things happen at once: $n \mapsto 2n$ is a
bijection from $\N$ to the even numbers, so a proper subset of $\N$ is as large as $\N$ itself.

::: definition Countable set
A set $A$ is **countable** when there is an injective function from $A$ to $\N$. Equivalently, $A$ is
finite or its elements can be listed as $a_0, a_1, a_2, \dots$, each appearing somewhere in the list.
:::

The integers are countable: list them as $0, 1, -1, 2, -2, \dots$. So are the pairs of natural numbers,
listed diagonal by diagonal: $(0, 0)$, $(0, 1)$, $(1, 0)$, $(0, 2)$, $(1, 1)$, $(2, 0)$, … . So are the
finite strings over a finite alphabet, listed by length and then alphabetically; in particular, the
programs of any programming language form a countable set. Is every set countable, then? No, and the
proof is one of the most famous in mathematics.

### Cantor's theorem {#cantor}

::: fact Cantor's theorem
For every set $A$, no function $f : A \to \pow(A)$ is surjective.
:::

Since $a \mapsto \{a\}$ is injective, $\pow(A)$ is at least as large as $A$; Cantor's theorem says it
is strictly larger. Georg Cantor published the proof, the **diagonal argument**, in 1891.

Take any $f : A \to \pow(A)$. Each $f\,x$ is a set that may or may not contain $x$ itself. Collect the
elements that are not in their own set:

$$
D = \{x \in A.\; x \notin f\,x\}
$$

$D \subseteq A$, so $D \in \pow(A)$. Suppose $f$ were surjective. Then $D = f\,d$ for some $d \in A$.
Is $d$ in $D$? The first step below is the definition of $D$ (it applies because $d \in A$); the second
replaces $f\,d$ by $D$, which is equal to it:

$$
d \in D \iff d \notin f\,d \iff d \notin D
$$

So $d \in D \iff d \notin D$, and a proposition equivalent to its own negation is impossible:

```truthtable
P ⟷ ¬P
```

The assumption that $f$ is surjective has led to a contradiction, so it is false: no $d$ has
$f\,d = D$, and $f$ is not surjective. Figure 4.4 shows where the name comes from.

::: figure id=fig-04-4
The diagonal argument for $A = \N$. Row $i$ shows which numbers are in the set $f\,i$ (1 for "in",
0 for "not in"). $D$ flips the diagonal, so it differs from the set $f\,i$ at position $i$, for every
$i$: $D$ is in no row.
:::

A subset of $\N$ describes a **decision problem**, such as "is this number prime?". A program decides
such a set only if it halts with the correct yes-or-no answer on every input. There are countably many
programs, so at most countably many decidable sets, while $\pow(\N)$ is uncountable. Thus undecidable
problems must exist. This is a counting argument: it does not give an algorithm that lists exactly the
programs which halt on every input. Turing's proof that the halting problem is undecidable (Module 1)
is a diagonal argument too.

::: note
Bertrand Russell found in 1901 that the same trick breaks naive set theory, which lets every property
define a set: then $R = \{x.\; x \notin x\}$, the set of all sets that are not elements of themselves,
would be a set, and $R \in R \iff R \notin R$. HOL avoids the paradox with types: `x ∈ x` is a type
error, because a set and its elements have different types, and for the same reason there is no set of
everything (Section 4.1).
:::

::: isabelle
The heart of the proof is that the diagonal set is not a value of `f`. `range f` is the set of all
values of `f`:

```isabelle
lemma diagonal: "{x. x ∉ f x} ∉ range f"
  by auto
```

Cantor's theorem for every type follows: a surjective `f` would have every set in its range, the
diagonal set included. `auto` does not find this proof, but `force` does. `force` is a relative of
`auto` that searches harder, and more slowly, and either proves the goal completely or fails; Module 9
introduces it properly. Here it even finds the diagonal set by itself:

```isabelle
lemma cantor: "¬ surj (f :: 'a ⇒ 'a set)"
  by force
```

So no sequence `f 0`, `f 1`, `f 2`, … of sets of natural numbers contains them all; the name `cantor`
lets a later proof use the lemma:

```isabelle
lemma "¬ surj (f :: nat ⇒ nat set)"
  by (simp add: cantor)
```

The library has the theorem for every set `A`, as `Cantors_theorem`:

```isabelle
thm Cantors_theorem
```

```output result
∄f. f ` ?A = Pow ?A
```
:::

## What you learned {#summary}

- A **set** is determined by its elements (**extensionality**), and $a \in \{x.\; P\,x\} \iff P\,a$.
  In HOL every set has an element type.
- **Union, intersection, difference and complement** are $\lor$, $\land$, "and not" and $\lnot$
  applied to membership, so set laws are propositional laws, which Isabelle proves with `auto`.
- A **relation** is a set of pairs. It can be **reflexive, irreflexive, symmetric, antisymmetric,
  transitive or total**; a property fails exactly when a witness exists. **Converse** and
  **composition** build new relations.
- **Equivalence relations** correspond to **partitions**. **Partial orders** are drawn as **Hasse
  diagrams**. **Well-founded** relations have no infinite descending chains, which is why programs
  terminate and induction works.
- The **closures** $R^+$ and $R^*$ (`r⇧+`, `r⇧*`) add the pairs joined by paths, and the **reachable
  states** of a state machine are the image of its initial states under $T^*$.
- A function can be **injective**, **surjective**, both (**bijective**), or neither. It has a
  two-sided inverse exactly when it is bijective. Isabelle's `inv` is defined more generally;
  inverse laws require the appropriate assumptions (`inj`, `surj`, `bij`).
- **Cardinality** counts finite sets (`card`, `finite`). The **pigeonhole principle** forbids injections
  into smaller sets, and **Cantor's diagonal argument** shows that no set can be mapped onto its power
  set: some sets are uncountable, and some problems have no program.

## Exercises {#exercises}

:::: exercise Sets by hand {#ex-4-1} ★
Let $A = \{1, 2, 3, 4\}$, $B = \{3, 4, 5\}$ and $C = \{1, 5\}$.

1. Compute $A - B$, $B - A$, $A \cap B \cap C$, $C \times \{0, 1\}$ and $\pow(C)$, and check your answers
   with `value`.
2. Which of these are true: $C \subseteq A \cup B$, $\emptyset \in \pow(C)$, $\{5\} \in \pow(C)$?

::: solution
1. $A - B = \{1, 2\}$, $B - A = \{5\}$, $A \cap B \cap C = \emptyset$,
   $C \times \{0, 1\} = \{(1, 0), (1, 1), (5, 0), (5, 1)\}$ and
   $\pow(C) = \{\emptyset, \{1\}, \{5\}, \{1, 5\}\}$. In Isabelle:

```isabelle
value "{1, 2, 3, 4} - {3, 4, 5 :: nat}"
value "{3, 4, 5} - {1, 2, 3, 4 :: nat}"
value "{1, 2, 3, 4} ∩ {3, 4, 5} ∩ {1, 5 :: nat}"
value "{1, 5 :: nat} × {0, 1 :: nat}"
value "Pow {1, 5 :: nat}"
```

```output all
"{1, 2}"
  :: "nat set"

"{5}"
  :: "nat set"

"{}"
  :: "nat set"

"{(1, 0), (1, 1), (5, 0), (5, 1)}"
  :: "(nat × nat) set"

"{{5}, {}, {1}, {1, 5}}"
  :: "nat set set"
```

2. All three are true. $C \subseteq A \cup B = \{1, 2, 3, 4, 5\}$, and $\emptyset$ and $\{5\}$ are
   subsets of $C$, so they are elements of $\pow(C)$.
:::
::::

:::: exercise Properties of relations {#ex-4-2} ★
Which of the six properties of Section 4.2 do these relations on $\{1, 2, 3, 4\}$ have? For every
property that fails, give a witness, and check your answers with the widget.

1. $R_1 = \{(1, 1), (2, 2), (3, 3), (4, 4), (1, 2), (2, 1)\}$
2. $R_2 = \{(1, 2), (2, 3), (3, 1)\}$
3. $R_3 = \{(1, 2), (1, 3), (1, 4)\}$

::: solution
1. $R_1$ is reflexive, symmetric and transitive: an equivalence relation with the classes $\{1, 2\}$,
   $\{3\}$ and $\{4\}$. It is not irreflexive (witness $(1, 1)$), not antisymmetric ($(1, 2)$ and
   $(2, 1)$, but $1 \neq 2$) and not total (neither $(1, 3)$ nor $(3, 1)$).
2. $R_2$, a cycle, is irreflexive and antisymmetric. It is not reflexive (no $(1, 1)$), not symmetric
   ($(1, 2)$ without $(2, 1)$), not transitive ($(1, 2)$ and $(2, 3)$ without $(1, 3)$) and not total
   (neither $(1, 4)$ nor $(4, 1)$).
3. $R_3$ is irreflexive, antisymmetric and transitive; transitivity holds vacuously, as no path has two
   steps. It is not reflexive (no $(1, 1)$), not symmetric ($(1, 2)$ without $(2, 1)$) and not total
   (neither $(2, 3)$ nor $(3, 2)$). It is a strict order.
:::
::::

:::: exercise A set law, two ways {#ex-4-3} ★★
1. Prove $A - (B \cup C) = (A - B) \cap (A - C)$ on paper by translating it into propositional logic,
   and then in Isabelle.
2. Someone claims $(A \cup B) - C = A \cup (B - C)$. Find a counterexample with the method of
   Section 4.1, then let Nitpick find one, and compare.

::: solution
1. $x \in A - (B \cup C)$ translates to $p_A \land \lnot (p_B \lor p_C)$, which De Morgan's law turns
   into $p_A \land \lnot p_B \land \lnot p_C$. The right side translates to
   $(p_A \land \lnot p_B) \land (p_A \land \lnot p_C)$, the same formula, because
   $p \land p \iff p$. In Isabelle, no type annotation is needed, since `∪` and `∩` exist only for sets:

   ```isabelle
   lemma "A - (B ∪ C) = (A - B) ∩ (A - C)"
     by auto
   ```

2. $(p_A \lor p_B) \land \lnot p_C$ and $p_A \lor (p_B \land \lnot p_C)$ differ exactly when $p_A$ and
   $p_C$ are true: then the left side is false and the right side true. With $A = C = \{x\}$ and
   $B = \emptyset$, the left side is $\emptyset$ and the right side $\{x\}$. Nitpick:

   ```isabelle
   lemma "(A ∪ B) - C = A ∪ (B - C)"
     nitpick [card 'a = 1]
     oops
   ```

   ```output result
   Nitpicking formula...

   Nitpick found a counterexample for card 'a = 1:
     Free variables:
       A = {a⇩1}
       B = {}
       C = {a⇩1}
   ```

   It is the same counterexample, with a₁ for $x$.
:::
::::

:::: exercise Who calls whom {#ex-4-4} ★★
A program has the functions main, parse, lex, eval and apply. main calls parse and eval, parse calls
lex, eval calls apply, and apply calls eval.

1. Which functions can main call, directly or indirectly?
2. A function is recursive when it can call itself, directly or indirectly. Express this with the
   transitive closure, and find the recursive functions.
3. Check both answers in Isabelle.

::: solution
1. parse, lex, eval and apply: the image of $\{\mathit{main}\}$ under $\mathit{calls}^+$.
2. $f$ is recursive when $(f, f) \in \mathit{calls}^+$. eval and apply are, through the cycle eval,
   apply, eval; main, parse and lex are not.
3. With a definition for the call graph:

```isabelle
definition calls :: "(string × string) set" where
  "calls = {(''main'', ''parse''), (''main'', ''eval''), (''parse'', ''lex''),
            (''eval'', ''apply''), (''apply'', ''eval'')}"

value "calls⇧+ `` {''main''}"
value "(''apply'', ''apply'') ∈ calls⇧+"
value "(''main'', ''main'') ∈ calls⇧+"
```

```output all
consts
  calls :: "(char list × char list) set"

"{''parse'', ''lex'', ''apply'', ''eval''}"
  :: "char list set"

"True"
  :: "bool"

"False"
  :: "bool"
```
:::
::::

:::: exercise Injective or surjective? {#ex-4-5} ★★
Classify each function as injective, surjective, both or neither, and give the inverse of each
bijection. Check the fourth with `value`.

1. $f : \N \to \N$, $f\,n = n + 3$
2. $g : \Z \to \Z$, $g\,n = -n$
3. $h : \N \to \N$, $h\,n = n \operatorname{div} 2$
4. $k : \{0, 1, 2, 3\} \to \{0, 1, 2, 3\}$, $k\,n = 3n \bmod 4$

::: solution
1. Injective, not surjective: 0, 1 and 2 are not outputs.
2. Bijective, and its own inverse: $g\,(g\,n) = n$.
3. Surjective, since $m = h\,(2m)$; not injective, since $h\,0 = h\,1 = 0$.
4. Bijective: $k$ maps 0, 1, 2, 3 to 0, 3, 2, 1. It is its own inverse, because $9n \bmod 4 = n \bmod 4$.

```isabelle
value "bij_betw (λn::nat. 3 * n mod 4) {0, 1, 2, 3} {0, 1, 2, 3}"
```

```output
"True"
  :: "bool"
```
:::
::::

:::: exercise Combining equivalence relations {#ex-4-6} ★★★
Let $R$ and $S$ be equivalence relations on $A$.

1. Prove that $R \cap S$ is an equivalence relation on $A$, on paper and in Isabelle.
2. Show with an example on $\{1, 2, 3\}$ that $R \cup S$ need not be one, and check it with `value`.
3. What is the smallest equivalence relation on $A$ that contains $R \cup S$?

::: solution
1. Reflexive: for $x \in A$, $(x, x)$ is in $R$ and in $S$. Symmetric: if $(x, y)$ is in both, so is
   $(y, x)$, because both are symmetric. Transitive: if $(x, y)$ and $(y, z)$ are in both, so is
   $(x, z)$, because both are transitive. In Isabelle, `sym_Int` and `trans_Int` are the library's
   versions of the last two steps:

   ```isabelle
   lemma "equiv A R ⟶ equiv A S ⟶ equiv A (R ∩ S)"
     by (auto simp: equiv_def refl_on_def sym_Int trans_Int)
   ```

2. Let $R$ relate 1 and 2, and $S$ relate 2 and 3, each with all pairs $(x, x)$. Then $R \cup S$
   contains $(1, 2)$ and $(2, 3)$ but not $(1, 3)$:

   ```isabelle
   value "trans_on {1, 2, 3}
            ({(1::nat, 1), (2, 2), (3, 3), (1, 2), (2, 1)} ∪ {(1, 1), (2, 2), (3, 3), (2, 3), (3, 2)})"
   ```

   ```output
   "False"
     :: "bool"
   ```

3. $(R \cup S)^+$. It is reflexive on $A$ because it contains $R$, symmetric because a path read
   backwards is again a path of $R \cup S$, and transitive. An equivalence relation that contains
   $R \cup S$ is transitive, so it contains every path, that is, all of $(R \cup S)^+$.
:::
::::

:::: exercise Infinite bit sequences {#ex-4-7} ★★★
An infinite bit sequence is a function from $\N$ to $\{0, 1\}$, in HOL a function of type
`nat ⇒ bool`. Adapt Cantor's diagonal argument to show that no list $f\,0, f\,1, f\,2, \dots$ of such
sequences contains them all: give the missing sequence and explain why it is missing. Then prove in
Isabelle that it is not in the range of `f`. (Hint: two functions are equal when they agree on every
argument; the library calls this `fun_eq_iff`.)

::: solution
Let $d$ be the sequence whose $n$-th bit is the opposite of the $n$-th bit of $f\,n$:
$d\,n = \lnot (f\,n\,n)$. If $d = f\,m$ for some $m$, the two functions agree at $m$:
$\lnot (f\,m\,m) = f\,m\,m$, which is impossible. So $d$ is not in the list, and the set of infinite
bit sequences is uncountable. This is Figure 4.4 again: a set of natural numbers and the bit sequence
"1 at $n$ when $n$ is in the set" describe the same thing. (A similar argument shows that the real
numbers are uncountable.)

```isabelle
lemma "(λn. ¬ f n n) ∉ range (f :: nat ⇒ nat ⇒ bool)"
  by (auto simp: fun_eq_iff)
```

`fun_eq_iff` turns the equation between functions into one about all arguments, and `auto` then finds
the argument $m$ on its own.
:::
::::

## Check yourself {#quiz}

```quiz
? Which statement holds for every set $A$?
- [ ] $\emptyset \in A$
- [x] $\emptyset \subseteq A$
- [ ] $A \subset A$
- [ ] $A \in \pow(\emptyset)$
> The empty set is a subset of every set by vacuous truth: $x \in \emptyset \imp x \in A$ holds because $x \in \emptyset$ is always false. It is an element only of sets that contain it, and no set is a proper subset of itself.

? Which law of logic proves $-(A \cap B) = -A \cup -B$?
- [ ] Distributivity of $\land$ over $\lor$
- [ ] Absorption
- [ ] Double negation
- [x] De Morgan's law $\lnot (p \land q) \iff \lnot p \lor \lnot q$
> $x \in -(A \cap B)$ is $\lnot (x \in A \land x \in B)$, and De Morgan's law turns it into $x \notin A \lor x \notin B$.

? A relation $R$ on $\{1, 2, 3\}$ is both symmetric and antisymmetric. What follows?
- [x] Every pair in $R$ has the form $(x, x)$
- [ ] $R$ is empty
- [ ] $R$ is the identity relation
- [ ] $R$ is not transitive
> If $(x, y) \in R$, symmetry gives $(y, x) \in R$, and antisymmetry then gives $x = y$. Any set of loops qualifies, including the empty relation and the identity, so neither is forced.

? $R$ is an equivalence relation, and the classes $[x]$ and $[y]$ have an element in common. What can you conclude?
- [ ] $x = y$
- [ ] Nothing: classes can overlap in part
- [x] $[x] = [y]$
- [ ] $R$ is a partial order
> Two classes are equal or disjoint, so sharing an element makes them equal. $x$ and $y$ need not be equal, only equivalent.

? $T$ is the transition relation of a state machine and $s$ its initial state. Which set contains exactly the states reachable from $s$?
- [ ] The image of $\{s\}$ under $T$
- [x] The image of $\{s\}$ under $T^*$
- [ ] The image of $\{s\}$ under $T^+$
- [ ] The image of $\{s\}$ under $T^{-1}$
> Reachable means "in zero or more steps", which is $T^*$. $T$ gives only one step, and $T^+$ misses $s$ itself unless a cycle leads back to it.

? What does Cantor's theorem say about a function $f$ from $\N$ to $\pow(\N)$?
- [ ] It cannot be injective
- [ ] It is surjective if its range is infinite
- [ ] Its range is all of $\pow(\N)$
- [x] Some set of natural numbers is not in its range
> The diagonal set $\{n.\; n \notin f\,n\}$ differs from every $f\,n$. Injective functions from $\N$ to $\pow(\N)$ do exist, for example $n \mapsto \{n\}$.
```
