---
title: Functional programming in HOL
part: 3
lead: Use Isabelle/HOL as a typed functional programming language. Define your own data types and functions, compute with them, read the types and messages Isabelle prints, see why every function must terminate, and turn your definitions into Haskell code.
minutes: 210
needs: Modules 1–7, especially recursion and induction from Module 5
goals:
  - Read and write HOL types and terms, and inspect them with `typ`, `term` and `value`
  - Use λ-abstraction, currying and partial application
  - Define data types, and functions on them with `definition`, `fun` and `primrec`
  - Compute with lists and numbers, and explain overloaded notation with type classes
  - Explain why every function must terminate, and read Isabelle's termination messages
  - Generate Haskell code from your definitions with `export_code`
imports: Main
---

## Programs in a logic {#hol}

In Part II you used Isabelle to check proofs about formulas. Part III turns to the other half of
Isabelle/HOL: it is also a programming language. HOL contains a small, typed **functional programming
language**, close to Haskell, OCaml and Standard ML (the language of Isabelle's own core).
You write programs as equations, Isabelle runs them, and because the programs are part of the logic,
you can prove facts about them. Modules 9 to 11 are about the proving; this module is about the
programming.

Programs in HOL differ from programs in Python, Java or C in three ways.

- **No side effects.** A HOL function does not change variables, print, or read files. Given the same
  arguments, it always returns the same result, like a function in mathematics.
- **No loops.** Repetition is done by recursion, as in Module 5.
- **Every function is total.** It returns a result for every argument of its type. Section 8.7 explains
  why the logic insists on this.

This module builds one example step by step: a controller for a British traffic light, which shows red,
then red and amber together, then green, then amber, and then red again. You will describe its states as
a data type, compute its sequence of states and their timing with lists and numbers, check a safety rule
for a junction, and finally generate Haskell code for it. On the way you will meet the errors that
beginners meet, with Isabelle's real messages.

Start a new theory for this module, as in Module 1 (for example `Traffic.thy` with `theory Traffic`),
and type the blocks into it as you read.

### Types {#types}

Every term in HOL has a **type**, and Isabelle checks types before it does anything else. Types rule out
nonsense such as adding a number to a list: a term that cannot be given a type is rejected at once.

| Type | Its values | Examples |
|---|---|---|
| `bool` | the truth values | `True`, `False` |
| `nat` | the natural numbers 0, 1, 2, … | `0`, `Suc 0`, `42` |
| `int` | the integers …, −1, 0, 1, … | `-3`, `7` |
| `'a list` | finite lists of elements of type `'a` | `[]`, `[1, 2, 3]` |
| `'a × 'b` | pairs of an `'a` and a `'b` | `(3, True)` |
| `'a option` | no value, or one value of type `'a` | `None`, `Some 5` |
| `'a ⇒ 'b` | functions from `'a` to `'b` | `Suc`, `rev` |

::: definition Types in HOL
A **base type** such as `bool`, `nat` or `int` is a name. A **type constructor** such as `list` or
`option` builds a type from other types and is written *after* its arguments: `nat list` is the type of
lists of natural numbers, and `nat list list` the type of lists of such lists. `'a × 'b` is the type of
pairs and `'a ⇒ 'b` the type of functions. A **type variable** `'a`, `'b`, … stands for any type; a
function whose type contains one, such as `rev :: 'a list ⇒ 'a list`, works for every instance of it
and is called **polymorphic**.
:::

Read `t :: τ` as "t has type τ". Type the function arrow ⇒ as `=>` and the product sign × as `<*>` (or
write `*` instead of ×). The arrow binds more weakly than any type constructor, so `nat ⇒ bool list`
means `nat ⇒ (bool list)`.

The command `typ` checks that a type is well formed and prints it back:

```isabelle
typ "nat × bool"
typ "nat ⇒ bool list"
typ "(nat ⇒ bool) list"
```

```output all
"nat × bool"

"nat ⇒ bool list"

"(nat ⇒ bool) list"
```

Isabelle prints each type with as few parentheses as possible. The second type needs none, because ⇒
binds most weakly; the third needs them, because it is a list of functions, not a function that returns a
list.

### Terms and type inference {#terms}

A **term** is an expression of HOL: a constant such as `True`, `0` or `rev`, a variable such as `x`, a
function applied to arguments such as `rev xs`, or one of the forms this module introduces. The command
`term` reads a term, works out its type and prints both, without evaluating anything:

```isabelle
term "Suc 0"
term "[Suc 0, 5]"
term "(Suc 0, [True])"
```

```output all
"Suc 0"
  :: "nat"

"[Suc 0, 5]"
  :: "nat list"

"(Suc 0, [True])"
  :: "nat × bool list"
```

You never said that `5` is a natural number; Isabelle worked it out. All elements of a list have one
type, `Suc 0` is a `nat`, so `5` must be a `nat` too. In the last term, the pair has a `nat` on the left
and a `bool list` on the right, so its type is `nat × bool list`.

::: definition Type inference and type annotations
**Type inference** computes the type of every part of a term from the types of the constants in it.
Where the constants leave the type open, the result contains type variables. A **type annotation**
`t :: τ` (or `(t::τ)` inside a larger term) tells Isabelle that `t` has type τ.
:::

Here the constants leave the type open:

```isabelle
term "x + 1"
```

```output
"x + 1"
  :: "'a"
```

The variable `x` and the number `1` could be natural numbers, integers or real numbers: all of them have
`+` and `1`. Isabelle answers with the type variable `'a`, "some type". One annotation settles it:

```isabelle
term "x + (1::nat)"
```

```output
"x + 1"
  :: "nat"
```

Since `+` takes two arguments of the same type, `x` is now a `nat` too. Section 8.6 explains what Isabelle
knows about the `'a` in `x + 1`.

`x` is a **free variable**: a name that is not a constant. Isabelle/jEdit shows free variables in blue,
and constants such as `Suc` in black.

### Computing with value {#value}

`value` evaluates a term and prints the result with its type, as in Module 1. It also works with free
variables, which it treats as unknown values:

```isabelle
value "rev [a, b, c]"
```

```output
"[c, b, a]"
  :: "'a list"
```

Isabelle reversed a list of three elements it knows nothing about. This is useful for testing a function
on symbolic inputs.

::: pitfall
A misspelt name is a free variable too. Isabelle has no constant `lenght`, so here it takes `lenght` to be
an unknown function and hands the term back unevaluated, with an unknown type:

```isabelle
value "lenght [1, 2::nat]"
```

```output
"lenght [1, 2]"
  :: "'a"
```

There is no error message. When `value` returns your term unchanged with a type variable such as `'a`,
look for a misspelt name: Isabelle/jEdit shows it in blue, like any variable.
:::

### When types do not fit {#type-errors}

A term that cannot be typed is rejected with a message. `Suc` takes a natural number, and `True` is not
one:

```isabelle fails
value "Suc True"
```

```output
*** Type unification failed: Clash of types "bool" and "nat"
***
*** Type error in application: incompatible operand type
***
*** Operator:  Suc :: nat ⇒ nat
*** Operand:   True :: bool
***
```

Read the message from the top:

- **Type unification failed.** To type an application `f a`, Isabelle must make the argument type of `f`
  equal to the type of `a`. Finding types that make two types equal is called **type unification**: the
  same idea as the unification of formulas in Module 7, applied to types. Here it failed.
- **Clash of types "bool" and "nat"** names the two types that could not be made equal.
- **Operator** is the function, `Suc :: nat ⇒ nat`; **Operand** is the argument, `True :: bool`.

Giving a function too many arguments produces a different message. `rev` takes one list:

```isabelle fails
value "rev [1, 2::nat] [3]"
```

```output
*** Type unification failed: Clash of types "_ ⇒ _" and "_ list"
***
*** Type error in application: operator not of function type
***
*** Operator:  rev [1, 2] :: nat list
*** Operand:   [3::??'a] :: ??'a list
***
```

Isabelle reads `rev [1, 2] [3]` as the list `rev [1, 2]` applied to `[3]`. A list is not a function, so
the **operator** `rev [1, 2]` is "not of function type". In the clash, `_ ⇒ _` stands for "some function
type" and `_ list` for "some list type". The type `??'a` of `[3]` is a type variable that Isabelle
invented while it worked on the term and never had to fix.

## Functions are values {#functions}

In HOL a function is a value like a number or a list. You can pass it to another function, return it as a
result, and keep it in a list. This section shows how to write functions without naming them, and how
functions of several arguments work.

### λ-abstraction {#lambda}

To write a function without giving it a name, use **λ-abstraction**: `λx. x + 1` is the function that
maps `x` to `x + 1`. Read it "lambda x, x plus 1". Type λ as `%` or `\lambda`.

::: definition λ-abstraction and application
If `t` is a term of type τ₂ in which the variable `x` of type τ₁ may occur, then `λx. t` is the function of
type τ₁ ⇒ τ₂ that maps each value `x` to `t`. **Application** of a function `f` to an argument `a` is
written `f a`, without parentheses or commas. Applying `λx. t` to `a` gives `t` with `a` in place of `x`;
this step is called **β-reduction**.
:::

```isabelle
term "λx::nat. x + 1"
```

```output
"λx. x + 1"
  :: "nat ⇒ nat"
```

The annotation `x::nat` after the λ fixes the type of the bound variable, so the function has type
`nat ⇒ nat`. Now apply a function to an argument:

```isabelle
value "(λx::nat. x * x) 7"
```

```output
"49"
  :: "nat"
```

The difference between `term` and `value` shows here too. `term` shows the term after the β-reduction
step, but it does no arithmetic:

```isabelle
term "(λx::nat. x * x) 7"
```

```output
"7 * 7"
  :: "nat"
```

### Functions of several arguments {#currying}

Every HOL function takes exactly one argument. A function of two numbers takes the first number and
returns a function that waits for the second. Its type is `nat ⇒ nat ⇒ nat`, which means
`nat ⇒ (nat ⇒ nat)`, because ⇒ groups to the right. Application groups to the left: `f x y` means
`(f x) y`. Figure 8.1 follows the two steps.

::: figure id=fig-08-1
A function of two arguments takes them one at a time. `(+)` applied to 3 gives a function, `(+) 3`, which
adds 3 to its argument; applied to 4, that gives the number 7.
:::

::: definition Currying and partial application
Writing a function of several arguments as a function that takes the first argument and returns a
function of the rest is called **currying**, after the logician Haskell Curry. Applying such a function
to fewer arguments than it can take is **partial application**; the result is a function.
:::

The infix `+` is notation for a curried function whose name is `(+)`: `x + y` is short for `(+) x y`.
You can see this when you write a function of two arguments with a λ:

```isabelle
term "λx y. x + (y::nat)"
```

```output
"(+)"
  :: "nat ⇒ nat ⇒ nat"
```

Isabelle prints `(+)` instead of your λ-term. The two are the same function: `λx y. x + y` takes `x`
and `y` and adds them, which is exactly what `(+)` does, and Isabelle prints the shorter form. A
partial application of `(+)` is a function of one argument:

```isabelle
term "(+) (3::nat)"
```

```output
"(+) 3"
  :: "nat ⇒ nat"
```

Functions that take functions as arguments are called **higher-order**. The most common one is `map`,
which applies a function to every element of a list:

```isabelle
term "map"
```

```output
"map"
  :: "('a ⇒ 'b) ⇒ 'a list ⇒ 'b list"
```

The type says it all: `map` takes a function from `'a` to `'b` and a list of `'a`s, and returns a list of
`'b`s. Give it the partial application from above:

```isabelle
value "map ((+) (3::nat)) [1, 2, 3]"
```

```output
"[4, 5, 6]"
  :: "nat list"
```

HOL is called *higher-order* logic for the same reason: its variables, too, may stand for functions, and
its quantifiers may range over them.

::: note
You could also write a function of two numbers as a function on pairs, of type `nat × nat ⇒ nat`. It
takes one argument, a pair. Isabelle's library almost always uses the curried form instead, because it
allows partial application, as in `map ((+) 3)`.
:::

::: pitfall
Application groups to the left, so `Suc Suc 0` means `(Suc Suc) 0`: `Suc` applied to the function
`Suc`.

```isabelle fails
value "Suc Suc 0"
```

```output
*** Type unification failed: Clash of types "_ ⇒ _" and "nat"
***
*** Type error in application: incompatible operand type
***
*** Operator:  Suc :: nat ⇒ nat
*** Operand:   Suc :: nat ⇒ nat
***
```

The operand of `Suc` is the function `Suc :: nat ⇒ nat` where a `nat` is needed. Write `Suc (Suc 0)`.
Missing parentheses are the most common cause of type errors.
:::

## Data types {#datatypes}

Now the traffic light. At any moment it is in one of four states. HOL lets you define a new type whose
values are exactly these states.

### Enumerations {#enumerations}

```isabelle
datatype light = Red | RedAmber | Green | Amber
```

This command introduces the type `light` and four **constructors**, `Red`, `RedAmber`, `Green` and
`Amber`, the values of the type. Constructor names start with a capital letter by convention.

```isabelle
term "Green"
```

```output
"Green"
  :: "light"
```

::: definition Datatype
A declaration `datatype t = C₁ τ… | … | Cₙ τ…` introduces a new type `t` whose values are built with
the **constructors** C₁, …, Cₙ. Each constructor takes arguments of the types listed after it (possibly
none). Values built with different constructors are different; values built with the same constructor
are equal only if their arguments are equal; and every value of `t` is built with the constructors. A
datatype whose constructors take no arguments is an **enumeration**.
:::

A function on `light` says what to do for each constructor. The traffic light's next state:

```isabelle
fun next_light :: "light ⇒ light" where
  "next_light Red = RedAmber"
| "next_light RedAmber = Green"
| "next_light Green = Amber"
| "next_light Amber = Red"
```

```output
consts
  next_light :: "light ⇒ light"

Found termination order: "{}"
```

This is **pattern matching**: the left-hand side of each equation contains a **pattern**, here a
constructor, that says which arguments the equation is for. The equations are separated by `|`.
Isabelle reports the new constant with its type, and a termination order, `"{}"`, which is empty because
`next_light` does not call itself; Section 8.7 explains these reports.

```isabelle
value "next_light (next_light Red)"
```

```output
"Green"
  :: "light"
```

The facts listed in Definition 8.5 come with the datatype and are known to `simp`. It proves at once that
two constructors differ:

```isabelle
lemma "Red ≠ Green"
  by simp
```

Every light is one of the four constructors, so you can prove a claim about all lights by checking each
constructor in turn. The proof method `cases l` splits a goal into one case per constructor:

```isabelle
lemma "next_light (next_light (next_light (next_light l))) = l"
  apply (cases l)
```

```output state
proof (prove)
goal (4 subgoals):
 1. l = Red ⟹ next_light (next_light (next_light (next_light l))) = l
 2. l = RedAmber ⟹ next_light (next_light (next_light (next_light l))) = l
 3. l = Green ⟹ next_light (next_light (next_light (next_light l))) = l
 4. l = Amber ⟹ next_light (next_light (next_light (next_light l))) = l
```

Each subgoal assumes a different value for `l`. `simp` uses the assumption to replace `l` and then
computes:

```isabelle
  apply simp_all
  done
```

`simp_all` applies `simp` to all subgoals. A test with `value` would have checked one light; the lemma
covers all four.

Finally, the light's timing. Each state lasts a fixed number of seconds:

```isabelle
fun duration :: "light ⇒ nat" where
  "duration Red = 30"
| "duration RedAmber = 2"
| "duration Green = 25"
| "duration Amber = 3"
```

### Recursive data types {#recursive}

A list can be arbitrarily long, so no enumeration can describe all lists. A **recursive** datatype refers
to itself in its definition. Here is a stack, the last-in, first-out store found in every programming
course, as a datatype of your own:

```isabelle
datatype 'a stack = Empty | Push 'a "'a stack"
```

Read it as: a stack of elements of type `'a` is either `Empty`, or `Push x s`, an element `x` pushed on
top of a stack `s`. The type variable makes the type polymorphic: `nat stack`, `light stack` and so on. An
argument type that is more than a single name, such as `'a stack`, goes in quotation marks.

```isabelle
term "Push (1::nat) (Push 2 (Push 3 Empty))"
```

```output
"Push 1 (Push 2 (Push 3 Empty))"
  :: "nat stack"
```

Figure 8.2 draws this value as a tree. Each `Push` has two branches, the element and the rest of the
stack, and the tree ends in `Empty`.

::: figure id=fig-08-2
A value of a recursive datatype is a tree of constructors. The stack on the left and the list on the
right have the same shape.
:::

Isabelle's own lists are a datatype of exactly this shape. The library theory `List` defines them, in
essence, as `datatype 'a list = Nil | Cons 'a "'a list"`, with the notation `[]` for `Nil` and the infix
`x # xs` for `Cons x xs`. The list `[1, 2, 3]` is notation for `1 # 2 # 3 # []`, where `#` groups to the
right. Every list you have used so far was built with these two constructors.

Functions on a recursive datatype are usually recursive too. One equation per constructor, with a
recursive call on the inner stack:

```isabelle
primrec height :: "'a stack ⇒ nat" where
  "height Empty = 0"
| "height (Push x s) = Suc (height s)"

primrec to_list :: "'a stack ⇒ 'a list" where
  "to_list Empty = []"
| "to_list (Push x s) = x # to_list s"
```

```output all
consts
  height :: "'a stack ⇒ nat"

consts
  to_list :: "'a stack ⇒ 'a list"
```

`primrec` is a variant of `fun` for this simple kind of recursion; Section 8.4 compares them. `to_list`
turns a stack into a list, top element first:

```isabelle
value "to_list (Push (1::nat) (Push 2 (Push 3 Empty)))"
```

```output
"[1, 2, 3]"
  :: "nat list"
```

### Options and pairs {#options}

What is the top element of an empty stack? In Java you might get an exception, in C whatever happens to
be in memory. A HOL function is total, so a function of type `'a stack ⇒ 'a` must return *some* element
even for `Empty`. The clean way out is to change the result type. HOL's library defines, in essence,

`datatype 'a option = None | Some 'a`

A value of type `'a option` is either `None`, "no result", or `Some x`, the result `x`. Functions that
can fail return an option:

```isabelle
fun top :: "'a stack ⇒ 'a option" where
  "top Empty = None"
| "top (Push x s) = Some x"

fun pop :: "'a stack ⇒ ('a × 'a stack) option" where
  "pop Empty = None"
| "pop (Push x s) = Some (x, s)"
```

`pop` returns two things at once, the top element and the rest of the stack, as a **pair** `(x, s)` of
type `'a × 'a stack`.

```isabelle
value "pop (Push Red (Push Green Empty))"
```

```output
"Some (Red, Push Green Empty)"
  :: "(light × light stack) option"
```

::: definition Pairs and options
A **pair** `(a, b)` has type `τ₁ × τ₂` when `a :: τ₁` and `b :: τ₂`; the functions `fst` and `snd`
return its first and second component. A triple `(a, b, c)` is short for `(a, (b, c))`. The **option
type** `'a option` has the values `None` and `Some x` for every `x :: 'a`; it is the type of results
that may be missing.
:::

### Taking values apart with case {#case}

A function that receives an option must deal with both possibilities. Besides pattern matching in
equations, HOL has a **case expression** that matches a value against patterns inside a term:

```isabelle
fun top_or :: "'a ⇒ 'a stack ⇒ 'a" where
  "top_or d s = (case top s of None ⇒ d | Some x ⇒ x)"
```

`top_or d s` is the top element of `s`, or the default `d` if `s` is empty. Read
`case t of p₁ ⇒ e₁ | p₂ ⇒ e₂` as: compute `t`, find the first pattern pᵢ that matches its value, and
return eᵢ, with the variables of the pattern standing for the matching parts. The arrow is the same ⇒ as
in function types. A `case` expression inside a larger term must be in parentheses, like
`if … then … else …`.

```isabelle
value "top_or Red (Push Green Empty)"
value "top_or Red Empty"
```

```output all
"Green"
  :: "light"

"Red"
  :: "light"
```

Patterns can be nested. `Some (x, s)` matches an option that contains a pair, and names both parts:

```isabelle
value "case pop (Push Green (Push Red Empty)) of None ⇒ [] | Some (x, s) ⇒ [x, x]"
```

```output
"[Green, Green]"
  :: "light list"
```

::: tip
`fun` equations and `case` expressions are two ways to write the same thing. Use equations when a
function's behaviour depends on the shape of its arguments; use `case` when one intermediate result, such
as `top s` above, has to be taken apart.
:::

## Three ways to define a function {#definitions}

You have now used `fun` and `primrec`. HOL has a third command, `definition`. The three differ in what
they accept, in what they prove for you, and in how proofs use them.

### Non-recursive functions: definition {#definition}

The traffic light stands at a crossroads, where two lights control the two directions, north–south and
east–west. A simple, strict safety rule says that at every moment at least one of the two lights shows
red. The state of the junction is a pair of lights, and the rule is a function on such pairs:

```isabelle
definition safe :: "light × light ⇒ bool" where
  "safe p = (fst p = Red ∨ snd p = Red)"
```

```output
consts
  safe :: "light × light ⇒ bool"
```

`definition` introduces a constant with a single equation `f x₁ … xₙ = t`, where the right-hand side `t`
must not mention `f`: no recursion and no pattern matching. Isabelle stores the equation as a theorem
named `safe_def`:

```isabelle
thm safe_def
```

```output
safe ?p = (fst ?p = Red ∨ snd ?p = Red)
```

The question marks are the schematic variables of Module 7: the equation holds for every `p`. Now prove
that one particular state is safe:

```isabelle fails
lemma "safe (Red, Green)"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. safe (Red, Green)
```

`simp` could not even start. Unlike the equations of `fun` and `primrec`, the equation of a `definition`
is not given to the simplifier, so for `simp`, `safe` is an unknown function. Name the definition and
`simp` uses it:

```isabelle
lemma "safe (Red, Green)"
  by (simp add: safe_def)

lemma "¬ safe (Green, Amber)"
  by (simp add: safe_def)

lemma safe_Red: "safe (Red, l)"
  by (simp add: safe_def)
```

The last lemma holds for every state `l` of the east–west light: whatever it shows, the junction is safe
while the north–south light is red.

::: keyidea
`simp` does not unfold a `definition` unless you ask with `simp add: f_def`. This is deliberate. A
definition introduces a concept; once you have proved its important properties, such as `safe_Red`,
later proofs should use those properties rather than the definition. Proofs then stay short, and if the
definition changes, only the proofs of the properties need repair. Module 9 shows more ways of
controlling the simplifier.
:::

::: pitfall
`definition` takes no patterns. A pattern for the pair on the left-hand side is rejected:

```isabelle fails
definition safe2 :: "light × light ⇒ bool" where
  "safe2 (a, b) = (a = Red ∨ b = Red)"
```

```output
*** Bad arguments on lhs: "(a, b)"
*** The error(s) above occurred in definition:
*** "safe2 (a, b) ≡
***  a = Red ∨
***  b =
***  Red"
```

Use `fst` and `snd` as above, a `case` expression, or `fun`, which accepts patterns.
:::

### Recursive functions: fun and primrec {#fun-primrec}

`primrec` accepts only **primitive recursion**: one equation for each constructor, each with the
constructor applied to variables as its pattern, and recursive calls only on the immediate parts of the
argument, such as `height s` in the equation for `Push x s`. Such a function always terminates, so
`primrec` needs no termination proof; it reports only the new constant, as you saw for `height`.

`fun` accepts much more: nested patterns, patterns on several arguments, equations that overlap, and any
recursion for which Isabelle can find a termination proof by itself. This function pushes the elements of
a list onto a stack, one after another; its recursive call changes both arguments:

```isabelle
fun push_all :: "'a list ⇒ 'a stack ⇒ 'a stack" where
  "push_all [] s = s"
| "push_all (x # xs) s = push_all xs (Push x s)"
```

```output
consts
  push_all :: "'a list ⇒ 'a stack ⇒ 'a stack"

Found termination order: "(λp. length (fst p)) <*mlex*> {}"
```

`fun` reports how it proved termination: the length of the first argument, `fst p` of the pair `p` of
arguments, decreases in every recursive call. The element pushed last ends on top:

```isabelle
value "to_list (push_all [1, 2, 3::nat] Empty)"
```

```output
"[3, 2, 1]"
  :: "nat list"
```

Both commands give the simplifier the defining equations under the name `f.simps`:

```isabelle
thm height.simps
```

```output
  height Empty = 0
  height (Push ?x ?s) = Suc (height ?s)
```

| | `definition` | `primrec` | `fun` |
|---|---|---|---|
| Recursion | none | primitive: on the immediate parts | general, once termination is proved |
| Patterns | none: `f x₁ … xₙ = t` | one constructor pattern per equation | any constructor patterns, also nested and overlapping |
| Used by `simp` | only with `simp add: f_def` | always (`f.simps`) | always (`f.simps`) |
| Termination | no question | guaranteed by the form | proved automatically, or the definition is rejected |

Which to choose? Use `definition` for a non-recursive concept that you want to reason about abstractly,
`fun` for recursive functions and for anything that needs patterns, and `primrec` when a function follows
the structure of a datatype exactly and you want to be sure no termination proof is involved. Many
users write `fun` almost everywhere, as Module 1 did for `double`.

### Missing and overlapping patterns {#patterns}

What if the equations do not cover every constructor? This function forgets the empty stack:

```isabelle
fun top_value :: "'a stack ⇒ 'a" where
  "top_value (Push x s) = x"
```

```output
### Missing patterns in function definition:
### top_value Empty = undefined

consts
  top_value :: "'a stack ⇒ 'a"

Found termination order: "{}"
```

Isabelle accepts the definition with a warning, and completes it with the equation
`top_value Empty = undefined`. Here `undefined` is a constant of every type about which nothing is known:
`top_value Empty` is *some* element, but no proof can tell which. The function is total, as every HOL
function is, but on `Empty` it is **unspecified**. When you try to compute that value, the code behind
`value` has no equation to use and stops with an exception (Section 8.8 explains where this code comes
from):

```isabelle fails
value "top_value (Empty :: nat stack)"
```

```output
*** exception Match raised⌂
```

The ⌂ points into the generated program, not into your theory. The library's `hd`, the first element of a list, is unspecified for `[]` in the same way, and
`value "hd ([] :: light list)"` fails with the same exception.

::: tip
Missing patterns are often a sign of a missing case in your thinking. Prefer an option result, as in
`top`, so that the caller has to handle the empty case. `primrec` warns about a missing constructor too,
with the message `No equation for constructor "Empty"`.
:::

Equations may also **overlap**: one argument may match several patterns. `fun` then uses the first
equation that matches, as Haskell and ML do:

```isabelle
fun is_red :: "light ⇒ bool" where
  "is_red Red = True"
| "is_red l = False"
```

The variable `l` matches every light, `Red` included. `fun` resolves the overlap by turning the second
equation into one equation for each remaining constructor, as `thm` shows:

```isabelle
thm is_red.simps
```

```output
  is_red Red = True
  is_red RedAmber = False
  is_red Green = False
  is_red Amber = False
```

The order of the equations therefore matters. Put the general equation first, and the specific one can
never be used. Isabelle rejects such a definition:

```isabelle fails
fun is_red2 :: "light ⇒ bool" where
  "is_red2 l = False"
| "is_red2 Red = True"
```

```output
*** Equation is redundant (covered by preceding clauses):
*** is_red2 Red =
*** True
```

`primrec` does not accept overlapping equations at all: its patterns must be constructors applied to
variables, and the plain variable `l` is not such a pattern:

```isabelle fails
primrec is_red3 :: "light ⇒ bool" where
  "is_red3 Red = True"
| "is_red3 l = False"
```

```output
*** Constructor pattern missing in left-hand side at
***   is_red3 l =
***   False
```

### When a name is misspelt {#names}

Section 8.1 showed that a misspelt name in a term becomes a free variable. In a definition, a free
variable on the right-hand side has no value, so Isabelle rejects it:

```isabelle fails
fun cycle_time :: "light list ⇒ nat" where
  "cycle_time [] = 0"
| "cycle_time (l # ls) = duraton l + cycle_time ls"
```

```output
*** Variable "duraton" occurs on right hand side only:
*** ⋀l ls duraton.
***    cycle_time (l # ls) =
***    duraton l +
***    cycle_time
***     ls
```

The message lists `duraton` among the variables of the equation (after ⋀, "for all"): Isabelle took
the misspelt `duration` for a variable. Misspelt names of types and theorems give "Undefined" errors
instead, because Isabelle looks them up:

```isabelle fails
thm duraton.simps
```

```output
*** Undefined fact: "duraton.simps"⌂
```

The same happens for a misspelt type in a signature, such as `lights` for `light`: the message is
`Undefined type name: "lights"`.

## Lists in practice {#lists}

Back to the traffic light. A list of states describes how the light behaves over time. `trace n l` is
the list of the first `n` states, starting with `l`:

```isabelle
fun trace :: "nat ⇒ light ⇒ light list" where
  "trace 0 l = []"
| "trace (Suc n) l = l # trace n (next_light l)"
```

```output
consts
  trace :: "nat ⇒ light ⇒ light list"

Found termination order: "(λp. size (fst p)) <*mlex*> {}"
```

```isabelle
value "trace 6 Red"
```

```output
"[Red, RedAmber, Green, Amber, Red, RedAmber]"
  :: "light list"
```

::: example Evaluating trace by hand
`value` computes by rewriting with the defining equations, and you can do the same on paper. Write `3`
as `Suc (Suc (Suc 0))`:

$$
\begin{aligned}
\mathit{trace}\;3\;\mathit{Red} &= \mathit{Red} \mathbin{\#} \mathit{trace}\;2\;(\mathit{next\_light}\;\mathit{Red}) = \mathit{Red} \mathbin{\#} \mathit{trace}\;2\;\mathit{RedAmber}\\
&= \mathit{Red} \mathbin{\#} \mathit{RedAmber} \mathbin{\#} \mathit{trace}\;1\;\mathit{Green}\\
&= \mathit{Red} \mathbin{\#} \mathit{RedAmber} \mathbin{\#} \mathit{Green} \mathbin{\#} \mathit{trace}\;0\;\mathit{Amber}\\
&= [\mathit{Red}, \mathit{RedAmber}, \mathit{Green}]
\end{aligned}
$$

Each step uses an equation of `trace` or of `next_light`. Every recursive call has a smaller first
argument, so the computation reaches `trace 0` and stops.
:::

### The list library {#library}

The theory `List`, part of `Main`, defines about a hundred functions on lists and proves more than a
thousand lemmas about them. These are the ones you will use most:

| Function | What it computes | Example |
|---|---|---|
| `length xs` | the number of elements | `length [a, b] = 2` |
| `xs @ ys` | `xs` followed by `ys` | `[a] @ [b, c] = [a, b, c]` |
| `map f xs` | `f` applied to every element | `map f [a, b] = [f a, f b]` |
| `filter P xs` | the elements that satisfy `P` | `filter P [a, b] = [a]` if `P a` and `¬ P b` |
| `foldr f xs e` | the elements combined with `f`, from the right | `foldr f [a, b] e = f a (f b e)` |
| `zip xs ys` | pairs of corresponding elements | `zip [a, b] [c, d] = [(a, c), (b, d)]` |
| `take n xs`, `drop n xs` | the first `n` elements; the rest | `take 1 [a, b] = [a]` |
| `xs ! n` | element number `n`, counting from 0 | `[a, b] ! 1 = b` |
| `[m..<n]` | the numbers from `m` up to `n − 1` | `[2..<5] = [2, 3, 4]` |

Apply them to traces. How long is each state of one cycle, and how long is the whole cycle?

```isabelle
value "map duration (trace 4 Red)"
```

```output
"[30, 2, 25, 3]"
  :: "nat list"
```

```isabelle
value "sum_list (map duration (trace 4 Red))"
```

```output
"60"
  :: "nat"
```

A full cycle takes a minute. `sum_list` adds up a list of numbers. Which states in a longer trace are
green?

```isabelle
value "filter (λl. l = Green) (trace 9 Red)"
```

```output
"[Green, Green]"
  :: "light list"
```

`foldr` is the general way to combine all elements of a list into one value. `foldr f [x₁, x₂, x₃] e` is
`f x₁ (f x₂ (f x₃ e))`: start from `e` at the right end and combine each element with the result so far.
With `f` adding a state's duration to a running total, it computes the cycle time again:

```isabelle
value "foldr (λl t. duration l + t) (trace 4 Red) 0"
```

```output
"60"
  :: "nat"
```

Figure 8.3 shows `map`, `filter` and `foldr` side by side on one cycle.

::: figure id=fig-08-3
`map` transforms every element, `filter` keeps some of them, and `foldr` combines all of them into one
value. `sum_list` is `foldr (+)` with start value 0.
:::

`zip` pairs two lists element by element, and `[0..<4]` is the list of the numbers 0, 1, 2 and 3, so
together they number the states:

```isabelle
value "zip [0..<4] (trace 4 Red)"
```

```output
"[(0, Red), (1, RedAmber), (2, Green), (3, Amber)]"
  :: "(nat × light) list"
```

`length` counts elements, and `take`, `drop` and `!` cut lists and select elements. Positions count
from 0:

```isabelle
value "length (trace 6 Red)"
value "take 2 (trace 6 Red)"
value "drop 4 (trace 6 Red)"
value "trace 6 Red ! 2"
```

```output all
"6"
  :: "nat"

"[Red, RedAmber]"
  :: "light list"

"[Red, RedAmber]"
  :: "light list"

"Green"
  :: "light"
```

### List comprehension {#comprehension}

Combinations of `map` and `filter` can also be written as a **list comprehension**, as in Haskell and
Python. `[e. x ← xs, P x]` is the list of the values of `e` for the elements `x` of `xs` that satisfy
`P x`. Type ← as `<-`. Here are the short states of a cycle, with their durations:

```isabelle
value "[(l, duration l). l ← trace 4 Red, duration l < 10]"
```

```output
"[(RedAmber, 2), (Amber, 3)]"
  :: "(light × nat) list"
```

The pattern `(l, duration l)` builds a pair for each element; `duration l < 10` is a condition. There can
be several generators and conditions, separated by commas.

::: pitfall
Some list functions are unspecified for some arguments: `hd []`, the first element of the empty list,
and `xs ! n` when `n` is not a position of `xs`. They return *some* value of the right type, but nothing
is known about it, and computing it with `value` stops with an exception, as for `top_value` in
Section 8.4. Before you use `hd xs` or `xs ! n` in a definition, make sure that `xs` is not empty or that
`n < length xs`.
:::

## Numbers and type classes {#numbers}

HOL has several types of numbers: `nat`, `int`, and, with the theory `Complex_Main`, `real` and
`complex`. This series needs only `nat` and `int`.

### Natural numbers and integers {#nat-int}

The type `nat` behaves like a datatype with two constructors, `0` and `Suc`: every natural number is
either `0` or `Suc n` for a smaller natural number `n`. That is why you can define functions on `nat` by
pattern matching on `0` and `Suc n`, as `trace` does. A numeral such as `3` is another way of writing
`Suc (Suc (Suc 0))`, and `value` prints natural numbers as numerals:

```isabelle
value "Suc (Suc 0)"
```

```output
"2"
  :: "nat"
```

The type `int` contains the negative numbers too. The two types differ most visibly in subtraction:

```isabelle
value "(2::nat) - 3"
value "(2::int) - 3"
```

```output all
"0"
  :: "nat"

"- 1"
  :: "int"
```

Isabelle prints negative numbers with a space after the minus sign.

::: definition Truncated subtraction
On `nat`, subtraction is **truncated**: `m - n` is `0` whenever `m ≤ n`, because there is no natural
number below 0. On `int`, subtraction is the usual one.
:::

::: pitfall
Truncated subtraction breaks familiar laws. On `nat`, `(m - n) + n = m` holds only if `n ≤ m`: with
`m = 5` and `n = 7`, the left side is `0 + 7 = 7`. A bank account whose balance is a `nat` cannot go
overdrawn: withdrawing too much leaves exactly 0, silently, instead of a debt. When negative values make
sense, use `int`; when they do not, check `n ≤ m` before you subtract.
:::

Division on `nat` and `int` is `div`, with remainder `mod`:

```isabelle
value "(17::nat) div 5"
value "(17::nat) mod 5"
value "(-17::int) div 5"
value "(-17::int) mod 5"
```

```output all
"3"
  :: "nat"

"2"
  :: "nat"

"- 4"
  :: "int"

"3"
  :: "int"
```

On `int`, `div` rounds down, towards minus infinity, so `-17 div 5` is −4, and `mod` is chosen to make
`(a div b) * b + a mod b = a` hold: (−4) · 5 + 3 = −17. And division by zero?

```isabelle
value "(17::nat) div 0"
```

```output
"0"
  :: "nat"
```

::: fact Division by zero
In HOL, `a div 0 = 0` and `a mod 0 = a` for every `a` (the library's lemmas `div_by_0` and `mod_by_0`).
:::

This is not a mistake. Every HOL function is total, so `17 div 0` must be some number. The library
chooses 0, a value that makes many laws hold without side conditions. A program that divides by zero is
still wrong; the logic does not stop with an error. When division by zero matters, state `b ≠ 0`
as an assumption in your lemmas.

The functions `int :: nat ⇒ int` and `nat :: int ⇒ nat` convert between the two types; `nat` maps
negative integers to 0. The operator `/` is division on fields such as the real numbers, not on `nat`
or `int`, and `x ^ n` is the power xⁿ, with `n` a natural number.

### Overloading and type classes {#classes}

You have used `+`, `0` and numerals on both `nat` and `int`. Such names are **overloaded**: one name has
several meanings, chosen by the type. And yet they do not exist for every type. A light is not a number:

```isabelle fails
value "next_light 3"
```

```output
*** Type unification failed: No type arity light :: numeral
***
*** Type error in application: incompatible operand type
***
*** Operator:  next_light :: light ⇒ light
*** Operand:   3::??'a :: ??'a
***
```

"No type arity light :: numeral" says that the type `light` is not in the class `numeral`, the class of
types that have numerals, so `3` cannot be a light. (An *arity* is Isabelle's record that a type belongs
to a class.) Isabelle organises overloading in **type classes**.

::: definition Type class and sort
A **type class** is a named collection of types that provide certain operations, sometimes with laws.
For example, the class `plus` contains the types that have an operation `+`, `zero` those with a `0`,
`numeral` those with numerals 1, 2, 3, … and an associative `+`, and `ord` those with `≤` and `<`. A type
in a class is an **instance** of it: `nat` and `int` are instances of all four. A **sort** is a set of
classes, written `{c₁, …, cₙ}`, or `c` for a single class. A type variable can be restricted to a sort:
`'a::{one, plus}` stands for any type that is an instance of both `one` and `plus`.
:::

::: analogy
Type classes play the role of interfaces in Java or traits in Rust, and Haskell's type classes are the
same idea. A sort says which interfaces an unknown type must implement.
:::

Isabelle hides sorts unless you ask for them. The option `show_sorts` makes them visible:

```isabelle
declare [[show_sorts]]
term "x + 1"
term "2 + 2"
declare [[show_sorts = false]]
```

```output all
"(x::'a::{one,plus}) + 1"
  :: "'a::{one,plus}"

"(2::'a::numeral) + (2::'a::numeral)"
  :: "'a::numeral"
```

Now you can see what Isabelle knows about the `'a` of Section 8.1: `x + 1` has *some* type that has
`1` and `+`. And `2 + 2` has some type of the class `numeral`. That is the key to the message from
Module 1, which promised that you would learn to read it here:

```isabelle fails
value "2 + 2"
```

```output
*** Wellsortedness error:
*** Type 'a not of sort term_of
*** Cannot derive subsort relation numeral < term_of
```

To print a result, `value` must turn the computed value back into a term. It does so with an overloaded
function `term_of`, which exists for the types in the class `term_of`: `nat`, `int`, lists, and the
datatypes you define, among others. Now read the message line by line.

- **Wellsortedness error**: some type is required to be in a class it is not known to be in.
- **Type 'a not of sort term_of**: the type of `2 + 2` is the unknown `'a`, and `value` needs it to be in
  the class `term_of`.
- **Cannot derive subsort relation numeral < term_of**: all Isabelle knows about `'a` is that it is in
  `numeral`. That would be enough only if every type in `numeral` were also in `term_of`, that is, if
  `numeral` were a subclass of `term_of`, written `numeral < term_of`. It is not.

The cure is the one from Module 1: say which type you mean, as in `value "2 + 2 :: nat"`. The same
missing information can make a proof fail:

```isabelle fails
lemma "x + 0 = x"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. x + 0 = x
```

The goal is about a type of sort `{plus, zero}`: a type with some `+` and some `0`. Nothing in those
classes says that `0` is neutral for `+`, so the claim cannot be proved for every such type. For natural
numbers it is a law of arithmetic:

```isabelle
lemma "x + 0 = (x::nat)"
  by simp
```

::: pitfall
`value` computes with numerals, but `simp` does not match a numeral against a `Suc` pattern. The
equations of `trace` are about `0` and `Suc n`, and `2` is neither, syntactically:

```isabelle fails
lemma "trace 2 Red = [Red, RedAmber]"
  by simp
```

```output
*** Failed to apply initial proof method⌂:
*** goal (1 subgoal):
***  1. trace 2 Red = [Red, RedAmber]
```

The library lemma `numeral_eq_Suc` rewrites a numeral into `Suc` of a smaller number, after which the
equations of `trace` apply:

```isabelle
lemma "trace 2 Red = [Red, RedAmber]"
  by (simp add: numeral_eq_Suc)
```
:::

## Why every function must terminate {#termination}

Every `fun` you have written produced a line "Found termination order". Module 1 promised to explain why
Isabelle insists on proving that functions terminate. This section keeps that promise.

### Total functions and consistency {#total}

When you define a function with `fun`, Isabelle makes your equations into theorems: after
`fun next_light`, the equation `next_light Red = RedAmber` is a theorem you can use in any proof. This is
only safe if some function really satisfies the equations. Suppose Isabelle accepted this "definition"
of a function `f :: nat ⇒ nat`:

$$
f\;x = f\;x + 1
$$

The equation would become a theorem for every `x`. Take `x = 0` and write `n` for the natural number
`f 0`: the theorem says `n = n + 1`. Subtract `n` from both sides and you get `0 = 1`. (This works even
with truncated subtraction, since `n - n = 0` and `(n + 1) - n = 1`.) From the false statement `0 = 1`,
every statement follows, as Module 6 showed. Every claim, true or false, would become a theorem, and the
proof assistant would be worthless.

The equation describes no function at all: no number `n` satisfies `n = n + 1`. As a program it would
call itself forever. Recursion that terminates cannot cause this. If every chain of recursive calls ends
in an equation without a recursive call, the equations determine the function's value for every
argument, one step at a time, as in Example 8.1.

::: keyidea
`fun` does not take your equations on trust. It constructs the function from Isabelle's basic
definition principles and then *proves* your equations from that construction, and the proof needs a
termination argument. If Isabelle cannot find one, the definition is rejected, and nothing about the
function becomes a theorem.
:::

Here is the bad definition in Isabelle:

```isabelle fails
fun bad :: "nat ⇒ nat" where
  "bad x = bad x + 1"
```

```output
consts
  bad :: "nat ⇒ nat"

*** Unfinished subgoals:
*** (a, 1, <):
***  1. False
*** Calls:
***   a) x ~> x
*** Measures:
***   1) size
*** Result matrix:
***     1
*** a:  <=
***
*** Could not find lexicographic termination order.
```

Isabelle first declares the constant (the `consts` lines), then tries to prove termination, fails, and
rejects the whole definition: `bad` is not defined, and no equation about it becomes a theorem.

### Reading the termination messages {#termination-messages}

To prove termination, Isabelle looks for a **measure**: a function from the arguments to the natural
numbers that becomes smaller with every recursive call. A natural number cannot become smaller forever
(Module 5), so the recursion must stop.

::: definition Measure and size
A **measure** for a recursive function maps its arguments to natural numbers, so that the arguments of
every recursive call have a smaller measure than the arguments of the call that makes it. The measure
Isabelle tries first is the **size** of an argument: for a natural number `n` the size is `n`, for a list
its length, and for a value of another datatype the number of constructors in it that take arguments.
:::

When the search succeeds, `fun` prints the measure it found. You have seen three kinds of report:

| Report | Meaning |
|---|---|
| `"{}"` | no recursive calls, nothing to prove (`next_light`, `top`) |
| `"(λp. size (fst p)) <*mlex*> {}"` | the size of the first argument decreases (`trace`) |
| `"(λp. length (fst p)) <*mlex*> {}"` | the length of the first argument, a list, decreases (`push_all`) |

The arguments of a function with several arguments are combined into one tuple `p`, so `fst p` is the
first argument. `<*mlex*>` chains measures lexicographically: if the first measure stays the same, the
next one must decrease. The final `{}` ends the chain. Exercise 8.8 shows a function that needs two
measures.

When the search fails, the message shows what Isabelle tried. Look again at the message for `bad`:

- **Calls** lists the recursive calls, named a), b), …: `a) x ~> x` says that a call with argument `x`
  leads to a call with argument `x`.
- **Measures** lists the measures Isabelle tried: here only `size`, the size of the argument.
- **Result matrix** has one row for each call and one column for each measure. Each entry says what
  Isabelle could prove about the measure in that call: `<` means it decreases, `<=` that it does not
  grow (but may stay the same), and `?` that Isabelle could prove neither.
- **Unfinished subgoals** are the statements that Isabelle could not prove. For `bad`, to show that the
  size of `x` decreases in call a), it would have had to prove `False`.

Only an entry `<` makes progress, and the row of call a) has none. So Isabelle reports **Could not find
lexicographic termination order**.

::: example A function nobody can prove terminating
This function counts the steps that the famous "3n + 1" process takes from `n` to 1: halve an even number,
triple an odd one and add 1.

```isabelle fails
fun collatz :: "nat ⇒ nat" where
  "collatz n = (if n ≤ 1 then 0
                else if n mod 2 = 0 then collatz (n div 2) + 1
                else collatz (3 * n + 1) + 1)"
```

```output
consts
  collatz :: "nat ⇒ nat"

*** Unfinished subgoals:
*** (b, 1, <):
***  1. ⋀n. ⟦¬ n ≤ Suc 0; n mod 2 = Suc 0⟧ ⟹ False
*** (b, 1, <=):
***  1. ⋀n. ⟦¬ n ≤ Suc 0; n mod 2 = Suc 0⟧ ⟹ False
*** Calls:
***   a) n ~> n div 2
***   b) n ~> 3 * n + 1
*** Measures:
***   1) size
*** Result matrix:
***     1
*** a:  <
*** b:  ?
***
*** Could not find lexicographic termination order.
```

The matrix shows that call a), with `n div 2`, decreases the size, but for call b), with `3 * n + 1`,
Isabelle could prove nothing. It is not alone: whether this process reaches 1 for every starting number
is the Collatz conjecture, posed by Lothar Collatz in 1937 and still unsolved. Nobody can supply a
termination proof, so nobody can define this function with `fun`.
:::

### When Isabelle needs help {#termination-help}

Some functions terminate, but not by a measure that Isabelle tries. How long must a driver wait for
green? From each state, add up the durations until the light turns green:

```isabelle fails
fun wait :: "light ⇒ nat" where
  "wait l = (if l = Green then 0 else duration l + wait (next_light l))"
```

```output
consts
  wait :: "light ⇒ nat"

*** Unfinished subgoals:
*** (a, 1, <):
***  1. ⋀l. l ≠ Green ⟹ size (next_light l) < size l
*** (a, 1, <=):
***  1. ⋀l. l ≠ Green ⟹ size (next_light l) ≤ size l
*** Calls:
***   a) l ~> next_light l
*** Measures:
***   1) size
*** Result matrix:
***     1
*** a:  ?
***
*** Could not find lexicographic termination order.
```

The function does terminate: from any state, the light is green after at most three steps. But the only
measure Isabelle tries is the size of `l`, and the size of every light is 0, because no constructor of
`light` takes an argument. So the unfinished subgoal asks for `size (next_light l) < size l`, which is
false, and the matrix entry is `?`.

The fix is to write the function so that termination is evident. Here the library does the work: take
the first four states, keep those before the first green with `takeWhile`, and add up their durations.
`takeWhile P xs` is the longest initial part of `xs` whose elements all satisfy `P`. The definition is not
recursive at all:

```isabelle
definition wait :: "light ⇒ nat" where
  "wait l = sum_list (map duration (takeWhile (λx. x ≠ Green) (trace 4 l)))"

value "map wait [Red, RedAmber, Green, Amber]"
```

```output
"[32, 2, 0, 35]"
  :: "nat list"
```

A driver who arrives at amber waits 3 + 30 + 2 = 35 seconds.

::: note
When no reformulation is natural, you can prove termination yourself. The command `function` states
the equations, and a separate `termination` proof names a measure and shows that it decreases. The
manual *Defining Recursive Functions in Isabelle/HOL*, under **functions** in the Documentation panel,
explains how. Every function defined with `fun` also comes with an induction rule that follows its
recursion, `f.induct`; Module 11 uses it.
:::

## From HOL to running code {#codegen}

The functions you have defined are programs, and Isabelle can translate them into other programming
languages: Standard ML, OCaml, Haskell and Scala. This is how a function that you have proved correct
becomes part of real software, and Modules 12 and 14 use it for verified programs. Generate Haskell
code for the traffic light:

```isabelle
export_code next_light duration trace in Haskell module_name Traffic
```

```output
See theory exports
```

`export_code` takes the names of the functions to translate, and adds everything they need: here the
datatype `light` and the natural numbers. `module_name` names the Haskell module. Write `in SML`,
`in OCaml` or `in Scala` for the other languages. Only definitions that compute can be translated. A
definition that quantifies over all natural numbers, such as `all_small k = (∀n::nat. n < k)`, has no
program: `export_code` rejects it with a wellsortedness error, because `∀` can be computed only over
types whose elements can be listed, the class `enum`, and `nat` is not in it.

The code does not appear in the Output panel. In Isabelle/jEdit, the words *theory exports* in the
message are a link: click it, and jEdit's File Browser opens on the generated files, in a virtual folder
whose name begins with `isabelle-export:`. The Haskell module is the file `Traffic.hs`. Here is its main
part; the beginning of the file, a list of `import` declarations, is left out.

```text
data Nat = Zero_nat | Suc Nat;

data Num = One | Bit0 Num | Bit1 Num;

data Light = Red | RedAmber | Green | Amber;

plus_nat :: Nat -> Nat -> Nat;
plus_nat Zero_nat n = n;
plus_nat (Suc m) n = plus_nat m (Suc n);

one_nat :: Nat;
one_nat = Suc Zero_nat;

nat_of_num :: Num -> Nat;
nat_of_num One = one_nat;
nat_of_num (Bit0 n) = let {
                        m = nat_of_num n;
                      } in plus_nat m m;
nat_of_num (Bit1 n) = let {
                        m = nat_of_num n;
                      } in Suc (plus_nat m m);

next_light :: Light -> Light;
next_light Red = RedAmber;
next_light RedAmber = Green;
next_light Green = Amber;
next_light Amber = Red;

trace :: Nat -> Light -> [Light];
trace Zero_nat l = [];
trace (Suc n) l = l : trace n (next_light l);

duration :: Light -> Nat;
duration Red = nat_of_num (Bit0 (Bit1 (Bit1 (Bit1 One))));
duration RedAmber = nat_of_num (Bit0 One);
duration Green = nat_of_num (Bit1 (Bit0 (Bit0 (Bit1 One))));
duration Amber = nat_of_num (Bit1 One);

}
```

The translation follows your equations closely. The datatype `light` becomes a Haskell `data` type with
the same constructors, and `next_light` and `trace` have the same equations as in Isabelle. Everything
else is the natural numbers, translated as the logic builds them: a datatype `Nat` with the constructors
`Zero_nat` and `Suc`, and numerals in binary, built from `One` with `Bit0` (append the binary digit 0)
and `Bit1` (append 1). So 30 is `Bit0 (Bit1 (Bit1 (Bit1 One)))`, binary 11110, and `nat_of_num`
converts it into `Suc` form. This representation is faithful but slow. For efficient code, import the
library theory `HOL-Library.Code_Target_Nat` in the theory header (`imports Main
"HOL-Library.Code_Target_Nat"`): the code generator then represents `nat` by Haskell's built-in
integers.

::: note
The code generator is not part of Isabelle's kernel, so the generated code is not checked by the kernel:
the code generator belongs to the trusted base (Module 1). It is designed so that every computation
step of the generated program corresponds to rewriting with equations that are theorems in the logic.
So if the program returns a result, the result agrees with your definitions; the guarantee is called
*partial correctness*. The command `value` uses the same machinery. For a term without variables it
translates the term into ML, runs it, and turns the result back into a term with `term_of`; that is why
it needs the class `term_of` (Section 8.6), and why it stopped with an exception at `top_value Empty`
(Section 8.4). For a term with variables, such as `rev [a, b, c]`, it uses a symbolic variant of the
same translation.
:::

## What you learned {#summary}

- HOL is a typed functional programming language inside a logic. Functions have no side effects, use
  recursion instead of loops, and are total. `typ` prints a type, `term` the type of a term, and `value`
  evaluates a term.
- Types are built from base types (`bool`, `nat`, `int`), type constructors written after their
  arguments (`'a list`, `'a option`), pairs `'a × 'b`, functions `'a ⇒ 'b` and type variables. Isabelle
  infers types; an annotation `t :: τ` fixes one. Misspelt names become free variables.
- `λx. t` is a function without a name. Functions of several arguments are curried: `nat ⇒ nat ⇒ nat`
  means `nat ⇒ (nat ⇒ nat)`, `f x y` means `(f x) y`, and a partial application is a function.
- `datatype` defines enumerations and recursive types such as stacks and lists. Functions take values
  apart by pattern matching in equations or with `case`. Options represent results that may be missing.
- `definition` defines non-recursive functions; `simp` uses `f_def` only when asked. `primrec` allows
  primitive recursion; `fun` allows general patterns and recursion, warns about missing patterns, and
  resolves overlapping ones in order.
- The list library offers `map`, `filter`, `foldr`, `zip`, `take`, `drop`, `!`, `[m..<n]` and list
  comprehension. Subtraction on `nat` is truncated, `div` and `mod` are total, and overloaded
  operations are organised in type classes and sorts.
- Every `fun` must terminate, or its equations could prove `0 = 1`. Isabelle searches for a decreasing
  measure, reports it, and explains its failure with a matrix of calls and measures.
- `export_code` translates definitions into Haskell, SML, OCaml or Scala.

## Exercises {#exercises}

:::: exercise Types by hand {#ex-8-1} ★
Work out the type of each term by hand. Then check your answers with `term` in the theory of this
module, where `Red` and `next_light` are defined.

1. `[Some True, None]`
2. `(Suc, [0::nat])`
3. `λxs. Red # xs`
4. `map next_light`
5. `λf x. f (f x)`

::: solution
```isabelle
term "[Some True, None]"
term "(Suc, [0::nat])"
term "λxs. Red # xs"
term "map next_light"
term "λf x. f (f x)"
```

```output all
"[Some True, None]"
  :: "bool option list"

"(Suc, [0])"
  :: "(nat ⇒ nat) × nat list"

"(#) Red"
  :: "light list ⇒ light list"

"map next_light"
  :: "light list ⇒ light list"

"λf x. f (f x)"
  :: "('a ⇒ 'a) ⇒ 'a ⇒ 'a"
```

1. `None` has type `'a option` for every `'a`; next to `Some True` it must be a `bool option`.
2. A pair of a function `nat ⇒ nat` and a `nat list`.
3. `#` puts a light in front of `xs`, so `xs` is a list of lights, and so is the result. Isabelle
   prints the λ-term as `(#) Red`, the partial application of `#`, for the same reason as it printed
   `(+)` in Section 8.2.
4. A partial application: `map` has received its function, `light ⇒ light`, and waits for the list.
5. `f` is applied to `x` and then to the result `f x`, so its argument type and its result type must be
   the same, `'a`. The term applies a function twice.
:::
::::

:::: exercise Lists by hand {#ex-8-2} ★
Work out the value of each term on paper, then check with `value`.

1. `take 3 (drop 2 [0..<10])`
2. `zip [Red, Green] [1, 2, 3::nat]`
3. `filter (λn. n mod 3 = 0) [0..<10]`
4. `foldr (λx xs. xs @ [x]) [1, 2, 3::nat] []`
5. `[n * n. n ← [1..<5]]`

::: solution
```isabelle
value "take 3 (drop 2 [0..<10])"
value "zip [Red, Green] [1, 2, 3::nat]"
value "filter (λn. n mod 3 = 0) [0..<10]"
value "foldr (λx xs. xs @ [x]) [1, 2, 3::nat] []"
value "[n * n. n ← [1..<5]]"
```

```output all
"[2, 3, 4]"
  :: "nat list"

"[(Red, 1), (Green, 2)]"
  :: "(light × nat) list"

"[0, 3, 6, 9]"
  :: "nat list"

"[3, 2, 1]"
  :: "nat list"

"[1, 4, 9, 16]"
  :: "nat list"
```

1. `drop 2` removes 0 and 1; `take 3` keeps the next three numbers.
2. `zip` stops at the end of the shorter list, so the 3 has no partner.
3. The multiples of 3 below 10, including 0.
4. `foldr f [1, 2, 3] []` is `f 1 (f 2 (f 3 []))`. Each step appends the element at the end of the list
   built so far: first `[3]`, then `[3, 2]`, then `[3, 2, 1]`. This `foldr` reverses the list.
5. The squares of 1 to 4: `[1..<5]` stops before 5.
:::
::::

:::: exercise Natural numbers and integers {#ex-8-3} ★
Predict each value, then check it. Explain each result that surprised you.

1. `(5::nat) - 7 + 7` and `(5::int) - 7 + 7`
2. `(7::nat) div 2 * 2`
3. `(-7::int) div 2` and `(-7::int) mod 2`
4. `(7::nat) mod 0`

::: solution
```isabelle
value "(5::nat) - 7 + 7"
value "(5::int) - 7 + 7"
value "(7::nat) div 2 * 2"
value "(-7::int) div 2"
value "(-7::int) mod 2"
value "(7::nat) mod 0"
```

```output all
"7"
  :: "nat"

"5"
  :: "int"

"6"
  :: "nat"

"- 4"
  :: "int"

"1"
  :: "int"

"7"
  :: "nat"
```

1. On `nat`, `5 - 7` is truncated to 0, and `0 + 7 = 7`. On `int` the result is the expected 5.
2. `7 div 2 = 3`, and `3 * 2 = 6`: integer division throws the remainder away.
3. `div` on `int` rounds down, so `-7 div 2 = -4` (not −3), and then `-7 mod 2 = 1`, because
   `(-4) * 2 + 1 = -7`.
4. `a mod 0 = a`, the library's choice that makes `mod` total (Fact 8.1).
:::
::::

:::: exercise Is the junction safe? {#ex-8-4} ★★
A designer controls the east–west light of the junction from the north–south light with this function:

```isabelle
fun cross :: "light ⇒ light" where
  "cross Red = Green"
| "cross RedAmber = Amber"
| "cross Green = Red"
| "cross Amber = RedAmber"
```

The state of the junction is `(l, cross l)`. Use `value` and `map` to check `safe` for all four states
`l`. Which states break the rule of Section 8.4? Then write the cycle of a safe controller as a list of
junction states, with all-red states in between, and check with `value` that every state in it is safe.

::: solution
```isabelle
value "map (λl. safe (l, cross l)) [Red, RedAmber, Green, Amber]"
```

```output
"[True, False, True, False]"
  :: "bool list"
```

The states with `l = RedAmber` and `l = Amber` are unsafe: then neither light is red, because one shows
red and amber and the other amber. A safe cycle lets each direction run its sequence while the other is
red, with both red in between:

```isabelle
definition safe_cycle :: "(light × light) list" where
  "safe_cycle = [(Green, Red), (Amber, Red), (Red, Red), (Red, RedAmber),
                 (Red, Green), (Red, Amber), (Red, Red), (RedAmber, Red)]"

value "filter (λp. ¬ safe p) safe_cycle"
```

```output
"[]"
  :: "(light × light) list"
```

No state is unsafe. `value` can use `safe` and `safe_cycle` without being told: the code generator
always uses the equations of definitions, unlike `simp`.
:::
::::

:::: exercise From lists to stacks {#ex-8-5} ★★
Define `from_list :: 'a list ⇒ 'a stack` with `primrec`, so that the first element of the list ends on top
of the stack. Test it with `value`. Then prove `to_list (from_list xs) = xs` and
`height (from_list xs) = length xs` by induction, as in Module 5.

::: solution
```isabelle
primrec from_list :: "'a list ⇒ 'a stack" where
  "from_list [] = Empty"
| "from_list (x # xs) = Push x (from_list xs)"

value "from_list [Red, Green]"
```

```output
"Push Red (Push Green Empty)"
  :: "light stack"
```

```isabelle
lemma "to_list (from_list xs) = xs"
  by (induction xs) auto

lemma "height (from_list xs) = length xs"
  by (induction xs) auto
```

Both proofs follow the recursion of `from_list` over the list: the base case `[]` and the step case
`x # xs` are computed by the equations of `from_list`, `to_list` and `height`, and the step case uses the
induction hypothesis. Compare `from_list` with `push_all` from Section 8.4, which puts the *last* element
on top.
:::
::::

:::: exercise An average {#ex-8-6} ★★
Define `average :: nat list ⇒ nat` with `definition`, as the sum of the list divided by its length. Compute
the average duration of the states of one cycle, and `average []`. Why does `average []` not fail? Then
prove `average [] = 0` and, for every `n`, `average [n] = n`.

::: solution
```isabelle
definition average :: "nat list ⇒ nat" where
  "average xs = sum_list xs div length xs"

value "average (map duration (trace 4 Red))"
value "average []"
```

```output all
consts
  average :: "nat list ⇒ nat"

"15"
  :: "nat"

"0"
  :: "nat"
```

The four durations add up to 60, and `60 div 4 = 15`. For the empty list the sum and the length are both
0, and `0 div 0 = 0` (Fact 8.1), so `average []` is 0 rather than an error. Whether 0 is a sensible
average of nothing is a question for the specification, not for Isabelle.

```isabelle
lemma "average [] = 0"
  by (simp add: average_def)

lemma "average [n] = n"
  by (simp add: average_def)
```

Without `add: average_def`, `simp` would fail, as it did for `safe` in Section 8.4.
:::
::::

:::: exercise Sensor codes {#ex-8-7} ★★★
A sensor reports the state of the light as a number: 0 for red, 1 for red and amber, 2 for green and 3 for
amber. Define `code_of :: light ⇒ nat` and a decoder `light_of :: nat ⇒ light option` with `fun`, using
the patterns `0`, `Suc 0`, … and a final catch-all equation that returns `None` for every other number.
Check with `thm light_of.simps` how `fun` handled the overlapping last equation. Test the decoder on
`[0, 2, 7]`. Then prove that decoding undoes encoding: `light_of (code_of l) = Some l`.
(Hint: the pitfall at the end of Section 8.6.)

::: solution
```isabelle
fun code_of :: "light ⇒ nat" where
  "code_of Red = 0"
| "code_of RedAmber = 1"
| "code_of Green = 2"
| "code_of Amber = 3"

fun light_of :: "nat ⇒ light option" where
  "light_of 0 = Some Red"
| "light_of (Suc 0) = Some RedAmber"
| "light_of (Suc (Suc 0)) = Some Green"
| "light_of (Suc (Suc (Suc 0))) = Some Amber"
| "light_of n = None"

thm light_of.simps
```

```output
  light_of 0 = Some Red
  light_of (Suc 0) = Some RedAmber
  light_of (Suc (Suc 0)) = Some Green
  light_of (Suc (Suc (Suc 0))) = Some Amber
  light_of (Suc (Suc (Suc (Suc ?va)))) = None
```

`fun` replaced the catch-all equation by one for the numbers that the earlier equations do not cover:
those of the form `Suc (Suc (Suc (Suc ?va)))`, that is, 4 and above.

```isabelle
value "map light_of [0, 2, 7]"
```

```output
"[Some Red, Some Green, None]"
  :: "light option list"
```

For the proof, split on `l` with `cases`. In each case the goal is about a numeral, such as
`light_of 2 = Some Green`, and the equations of `light_of` are about `Suc` patterns. `numeral_eq_Suc`
turns the numerals into `Suc` form:

```isabelle
lemma "light_of (code_of l) = Some l"
  by (cases l) (simp_all add: numeral_eq_Suc)
```

Without `numeral_eq_Suc`, `simp` proves the cases for `Red` and `RedAmber` but gets stuck on
`light_of 2 = Some Green` and `light_of 3 = Some Amber`, as the pitfall predicts.
:::
::::

:::: exercise Which definitions terminate? {#ex-8-8} ★★★
For each definition, predict whether `fun` accepts it, and which measure it reports. Then try it.

1. `count_down n = (if n = 0 then [] else n # count_down (n - 1))`, with type `nat ⇒ nat list`
2. Ackermann's function `ack :: nat ⇒ nat ⇒ nat`, with the equations `ack 0 n = Suc n`,
   `ack (Suc m) 0 = ack m 1` and `ack (Suc m) (Suc n) = ack m (ack (Suc m) n)`
3. `forever n = forever (n + 1)`, with type `nat ⇒ nat`

Is `forever` as dangerous as `bad` in Section 8.7?

::: solution
```isabelle
fun count_down :: "nat ⇒ nat list" where
  "count_down n = (if n = 0 then [] else n # count_down (n - 1))"
```

```output
consts
  count_down :: "nat ⇒ nat list"

Found termination order: "size <*mlex*> {}"
```

1. Accepted. The measure is `size`, the number `n` itself. The recursive call happens only when
   `n ≠ 0`, and Isabelle uses this condition to prove `n - 1 < n`.

```isabelle
fun ack :: "nat ⇒ nat ⇒ nat" where
  "ack 0 n = Suc n"
| "ack (Suc m) 0 = ack m 1"
| "ack (Suc m) (Suc n) = ack m (ack (Suc m) n)"

value "ack 2 3"
```

```output all
consts
  ack :: "nat ⇒ nat ⇒ nat"

Found termination order:
  "(λp. size (fst p)) <*mlex*> (λp. size (snd p)) <*mlex*> {}"

"9"
  :: "nat"
```

2. Accepted, with a lexicographic order of two measures. In the calls `ack m 1` and
   `ack m (ack (Suc m) n)` the first argument decreases, whatever happens to the second. In the inner call
   `ack (Suc m) n` the first argument stays the same and the second decreases. That is exactly what
   `<*mlex*>` expresses: compare the first arguments, and only when they are equal, the second ones.
   Ackermann's function grows extremely fast; `ack 4 2` already has 19,729 digits.

3. Rejected, with "Could not find lexicographic termination order": the argument grows in every call, so
   no measure can decrease. The result matrix even shows a fourth kind of entry, `F`: Isabelle found that
   `n + 1 ≤ n` is false, so the size grows. But `forever` is not dangerous in the way `bad` is: every constant function
   satisfies `forever n = forever (n + 1)`, so the equation is not contradictory. It is merely not a
   definition: it does not determine which function `forever` is, and as a program it runs forever. `fun`
   rejects every recursion whose termination it cannot prove, whether the equations are contradictory
   or not.
:::
::::

## Check yourself {#quiz}

```quiz
? What is the difference between the commands `term` and `value`?
- [ ] `term` works only for terms without variables
- [x] `term` prints a term and its type without evaluating it; `value` evaluates it
- [ ] `value` prints only the type, `term` only the value
- [ ] There is none; they are two names for the same command
> `term "(λx::nat. x * x) 7"` prints `7 * 7`, after β-reduction but without arithmetic; `value` prints `49`.

? What is the type of `map Suc`?
- [ ] `nat ⇒ nat`
- [ ] `(nat ⇒ nat) ⇒ nat list ⇒ nat list`
- [x] `nat list ⇒ nat list`
- [ ] `nat list`
> `map :: ('a ⇒ 'b) ⇒ 'a list ⇒ 'b list` has received its first argument, `Suc :: nat ⇒ nat`. The partial application waits for a list of natural numbers.

? What does `value "(3::nat) - 5"` print?
- [ ] `- 2`
- [ ] an error, because the result is negative
- [ ] `2`
- [x] `0`
> Subtraction on `nat` is truncated: `m - n = 0` whenever `m ≤ n`.

? You define `safe` with `definition`, and `lemma "safe (Red, Green)" by simp` fails. Why?
- [x] `simp` does not use the equation of a `definition` unless you add it, as in `simp add: safe_def`
- [ ] The lemma is false
- [ ] `definition` cannot define functions on pairs
- [ ] `simp` cannot prove statements about datatypes
> Definitions are not unfolded automatically, so that proofs can use proved properties of a concept instead of its definition.

? Why does `fun` refuse a recursive definition whose termination it cannot prove?
- [ ] Because non-terminating functions would make `value` slow
- [ ] Because HOL has no type for infinite computations
- [x] Because the equations of a non-terminating "definition" can contradict each other, as `f x = f x + 1` implies `0 = 1`
- [ ] Because the code generator cannot translate such functions
> `fun` proves your equations from a construction that needs a termination argument. Without one, accepting the equations could make the logic inconsistent.

? `value "2 + 2"` reports "Cannot derive subsort relation numeral < term_of". What is the cause?
- [ ] The number 2 is too small for `value`
- [ ] Natural numbers cannot be added with `value`
- [ ] The class `numeral` is not defined in `Main`
- [x] The type of `2 + 2` is unknown; Isabelle knows only that it has numerals, which is not enough to print the result
> `value` needs the class `term_of` to print a result. A type annotation such as `:: nat` fixes the type and removes the error.
```
