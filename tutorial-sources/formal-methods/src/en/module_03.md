---
title: Predicate logic
part: 1
lead: Say what holds for every object or for some, work out whether a formula is true in a structure, find countermodels, and turn requirements into precise formulas, on paper and in Isabelle.
minutes: 210
needs: Modules 1 and 2
goals:
  - Read and write formulas with predicates, functions, ∀ and ∃, and tell free variables from bound ones
  - Work out by hand whether a formula is true in a small structure, and build countermodels
  - Use the quantifier laws, and recognise the ones that fail
  - Translate English requirements into predicate logic without the classic mistakes
  - Check first-order claims in Isabelle with `blast` and `nitpick`, and declare a typed vocabulary
  - Explain why no program can decide validity in predicate logic, and what that means for tools
imports: Main
---

## Beyond propositional logic {#beyond}

Module 2 treated every statement as an indivisible atom. That is enough for rules such as "if the door
is open and the alarm is armed, the siren sounds". Most requirements, though, talk about many objects at
once: *every* request, *some* server, *no* two trains, *the owner* of a file. Here is an access-control
policy and a conclusion that anyone would draw from it:

1. Every administrator can delete every document.
2. Alice is an administrator.
3. Therefore Alice can delete the quarterly report.

In propositional logic each sentence becomes an atom, say $A$, $B$ and $C$, and the argument becomes the
formula $A \land B \imp C$. Its truth table:

```truthtable
A ∧ B ⟶ C
```

The second row makes the formula false: $A$ and $B$ true, $C$ false. As far as propositional logic can
tell, the conclusion does not follow. Yet it does, for reasons that lie *inside* the sentences: the
Alice of sentence 2 is the Alice of sentence 3, "every administrator" in sentence 1 includes her, and
"every document" includes the report. To capture such reasons, a logic needs

- **names for objects**, such as Alice and the report;
- **properties and relations** of objects, such as "is an administrator" and "can delete";
- **quantifiers**, the words of quantity "every" and "some", with variables that range over the objects.

**Predicate logic** adds exactly these to the connectives of Module 2. It is also called **first-order
logic**, because its variables range over objects, the "first order" of things, and not over properties
of objects. Gottlob Frege introduced quantifiers in his *Begriffsschrift* of 1879, and predicate logic
has been the standard language of mathematics ever since. Written in it, the whole argument is one
formula:

$$
(\forall u\ d.\ \mathit{admin}\ u \imp \mathit{can\_delete}\ u\ d) \land \mathit{admin}\ \mathit{alice} \imp \mathit{can\_delete}\ \mathit{alice}\ \mathit{report}
$$

Read it as "if every administrator $u$ can delete every document $d$, and Alice is an administrator, then
Alice can delete the report". By the end of this module you will know what it means for this formula to
be true however its words are interpreted, and Isabelle will prove it in one line (Section 3.8).

Predicate logic is the language of specifications: the sorting specification of Module 1,
$\mathit{sorted}\ ys \land \mathit{mset}\ ys = \mathit{mset}\ xs$, is one of its formulas, and
Isabelle's logic, HOL, extends it.

## Terms, predicates and formulas {#language}

A formula of predicate logic is built from two kinds of symbol. The **logical symbols** are the same in
every application: the connectives of Module 2, the quantifiers, equality, and variables. The other
symbols name the things of one particular application, such as users, documents and permissions. They
form its vocabulary.

::: definition Vocabulary
A **vocabulary** (also called a **signature**) lists the non-logical symbols of a language, each with
its number of arguments, its **arity**:

- **constants** name single objects: $\mathit{alice}$, $\mathit{report}$, $0$;
- **function symbols** name operations that give an object: $\mathit{owner}$ (one argument: the owner
  of a document), $+$ (two arguments);
- **predicate symbols** name properties and relations, which hold or do not hold: $\mathit{admin}$ (one
  argument), $\mathit{can\_delete}$ (two), $<$ (two).
:::

Most logic books write $P(x)$, $R(x, y)$ and $f(x)$. This series writes them as Isabelle does: the
symbol, then its arguments, separated by spaces: $P\ x$, $R\ x\ y$, $f\ x$. Parentheses only group:
$\mathit{can\_delete}\ (\mathit{owner}\ d)\ d$ applies $\mathit{can\_delete}$ to two arguments,
$\mathit{owner}\ d$ and $d$. Symbols such as $+$ and $<$ stay between their arguments, as usual.

### Terms {#terms}

::: definition Term
A **term** is either

1. a variable ($x$, $y$, $z$, …) or a constant, or
2. $f\ t_1\ \dots\ t_n$, where $f$ is a function symbol with $n$ arguments and $t_1, \dots, t_n$ are
   terms.

A term names an object. It is never true or false.
:::

$\mathit{alice}$, $d$, $\mathit{owner}\ d$, $x + 1$ and $2 * (x + y)$ are terms. $\mathit{owner}\ d$
names the owner of whichever document $d$ stands for, and $x + 1$ names a number. Terms are like the
expressions of a programming language: they compute values.

### Atomic formulas {#atoms}

::: definition Atomic formula
An **atomic formula** is either $P\ t_1\ \dots\ t_n$, where $P$ is a predicate symbol with $n$ arguments
and $t_1, \dots, t_n$ are terms, or an equation $t_1 = t_2$ between two terms.
:::

$\mathit{admin}\ \mathit{alice}$, $\mathit{can\_delete}\ x\ \mathit{report}$, $x < y + 1$ and
$\mathit{owner}\ \mathit{report} = \mathit{alice}$ are atomic formulas. Each becomes true or false once
you know which objects its terms stand for. A predicate symbol with no arguments is a propositional atom
of Module 2, so every formula of propositional logic is also a formula of predicate logic.

::: pitfall
Terms and formulas live on different levels, and one cannot stand where the other belongs.
$\mathit{admin}\ (\mathit{can\_delete}\ \mathit{alice}\ \mathit{report})$ is not a formula:
$\mathit{admin}$ needs an object, and $\mathit{can\_delete}\ \mathit{alice}\ \mathit{report}$ is a
statement. Nor is $\mathit{owner}\ \mathit{report} \land \mathit{admin}\ \mathit{alice}$: $\land$ joins
statements, and $\mathit{owner}\ \mathit{report}$ is an object. Isabelle rejects such expressions, as
Section 3.8 shows.
:::

### Quantifiers {#quantifiers}

The new ingredient is quantification over objects. Here $\varphi$ (the Greek letter phi) and $\psi$
(psi) stand for any formulas.

- $\forall x.\ \varphi$ reads "for all $x$, $\varphi$". It says that $\varphi$ holds whichever object $x$
  stands for. $\forall$ is the **universal quantifier**.
- $\exists x.\ \varphi$ reads "there exists an $x$ such that $\varphi$", or "for some $x$, $\varphi$". It
  says that $\varphi$ holds for at least one object. $\exists$ is the **existential quantifier**.

One quantifier may introduce several variables: $\forall x\ y.\ \varphi$ is short for
$\forall x.\ \forall y.\ \varphi$.

::: definition Formula
The **formulas** over a vocabulary are built by these rules:

1. Every atomic formula is a formula, and so are $\mathit{True}$ and $\mathit{False}$.
2. If $\varphi$ and $\psi$ are formulas, so are $\lnot \varphi$, $\varphi \land \psi$,
   $\varphi \lor \psi$, $\varphi \imp \psi$ and $\varphi \iff \psi$.
3. If $\varphi$ is a formula and $x$ is a variable, then $\forall x.\ \varphi$ and
   $\exists x.\ \varphi$ are formulas.
:::

Reading formulas fluently takes practice. Read them aloud, symbol by symbol, then say what they mean in
plain English.

::: example Reading formulas
| Formula | Read aloud | In plain English |
|---|---|---|
| $\forall x.\ \mathit{admin}\ x \imp \mathit{on\_call}\ x$ | for all $x$, if $x$ is an admin then $x$ is on call | every admin is on call |
| $\exists x.\ \mathit{admin}\ x \land \lnot\, \mathit{on\_call}\ x$ | there is an $x$ such that $x$ is an admin and $x$ is not on call | some admin is not on call |
| $\forall x.\ \exists y.\ \mathit{trusts}\ x\ y$ | for all $x$ there is a $y$ such that $x$ trusts $y$ | everybody trusts somebody |
| $\exists y.\ \forall x.\ \mathit{trusts}\ x\ y$ | there is a $y$ such that for all $x$, $x$ trusts $y$ | somebody is trusted by everybody |
| $\forall x\ y.\ x < y \imp (\exists z.\ x < z \land z < y)$ | for all $x$ and $y$, if $x < y$ then there is a $z$ with $x < z$ and $z < y$ | between two different numbers lies a third |

The third and fourth rows differ only in the order of the quantifiers, yet they say very different
things. Sections 3.3 and 3.5 come back to this. The last row is true of the fractions but false of the
whole numbers: there is no whole number between 1 and 2.
:::

Isabelle writes the quantifiers as here: ∀ or ∃, a variable, a dot. Type them as `\forall` and
`\exists` (Module 1).

### Scope, free and bound variables {#scope}

In $\forall x.\ \varphi$ the formula $\varphi$ is the **scope** of the quantifier: the region in which
$x$ refers to it. When a formula has no parentheses, how far does a scope extend? This series follows
Isabelle: **the scope of a quantifier extends as far to the right as possible**. So
$\forall x.\ P\ x \imp Q\ x$ means $\forall x.\ (P\ x \imp Q\ x)$. To end a scope earlier, use
parentheses: $(\forall x.\ P\ x) \imp Q\ x$.

::: pitfall
Many logic textbooks use the opposite convention: there a quantifier binds as tightly as $\lnot$, and
$\forall x\, P(x) \imp Q(x)$ means $(\forall x\, P(x)) \imp Q(x)$. When you read other books, check
their convention. When you write for Isabelle, remember that a quantifier's scope runs to the end of the
formula, or to the closing parenthesis of the group the quantifier stands in.
:::

::: definition Free and bound variables
An occurrence of a variable $x$ in a formula is **bound** if it lies in the scope of a quantifier
$\forall x$ or $\exists x$; it then belongs to the nearest such quantifier around it. Otherwise the
occurrence is **free**. A formula in which no variable occurs free is a **sentence**, or closed formula.
:::

Figure 3.1 marks the scopes in a formula in which the same variable name occurs both bound and free.

::: figure id=fig-03-1
Scopes in $\forall x.\ P\ x \imp (\exists y.\ R\ x\ y) \land Q\ y$. The scope of $\forall x$ runs to the
end, so every $x$ is bound. The parentheses close the scope of $\exists y$, so the last $y$ is free: a
different variable from the bound $y$, with the same name.
:::

A sentence is true or false once its symbols have a meaning. A formula with free variables also depends
on what they stand for: $x < 3$ is neither true nor false until $x$ has a value, while
$\exists x.\ x < 3$ is a sentence, true of the natural numbers. A free variable is like a parameter of a
function, a bound variable like a local variable: renaming a bound variable throughout its scope, with a
fresh name, changes nothing, so $\forall x.\ P\ x$ and $\forall y.\ P\ y$ say the same thing.

::: example Finding scopes and free variables
1. $\forall x.\ P\ x \imp Q\ x$: the scope of $\forall x$ is $P\ x \imp Q\ x$, and both occurrences of
   $x$ are bound. A sentence.
2. $(\forall x.\ P\ x) \imp Q\ x$: the scope is only $P\ x$. The $x$ in $Q\ x$ is free.
3. $\forall x.\ \exists y.\ R\ x\ y \land \lnot\, R\ y\ z$: $x$ and $y$ are bound, $z$ is free. Not a
   sentence.
4. $\exists x.\ P\ x \land (\forall x.\ Q\ x) \imp R\ x$: the inner $\forall x$ binds only the $x$ of
   $Q\ x$. The scope of $\exists x$ runs to the end, so the $x$ in $R\ x$ belongs to $\exists x$. A
   sentence, but a confusing one: give each quantifier a variable of its own.
:::

::: isabelle
To see how Isabelle reads a formula, state it as a lemma and look at the goal in the Output panel.
Isabelle prints formulas with as few parentheses as it can, so the goal shows which of your parentheses
mattered:

```isabelle
lemma "∀x. (P x ⟶ Q x)"
```

```output state
proof (prove)
goal (1 subgoal):
 1. ∀x. P x ⟶ Q x
```

The parentheses are gone: the scope of `∀x` runs to the end anyway, so they changed nothing. Abandon the
lemma with `oops` and move the parenthesis:

```isabelle
  oops
```

```isabelle
lemma "(∀x. P x) ⟶ Q x"
```

```output state
proof (prove)
goal (1 subgoal):
 1. (∀x. P x) ⟶ Q x
```

These parentheses stay, because they end the scope of `∀x` early. The `x` in `Q x` is free; what a free
variable means in a lemma is the subject of Section 3.4.

```isabelle
  oops
```
:::

## Structures and truth {#structures}

Is $\forall x.\ \exists y.\ R\ x\ y$ true? The question has no answer yet. If $x$ and $y$ range over the
natural numbers and $R$ is $<$, it is true: every number has a larger one. If $R$ is $>$, it is false:
no natural number is smaller than 0. A formula gets a truth value only once you say what its variables
range over and what its symbols mean. That information is a structure.

::: definition Structure
A **structure** $\mathcal M$ for a vocabulary consists of

1. a non-empty set $D$, the **domain**: the objects that variables range over;
2. for each constant $c$, an element $c^{\mathcal M}$ of $D$;
3. for each function symbol $f$ with $n$ arguments, a function $f^{\mathcal M}$ that maps every
   $n$-tuple of elements of $D$ to an element of $D$;
4. for each predicate symbol $P$ with $n$ arguments, a set $P^{\mathcal M}$ of $n$-tuples of elements of
   $D$: the tuples for which $P$ holds.

Items 2 to 4 are the **interpretation** of the vocabulary. Structures are also called **models** or
**interpretations**.
:::

The domain may be finite or infinite, but by convention it is never empty; Isabelle follows the same
convention. A function symbol is interpreted by a function that gives a value for every argument, even
for arguments where the value makes no sense, such as the owner of something that is not a document.
Section 3.8 shows how types avoid such nonsense.

To evaluate a formula with free variables, you also need values for them.

::: definition Truth in a structure
An **assignment** $s$ gives every variable a value in $D$. The **value** of a term is computed from the
values of its variables and constants, using the functions of $\mathcal M$. A formula is **true in
$\mathcal M$ under $s$** according to these rules:

- $P\ t_1\ \dots\ t_n$ is true when the tuple of the values of $t_1, \dots, t_n$ is in
  $P^{\mathcal M}$; $t_1 = t_2$ is true when the two terms have the same value.
- $\lnot$, $\land$, $\lor$, $\imp$ and $\iff$ follow their truth tables from Module 2.
- $\forall x.\ \varphi$ is true when $\varphi$ is true for **every** value of $x$ in $D$, the other
  variables keeping their values.
- $\exists x.\ \varphi$ is true when $\varphi$ is true for **at least one** value of $x$ in $D$.

For a sentence the assignment makes no difference. You then write $\mathcal M \models \varphi$, read
"$\varphi$ is true in $\mathcal M$" or "$\mathcal M$ is a model of $\varphi$".
:::

::: analogy
Over a finite domain, a quantifier is a loop. $\forall x$ is a loop that succeeds only if every round
succeeds; $\exists x$ succeeds as soon as one round does. In Python, $\forall x.\ \exists y.\ R\ x\ y$
over a list `D` is `all(any(R(x, y) for y in D) for x in D)`. Over an infinite domain the loop never
ends, and you need a proof instead.
:::

Now an example by hand. Figure 3.2 draws a structure for a vocabulary with two one-place predicates,
$P$ and $Q$, and a two-place predicate $R$.

::: figure id=fig-03-2
The structure $\mathcal M_1$. Its domain has three elements; $P$ holds for $a$ and $b$, $Q$ for $b$
only; an arrow from $x$ to $y$ means that $R\ x\ y$ holds.
:::

Written out, $\mathcal M_1$ has the domain $D = \{a, b, c\}$, with $P^{\mathcal M_1} = \{a, b\}$,
$Q^{\mathcal M_1} = \{b\}$ and $R^{\mathcal M_1} = \{(a, b), (b, c), (c, c)\}$. If a concrete reading
helps, think of three servers, of $P$ as "is in production", $Q$ as "is backed up", and $R\ x\ y$ as
"$x$ forwards its logs to $y$". The evaluation does not depend on the reading.

::: example Evaluating formulas by hand
1. $\forall x.\ P\ x \imp Q\ x$, "every $P$ is a $Q$". Try each element. For $a$, $P\ a \imp Q\ a$ is
   $\mathit{True} \imp \mathit{False}$, which is false. One failure is enough: the formula is false in
   $\mathcal M_1$, and $a$ is a **counterexample**.
2. $\exists x.\ P\ x \land Q\ x$, "some $P$ is a $Q$". For $b$, $P\ b \land Q\ b$ is true. The formula
   is true, and $b$ is a **witness**.
3. $\exists x.\ R\ x\ x$, "some element has an arrow to itself". True, with the witness $c$.
4. $\forall x.\ P\ x \imp (\exists y.\ R\ x\ y \land Q\ y)$, "every $P$ has an arrow to a $Q$". This one
   needs a table, with a row for each value of $x$:

   | $x$ | $P\ x$ | an arrow from $x$ to a $Q$? | $P\ x \imp (\exists y.\ R\ x\ y \land Q\ y)$ |
   |---|---|---|---|
   | $a$ | true | yes: $R\ a\ b$ and $Q\ b$ | true |
   | $b$ | true | no: its only arrow goes to $c$, and $Q\ c$ is false | false |
   | $c$ | false | no | true |

   The row for $b$ is false, so the formula is false in $\mathcal M_1$, with the counterexample $b$.
:::

::: example The order of quantifiers
In $\mathcal M_1$, the sentence $\forall x.\ \exists y.\ R\ x\ y$ says that every element has an
outgoing arrow. It does: $a \to b$, $b \to c$ and $c \to c$. Each $x$ has its own witness $y$.

$\exists y.\ \forall x.\ R\ x\ y$ says that some element receives an arrow from every element, itself
included. Try each candidate $y$: $a$ receives no arrow; $b$ receives an arrow from $a$ only; $c$
receives arrows from $b$ and $c$, but not from $a$. No candidate works, so the sentence is false.

The two sentences differ only in the order of $\forall x$ and $\exists y$. In the first, $y$ may depend
on $x$; in the second, one $y$ must serve every $x$.
:::

A ∀-sentence can also be true for a less obvious reason. In a structure where no element has the
property $P$, the sentence $\forall x.\ P\ x \imp Q\ x$ is true whatever $Q$ is: for every $x$ the
condition $P\ x$ is false, so the implication is true. Such a sentence is **vacuously true**. "Every
admin is on call" holds in a company without admins, and "every request was answered" holds for a
server that received no requests. Specifications must reckon with this.

::: widget name=model-explorer
Change the structure by clicking: add or remove elements, tick where $P$ and $Q$ hold, and switch the
arrows of $R$ on and off in the grid (row $x$, column $y$). Every formula is evaluated again after each
click; a false ∀ shows a counterexample and a true ∃ a witness. Try to make $\forall x.\ \exists y.\ R\ x\ y$
true while $\exists y.\ \forall x.\ R\ x\ y$ stays false. Then make $\forall x.\ P\ x \imp Q\ x$ true while
$\exists x.\ P\ x \land Q\ x$ is false; there is only one way. You can add formulas of your own, in
Isabelle's notation or in ASCII (`ALL`, `EX`, `~`, `&`, `|`, `-->`).
:::

::: isabelle
Isabelle can evaluate a quantified formula when the domain is a type whose elements it can list. The
type `bool` has two elements, `True` and `False`. Take ≠ ("is different from") as the relation and
compare the two orders of quantifiers:

```isabelle
value "∀x::bool. ∃y. y ≠ x"
```

```output
"True"
  :: "bool"
```

```isabelle
value "∃y::bool. ∀x. y ≠ x"
```

```output
"False"
  :: "bool"
```

`x::bool` in a quantifier says that `x` ranges over `bool`. Every `x` has a `y` different from it, but
no `y` is different from every `x`, because nothing is different from itself. A type with infinitely
many elements, such as `nat`, cannot be run through:

```isabelle fails
value "∀x::nat. x < x + 1"
```

```output
*** Wellsortedness error:
*** Type nat not of sort enum
*** No type arity nat :: enum
```

The message says that `nat` is not of sort `enum`: it does not belong to `enum`, the class of types whose
elements Isabelle can list. For such types you need a proof.
:::

## Validity, satisfiability and countermodels {#validity}

The central notions of Module 2 carry over, with "every row of the truth table" replaced by "every
structure".

::: definition Validity and satisfiability
A formula $\varphi$ is

- **valid**, written $\models \varphi$, if it is true in every structure under every assignment;
- **satisfiable** if it is true in at least one structure under at least one assignment;
- **unsatisfiable** if it is true in none.

A set of formulas $\Gamma$ (gamma) **entails** $\varphi$, written $\Gamma \models \varphi$, if $\varphi$
is true in every structure and under every assignment that make all the formulas in $\Gamma$ true.
$\varphi$ is then a **logical consequence** of $\Gamma$.
:::

As in Module 2, $\varphi$ is valid exactly when $\lnot \varphi$ is unsatisfiable. The difference lies
in the number of cases: a truth table has finitely many rows, but there are infinitely many structures,
of every size, and you cannot inspect them all. To show that a formula is *not* valid, though, one
structure is enough.

::: definition Countermodel
A **countermodel** of $\varphi$ is a structure, together with an assignment for the free variables of
$\varphi$, in which $\varphi$ is false. A formula is valid exactly when it has no countermodel.
:::

::: example A countermodel
Is $(\forall x.\ P\ x \lor Q\ x) \imp (\forall x.\ P\ x) \lor (\forall x.\ Q\ x)$ valid? It says: "if
everything is $P$ or $Q$, then everything is $P$ or everything is $Q$". That sounds plausible until you
picture one element that is only $P$ and another that is only $Q$: $D = \{a, b\}$, $P = \{a\}$,
$Q = \{b\}$. The premise is true, since $a$ is $P$ and $b$ is $Q$. But $\forall x.\ P\ x$ fails at $b$
and $\forall x.\ Q\ x$ fails at $a$, so the conclusion is false. This structure is a countermodel, and
the formula is not valid. It is satisfiable, though: it is true in every structure where everything is
$P$.
:::

To show that a formula *is* valid, you argue about an arbitrary structure: the argument may use nothing
about the domain and the interpretation except what the formula itself says.

::: example Proving validity
Claim: $(\forall x.\ P\ x \imp Q\ x) \land P\ c \imp Q\ c$ is valid. Take any structure $\mathcal M$.
If the left-hand side of the implication is false in $\mathcal M$, the implication is true. Otherwise both
conjuncts are true. The first says that $P\ x \imp Q\ x$ holds for every value of $x$, in particular for
the element $c^{\mathcal M}$; the second says that $P$ holds for $c^{\mathcal M}$. Together they give
$Q\ c$. Either way the formula is true in $\mathcal M$, and since $\mathcal M$ was arbitrary, the formula
is valid. This is the argument of Section 3.1 in miniature.
:::

Valid formulas include every instance of a propositional tautology, such as $P\ x \lor \lnot\, P\ x$, and
many that propositional logic cannot explain, such as $(\forall x.\ P\ x) \imp P\ c$.

::: isabelle
In an Isabelle lemma, **free variables are implicitly universal**: the lemma claims its formula for every
value of them. A free `P` stands for any predicate and a free `c` for any element, and the elements may
come from any domain. So a lemma with free variables claims that its formula is valid. `blast`, which Module 2 used for
tautologies, also searches for proofs in predicate logic:

```isabelle
lemma "(∀x. P x ⟶ Q x) ∧ P c ⟶ Q c"
  by blast
```

The proof succeeds: Example 3.6 is checked. Now a claim that is not valid. From `P a` for one `a`, you
cannot conclude that `P` holds for everything. Nitpick searches for a countermodel:

```isabelle
lemma "P a ⟶ (∀x. P x)"
  nitpick [card 'a = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2:
  Free variables:
    P = (λx. _)(a⇩1 := False, a⇩2 := True)
    a = a⇩2
  Skolem constant:
    x = a⇩1
```

Read Nitpick's answer from the top.

- `card 'a = 2`: the domain has two elements, which Nitpick calls a₁ and a₂. The name `'a` comes from
  Isabelle: it gave `x` and `a` the type `'a` (read "alpha"), a **type variable** that stands for any
  type, so the lemma is about every domain at once. The option `[card 'a = 2]` told Nitpick to try a
  domain of exactly two elements.
- `P = (λx. _)(a₁ := False, a₂ := True)` is Nitpick's notation for a function given by a table:
  `P a₁` is `False` and `P a₂` is `True`. So `P` holds for a₂ only.
- `a = a₂` is the value of the free variable `a`.
- Under **Skolem constant**, Nitpick shows values that it chose for bound variables: `x = a₁` is the
  element at which `∀x. P x` fails.

So `P a` is true and `∀x. P x` is false: a countermodel, as in Definition 3.9.

```isabelle
  oops
```

Without an option, Nitpick tries domains of 1 to 10 elements in parallel, and the size of the countermodel
it reports first can change from run to run; `[card 'a = 2]` makes its answer repeatable. Isabelle/jEdit
also runs Quickcheck on every new lemma, so a counterexample may appear before you call Nitpick.
Quickcheck writes a predicate as the set of elements where it is true, such as `P = {a₁}`.
:::

::: pitfall
"Nitpick found no counterexample" does not mean that a lemma is true. Nitpick searches only domains up to
a size limit, and Section 3.9 shows a false formula whose countermodels are all infinite. Only a proof
shows that a formula is valid.
:::

## Reasoning with quantifiers {#reasoning}

Two formulas are **equivalent**, written $\varphi \equiv \psi$, if they are true in the same structures
under the same assignments, that is, if $\varphi \iff \psi$ is valid. Equivalences let you rewrite
formulas: to simplify a specification, to negate a requirement, to follow a proof. This section collects
the laws you will use most, and the ones that look right but fail.

### Quantifier laws {#quantifier-laws}

Over a two-element domain $\{a, b\}$, $\forall x.\ P\ x$ means $P\ a \land P\ b$, and
$\exists x.\ P\ x$ means $P\ a \lor P\ b$. So ∀ behaves like a long conjunction and ∃ like a long
disjunction, and the laws of Module 2 for ∧ and ∨ have quantifier versions.

::: fact Negating quantifiers
$$
\lnot (\forall x.\ \varphi) \equiv \exists x.\ \lnot \varphi
\qquad\qquad
\lnot (\exists x.\ \varphi) \equiv \forall x.\ \lnot \varphi
$$
:::

"Not everything is $\varphi$" means "something is not $\varphi$", and "nothing is $\varphi$" means
"everything is not $\varphi$". These are De Morgan's laws for quantifiers. Pushing a negation inwards
turns each quantifier it passes into the other one.

::: example Negating a requirement
A requirement and its violation are negations of each other. Take "every request is answered":

$$\forall r.\ \mathit{request}\ r \imp \mathit{answered}\ r$$

Its negation describes what a test, or a model checker, must find to show a violation:

$$
\lnot (\forall r.\ \mathit{request}\ r \imp \mathit{answered}\ r)
\;\equiv\; \exists r.\ \lnot (\mathit{request}\ r \imp \mathit{answered}\ r)
\;\equiv\; \exists r.\ \mathit{request}\ r \land \lnot\, \mathit{answered}\ r
$$

"Some request is not answered." The last step uses $\lnot (A \imp B) \equiv A \land \lnot B$ from
Module 2. With nested quantifiers the negation passes through each one in turn:
$\lnot (\forall x.\ \exists y.\ \mathit{trusts}\ x\ y) \equiv \exists x.\ \forall y.\ \lnot\, \mathit{trusts}\ x\ y$,
"somebody trusts nobody".
:::

::: fact Distribution
$$
\forall x.\ (\varphi \land \psi) \equiv (\forall x.\ \varphi) \land (\forall x.\ \psi)
\qquad\qquad
\exists x.\ (\varphi \lor \psi) \equiv (\exists x.\ \varphi) \lor (\exists x.\ \psi)
$$

The other two combinations hold in one direction only:

$$
(\forall x.\ \varphi) \lor (\forall x.\ \psi) \models \forall x.\ (\varphi \lor \psi)
\qquad\qquad
\exists x.\ (\varphi \land \psi) \models (\exists x.\ \varphi) \land (\exists x.\ \psi)
$$
:::

Example 3.5 showed that the first one-way law cannot be reversed. Nor can the second: "somebody is an
admin and somebody is on call" does not mean that some admin is on call. The countermodel is again
$D = \{a, b\}$ with $P = \{a\}$ and $Q = \{b\}$.

::: fact Quantifiers and formulas without the variable
If $x$ does not occur free in $\psi$:

$$
\forall x.\ (\psi \imp \varphi) \equiv \psi \imp (\forall x.\ \varphi)
\qquad\qquad
\forall x.\ (\varphi \imp \psi) \equiv (\exists x.\ \varphi) \imp \psi
$$

$$
\exists x.\ (\varphi \land \psi) \equiv (\exists x.\ \varphi) \land \psi
\qquad\qquad
\forall x.\ (\varphi \lor \psi) \equiv (\forall x.\ \varphi) \lor \psi
$$
:::

The second law surprises at first: a ∀ that moves out of the left-hand side of an implication becomes an
∃. An example makes it plausible: "for every user $x$, if $x$ is logged in, the server is busy" says the
same as "if some user is logged in, the server is busy". The law is the idea behind the proof rule for ∃
in Modules 6 and 7.

::: fact Order of quantifiers
$$
\forall x.\ \forall y.\ \varphi \equiv \forall y.\ \forall x.\ \varphi
\qquad\qquad
\exists x.\ \exists y.\ \varphi \equiv \exists y.\ \exists x.\ \varphi
$$

$$
\exists y.\ \forall x.\ \varphi \models \forall x.\ \exists y.\ \varphi, \text{ but not conversely.}
$$
:::

Quantifiers of the same kind can be swapped; ∀ and ∃ cannot. If one $y$ works for every $x$, then every
$x$ has a $y$, namely that one. The converse fails because the $y$ may depend on $x$: every lock has a key
that opens it, but there need not be a master key that opens every lock. Example 3.4 gave a structure in
which $\forall x.\ \exists y.\ R\ x\ y$ is true and $\exists y.\ \forall x.\ R\ x\ y$ false.

::: isabelle
`blast` proves the laws. Here are four of them. `S` is a free variable of type `bool`, so it stands for
a formula in which `x` does not occur:

```isabelle
lemma "¬ (∀x. P x) ⟷ (∃x. ¬ P x)"
  by blast

lemma "(∀x. P x ∧ Q x) ⟷ (∀x. P x) ∧ (∀x. Q x)"
  by blast

lemma "(∀x. P x ⟶ S) ⟷ ((∃x. P x) ⟶ S)"
  by blast

lemma "(∃y. ∀x. R x y) ⟶ (∀x. ∃y. R x y)"
  by blast
```

For a law that fails, Nitpick finds a countermodel. Here is the converse of the last lemma:

```isabelle
lemma "(∀x. ∃y. R x y) ⟶ (∃y. ∀x. R x y)"
  nitpick [card = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2 and card 'b = 2:
  Free variable:
    R = (λx. _)
        (a⇩1 := (λx. _)(b⇩1 := False, b⇩2 := True),
           a⇩2 := (λx. _)(b⇩1 := True, b⇩2 := False))
  Skolem constants:
    λy. x = (λx. _)(b⇩1 := a⇩1, b⇩2 := a⇩2)
    λx. y = (λx. _)(a⇩1 := b⇩2, a⇩2 := b⇩1)
```

This time there are two type variables. Nothing in the formula says that `x` and `y` are the same kind
of thing, so Isabelle gave them different types, `'a` and `'b`, and `R` relates elements of `'a` to
elements of `'b`. The option `[card = 2]` gives every type two elements. `R` is a table of tables:
`R a₁` is the function that is true only at b₂, so `R a₁ b₂` holds, and likewise `R a₂ b₁`; all other
pairs are false. Every `x` has a `y`, but no single `y` serves both. The Skolem constants show the
dependence: `λx. y` is the `y` that Nitpick chose for each `x` to make the left-hand side true, a
function of `x`; `λy. x` gives, for each `y`, an `x` at which `∀x. R x y` fails.

```isabelle
  oops
```
:::

::: pitfall
Scope strikes when you type a law into Isabelle without the parentheses of the fact box. Leave out the
parentheses around `∀x. P x ∧ Q x` in the second lemma above:

```isabelle
lemma "∀x. P x ∧ Q x ⟷ (∀x. P x) ∧ (∀x. Q x)"
```

```output state
proof (prove)
goal (1 subgoal):
 1. ∀x. (P x ∧ Q x) = ((∀x. P x) ∧ (∀x. Q x))
```

The goal shows Isabelle's reading. The first `∀x` takes everything to its right as its scope, so the
lemma now claims, for every `x`, that `P x ∧ Q x` is equivalent to `(∀x. P x) ∧ (∀x. Q x)`. (Isabelle
prints `⟷` as `=`; Section 3.6 explains why.) That is a different claim, and a false one:

```isabelle
  nitpick [card 'a = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2:
  Free variables:
    P = (λx. _)(a⇩1 := False, a⇩2 := True)
    Q = (λx. _)(a⇩1 := False, a⇩2 := True)
  Skolem constant:
    x = a⇩2
```

In this countermodel `P` and `Q` both hold for a₂ only. Take `x = a₂`: `P x ∧ Q x` is true, but
`∀x. P x` is false because of a₁, so the two sides of the equivalence differ. Put the parentheses back
and `blast` proves the law.

```isabelle
  oops
```
:::

### Substitution and capture {#substitution}

From $\forall x.\ \varphi$ you may conclude $\varphi$ for any particular object: from "every admin is on
call" follows "if Alice is an admin, Alice is on call". The step replaces the variable $x$ by a term.

::: definition Substitution
$\varphi[t/x]$, read "$\varphi$ with $t$ for $x$", is the formula obtained from $\varphi$ by replacing
every **free** occurrence of the variable $x$ with the term $t$. Bound occurrences of $x$ stay as they
are.
:::

For example, $(P\ x \land (\forall x.\ Q\ x))[a/x]$ is $P\ a \land (\forall x.\ Q\ x)$: only the first
$x$ is free.

::: fact Instantiation
$$
\forall x.\ \varphi \models \varphi[t/x]
\qquad\qquad
\varphi[t/x] \models \exists x.\ \varphi
$$

provided that no variable of $t$ becomes bound when $t$ is put in place of $x$.
:::

The proviso is not a technicality. Let $\varphi$ be $\exists y.\ R\ x\ y$, "$x$ has an $R$-successor".
Then $\forall x.\ \varphi$ says that everything has a successor. Put $y$ for $x$ carelessly and you get
$\exists y.\ R\ y\ y$, "something is its own successor": the $y$ you put in has been **captured** by
$\exists y$, and the meaning has changed. With the natural numbers as domain and $<$ as $R$,
$\forall x.\ \exists y.\ x < y$ is true and $\exists y.\ y < y$ is false, so the careless step leads from
a truth to a falsehood. The cure is to rename the bound variable first. $\exists y.\ R\ x\ y$ is
equivalent to $\exists z.\ R\ x\ z$, and $(\exists z.\ R\ x\ z)[y/x]$ is $\exists z.\ R\ y\ z$, "$y$ has
a successor", which does follow.

Formulas that differ only in the names of their bound variables, such as $\exists y.\ R\ x\ y$ and
$\exists z.\ R\ x\ z$, are called **α-equivalent** (alpha-equivalent). They mean the same, and
substitution is always understood up to such renaming.

::: example Substitution with renaming
Compute $(\forall y.\ R\ x\ y \imp P\ y)[f\ y/x]$. The term $f\ y$ contains $y$, which the formula
binds, so putting $f\ y$ in directly would capture its $y$. First rename the bound $y$ to a fresh $z$,
which gives $\forall z.\ R\ x\ z \imp P\ z$, then substitute:

$$\forall z.\ R\ (f\ y)\ z \imp P\ z$$

The $y$ in $f\ y$ is still free, as it was in the term you put in.
:::

::: isabelle
Isabelle never captures a variable when it substitutes. Inside Isabelle a bound variable is not stored by
its name but as a number that counts the quantifiers between it and its own quantifier (a de Bruijn
index); names are kept only for printing. `blast` proves the correct instance:

```isabelle
lemma "(∀x. ∃y. R x y) ⟶ (∃z. R y z)"
  by blast
```

and Nitpick refutes the captured one:

```isabelle
lemma "(∀x. ∃y. R x y) ⟶ (∃y. R y y)"
  nitpick [card 'a = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2:
  Free variable:
    R = (λx. _)
        (a⇩1 := (λx. _)(a⇩1 := False, a⇩2 := True),
           a⇩2 := (λx. _)(a⇩1 := True, a⇩2 := False))
  Skolem constant:
    λx. y = (λx. _)(a⇩1 := a⇩2, a⇩2 := a⇩1)
```

In this countermodel `R` relates a₁ to a₂ and a₂ to a₁: every element has a successor, and none is its
own successor.

```isabelle
  oops
```
:::

## Equality {#equality}

Equality is a predicate with a fixed meaning. A structure chooses what $P$ and $R$ mean, but not what
$=$ means: in every structure, $t_1 = t_2$ is true exactly when $t_1$ and $t_2$ stand for the same
element. That is why $=$ counts as a logical symbol. Its laws hold in every structure.

::: fact Laws of equality
- Reflexivity: $t = t$.
- Symmetry: $t = u \imp u = t$.
- Transitivity: $t = u \land u = v \imp t = v$.
- Substitution of equals: $t = u \imp (\varphi[t/x] \imp \varphi[u/x])$.
:::

The last law says that equal objects have the same properties. If
$\mathit{owner}\ \mathit{report} = \mathit{alice}$ and $\mathit{admin}\ (\mathit{owner}\ \mathit{report})$,
then $\mathit{admin}\ \mathit{alice}$.

With equality you can count. Two variables need not stand for different objects:
$\exists x\ y.\ P\ x \land P\ y$ is true as soon as a single element has $P$, with $x$ and $y$ both
standing for it. To say "two", you must say that they differ.

::: example Counting with equality
| English | Formula |
|---|---|
| at least one $P$ | $\exists x.\ P\ x$ |
| at least two $P$ | $\exists x\ y.\ x \neq y \land P\ x \land P\ y$ |
| at most one $P$ | $\forall x\ y.\ P\ x \land P\ y \imp x = y$ |
| exactly one $P$ | $\exists x.\ P\ x \land (\forall y.\ P\ y \imp y = x)$ |

$x \neq y$ abbreviates $\lnot (x = y)$. "At most one" does not claim that any $P$ exists: when nothing is
$P$, it is vacuously true. "Exactly one" combines "at least one" with "at most one". Isabelle has a
quantifier for it: $\exists!\, x.\ P\ x$ reads "there is exactly one $x$ such that $P\ x$".
:::

::: isabelle
Two details of `=` in Isabelle catch many beginners.

First, `=` binds more tightly than `¬`. So `¬ x = y` means `¬ (x = y)`, and Isabelle prints it with `≠`:

```isabelle
lemma "¬ x = y"
```

```output state
proof (prove)
goal (1 subgoal):
 1. x ≠ y
```

```isabelle
  oops
```

Second, between two formulas `=` means "if and only if": on the type `bool` of formulas, `=` and `⟷`
are the same function. Isabelle even prints `⟷` as `=`, as you saw in Section 3.5. But the parser gives
the two symbols different priorities: `=` binds more tightly than `∧`, while `⟷` binds more loosely,
like `⟶`. Compare:

```isabelle
lemma "(A = B ∧ C) ⟷ (A ⟷ B ∧ C)"
```

```output state
proof (prove)
goal (1 subgoal):
 1. (A = B ∧ C) = (A = (B ∧ C))
```

The goal shows Isabelle's reading. `A = B ∧ C` is `(A = B) ∧ C`, but `A ⟷ B ∧ C` is `A ⟷ (B ∧ C)`,
which Isabelle prints as `A = (B ∧ C)`. The two are not equivalent:

```isabelle
  nitpick
```

```output result
Nitpicking formula...

Nitpick found a counterexample:
  Free variables:
    A = False
    B = True
    C = False
```

With `A` false, `B` true and `C` false, the left-hand side is false and the right-hand side true. Hence
the rule: write `=` between terms, which stand for objects, and `⟷` between formulas.

```isabelle
  oops
```

The `∃!` quantifier is written as in the text (type `∃`, then `!`), and `blast` confirms its meaning:

```isabelle
lemma "(∃!x. P x) ⟷ (∃x. P x ∧ (∀y. P y ⟶ y = x))"
  by blast
```
:::

## Writing specifications {#specifications}

Turning requirements into formulas is a craft, and a formula is only as good as the translation behind
it. A routine helps:

1. Fix the domain and the vocabulary: which objects, which properties and relations, which functions.
2. Translate each requirement on its own, using the patterns below.
3. Read the formula back in plain English, literally, symbol by symbol, and compare it with the
   requirement.
4. Test it on small structures: one that should satisfy it and one that should not. The model explorer
   of Section 3.3 and Nitpick both help.

Most requirements follow a handful of patterns. $A$ and $B$ stand for properties.

| English | Formula | Note |
|---|---|---|
| every $A$ is $B$ | $\forall x.\ A\ x \imp B\ x$ | ∀ goes with ⟶ |
| some $A$ is $B$ | $\exists x.\ A\ x \land B\ x$ | ∃ goes with ∧ |
| no $A$ is $B$ | $\forall x.\ A\ x \imp \lnot\, B\ x$ | the same as $\lnot (\exists x.\ A\ x \land B\ x)$ |
| only $A$s are $B$ | $\forall x.\ B\ x \imp A\ x$ | "only" reverses the arrow |
| at most one $A$ | $\forall x\ y.\ A\ x \land A\ y \imp x = y$ | Section 3.6 |
| exactly one $A$ | $\exists x.\ A\ x \land (\forall y.\ A\ y \imp y = x)$ | Section 3.6 |

::: pitfall
**∀ with ∧.** "Every admin is on call" is not $\forall x.\ \mathit{admin}\ x \land \mathit{on\_call}\ x$:
that says that everybody is an admin and everybody is on call. With ∀, the restriction to admins is a
condition, so it goes in front of ⟶.

**∃ with ⟶.** "Some admin is on call" is not $\exists x.\ \mathit{admin}\ x \imp \mathit{on\_call}\ x$:
that is true as soon as one person is not an admin, because for that person the implication is
vacuously true. With ∃, the restriction is part of what must hold, so it is joined with ∧.
:::

::: pitfall
**"Only".** "Only admins can delete documents" means that whoever can delete a document is an admin:
$\forall u\ d.\ \mathit{can\_delete}\ u\ d \imp \mathit{admin}\ u$. It does not say that admins can
delete anything; that would be a separate requirement, with the arrow the other way round.

**"At most one" without ≠.** $\lnot (\exists x\ y.\ \mathit{holds}\ x \land \mathit{holds}\ y)$, meant
as "no two users hold the lock", forbids even a single user to hold it: take $y$ to be $x$. Write
$\forall x\ y.\ \mathit{holds}\ x \land \mathit{holds}\ y \imp x = y$.
:::

::: example An access policy, formalised
A document system has users and documents. In this example both live in one domain, and the predicates
$\mathit{user}$ and $\mathit{doc}$ say which kind an object is; such predicates are called **guards**.
The other symbols are $\mathit{admin}\ u$, $\mathit{owns}\ u\ d$, $\mathit{can\_read}\ u\ d$ and
$\mathit{can\_delete}\ u\ d$.

1. Every document has exactly one owner, and the owner is a user:
   $$\forall d.\ \mathit{doc}\ d \imp (\exists u.\ \mathit{user}\ u \land \mathit{owns}\ u\ d \land (\forall v.\ \mathit{owns}\ v\ d \imp v = u))$$
2. Only the owner of a document or an admin can delete it:
   $$\forall u\ d.\ \mathit{can\_delete}\ u\ d \imp \mathit{owns}\ u\ d \lor \mathit{admin}\ u$$
3. Admins can read every document:
   $$\forall u\ d.\ \mathit{admin}\ u \land \mathit{doc}\ d \imp \mathit{can\_read}\ u\ d$$
4. Some admin owns no document:
   $$\exists u.\ \mathit{admin}\ u \land \lnot (\exists d.\ \mathit{doc}\ d \land \mathit{owns}\ u\ d)$$

Now read them back. Requirement 1 is the "exactly one" pattern inside a ∀. Requirement 2 contains
"only", so the arrow points from $\mathit{can\_delete}$ to the condition. Requirement 3 needs the guard
$\mathit{doc}\ d$: without it, it would also say that admins can read users. Requirement 4 is the "some
$A$ is $B$" pattern, with "owns no document" written as a negated ∃.
:::

::: isabelle
Isabelle can compare two translations. If they are equivalent, `blast` proves the `⟷`. If they are not,
Nitpick produces a structure that tells them apart, and that structure shows which formula says what you
meant. Here are the two ways of saying "exactly one" from Section 3.6:

```isabelle
lemma "(∃x. holds x ∧ (∀y. holds y ⟶ y = x)) ⟷
       (∃x. holds x) ∧ (∀x y. holds x ∧ holds y ⟶ x = y)"
  by blast
```

And here is the correct translation of "some admin is on call" against the mistaken one:

```isabelle
lemma "(∃x. admin x ∧ on_call x) ⟷ (∃x. admin x ⟶ on_call x)"
  nitpick [card 'a = 1]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 1:
  Free variables:
    admin = (λx. _)(a⇩1 := False)
    on_call = (λx. _)(a⇩1 := False)
```

A single element that is not an admin: the mistaken formula is true there, and the correct one false.

```isabelle
  oops
```
:::

For more practice in translating, work through
[Logic, quantifiers, and specifications](../math/module_02_EN.html) in the Mathematical Foundations
series.

## Types: from many-sorted logic to HOL {#types}

The policy of Example 3.10 needed the guards $\mathit{user}$ and $\mathit{doc}$ because one domain held
two kinds of object. Guards are tedious, and forgetting one changes the meaning without any warning.
Leave the guard out of requirement 3 and it says that admins can read users. Write "every document has
an owner" as $\forall d.\ \exists u.\ \mathit{owns}\ u\ d$ and you have claimed that every object, users
included, is owned by something. And a function symbol such as $\mathit{owner}$ must give a value even
for a user, because a structure interprets it by a function on the whole domain.

::: definition Many-sorted logic
In a **many-sorted** or **typed** logic, the vocabulary gives each constant, each argument of a function
or predicate symbol and each function result a **sort**, also called a **type**. A structure has one
domain per sort, and each variable ranges over the domain of one sort:
$\forall d{::}\mathit{doc}.\ \exists u{::}\mathit{user}.\ \mathit{owns}\ u\ d$ reads "for every document
$d$ there is a user $u$ who owns $d$". An expression that puts an argument of the wrong sort somewhere is
not a formula at all.
:::

Types add no expressive power: $\forall d{::}\mathit{doc}.\ \varphi$ says what
$\forall d.\ \mathit{doc}\ d \imp \varphi$ says, and $\exists u{::}\mathit{user}.\ \varphi$ what
$\exists u.\ \mathit{user}\ u \land \varphi$ says, exactly the patterns of Section 3.7. What types add is
a check. The mistakes above become type errors, which a computer finds before anybody reasons with the
formula.

Isabelle/HOL is typed through and through. Every term has a type. Formulas are terms of type `bool`,
whose two values are `True` and `False`. A predicate on objects of type `τ` (tau) is a function of type
`τ ⇒ bool`, which maps each object to `True` or `False`, and a relation between `τ` and `σ` (sigma) is a
function of type `τ ⇒ σ ⇒ bool`. So `P x` in Isabelle is a function applied to an argument, and the
result is a formula. Because predicates and functions are values like any other, HOL also lets you
quantify over them, as in `∀P. P x ⟶ P x`: that is what makes it a **higher-order** logic. Module 8
covers HOL's types and functions in depth.

To declare a vocabulary in Isabelle, you declare its types with `typedecl` and its symbols with `consts`:

```isabelle
typedecl user
typedecl doc

consts
  admin :: "user ⇒ bool"
  owns :: "user ⇒ doc ⇒ bool"
  can_delete :: "user ⇒ doc ⇒ bool"
  alice :: user
  report :: doc
```

`typedecl user` declares a new type about which nothing is known except that it has at least one
element: a domain. `consts` declares constants with their types but without definitions. They are
**uninterpreted**, exactly like the symbols of a vocabulary: a structure decides what they mean, and
Isabelle proves a lemma about them only if it holds whatever they mean. Here, at last, is the argument of
Section 3.1:

```isabelle
lemma "(∀u d. admin u ⟶ can_delete u d) ∧ admin alice ⟶ can_delete alice report"
  by blast
```

The variables `u` and `d` need no guards: their types follow from `admin u` and `can_delete u d`. Now
something that does not follow. If owners can delete their documents, can Alice delete the report? Only
if she owns it. Nitpick needs the option `show_consts` to display the values of constants:

```isabelle
lemma "(∀u d. owns u d ⟶ can_delete u d) ⟶ can_delete alice report"
  nitpick [card user = 2, card doc = 1, show_consts]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card doc = 1 and card user = 2:
  Constants:
    alice = u⇩1
    can_delete =
      (λx. _)(u⇩1 := (λx. _)(d⇩1 := False), u⇩2 := (λx. _)(d⇩1 := False))
    owns = (λx. _)(u⇩1 := (λx. _)(d⇩1 := False), u⇩2 := (λx. _)(d⇩1 := False))
    report = d⇩1
```

Nitpick names the elements after their types: u₁ and u₂ are users, d₁ is a document. In this structure
nobody owns anything, so the premise is vacuously true, and nobody can delete anything.

```isabelle
  oops
```

Types catch mistakes like those of the pitfall in Section 3.2, and more. Swap the arguments of `owns`:

```isabelle fails
lemma "owns report alice"
```

```output
*** Type unification failed: Clash of types "doc" and "user"
***
*** Type error in application: incompatible operand type
***
*** Operator:  owns :: user ⇒ doc ⇒ bool
*** Operand:   report :: doc
***
```

Isabelle refuses the statement before trying to prove anything. The message names the function
(`Operator`) and the argument that does not fit (`Operand`): `owns` expects a `user` first, and `report`
is a `doc`.

When you write a lemma without declarations, Isabelle infers the most general types. In
`(∀x. P x) ⟶ (∃x. P x)` nothing says what `x` is, so `x` gets a type variable `'a`, and `P` the type
`'a ⇒ bool`. A lemma proved for a type variable holds for every type, that is, for every domain:

```isabelle
lemma "(∀x. P x) ⟶ (∃x. P x)"
  by blast
```

The formula is valid because every type, like every domain of a structure, has at least one element.
Over an empty domain, `∀x. P x` would be vacuously true and `∃x. P x` false.

::: trouble
- **A predicate with too many arguments.** Use `P` with one argument in one place and two in another,
  and Isabelle cannot give it a type:

  ```isabelle fails
  lemma "P x ⟶ P x y"
  ```

  ```output
  *** Type unification failed: Clash of types "_ ⇒ _" and "bool"
  ***
  *** Type error in application: operator not of function type
  ***
  *** Operator:  P x :: bool
  *** Operand:   y :: ??'a
  ***
  ```

  From `P x`, Isabelle decided that `P x` is a formula, of type `bool`, and a formula cannot be applied
  to `y`; `??'a` stands for a type that Isabelle had not yet worked out. Give each predicate the same
  number of arguments everywhere.
- **A name that is a keyword.** Some English words are keywords of Isabelle's command language, and
  `file` is one of them:

  ```isabelle fails
  typedecl file
  ```

  ```output
  *** Outer syntax error⌂: name expected,
  *** but keyword file⌂ was found
  ```

  Choose another name, such as `doc`.
:::

## Decidability: what tools can and cannot do {#decidability}

For propositional logic, Module 2 gave an algorithm that decides validity: compute the truth table. It
may be slow, but it always finishes with the right answer. Is there such an algorithm for predicate
logic? David Hilbert and Wilhelm Ackermann asked this in 1928, as the *Entscheidungsproblem*, the
"decision problem". The answer came in two parts.

::: fact Gödel's completeness theorem
There are proof systems for predicate logic, natural deduction among them (Module 6), in which a formula
can be proved exactly when it is valid. Kurt Gödel proved this in his doctoral thesis of 1929, published
in 1930.
:::

Completeness has a practical consequence. Proofs are finite texts that a program can check, so a program
can list all proofs, shortest first, together with the formulas they prove. Every valid formula appears
in the list sooner or later. To find out whether a formula is valid, run the program and wait for the
formula to appear: if it is valid, the answer "yes" comes in the end. If it is not, you wait for ever,
and at no point do you know whether waiting longer would help.

::: fact Undecidability of predicate logic
No algorithm decides, for every formula of predicate logic, whether it is valid. Alonzo Church and Alan
Turing proved this independently in 1936.
:::

Turing's proof connects to the halting problem that Module 1 mentioned: for every program you can write
a formula that is valid exactly when the program halts, so an algorithm for validity would decide
halting, which no algorithm can.

::: definition Decidable and semi-decidable
A question about inputs is **decidable** if some algorithm answers it correctly for every input and
always terminates. It is **semi-decidable** if some algorithm answers "yes" for every input whose answer
is yes, but may run for ever on the others.
:::

Validity in predicate logic is semi-decidable but not decidable. The same holds for unsatisfiability,
since $\varphi$ is unsatisfiable exactly when $\lnot \varphi$ is valid; satisfiability is not even
semi-decidable.

Two theorems of Gödel are easily confused. The **completeness theorem** (1929/1930) is about the valid
formulas, those true in every structure: all of them can be proved. His **incompleteness theorems**
(1931), which Module 1 mentioned, are about the formulas true in one particular structure, the natural
numbers: no proof system whose axioms a program can check, and which proves only true statements, proves
all of them. HOL can describe the natural numbers, so incompleteness applies to Isabelle's logic too.

::: figure id=fig-03-3
What a search can settle. Valid formulas have proofs, and a proof search finds one in the end.
Formulas with a finite countermodel are refuted by searching finite structures. For formulas whose
countermodels are all infinite, neither search ever stops.
:::

Why do some formulas defeat both kinds of search? Because a countermodel can be infinite. Take

$$
(\forall x.\ \lnot\, R\ x\ x) \land (\forall x\ y\ z.\ R\ x\ y \land R\ y\ z \imp R\ x\ z) \imp \lnot (\forall x.\ \exists y.\ R\ x\ y)
$$

"If $R$ is irreflexive and transitive, then some element has no $R$-successor." It is not valid: with the
natural numbers as domain and $<$ as $R$, both premises hold, and every number has a larger one. But it
is true in every finite structure (Exercise 3.8 asks you to show why), so a search through finite
structures never finds a countermodel, and a proof search never finds a proof, because there is none.
Such formulas must exist. If every formula that is not valid had a finite countermodel, you could run a
proof search and a countermodel search side by side; one of them would always finish, and validity would
be decidable, which Church and Turing showed it is not.

::: isabelle
Both of Isabelle's tools give up on this formula. Nitpick tries domains of 1 to 10 elements:

```isabelle
lemma "(∀x. ¬ R x x) ∧ (∀x y z. R x y ∧ R y z ⟶ R x z) ⟶ ¬ (∀x. ∃y. R x y)"
  nitpick
```

```output result
Nitpicking formula...

Nitpick found no counterexample
```

```isabelle
  oops
```

and `blast` fails:

```isabelle fails
lemma "(∀x. ¬ R x x) ∧ (∀x y z. R x y ∧ R y z ⟶ R x z) ⟶ ¬ (∀x. ∃y. R x y)"
  by blast
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. (∀x. ¬ R x x) ∧ (∀x y z. R x y ∧ R y z ⟶ R x z) ⟶ ¬ (∀x. ∃y. R x y)
```

`blast` searches for a proof with a growing bound on its "unsafe" steps, such as choosing an instance of
a ∀ that it may need again later, from 0 up to 20 by default, and then gives up with this message.
Neither message settles the question. You need to think, and here the thought is the infinite
countermodel above.
:::

What this means in practice:

- **Proof search** (`simp`, `blast`, `auto`, and the provers that Sledgehammer calls in Module 9)
  succeeds or gives up. Success gives a theorem; giving up tells you nothing.
- **Countermodel search** (Nitpick and Quickcheck) is the other half: a genuine counterexample shows that
  a formula is not valid; finding none shows nothing.
- When both give up, the work is yours: find the idea of the proof and guide Isabelle through it, as
  Parts II and III teach, or find a countermodel that the tools cannot see.

Not everything is undecidable. Propositional logic is decidable, and so is the part of predicate logic
in which every predicate takes one argument and there are no function symbols. SAT and SMT solvers
(Module 1) decide useful fragments efficiently, which is why Isabelle's tools call them for help.

::: keyidea
Validity in predicate logic is semi-decidable: a systematic search finds a proof whenever one exists,
but no program can always tell you that none exists. That is why Isabelle offers both provers and
counterexample finders, why automation sometimes gives up on true statements, and why the rest of this
series teaches you to guide proofs yourself.
:::

## What you learned {#summary}

- Predicate logic adds **terms**, which name objects, **predicates**, which state properties and
  relations, and the **quantifiers** ∀ ("for all") and ∃ ("there exists") to propositional logic.
- In Isabelle a quantifier's **scope** extends as far to the right as possible. Occurrences of a variable
  in the scope of its quantifier are **bound**, the others **free**; a **sentence** has no free variables.
- A **structure** is a non-empty domain with an interpretation of the vocabulary. A false ∀ has a
  **counterexample**, a true ∃ a **witness**.
- A formula is **valid** if it is true in every structure, **satisfiable** if it is true in some. One
  **countermodel** refutes validity; validity needs an argument about every structure.
- Negation swaps ∀ and ∃; ∀ distributes over ∧ and ∃ over ∨, but not the other way round; ∃y. ∀x
  implies ∀x. ∃y, but not conversely. **Substitution** must not **capture** variables.
- In specifications, ∀ goes with ⟶ and ∃ with ∧, "only" reverses the arrow, and counting needs `=`.
- In Isabelle, predicates are functions to `bool`; `typedecl` and `consts` declare a vocabulary; free
  variables of a lemma are implicitly universal; `blast` proves first-order goals and `nitpick` finds
  countermodels. `=` binds more tightly than `¬` and `∧`, `⟷` as loosely as `⟶`.
- Validity is **semi-decidable** (Gödel's completeness theorem) but **undecidable** (Church and Turing,
  1936): provers may give up on valid formulas, and countermodel finders miss infinite countermodels.

## Exercises {#exercises}

:::: exercise Free or bound? {#ex-3-1} ★
For each formula, say which occurrences of variables are free, and which quantifier each bound
occurrence belongs to. Which formulas are sentences? Use Isabelle's convention for scopes.

1. $\forall x.\ R\ x\ y \imp (\exists y.\ R\ y\ x)$
2. $(\exists x.\ P\ x) \land Q\ x$
3. $\exists x.\ P\ x \land Q\ x$
4. $\forall x.\ (\exists x.\ R\ x\ x) \imp P\ x$

::: solution
1. The scope of $\forall x$ is all the rest of the formula. In $R\ x\ y$, the $x$ belongs to $\forall x$
   and the $y$ is free. In $\exists y.\ R\ y\ x$, the $y$ belongs to $\exists y$ and the $x$ to
   $\forall x$. Not a sentence, because of the first $y$.
2. The parentheses close the scope of $\exists x$ after $P\ x$, so the $x$ in $Q\ x$ is free. Not a
   sentence.
3. The scope of $\exists x$ runs to the end, so both occurrences of $x$ belong to it. A sentence.
   Formulas 2 and 3 differ only in their parentheses, and they mean different things.
4. Both occurrences of $x$ in $R\ x\ x$ belong to the inner $\exists x$, whose scope ends at the closing
   parenthesis. The $x$ in $P\ x$ belongs to $\forall x$. A sentence.
:::
::::

:::: exercise True in a structure? {#ex-3-2} ★
Let $\mathcal M_2$ have the domain $\{1, 2, 3\}$, $P^{\mathcal M_2} = \{1, 3\}$ ("is odd"), and let
$R\ x\ y$ hold when $x < y$. Decide whether each sentence is true in $\mathcal M_2$. Give a witness for
each true ∃ and a counterexample for each false ∀.

1. $\forall x.\ \exists y.\ R\ x\ y$
2. $\exists y.\ \forall x.\ \lnot\, R\ y\ x$
3. $\forall x.\ P\ x \imp (\exists y.\ R\ x\ y)$
4. $\exists x.\ \forall y.\ x = y \lor R\ x\ y$
5. $\forall x\ y.\ R\ x\ y \imp \lnot\, R\ y\ x$

::: solution
1. False. Counterexample $x = 3$: no element of the domain is larger than 3.
2. True. Witness $y = 3$: $R\ 3\ x$ is false for every $x$, since nothing is larger than 3.
3. False. Counterexample $x = 3$: 3 is odd, and no element is larger. (For $x = 1$ the witness $y = 2$
   works, and for $x = 2$ the implication is vacuously true.)
4. True. Witness $x = 1$: for $y = 1$, $x = y$ holds; for $y = 2$ and $y = 3$, $R\ 1\ y$ holds.
5. True. $x < y$ and $y < x$ never hold together.

You can check all five in the model explorer of Section 3.3 on a copy of $\mathcal M_2$: let $a$, $b$
and $c$ stand for 1, 2 and 3, tick $P$ for $a$ and $c$, and switch $R$ on for the pairs $(a, b)$,
$(a, c)$ and $(b, c)$.
:::
::::

:::: exercise From English to formulas {#ex-3-3} ★
The vocabulary has the one-place predicates $\mathit{train}$ and $\mathit{block}$, the two-place
predicate $\mathit{occupies}\ t\ b$ ("train $t$ occupies block $b$") and the constant $\mathit{depot}$.
Translate:

1. Every train occupies some block.
2. No block is occupied by two different trains.
3. Some block is free, that is, occupied by no train.
4. Only trains occupy blocks.
5. Exactly one train occupies the depot.

::: solution
1. $\forall t.\ \mathit{train}\ t \imp (\exists b.\ \mathit{block}\ b \land \mathit{occupies}\ t\ b)$
2. $\forall b\ t\ u.\ \mathit{block}\ b \land \mathit{occupies}\ t\ b \land \mathit{occupies}\ u\ b \imp t = u$.
   An equivalent form follows the English more closely:
   $\lnot (\exists b\ t\ u.\ \mathit{block}\ b \land t \neq u \land \mathit{occupies}\ t\ b \land \mathit{occupies}\ u\ b)$.
3. $\exists b.\ \mathit{block}\ b \land \lnot (\exists t.\ \mathit{train}\ t \land \mathit{occupies}\ t\ b)$
4. $\forall x\ b.\ \mathit{occupies}\ x\ b \imp \mathit{train}\ x$: "only" reverses the arrow.
5. $\exists t.\ \mathit{train}\ t \land \mathit{occupies}\ t\ \mathit{depot} \land (\forall u.\ \mathit{train}\ u \land \mathit{occupies}\ u\ \mathit{depot} \imp u = t)$

In 1 and 3, ∀ goes with ⟶ and ∃ with ∧, as the patterns of Section 3.7 say. In 2, guards
$\mathit{train}\ t$ and $\mathit{train}\ u$ are unnecessary because of sentence 4, but adding them does
no harm.
:::
::::

:::: exercise Valid or not? {#ex-3-4} ★★
Decide whether each formula is valid. For a valid one, give a short argument; for the others, give a
countermodel. Then check your answers in Isabelle with `blast` or with `nitpick [card = 2]`.

1. $(\exists x.\ P\ x \land Q\ x) \imp (\exists x.\ P\ x) \land (\exists x.\ Q\ x)$
2. $(\exists x.\ P\ x) \land (\exists x.\ Q\ x) \imp (\exists x.\ P\ x \land Q\ x)$
3. $(\forall x.\ P\ x \imp Q\ x) \imp (\exists x.\ P\ x) \imp (\exists x.\ Q\ x)$
4. $(\forall x.\ \exists y.\ R\ x\ y) \imp (\forall x.\ \exists y.\ R\ y\ x)$

::: solution
1. Valid. A witness for $\exists x.\ P\ x \land Q\ x$ is a witness for both $\exists x.\ P\ x$ and
   $\exists x.\ Q\ x$.
2. Not valid: $D = \{a, b\}$, $P = \{a\}$, $Q = \{b\}$. Something is $P$ and something is $Q$, but
   nothing is both.
3. Valid. Take a witness $x$ of $P\ x$; the premise gives $Q\ x$ for it, so it is a witness of
   $\exists x.\ Q\ x$.
4. Not valid. "Everybody trusts somebody" does not imply "everybody is trusted by somebody":
   $D = \{a, b\}$ with $R = \{(a, a), (b, a)\}$. Everybody trusts $a$, and nobody trusts $b$.

In Isabelle:

```isabelle
lemma "(∃x. P x ∧ Q x) ⟶ (∃x. P x) ∧ (∃x. Q x)"
  by blast

lemma "(∀x. P x ⟶ Q x) ⟶ (∃x. P x) ⟶ (∃x. Q x)"
  by blast
```

```isabelle
lemma "(∃x. P x) ∧ (∃x. Q x) ⟶ (∃x. P x ∧ Q x)"
  nitpick [card = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2:
  Free variables:
    P = (λx. _)(a⇩1 := False, a⇩2 := True)
    Q = (λx. _)(a⇩1 := True, a⇩2 := False)
  Skolem constants:
    x = a⇩2
    x = a⇩1
```

```isabelle
  oops
```

```isabelle
lemma "(∀x. ∃y. R x y) ⟶ (∀x. ∃y. R y x)"
  nitpick [card = 2]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card 'a = 2 and card 'b = 2:
  Free variable:
    R = (λx. _)
        (a⇩1 := (λx. _)(b⇩1 := False, b⇩2 := True),
           a⇩2 := (λx. _)(b⇩1 := False, b⇩2 := True))
  Skolem constants:
    x = b⇩1
    λx. y = (λx. _)(a⇩1 := b⇩2, a⇩2 := b⇩2)
```

```isabelle
  oops
```

In formula 4, nothing forces `x` and `y` to have the same type, so Isabelle gives them two types, as
in Section 3.5, and Nitpick's countermodel relates the elements of `'a` to those of `'b`; the option
`[card = 2]` fixes the size of both. Nitpick's countermodels may differ from yours in which element is
which; any countermodel will do.
:::
::::

:::: exercise Negate a specification {#ex-3-5} ★★
Negate each requirement and push the negation inwards until it stands only in front of atomic formulas.
Then say in English what a violation looks like.

1. $\forall r.\ \mathit{request}\ r \imp (\exists s.\ \mathit{server}\ s \land \mathit{handles}\ s\ r)$
2. $\exists s.\ \mathit{server}\ s \land (\forall r.\ \mathit{request}\ r \imp \mathit{handles}\ s\ r)$
3. $\forall x\ y.\ \mathit{holds}\ x \land \mathit{holds}\ y \imp x = y$

::: solution
1. $\exists r.\ \mathit{request}\ r \land (\forall s.\ \mathit{server}\ s \imp \lnot\, \mathit{handles}\ s\ r)$:
   some request is handled by no server. The steps: $\lnot \forall$ becomes $\exists \lnot$;
   $\lnot (A \imp B)$ becomes $A \land \lnot B$; $\lnot \exists$ becomes $\forall \lnot$; and
   $\lnot (C \land D)$ becomes $C \imp \lnot D$, an equivalence that a truth table confirms.
2. $\forall s.\ \mathit{server}\ s \imp (\exists r.\ \mathit{request}\ r \land \lnot\, \mathit{handles}\ s\ r)$:
   every server fails to handle some request, so no server handles them all.
3. $\exists x\ y.\ \mathit{holds}\ x \land \mathit{holds}\ y \land x \neq y$: two different users hold
   the lock.

:::
::::

:::: exercise Counting in Isabelle {#ex-3-6} ★★
1. Prove with `blast` that the negation of "at most one element satisfies `P`" is "at least two elements
   satisfy `P`", using the formulas of Example 3.9.
2. Somebody writes "exactly one element satisfies `P`" as `∃x. ∀y. P y ⟶ y = x`. Use Nitpick to compare
   this formula with `∃!x. P x`, and explain what the formula really says.

::: solution
1. Push the negation through: $\lnot \forall$ becomes $\exists \lnot$, and
   $\lnot (P\ x \land P\ y \imp x = y)$ becomes $P\ x \land P\ y \land x \neq y$.

   ```isabelle
   lemma "¬ (∀x y. P x ∧ P y ⟶ x = y) ⟷
          (∃x y. x ≠ y ∧ P x ∧ P y)"
     by blast
   ```

2. Nitpick finds a structure in which the two formulas differ:

   ```isabelle
   lemma "(∃x. ∀y. P y ⟶ y = x) ⟷ (∃!x. P x)"
     nitpick [card 'a = 1]
   ```

   ```output result
   Nitpicking formula...

   Nitpick found a counterexample for card 'a = 1:
     Free variable:
       P = (λx. _)(a⇩1 := False)
   ```

   ```isabelle
     oops
   ```

   In a one-element domain where `P` holds for nothing, `∃x. ∀y. P y ⟶ y = x` is true (vacuously, for
   every `x`), but `∃!x. P x` is false. The formula says "at most one element satisfies `P`": it forgets
   to say that one does.
:::
::::

:::: exercise Substitution {#ex-3-7} ★★★
Compute each substitution, renaming bound variables where necessary:

1. $(\forall y.\ R\ x\ y)[z/x]$
2. $(\forall y.\ R\ x\ y)[y/x]$
3. $(\exists x.\ R\ x\ y \land P\ x)[f\ x/y]$
4. $(P\ x \land (\exists x.\ R\ x\ y))[g\ y/x]$

Then explain what goes wrong if you conclude $\exists y.\ y \neq y$ from $\forall x.\ \exists y.\ y \neq x$
by putting $y$ for $x$, and in which structures the premise is true.

::: solution
1. $\forall y.\ R\ z\ y$. The term $z$ contains no bound variable of the formula, so nothing needs
   renaming.
2. Putting $y$ in directly would give $\forall y.\ R\ y\ y$, which captures it. Rename first:
   $\forall w.\ R\ y\ w$.
3. The term $f\ x$ contains $x$, which the formula binds. Rename the bound $x$ to $w$, giving
   $\exists w.\ R\ w\ y \land P\ w$, then substitute: $\exists w.\ R\ w\ (f\ x) \land P\ w$.
4. Only the first $x$ is free, and the term $g\ y$ contains no variable that the formula binds:
   $P\ (g\ y) \land (\exists x.\ R\ x\ y)$.

The premise $\forall x.\ \exists y.\ y \neq x$ says that every element has a different element, which
is true in every structure with at least two elements. Putting $y$ for $x$ without renaming captures the
$y$ and gives $\exists y.\ y \neq y$, which is false in every structure. The correct instance renames
first: $\exists w.\ w \neq y$, "something differs from $y$", which does follow.
:::
::::

:::: exercise Only infinite countermodels {#ex-3-8} ★★★
Show that the formula of Section 3.9,
$(\forall x.\ \lnot\, R\ x\ x) \land (\forall x\ y\ z.\ R\ x\ y \land R\ y\ z \imp R\ x\ z) \imp \lnot (\forall x.\ \exists y.\ R\ x\ y)$,
is true in every finite structure. Hint: suppose a finite structure in which $R$ is irreflexive and
transitive and every element has an $R$-successor, start at any element and keep following successors.

::: solution
Suppose, to the contrary, that $\mathcal M$ is finite, $R$ is irreflexive and transitive in
$\mathcal M$, and every element has an $R$-successor. Pick any element $x_0$, then $x_1$ with
$R\ x_0\ x_1$, then $x_2$ with $R\ x_1\ x_2$, and so on. Applying transitivity repeatedly gives
$R\ x_i\ x_j$ whenever $i < j$. The domain is finite, so the sequence must repeat: $x_i = x_j$ for some
$i < j$. Then $R\ x_i\ x_j$ is $R\ x_i\ x_i$, which irreflexivity forbids. So in a finite structure
where the premises hold, some element has no successor, and the formula is true.

The argument fails for an infinite domain, because the sequence need not repeat: in the natural numbers
with $<$, the sequence $0, 1, 2, \dots$ goes on for ever. That is the infinite countermodel of
Section 3.9.
:::
::::

:::: exercise A typed policy in Isabelle {#ex-3-9} ★★★
Extend the vocabulary of Section 3.8 with `can_read :: "user ⇒ doc ⇒ bool"` and a second user
`bob :: user`. Take these requirements: nobody can delete a document they cannot read, and owners can
delete their documents.

1. Prove with `blast`: if, in addition, Alice owns the report, then Alice can read the report.
2. Use Nitpick to show that the requirements and `admin bob` do not imply that Bob can read the
   report. Explain the countermodel.

::: solution
```isabelle
consts
  can_read :: "user ⇒ doc ⇒ bool"
  bob :: user

lemma "(∀u d. can_delete u d ⟶ can_read u d) ∧
       (∀u d. owns u d ⟶ can_delete u d) ∧
       owns alice report ⟶ can_read alice report"
  by blast
```

Alice owns the report, so she can delete it, so she can read it: two instances of the ∀-requirements,
which `blast` finds.

```isabelle
lemma "(∀u d. can_delete u d ⟶ can_read u d) ∧
       (∀u d. owns u d ⟶ can_delete u d) ∧
       admin bob ⟶ can_read bob report"
  nitpick [card user = 1, card doc = 1, show_consts]
```

```output result
Nitpicking formula...

Nitpick found a counterexample for card doc = 1 and card user = 1:
  Constants:
    admin = (λx. _)(u⇩1 := True)
    can_delete = (λx. _)(u⇩1 := (λx. _)(d⇩1 := False))
    owns = (λx. _)(u⇩1 := (λx. _)(d⇩1 := False))
    report = d⇩1
    bob = u⇩1
    can_read = (λx. _)(u⇩1 := (λx. _)(d⇩1 := False))
```

```isabelle
  oops
```

In the countermodel Bob is an admin, but nobody owns anything and nobody can read or delete anything;
both requirements hold, vacuously. Nothing in the requirements gives admins any rights. If admins should
read everything, that is a further requirement, such as requirement 3 of Example 3.10.
:::
::::

## Check yourself {#quiz}

```quiz
? Which formula says "every admin is on call"?
- [ ] $\forall x.\ \mathit{admin}\ x \land \mathit{on\_call}\ x$
- [x] $\forall x.\ \mathit{admin}\ x \imp \mathit{on\_call}\ x$
- [ ] $\exists x.\ \mathit{admin}\ x \imp \mathit{on\_call}\ x$
- [ ] $\forall x.\ \mathit{on\_call}\ x \imp \mathit{admin}\ x$
> With ∀, the restriction to admins is a condition, so ∀ goes with ⟶. The first option says that everybody is an admin; the last says that only admins are on call.

? With Isabelle's scope convention, which occurrence is free in $\forall x.\ P\ x \imp (\exists y.\ R\ x\ y) \land Q\ y$?
- [ ] The $x$ in $R\ x\ y$
- [ ] The $y$ in $R\ x\ y$
- [ ] The $x$ in $P\ x$
- [x] The $y$ in $Q\ y$
> The parentheses end the scope of $\exists y$ after $R\ x\ y$, so the $y$ in $Q\ y$ lies outside it. The scope of $\forall x$ runs to the end of the formula.

? Which formula is valid?
- [x] $(\exists y.\ \forall x.\ R\ x\ y) \imp (\forall x.\ \exists y.\ R\ x\ y)$
- [ ] $(\forall x.\ \exists y.\ R\ x\ y) \imp (\exists y.\ \forall x.\ R\ x\ y)$
- [ ] $(\forall x.\ P\ x \lor Q\ x) \imp (\forall x.\ P\ x) \lor (\forall x.\ Q\ x)$
- [ ] $(\exists x.\ P\ x) \land (\exists x.\ Q\ x) \imp (\exists x.\ P\ x \land Q\ x)$
> If one $y$ works for every $x$, then every $x$ has a $y$. The other three formulas have countermodels with two elements.

? What does a countermodel of a formula show?
- [ ] That the formula is unsatisfiable
- [ ] That the formula is true in some structure
- [x] That the formula is not valid
- [ ] That `blast` cannot prove the formula but another method could
> A countermodel is a structure in which the formula is false, so the formula is not true in every structure. It may still be satisfiable.

? How does Isabelle read `¬ x = y ∧ P x`?
- [ ] `¬ (x = y ∧ P x)`
- [x] `(¬ (x = y)) ∧ P x`
- [ ] `¬ x = (y ∧ P x)`
- [ ] It rejects the formula as ambiguous
> `=` binds more tightly than `¬`, and `¬` more tightly than `∧`. Isabelle prints the formula as `x ≠ y ∧ P x`.

? Nitpick answers "Nitpick found no counterexample" for a lemma. What do you know?
- [ ] The lemma is valid
- [ ] The lemma is unsatisfiable
- [ ] The lemma has an infinite countermodel
- [x] No countermodel exists among the finite structures that Nitpick searched; the lemma may still be false
> Nitpick searches domains up to a size limit, 10 elements by default. Some formulas that are not valid, such as the one in Section 3.9, have only infinite countermodels.
```
