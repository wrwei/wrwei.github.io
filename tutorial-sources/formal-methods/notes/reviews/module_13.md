# Review of Module 13, Modelling systems: state machines and invariants

## Follow-up content audit, 17 November 2026

Read every model, proof, exercise solution and quiz; worked through the reachable states,
counterexample traces, timer transitions and three figure sources. Line numbers refer to the source
at the start of this follow-up.

- **L19–31, 61–68, 87–94, 132–138:** reactive systems need not literally run forever. Distinguished
  finite traces from infinite event sequences, stated when events determine states, and related finite
  reachability derivations to finite prefixes. Model checking can be symbolic rather than state-by-state.
- **L397–402:** `run` consumes attempted events and skips disabled attempts; the input list need not
  itself be an enabled trace. Deleting skipped attempts yields a real trace.
- **L516–554, 602–618, 727–769, summary and quiz:** unavailable executable equations and a bounded
  search are not impossibility or unreachability proofs. A failed proof method is not a genuine
  preservation counterexample. If a genuine counterexample starts in a reachable state, its successor
  violates the candidate invariant; the full rule-induction goal may also provide reachability facts.
- **L658–668:** `card = 6` chooses a default Nitpick scope, not a six-state crossing or a unique,
  reproducible counterexample. The record still has 12 logical values; datatype structure and
  type-specific settings matter. Quickcheck's size bound is a generator bound, not a promise to
  enumerate all lists of that length.
- **L801–808, Figure 13.3 caption, 888–892:** delays are minimum tick counts, not exact durations,
  physical seconds or upper waiting bounds. Initial green has timer 0. The state type is infinite,
  but reachable timers are bounded by 10. Identified omitted pedestrian fields in the figure caption.
- **L901–907:** refinement carries abstract state invariants through composed abstraction functions;
  newly added concrete details need their own proofs.
- **L930–973, summary and quiz:** distinguished finite prefixes from complete stopped executions
  under liveness semantics. Weak fairness can exclude the press-only starvation run. A decreasing
  timer rules out tick-only divergence, without forcing a phase change or proving eventual service.
  Progress measures are one proof technique, not a universal form of every liveness proof.
- **L954–973:** the request flag coalesces presses, and the temporal formula allows an existing walk
  to satisfy a request immediately. It provides neither a per-pedestrian obligation nor a waiting-time
  bound. Model checkers can prove properties of finite models as well as refute them.

The six crossing states, four lift states, 12/8/7/6 set counts, five-event bad trace, guard repair,
timed simulation and lazy-controller exercise remain consistent. No model or proof script changed.

Primary references: [Nitpick manual](https://isabelle.in.tum.de/doc/nitpick.pdf) (scope, datatype and
record approximation; also consulted its [official source mirror](https://github.com/isabelle-prover/mirror-isabelle/blob/master/src/Doc/Nitpick/document/root.tex)),
[Isabelle2026 scope implementation](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/HOL/HOL/ISABELLE_HOME/src/HOL/Tools/Nitpick/nitpick_scope.ML.html),
[Isar reference, HOL-specific tools](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Isar_Ref/HOL_Specific.html),
and the [Rodin handbook](https://stups.hhu-hosting.de/handbook/rodin/current/html/machine.html)
(convergent events and variants). Reachability, stuttering and the temporal-formula limits also follow
directly from the displayed models.

Validation: all 44 Isabelle blocks, 18 captured-output blocks and existing IDs are unchanged.
English checker: no errors or warnings. English HTML and root MkDocs builds passed. Inspected the
whole page at 1280 and 390 px with solutions expanded: no page overflow, broken images, KaTeX errors,
missing local anchors, SVG text outside its view box or browser errors. Isabelle is unavailable on
this Mac, so the earlier successful prover run was not repeated. Chinese synchronisation remains
deferred. No figure, widget or shared-tool changes were needed.

## Original review, 16 November 2026

Reviewed on 16 November 2026: `src/en/module_13.md` and `src/figures/_gen/figs_13.py`. Line numbers are
those of the page as I found it (snapshot commit 0230b69, 1312 lines), before my edits.

## How it was checked

- The models worked by hand: the lift (6 states, 4 reachable, the two unsafe ones unreachable), the
  crossing's reachable states (6, matching Figure 13.1 and its arrows), the counts of Figure 13.2
  (12 states, 8 `safe`, 7 `invar`, 6 reachable; `(Amber, DontWalk, ¬req)` the only `invar` state that is
  unreachable, `(Red, Walk, ¬req)` the only `safe` state outside `invar`, `ToGreen` the only step out of
  `safe`), every invariant proof on paper (`lift_ok`, `safe`, `invar`, the guard fix of Exercise 13.6, the
  turnstile, the lazy controller), Exercise 13.4's four properties, the timed run of Figure 13.3.
- The counterexample trace replayed by hand (`Press, ToAmber, ToRed, StartWalk, ToGreen` and the six
  states of the table); the alternative fix (Exercise 13.6) checked to keep `safe` inductive.
- Refinement: Definition 13.5 is exactly what `sim` proves (every `tstep c c'`, reachable or not, is a
  stutter step or `∃e. guard e (lights c) ∧ lights c' = effect e (lights c)`); `treach_reach` uses the
  initial states and `sim` only; Fact 13.2 follows; the text now claims no more than that.
- Scratch builds (`out/scratch/r13`): the Isar proof of Section 13.5 on `reach_early` stops at the same
  `ToGreen` goal with `reach_early s`; `quickcheck` on `safe (run_early es start)` tries sizes 1–5 and
  finds nothing (HOL sets `quickcheck_params [size = 5, iterations = 50]` in `HOL.thy` L2157, although
  `quickcheck.ML` defaults to 10).
- Isabelle facts: ⦇ ⦈ abbreviations `(|` `|)` (`etc/symbols`); record input must list all fields in order;
  `rtrancl_induct`/`rtrancl_into_rtrancl`; `induction` with a chained fact; Nitpick's `card` and records as
  single-constructor datatypes (nitpick manual §3.6–3.7).
- History and tools: Lamport 1977 (safety/liveness), Pnueli 1977 (temporal logic), B method and Paris
  line 14, Event-B and Rodin (refinement, proof obligations, convergence of new events), SPIN/Promela,
  nuXmv/SMV, TLC/TLA+.
- Cross-references to Modules 1, 4, 5, 9, 10, 11 and 12 (current draft) opened and checked, and the site
  guide `docs/tutorials/isabelle/index.md` read.
- `python3 -I tools/isa.py --module 13`: all outputs match (40 blocks; 39 before issue 1).
  `node tools/check.mjs --lang en`: no errors or warnings for this page. Built page looked at in full at
  1280 px; no horizontal page scroll at 390 px; Figures 13.1–13.3 looked at in both languages.

## Issues found and what I did

1. **L1258, Exercise 13.9 item 2: the fence opened on the list-item line** ("2. ```isabelle"), so
   `isa.py` never checked that proof (reported by the coordinator). **Fixed:** fence on its own line under
   the item, with a sentence; the proof is now checked.
2. **L6, `needs`** did not follow the series' form. **Fixed:** "Modules 1–12, especially Modules 4 …, 5 …,
   10 …, 11 … and 12 …".
3. **L52–63: Module 4 already defined state machines, reachability, safety properties and counterexample
   traces** (with a door and its lock); the page redefined them without saying so. **Fixed:** one sentence
   before Definition 13.1 linking to Module 4.
4. **L59–63, Definition 13.2:** "Written as the list of its events, with the states they lead to, a run is
   a trace" disagreed with "Its trace is *open, close, shut, start*" (L73) and the summary (L965, "events
   and states"), and runs had to be infinite for Section 13.8. **Fixed:** runs finite or infinite; a trace
   is the list of events; summary aligned.
5. **L191–195:** why the step at the end suits invariants, now with the reason that matches Module 11's
   corrected forward reference: with the step at the front (`steps`), the induction rule replaces the start
   of the run by a variable, the problem of `steps move Done s`.
6. **L202–206, Definition 13.3:** "For a state machine, it [a safety property] is a property of states"
   is false in general (safety properties need not be state predicates). **Fixed:** "In this module the bad
   thing is a bad state, so …".
7. **L261: `corollary` (and `theorem`, L463) used without explanation**; Module 14 explained both later as
   if new. **Fixed:** a sentence at the first `corollary`.
8. **L602–610, pitfall on strengthening.** The bullet "Adding a fact that is false" described a true but
   non-inductive fact; the second bullet said "No method can prove the step case for `safe`, because it is
   false", but the case Isabelle generates includes `reach s` and is true (Exercise 13.7 relies on exactly
   that premise). **Fixed:** both bullets rewritten (false facts can never work and should be tested with
   Nitpick; the claim refuted by Quickcheck is the step from `safe s` and the guard alone).
9. **L635:** "fails here with the same goal" made precise (scratch run: same `ToGreen` goal, with
   `reach_early s`).
10. **L720–724 keyidea and L1290 quiz explanation:** "If [the state] is reachable, the design is wrong"
    holds only when the property being proved is the safety property itself; for a strengthened invariant
    it means the added fact is false. **Fixed** in both places.
11. **L849–851:** the explanation of the `press` case of `sim` clarified (`blast` proves the disjunction
    with `Press` as the witness).
12. **L853–854:** "it uses nothing about the crossing except `sim`": it also uses the initial states.
    **Fixed.**
13. **L891–892: "The properties proved at the top hold all the way down"** is more than refinement gives
    (Section 13.8: liveness does not carry over). **Fixed:** "The safety properties …".
14. **L894–900, note on simulation relations:** "related states are related initially" was garbled and
    "the correspondence may depend on more than the concrete state" vague. **Fixed:** the two conditions
    stated precisely.
15. **L902–907, pitfall:** the reason why safety carries over was attached to "a concrete model may do
    less". **Fixed:** the reason is that every concrete step is allowed by the abstract model.
16. **L932–934:** "Refinement methods add proof obligations against this; Event-B … asks you to show that
    new events such as `tick` cannot run forever" suggested that this rules out the lazy controller; it
    does not (the lazy controller has no new events). **Fixed:** what the obligation rules out, and that R2
    needs a proof of its own.
17. **L938:** ◇ read as "at some later point"; ◇ includes the present. **Fixed:** "then or at some later
    point".
18. **L946–950, the guide:** "a small object model" (it models a lid), and "an application of Sections
    13.4, 13.5 and 13.7" overstated (no strengthening; its translation theorem is not a refinement of
    machines). **Fixed:** what each part corresponds to (13.4, 13.3, Module 14), and that the guide was
    written for Isabelle2025-2.
19. **L1072–1073, Exercise 13.4 item 3:** inductiveness not stated. **Fixed:** "so not inductive either".
20. **L1232–1233, Exercise 13.9 item 1:** "Prove that it refines the crossing …: `lazy s ⟹ reach s`"
    called the consequence (Fact 13.2) the refinement. **Fixed:** task and the start of the solution.
21. **Figure 13.2** labelled the invariant `inv`; the page calls it `invar`. **Fixed** in `figs_13.py`
    (both languages) and regenerated.
22. **Terminology** (coordinator): "initial case"/"step case" (L241, L282, L445, L479, L502, L603–609,
    L721, L870, L974–975, L1056, L1097, L1145, L1283, L1285 …) replaced by the series' "base case" and
    "induction step"; Isabelle's case names (`init`, `step`) unchanged.
23. **L317:** the bare symbols ⦇ ⦈ in prose rendered in a fallback font. **Fixed:** in code spans.

## Left open

- None in this module.

## Other modules and shared tools

- Module 11 uses `corollary` (L1447) and Module 12 `theorem` (L480) without saying what they are; Module 13
  now explains both at its first use.
- `node tools/check.mjs --lang en` reports two errors in `cheatsheet.md` (links to `troubleshooting` and
  `glossary`, pages that do not exist yet).
- For `notes/FACTS.md`: HOL's Quickcheck defaults are `size = 5`, `iterations = 50` (`src/HOL/HOL.thy`
  L2157, overriding 10 in `src/Tools/quickcheck.ML`), timeout 30 s (`quickcheck.ML` L172); ⦇ and ⦈ are
  typed `(|` and `|)` (`etc/symbols` L227–228).
