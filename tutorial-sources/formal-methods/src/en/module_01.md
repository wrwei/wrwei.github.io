---
title: Formal methods, what and why
part: 1
lead: What formal methods can establish about software, how specifications and proofs work together, where Isabelle fits among the other methods, and how to write your first theory in Isabelle/HOL.
minutes: 150
needs: Some programming in any language. No logic or proof yet.
goals:
  - Explain what a formal specification and a formal proof are, and when they are worth the effort
  - Tell testing, model checking, SAT and SMT solving, and interactive theorem proving apart
  - Say why you can trust a theorem that a proof assistant has checked
  - Install Isabelle2026 and find your way round Isabelle/jEdit
  - Write a first theory that computes values, proves a lemma and finds a counterexample
imports: Main
---

## When software must not fail {#why}

Some software bugs are a nuisance: an app crashes, you restart it, you lose a few minutes. Other software,
though, flies aircraft, doses radiation, runs trains, moves money or guards secrets. There a bug can cost
lives or a fortune, and finding it after the fact is too late. Three well-documented failures show what is
at stake.

- **Ariane 5, 1996.** Less than a minute after its first launch, the rocket veered off course and broke
  up. Software in its inertial reference system, reused from Ariane 4, converted a 64-bit floating-point
  number to a 16-bit signed integer. Ariane 5's different trajectory produced a value outside the range
  assumed by that software. The conversion failed, shutting down both the main and backup reference
  units, which ran the same software.
- **Therac-25, 1985–1987.** A radiation therapy machine gave massive overdoses to six patients, at least
  three of whom died. Among the causes was a race condition in the control software: an operator who
  edited the treatment settings quickly could leave the machine in a lethal configuration that earlier
  models had blocked with hardware interlocks.
- **Pentium FDIV, 1994.** Intel's new processor divided some numbers wrongly because a few entries were
  missing from a table in its division circuit. Intel recorded a 475-million-dollar charge for chip
  replacement and write-offs. Arithmetic circuits are one application of formal verification.

In each case the system had been tested, and testing missed the bug. Edsger Dijkstra put the reason in one
sentence in *Notes on Structured Programming*: *"Program testing can be used to show the presence of
bugs, but never to show their absence."* This is the limitation of testing selected cases: passing those
tests does not establish correctness on the cases you did not try.

A little arithmetic shows why. A function that takes two 64-bit integers has $2^{128}$, about
$3.4 \times 10^{38}$, possible inputs. Testing a billion of them every second, you would need about
$10^{22}$ years to try them all, nearly a trillion times the age of the universe. Exhaustive testing is
possible for some small, finite problems, but it is impractical for this one. For programs whose
behaviour depends on stored state, timing or interactions with other programs, there is more to cover
than the input values alone.

Formal methods offer another kind of evidence: describe the required behaviour mathematically, then
check a claim against that description. A **proof** can establish a property for every input covered by
its assumptions. A model checker can explore all the reachable states of a finite model. These methods
complement testing, and they work at industrial scale.

- **seL4** is an operating-system microkernel whose C code was proved, in 2009, to implement its
  specification, with a machine-checked proof in **Isabelle/HOL**, the system this series teaches. It was
  the first general-purpose kernel with such a proof.
- **CompCert** is a C compiler proved correct in the proof assistant Rocq (formerly Coq). In 2011,
  researchers tested C compilers with randomly generated programs and found many bugs that made GCC and
  LLVM produce wrong code, but none in the verified parts of CompCert. They did find bugs in its
  unverified parts: the scope of the proof matters.
- **Amazon Web Services** engineers have written specifications in the language TLA+ since 2011, for
  systems such as S3 and DynamoDB, and checked them with a model checker. It found subtle design bugs; one
  needed a 35-step sequence of events to show.
- **Paris Métro line 14** has run without drivers since it opened in 1998. Its safety-critical software
  was developed and proved with the B method.

Formal methods cost time and expertise. They are especially useful when failures are costly or when
interactions are difficult to test: avionics, railways, medical devices, processors, operating-system
kernels, compilers and cryptographic protocols. Their use also appears in assurance guidance: DO-333 is
the formal-methods supplement to the avionics software guidance DO-178C. Choosing a method still depends
on the particular system and the property you need to establish.

## What makes a method formal {#formal}

Everyday language often leaves details to context. Take a requirement from a school's software:
*"Sort the list of scores before printing it."* Should the highest score come first or the lowest?
Suppose we agree on lowest first, with repeated scores retained. For input `[80, 55, 80]`, the expected
output is `[55, 80, 80]`.

Now imagine checking only that the output is in order. `[55, 80]` would pass that check, despite losing
a score; even the empty list would pass, because it has no out-of-order pair. The requirement to sort
the original list already implies keeping its contents. Our check must express that requirement too.

A formal method makes such requirements explicit using:

1. **A formal language** with a precise grammar that determines how expressions are structured.
2. **A semantics**, a mathematical account of what those expressions mean and when statements are true.
3. **A rigorous checking method**, such as proof using explicit inference rules, or exhaustive
   exploration of a finite model. In a **proof system**, inference rules specify which conclusions may
   be drawn from which premises.

::: definition Formal method
A **formal method** is a way of specifying or verifying a system in a language with a precise
mathematical meaning, so that claims about the system can be checked by calculation or proof, often by
a computer.
:::

Let $xs$ name the input list and $ys$ the output list. We can express our chosen requirement as two
conditions that must both hold:

$$
\mathit{sorted}(ys) \;\land\; \mathit{mset}(ys) = \mathit{mset}(xs)
$$

Read it as "*ys* is in ascending order, **and** every score occurs the same number of times in *ys* as in
*xs*". Here, $\mathit{sorted}(ys)$ means that the scores never decrease: equal scores are allowed.
The symbol $\land$ means "and". A **multiset** records which elements occur and how many times each
occurs, while ignoring their order; $\mathit{mset}$ turns a list into its multiset. Thus `[80, 55, 80]`
and `[55, 80, 80]` have the same multiset, but `[55, 80]` does not.

The first condition checks the order; the second rules out losing, adding or duplicating scores.
These conditions describe a returned result. To verify a sorting function, we must establish them for
every permitted input and establish that the function returns. Writing the formula makes our choices
explicit; it does not choose the requirements for us or prevent us from omitting one. Modules 2 and 3
introduce logical notation in detail, and Module 12 verifies a sorting function against these conditions.

::: definition Specification
A **specification** describes the behaviour required of a system. A **formal specification** does so
in a language with a precise mathematical meaning. It can leave implementation choices open: our
sorting specification says what result is required without choosing a sorting algorithm.
:::

::: definition Verification and validation
**Verification** shows that an implementation meets its specification. **Validation** checks that the
specification describes what is actually wanted. Barry Boehm's summary: verification asks "are we
building the product right?", validation asks "are we building the right product?".
:::

::: figure id=fig-01-1
Formal methods sit between a requirement and a program. Validation connects the requirement to the
specification; verification connects the specification to the implementation.
:::

::: keyidea
A passing test establishes what happened in that test case. A proof of a general claim can cover every
input satisfying its assumptions. The claim still needs to express the intended behaviour: a proof
of sortedness alone would not catch lost scores. Validation still matters.
:::

::: pitfall
When someone says "verified", ask which property was proved and under which assumptions. A proof about
source code may rely on a model of the programming language, correct compilation, and assumptions about
the hardware and environment. Checking the proof also relies on a **trusted computing base**: the
software and hardware whose correct operation is needed for the check to be reliable. Keep these two
questions in view: is the proof valid, and does its claim apply to the running system?
:::

## A map of formal methods {#landscape}

Formal methods are a family. They differ in how much they can express, how much they do automatically,
and what they give you back. Testing provides a useful comparison and complements formal verification.

| Method | You provide | What it checks and returns | Limits | Examples |
|---|---|---|---|---|
| Testing | Inputs and expected results or properties | Runs the program; reports failures on the cases tried | Untested cases remain; exhaustive testing is often impractical | Unit tests; property-based testing (QuickCheck, Hypothesis) |
| Model checking | A model of the system and a property | For finite-state checking, explores reachable states; reports that the property holds or gives a counterexample trace | Too many states can exhaust time or memory; a finite model may cover only selected system sizes | SPIN, NuSMV, TLC for TLA+, UPPAAL |
| SAT solving | A formula built from Boolean variables and logical connectives | Finds a truth assignment making the formula true, or establishes that none exists | Decidable, but large instances can be too expensive to solve | MiniSat, CaDiCaL |
| SMT solving | A logical formula using theories such as arithmetic, arrays or bit vectors | Searches for values making the formula true, or establishes that none exist | Some supported fragments are decidable; others are not. A solver may report "unknown" or reach a resource limit | Z3, cvc5 |
| Interactive theorem proving | Definitions, claims and proof instructions | Checks a proof of the stated claim, which may cover infinitely many cases | Expressive claims often need human guidance; finding a proof is not guaranteed | Isabelle, Rocq, Lean, HOL4, ACL2 |

Calling SAT **decidable** means that an algorithm can always finish with the correct yes-or-no answer;
it does not promise a practical running time. **Undecidable** means that no algorithm can do this for
every instance. To read the solver rows, **satisfiable** means that some choice of values makes the
formula true;
**unsatisfiable** means that no such choice exists. One verification technique is to ask a solver for an
input on which an implementation violates its specification. A satisfying assignment then describes a
counterexample; unsatisfiability rules out counterexamples within the encoded model.

Two things follow from the table. First, expressiveness and automation involve trade-offs. SAT solving
is automatic and decidable, but that does not mean every instance finishes quickly. A theorem prover
can express a compiler-correctness claim for programs of any size, but may need your guidance to prove
it. Second, the methods combine. Program verifiers such as Dafny, and Frama-C's WP plug-in, generate
proof obligations that can be sent to SMT solvers.
And Isabelle, as you will see, includes a tester (**Quickcheck**), a counterexample finder (**Nitpick**,
which uses a SAT solver) and a bridge to automatic provers and SMT solvers (**Sledgehammer**, which calls
Z3, cvc5 and others). The proofs that Sledgehammer finds are checked by the same small kernel as every
other proof (Section 1.4).

::: note
There is no algorithm that always decides whether an arbitrary program halts on an arbitrary input:
this is the **halting problem**, shown undecidable by Alan Turing. Expressive verification problems can
encode this problem, so there cannot be a verifier that always settles every such problem correctly.
That does not stop automatic tools from solving many useful cases. Human guidance can help with a
particular proof, but it does not remove the general limit. Module 3 returns to decidability.
:::

## Proof assistants and why you can trust them {#trust}

A **proof assistant**, or interactive theorem prover, is a program that checks proofs written in a
formal logic and helps you find them. Think of a colleague who reads every line of your proof, never
tires and never lets a gap pass, together with a team of helpers who can fill in routine steps.

But a proof assistant is itself a large program. Why trust its proof checking? One answer is an
architecture developed by Robin Milner and colleagues in
the 1970s for the Edinburgh LCF system (Logic for Computable Functions), and used by Isabelle and many
other provers.

::: definition The LCF approach
In an **LCF-style** prover, theorems are values of an abstract type, `thm`. Proof tools cannot construct
these values directly. They must use the operations provided by a **kernel**, which implements the
inference rules and keeps track of the assumptions on which theorems depend.
:::

::: figure id=fig-01-2
The LCF architecture. Proof tools construct theorems through the kernel's operations. The guarantee
depends on sound rules and assumptions, as well as a correctly operating implementation.
:::

For ordinary proofs built through these operations, a bug in a proof-search tool may make a proof fail
or take forever, but it cannot bypass the kernel's inference rules. This concentrates logical checking
in a much smaller part of the system. It does not mean that literally only the kernel must work: the
logic's axioms, the ML runtime, and the hardware also matter. Milner and colleagues developed ML
("Meta Language") for writing proof tools; Isabelle uses ML and Scala.

Isabelle also permits explicit axioms, admitted proofs (`sorry`), and **oracles**, interfaces that accept
results without deriving them through the ordinary inference rules. Those introduce additional trust;
the LCF architecture does not make their claims true. The proofs in this series use the standard
logic and library, without adding axioms or using admitted steps or external oracle proof methods.
In particular,
Sledgehammer's external results must be reconstructed as Isabelle proofs before they count as theorems.

**Isabelle** was begun by Lawrence Paulson at the University of Cambridge in 1986 as a *generic* proof
assistant: a framework in which many logics can be defined. Tobias Nipkow and his group at the Technical
University of Munich developed **Isabelle/HOL**, the logic almost everyone uses, and Makarius Wenzel
created the Isar proof language and the Isabelle/jEdit prover IDE. HOL stands for **higher-order logic**:
a typed logic in which functions can be arguments to other functions and variables can range over
functions. It supports both mathematical statements and functional program definitions. This series
uses Isabelle/HOL throughout; "Isabelle" below means Isabelle/HOL.

Isabelle/HOL has been used for the seL4 proof, for part of the proof of the Kepler conjecture (with HOL
Light), and for hundreds of developments in the **Archive of Formal Proofs**, an online library of
checked Isabelle proofs. Other proof assistants you may meet are Rocq (formerly Coq), Lean, HOL4 and
ACL2. They differ in their logics and styles, but the ideas in this series carry over.

## Install Isabelle2026 {#install}

This series uses Isabelle2026, released in October 2026. The application bundle includes the
Isabelle/jEdit editor, Java, the prebuilt HOL logic, the automatic provers and the manuals. You do not
need a separate Java installation or a LaTeX installation to follow this series. Isabelle's home page
asks for 4 GB of memory and 2 processor cores for small experiments, and 8 GB and 4 cores for medium-sized applications; this series stays small.

Download the bundle for your system from the [Isabelle home page](https://isabelle.in.tum.de/), then
follow the steps below. The [official installation instructions](https://isabelle.in.tum.de/installation.html)
give platform requirements and further troubleshooting advice.

:::: tabs
::: tab Windows
1. Download **Isabelle2026.exe** (for Windows 10 or 11) and run it. It is a self-extracting archive: choose
   a folder to unpack into, for example your home folder.
2. Isabelle is not signed by a registered developer, so Windows rejects it at first. If a blue window
   says "Windows protected your PC", click **More info**, then **Run anyway**.
3. The installer starts Isabelle/jEdit when it has finished and creates a desktop shortcut. Use the
   shortcut from now on.
:::
::: tab macOS
1. Download the bundle for your Mac: **macOS (ARM)** for Apple silicon (M1 and later), **macOS (Intel)**
   otherwise. Unpack it if your browser has not done so, and move **Isabelle2026.app** into the
   **Applications** folder.
2. Isabelle is not signed by a registered developer, so macOS blocks it at first. Open Isabelle2026.app
   and click **Cancel** in the security dialog.
3. Open **System Settings → Privacy & Security**. Near the bottom, a message says Isabelle2026 was
   blocked; click **Open Anyway** and confirm. From now on Isabelle starts like any other application.
:::
::: tab Linux
1. Download **Isabelle2026_linux.tar.gz** (or the Linux (ARM) bundle on an ARM computer) and unpack it
   wherever you like:

   ```terminal
   $ tar -xzf Isabelle2026_linux.tar.gz
   ```

2. Start Isabelle/jEdit:

   ```terminal
   $ Isabelle2026/Isabelle2026
   ```

   You need a graphical desktop. The command-line tools are in `Isabelle2026/bin/isabelle`; this series
   does not need them.
:::
::::

On the first start Isabelle/jEdit opens a scratch theory called `Scratch.thy` in your home folder.
Wait until the **Theories** panel on the right says **Prover: ready**: Isabelle has then loaded HOL and is
ready to check what you type.

::: trouble
- **Windows: Sledgehammer or `smt` reports that a prover failed to run.** Windows Defender can block
  Isabelle's external provers. Isabelle's installation page recommends excluding the whole Isabelle
  folder in **Virus & threat protection**. Follow the official installation advice if you encounter
  this problem; neither tool is needed for the examples in this module.
- **macOS: there is no Open Anyway button.** It appears only after you have tried to open the
  application once. Open Isabelle2026.app again, click Cancel, and look again in Privacy & Security.
- **Isabelle is very slow, or stops with an out-of-memory message.** Close other large programs.
  Isabelle needs the memory stated above.
:::

## A tour of Isabelle/jEdit {#tour}

Isabelle/jEdit, the window you now have open, is a **prover IDE**: an editor in which Isabelle checks your
text continuously, as you type. There is no "run" button. Figure 1.3 shows the window with the theory you
are about to write.

::: figure id=fig-01-3 image=jedit-overview.png alt="The Isabelle/jEdit window with a theory in the editor, the Output panel open below it, the Theories panel on the right and the Documentation panel on the left. Numbered marks 1 to 5 label these parts."
Isabelle/jEdit, Isabelle2026 on Linux. The same editor and panels are available on Windows and macOS;
their appearance and keyboard shortcuts can differ.
:::

1. **The text area**, where you write a theory. Commands are coloured by kind, and the gutter on the left
   shows icons for messages: a blue **i** for information, a red **!** for an error.
2. **The Output panel** shows the messages of the command at the cursor. It is closed at first: click the
   **Output** tab at the bottom of the window to open it.
3. **Proof state.** Tick this box once. Isabelle then shows, in the Output panel, what remains to be
   proved at the cursor. The setting is remembered for future sessions.
4. **The Theories panel** shows **Prover: ready** and the progress of each open theory.
5. **The Documentation panel** lists the manuals that come with Isabelle. The most useful is
   **prog-prove**, *Programming and Proving in Isabelle/HOL*, which Part III of this series follows.

A few habits help from the start. Hover the mouse over underlined text to see its message. Hold
<kbd>Ctrl</kbd> (<kbd>Cmd</kbd> on macOS) and hover over a name to see its type and definition; click to
jump there. And to type a mathematical symbol, type its abbreviation from the table below: Isabelle
replaces it with the symbol, either at once or through a small pop-up in which you press <kbd>Tab</kbd>.
You can also type a backslash and the symbol's name, such as `\forall`, or click the symbol in the
**Symbols** panel at the bottom.

| Symbol | Type | Meaning |
|---|---|---|
| ⇒ | `=>` | function type |
| ∧ | `/\` or `&` | and |
| ∨ | `\/` or <code>&#124;</code> | or |
| ¬ | `~` | not |
| ⟶ | `-->` | implies |
| ⟷ | `<-->` | if and only if |
| ∀ | `\forall` | for all |
| ∃ | `\exists` | there exists |
| ≠ | `~=` | not equal |
| ≤ | `<=` | less than or equal |

Copying works too: the Isabelle text on these pages uses the same Unicode symbols as Isabelle, so you can
copy a block with its **Copy** button and paste it into Isabelle/jEdit.

## Your first theory {#first}

Everything you write in Isabelle goes into a **theory**: a file of definitions, statements and proofs, like
a module in a programming language. You will now write one, step by step, and meet Isabelle's three basic
activities: computing, proving and refuting.

### Create the file {#first-file}

In Isabelle/jEdit, choose **File → New**, then **File → Save As…**. Make a folder for this series, for
example `isabelle` in your home folder, and save the file there as **`First.thy`**. Then type:

```isabelle norun
theory First
  imports Main
begin

end
```

`theory First` names the theory, and the name must match the file name: a theory `First` lives in
`First.thy`. `imports Main` makes the standard library available: numbers, lists, sets and thousands of
proved facts about them. Everything else goes between `begin` and `end`. The commands below go on new
lines before `end`.

::: trouble
If Isabelle underlines `First` and says

```text
Bad theory name "First" for file "Scratch.thy"⌂
```

the theory name and the file name differ. Save the file as `First.thy`, or change the name after
`theory` to match the file.
:::

### Compute {#first-compute}

Type this line:

```isabelle
value "2 + 3 :: nat"
```

Put the cursor on the line. The Output panel shows the result and its type:

```output
"5"
  :: "nat"
```

`value` evaluates a term. The text inside the quotation marks is in Isabelle's **inner syntax**, the
language of terms and types; commands such as `value` and `lemma` are **outer syntax** and stay outside the
quotes. `:: nat` is a **type annotation**: it fixes the type of `2 + 3` to the natural numbers,
0, 1, 2, … . Isabelle supports numerals and addition at several types. Without enough context to choose
one, this expression remains **polymorphic**, meaning that its type is still general, and `value` cannot
evaluate it as a concrete number. Other expressions can obtain their types from context without an
annotation.

Isabelle computes with more than numbers. `rev` reverses a list:

```isabelle
value "rev [1, 2, 3 :: nat]"
```

```output
"[3, 2, 1]"
  :: "nat list"
```

::: trouble
Leave out the type and Isabelle refuses:

```isabelle fails
value "2 + 2"
```

```output
*** Wellsortedness error:
*** Type 'a not of sort term_of
*** Cannot derive subsort relation numeral < term_of
```

The message is cryptic, but the cure is simple: add a type annotation such as `:: nat` or `:: int`. You
will learn to read messages like this one in Module 8.
:::

### Prove {#first-prove}

Now a claim about every list: reversing a list twice gives the list back. Type the statement:

```isabelle
lemma "rev (rev xs) = xs"
```

The variable `xs` is not defined anywhere. Isabelle treats it as standing for *any* list, so the lemma
claims the equation for every list. With **Proof state** ticked, the Output panel shows the **goal**, the
statement still to be proved:

```output state
proof (prove)
goal (1 subgoal):
 1. rev (rev xs) = xs
```

Now prove it. On the next line type:

```isabelle
  by simp
```

Once checking finishes without an error, the proof is accepted. `simp` is the **simplifier**, which
uses known equations and logical rules to simplify the goal. It succeeds here because the library contains
the fact that `rev (rev xs) = xs`. Isabelle/jEdit even tells you so: the blue **i** in the gutter next
to the lemma carries the message "Auto solve_direct: the current goal can be solved directly with
List.rev_rev_ident". Behind the scenes, `simp` built the theorem by calling the kernel's rules, as
Section 1.4 described.

### Define and prove {#first-define}

Now define a function of your own. `fun` defines a function by equations:

```isabelle
fun double :: "nat ⇒ nat" where
  "double n = n + n"
```

```output
consts
  double :: "nat ⇒ nat"

Found termination order: "{}"
```

`double :: "nat ⇒ nat"` declares that `double` takes a natural number and returns one; type `=>` to get
the ⇒ symbol. The equation after `where` says what `double` computes. Isabelle answers with the new
constant and its type, and reports that it found a termination order: for every function defined with
`fun`, Isabelle proves that the function terminates. Here there is no recursion, so the proof is trivial;
Modules 5 and 8 explain why termination matters. A definition that cannot pass the termination check
is not accepted by `fun` in this form. This is a mathematical termination result; it does not promise
that an actual machine has enough time or memory for every input. Now try the function:

```isabelle
value "double 21"
```

```output
"42"
  :: "nat"
```

A test, though, only shows one value. Here is a claim about every `n`, with its proof:

```isabelle
lemma "double n = 2 * n"
  by simp
```

The simplifier uses the defining equation of `double` (`fun` registers it automatically) and the laws of
arithmetic. Put the cursor on the lemma line to see the goal, as in Figure 1.4.

::: figure id=fig-01-4 image=jedit-state.png alt="The cursor is on the line lemma double n = 2 * n. The Proof state box in the Output panel is ticked, and the panel shows: proof (prove), goal (1 subgoal), 1. double n = 2 * n."
With **Proof state** ticked, the Output panel shows the goal at the cursor.
:::

### Refute {#first-refute}

What if a claim is false? Try one:

```isabelle
lemma "double n = n * n"
```

With the default settings, a blue **i** should appear next to the line after checking. Put the cursor on
the line (Figure 1.5): Isabelle/jEdit has tried the claim on small values automatically, with
**Quickcheck**, and found one where it fails. You can also run Quickcheck yourself, which is what the
theory files of this series do:

```isabelle
  quickcheck
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  n = 1
Evaluated terms:
  double n = 2
  n * n = 1
```

::: figure id=fig-01-5 image=jedit-counterexample.png alt="The cursor is on the line lemma double n = n * n. The Output panel shows: Auto Quickcheck found a counterexample: n = 1. Evaluated terms: double n = 2, n * n = 1."
By default, Isabelle/jEdit tries Quickcheck automatically on new lemmas. Here it reports `n = 1`:
`double 1` is 2, but `1 * 1` is 1.
:::

Notice that the claim holds for `n = 0` and for `n = 2`. A tester who tried only those two values would
have missed the error. The exhaustive Quickcheck tester used here tries small values systematically,
which is why it found `n = 1`. If it finds no counterexample within its search, the claim is still
unproved. Finding one counterexample is enough to refute a universal claim; failing to find one is
not enough to prove it.

The lemma is false over the natural numbers, so it has no sound proof from the standard assumptions.
Finish it with `oops`, which abandons a proof without recording the claim as a proved theorem:

```isabelle
  oops
```

What if you had tried `by simp` anyway? The proof fails, and Isabelle shows what it could not prove:

```isabelle fails
lemma "double n = n * n"
  by simp
```

```output
*** Failed to finish proof⌂:
*** goal (1 subgoal):
***  1. n + n = n * n
```

The simplifier unfolded `double`, but could not discharge the remaining goal. Here we know why:
`n + n = n * n` is false at `n = 1`. A failed `simp` attempt alone would not establish that the claim
is false; true claims can also need a different proof. Isabelle/jEdit
shows the failure in three ways: a red **!** in the gutter, a red underline under `by simp`, and the
message in the Output panel (Figure 1.6). The ⌂ in the message stands for the position the message is
about; in Isabelle/jEdit it is a link back to that place in the text. Replace `by simp` with `oops` and the
error goes away.

::: figure id=fig-01-6 image=jedit-error.png alt="The line by simp under lemma double n = n * n has a red background and a red error icon in the gutter. The Output panel shows: Failed to finish proof, goal (1 subgoal), 1. n + n = n * n, on a red background."
A failed proof. The error is attached to the command that failed, and the remaining goal is shown. The
line `theorem double ?n = ?n * ?n` above it does not mean the proof succeeded: Isabelle/jEdit checks
proofs in parallel and records a statement before its proof has finished. The red message is what counts.
:::

::: keyidea
You have now seen the three things you will do in Isabelle all through this series: **compute** with
`value`, **prove** with `lemma … by …`, and search for counterexamples with **Quickcheck**. A completed
proof of a general claim covers all the cases in that claim. A counterexample refutes it. The
`value` and Quickcheck results shown here are computed results, rather than kernel-checked proofs.
:::

Save the theory with **File → Save** (<kbd>Ctrl</kbd>+<kbd>S</kbd>, or <kbd>Cmd</kbd>+<kbd>S</kbd> on macOS).

## How this series works {#series}

The series has four parts:

| Part | Modules | What you learn |
|---|---|---|
| I. Foundations | 1–5 | Formal methods; propositional and predicate logic; sets, relations and functions; induction and recursion |
| II. Formal proof | 6–7 | What a proof is; natural deduction on paper and in Isabelle |
| III. Isabelle/HOL in practice | 8–11 | Functional programming in HOL; proof automation; structured proofs in Isar; induction in depth |
| IV. Verification | 12–14 | Verifying functional programs; modelling systems with state machines and invariants; a verified compiler |

Part I is mostly mathematics, done on paper first: each idea gets a definition, a worked example, and
then a **Check it in Isabelle** box where you compute examples, test claims or check proofs. Module 6
develops proof on paper; from Module 7 on, Isabelle takes the lead.
The [Mathematical Foundations](../math/index.html) series covers logic, sets and proof for computing in
general, with more practice; this series takes what formal methods need from those subjects and goes on
to machine-checked proof.

On every page:

- **Definition**, **Example** and **Fact** boxes are numbered, so that later modules can refer to them.
- Isabelle text is shown in Isabelle's own font, with a **Copy** button. Every output shown below a block
  was produced by Isabelle2026 from that text in the context of the preceding blocks. If your screen
  differs, check the text, earlier commands, Isabelle version and settings. Some messages, especially
  counterexamples and prover searches, can vary; an output marked **example run** illustrates one run.
  Blocks marked **fails on purpose** show an error deliberately.
- **Exercises** come at three levels: ★ check your understanding, ★★ apply what you learned, ★★★ stretch
  yourself. Every exercise has a full solution, folded away; try first, then look. The Isabelle in every
  solution has been checked by Isabelle.
- A short quiz at the end checks the main ideas.

All the Isabelle text of the series is also in one download,
[formal-methods-theories.zip](formal-methods-theories.zip): a theory `Module_NN.thy` for each module and
`Module_NN_Solutions.thy` with its exercise solutions. Unpack it and open any theory in Isabelle/jEdit
to replay a module.

Each module takes two to four hours with its exercises. Go in order: each module uses the ones before it.
If you are stuck, the troubleshooting page lists Isabelle's common messages with their causes, and
Isabelle's community answers questions on the isabelle-users mailing list and on Zulip chat.

## What you learned {#summary}

- Passing sampled tests does not rule out failures in untested cases. Exhaustive testing can cover
  small finite domains, but it is often impractical. Formal verification checks a stated property
  across the cases covered by a mathematical model and its assumptions.
- Formal methods use a **formal language**, a **semantics** and rigorous checking, for example a
  **proof system** or finite-state model exploration.
- A **specification** says what a system must do. **Verification** shows that an implementation meets its
  specification; **validation** checks that the specification is what is wanted.
- Testing, model checking, SAT and SMT solving and interactive theorem proving trade expressiveness
  against automation; Isabelle combines a theorem prover with automatic tools.
- In an **LCF-style** prover such as Isabelle, proof tools build theorems through the **kernel**.
  This protects ordinary proofs from proof-search bugs, assuming sound rules and assumptions and a
  correctly operating trusted computing base. Axioms, admissions and oracles need separate scrutiny.
- An Isabelle **theory** `T` lives in the file `T.thy` and declares which theories it imports; our
  first theory imports `Main`. Its body goes between `begin` and `end`. `value` computes,
  `lemma … by simp` attempts a proof, `quickcheck` searches for counterexamples, and `oops` abandons a
  proof. Neither a failed proof attempt nor a counterexample search with no result settles a claim.

## Exercises {#exercises}

:::: exercise Verification or validation? {#ex-1-1} ★
For each activity, say whether it is verification or validation, and why.

1. Showing the customer what the specification of a timetable system implies for next week's trains,
   and asking "is this what you meant?".
2. Proving in Isabelle that a sorting function always returns a sorted list with the same elements,
   each occurring the same number of times.
3. Discovering that "sort the scores" should have said "highest score first".
4. Running a model checker to show that no reachable state of a protocol design violates its safety
   property.

::: solution
1. **Validation**: it checks whether the specification describes what the customer wants.
2. **Verification**: it shows that the implementation meets its specification.
3. **Validation**: it corrects the specification itself.
4. **Verification**: it shows that a design meets a stated property. (The design is checked against the
   property. Whether the model represents the intended system and whether the property is the right
   one are validation questions.)
:::
::::

:::: exercise Which method? {#ex-1-2} ★
Which method from the table in Section 1.3 fits each task best?

1. Check that a 32-bit multiplier circuit agrees with a reference design on every pair of inputs.
2. Check a finite-state model of a cache protocol for three processors, with bounded storage and
   message queues, to show that two processors never have write permission for the same address at once.
3. Prove that a sorting function is correct for lists of every length.
4. Find bugs quickly in a parser by feeding it thousands of random inputs.

::: solution
1. **SAT or SMT solving** is a standard approach to this kind of **equivalence checking**. Ask whether
   any pair of fixed-size inputs makes the circuits disagree. An unsatisfiable result establishes
   agreement in the circuit model. Large multipliers can still be difficult solver instances.
2. **Model checking.** The stated bounds make this a finite-state problem. Checking one three-processor
   model does not by itself establish correctness for every number of processors.
3. **Interactive theorem proving** fits the unbounded list lengths. Induction is a standard way to
   prove such claims; Module 5 and Part III teach it. Some verification tools can automate particular
   inductive proofs too.
4. **Testing**, specifically random testing, or property-based testing if inputs are checked against
   stated properties. You need a way to recognise failures, such as crashes, rejected valid inputs or
   disagreement with a reference parser. Random inputs alone do not tell you whether an output is right.
:::
::::

:::: exercise How long would testing take? {#ex-1-3} ★
A function takes three 32-bit integers. How many different inputs does it have? How long would it take to
test them all at $10^9$ tests per second? Take a year to be about $3.15 \times 10^7$ seconds.

::: solution
There are $2^{32} \cdot 2^{32} \cdot 2^{32} = 2^{96} \approx 7.9 \times 10^{28}$ inputs. At $10^9$ per
second that takes about $7.9 \times 10^{19}$ seconds, which is
$7.9 \times 10^{19} / (3.15 \times 10^7) \approx 2.5 \times 10^{12}$ years: some 2.5 trillion years.
:::
::::

:::: exercise Triple {#ex-1-4} ★★
Add a function `triple :: "nat ⇒ nat"` to your theory, with `triple n = n + n + n`. Use `value` to compute
`triple 14`. Then prove two lemmas with `by simp`: `triple n = 3 * n`, and `triple n = double n + n`.

::: solution
```isabelle
fun triple :: "nat ⇒ nat" where
  "triple n = n + n + n"

value "triple 14"
```

```output
"42"
  :: "nat"
```

```isabelle
lemma "triple n = 3 * n"
  by simp

lemma "triple n = double n + n"
  by simp
```

Both proofs work because `simp` unfolds the definitions of `triple` and `double` and then does the
arithmetic.
:::
::::

:::: exercise A wrong law about lists {#ex-1-5} ★★
In Isabelle, `xs @ ys` appends two lists: `[1, 2] @ [3]` is `[1, 2, 3]`. Someone claims that
`rev (xs @ ys) = rev xs @ rev ys`. Use `quickcheck` to test the claim. Read the counterexample, work out
what the correct law must be, and prove it with `by simp`.

::: solution
```isabelle
lemma "rev (xs @ ys) = rev xs @ rev ys"
  quickcheck
  oops
```

```output result
Testing conjecture with Quickcheck-exhaustive...

Quickcheck found a counterexample:
  xs = [a⇩2]
  ys = [a⇩1]
Evaluated terms:
  rev (xs @ ys) = [a⇩1, a⇩2]
  rev xs @ rev ys = [a⇩2, a⇩1]
```

With one element in each list, `rev (xs @ ys)` puts `ys`'s element first, while `rev xs @ rev ys`
keeps the order. Reversing a joined list reverses the order of the parts too:

```isabelle
lemma "rev (xs @ ys) = rev ys @ rev xs"
  by simp
```

Quickcheck calls the elements a₁ and a₂: two different values of an unknown element type.
:::
::::

:::: exercise What is still trusted? {#ex-1-6} ★★★
Isabelle accepts your proof that a C function meets its specification. List at least four things that
could still make the function misbehave when it runs on a real computer.

::: solution
Any of these, among others:

1. The **specification** is wrong or incomplete: it does not say what is really wanted (a validation
   failure).
2. The **model of C** used in the proof differs from what the C standard or the compiler does, for
   example on integer overflow or memory layout.
3. The **compiler** has a bug and produces machine code that does not match the C code. A compiler
   correctness proof, as in CompCert, can reduce this concern within its scope; unverified front-end
   code, assembly and linking can still matter.
4. The **hardware** is faulty or behaves differently from its documentation.
5. The **assumptions** of the theorem do not hold in practice, for example that the caller passes a valid
   pointer, or that no other thread changes the data.
6. The **proof-checking infrastructure** is unsound or malfunctioning: for example, a kernel bug,
   inconsistent added axioms, an unjustified oracle result, or a runtime or hardware fault affecting
   the check. A small, scrutinised kernel reduces this risk; it does not eliminate it.
:::
::::

:::: exercise A buggy simplifier {#ex-1-7} ★★★
Suppose a bug in Isabelle's simplifier, outside the kernel, makes it try to rewrite `(0 :: nat)` to `1`
without a theorem justifying that rewrite. You try to prove the false statement `(0 :: nat) = 1` by
`simp`. Assume that the kernel, logic and runtime are sound and that no axioms or oracles are added.
Could the simplifier return an accepted proof of the statement? Explain why the LCF architecture matters.

::: solution
No. In an LCF-style prover the simplifier must construct a theorem of the original goal through the
kernel's operations. Replacing text in its own working data is not enough. A proof-producing rewrite
from `0` to `1` would need a theorem justifying that equality, which the sound rules cannot supply for
natural numbers under the stated assumptions.

The exact symptom depends on the bug: the simplifier could fail, raise an error, loop, or return an
irrelevant theorem. It cannot return a kernel theorem that proves the false original goal. Isabelle
also checks that the result of a proof method establishes the goal it was asked to prove. This is why
an error in proof search need not become an error in an accepted proof.
:::
::::

## Check yourself {#quiz}

```quiz
? A function has been formally verified against its specification. What does that guarantee?
- [ ] That the function has no bugs of any kind
- [x] That it meets the stated specification in its model for the cases covered by the proof, under its assumptions
- [ ] That it passes every test the customer will write
- [ ] That the specification says what the customer wants
> The guarantee has the scope of the proved claim and its assumptions, and relies on sound proof checking. Whether the specification and model describe the intended system is validation.

? What did Dijkstra say testing can and cannot do?
- [ ] It can show that bugs are absent, given enough tests
- [x] It can show that bugs are present, but never that they are absent
- [ ] It cannot find bugs that a proof would miss
- [ ] It is a formal method
> This is the warning about testing selected cases: passing them does not establish correctness on untested cases. Exhaustive testing is possible for some small finite domains, as Section 1.1 explains.

? Which activity is validation?
- [ ] Proving that an implementation meets its specification
- [ ] Model checking a protocol against its safety property
- [x] Reviewing the specification with its users to see whether it says what they need
- [ ] Running the kernel's inference rules
> Validation asks "are we building the right product?", so it checks the specification against what is wanted.

? Which component enforces the inference rules when Isabelle's proof tools construct an ordinary proof?
- [ ] The simplifier
- [ ] Sledgehammer and the automatic provers it calls
- [x] The kernel that implements the inference rules
- [ ] The editor
> Proof tools construct theorems through kernel operations. Trust also depends on the logic, assumptions and runtime; an axiom, admission or oracle is not made true by this architecture.

? Why does Isabelle need the annotation in `value "2 + 3 :: nat"`?
- [ ] `value` only works for natural numbers
- [x] In this expression, no other context fixes a concrete number type for evaluation
- [ ] Annotations make evaluation faster
- [ ] `nat` turns on the simplifier
> Numerals such as `2` exist in many types (natural numbers, integers, reals …). The annotation picks one; in other expressions, context may already determine the type.

? Quickcheck reports "found a counterexample: n = 1" for a lemma. What do you know?
- [ ] The lemma is true, but `simp` cannot prove it
- [ ] The lemma is true for `n = 1`
- [x] The lemma is false: for `n = 1` the statement does not hold
- [ ] Isabelle has a bug
> A counterexample is a value that makes the statement false, so no proof can succeed. Fix the statement, or abandon it with `oops`.
```
