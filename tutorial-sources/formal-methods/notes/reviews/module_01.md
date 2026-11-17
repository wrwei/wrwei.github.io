# Review of Module 1, Formal methods, what and why

## Audit and revision — 17 November 2026

English content audit against commit `a79a552`. Line numbers below refer to that baseline; current sections retain their IDs.

- **L86.** Sorting: replaced the artificial claim that the English sentence permits lost scores with a concrete failed check; defined ascending order and multiplicity, and separated result properties from termination.
- **L73.** Formal methods: distinguished a formal language and semantics from the checking technique; model checking need not be presented as writing an explicit proof.
- **L116.** Testing and proof: qualified general claims by input coverage, models and assumptions; acknowledged exhaustive testing of small finite domains.
- **L138.** SAT/SMT: split the rows, explained satisfiability and decidability, and removed the inference from undecidability to mandatory human guidance.
- **L180.** Trust: distinguished proof-search reliability, kernel operations, axioms/admissions/oracles, runtime trust and applicability to a real system. Updated the two English diagrams.
- **L408.** First theory: clarified type inference, completed proof checking, termination versus machine resources, and failure of a proof method versus a counterexample.
- **L544.** Course and assessment: corrected where Isabelle takes the lead, model-checking bounds in the cache exercise, the buggy-simplifier exercise, and related summaries/quiz wording.

### Validation and scope

- Re-read the English page, worked examples, exercise solutions and quiz; retained the established section and exercise IDs.
- Every Isabelle and captured-output block is byte-for-byte unchanged from commit `a79a552`. The existing downloadable theories are reused unchanged.
- `node tools/check.mjs --lang en`: 18 pages, 0 errors, 0 warnings. The English site builds successfully, and `mkdocs build` from the repository root passes.
- Browser checks cover desktop (1280 px) and phone (390 px), expanded solutions, image decoding, formula rendering, internal anchors, page overflow and JavaScript errors. See the local `out/audit-module-01/` screenshots and metrics.
- Isabelle2026 is not installed on this computer. The requested Isabelle recheck could not run; unchanged code/output comparison and the earlier successful proof-check logs are not represented as a fresh prover run.
- Chinese work remains paused. These English changes must be reconciled before publishing the Chinese edition.

### Primary sources consulted

- [Isabelle2026 release and requirements](https://isabelle.in.tum.de/website-Isabelle2026/) and [installation instructions](https://isabelle.in.tum.de/installation.html).
- [Isabelle2026 implementation manual: primitive logic and oracles](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/Implementation/Logic.html), and [Isabelle/jEdit manual source](https://isabelle.in.tum.de/website-Isabelle2026/dist/library/Doc/JEdit/JEdit.html).
- [ESA's Ariane 501 inquiry summary](https://www.esa.int/Newsroom/Press_Releases/Ariane_501_-_Presentation_of_Inquiry_Board_report).
- [Intel's 1994 annual report](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2025-05/history-1994-annual-report.pdf), for the charge rather than an asserted replacement-only cost.
- [Dijkstra's EWD 249](https://www.cs.utexas.edu/~EWD/transcriptions/EWD02xx/EWD249/EWD249.html).
- [seL4 proof scope and assumptions](https://sel4.systems/Verification/), [CompCert architecture and unverified stages](https://compcert.org/compcert-C.html), and the [Csmith authors' 2011 study](https://users.cs.utah.edu/~regehr/papers/pldi11-preprint.pdf).
- [AWS engineers' account, abridged by Lamport](https://lamport.azurewebsites.net/tla/amazon-excerpt.html), [CLEARSY's account of Métro line 14](https://www.clearsy.com/en/the-tools/extension-of-line-14-of-the-paris-metro-over-25-years-of-reliability-thanks-to-the-b-formal-method/), and [RTCA's DO-333 description](https://www.rtca.org/do-178/).

## Earlier review — 16 November 2026

Reviewed on 16 November 2026, together with Modules 2 and 3: `src/en/module_01.md` (the reference
module) and, for the same three fixes, `src/zh/module_01.md`. Line numbers are those of the page as I
found it (snapshot commit 710e1a5), before my edits.

## How it was checked

- Every historical and industrial claim checked against well-established accounts: Ariane 501 (1996,
  64-bit float to 16-bit integer, both inertial reference units), Therac-25 (1985–1987, six overdoses, at
  least three deaths, race condition, hardware interlocks of earlier models), Pentium FDIV (1994, missing
  table entries, 475 million dollars), Dijkstra's sentence (EWD 249, 1970), seL4 (2009, Isabelle/HOL,
  first general-purpose kernel), CompCert and the 2011 random-testing study, AWS and TLA+ (since 2011,
  the 35-step DynamoDB trace), Paris Métro line 14 (1998, B method), DO-178C/DO-333, Common Criteria
  EAL 7, Boehm's verification/validation slogans, Milner and LCF, Paulson (Isabelle, 1986), Nipkow's
  group (Isabelle/HOL), Wenzel (Isar, Isabelle/jEdit), Flyspeck (Isabelle with HOL Light).
- The arithmetic redone: 2^128 ≈ 3.4 × 10^38 inputs, ≈ 1.1 × 10^22 years at 10^9 per second (≈ 8 × 10^11
  ages of the universe); Exercise 1.3: 2^96 ≈ 7.9 × 10^28, ≈ 2.5 × 10^12 years.
- jEdit claims checked in the sources and manual: `Scratch.thy` in `$USER_HOME` (`jedit_main.scala`),
  Ctrl/Cmd hover and click (jedit §3.5), completion defaults (`src/Tools/jEdit/etc/options`: popup on,
  Tab selects, Enter does not, unique non-word abbreviations inserted at once; jedit §3.7.3–3.7.4), Auto
  Quickcheck and Auto solve_direct on, Auto Nitpick off (`src/HOL/Tools/etc/options`).
- Every symbol abbreviation in the table looked up in `etc/symbols` (see issue 1).
- `python3 -I tools/isa.py --module 01`: all outputs match (no Isabelle block was changed).
- Built page and figures 1.1–1.2 (both languages) looked at; `node tools/check.mjs --lang en` clean.

## Issues found and what I did

1. **L291, the symbol table gives `<->` for ⟷.** In Isabelle2026's `etc/symbols`, `<->` is an
   abbreviation of both ↔ (`\<leftrightarrow>`) and ⟷ (`\<longleftrightarrow>`). With two candidates
   jEdit opens a pop-up whose items are sorted by name, then by how often the user picked them
   (`completion.scala`), so a new user who presses Tab gets ↔. HOL has no ↔: `lemma "A ↔ B"` fails with
   "Inner lexical error at "↔ B" Failed to parse prop" (scratch run). `<-->` is unique and is replaced
   at once. **Fixed:** `<-->` in the table (also in `src/zh/module_01.md` L181, Module 2 L54, the
   captions and help texts of both widgets).
2. **L144–147, "all checked by the same small kernel"** was said of Quickcheck, Nitpick and Sledgehammer
   together. Quickcheck and Nitpick produce no theorems; only Sledgehammer's proofs go through the
   kernel. A beginner could take a Nitpick counterexample for a kernel-checked result. **Fixed:** "The
   proofs that Sledgehammer finds are checked by the same small kernel as every other proof (Section
   1.4)." Same change in the Chinese page (L90).
3. **L200–201, "recommends 8 GB and 4 cores".** The home page (FACTS.md) gives 4 GB/2 cores for small
   experiments and 8 GB/4 cores for medium applications; it does not recommend the latter in general.
   **Fixed** the wording, in both languages (zh L118).

Checked and left as they are: the quotation from Dijkstra drops the original exclamation mark (series
style; the words are exact); "Isabelle is still written in ML and Scala" (Isabelle/ML and Isabelle/Scala);
Exercise 1.2's answer "SAT or SMT" for multiplier equivalence (the expected answer, although multipliers
are hard instances in practice).

## Left open

- The Chinese changes in `src/zh/module_01.md` (L90, L118, L181) were made by me, not by the translator;
  the translator should look at the wording.

## Problems in other modules and shared files

- `notes/FACTS.md`, "Typing symbols": "accept the completion (Tab or Return, jedit.pdf §3.7)". By default
  only Tab selects a completion (`jedit_completion_select_enter = false`, jedit §3.7.4). The table should
  also list ⟷ `\longleftrightarrow` `<-->` and warn that `<->` also means ↔.
- `src/en/index.md` says "about 40 hours in all"; the modules' `minutes` now add up to 3,070 minutes,
  about 51 hours.
