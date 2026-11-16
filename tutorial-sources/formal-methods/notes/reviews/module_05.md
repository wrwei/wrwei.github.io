# Review of Module 5, Induction and recursion

Reviewed on 16 November 2026: `src/en/module_05.md`, `src/widgets/eval-stepper.js` (with its test
`tools/widget-tests/eval-stepper.mjs`) and `src/figures/_gen/figs_05.py`. Line numbers are those of the
page as I found it, before my edits.

## How it was checked

- Every paper proof worked through by hand: Examples 5.1–5.7 (base case, step, where the IH is used), the
  lemmas A, B and C of Example 5.5, the strong-induction derivation from ordinary induction, the
  horses paradox, the loop and ticket-machine invariants, and all eight exercise solutions.
- Every proof state compared with the paper proof it is set against (sum formula, `len_app`,
  `mirror_mirror`, the failed `reverse_reverse`, the two Fibonacci attempts, `credit_mod`, `lsum_app`).
- Numbers recomputed: calls of naive `fib` (2·fib(n+1) − 1: 15 for `fib 5`, 2,692,537 for `fib 30`),
  `ack 2 3 = 9`, `ack 4 2 = 2^65536 − 3` with 19,729 digits, the 4- and 5-cent bound 11.
- Isabelle claims checked against `src/HOL` (`List.thy`: `append` and `rev` defined by exactly the stated
  equations, `length` an abbreviation of `size`, `rev_append` and `length_append` are `[simp]`;
  `Groups_List.thy`: `sum_list` via `foldr`; `Power.thy`: `a ^ Suc n = a * a ^ n`; `Nat.thy`: `size_nat`)
  and with a scratch build (`out/scratch/rev56`): the termination orders that `fun` reports for `pow`,
  `fib`, `app`, `len`, `reverse` and `mirror`; that `reverse_app` gets stuck without `app_nil` and
  `app_assoc`; that `sum_from` is rejected; that `size` of a `tree2` counts nodes; that `'a tree` is not
  a type in `Main`.
- `python3 -I tools/isa.py --module 05`: all outputs match (before and after the edits; no Isabelle
  block was changed).
- The widget exercised in a browser with odd inputs (empty and malformed lists, nine elements, `[ab]`,
  `-1`, `3.5`, padded numbers, letters in `lsum`, incomplete and over-long trees, every cap, Back at the
  start, Next at the end, Enter in the input box): no exception, a message every time.
- Built page looked at at 1280 px, figures in both languages, overflow measured at 1280 and 360 px.

## Issues found and what I did

1. **L978–985, L1015–1018, why recursion must terminate.** The core explanation is right: no function
   satisfies `bad n = bad n + 1`, accepting the equation would prove 0 = 1, harmless cases such as
   f(n) = f(n) exist, and `fun` refuses every definition it cannot prove terminating. Two
   imprecisions fixed: "that construction needs a proof that the recursion terminates" now says that
   the *proof of the equations* needs the termination argument (as the function package works, and as
   Module 8 puts it); the key idea's "a definition can never make the logic inconsistent" now says "a
   definition made with `fun`". Added "(Module 2)" where the text relies on "from a false statement
   every statement follows".
2. **L1121–1124, `sum_down`.** Added that this rejected definition is *not* contradictory (`sum_down 0 =
   sum_down 0 + 0` holds for any value) but leaves `sum_down 0` open: a concrete case of the "harmless,
   but refused all the same" point of the section.
3. **L1633, quiz 3 explanation.** "accepting it would make the logic inconsistent" read as if every
   non-terminating recursion were contradictory, against L1021–1023. Reworded, and added why `fun`
   insists anyway.
4. **L1146, Collatz.** "so far nobody has been able to do better" was vague; now: nobody can supply a
   termination proof by hand either, because such a proof would settle the conjecture.
5. **L1050–1052, termination orders.** The text implied Isabelle always prints `size`; for the list
   functions it prints `length` (checked: `length <*mlex*> {}` for `reverse` and `len`,
   `(λp. length (fst p)) <*mlex*> {}` for `app`). Added a sentence.
6. **L864, strong induction.** New notation ∀m < n. P(m) was not read aloud or explained; added its
   reading and its meaning ∀m. m < n ⟶ P(m), linked to Module 4's bounded quantifier. Fact 5.4 now names
   its induction hypothesis, which the next paragraph refers to as "the IH".
7. **L172–174, note on `value`.** "Proofs, however, work by rewriting" overstated it (only the
   simplifier rewrites; many proof steps do not). Now says that `simp` rewrites.
8. **L261–262.** "Isabelle's library has a type `tree`": there is no such type in `Main` (`typ "'a tree"`
   fails); it is in the library theory `HOL-Library.Tree`. Reworded.
9. **L925.** "`2 ^ n` ... defined like `pow`": the library multiplies the other way round. Now "defined by
   recursion on n like `pow`; it has the same values as `pow 2 n`".
10. **L345–346.** "Module 12 does such proofs" (a fast program equal to the clear definition): Module 11
    (the accumulator `sumacc` against `sum_list`) does exactly this, Module 12 its data-refinement form.
    Now "Modules 11 and 12".
11. **L6, `needs`.** "Modules 1 to 4" → "Modules 1–4, especially well-founded relations (Module 4)", in
    the style of the other modules (Section 5.3 builds on Module 4's definition).
12. **L870.** Style: "holds trivially" → "holds because there is no m < 0".
13. **Widget.** "after 1 steps" (now singular); the caption asks the reader to "read the count of
    calls" for `fib`, but the widget never said how many calls there were (only "15 by equations"): it
    now says "15 calls in all: fib 5 ×1, …". "Repeated work" named only the largest repeated call (for
    `fib 10`: "fib 8 was computed 2 times", which undersells the point); it now also names the most
    repeated recursive call ("fib 3 … 2 times and fib 2 3 times", as Figure 5.2 says). Test extended
    by one check; `node tools/widget-test.mjs --only eval-stepper --lang en`: 16 passed.

Verified and left unchanged: the rest of the mathematics, all proof states against the paper proofs,
all cross-references (Sections 5.3–5.8, Examples 5.1 and 5.3, Figures 5.1–5.3, Exercise ids), the
history (Peano 1889, Floyd 1967, Hoare 1969, Collatz 1937), the three figures (both languages), and the
widget's equations, which match the module's `fun` definitions and its leftmost-innermost order.

## Not fixed

- The page has about 12,000 words, above the 7,000–10,000 of AUTHORING.md. Nothing is padding; I did
  not cut.

## Other modules and shared tools

- **Module 8, Section "Why every function must terminate".** It repeats Module 5 Section 5.7 almost point
  for point (`bad`, measures, reading the termination error, Collatz, a second "Measure" definition) and
  opens with "Module 1 promised to explain why Isabelle insists on proving that functions terminate.
  This section keeps that promise", as if Module 5 had not done so. It should refer back to Module 5 and
  build on it (the `function`/`termination` part is new there).
- **Module 1, line 434** "Module 8 explains why termination matters" still holds, as does Exercise 1.2's
  "induction, which Module 5 and Part III teach". "Modules 5 and 8 explain …" would be more accurate.
- Other modules' references to Module 5 hold: Module 4 (well-founded relations, same `(y, x) ∈ R`
  convention), Module 10 (examples "The sum formula" and "Mirroring twice"), Module 11 (`fib.induct`,
  `less_induct`, "strong induction"), Module 13 (invariant definition), Module 14 (structural
  induction).
- `needs` lines use four different styles across the series ("Modules 1 to 4", "Modules 1–3 (…)",
  "Modules 1, 2, 3 and 6", "Modules 5 and 7 to 10"); worth unifying.
- Facts that could go into FACTS.md: `'a tree` is not in `Main` but in `HOL-Library/Tree.thy`; `fun`
  reports `length <*mlex*> {}` for one-list recursion and `(λp. size (snd p)) <*mlex*> {}` for `pow`
  (scratch build).
