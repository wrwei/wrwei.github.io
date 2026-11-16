---
title: "Capstone: a verified compiler"
part: 4
lead: Build a small compiler in Isabelle, from arithmetic expressions to code for a stack machine, test it, and prove that the code it produces is right for every expression. Then verify an optimisation, export the compiler as Haskell code, and extend it with subtraction, conditionals and jumps.
minutes: 240
needs: Modules 1–13, especially Modules 8 (datatypes and functions), 10 (Isar) and 11 (generalisation and auxiliary lemmas)
goals:
  - Define a small language by a datatype, and its meaning by an evaluation function
  - Define a stack machine and a compiler for it, and compare evaluation with execution on examples
  - Test a compiler with value and Quickcheck before proving anything about it
  - Prove the compiler correct by induction, generalising over the stack and adding the lemma about appended code
  - Prove an optimisation correct, combine the two theorems, and export the verified compiler as code
  - Extend the language and the machine, and judge which parts of the proof carry over
imports: Main
---

## Closing the circle {#circle}

Module 1 began with software that must not fail, and one of its examples was a compiler: CompCert, a C
compiler with a machine-checked proof of correctness. Compilers deserve that attention. Every program
you run has been translated by one, and a bug in the translation breaks programs whose source code is
correct. It breaks proofs too. A proof about a C function speaks about the C code, but the computer runs
whatever the compiler produced. In Exercise 1.6 the compiler appeared on the list of things that a
verified program still has to trust. A verified compiler takes it off that list: its correctness theorem
says that the code it produces does what the source program means, for every source program.

The idea is almost as old as compilers. In 1967 John McCarthy and James Painter proved on paper that a
compiler for arithmetic expressions is correct, the first proof of its kind. In 1972 Robin Milner and
Richard Weyhrauch checked a compiler proof by machine, in Stanford LCF, the forerunner of the LCF system
of Module 1. Today CompCert compiles a large subset of C, and CakeML, verified in the prover HOL4,
compiles a dialect of ML. Their proofs run to many thousands of lines, but the central argument is the
one you will write in this module, for the language McCarthy and Painter started with.

You will build every piece yourself:

1. a source language of arithmetic expressions, and its meaning (Section 14.2);
2. a target machine that computes with a stack (Section 14.3);
3. the compiler, and tests that compare source and target (Section 14.4);
4. the proof that the compiler is correct (Section 14.5);
5. an optimisation with its own proof, and the verified code exported to Haskell (Sections 14.6
   and 14.7);
6. extensions: subtraction, conditionals and jumps (Section 14.8).

What does "correct" mean for a compiler? Figure 14.1 shows the answer that this module proves. From an
expression there are two ways to a result. You can evaluate the expression directly, using the meaning
of the source language. Or you can compile it and run the code on the machine. The compiler is correct
if the two ways always agree.

::: figure id=fig-14-1
Evaluating an expression and running its compiled code must agree. The theorem `compile_correct` of
Section 14.5 says that they do, for every expression, every state of the variables and every stack.
:::

The machine is a **stack machine**: it keeps intermediate results on a stack, and its instructions take
their operands from the top of the stack and put their results back there. This is a realistic design.
The Java Virtual Machine, WebAssembly and the interpreter of Python all run instructions for stack
machines of this kind, and their compilers produce such code.

::: keyidea
A compiler translates, and a correct translation preserves meaning. To prove that it does, you need the
meaning of both languages as mathematical functions: an evaluation function for the source and an
execution function for the target. "Preserves meaning" then becomes an equation between the two, which
you can test on examples and prove by induction.
:::

## Expressions and their meaning {#source}

### Names, states and expressions {#syntax}

Programs are written as text, but a compiler works on their structure. The text `x + (2 + y)` is an
addition whose left operand is the variable x and whose right operand is another addition, of the number
2 and the variable y. The program that turns text into structure is the **parser**. Parsing is a subject
of its own, and this module, like most compiler proofs, starts after it.

::: definition Abstract syntax
The **abstract syntax** of a language describes its programs as trees: each node is an operation and its
children are the operands. Parentheses and spaces belong to the text, the **concrete syntax**, and do not
appear in the tree. In Isabelle, abstract syntax is a datatype.
:::

Expressions contain variables, so you need names for variables and a way to give them values. Names are
strings. Isabelle writes a string between two pairs of single quotes, as in `''x''`, because the double
quote already marks the end of a term (Module 1). Values are integers (`int`, Module 8), so that
subtraction makes sense when Section 14.8 adds it. The values of all variables at one moment form a
**state**: a function from names to values.

```isabelle
type_synonym vname = string
type_synonym state = "vname ⇒ int"
```

`type_synonym` introduces a new name for an existing type. `vname` is another name for `string`, which is
itself `char list`, a list of characters, and `state` is another name for `vname ⇒ int`. Nothing new is
created: Isabelle's output often shows the full types instead of the short names.

An expression is a number, a variable, or the sum of two expressions:

```isabelle
datatype expr = Num int | Var vname | Add expr expr
```

The datatype is recursive, like the trees of Module 5, and its values are exactly the trees described
above: `Add` makes a node with two children, and `Num` and `Var` make leaves. The text `x + (2 + y)`
becomes the tree `Add (Var ''x'') (Add (Num 2) (Var ''y''))`. It will serve as the running example, so
give it a name:

```isabelle
definition sample :: expr where
  "sample = Add (Var ''x'') (Add (Num 2) (Var ''y''))"
```

### Evaluation {#eval}

The meaning of an expression is its value, and its value depends on the state. A recursive function says
what each kind of node means:

```isabelle
fun eval :: "expr ⇒ state ⇒ int" where
  "eval (Num n) s = n"
| "eval (Var x) s = s x"
| "eval (Add a b) s = eval a s + eval b s"
```

```output
```

Read the equations aloud: a number means itself; a variable means its value in the state s; a sum means
the sum of the meanings of its parts. On the left, `Add` is a piece of syntax; on the right, `+` is the
addition of integers. `eval` connects the two. Isabelle shows the type of `eval` with the synonyms
unfolded, `state` as `char list ⇒ int`, and reports that `eval` terminates because each recursive call
is on a smaller expression, the first of its two arguments (Module 8).

::: definition Semantics
The **semantics** of a language gives each of its programs a precise mathematical meaning, the second
ingredient of a formal method in Module 1. Here the meaning of an expression e in a state s is the
integer `eval e s`. The definition is **compositional**: the meaning of a node is computed from the
meanings of its children.
:::

To try `eval`, you need a state. Isabelle writes `f(a := v)` for the function that maps a to v and every
other argument b to `f b`; you met this notation in Nitpick's counterexamples in Module 3. Start from
`λ_. 0`, the function that maps every name to 0 (the underscore is a variable whose name does not
matter), and update it twice:

```isabelle
definition s0 :: state where
  "s0 = (λ_. 0)(''x'' := 5, ''y'' := 7)"

value "(s0 ''x'', s0 ''y'', s0 ''z'')"
```

```output result
```

In the state `s0` the variable x has the value 5, y has 7 and every other variable has 0. Now evaluate
the running example:

```isabelle
value "eval sample s0"
```

```output
```

::: example Evaluating by hand
The equations of `eval` produce the same result step by step. Unfold `sample` and work from the outside
in:

$$
\begin{aligned}
\mathit{eval}\ \mathit{sample}\ s_0
&= \mathit{eval}\ (\mathit{Var}\ x)\ s_0 + \mathit{eval}\ (\mathit{Add}\ (\mathit{Num}\ 2)\ (\mathit{Var}\ y))\ s_0\\
&= 5 + (\mathit{eval}\ (\mathit{Num}\ 2)\ s_0 + \mathit{eval}\ (\mathit{Var}\ y)\ s_0)\\
&= 5 + (2 + 7) = 14
\end{aligned}
$$
:::

## A stack machine {#machine}

The target machine knows nothing about expressions. It has a stack of integers, reads variables from the
state, as the expressions do, and understands three instructions:

- `PUSH n` puts the number n on top of the stack;
- `LOAD x` puts the value of the variable x on top of the stack;
- `ADD` takes the two numbers on top of the stack off and puts their sum on.

```isabelle
datatype instr = PUSH int | LOAD vname | ADD

type_synonym stack = "int list"
```

A stack is a list whose head is the top: in `[2, 5]` the 2 lies on top of the 5. Putting a value on the
stack is `#`, and taking values off is pattern matching on `#`.

::: definition Stack machine
A **stack machine** computes with a **stack**, a list of values that is used only at one end, its
**top**. Each instruction takes its operands from the top of the stack and leaves its result there. A
**program** for the machine is a list of instructions, executed from left to right.
:::

The function `exec1` executes one instruction:

```isabelle
fun exec1 :: "instr ⇒ state ⇒ stack ⇒ stack" where
  "exec1 (PUSH n) s stk = n # stk"
| "exec1 (LOAD x) s stk = s x # stk"
| "exec1 ADD s (j # i # stk) = (i + j) # stk"
| "exec1 ADD s stk = stk"
```

The third equation does the work of `ADD`: j is the top of the stack and i the number below it, and the
sum i + j replaces both. The order of i and j looks irrelevant now, but it will matter when you add
subtraction in Section 14.8. The fourth equation is there because every HOL function is total (Module
8): `exec1` must return a stack even when `ADD` finds fewer than two numbers. A real machine would stop
with an error, a **stack underflow**; this one leaves the stack as it is. The choice does not affect the
compiler, whose code never meets this case. Exercise 14.7 builds a machine that stops instead, and
proves that.

The third and fourth equations overlap: a stack with two or more numbers matches both. `fun` resolves the
overlap in order, the earlier equation first (Module 8). `thm exec1.simps` shows the equations that
`fun` has derived from the definition, the ones `simp` uses:

```isabelle
thm exec1.simps
```

```output
```

The fourth equation has become two, for the empty stack and for a stack with one number: exactly the
stacks that the third equation does not cover.

A program runs one instruction after the other, each on the stack that the previous one left:

```isabelle
fun exec :: "instr list ⇒ state ⇒ stack ⇒ stack" where
  "exec [] s stk = stk"
| "exec (i # c) s stk = exec c s (exec1 i s stk)"
```

The letter c stands for code, a list of instructions. Now run the machine, first one instruction, then a
whole program:

```isabelle
value "exec1 ADD s0 [7, 5]"
```

```output
```

```isabelle
value "exec [LOAD ''x'', PUSH 2, LOAD ''y'', ADD, ADD] s0 []"
```

```output
```

Figure 14.2 shows the stack after each instruction of this program. The stack grows to three numbers
when `LOAD ''y''` has run, and each `ADD` makes it one shorter.

::: figure id=fig-14-2
The program `LOAD ''x'', PUSH 2, LOAD ''y'', ADD, ADD` run in the state `s0` on the empty stack. Each
`ADD` replaces the two numbers on top by their sum.
:::

What was on the stack before a program started stays where it is, below the new values:

```isabelle
value "exec [LOAD ''x'', PUSH 2] s0 [100]"
```

```output
```

This property, code that leaves the rest of the stack alone, is what will make the compiler work.

## The compiler {#compiler}

### Compiling expressions {#compiling}

How does the machine compute `Add a b`? It runs code that leaves the value of a on the stack, then code
that leaves the value of b on top of it, and then `ADD`. Numbers and variables need one instruction
each. That is the whole compiler:

```isabelle
fun compile :: "expr ⇒ instr list" where
  "compile (Num n) = [PUSH n]"
| "compile (Var x) = [LOAD x]"
| "compile (Add a b) = compile a @ compile b @ [ADD]"
```

`@` appends lists (Module 1). Like `eval`, the compiler has one equation for each kind of node, and the
code for a node is built from the code of its children. Compile the running example:

```isabelle
value "compile sample"
```

```output
```

This is the program of Figure 14.2. The operands come before their operator: first x, then 2 and y, then
the inner `ADD`, then the outer one. This order is called **postfix** or **reverse Polish** notation.

::: analogy
Some pocket calculators work in reverse Polish notation. To compute 2 + 3 you key in 2, Enter, 3 and
then +. The calculator keeps the numbers on a stack until the + combines them, exactly as `ADD` does. The
compiler translates the notation you learned at school into the keystrokes for such a calculator.
:::

Now compare evaluation and execution on the example, with 100 already on the stack:

```isabelle
value "(exec (compile sample) s0 [100], eval sample s0 # [100])"
```

```output
```

Both give 14 on top of the 100.

::: pitfall
Why is the compiler called `compile` and not the shorter `comp`? Because `comp` is taken. It is function
composition, written ∘:

```isabelle
term comp
```

```output
```

Before you name a function, ask Isabelle whether the name is free. `term` prints the type of a constant
that exists; a name that is not a constant is printed with type `'a`, because Isabelle reads it as a free
variable (Module 8). `find_consts` (Module 9) searches by name or by type. Reusing a library name for
your own function makes your theory hard to read and Isabelle's messages confusing.
:::

### What correct means {#correct}

On the example, the two ways agree. "Correct" means that they agree always:

::: definition Compiler correctness
The compiler is **correct** if for every expression e, every state s and every stack stk,

$$
\mathit{exec}\ (\mathit{compile}\ e)\ s\ \mathit{stk} = \mathit{eval}\ e\ s\ \#\ \mathit{stk}
$$

In words: running the code of e on any stack puts the value of e on top of that stack and changes nothing
below it.
:::

Three things about this statement are worth noticing.

- It is a **specification** in the sense of Module 12. `eval` says what the value must be; `compile`
  together with `exec` is the implementation that computes it.
- It speaks about every stack, not only the empty one, although a user of the compiler only ever starts
  with an empty stack. The reason is that the compiler combines code: the code of b in `Add a b` runs on
  a stack that already holds the value of a. Section 14.5 shows that the proof needs the general form.
- It describes the whole stack after the run. A weaker claim, "the top of the stack is the value of e",
  would allow code that destroys what lies below, and such code would break the code around it.

### Test before you prove {#testing}

A proof takes effort; a test takes seconds. Module 9 advised testing every claim before trying to prove
it, so start with Quickcheck:

```isabelle
lemma "exec (compile e) s stk = eval e s # stk"
  quickcheck [size = 3]
  oops
```

```output result
```

Quickcheck tried every expression, state and stack up to size 3 and found nothing wrong. The option
`size = 3` limits the search. Without it, Quickcheck searches up to its default size, and on this claim it
would stop with "Quickcheck ran out of time" after its time limit: the state is a function from strings
to integers, and there are very many small functions of that kind. Size 3 already includes expressions
with two additions and stacks with three numbers, enough to catch the mistakes below.

Quickcheck is at its best on claims that are wrong. Here is a correctness claim that forgets the stack:

```isabelle
lemma "exec (compile e) s stk = [eval e s]"
  quickcheck
  oops
```

```output result
```

Read the counterexample. The expression is the number −1 (Isabelle prints negative numbers with a
space, Module 8), the state maps every name to −2, which does not matter here, and the stack already
holds −1. The code pushes −1 on top, so the result has two numbers where the claim expects one. The
claim, not the compiler, is wrong.

Now a compiler with a bug. Writing each operator between its operands, in the order of the text
`x + y`, is a natural first attempt:

```isabelle
fun compile_bad :: "expr ⇒ instr list" where
  "compile_bad (Num n) = [PUSH n]"
| "compile_bad (Var x) = [LOAD x]"
| "compile_bad (Add a b) = compile_bad a @ [ADD] @ compile_bad b"

value "(compile_bad sample, exec (compile_bad sample) s0 [])"
```

```output result
```

The first `ADD` finds a single number and changes nothing, the second adds 2 to 5, and the value of y
ends up on the stack next to the 7. On a single example you might wonder whether you set it up wrongly.
Quickcheck removes the doubt:

```isabelle
lemma "exec (compile_bad e) s stk = eval e s # stk"
  quickcheck
  oops
```

```output result
```

The smallest counterexample is 0 + 0. The numbers do not matter: the order of the instructions is wrong,
and Quickcheck, which tries small values first, finds the smallest expression that contains an `ADD`.

::: keyidea
Test before you prove. `value` checks one example; Quickcheck checks thousands of small ones and reports
the first failure it finds, which is usually the simplest. Neither proves anything, but both are fast,
and a counterexample shows you exactly what is wrong. A proof attempt on a false claim only fails,
without telling you why.
:::

## The correctness proof {#proof}

### On paper {#paper}

**Claim.** For every expression e, state s and stack stk, `exec (compile e) s stk = eval e s # stk`.

**Proof** by structural induction on e (Module 5), with one case for each constructor.

- *Case* `Num n`. The code is `[PUSH n]`, which puts n on the stack, and `eval (Num n) s = n`.
- *Case* `Var x`. The code is `[LOAD x]`, which puts `s x` on the stack, and `eval (Var x) s = s x`.
- *Case* `Add a b`, where the claim holds for a and for b (the induction hypotheses). The code is
  `compile a @ compile b @ [ADD]`. Run it in three stages (Figure 14.3):
  1. `compile a` runs on stk. By the hypothesis for a, it leaves `eval a s # stk`.
  2. `compile b` runs on `eval a s # stk`. By the hypothesis for b, applied to *this* stack, it leaves
     `eval b s # eval a s # stk`.
  3. `ADD` replaces the two numbers on top by their sum, which gives
     `(eval a s + eval b s) # stk`, and that is `eval (Add a b) s # stk`. ∎

::: figure id=fig-14-3
The case `Add a b` of the proof. The hypothesis for a is used with the stack of the claim, the
hypothesis for b with a different one.
:::

Two steps of this argument use more than the equations of the functions.

- *"Run it in three stages."* That running `c1 @ c2` means running c1 and then running c2 on the stack
  c1 leaves is a property of `exec`. It is true, but it needs its own proof: an **auxiliary lemma**
  (Module 11).
- *"Applied to this stack."* Stage 2 uses the hypothesis for b with the stack `eval a s # stk`, not with
  stk. That is allowed only if the claim, and with it the induction hypothesis, speaks about every stack.
  The induction must be **generalised** over the stack (Module 11).

The next two sections let Isabelle discover both points from its proof states.

### The lemma about appended code {#append}

The claim a user of the compiler cares about starts with the empty stack and expects one number at the
end. Try to prove it with the usual induction:

```isabelle
lemma "exec (compile e) s [] = [eval e s]"
  apply (induction e)
  apply auto
```

```output state
```

`auto` has proved the cases `Num` and `Var` and unfolded `compile` in the case `Add`; Isabelle calls the
two subexpressions e1 and e2, after the type `expr`. Then it stopped. Module 11's recipe starts with the
subterm that the simplifier cannot rewrite: `exec (compile e1 @ compile e2 @ [ADD]) s []`. The equations
of `exec` are about `[]` and about `i # c`, and this argument is an append. Abandon the attempt:

```isabelle
  oops
```

Next, replace the parts that are specific to this proof by variables: the question is what
`exec (c1 @ c2) s stk` is, for any code c1 and c2. The paper proof gives the answer, run c1 first and c2
afterwards, and an example agrees:

```isabelle
value "(exec ([LOAD ''x'', PUSH 2] @ [ADD]) s0 [1],
        exec [ADD] s0 (exec [LOAD ''x'', PUSH 2] s0 [1]))"
```

```output
```

Test the conjecture:

```isabelle
lemma "exec (c1 @ c2) s stk = exec c2 s (exec c1 s stk)"
  quickcheck [size = 3]
  oops
```

```output result
```

Prove it by induction on c1. The recursive call of `exec` receives a new stack, `exec1 i s stk`, so the
stack must be arbitrary, as Module 11's tip says for every argument that changes in a recursive call:

```isabelle
lemma exec_append [simp]: "exec (c1 @ c2) s stk = exec c2 s (exec c1 s stk)"
  apply (induction c1 arbitrary: stk)
```

```output state
```

In subgoal 2, the hypothesis holds for every stack (⋀stk). The simplifier rewrites `(a # c1) @ c2` to
`a # (c1 @ c2)`, executes `a`, and then needs the hypothesis for the stack `exec1 a s stk`, which it may
now use:

```isabelle
  apply auto
  done
```

The attribute `[simp]` adds the lemma to the simplifier's rules (Module 9), so that `simp` and `auto`
split appended code from now on.

### Generalise over the stack {#generalise}

With `exec_append` available, try the claim about the empty stack again:

```isabelle
lemma "exec (compile e) s [] = [eval e s]"
  apply (induction e)
  apply auto
```

```output state
```

Progress: the code of e1 has run, by `exec_append` and the hypothesis for e1, and left `[eval e1 s]`.
Now the code of e2 runs on the stack `[eval e1 s]`, but the hypothesis for e2 speaks only about the empty
stack. This is the second point of the paper proof, and no lemma can help: the hypothesis is too weak.

```isabelle
  oops
```

Module 11 showed what to do, in two steps:

1. Replace the constant by a variable: claim the result for any stack stk. The expected result then
   becomes `eval e s # stk` instead of `[eval e s]`. This is the statement of Definition 14.4.
2. Make the variable arbitrary in the induction, so that the hypotheses hold for every stack, including
   the stack `eval e1 s # stk` on which the code of e2 runs.

With both steps the proof goes through:

```isabelle
lemma "exec (compile e) s stk = eval e s # stk"
  by (induction e arbitrary: stk) auto
```

Step 1 alone is not enough. Without `arbitrary: stk`, stk is fixed for the whole induction, the
hypothesis for e2 speaks about that one stack, and the code of e2 still runs on another one. The box at
the end of Section 14.5.4 shows the error you get.

::: keyidea
State the claim in the form that the recursion needs. `compile` places the code of b after the code of
a, so the code of b runs on a stack that already holds the value of a. A claim about the empty stack
cannot describe that; a claim about every stack can. The stronger claim is the easier one to prove: it
is Module 11's inventor's paradox once more.
:::

### The proof in Isar {#isar}

The one-line proof hides the argument. The Isar proof follows the paper proof step by step, and Isabelle
checks every step. `theorem` means the same as `lemma`; it marks the main results of a theory.

```isabelle
theorem compile_correct: "exec (compile e) s stk = eval e s # stk"
proof (induction e arbitrary: stk)
```

```output state
```

Read subgoal 3 aloud: "for all e1, e2 and stk: if for every stack the claim holds for e1, and for every
stack it holds for e2, then it holds for `Add e1 e2` and stk". The ⋀stk inside the hypotheses is the
effect of `arbitrary: stk`. The cases `Num` and `Var` follow from the definitions; enter the case `Add`
with names of your own for the subexpressions:

```isabelle
  case (Num n)
  show ?case by simp
next
  case (Var x)
  show ?case by simp
next
  case (Add a b)
```

```output state
```

The induction hypotheses are listed under `this`, with the schematic variable `?stk` (Module 7): they
may be used with any stack. `Add.IH(1)` is the hypothesis for a, and `Add.IH(2)` the one for b. The
paper proof uses each of them once, a with the stack stk and b with the stack `eval a s # stk`. State
the two facts and let `rule` instantiate `?stk`:

```isabelle
  have run_a: "exec (compile a) s stk = eval a s # stk"
    by (rule Add.IH(1))
  have run_b: "exec (compile b) s (eval a s # stk) = eval b s # eval a s # stk"
```

```output state
```

```isabelle
    by (rule Add.IH(2))
```

Now the calculation of Module 10, in the three stages of Figure 14.3:

```isabelle
  have "exec (compile (Add a b)) s stk
        = exec [ADD] s (exec (compile b) s (exec (compile a) s stk))"
    by simp
  also have "… = exec [ADD] s (exec (compile b) s (eval a s # stk))"
    by (simp only: run_a)
  also have "… = exec [ADD] s (eval b s # eval a s # stk)"
    by (simp only: run_b)
  also have "… = eval (Add a b) s # stk"
    by simp
  finally show ?case .
qed
```

The first step is the shape of the code: `simp` unfolds `compile` and applies `exec_append` twice, so
that the code of a runs first, then the code of b, then `ADD`. The second and third steps rewrite with
`run_a` and `run_b` only (`simp only`, Module 9). The last step executes `ADD` and unfolds `eval`. The
theorem a user wants, for the empty stack, is now an instance:

```isabelle
corollary compile_correct_empty: "exec (compile e) s [] = [eval e s]"
  by (simp add: compile_correct)
```

`corollary` is another synonym of `lemma`, for a result that follows directly from a theorem.

::: fact The compiler is correct
For every expression e, state s and stack stk, `exec (compile e) s stk = eval e s # stk`. In
particular, `exec (compile e) s [] = [eval e s]`. (Theorems `compile_correct` and
`compile_correct_empty`.)
:::

::: trouble
Leave out `arbitrary: stk`, and the step `run_b` fails:

```isabelle fails
lemma "exec (compile e) s stk = eval e s # stk"
proof (induction e)
  case (Num n)
  show ?case by simp
next
  case (Var x)
  show ?case by simp
next
  case (Add a b)
  have run_b: "exec (compile b) s (eval a s # stk) = eval b s # eval a s # stk"
    by (rule Add.IH(2))
  then show ?case using Add.IH(1) by simp
qed
```

```output
```

Without `arbitrary`, `Add.IH(2)` says `exec (compile b) s stk = eval b s # stk` for the one stack stk of
the claim. It does not fit the goal, which is about the stack `eval a s # stk`, so `rule` cannot apply
it. When `rule` with an induction hypothesis fails like this, look for a variable that should be
arbitrary (Module 11).
:::

## A verified optimisation {#optimise}

Real compilers improve the code they produce: they **optimise** it. Every optimisation is a new chance
for a bug, and optimisations are where many compiler bugs live. A verified compiler proves each one
correct.

### Constant folding {#folding}

Part of an expression may not depend on the state at all. In `(2 + 3) + (x + 0)`, the sum 2 + 3 is 5 in
every state, and adding 0 changes nothing. A compiler can do that work once, at compile time, instead of
every time the code runs.

::: definition Constant folding
**Constant folding** replaces the parts of a program whose value does not depend on the state by their
value, and removes operations that have no effect. An optimisation is **correct**, or
**semantics-preserving**, if the optimised program has the same meaning as the original in every state.
:::

The work is done one addition at a time, by a function that builds an addition and simplifies it where it
can:

```isabelle
fun fold_add :: "expr ⇒ expr ⇒ expr" where
  "fold_add (Num m) (Num n) = Num (m + n)"
| "fold_add a b = (if b = Num 0 then a else Add a b)"
```

Two numbers are added at once. Otherwise an addition of 0 on the right is dropped, and anything else
stays an addition. The two equations overlap, and the first one wins. The optimiser folds the children
of a node first, and then the node itself:

```isabelle
fun cfold :: "expr ⇒ expr" where
  "cfold (Num n) = Num n"
| "cfold (Var x) = Var x"
| "cfold (Add a b) = fold_add (cfold a) (cfold b)"
```

Try it on `(2 + 3) + (x + 0)`:

```isabelle
definition sample2 :: expr where
  "sample2 = Add (Add (Num 2) (Num 3)) (Add (Var ''x'') (Num 0))"

value "cfold sample2"
```

```output
```

The result is `5 + x`. The code shrinks from seven instructions to three:

```isabelle
value "(compile sample2, compile (cfold sample2))"
```

```output
```

`cfold` folds only where two numbers meet. In `2 + (3 + x)` they do not, and nothing changes:

```isabelle
value "cfold (Add (Num 2) (Add (Num 3) (Var ''x'')))"
```

```output
```

The expression equals `5 + x`, but finding that needs the associative law, a cleverer optimiser and a
proof to match. Folding as it is will do here.

### Folding preserves meaning {#folding-correct}

The claim is `eval (cfold e) s = eval e s`. Its case `Add` needs a fact about `fold_add`: whatever it
builds has the value of the sum of its arguments. Prove that first, by computation induction on
`fold_add` (Module 11):

```isabelle
lemma eval_fold_add [simp]: "eval (fold_add a b) s = eval a s + eval b s"
  apply (induction a b rule: fold_add.induct)
```

```output state
```

The cases follow the equations of `fold_add`, after `fun` has made them non-overlapping, as it did for
`exec1`. The second equation has become four: one for each shape of a and b that the first equation does
not cover. In every case the simplifier can evaluate `fold_add`, and the `if` splits into two easy
cases:

```isabelle
  apply auto
  done
```

The theorem follows by structural induction:

```isabelle
theorem cfold_correct: "eval (cfold e) s = eval e s"
  by (induction e) auto
```

This time no variable is arbitrary. `eval` passes the state unchanged to its recursive calls, so the
hypotheses for the same s are exactly what the case `Add` needs. Compare `exec`, whose recursive call
receives a new stack: Module 11's tip asks which arguments change in the recursive calls, and only those
need generalising.

### Optimise, then compile {#pipeline}

The two theorems fit together. Optimise first, then compile, and the code still computes the value of
the original expression:

```isabelle
theorem compile_cfold_correct: "exec (compile (cfold e)) s stk = eval e s # stk"
  by (simp add: compile_correct cfold_correct)
```

`compile_correct` turns the left-hand side into `eval (cfold e) s # stk`, and `cfold_correct` turns that
into the right-hand side. Verified compilers grow in this way. CompCert translates C in a long series of
passes, through several intermediate languages, and each pass has its own proof that it preserves the
meaning; because the theorems compose, the whole compiler is correct.

::: pitfall
An optimisation is correct with respect to a semantics, here the semantics of mathematical integers.
For other kinds of numbers it may be wrong. In IEEE floating-point arithmetic, which almost every
processor uses, adding 0.0 to −0.0 gives +0.0, so replacing `x + 0.0` by `x` changes the result when x is −0.0, and compilers
do not make that replacement. A proof about the wrong semantics proves nothing about the real program.
:::

## From proof to program {#export}

The compiler is a function in HOL, and Module 8 showed how to turn such functions into programs in
other languages. Export the verified compiler and optimiser as Haskell:

```isabelle
export_code compile cfold in Haskell module_name StackCompiler
```

```output
```

As in Module 8, the code does not appear in the Output panel. In Isabelle/jEdit, the words *theory
exports* are a link to the generated files, which the File Browser shows in a virtual folder whose name
begins with `isabelle-export:`. The Haskell module is the file `StackCompiler.hs`. Here is its central
part, as Isabelle2026 generates it:

```text
CODE_PLACEHOLDER
```

The datatypes and the two functions have the same equations as in Isabelle.

What does the proof guarantee for this program? The theorems are about the HOL functions. The code
generator is designed so that each step of the generated program corresponds to rewriting with
equations that are theorems, but it is not part of the kernel (Module 8): it belongs to the trusted
base, together with the Haskell compiler that turns the generated code into machine code, and the
hardware. The trusted base has not disappeared. It has moved from your compiler to a few general tools
that many people use and check.

::: note
CompCert faces the same question at a larger scale. Its compiler is written and proved in Rocq and
extracted to OCaml code by Rocq's extraction mechanism, which plays the role of Isabelle's code
generator here.
:::

## Extending the compiler ★★★ {#extensions}

This section is a stretch, at the level of the ★★★ exercises. It extends the language with subtraction
and a conditional expression, and the machine with subtraction and jumps. Most of the development
carries over unchanged; the lemma about appended code does not, and its replacement is a lesson in
generalisation of its own.

In your own theory you would add the new constructors to `expr` and `instr` and extend the functions. On
this page the definitions of the earlier sections must stay as they are, so the extended versions get new
names. The types and functions end in 2, and so do the constructors that existed before (`Num2`, `Var2`,
`Add2`, `PUSH2`, `LOAD2`, `ADD2`); the new constructors have plain names.

### Subtraction and conditionals {#extended-language}

```isabelle
datatype expr2 = Num2 int | Var2 vname | Add2 expr2 expr2
  | Sub expr2 expr2 | Cond expr2 expr2 expr2

fun eval2 :: "expr2 ⇒ state ⇒ int" where
  "eval2 (Num2 n) s = n"
| "eval2 (Var2 x) s = s x"
| "eval2 (Add2 a b) s = eval2 a s + eval2 b s"
| "eval2 (Sub a b) s = eval2 a s - eval2 b s"
| "eval2 (Cond t a b) s = (if eval2 t s ≠ 0 then eval2 a s else eval2 b s)"
```

`Sub a b` is a − b. `Cond t a b` is a conditional expression, written `t ? a : b` in C: its value is the
value of a if the test t is not 0, and the value of b otherwise. As in C, 0 counts as false.

The machine gets an instruction for subtraction and two **jumps**. `JMP n` skips the next n
instructions. `JMPZ n` takes the number on top of the stack off and skips the next n instructions if that
number is 0; otherwise execution continues with the next instruction.

```isabelle
datatype instr2 = PUSH2 int | LOAD2 vname | ADD2 | SUB | JMP nat | JMPZ nat

fun exec2 :: "instr2 list ⇒ state ⇒ stack ⇒ stack" where
  "exec2 [] s stk = stk"
| "exec2 (PUSH2 n # c) s stk = exec2 c s (n # stk)"
| "exec2 (LOAD2 x # c) s stk = exec2 c s (s x # stk)"
| "exec2 (ADD2 # c) s (j # i # stk) = exec2 c s ((i + j) # stk)"
| "exec2 (SUB # c) s (j # i # stk) = exec2 c s ((i - j) # stk)"
| "exec2 (JMP n # c) s stk = exec2 (drop n c) s stk"
| "exec2 (JMPZ n # c) s (v # stk) =
     (if v = 0 then exec2 (drop n c) s stk else exec2 c s stk)"
| "exec2 (_ # c) s stk = exec2 c s stk"
```

```output
```

`drop n c` is c without its first n elements, so a jump forward is a recursive call on a shorter
program. The last equation catches what the others leave out, an `ADD2` or `SUB` on a short stack and a
`JMPZ` on the empty one, and skips the instruction. Jumps only go forwards, so every recursive call is on
a shorter list, and Isabelle finds the termination order without help. With backward jumps a program
could run for ever, and `exec2` could not be a function (more on that in Section 14.8.4).

### The order of operands {#operand-order}

`SUB` computes i − j, where j is the top of the stack and i the number below it. So the compiler must
push a first and b second, as it does for addition:

```isabelle
fun compile2 :: "expr2 ⇒ instr2 list" where
  "compile2 (Num2 n) = [PUSH2 n]"
| "compile2 (Var2 x) = [LOAD2 x]"
| "compile2 (Add2 a b) = compile2 a @ compile2 b @ [ADD2]"
| "compile2 (Sub a b) = compile2 a @ compile2 b @ [SUB]"
| "compile2 (Cond t a b) =
     compile2 t @ [JMPZ (length (compile2 a) + 1)] @ compile2 a @
     [JMP (length (compile2 b))] @ compile2 b"
```

For addition the order did not matter, because addition is commutative; for subtraction it does. Had the
`Sub` equation pushed b first, the code would compute b − a. Quickcheck catches the swap at once:

```isabelle
lemma "exec2 (compile2 b @ compile2 a @ [SUB]) s stk = (eval2 a s - eval2 b s) # stk"
  quickcheck
  oops
```

```output result
```

A bug of this kind slips easily past tests on hand-picked examples: with a = b, or with the operands of
an addition, the swapped code gives the right answer.

### Conditionals and jumps {#jumps}

The code for `Cond t a b` evaluates the test and then jumps over the code it does not need:

```text
code of t | JMPZ k | code of a | JMP m | code of b |
            k = length (code of a) + 1     m = length (code of b)
```

If the test is 0, `JMPZ k` skips the code of a and the `JMP` after it, and execution continues with the
code of b. Otherwise the code of a runs, and `JMP m` skips the code of b. Either way, execution continues
after the code of b with one new value on the stack. Two runs, in the state `s0` where x is 5 and z is 0:

```isabelle
value "compile2 (Cond (Var2 ''x'') (Num2 1) (Num2 2))"
```

```output
```

```isabelle
value "(exec2 (compile2 (Cond (Var2 ''x'') (Num2 1) (Num2 2))) s0 [],
        exec2 (compile2 (Cond (Var2 ''z'') (Num2 1) (Num2 2))) s0 [])"
```

```output
```

Now the proof. The lemma about appended code was the key to Section 14.5. Is it still true?

```isabelle
lemma "exec2 (c1 @ c2) s stk = exec2 c2 s (exec2 c1 s stk)"
  quickcheck
  oops
```

```output result
```

It is not. A jump at the end of c1 skips instructions of c2 when the two run as one program, but finds
nothing to skip when c1 runs alone. Running `c1 @ c2` is no longer "run c1, then c2". The lemma held for
the old machine because each of its instructions affected only the stack, never which instruction
comes next.

The way out is another generalisation. Instead of splitting a program at an arbitrary point, describe
what the code of e does in front of *any* code c that follows it: running `compile2 e @ c` is the same as
putting the value of e on the stack and then running c.

```isabelle
theorem compile2_correct:
  "exec2 (compile2 e @ c) s stk = exec2 c s (eval2 e s # stk)"
  by (induction e arbitrary: c stk) auto
```

The induction hypotheses now speak about the code of a subexpression followed by anything, and in every
case that is exactly the shape the simplifier meets. In the case `Cond t a b`, the hypothesis for t is
used with the code that follows t, which starts with `JMPZ`. If the test is 0, the jump lands exactly at
the start of the code of b, followed by c, and the hypothesis for b applies; otherwise the hypothesis for
a applies, and `JMP` lands exactly at the start of c. The jumps never leave the code of the conditional,
except to its end, and the theorem never needs to say what a jump to anywhere else would do.

The form of Section 14.5 is the special case in which nothing follows, c = []:

```isabelle
corollary "exec2 (compile2 e) s stk = eval2 e s # stk"
  using compile2_correct [of e "[]"] by simp
```

::: keyidea
When a lemma about splitting programs fails, generalise over the context instead: state what a piece of
code does in front of any continuation. The proof then only ever looks at the code the compiler
produces, never at arbitrary splits. Exercise 14.6 proves the theorem of Section 14.5 in this form,
without `exec_append`.
:::

### Further directions {#directions}

- **More operators.** Multiplication needs one constructor, one instruction and one equation in each
  function; the proofs above go through unchanged, as `auto` handles the new case like `Add2`.
- **`let`.** An expression `let x = a in b` needs an instruction that stores a value into a variable.
  Then code changes the state as well as the stack, and the correctness theorem must say which variables
  the code may change. Storing the value of a in x itself, for instance, destroys the x that the
  surrounding expression may still need.
- **Loops.** With backward jumps a program can run for ever, so execution is no longer a total function.
  It becomes a relation between configurations of the machine (a program counter, a state and a stack),
  defined with `inductive` as in Modules 11 and 13, and the theorem says that the compiled code can run
  from the start to the end with the right result.
- **Other machines.** Exercise 14.7 makes the machine stop on a stack underflow, and Exercise 14.8
  compiles to a machine with registers instead of a stack.

## Looking back, looking ahead {#outlook}

This module used almost every part of the series. Here is where each piece came from.

| Module | What it contributed | Where it appeared here |
|---|---|---|
| 1 | `value`, `lemma`, Quickcheck; compilers in the trusted base | testing, Section 14.1 |
| 2–3 | Logic; free variables of a lemma are universally quantified | "for every e, s and stk" |
| 4 | Functions as values | the state, a function from names to values |
| 5 | Recursion and structural induction | `eval`, `exec`, `compile`, every proof |
| 6–7 | Proof rules, `rule`, schematic variables | `rule Add.IH(2)` with `?stk` |
| 8 | `datatype`, `fun`, lists, `export_code` | the language, the machine, the export |
| 9 | Simp rules, `simp only`, Quickcheck | `exec_append [simp]`, the tests |
| 10 | Isar: cases and calculations | the proof of `compile_correct` |
| 11 | `arbitrary:`, auxiliary lemmas, computation induction | the stack, `exec_append`, `fold_add.induct` |
| 12 | Specification against implementation | `eval` against `compile` and `exec` |
| 13 | State machines | the stack machine itself |

The series started with truth tables, which decide a formula by checking finitely many cases. Truth
tables cannot reach a statement about every expression: there are infinitely many. Proof can. Along the
way you learned to write such statements in logic, to prove them on paper with rules, and to let Isabelle
check every step. The compiler is small, but its proof has the structure of the proofs behind seL4 and
CompCert: a semantics for each language, a precise statement of what correct means, an induction that
follows the structure of the programs, and lemmas found by reading the goals where the proof stops.

Where to go from here:

- ***Concrete Semantics*** by Tobias Nipkow and Gerwin Klein (Springer, 2014; free to read at
  concrete-semantics.org) continues exactly where this module ends. Its first part is an Isabelle
  tutorial; its second part defines a small imperative language, IMP, with assignments and loops, and
  treats its semantics, a compiler for it, type systems, Hoare logic and program analysis, all in
  Isabelle.
- The **[Archive of Formal Proofs](https://www.isa-afp.org)** holds hundreds of checked Isabelle
  developments, among them verified compilers, algorithms and data structures. Reading a few entries is a
  good way to learn how experts structure large proofs.
- **seL4** and **CompCert** (Module 1) show what the methods of this series achieve at industrial scale.
  Their papers and web sites explain what was proved, what is trusted, and what the proofs cost.
- On this site, **[Isabelle for model verification](../isabelle/)** applies Isabelle to an engineering
  model: a small model of a lid, an operation on it, an invariant, and a theorem that a translation
  between two representations preserves meaning, the same kind of theorem as `compile_correct`. It uses
  Isabelle2025-2.

Module 1 ended its first theory with three activities: compute with `value`, prove with `lemma`, refute
with Quickcheck. In this module you used all three on a real piece of software, a compiler, and the
result is a theorem about every program it will ever compile.

## What you learned {#summary}

- A compiler is correct when running its code agrees with the meaning of the source program. To state
  this you need both semantics as functions: here `eval` for expressions and `exec` for the stack
  machine. The statement is the equation `exec (compile e) s stk = eval e s # stk`.
- Abstract syntax is a datatype; a compositional semantics is a recursive function on it. A **state**
  maps variable names to values; `f(a := v)` updates a function.
- A **stack machine** takes its operands from the top of a stack. The compiler produces code in postfix
  order: the code of the operands, then the operator.
- Test first. `value` compares evaluation and execution on examples; Quickcheck finds the smallest
  counterexample to a wrong claim or a wrong compiler. Limit the search with `quickcheck [size = n]` when
  the claim has functions among its variables.
- The proof needs two ideas from Module 11: the auxiliary lemma `exec_append`, found from the stuck goal,
  and **generalisation over the stack**, with `arbitrary: stk`, because the code of the second operand
  runs on a stack that holds the value of the first.
- **Constant folding** is proved correct by computation induction; theorems about passes compose, so
  optimise-then-compile is correct with a one-line proof.
- `export_code` turns the verified functions into Haskell; the code generator and the Haskell compiler
  remain in the trusted base.
- With jumps, the lemma about appended code fails; generalising over the code that follows,
  `exec2 (compile2 e @ c) s stk = exec2 c s (eval2 e s # stk)`, repairs the proof.

## Exercises {#exercises}

:::: exercise Run the machine by hand {#ex-14-1} ★
Compile the expression `(x + 1) + y` by hand, that is, `Add (Add (Var ''x'') (Num 1)) (Var ''y'')`. Then
write down the stack after each instruction when the code runs in the state `s0` (x = 5, y = 7) on the
empty stack. How many numbers does the stack hold at most? Compare with the program of Figure 14.2, and
check your answers with `value`.

::: solution
The code is the code of `x + 1`, then the code of y, then `ADD`:

```isabelle
value "compile (Add (Add (Var ''x'') (Num 1)) (Var ''y''))"
```

```output
```

The stacks after the five instructions are `[5]`, `[1, 5]`, `[6]`, `[7, 6]` and `[13]`:

```isabelle
value "exec (compile (Add (Add (Var ''x'') (Num 1)) (Var ''y''))) s0 []"
```

```output
```

The stack holds at most two numbers. The code for `x + (2 + y)` in Figure 14.2 needs three, because the
second operand of its outer addition is itself an addition, whose operands go on top of the value of x.
When the nesting is on the left, each partial sum is finished before the next operand is pushed.
:::
::::

:::: exercise Which claims hold? {#ex-14-2} ★
Decide for each claim whether it is true for every e, s and stk. Test each with Quickcheck, and prove the
true ones with `simp` and the theorems of Section 14.5.

1. `exec (compile e) s stk = [eval e s]`
2. `length (exec (compile e) s stk) = length stk + 1`
3. `exec (compile e @ compile e) s stk = eval e s # eval e s # stk`
4. `exec (compile e @ [ADD]) s [] = [eval e s]`

::: solution
1. **False**, as Section 14.4.3 showed: when stk is not empty, its numbers stay below the value.
2. **True**: the code pushes exactly one number.

   ```isabelle
   lemma "length (exec (compile e) s stk) = length stk + 1"
     by (simp add: compile_correct)
   ```

3. **True**: by `exec_append`, the second copy of the code runs on the stack that the first copy left.

   ```isabelle
   lemma "exec (compile e @ compile e) s stk = eval e s # eval e s # stk"
     by (simp add: compile_correct)
   ```

4. **True**, for a curious reason: on the empty stack, the code leaves a single number, and the extra
   `ADD` finds too few numbers and leaves the stack as it is (the fourth equation of `exec1`).

   ```isabelle
   lemma "exec (compile e @ [ADD]) s [] = [eval e s]"
     by (simp add: compile_correct)
   ```

   On a non-empty stack the claim is false: `ADD` then adds the value to the number below it.
:::
::::

:::: exercise Optimised code is never longer {#ex-14-3} ★★
Prove that constant folding never makes the code longer:
`length (compile (cfold e)) ≤ length (compile e)`. Start with an auxiliary lemma about `fold_add`,
proved by computation induction like `eval_fold_add`, and then prove the theorem by induction on e, in
Isar if you like.

::: solution
The code of `fold_add a b` is never longer than the code of a, then b, then one `ADD`:

```isabelle
lemma length_fold_add:
  "length (compile (fold_add a b)) ≤ length (compile a) + length (compile b) + 1"
  by (induction a b rule: fold_add.induct) auto
```

In the case `Add a b` the lemma applies to `cfold a` and `cfold b`, and the induction hypotheses bound
their code:

```isabelle
theorem cfold_shorter: "length (compile (cfold e)) ≤ length (compile e)"
proof (induction e)
  case (Add a b)
  have "length (compile (cfold (Add a b)))
        ≤ length (compile (cfold a)) + length (compile (cfold b)) + 1"
    using length_fold_add by simp
  also have "… ≤ length (compile (Add a b))"
    using Add.IH by simp
  finally show ?case .
qed simp_all
```

`qed simp_all` proves the cases `Num` and `Var`, which the Isar text does not mention, by `simp`.
:::
::::

:::: exercise A wrong optimisation {#ex-14-4} ★★
A colleague suggests a shorter `fold_add` that drops every number added on the right:

```isabelle
fun fold_add_bad :: "expr ⇒ expr ⇒ expr" where
  "fold_add_bad (Num m) (Num n) = Num (m + n)"
| "fold_add_bad a (Num n) = a"
| "fold_add_bad a b = Add a b"
```

1. Use Quickcheck to show that it is wrong, and explain the counterexample.
2. Write `fold_add0`, a correct version of `fold_add` that also removes an addition of 0 on the
   **left**, and prove that it preserves the value.

::: solution
1. Quickcheck finds an expression that loses a number:

   ```isabelle
   lemma "eval (fold_add_bad a b) s = eval a s + eval b s"
     quickcheck
     oops
   ```

   ```output result
   ```

   The colleague's second equation is right only for `Num 0`: any other number on the right is lost.
2. Test for 0 on either side; the proof is the same as for `fold_add`:

   ```isabelle
   fun fold_add0 :: "expr ⇒ expr ⇒ expr" where
     "fold_add0 (Num m) (Num n) = Num (m + n)"
   | "fold_add0 a b = (if a = Num 0 then b else if b = Num 0 then a else Add a b)"

   lemma "eval (fold_add0 a b) s = eval a s + eval b s"
     by (induction a b rule: fold_add0.induct) auto
   ```
:::
::::

:::: exercise Substitution {#ex-14-5} ★★
Define `subst :: "vname ⇒ int ⇒ expr ⇒ expr"` so that `subst x n e` replaces every occurrence of the
variable x in e by the number n. Check it with `value`, then prove

`eval (subst x n e) s = eval e (s(x := n))`

in words: substituting n for x gives the value that e has in a state where x is n. A compiler uses this
fact when it replaces a variable whose value it knows by that value.

::: solution
```isabelle
fun subst :: "vname ⇒ int ⇒ expr ⇒ expr" where
  "subst x n (Num m) = Num m"
| "subst x n (Var y) = (if y = x then Num n else Var y)"
| "subst x n (Add a b) = Add (subst x n a) (subst x n b)"

value "subst ''x'' 3 (Add (Var ''x'') (Add (Var ''y'') (Var ''x'')))"
```

```output
```

```isabelle
lemma eval_subst: "eval (subst x n e) s = eval e (s(x := n))"
  by (induction e) auto
```

In the case `Var y`, the simplifier splits the `if`: if y = x, both sides are n; otherwise both are
`s y`. No variable needs to be arbitrary, because x, n and s stay the same in the recursive calls.
:::
::::

:::: exercise Correctness without the append lemma {#ex-14-6} ★★★
Section 14.8 proved the extended compiler correct in a form with a continuation c, the code that
follows. Prove the theorem for the original compiler in the same form,

`exec (compile e @ c) s stk = exec c s (eval e s # stk)`,

by induction on e, **without** using `exec_append`. Then derive `exec (compile e) s stk = eval e s # stk`
from it. Which variables must be arbitrary, and why?

::: solution
Both c and stk must be arbitrary: in the case `Add a b`, the hypothesis for a is used with the
continuation `compile b @ ADD # c`, and the hypothesis for b with the stack `eval a s # stk`. Since
`exec_append` is a simp rule, remove it with `simp del:` (Module 9), or the simplifier would split the
program before the hypotheses can be used:

```isabelle
lemma compile_cont: "exec (compile e @ c) s stk = exec c s (eval e s # stk)"
  by (induction e arbitrary: c stk) (auto simp del: exec_append)
```

In the case `Add a b`, the simplifier reassociates `(compile a @ compile b @ [ADD]) @ c` to
`compile a @ (compile b @ ADD # c)` and then applies the two hypotheses and the equation of `exec` for
`ADD`. The original theorem is the instance c = []:

```isabelle
lemma "exec (compile e) s stk = eval e s # stk"
  using compile_cont [of e "[]"] by simp
```

This form needs no lemma about arbitrary splits of programs, which is why it still works with jumps.
:::
::::

:::: exercise A machine that can fail {#ex-14-7} ★★★
A real stack machine stops with an error on a stack underflow. Model this with an option type (Module
8): `exec1_opt` returns `None` when `ADD` finds fewer than two numbers, and `exec_opt` stops at the first
`None`. Define both, check with `value` that `[PUSH 1, ADD]` fails on the empty stack, and prove that
compiled code never fails:

`exec_opt (compile e) s stk = Some (eval e s # stk)`.

Hint: prove the form with a continuation from Exercise 14.6 first.

::: solution
```isabelle
fun exec1_opt :: "instr ⇒ state ⇒ stack ⇒ stack option" where
  "exec1_opt (PUSH n) s stk = Some (n # stk)"
| "exec1_opt (LOAD x) s stk = Some (s x # stk)"
| "exec1_opt ADD s (j # i # stk) = Some ((i + j) # stk)"
| "exec1_opt ADD s stk = None"

fun exec_opt :: "instr list ⇒ state ⇒ stack ⇒ stack option" where
  "exec_opt [] s stk = Some stk"
| "exec_opt (i # c) s stk =
     (case exec1_opt i s stk of None ⇒ None | Some stk' ⇒ exec_opt c s stk')"

value "(exec_opt [PUSH 1, ADD] s0 [], exec_opt (compile sample) s0 [])"
```

```output
```

With a continuation, the proof is the same as in Exercise 14.6. In the case `Add a b` the simplifier
meets `exec1_opt ADD s (eval b s # eval a s # stk)`, which is `Some …`, so the `case` disappears:

```isabelle
lemma exec_opt_cont: "exec_opt (compile e @ c) s stk = exec_opt c s (eval e s # stk)"
  by (induction e arbitrary: c stk) auto

theorem exec_opt_compile: "exec_opt (compile e) s stk = Some (eval e s # stk)"
  using exec_opt_cont [of e "[]"] by simp
```

The theorem is stronger than `compile_correct`: it also says that compiled code never underflows, on
any stack.
:::
::::

:::: exercise A register machine {#ex-14-8} ★★★
Instead of a stack, a register machine has numbered registers, modelled as a function `nat ⇒ int`, and
instructions that name the registers they use:

```isabelle
datatype rinstr = LDI nat int | LDV nat vname | ADDR nat nat

type_synonym regs = "nat ⇒ int"
```

`LDI r n` loads the number n into register r, `LDV r x` loads the value of the variable x, and `ADDR r q`
adds register q to register r. Define `rexec1` and `rexec` like `exec1` and `exec`, and a compiler
`rcompile :: "expr ⇒ nat ⇒ rinstr list"` such that `rcompile e r` leaves the value of e in register r and
uses only registers r, r + 1, … as scratch space. Prove that it is correct: the value ends up in register
r, and the registers below r keep their contents.

::: solution
```isabelle
fun rexec1 :: "rinstr ⇒ state ⇒ regs ⇒ regs" where
  "rexec1 (LDI r n) s rs = rs(r := n)"
| "rexec1 (LDV r x) s rs = rs(r := s x)"
| "rexec1 (ADDR r q) s rs = rs(r := rs r + rs q)"

fun rexec :: "rinstr list ⇒ state ⇒ regs ⇒ regs" where
  "rexec [] s rs = rs"
| "rexec (i # c) s rs = rexec c s (rexec1 i s rs)"

lemma rexec_append [simp]: "rexec (c1 @ c2) s rs = rexec c2 s (rexec c1 s rs)"
  by (induction c1 arbitrary: rs) auto

fun rcompile :: "expr ⇒ nat ⇒ rinstr list" where
  "rcompile (Num n) r = [LDI r n]"
| "rcompile (Var x) r = [LDV r x]"
| "rcompile (Add a b) r = rcompile a r @ rcompile b (r + 1) @ [ADDR r (r + 1)]"

value "rcompile sample 0"
```

```output
```

The register number plays the part of the stack height: the code for b works one register higher, so
that it cannot overwrite the value of a in register r. The claim must say both things at once, because
the case `Add` needs both from its hypotheses: the value of a is still in register r after the code of b
has run only because that code leaves the registers below r + 1 alone. Both r and the register contents
change between the recursive calls, so both are arbitrary:

```isabelle
theorem rcompile_correct:
  "rexec (rcompile e r) s rs r = eval e s ∧ (∀q < r. rexec (rcompile e r) s rs q = rs q)"
  by (induction e arbitrary: r rs) auto
```

Proving only the first half fails, in the same way as an induction without `arbitrary:`: the hypothesis
is too weak (Module 11's strengthening of the claim).
:::
::::

## Check yourself {#quiz}

```quiz
? What does the theorem `compile_correct` say?
- [ ] The compiler terminates on every expression
- [x] For every expression, state and stack, running the compiled code puts the expression's value on top of the stack and leaves the rest unchanged
- [ ] Running the compiled code on the empty stack gives a stack with one element
- [ ] `eval` and `exec` are the same function
> The statement is `exec (compile e) s stk = eval e s # stk` for all e, s and stk. The empty-stack version is a special case.

? Why does the proof of `compile_correct` need `arbitrary: stk`?
- [ ] Because `eval` changes the state in its recursive calls
- [ ] Because `stk` is a list
- [ ] Because the claim is false for the empty stack
- [x] Because in the case `Add a b` the hypothesis for b is needed with the stack `eval a s # stk`, not with stk
> The code of b runs on top of the value of a. Without `arbitrary`, the hypothesis is about the fixed stk only.

? What is `compile (Add (Num 1) (Var ''x''))`?
- [ ] `[ADD, PUSH 1, LOAD ''x'']`
- [ ] `[PUSH 1, ADD, LOAD ''x'']`
- [x] `[PUSH 1, LOAD ''x'', ADD]`
- [ ] `[LOAD ''x'', PUSH 1, ADD]`
> Postfix order: the code of the left operand, then the code of the right one, then the operator.

? `quickcheck [size = 3]` finds no counterexample to a claim. What do you know?
- [ ] The claim is a theorem
- [ ] The claim is false for some value larger than 3
- [x] The claim holds for every value up to size 3 that Quickcheck tried; it may still be false
- [ ] Quickcheck ran out of time
> Testing is evidence, not proof. Only a proof covers every expression.

? For the machine with jumps, the lemma `exec2 (c1 @ c2) s stk = exec2 c2 s (exec2 c1 s stk)` is false. Why?
- [ ] Because `SUB` is not commutative
- [x] Because a jump in c1 can skip instructions of c2 when the two run as one program
- [ ] Because `exec2` does not terminate
- [ ] Because `drop` is not defined for long lists
> Running c1 alone, a jump at its end skips nothing. The repair is to state correctness for the compiled code followed by any continuation c.

? After `export_code`, which of these must you still trust when you run the Haskell compiler?
- [ ] The proof of `compile_correct`
- [ ] The simplifier that proved the lemmas
- [ ] Quickcheck
- [x] Isabelle's code generator and the Haskell compiler
> The proofs are checked by Isabelle's kernel. The translation to Haskell and its compilation are outside the kernel, so they are part of the trusted base.
```
