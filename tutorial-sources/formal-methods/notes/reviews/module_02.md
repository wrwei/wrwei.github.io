# Review of Module 2, Propositional logic

## Audit and revision — 17 November 2026

English content audit against commit `a79a552`. Line numbers below refer to that baseline; current sections retain their IDs.

- **L73.** Language: made atomicity relative to the model and English disjunction context-dependent; stated that the door model concerns an unlocking decision.
- **L197.** Evaluation: explained symbolic evaluation and distinguished a complete truth table from an unchecked counterexample search.
- **L457.** Proof methods: removed the unsupported diagnostic attached to an initial-method failure and claims that an inconsistent premise makes every method succeed.
- **L639.** Ticket example: the simplification is a valid rejection condition; material implication does not establish a policy bug.
- **L843.** Normal forms: made constants, singleton forms, empty conjunctions and empty disjunctions explicit. The Tseitin encoding must assert the root formula, not merely define fresh names.
- **L1014.** Complexity: separated exponential truth-table enumeration from the open complexity of general SAT; qualified clause-learning claims.
- **L1161.** Requirements: distinguished global satisfiability from inconsistency under particular sensor readings; constrained claims about physical access and propositional modelling limits.

### Validation and scope

- Re-read the English page, worked examples, exercise solutions and quiz; retained the established section and exercise IDs.
- Every Isabelle and captured-output block is byte-for-byte unchanged from commit `a79a552`. The existing downloadable theories are reused unchanged.
- `node tools/check.mjs --lang en`: 18 pages, 0 errors, 0 warnings. The English site builds successfully, and `mkdocs build` from the repository root passes.
- Browser checks cover desktop (1280 px) and phone (390 px), expanded solutions, image decoding, formula rendering, internal anchors, page overflow and JavaScript errors. See the local `out/audit-module-02/` screenshots and metrics.
- Isabelle2026 is not installed on this computer. The requested Isabelle recheck could not run; unchanged code/output comparison and the earlier successful proof-check logs are not represented as a fresh prover run.
- Chinese work remains paused. These English changes must be reconciled before publishing the Chinese edition.

### Additional checks and sources

- Truth-table widget: 24 existing scripted checks passed, 0 failed.
- [Clay Mathematics Institute: P versus NP remains open](https://www.claymath.org/millennium/p-vs-np/).
- [cvc5 documentation on solver outputs](https://cvc5.github.io/tutorials/beginners/outputs.html); [Frama-C WP](https://frama-c.com/fc-plugins/wp.html); [Boogie verification conditions](https://github.com/boogie-org/boogie).

## Earlier review — 16 November 2026

Reviewed on 16 November 2026: `src/en/module_02.md`, `src/widgets/truth-table.js` (with its test
`tools/widget-tests/truth-table.mjs`) and `src/figures/_gen/figs_02.py`. Line numbers are those of the
page as I found it (snapshot commit 710e1a5), before my edits.

## How it was checked

- Every truth-table claim, law, normal-form conversion, worked example, exercise solution and quiz
  answer worked by hand: the 15 laws of Fact 2.3, Example 2.5's chain of laws, the NNF/CNF/DNF of
  Figure 2.3 and Exercise 2.5, the door requirement's DNF and CNF, the XOR normal forms, unit propagation
  in Example 2.9, R1–R4 and R3′/R4′ (including `door_determined`: R1, R2, R3′, R4′ force
  opens ⟷ fire ∨ badge ∧ pin ∧ ¬lockdown), the pump and knights-and-knaves exercises.
- Isabelle's priorities checked in `HOL.thy` (L92–186): ¬ 40, ∧ `infixr 35`, ∨ `infixr 30`, ⟶ and ⟷
  `infixr 25`, `=` `infixl 50`, ⟷ an abbreviation in print mode `iff` (hence printed as `=`). Exercise 2.1
  and the quiz agree with them. `de_Morgan_conj`, the `[simp]` status of both De Morgan laws and the
  "might cause exponential blow-up" comment (L1424) are in `HOL.thy`; `sat` uses the internal CDCL solver
  "cdclite" and replays its resolution proof, `satx` uses the definitional CNF (`sat.ML`,
  `sat_solver.ML`).
- Claims about messages checked by a scratch build (`out/scratch/rev123`): `by blast` on
  A ⟶ B ⟶ A ∧ B ∧ C fails with "Failed to apply initial proof method"; on a tautology Quickcheck says
  "Quickcheck found no counterexample." and Nitpick "Nitpick found no counterexample"; `nitpick [satisfy]`
  says "Nitpick found a model:"; jEdit runs Auto Quickcheck but not Auto Nitpick
  (`src/HOL/Tools/etc/options`).
- SAT and NP statements (Cook 1971, Levin, DPLL early 1960s, CDCL late 1990s, Millennium Prize, Sat4j in
  Eclipse) checked against standard accounts.
- `python3 -I tools/isa.py --module 02`: all outputs match, before and after the edits (no Isabelle block
  was changed).
- The widget exercised in a browser with odd inputs (`=`, `≠`, ↔ → ⇔ ≡, `->` `=>` `&&` `||`, unbalanced
  and 3,000-deep parentheses, `A B`, `P x`, quantifiers, numbers, `True` alone, seven atoms); built page
  and figures 2.1–2.3 (both languages) looked at; `node tools/check.mjs --lang en` clean.

## Issues found and what I did

1. **L54: `<->` for ⟷.** In jEdit `<->` offers ↔ first, which HOL rejects (details in the Module 1
   review). **Fixed:** `<-->`, here, in the widget caption (L315) and in the widget's help text.
2. **L159–160: "In logic, … the binary connectives group to the right"** presented Isabelle's grouping
   as the general convention, while the pitfall below says books differ. **Fixed:** priorities are the
   general convention; grouping to the right is Isabelle's.
3. **L440: "`auto` … reasons as `blast` does"** overstated what `auto` does (it does not run `blast`'s
   search, and `blast` proves goals that `auto` does not). **Reworded.**
4. **L606: Fact 2.4** applied substitution, a fact about tautologies, directly to the laws of Fact 2.3,
   which are equivalences. **Added** the missing step through Fact 2.2.
5. **L653:** the page uses ≡ for equivalence, and Isabelle has a symbol ≡ with another meaning (Module 7
   introduces it for definitions). **Added** one sentence telling readers to write ⟷ in lemmas.
6. **L1000–1007: NP** was "the class of problems whose solutions can be checked quickly" (not a class of
   yes-or-no problems, and "solution" undefined), and "P versus NP" was named without saying what P is.
   **Rewritten:** yes-or-no problems whose "yes" can be checked quickly given a proposed solution, SAT as
   the example, the other examples phrased as questions, P defined.
7. **L1012–1017: DPLL.** "When a clause becomes false, undo the latest decision and try the other value"
   is wrong once both values of that decision have been tried, and the procedure never said when it
   stops, although Example 2.9 concludes "a conflict, reached without a single decision. The formula is
   unsatisfiable". **Rewritten:** go back to the latest decision with an untried value; satisfiable when
   every clause is true, unsatisfiable when a conflict leaves no decision to go back to.
8. **L1100, L1276, L1696:** "a counterexample to ¬C is a model of C" used C, an atom on the same page.
   **Fixed:** φ, and R1 ∧ R2 ∧ R3 in the quiz explanation.
9. **L1262 (summary): "contingent (true in some)"** fits tautologies too. **Fixed:** "true in some rows
   and false in others".
10. **Exercise 2.6 (L1528):** the requirements have a second conflict (water reported low and high in
    automatic mode: R1 against R2) that R3′ does not remove; a reader who found it got no answer.
    **Added** a paragraph that names it and points to the assumption of part 3.
11. **Exercise 2.8 (L1648):** "⟷ is associative and q ⟷ q is True" also needs commutativity and uses laws
    of ⟷ that the page never states. **Replaced** by a two-case argument.
12. **Truth-table widget.** (a) It printed ⟶ inside ⟷ without parentheses, against the page's advice
    and unlike Isabelle (which prints `(A ⟶ B) = (¬ B ⟶ ¬ A)`): the Compare verdict for the
    contrapositive read "(A ⟶ B) ⟷ ¬B ⟶ ¬A is a tautology". Now the columns and the verdict keep the
    parentheses. (b) `A = B` was rejected as "not a propositional formula", although the page teaches
    that Isabelle reads `=` between formulas as ⟷; the message now explains the priority of `=` and asks
    for ⟷ (`A ∧ B = B ∧ A` names `B = B`). (c) Look-alike symbols (→ ⇒ ⊃ ↔ ⇔ ≡) get a hint instead of
    "cannot read". (d) "true in all 1 row" for `True`. Four checks added to the test (24 pass).

Checked and left as they are: the claim that `value` prints a formula with variables back (true of the
examples; it evaluates symbolically); Quickcheck "evaluates the formula for one valuation after another"
(it uses exhaustive testing); "SAT solvers … check hardware designs and software configurations every
day".

## Left open

- The page has about 12,400 words, above the 7,000–10,000 of the brief. All of it is on the plan's topics
  and I did not cut it; `minutes: 210` is plausible.
- There is no Chinese page yet; the translator needs the changes above.

## Problems in other modules and shared files

- `src/widgets/_core.js`: `Logic.show` drops the parentheses of ⟶ inside ⟷ (same priority) and prints
  `¬ x = y` rather than `x ≠ y`; both of my widgets now work around it, others may show the same.
  `Logic.parse` accepts `->` and `=>` for ⟶ (in jEdit they give → and ⇒, which HOL rejects), and cannot
  read `(A ∧ B) = C` or `A = (B ∧ C)` ("unexpected =").
- Module 6 L301 calls the parse tree a "syntax tree"; Module 2 defines "parse tree".
- Module 7 L1979 attributes `nitpick` to Module 3; Module 2 introduces it.
