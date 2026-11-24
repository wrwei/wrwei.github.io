---
title: Formal Methods with Isabelle
lead: From logic and discrete mathematics to machine-checked proof. Learn the mathematics that formal methods rest on, then prove programs and system models correct in Isabelle/HOL, with every proof checked by Isabelle2026.
---

## Who this series is for {#who}

You can program a little in some language and remember school algebra. You have not studied logic or
proof, and you have never used a proof assistant. You may be a student of computer science or software
engineering, or an engineer who wants to verify designs rather than only test them. The series assumes
nothing else and explains every idea on paper before Isabelle checks it.

## What you will be able to do {#outcomes}

- Write precise specifications in propositional and predicate logic, and reason with sets, relations,
  functions and induction.
- Explain what a proof is, build natural-deduction proofs by hand, and replay them in Isabelle.
- Define functions and data types in Isabelle/HOL, and prove properties about them with automation,
  structured Isar proofs and induction.
- Verify functional programs against their specifications, model systems as state machines and prove
  their invariants, and prove a small compiler correct.

## How it works {#how}

Fourteen modules in four parts, about 50 hours in all. Each module has worked examples, exercises at
three levels with full solutions, and a short quiz. Every Isabelle output on these pages, including
every error message, was produced by Isabelle2026 from the text shown, and every proof, including the
exercise solutions, is checked by Isabelle. Start with Module 1, which also installs Isabelle.

<!-- modules -->

## Applied project {#model-verification}

[Isabelle for model verification](model-verification/index.html) builds on
[Module 13](module_13_EN.html#invariants) and [Module 14](module_14_EN.html#proof). Use a small lid model
to write a guard, prove an invariant and check that a translation preserves meaning. The project
includes an interactive guard explorer, eight worked exercises and an Isabelle2025-2 theory download.

## Reference and downloads {#reference}

The **cheat sheet** collects symbols, commands, proof methods and rules; **troubleshooting** explains
Isabelle's common messages with their causes and fixes; the **glossary** defines every term, with its
Chinese equivalent. All the Isabelle theories of the series and the checked exercise solutions are in
one download, [formal-methods-theories.zip](formal-methods-theories.zip).

## Going further {#further}

Isabelle comes with its own documentation (the Documentation panel in Isabelle/jEdit). *Programming and
Proving in Isabelle/HOL* by Tobias Nipkow is the official tutorial; the book *Concrete Semantics* by
Tobias Nipkow and Gerwin Klein continues it with the semantics of programming languages. The
[Archive of Formal Proofs](https://www.isa-afp.org) holds hundreds of checked Isabelle developments. On
this site, [Mathematical Foundations](../math/index.html) gives more practice in the mathematics of
Part I.
