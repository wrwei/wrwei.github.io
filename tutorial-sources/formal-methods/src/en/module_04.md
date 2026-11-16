---
title: Sets, relations and functions
part: 1
lead: The vocabulary that specifications are written in. You will describe collections with sets, connect their elements with relations, find the states a system can reach, compare the sizes of sets with functions, and see why some infinite sets are larger than others, with Isabelle checking each step.
minutes: 210
needs: Modules 1–3 (propositional and predicate logic, and a first Isabelle theory)
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
can reach, the messages in transit, the keys stored in a table. Mathematics has one notion for all of
them, the **set**, and many specification languages are built on it: Z and B on set theory, Alloy on
relations, TLA+ on sets and functions. Isabelle/HOL has a library of sets too, and this module uses it
to check what you work out on paper.

The module builds the vocabulary in layers: sets first; then **relations**, which connect elements;
then **functions**, which are relations of a special kind; and finally the sizes of sets. Everything
rests on the logic of Modules 2 and 3. You will see that every law about sets in this module is a law of
logic in disguise, so the truth tables and quantifier rules you already know are enough to prove them.

### Elements and set-builder notation {#sets-notation}

A set is a collection of things, called its **elements**. The only question you can ask a set is
whether something is in it. $x \in A$ reads "x is an element of A", or "x is in A"; $x \notin A$ reads
"x is not in A" and abbreviates $\lnot (x \in A)$.

You can describe a set in two ways. A **listing** names its elements between braces: $\{2, 3, 5, 7\}$.
**Set-builder notation** describes the elements by a property: $\{x.\; P\,x\}$ reads "the set of all x
such that P x". The primes below 10 form the set $\{x.\; x \text{ is prime} \land x < 10\}$, which is
the set $\{2, 3, 5, 7\}$ again. Many books write $\{x \mid P(x)\}$; this series writes
$\{x.\; P\,x\}$, as Isabelle does. A common variant takes the elements from a given set $A$:
$\{x \in A.\; P\,x\}$ means $\{x.\; x \in A \land P\,x\}$.

Set-builder notation connects sets with the predicates of Module 3. Something belongs to
$\{x.\; P\,x\}$ exactly when it has the property $P$:

$$
a \in \{x.\; P\,x\} \iff P\,a
$$

A set and a predicate therefore carry the same information: from the predicate you get the set of
elements that satisfy it, and from the set you get the predicate "is in the set". In Isabelle/HOL, a set
of elements of some type is, in effect, a predicate on that type.

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

So $\{1, 2, 3\} = \{3, 1, 2\} = \{1, 1, 2, 3\}$: order and repetition in a listing do not matter.
Different descriptions can name the same set: $\{x.\; x \in \Z \land x^2 = 1\} = \{-1, 1\}$.

::: definition Subset, empty set, universe
$A$ is a **subset** of $B$, written $A \subseteq B$, when every element of $A$ is an element of $B$:
$\forall x.\; x \in A \imp x \in B$. It is a **proper subset**, $A \subset B$, when in addition
$A \neq B$. The **empty set** $\emptyset$ has no elements; Isabelle writes it `{}`. The **universe**
contains every element of the type; Isabelle calls it `UNIV`.
:::

::: fact Subsets and equality
For all sets $A$ and $B$:

1. $\emptyset \subseteq A$ and $A \subseteq A$.
2. $A = B \iff A \subseteq B \land B \subseteq A$.
:::

Both follow from the logic you know. For the first, $x \in \emptyset$ is false for every $x$, so the
implication $x \in \emptyset \imp x \in A$ is true for every $x$: an implication with a false premise is
true (Module 2). This is called **vacuous truth**, and you will meet it again. The second combines
extensionality with the propositional law $(p \iff q) \iff (p \imp q) \land (q \imp p)$. It is also
how you usually prove that two sets are equal: show that each is a subset of the other.

Because HOL is typed (Module 3), a universe is always the universe of one type: `UNIV :: bool set` is
$\{\mathit{True}, \mathit{False}\}$, and `UNIV :: nat set` contains all natural numbers. There is no set
of absolutely everything, and Section 4.7 shows why that is a good thing.

::: example Who may do what
A file server has the users alice, bob, carol and dave. The users who may read a certain file form the
set $R = \{\mathit{alice}, \mathit{bob}, \mathit{carol}\}$; those who may write it form
$W = \{\mathit{bob}, \mathit{dave}\}$; the administrators form $D = \{\mathit{bob}\}$.

- $D \subseteq W$, "every administrator may write", is true.
- $W \subseteq R$, "everyone who may write may also read", is false, and dave is the witness:
  $\mathit{dave} \in W$ but $\mathit{dave} \notin R$.
- $\emptyset \subseteq D$ is true, as it is for every set.

A security policy such as "writers must be able to read" is the statement $W \subseteq R$. Checking the
policy means checking a subset, and a violation comes with a witness.
:::

::: pitfall
Keep $\in$ and $\subseteq$ apart. $1 \in \{1, 2\}$ and $\{1\} \subseteq \{1, 2\}$ are both true, but
they say different things: the first is about an element, the second about a set. In HOL,
$\{1\} \in \{1, 2\}$ is not even false: it is a type error, because the elements of $\{1, 2\}$ are
numbers and $\{1\}$ is a set. In the same way, $\emptyset$ and $\{\emptyset\}$ differ: the first has no
elements, the second has one, the empty set.
:::

### Operations on sets {#sets-ops}

Each operation on sets is defined by a logical connective applied to membership.

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
contains everything of the type that is not in $A$, so $-A = \mathit{UNIV} - A$. Figure 4.1 draws the
four operations as Venn diagrams.

::: figure id=fig-04-1
The four operations as Venn diagrams. The rectangle is the universe, each circle a set, and the shaded
region the result. Under each diagram is the condition on $x$ that the region stands for.
:::

In the file-server example, $R \cap W = \{\mathit{bob}\}$ are the users who may read and write, and
$R \cup W$ contains all four users. $R - W = \{\mathit{alice}, \mathit{carol}\}$ are the read-only
users, and $W - R = \{\mathit{dave}\}$ is the user who violates the policy.

::: definition Power set
The **power set** $\pow(A)$ of a set $A$ is the set of all its subsets:
$\pow(A) = \{B.\; B \subseteq A\}$. Isabelle writes `Pow A`.
:::

$\pow(\{1, 2, 3\})$ has eight elements: $\emptyset$, $\{1\}$, $\{2\}$, $\{3\}$, $\{1, 2\}$, $\{1, 3\}$,
$\{2, 3\}$ and $\{1, 2, 3\}$. Choosing a subset means deciding, for each element, whether it is in or
out: two choices, three times, so $2^3 = 8$ subsets. Notice that $\emptyset$ and $A$ itself are always
elements of $\pow(A)$. Power sets grow fast, and you meet them in practice: a configuration of a program
with ten on-off feature flags is a subset of the set of flags, so there are $2^{10} = 1024$
configurations to test, and with forty flags there are more than a million million.

### Set laws are logic in disguise {#sets-laws}

Since every operation is defined by a connective, every law about the connectives (Module 2) gives a
law about sets. The table lists the most useful ones. Each has a **dual**, with $\cup$ and $\cap$
swapped (and $\emptyset$ and $\mathit{UNIV}$), that holds as well.

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

Why does this work in both directions? If the formulas are equivalent, then every $x$ is in the left
set exactly when it is in the right one, and extensionality makes the sets equal. If they are not, the
truth table has a row where the formulas differ. Take a universe with a single element $x$, and put $x$
into exactly those sets whose propositions are true in that row: then $x$ is in one side and not in
the other. So a truth table decides every equation of this kind, and a falsifying row is a
counterexample with one element. Isabelle uses this below.

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
work, and it is propositional logic. Write $A$, $B$ and $C$ for "$x \in A$", "$x \in B$" and
"$x \in C$", and the build checks it with a truth table:

```truthtable
A ∧ (B ∨ C) ⟷ A ∧ B ∨ A ∧ C
A ∧ (B ∨ C)
A ∧ B ∨ A ∧ C
```

Each row of the table is one region of a Venn diagram with three circles. The row where $A$ and $C$ are
true and $B$ is false, for example, is the region of the elements that are in $A$ and in $C$ but not in
$B$. A tautology says that the two sides agree on every region.
:::

::: example A law that fails
Is $A - (B - C) = (A - B) - C$? Translate both sides and compare:

```truthtable
A ∧ ¬(B ∧ ¬C) ⟷ A ∧ ¬B ∧ ¬C
A ∧ ¬(B ∧ ¬C)
A ∧ ¬B ∧ ¬C
```

The formulas differ in two rows, both with $A$ and $C$ true. Take the row where $A$ is true, $B$ false
and $C$ true: an element $x$ in $A$ and $C$ but not in $B$. With $A = \{x\}$, $B = \emptyset$ and
$C = \{x\}$, the left side is $\{x\} - (\emptyset - \{x\}) = \{x\} - \emptyset = \{x\}$, and the right
side is $(\{x\} - \emptyset) - \{x\} = \emptyset$. Set difference, like the subtraction of numbers, is
not associative.
:::

### Sets in Isabelle {#sets-isabelle}

::: isabelle
Isabelle's sets behave as on paper. Type the new symbols with their names after a backslash, or with
the abbreviations in the table:

| Symbol | Type | Meaning |
|---|---|---|
| ∈ | `\in` or `:` | is an element of |
| ∉ | `\notin` or `~:` | is not an element of |
| ⊆ | `\subseteq` or `(=` | is a subset of |
| ∪ | `\union` or `Un` | union |
| ∩ | `\inter` or `Int` | intersection |

Difference and complement use the ordinary minus sign `-`, and the empty set is `{}`. Compute with
finite sets using `value`, as in Module 1:

```isabelle
value "{1, 2, 3} ∪ {3, 4 :: nat}"
```

```output
```

One annotation, `:: nat`, fixes the element type of the whole expression; the result is a `nat set`.
Isabelle lists the elements in whatever order its computation produced them. By extensionality,
$\{2, 1, 3, 4\}$ is the set $\{1, 2, 3, 4\}$.

Set-builder notation works when the elements come from a finite set. `{0..10}` is the set of numbers
from 0 to 10, and `mod` gives the remainder of a division:

```isabelle
value "{x ∈ {0..10}. x mod 3 = (0::nat)}"
```

```output
```

The power set of a set of numbers is a set of sets of numbers, a `nat set set`:

```isabelle
value "Pow {1, 2, 3 :: nat}"
```

```output
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

Read the message from the bottom. The operator `(∈) {1}` ("is {1} an element of …") needs a set whose
elements are sets, a `??'a set set`; the operand is a set of numbers. Write `{1} ⊆ {1, 2}` or
`1 ∈ {1, 2}`, depending on what you mean.

Now prove a law. State it:

```isabelle
lemma "A ∩ (B ∪ C) = A ∩ B ∪ A ∩ C"
```

```output state
```

Isabelle prints `A ∩ B ∪ A ∩ C` without brackets because $\cap$ binds more tightly than $\cup$, as
$\land$ binds more tightly than $\lor$. The variables `A`, `B` and `C` are free, so the lemma claims the
law for all sets, whatever their element type (Module 3). Prove it:

```isabelle
  by auto
```

`auto` does what the paper proof did: it applies extensionality, replaces each membership by its
definition, and finishes with propositional reasoning. `blast` works as well; on sets these two are
the usual tools. Two more laws, De Morgan's and the link between set-builder notation and predicates:

```isabelle
lemma "- (A ∪ B) = - A ∩ - B"
  by auto

lemma "x ∈ {y. P y} ⟷ P x"
  by simp
```

A false law cannot be proved, but Nitpick (Module 2) finds a counterexample. The option
`card 'a = 1` asks it to search only a universe with one element, which is enough, as the fact above
showed:

```isabelle
lemma "A - (B - C) = (A - B) - (C :: 'a set)"
  nitpick [card 'a = 1]
  oops
```

```output result
```

The counterexample is the row of the truth table found above: the element a₁ is in `A` and `C` but not
in `B`. Isabelle/jEdit's automatic Quickcheck may already flag the lemma as you type it.
:::

::: pitfall
The annotation `(C :: 'a set)` matters. Without it, `-` could be the subtraction of any type, and
Isabelle reads the lemma as a claim about subtraction in general, not about sets. Nitpick then finds a
counterexample in which `A`, `B` and `C` are not sets at all, and it suspects the problem:

```isabelle
lemma "A - (B - C) = A - B - C"
  nitpick [card 'a = 2]
  oops
```

```output result
```

Of the operations in this section, only `-` also exists for other types. When a lemma about sets uses
no other operation, add a type annotation such as `:: 'a set` to one of the variables. `∪`, `∩`, `⊆`
and `∈` need none, because they exist only for sets.
:::

::: trouble
- **`Type unification failed: Clash of types "nat" and "bool"` in set-builder notation.** Many books
  write $\{x \mid x < 5\}$, but in Isabelle `|` is a way to type $\lor$:

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

  Isabelle read the set with the single element `x ∨ x < 5`, which needs `x` to be both a truth value
  and a number. Write `{x. x < 5}`, with a dot.
- **`Wellsortedness error` … `not of sort enum` from `value`.** `value` cannot compute
  `{x. x < (5::nat)}`: to list the elements it would have to try every natural number, and it can only
  do that for types with finitely many elements. Take the elements from a finite set instead, as in
  `{x ∈ {0..10}. x < 5}`. Lemmas about infinite sets are no problem: only `value` needs a finite set.
:::

## Relations {#relations}

A set says which things there are. A **relation** says how they are connected: which user has which
role, which function calls which, which state of a system can follow which. Relations are made of
pairs.

### Pairs and products {#products}

An **ordered pair** $(a, b)$ has a first component $a$ and a second component $b$. Unlike a set, a pair
has an order: $(1, 2) \neq (2, 1)$, although $\{1, 2\} = \{2, 1\}$. Two pairs are equal when their
components are: $(a, b) = (c, d) \iff a = c \land b = d$. Longer **tuples** such as $(a, b, c)$ work
the same way. In Isabelle a pair `(a, b)` has a type such as `nat × string`, read "nat times string".

::: definition Cartesian product
The **Cartesian product** of $A$ and $B$ is the set of all pairs whose first component is in $A$ and
whose second component is in $B$:

$$
A \times B = \{(a, b).\; a \in A \land b \in B\}
$$
:::

For example, $\{1, 2\} \times \{x, y\} = \{(1, x), (1, y), (2, x), (2, y)\}$: two choices for the first
component times two for the second gives four pairs. In general, a product of two finite sets has
$|A| \cdot |B|$ elements, where $|A|$ is the number of elements of $A$. Products are everywhere in
software: a database table with the columns name and age is a set of pairs, a subset of
$\mathit{Names} \times \mathit{Ages}$, and a timetable is a set of triples (lesson, room, time).

### Relations as sets of pairs {#rel-def}

::: definition Relation
A (binary) **relation** from $A$ to $B$ is a subset $R \subseteq A \times B$. A relation **on** $A$ is a
subset of $A \times A$. Instead of $(x, y) \in R$ one also writes $x \mathrel{R} y$, "x is related to y
by R". In Isabelle a relation on a type `'a` has the type `'a rel`, which is short for
`('a × 'a) set`.
:::

A relation is nothing but the set of pairs that are related. Some examples:

- The order $<$ on $\{1, 2, 3\}$ is the set $\{(1, 2), (1, 3), (2, 3)\}$.
- Equality on $A$ is the **identity relation** $\mathit{Id}_A = \{(x, x).\; x \in A\}$.
- "user $u$ has role $r$" is a relation from users to roles.
- "function $f$ calls function $g$" is a relation on the functions of a program, its **call graph**.
- "the system can move from state $s$ to state $t$ in one step" is a relation on the states of a system,
  its **transition relation** (Section 4.5).

A relation on a small finite set has two useful pictures. As a **directed graph**, it has a node for
each element, an arrow from $x$ to $y$ for each pair $(x, y) \in R$, and a loop at $x$ for the pair
$(x, x)$. As a **matrix**, it has a row and a column for each element, and a mark in row $x$ and
column $y$ when $(x, y) \in R$. The widget later in this section shows both.

### Properties of relations {#rel-props}

Six properties of relations come up again and again. They are written with the bounded quantifier
$\forall x \in A.\; P\,x$, which reads "for all x in A, P x" and means $\forall x.\; x \in A \imp P\,x$.

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

In the graph of a relation, each property has a shape you can check by eye:

| Property | In the graph |
|---|---|
| Reflexive | a loop at every node |
| Irreflexive | no loops at all |
| Symmetric | every arrow has a partner going back |
| Antisymmetric | no pair of arrows going both ways between different nodes |
| Transitive | every path of two arrows $x \to y \to z$ has a shortcut $x \to z$ |
| Total | any two different nodes are joined by an arrow in at least one direction |

::: note
Some books define totality for all $x$ and $y$, including $x = y$. This series follows Isabelle and
asks it only for different elements, so that the strict order $<$ counts as total. For reflexive
relations the two definitions agree.
:::

To show that a relation has a property, you check every case. To show that it lacks one, a single
**witness** is enough. Each property is a universally quantified statement, and by the quantifier law
$\lnot (\forall x.\; P\,x) \iff (\exists x.\; \lnot P\,x)$ of Module 3, it fails exactly when some
instance fails. A witness against transitivity, for example, is a triple $x, y, z$ with
$(x, y) \in R$ and $(y, z) \in R$ but $(x, z) \notin R$.

::: example Three relations on {1, 2, 3}
1. $\le$, that is $\{(1,1), (2,2), (3,3), (1,2), (1,3), (2,3)\}$, is reflexive, antisymmetric,
   transitive and total. It is not symmetric, witness $(1, 2)$: it is in the relation and $(2, 1)$ is
   not. It is not irreflexive, witness $(1, 1)$.
2. "one less than", $\{(1, 2), (2, 3)\}$, is irreflexive and antisymmetric. It is not transitive:
   $(1, 2)$ and $(2, 3)$ are in it but $(1, 3)$ is not. It is not total either, because neither
   $(1, 3)$ nor $(3, 1)$ is in it.
3. "has the same parity as", $\{(1,1), (2,2), (3,3), (1,3), (3,1)\}$, is reflexive, symmetric and
   transitive. It is not antisymmetric: $(1, 3)$ and $(3, 1)$ are both in it, but $1 \neq 3$.
:::

::: pitfall
- **Antisymmetric is not the same as "not symmetric".** Equality is both symmetric and antisymmetric;
  $\{(1, 2), (2, 1), (1, 3)\}$ is neither.
- **Irreflexive is not the same as "not reflexive".** On $\{1, 2\}$, the relation $\{(1, 1)\}$ is
  neither reflexive (it lacks $(2, 2)$) nor irreflexive (it contains $(1, 1)$).
- **Vacuous truth.** The empty relation is symmetric, antisymmetric and transitive: these properties
  are implications, and their premises never hold.
- **Transitivity includes the case $x = z$.** $\{(1, 2), (2, 1)\}$ is not transitive: $(1, 2)$ and
  $(2, 1)$ demand $(1, 1)$.
:::

::: widget name=relation-explorer
Click the cells of the grid to add or remove pairs; the graph and the list of properties update as you
click, with a witness for every property that fails. Load **Cycle**: which properties fail, and why?
Then add the transitive closure and see which pairs it adds. Can you build a relation that is symmetric
and antisymmetric but not empty? (Section 4.5 explains the closure buttons.)
:::

### Composition and converse {#rel-ops}

Two operations build new relations from old ones.

::: definition Converse, composition and image
The **converse** (or inverse) of $R$ reverses every pair: $R^{-1} = \{(y, x).\; (x, y) \in R\}$.
The **composition** of $R$ and $S$ takes an $R$-step followed by an $S$-step:

$$
R \mathbin{O} S = \{(x, z).\; \exists y.\; (x, y) \in R \land (y, z) \in S\}
$$

The **image** of a set $S$ under $R$ is the set of everything related to an element of $S$:
$R[S] = \{y.\; \exists x \in S.\; (x, y) \in R\}$. Isabelle writes `r¯` (type `^-1`), `r O s`, and
for the image ```r `` S```, with two backquotes.
:::

The converse of $<$ is $>$; the converse of "is a parent of" is "is a child of"; the converse of the
call graph says which function is called by which. In the graph of a relation, the converse turns
every arrow round. Composing "is a parent of" with itself gives "is a grandparent of".

Books write composition in different ways: $R \mathbin{;} S$, or $S \circ R$ by analogy with functions
(Section 4.6), which reverses the order. Isabelle's $R \mathbin{O} S$ reads from left to right: first
$R$, then $S$.

::: example Who may do what, with roles
Large systems do not grant permissions to users directly. They give users roles, and roles
permissions; this is **role-based access control**. With

$$
\begin{aligned}
\mathit{UR} &= \{(\mathit{alice}, \mathit{admin}), (\mathit{bob}, \mathit{guest})\}\\
\mathit{RP} &= \{(\mathit{admin}, \mathit{read}), (\mathit{admin}, \mathit{write}), (\mathit{guest}, \mathit{read})\}
\end{aligned}
$$

the permissions of each user are the composition
$\mathit{UR} \mathbin{O} \mathit{RP} = \{(\mathit{alice}, \mathit{read}), (\mathit{alice}, \mathit{write}), (\mathit{bob}, \mathit{read})\}$:
alice may read because she is an admin and admins may read.
:::

Properties of a relation can be stated with these operations instead of quantifiers:

::: fact Properties as equations
For relations $R$, $S$ and $T$:

1. $(R \mathbin{O} S) \mathbin{O} T = R \mathbin{O} (S \mathbin{O} T)$ and
   $(R \mathbin{O} S)^{-1} = S^{-1} \mathbin{O} R^{-1}$.
2. $R$ is symmetric exactly when $R^{-1} = R$.
3. $R$ is transitive exactly when $R \mathbin{O} R \subseteq R$.
4. $R$ is reflexive on $A$ exactly when $\mathit{Id}_A \subseteq R$.
:::

Take the third. $R \mathbin{O} R \subseteq R$ says: whenever $(x, z) \in R \mathbin{O} R$, that is,
whenever there is a $y$ with $(x, y) \in R$ and $(y, z) \in R$, then $(x, z) \in R$. That is the
definition of transitivity, with the existential quantifier moved out of the premise by the law
$((\exists y.\; P\,y) \imp Q) \iff (\forall y.\; P\,y \imp Q)$ of Module 3.

::: isabelle
Pairs and relations need no new syntax beyond `×` (type `\times` or `<*>`). A string in Isabelle is
written between two pairs of single quotes, `''alice''`; its type is printed as `char list`, a list of
characters.

```isabelle
value "{1, 2 :: nat} × {''x'', ''y''}"
```

```output
```

Isabelle names the six properties `refl_on A r`, `irrefl_on A r`, `sym_on A r`,
`antisym_on A r`, `trans_on A r` and `total_on A r`, where `A` is the set the relation is on. Without
`_on` and the set, they speak about the whole type: `refl r`, `sym r`, `trans r` and so on. For finite
relations, `value` decides them:

```isabelle
value "refl_on {1, 2, 3} {(1::nat, 1), (2, 2), (1, 2)}"
value "trans_on {1, 2, 3} {(1::nat, 2), (2, 3)}"
value "trans_on {1, 2, 3} {(1::nat, 2), (2, 3), (1, 3)}"
```

```output all
```

The first relation lacks `(3, 3)`; the second lacks the shortcut `(1, 3)`, which the third has.
Composition and converse compute as well. A line break inside the quotes is allowed:

```isabelle
value "{(''alice'', ''admin''), (''bob'', ''guest'')}
     O {(''admin'', ''read''), (''admin'', ''write''), (''guest'', ''read'')}"
```

```output
```

To prove the facts above for all relations, `auto` needs to see the definitions of `trans` and `sym`.
The library states each definition as a theorem named after the constant, `trans_def` and `sym_def`,
and `auto simp: trans_def` tells `auto` to use it. Module 9 explains this mechanism in depth.

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

Many specifications care about things only up to some detail. Two account numbers may belong to the
same customer; two inputs may have to be treated the same way by a program; two times of day may show
the same position on a clock. "Has the same … as" is the typical wording, and such relations share
three properties.

::: definition Equivalence relation and class
An **equivalence relation** on $A$ is a relation on $A$ that is reflexive on $A$, symmetric and
transitive. The **equivalence class** of $x \in A$ is the set of the elements related to it, the image
of $\{x\}$ under $R$:

$$
[x] = R[\{x\}] = \{y.\; (x, y) \in R\}
$$
:::

::: example Remainders
On $\{0, 1, \dots, 8\}$, let $x \sim y$ when $x$ and $y$ leave the same remainder on division by 3,
that is, $x \bmod 3 = y \bmod 3$. This is an equivalence relation: every number has its own remainder
(reflexive), "the same" does not depend on the order (symmetric), and if $x$ and $y$ have the same
remainder, and $y$ and $z$ too, then so do $x$ and $z$ (transitive). There are three classes:

$$
[0] = \{0, 3, 6\} \qquad [1] = \{1, 4, 7\} \qquad [2] = \{2, 5, 8\}
$$

A class has many names: $[4] = [1] = [7]$. Any element of a class can **represent** it.
:::

The classes in this example do not overlap, and together they cover the whole set. This is no
accident.

::: definition Partition
A **partition** of $A$ is a set of non-empty subsets of $A$, its **blocks**, such that every element of
$A$ is in exactly one block. In other words, the blocks are pairwise disjoint and their union is $A$.
:::

::: fact Equivalence relations and partitions
If $R$ is an equivalence relation on $A$, its equivalence classes form a partition of $A$. Conversely,
every partition of $A$ defines an equivalence relation, "is in the same block as", whose classes are
the blocks.
:::

Here is the proof of the first half. Each class $[x]$ is non-empty and the classes cover $A$, because
reflexivity puts every $x$ into its own class. It remains to show that two classes are either equal or
disjoint. Suppose $[x]$ and $[y]$ share an element $z$, so $(x, z) \in R$ and $(y, z) \in R$. By
symmetry $(z, y) \in R$, and by transitivity $(x, y) \in R$. Now take any $w \in [y]$, that is,
$(y, w) \in R$; transitivity gives $(x, w) \in R$, so $w \in [x]$. Hence $[y] \subseteq [x]$, and the
same argument with $x$ and $y$ swapped gives $[x] \subseteq [y]$. By Fact 4.1, $[x] = [y]$.

For the second half, "is in the same block as" is reflexive because every element is in some block,
symmetric because the wording is, and transitive because blocks do not overlap: if $x$ and $y$ share a
block and $y$ and $z$ share a block, both blocks contain $y$, so they are the same block.

Equivalence relations appear wherever software ignores a detail:

- **Testing.** Equivalence partitioning, a standard way of designing tests, splits the inputs into
  classes that the program should treat alike (for a shipping-cost function: parcels up to 1 kg, up to
  5 kg, heavier) and tests one representative of each class, plus the boundaries.
- **Abstraction.** For any function $f$, "has the same value under $f$" ($f\,x = f\,y$) is an
  equivalence relation. Module 12 uses this when it relates a concrete data structure to the abstract
  value it represents: two lists that hold the same elements in a different order represent the same
  set.

::: isabelle
Isabelle writes `equiv A r` for "r is an equivalence relation on A". The class of `x` is the image
of `{x}` under `r`, written ```r `` {x}```, and `A // r` ("A modulo r") is the set of all classes, the
partition. Here they are for the example, with the relation built by set-builder notation over a
product:

```isabelle
value "{(x, y) ∈ {0..8::nat} × {0..8}. x mod 3 = y mod 3} `` {4}"
```

```output
```

```isabelle
value "{0..8::nat} // {(x, y) ∈ {0..8} × {0..8}. x mod 3 = y mod 3}"
```

```output
```

For all natural numbers, not only up to 8, the relation is an equivalence. The proof unfolds the
definitions, as in Section 4.2:

```isabelle
lemma "equiv UNIV {(x, y). x mod 3 = (y::nat) mod 3}"
  by (auto simp: equiv_def refl_on_def sym_def trans_def)
```

The library proves the main fact of this section once and for all, as `quotient_disj`: two classes are
equal or disjoint. With `simp add:` you hand that theorem to the simplifier:

```isabelle
lemma "equiv A r ⟶ X ∈ A // r ⟶ Y ∈ A // r ⟶ X = Y ∨ X ∩ Y = {}"
  by (simp add: quotient_disj)
```
:::

## Orders and well-foundedness {#orders}

Orders compare things: version numbers, priorities, deadlines, "must happen before" in a schedule,
"is a subset of". Some of them compare any two elements; many do not.

### Partial and total orders {#partial-orders}

::: definition Partial, total and strict orders
A **partial order** on $A$ is a relation on $A$ that is reflexive on $A$, antisymmetric and transitive.
A **total order** (or linear order) is a partial order that is also total on $A$. A **strict order** is
a relation that is irreflexive and transitive.
:::

Partial orders are usually written $\le$ and strict orders $<$, and each gives the other: from a
partial order take $x < y \iff x \le y \land x \neq y$, and from a strict order take
$x \le y \iff x < y \lor x = y$. A strict order is automatically **asymmetric**: $x < y$ and $y < x$
would give $x < x$ by transitivity, which irreflexivity forbids.

::: example Orders, total and partial
- $\le$ on the numbers is a total order: of two different numbers, one is smaller.
- $\subseteq$ on $\pow(A)$ is a partial order, but not a total one: $\{1\}$ and $\{2\}$ are
  **incomparable**, as neither is a subset of the other.
- Divisibility on the positive integers, $a \mid b$ when $b = k \cdot a$ for some integer $k$, is a
  partial order: $a \mid a$; if $a \mid b$ and $b \mid a$ then $a = b$; and if $a \mid b$ and
  $b \mid c$ then $a \mid c$. It is not total: 2 and 3 are incomparable.
- "is a prefix of" on strings is a partial order: `ab` is a prefix of `abc`, and `ab` and `ba` are
  incomparable.
- Version numbers such as 2.10.1, compared component by component from the left, are totally ordered,
  although 2.10.1 comes after 2.9.3 while the string "2.10.1" comes before "2.9.3" in alphabetical
  order.
:::

### Hasse diagrams {#hasse}

The graph of a partial order has many arrows: a loop at every node, and a shortcut for every path.
A **Hasse diagram** leaves out everything that the properties of a partial order imply. It puts
smaller elements lower, draws no loops and no arrowheads, and draws a line from $x$ up to $y$ only
when $y$ **covers** $x$: when $x < y$ and no $z$ lies strictly between them. You recover the order by
following lines upwards: $x \le y$ when there is an upward path from $x$ to $y$.

::: figure id=fig-04-2
Two Hasse diagrams. Left: the subsets of $\{1, 2, 3\}$, ordered by $\subseteq$. Right: the divisors of
12, ordered by divisibility. Each line goes up from an element to an element that covers it.
:::

The diagrams make some special elements visible. In a partial order, $m$ is **minimal** when no element
is strictly below it, and **least** when it is below every element; **maximal** and **greatest** are
the same notions upside down. In Figure 4.2, $\emptyset$ and 1 are least, and $\{1, 2, 3\}$ and 12 are
greatest. A partial order can have several minimal elements and no least one: in $\{2, 3, 4, 6\}$
ordered by divisibility, both 2 and 3 are minimal, and 4 and 6 are both maximal.

A project plan is a partial order too. If "task $x$ must be finished before task $y$ starts" contains
no cycle, its reflexive and transitive version (Section 4.5) is a partial order on the tasks. The
minimal tasks are those that can start now, and listing all tasks in an order compatible with the
partial order, called a **topological sort**, gives a schedule.

### Well-founded relations {#well-founded}

Some orders let you go down forever and some do not. On the natural numbers, every descending chain
$n > m > k > \dots$ stops after at most $n$ steps. On the integers, $0 > -1 > -2 > \dots$ never stops.
This difference is what makes induction and termination proofs work.

::: definition Well-founded relation
Read $(y, x) \in R$ as "$y$ is smaller than $x$". $R$ is **well-founded** when there is no infinite
descending chain, that is, no infinite sequence $x_0, x_1, x_2, \dots$ with $(x_{i+1}, x_i) \in R$ for
every $i$.
:::

An equivalent formulation, which this series uses without proof, is that every non-empty set $S$ has
an $R$-**minimal** element: some $m \in S$ such that no $y \in S$ has $(y, m) \in R$.

- $<$ on $\N$ is well-founded. $<$ on $\Z$ is not, and neither is $<$ on the non-negative rationals:
  $1 > \tfrac{1}{2} > \tfrac{1}{4} > \dots$ is an infinite descending chain.
- Every well-founded relation is irreflexive, since $(x, x) \in R$ gives the chain $x, x, x, \dots$.
  So $<$ on $\N$ is well-founded and $\le$ is not.
- "is a proper subset of" on finite sets is well-founded, because the number of elements goes down
  at each step. "is the tail of", which relates a list to the list with one element more in front, is
  well-founded on lists, because the length goes down.
- A relation on a finite set is well-founded exactly when it has no cycle, no path
  $x \to \dots \to x$. (Isabelle's library proves this as `wf_iff_acyclic_if_finite`.)

::: keyidea
Well-founded relations are the reason why programs terminate and why induction is sound.

- **Termination.** If every iteration of a loop, or every recursive call, moves to a smaller value in a
  well-founded relation, the computation stops: an infinite computation would be an infinite
  descending chain. Euclid's algorithm `gcd m n = gcd n (m mod n)` terminates because the second
  argument decreases in $<$ on $\N$: $m \bmod n < n$ whenever $n > 0$. When you define a function with
  `fun`, Isabelle looks for such a relation; that is the "termination order" it reported in Module 1.
- **Induction.** To prove $P\,x$ for all $x$, it suffices to prove $P\,x$ under the assumption that $P$
  holds for everything smaller than $x$. If $P$ failed anywhere, the set of counterexamples would have a
  minimal element $m$; but $P$ holds below $m$, so the step proves $P\,m$, a contradiction.

Module 5 builds both ideas on this foundation.
:::

::: isabelle
Isabelle writes `wf r` for "r is well-founded", with the same reading of pairs: `(y, x) ∈ r` means that
`y` is smaller. The library knows that `<` on the natural numbers is well-founded:

```isabelle
lemma "wf {(x, y). x < (y::nat)}"
  by simp
```

The command `thm` displays a theorem of the library by its name. Here is the one that says that
well-founded means "no infinite descending chain":

```isabelle
thm wf_iff_no_infinite_down_chain
```

```output result
```

The chain is a function `f` from the natural numbers: `f 0`, `f 1`, `f 2`, … , and `Suc i` is `i + 1`.
The formula says that `r` is well-founded exactly when there is no (`∄`) chain in which each element
is smaller than the one before. The question mark in `?r` marks a variable of the theorem, which can be
any relation; Module 7 says more about these variables.

Orders can be checked on finite examples with `value`. Two incomparable sets show that $\subseteq$ is
not total:

```isabelle
value "{1::nat} ⊆ {2} ∨ {2} ⊆ {1::nat}"
```

```output
```
:::

## Closures and reachability {#closures}

A relation often lacks a property you need. "calls" is not transitive, but "can call, directly or
indirectly" is. "can move in one step" is not transitive, but "can reach" is. A **closure** adds the
pairs that are missing, and nothing else.

### Closures {#closure-def}

::: definition Closures
The **reflexive**, **symmetric** or **transitive closure** of a relation $R$ is the smallest relation
that contains $R$ and has the property; "smallest" means that it is contained in every other such
relation.

- Reflexive closure on $A$: $R \cup \mathit{Id}_A$.
- Symmetric closure: $R \cup R^{-1}$.
- Transitive closure: $R^+ = R \cup (R \mathbin{O} R) \cup (R \mathbin{O} R \mathbin{O} R) \cup \dots$;
  $(x, y) \in R^+$ when there is a path of one or more $R$-steps from $x$ to $y$.
- **Reflexive-transitive closure**: $R^* = \mathit{Id} \cup R^+$, paths of zero or more steps.

Isabelle writes `r⇧+` and `r⇧*` (type `r^+` and `r^*`); its names are `trancl` and `rtrancl`.
:::

::: example A chain and its closure
Let $R = \{(1, 2), (2, 3), (3, 4)\}$ on $\{1, 2, 3, 4\}$. Paths of two steps give
$R \mathbin{O} R = \{(1, 3), (2, 4)\}$, paths of three steps give $\{(1, 4)\}$, and there are no paths
of four steps. So

$$
R^+ = \{(1, 2), (2, 3), (3, 4), (1, 3), (2, 4), (1, 4)\}
$$

which is the order $<$ on $\{1, 2, 3, 4\}$, and $R^*$ adds the four pairs $(x, x)$, which gives $\le$.
The left half of Figure 4.3 draws $R$ with the pairs that $R^+$ adds.
:::

On a set with $n$ elements, paths longer than $n$ steps add nothing new: such a path visits some node
twice, and cutting out the loop between the two visits gives a shorter path with the same ends. So
$R^+ = R \cup R^2 \cup \dots \cup R^n$, where $R^k$ is $R$ composed with itself $k$ times, and you can
compute it by composing until nothing changes. This is what the closure buttons of the widget in
Section 4.2 do.

::: pitfall
- **Zero steps count in $R^*$.** $(x, x) \in R^*$ for every $x$, even when $R$ has no loop at $x$.
  $R^+$, by contrast, contains $(x, x)$ only when a cycle passes through $x$.
- **The order of closures matters.** To make a relation into an equivalence relation, close it under
  symmetry first and then under reflexivity and transitivity: $(R \cup R^{-1})^*$. Closing the other way
  round can fail. For $R = \{(1, 3), (2, 3)\}$, the elements 1 and 2 are equivalent in
  $(R \cup R^{-1})^*$, through $1 \to 3 \to 2$, but $R^* \cup (R^*)^{-1}$ does not relate them.
:::

### Reachability in a state machine {#reachability}

Module 1 described model checkers, which explore every reachable state of a system. Reachability is the
reflexive-transitive closure.

::: definition State machine and reachability
A **state machine** (or transition system) consists of a set of **states**, a set of **initial**
states, and a **transition relation** $T$ on the states: $(s, t) \in T$ when the system can move from
$s$ to $t$ in one step. A state $t$ is **reachable** when $(s, t) \in T^*$ for some initial state $s$;
so the reachable states are the image $T^*[I]$ of the set $I$ of initial states. A **safety property**
says that no reachable state is bad.
:::

::: example A door with a lock
A door is open or closed, and its bolt is locked or unlocked, which gives four states: CL (closed and
locked), CU (closed and unlocked), OU (open and unlocked) and OL (open and locked). OL is bad: the bolt
sticks out of an open door and will damage the frame when the door closes. The transitions are
*unlock* (CL to CU), *lock* (CU to CL), *open* (CU to OU) and *close* (OU to CU), and the door starts
in CL.

From CL the door can only go to CU; from CU it can go to CL or OU; from OU it can only go back to CU.
So the reachable states are CL, CU and OU. OL is not reachable: the safety property "the door is never open and locked" holds.

Now suppose a designer makes the lock button work in every state. That adds the transition OU to OL,
and OL becomes reachable along the path CL, CU, OU, OL. That path is a **counterexample trace**, the
kind of answer a model checker gives when a property fails.
:::

::: figure id=fig-04-3
Closures. Left: the relation $\{(1, 2), (2, 3), (3, 4)\}$ (solid) and the pairs its transitive
closure adds (dashed). Right: the door as a state machine. The shaded states are reachable from CL; the
red dashed transition is the one the designer added, which makes the bad state OL reachable.
:::

For four states you can follow the arrows by hand. Real systems have billions of states, or infinitely
many, which is why model checkers compute reachability by machine and why Module 13 proves safety
properties with invariants instead of listing states.

::: isabelle
To give the door's transition relation a name, use `definition`. It is like `fun` in Module 1, but for
a value without arguments (Module 8 says more about both):

```isabelle
definition door :: "(string × string) set" where
  "door = {(''CL'', ''CU''), (''CU'', ''CL''), (''CU'', ''OU''), (''OU'', ''CU'')}"
```

```output
```

The reachable states are the image of the initial state under the reflexive-transitive closure:

```isabelle
value "door⇧* `` {''CL''}"
```

```output
```

The bad state is not reachable in the design, and is reachable once the extra transition is added:

```isabelle
value "''OL'' ∈ door⇧* `` {''CL''}"
value "''OL'' ∈ (door ∪ {(''OU'', ''OL'')})⇧* `` {''CL''}"
```

```output all
```

The transitive closure of the chain in the example above:

```isabelle
value "{(1::nat, 2), (2, 3), (3, 4)}⇧+"
```

```output
```

And for all relations: $R^+$ contains $R$, it is transitive, and closing a closure again adds
nothing:

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

Programs are full of functions, and so are specifications. Mathematically, a function is a relation in
which every input has exactly one output.

### Functions as relations {#fun-def}

::: definition Function
A **function** $f$ from $A$ to $B$, written $f : A \to B$, is a relation $f \subseteq A \times B$ in
which every $a \in A$ is related to exactly one $b \in B$; one writes $f\,a = b$. $A$ is the
**domain** of $f$ and $B$ its **codomain**. The **image** of a set $S \subseteq A$ is
$f[S] = \{f\,a.\; a \in S\}$, and the image of the whole domain is the **range** of $f$.
:::

The codomain says where the values may lie, the range where they do lie: for the squaring function
$\N \to \N$, the codomain is $\N$ and the range is $\{0, 1, 4, 9, \dots\}$.

In HOL, functions are not sets of pairs. `nat ⇒ nat` is a type of its own (Module 1), and its elements
are written with $\lambda$: `λn. 2 * n` is the function that takes `n` to `2 * n`, written
$n \mapsto 2n$ in mathematics (type `\lambda` or `%` for λ). Every HOL function is **total**: it has a
value for every element of its argument type. The set of pairs $\{(x, f\,x).\; x \in A\}$ is called the
**graph** of $f$. Isabelle writes the image of a set as `` f ` A `` (one backquote) and the range as
`range f`.

A relation in which every input has *at most* one output is a **partial function**. A program that can
loop forever or raise an error computes a partial function; HOL models the missing values explicitly,
for example with an extra result that means "no value".

### Injective, surjective, bijective {#inj-surj}

::: definition Injective, surjective, bijective
A function $f : A \to B$ is

- **injective** (one-to-one) when different inputs give different outputs:
  $\forall x \in A.\; \forall y \in A.\; f\,x = f\,y \imp x = y$;
- **surjective** (onto $B$) when every element of $B$ is an output:
  $\forall b \in B.\; \exists a \in A.\; f\,a = b$, that is, $f[A] = B$;
- **bijective** when it is both. A bijection pairs the elements of $A$ and $B$ one to one.
:::

::: example Four functions on numbers
- $n \mapsto 2n$ on $\N$ is injective, since $2x = 2y$ implies $x = y$, but not surjective: 1 is not
  an output.
- $n \mapsto n \operatorname{div} 2$ on $\N$ (division rounding down) is surjective, since $m$ is the
  output for $2m$, but not injective: 0 and 1 both give 0.
- $n \mapsto n + 1$ on $\N$ is injective but not surjective: 0 is not an output.
- $n \mapsto n + 1$ on $\Z$ is bijective; every integer $m$ is the output for exactly one input, $m - 1$.
:::

Notice that the last two functions have the same formula and different properties: whether a function
is surjective depends on its domain and codomain. In software, injectivity means "no collisions". A
function that assigns account numbers to customers must be injective. An encryption function must be
injective, or two messages would encrypt to the same text and decryption could not tell them apart. A
hash function from strings to 64-bit numbers cannot be injective, for reasons Section 4.7 makes
precise.

### Inverses and composition {#inverse}

::: definition Composition and inverse
The **composition** of $f : A \to B$ and $g : B \to C$ is $g \circ f : A \to C$, with
$(g \circ f)\,x = g\,(f\,x)$: first $f$, then $g$; read "g after f". A function $g : B \to A$ is an
**inverse** of $f$ when $g\,(f\,a) = a$ for all $a \in A$ and $f\,(g\,b) = b$ for all $b \in B$.
:::

::: fact Composition and inverses
1. If $f$ and $g$ are injective, so is $g \circ f$. If they are surjective, so is $g \circ f$. Hence the
   composition of two bijections is a bijection.
2. A function has an inverse exactly when it is bijective. The inverse is then unique, written $f^{-1}$,
   and its graph is the converse of the graph of $f$.
3. For bijections, $(g \circ f)^{-1} = f^{-1} \circ g^{-1}$.
:::

The first part, for injectivity: if $g\,(f\,x) = g\,(f\,y)$, then $f\,x = f\,y$ because $g$ is
injective, and then $x = y$ because $f$ is. The third part is sometimes called the socks-and-shoes rule:
you put on socks, then shoes, and take them off in the opposite order. A decoder for a message that was
first compressed and then encrypted must first decrypt and then decompress.

::: isabelle
Isabelle's names are `inj f`, `surj f` and `bij f` for functions on whole types, `inj_on f A` and
`bij_betw f A B` for functions on sets, `inv f` for the inverse and `g ∘ f` for composition (type
`\circ`). State that doubling is injective:

```isabelle
lemma "inj (λn::nat. 2 * n)"
```

```output state
```

Isabelle prints the function `λn. 2 * n` in a shorter form, `(*) 2`: multiplication with its first
argument fixed to 2. As in Section 4.2, the proof needs the definition, here `inj_def`:

```isabelle
  by (auto simp: inj_def)
```

More properties of the functions above, and the fact about composition:

```isabelle
lemma "¬ surj (λn::nat. n + 1)"
  by (auto simp: surj_def)

lemma "bij (λn::int. n + 1)"
  by (auto simp: bij_def inj_def surj_def)

lemma "inj f ⟶ inj g ⟶ inj (g ∘ f)"
  by (auto simp: inj_def)
```

`inv f` exists for every function, but it is an inverse only when `f` is a bijection. For an injective
`f`, it undoes `f`:

```isabelle
lemma "inj f ⟶ inv f (f x) = x"
  by simp
```

On finite sets, `value` decides these properties. Adding 1 and taking the remainder by 3 rotates
$\{0, 1, 2\}$, a bijection of the set onto itself:

```isabelle
value "bij_betw (λx::nat. (x + 1) mod 3) {0, 1, 2} {0, 1, 2}"
```

```output
```
:::

::: pitfall
When `f` is not surjective, `inv f y` still has a value for a `y` outside the range, because every HOL
function is total, but nothing is known about that value. Facts about `inv f` therefore need an
assumption such as `inj f`, `surj f` or `bij f`.
:::

## Counting: cardinality and Cantor's theorem {#cardinality}

How many elements does a set have? For finite sets you count. For infinite sets you cannot count, but
you can still compare sizes, with functions. The comparison holds a surprise.

### Finite sets {#finite}

::: definition Cardinality
The **cardinality** $|A|$ of a finite set $A$ is its number of elements. Isabelle writes `card A`, and
`finite A` for "A is finite".
:::

::: fact Counting rules
For finite sets $A$ and $B$:

1. $|A \cup B| = |A| + |B| - |A \cap B|$, and so $|A \cup B| = |A| + |B|$ when $A$ and $B$ are
   disjoint.
2. $|A \times B| = |A| \cdot |B|$ and $|\pow(A)| = 2^{|A|}$.
3. If there is an injective function from $A$ to $B$, then $|A| \le |B|$; if there is a bijection, then
   $|A| = |B|$.
:::

The first rule is called **inclusion–exclusion**: adding $|A|$ and $|B|$ counts the elements of
$A \cap B$ twice, so you subtract them once. In the file-server example,
$|R \cup W| = 3 + 2 - 1 = 4$.

The third rule compares sizes without counting: a bijection pairs off the elements of the two sets.
That idea still works when counting is impossible, and it is how the rest of this section compares
infinite sets.

### The pigeonhole principle {#pigeonhole}

::: fact The pigeonhole principle
If $A$ and $B$ are finite and $|A| > |B|$, then no function $f : A \to B$ is injective: some two
different elements of $A$ have the same image. More precisely, some element of $B$ is the image of at
least $\lceil |A| / |B| \rceil$ elements of $A$.
:::

If more pigeons than holes fly into the holes, some hole holds two pigeons. The principle is obvious
once stated, and surprisingly strong:

- Among any 13 people, two were born in the same month.
- A hash table with 1000 keys and 256 buckets has a bucket with at least
  $\lceil 1000 / 256 \rceil = 4$ keys, whatever the hash function. A hash function from all strings to
  64-bit numbers cannot be injective, since there are more strings than numbers.
- No lossless compression program makes every file shorter. There are $2^n$ files of $n$ bits but only
  $2^0 + 2^1 + \dots + 2^{n-1} = 2^n - 1$ shorter files, so two files of $n$ bits would be compressed to
  the same output, and decompression could not restore both.

::: isabelle
`card` counts, and repeated elements count once:

```isabelle
value "card {1, 2, 3, 2, 1 :: nat}"
value "card (Pow {1, 2, 3 :: nat})"
```

```output all
```

Thirteen numbers have only twelve possible remainders by 12, so the remainder function is not
injective on them:

```isabelle
value "inj_on (λn::nat. n mod 12) {0..12}"
```

```output
```

The library proves the counting rules for all finite sets; the rule for power sets is called
`card_Pow`, and the pigeonhole principle `pigeonhole`. Use them with `simp add:`:

```isabelle
lemma "finite A ⟶ card (Pow A) = 2 ^ card A"
  by (simp add: card_Pow)
```
:::

::: pitfall
In Isabelle, `card` of an infinite set is 0. That keeps `card` a total function, but it means that a
statement about `card` usually needs the assumption `finite A`, as in the lemma above.

```isabelle
lemma "card (UNIV :: nat set) = 0"
  by simp
```
:::

### Countable sets {#countable}

For infinite sets, take rule 3 of Fact 4.6 as the definition of size: two sets have the **same
cardinality** when there is a bijection between them. Strange things happen at once. The even numbers
are a proper subset of $\N$, yet $n \mapsto 2n$ is a bijection from $\N$ to the even numbers, so the
two sets have the same cardinality. An infinite set can be as large as a part of itself.

::: definition Countable set
A set $A$ is **countable** when there is an injective function from $A$ to $\N$. Equivalently, $A$ is
finite or its elements can be listed as $a_0, a_1, a_2, \dots$, every element appearing somewhere in
the list.
:::

Many sets are countable:

- The integers: list them as $0, 1, -1, 2, -2, 3, \dots$.
- Pairs of natural numbers, $\N \times \N$: list them diagonal by diagonal, $(0, 0)$, $(0, 1)$,
  $(1, 0)$, $(0, 2)$, $(1, 1)$, $(2, 0)$, …, so that the pairs whose components add up to $k$ come in
  the $k$-th round. The rational numbers, which are fractions of integers, are countable for the same
  reason.
- All finite strings over a finite alphabet: list them by length, and strings of the same length
  alphabetically. In particular, the programs of any programming language form a countable set.

Are all infinite sets countable, then? No, and the proof is one of the most famous in mathematics.

### Cantor's theorem {#cantor}

::: fact Cantor's theorem
For every set $A$, no function $f : A \to \pow(A)$ is surjective.
:::

Since $a \mapsto \{a\}$ is an injective function from $A$ to $\pow(A)$, the power set is at least as
large as $A$; Cantor's theorem says that it is strictly larger. Georg Cantor published the proof below,
the **diagonal argument**, in 1891.

Take any function $f : A \to \pow(A)$. For each $x \in A$, $f\,x$ is a set, which may or may not
contain $x$ itself. Collect the elements that are not in their own set:

$$
D = \{x \in A.\; x \notin f\,x\}
$$

$D$ is a subset of $A$, so $D \in \pow(A)$. Suppose $f$ were surjective. Then $D = f\,d$ for some
$d \in A$. Is $d$ in $D$? By the definition of $D$,

$$
d \in D \iff d \notin f\,d \iff d \notin D
$$

and a proposition equivalent to its own negation is impossible:

```truthtable
P ⟷ ¬P
```

So no $d$ has $f\,d = D$, and $f$ is not surjective. Figure 4.4 shows where the name comes from.

::: figure id=fig-04-4
The diagonal argument for $A = \N$. Row $i$ shows which numbers are in the set $f\,i$ (1 for "in",
0 for "not in"). $D$ flips the diagonal, so it differs from the set $f\,i$ at position $i$, for every
$i$: $D$ is in no row.
:::

Take $A = \N$. Each subset of $\N$ is a **decision problem**: "is this number prime?", "is this number
the code of a program that halts?". Each program that answers yes or no decides one such set. Programs
are countable, so the decidable sets can be listed as $f\,0, f\,1, f\,2, \dots$, and Cantor's argument
then produces a set $D$ that no program decides. Undecidable problems must exist. Turing's proof that
the halting problem is undecidable (Module 1) is a diagonal argument of the same kind.

::: note
Bertrand Russell found in 1901 that the same trick breaks naive set theory. If there were a set of all
sets, then $R = \{x.\; x \notin x\}$ would be a set, and $R \in R \iff R \notin R$. Typed logic avoids
the paradox: in HOL, `x ∈ x` is a type error, because a set and its elements have different types. This
is the good reason, promised in Section 4.1, why there is no set of everything.
:::

::: isabelle
The core of the proof is that the diagonal set is not a value of `f`. `range f` is the set of all
values of `f`:

```isabelle
lemma diagonal: "{x. x ∉ f x} ∉ range f"
  by auto
```

Cantor's theorem for every type follows, and `blast` finds the proof on its own:

```isabelle
lemma cantor: "¬ surj (f :: 'a ⇒ 'a set)"
  by blast
```

In particular, no sequence `f 0`, `f 1`, `f 2`, … of sets of natural numbers contains them all. The
lemma is named `cantor`, so a later proof can use it:

```isabelle
lemma "¬ surj (f :: nat ⇒ nat set)"
  by (simp add: cantor)
```

The library has the theorem for any set `A`, not only for whole types, under the name
`Cantors_theorem` (`∄` reads "there is no"):

```isabelle
thm Cantors_theorem
```

```output result
```
:::

## What you learned {#summary}

- A **set** is determined by its elements (**extensionality**). Sets are given by listing or by
  **set-builder notation** $\{x.\; P\,x\}$, and $a \in \{x.\; P\,x\} \iff P\,a$. In HOL every set has an
  element type, and `UNIV` is the set of all elements of a type.
- **Union, intersection, difference and complement** are $\lor$, $\land$, "and not" and $\lnot$ applied
  to membership, so every set law of this kind is a propositional law, and a falsifying row of its
  truth table is a counterexample with one element. Isabelle proves such laws with `auto` or `blast`.
- A **relation** is a set of pairs. It can be **reflexive, irreflexive, symmetric, antisymmetric,
  transitive or total**; a property fails exactly when a witness exists. **Converse** and
  **composition** build new relations, and properties can be written as equations between relations.
- **Equivalence relations** (reflexive, symmetric, transitive) correspond exactly to **partitions**.
  **Partial orders** (reflexive, antisymmetric, transitive) are drawn as **Hasse diagrams**.
  **Well-founded** relations have no infinite descending chains, which is why programs terminate and
  induction works.
- The **transitive closure** $R^+$ and the **reflexive-transitive closure** $R^*$ (`r⇧+`, `r⇧*`) add the
  pairs joined by paths. The **reachable states** of a state machine are the image of its initial
  states under $T^*$.
- A **function** relates every input to exactly one output. It can be **injective, surjective or
  bijective**, and it has an inverse exactly when it is bijective. Isabelle writes `inj`, `surj`,
  `bij` and `inv`.
- **Cardinality** counts finite sets (`card`, `finite`); the **pigeonhole principle** says that no
  function into a smaller finite set is injective. **Cantor's diagonal argument** shows that no set can
  be mapped onto its power set, so some sets are uncountable and some problems have no program.

## Exercises {#exercises}

:::: exercise Sets by hand {#ex-4-1} ★
Let $A = \{1, 2, 3, 4\}$, $B = \{3, 4, 5\}$ and $C = \{1, 5\}$.

1. Compute $A \cup B$, $A \cap B$, $A - B$, $B - A$ and $A \cap B \cap C$.
2. Compute $C \times \{0, 1\}$ and $\pow(C)$.
3. Which of these are true: $C \subseteq A \cup B$, $\emptyset \in \pow(C)$, $\{5\} \in \pow(C)$,
   $5 \subseteq C$?

Check your answers to the first two parts with `value`.

::: solution
1. $A \cup B = \{1, 2, 3, 4, 5\}$, $A \cap B = \{3, 4\}$, $A - B = \{1, 2\}$, $B - A = \{5\}$ and
   $A \cap B \cap C = \emptyset$.
2. $C \times \{0, 1\} = \{(1, 0), (1, 1), (5, 0), (5, 1)\}$ and
   $\pow(C) = \{\emptyset, \{1\}, \{5\}, \{1, 5\}\}$.
3. $C \subseteq A \cup B$ is true. $\emptyset \in \pow(C)$ and $\{5\} \in \pow(C)$ are true, since
   $\emptyset$ and $\{5\}$ are subsets of $C$. $5 \subseteq C$ makes no sense: 5 is a number, not a
   set. In Isabelle it is a type error.

```isabelle
value "{1, 2, 3, 4} - {3, 4, 5 :: nat}"
value "{1, 2, 3, 4} ∩ {3, 4, 5} ∩ {1, 5 :: nat}"
value "{1, 5 :: nat} × {0, 1 :: nat}"
value "Pow {1, 5 :: nat}"
```

```output all
```
:::
::::

:::: exercise Properties of relations {#ex-4-2} ★
Decide which of the six properties of Section 4.2 these relations on $\{1, 2, 3, 4\}$ have. For every
property that fails, give a witness. You can check your answers with the widget of Section 4.2.

1. $R_1 = \{(1, 1), (2, 2), (3, 3), (4, 4), (1, 2), (2, 1)\}$
2. $R_2 = \{(1, 2), (2, 3), (3, 1)\}$
3. $R_3 = \{(1, 2), (1, 3), (1, 4)\}$
4. $R_4 = \emptyset$

::: solution
1. $R_1$ is reflexive, symmetric and transitive: an equivalence relation with the classes $\{1, 2\}$,
   $\{3\}$ and $\{4\}$. It is not irreflexive (witness $(1, 1)$), not antisymmetric ($(1, 2)$ and
   $(2, 1)$, but $1 \neq 2$) and not total (neither $(1, 3)$ nor $(3, 1)$).
2. $R_2$, a cycle, is irreflexive and antisymmetric. It is not reflexive (no $(1, 1)$), not symmetric
   ($(1, 2)$ without $(2, 1)$), not transitive ($(1, 2)$ and $(2, 3)$ without $(1, 3)$) and not total
   (neither $(1, 4)$ nor $(4, 1)$).
3. $R_3$ is irreflexive, antisymmetric and transitive: no path has two steps, so transitivity holds
   vacuously. It is not reflexive ($(1, 1)$ is missing), not symmetric ($(1, 2)$ without $(2, 1)$) and
   not total (neither $(2, 3)$ nor $(3, 2)$). It is a strict order.
4. $R_4$ is irreflexive, symmetric, antisymmetric and transitive, all vacuously. It is not reflexive
   ($(1, 1)$ is missing) and not total (neither $(1, 2)$ nor $(2, 1)$).
:::
::::

:::: exercise Partitions {#ex-4-3} ★
Which of these are partitions of $\{1, 2, 3, 4, 5, 6\}$? For each one that is, list the equivalence
classes of 1 and of 4 under the equivalence relation it defines.

1. $\{\{1, 2\}, \{3, 4, 5, 6\}\}$
2. $\{\{1, 2, 3\}, \{3, 4, 5, 6\}\}$
3. $\{\{1\}, \{2\}, \{3\}, \{4\}, \{5\}, \{6\}\}$
4. $\{\{1, 2\}, \{3, 4\}, \{5\}\}$
5. $\{\emptyset, \{1, 2, 3\}, \{4, 5, 6\}\}$

::: solution
1. A partition. $[1] = \{1, 2\}$ and $[4] = \{3, 4, 5, 6\}$.
2. Not a partition: 3 is in two blocks.
3. A partition, the finest one. $[1] = \{1\}$ and $[4] = \{4\}$; the equivalence relation is equality.
4. Not a partition: 6 is in no block.
5. Not a partition: blocks must be non-empty. Without $\emptyset$ it would be one, with
   $[1] = \{1, 2, 3\}$ and $[4] = \{4, 5, 6\}$.
:::
::::

:::: exercise A set law, two ways {#ex-4-4} ★★
1. Prove $A - (B \cup C) = (A - B) \cap (A - C)$ on paper by translating it into propositional logic, as
   in Section 4.1, and then in Isabelle.
2. Someone claims $(A \cup B) - C = A \cup (B - C)$. Find a counterexample with a truth table, then let
   Nitpick find one, and compare the two.

::: solution
1. For any $x$:
   $x \in A - (B \cup C) \iff x \in A \land \lnot (x \in B \lor x \in C)
   \iff x \in A \land \lnot (x \in B) \land \lnot (x \in C)$ by De Morgan, and
   $x \in (A - B) \cap (A - C) \iff (x \in A \land x \notin B) \land (x \in A \land x \notin C)$, which
   is equivalent to the same formula because $p \land p \iff p$. In Isabelle:

   ```isabelle
   lemma "A - (B ∪ C) = (A - B) ∩ (A - C)"
     by auto
   ```

   No type annotation is needed here, because `∪` and `∩` only exist for sets.
2. The translation $(A \lor B) \land \lnot C \iff A \lor (B \land \lnot C)$ fails exactly when $A$ and
   $C$ are true: the left side is false, the right side true. So an element in $A$ and in $C$ is a
   counterexample: with $A = C = \{x\}$ and $B = \emptyset$, the left side is $\emptyset$ and the right
   side is $\{x\}$. Nitpick finds the same:

   ```isabelle
   lemma "(A ∪ B) - C = A ∪ (B - C)"
     nitpick [card 'a = 1]
     oops
   ```

   ```output result
   ```
:::
::::

:::: exercise Who calls whom {#ex-4-5} ★★
A program has the functions main, parse, lex, eval and apply, with the call graph
$\{(\mathit{main}, \mathit{parse}), (\mathit{parse}, \mathit{lex}), (\mathit{main}, \mathit{eval}), (\mathit{eval}, \mathit{apply}), (\mathit{apply}, \mathit{eval})\}$.

1. Compute by hand which functions main can call, directly or indirectly.
2. A function is recursive when it can call itself, directly or indirectly. Express this with the
   transitive closure, and find the recursive functions.
3. Check both answers in Isabelle.

::: solution
1. main calls parse and eval; parse calls lex; eval calls apply. So main can call parse, lex, eval and
   apply: the image of $\{\mathit{main}\}$ under the transitive closure.
2. $f$ is recursive when $(f, f) \in \mathit{calls}^+$. eval and apply are recursive, through the cycle
   eval, apply, eval; main, parse and lex are not.
3. With a definition for the call graph:

```isabelle
definition calls :: "(string × string) set" where
  "calls = {(''main'', ''parse''), (''parse'', ''lex''), (''main'', ''eval''),
            (''eval'', ''apply''), (''apply'', ''eval'')}"

value "calls⇧+ `` {''main''}"
value "(''apply'', ''apply'') ∈ calls⇧+"
value "(''main'', ''main'') ∈ calls⇧+"
```

```output all
```

Compilers do this computation to decide, for example, which functions need a stack frame of their own.
:::
::::

:::: exercise Injective or surjective? {#ex-4-6} ★★
Classify each function as injective, surjective, both or neither, and give the inverse of each
bijection.

1. $f : \N \to \N$, $f\,n = n + 3$
2. $g : \Z \to \Z$, $g\,n = -n$
3. $h : \N \to \N$, $h\,n = n \operatorname{div} 2$
4. $k : \{0, 1, 2, 3\} \to \{0, 1, 2, 3\}$, $k\,n = 3n \bmod 4$
5. $\mathit{len}$, from the strings over $\{a, b\}$ to $\N$, which gives the length of a string

Check the fourth with `value`.

::: solution
1. Injective, not surjective: 0, 1 and 2 are not outputs.
2. Bijective, and its own inverse: $g\,(g\,n) = n$.
3. Surjective ($m = h\,(2m)$), not injective ($h\,0 = h\,1 = 0$).
4. Bijective: $k$ maps 0, 1, 2, 3 to 0, 3, 2, 1. It is its own inverse, since
   $3 \cdot 3n = 9n \equiv n$ modulo 4.
5. Surjective (the string $a^n$, $n$ letters a, has length $n$), not injective ($\mathit{len}\,a =
   \mathit{len}\,b = 1$).

```isabelle
value "bij_betw (λn::nat. 3 * n mod 4) {0, 1, 2, 3} {0, 1, 2, 3}"
```

```output
```
:::
::::

:::: exercise A Hasse diagram {#ex-4-7} ★★
Consider the divisors of 18, $\{1, 2, 3, 6, 9, 18\}$, ordered by divisibility.

1. List the covering pairs, that is, the lines of the Hasse diagram, and sketch it.
2. Find the minimal, maximal, least and greatest elements.
3. Remove 1 and 18. What are the minimal and maximal elements of what is left, and is there a least
   element?

::: solution
1. The covering pairs are $1 \mid 2$, $1 \mid 3$, $2 \mid 6$, $3 \mid 6$, $3 \mid 9$, $6 \mid 18$ and
   $9 \mid 18$. Pairs such as $1 \mid 6$ or $2 \mid 18$ are not lines: 2 lies between 1 and 6, and 6
   between 2 and 18. The diagram has 1 at the bottom, 2 and 3 above it, 6 and 9 above those, and 18
   at the top.
2. 1 is the only minimal element and the least one; 18 is the only maximal element and the greatest
   one.
3. In $\{2, 3, 6, 9\}$ the minimal elements are 2 and 3, and the maximal ones are 6 and 9. There is no
   least element, because 2 and 3 are incomparable, and no greatest one.
:::
::::

:::: exercise Combining equivalence relations {#ex-4-8} ★★★
Let $R$ and $S$ be equivalence relations on $A$.

1. Prove that $R \cap S$ is an equivalence relation on $A$, on paper and in Isabelle.
2. Show that $R \cup S$ need not be one, with an example on $\{1, 2, 3\}$, and check it with
   `value`.
3. What is the smallest equivalence relation that contains $R \cup S$?

::: solution
1. Reflexive: for $x \in A$, $(x, x)$ is in $R$ and in $S$, so in $R \cap S$. Symmetric: if
   $(x, y) \in R \cap S$, then $(y, x)$ is in $R$ and in $S$, because both are symmetric. Transitive:
   if $(x, y)$ and $(y, z)$ are in $R \cap S$, then $(x, z)$ is in $R$ and in $S$, because both are
   transitive.

   ```isabelle
   lemma "equiv A R ⟶ equiv A S ⟶ equiv A (R ∩ S)"
     by (auto simp: equiv_def refl_on_def sym_def trans_def)
   ```

2. Let $R$ relate 1 and 2 and $S$ relate 2 and 3, with all pairs $(x, x)$ in both. Then $R \cup S$
   contains $(1, 2)$ and $(2, 3)$ but not $(1, 3)$, so it is not transitive:

   ```isabelle
   value "trans_on {1, 2, 3}
            ({(1::nat, 1), (2, 2), (3, 3), (1, 2), (2, 1)} ∪ {(1, 1), (2, 2), (3, 3), (2, 3), (3, 2)})"
   ```

   ```output
   ```

3. $(R \cup S)^+$. It contains $R \cup S$; it is transitive; it is reflexive on $A$ and symmetric because
   $R \cup S$ is (a path reversed is a path of the converse, and $R \cup S$ is its own converse). Any
   equivalence relation that contains $R \cup S$ is transitive, so it contains all of
   $(R \cup S)^+$.
:::
::::

:::: exercise Infinite bit sequences {#ex-4-9} ★★★
An infinite bit sequence is a function from $\N$ to $\{0, 1\}$, or in HOL a function of type
`nat ⇒ bool`. Adapt Cantor's diagonal argument to show that no list $f\,0, f\,1, f\,2, \dots$ of such
sequences contains them all: give the missing sequence explicitly and explain why it is missing. Then
prove in Isabelle that it is not in the range of `f`. (Hint: two functions are equal when they agree on
every argument; the library calls this fact `fun_eq_iff`.)

::: solution
Let $d$ be the sequence whose $n$-th bit is the opposite of the $n$-th bit of $f\,n$:
$d\,n = \lnot (f\,n\,n)$. If $d = f\,m$ for some $m$, then the two functions agree at $m$:
$\lnot (f\,m\,m) = f\,m\,m$, which is impossible. So $d$ is not in the list. This is the diagonal of
Figure 4.4 again, with sequences instead of sets: a set of natural numbers and its bit sequence
"1 at $n$ when $n$ is in the set" are two descriptions of the same thing. So the set of infinite bit
sequences is uncountable. A similar argument, with some care for the numbers that have two binary
expansions, such as $0.0111\ldots = 0.1000\ldots$, shows that the real numbers are uncountable too.

```isabelle
lemma "(λn. ¬ f n n) ∉ range (f :: nat ⇒ nat ⇒ bool)"
  by (auto simp: fun_eq_iff)
```

`fun_eq_iff` turns the equation between functions into a statement about all arguments, and `auto`
then finds the argument $m$ on its own.
:::
::::

## Check yourself {#quiz}

```quiz
? Which statement holds for every set $A$?
- [ ] $\emptyset \in A$
- [x] $\emptyset \subseteq A$
- [ ] $A \subset A$
- [ ] $A \in \pow(\emptyset)$
> The empty set is a subset of every set, by vacuous truth: $x \in \emptyset \imp x \in A$ holds because $x \in \emptyset$ is always false. It is an element only of sets that contain it, and no set is a proper subset of itself.

? Which law of logic proves $-(A \cap B) = -A \cup -B$?
- [ ] Distributivity of $\land$ over $\lor$
- [ ] Absorption
- [ ] Double negation
- [x] De Morgan's law $\lnot (p \land q) \iff \lnot p \lor \lnot q$
> Translate membership: $x \in -(A \cap B)$ is $\lnot (x \in A \land x \in B)$, and De Morgan's law turns it into $x \notin A \lor x \notin B$.

? A relation $R$ on $\{1, 2, 3\}$ is both symmetric and antisymmetric. What follows?
- [x] Every pair in $R$ has the form $(x, x)$
- [ ] $R$ is empty
- [ ] $R$ is the identity relation
- [ ] $R$ is not transitive
> If $(x, y) \in R$, symmetry gives $(y, x) \in R$ and antisymmetry then gives $x = y$. Any set of loops qualifies, including the empty set and the identity relation, so neither of those is forced.

? $R$ is an equivalence relation, and the classes $[x]$ and $[y]$ have an element in common. What can you conclude?
- [ ] $x = y$
- [ ] Nothing: classes can overlap in part
- [x] $[x] = [y]$
- [ ] $R$ is a partial order
> Classes of an equivalence relation are equal or disjoint, so sharing an element makes them equal. $x$ and $y$ need not be equal: they are only equivalent.

? $T$ is the transition relation of a state machine and $s$ its initial state. Which set contains exactly the states reachable from $s$?
- [ ] The image of $\{s\}$ under $T$
- [x] The image of $\{s\}$ under $T^*$
- [ ] The image of $\{s\}$ under $T^+$
- [ ] The image of $\{s\}$ under $T^{-1}$
> Reachable means "by zero or more steps", which is $T^*$. $T$ gives only one step, and $T^+$ misses $s$ itself unless a cycle leads back to it.

? What does Cantor's theorem say about a function $f$ from $\N$ to $\pow(\N)$?
- [ ] It cannot be injective
- [ ] It is surjective if its range is infinite
- [ ] Its range is all of $\pow(\N)$
- [x] Some set of natural numbers is not in its range
> The diagonal set $\{n.\; n \notin f\,n\}$ differs from every $f\,n$. Injective functions from $\N$ to $\pow(\N)$ exist, for example $n \mapsto \{n\}$.
```
