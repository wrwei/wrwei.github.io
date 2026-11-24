# Review of Module 14, Sequences and series

Reviewed 22 November 2026, against `notes/REVIEWING.md`. Line numbers are those of the page when the review
began (1960 lines; commit de271a4). The work-in-progress commit 6ee6f1e contains part of this review's
changes. Every worked example, exercise solution, quiz answer and explanation was worked by hand before the
check blocks were read (every ε–N response, limit, partial sum, telescoping cancellation, test hypothesis,
ratio, remainder interval and error bound), and every cross-reference was opened.

Every final answer on the page was right. The problems were the sign of the error (the page gave positive
errors where the series' convention makes them negative, and stated the alternating series bound as a
bound on a signed error), test hypotheses left out in places (continuity in the strategy, ρ = ∞ in the root
test's proof, eventually decreasing terms and the error bounds), the account of completeness, which did not
show how it gives the form Module 3 uses, a widget readout that was wrong for one series, and a slow check.

## Correctness and precision

| Line | Problem | Fix |
|---|---|---|
| 975 | Example 14.11: "the true error [of the midpoint] is $0.000288$"; the error is $\pi^2/6$ minus the midpoint, $\approx -0.000288$ (the midpoint is too large). The check computed midpoint − exact. "An error of at most half the width" is a bound on the size. | "an error of size at most half the width"; "the true error of the midpoint, $\pi^2/6$ minus the midpoint, is about $-0.000288$: the midpoint is slightly too large". Check reversed, plus `holds(mid > pi**2/6)`. |
| 977 | "For an error of at most $10^{-6}$ ... The midpoint estimate has an error of at most ...": the midpoint's error can be negative. | "of size at most" (twice); "because its error $R_N$ is at least $1/(N + 1)$". |
| 1179 | "The error is always smaller than the first term left out, $\tfrac{1}{N+1}$": the first term left out is negative for even $N$. | "The error $\ln 2 - S_N$ changes sign with every step, and its size is always smaller than the size of the first term left out". Check of the sign changes added. |
| 1203 | Theorem 14.15: "the error of $S_N$ is at most the first term left out": false as written when that term is negative (the bound is on the size). Nothing said about terms that decrease only from some index on. | "the error $S - S_N$ of the partial sum $S_N$ is no larger in size than the first term left out, and it lies between 0 and that term, $(-1)^N b_{N+1}$"; new last sentence: if the $b_n$ decrease only from some index on, the series still converges (Theorem 14.6) and the bound holds for the partial sums from that index on. |
| 1225, 1232–1240 | "an error of at most 0.001" (twice), "the first term left out must be at most 0.001", "The error is at most $\tfrac{1}{5040}$". | "of size at most", "in size", "The error $S - S_7$ is at most $\tfrac{1}{5040}$ in size, and it lies between 0 and the first term left out". |
| 1767–1781 | Exercise 14.9: the same wording in (b); (c) "the error of $S_7$ is about 0.000338": it is $\ln 1.5 - S_7 \approx -0.000338$. Check computed $S_7 - \ln 1.5$. | (b) "error of size less than 0.001", "less than 0.001 in size", "The error $S - S_7$ is at most $b_8$ in size"; (c) "$\ln 1.5 - S_7 \approx -0.000338$: negative, like the first term left out, and smaller in size than the bound". Checks reversed and the bound checked. |
| 1925–1930 | Quiz 6: "with an error of at most"; explanation "The true error, about 0.052" (it is $\ln 2 - S_9 \approx -0.052$). | "an error whose size is at most"; "the size of the first term left out"; "The true error, $\ln 2 - S_9 \approx -0.052$, is indeed smaller than $\tfrac{1}{10}$ in size. It is negative ...". Check reversed. |
| 1443 | Root test proof: "If $\rho > 1$" omitted the case $\rho = \infty$ that the theorem states. | "If $\rho > 1$ or $\rho = \infty$". |
| 1461 | Strategy, step 5: the integral test "after checking that $f$ is positive and decreasing": continuity left out. | "continuous, positive and decreasing". |
| 1465 | "The hypotheses need to hold only from some index on" is true of convergence, not of the error bounds as stated. | Added: "The error bounds of Sections 14.5 and 14.7 then hold for the partial sums from that index on." |
| 873 | "Each hypothesis is needed. Continuity makes the integrals exist": continuity is not needed (a decreasing function is integrable); only the counterexample for "decreasing" was given. | "Each hypothesis has a job. Continuity makes the integrals exist (Module 9), ...". |
| 870 | Integral test proof: "$\int_1^t f$, which increases with $t$, grows without bound" skipped why a divergent increasing integral is unbounded. | "is not bounded above (an increasing function that is bounded above has a limit, [Section 12.8](module_12_EN.html#comparison)), so it grows without bound". |
| 908 | $\sum 1/n^2 = \pi^2/6$: "the proof needs methods beyond this course". Not so: there are proofs with integration by parts alone, and one with Module 19's double integrals. | "its proof is beyond the scope of this module". |
| 818 | Block stacking: "an overhang of 10 lengths needs 272,400,600 blocks": true only of this one-block-per-level stack. | "stacked this way, an overhang ...". The number itself is right ($H_n$ first exceeds 20 at $n = 272{,}400{,}600$). |
| 1652 | Exercise 14.5(b): "every term after the $N$th is within 0.001 of 2": the answer 8996 needs "less than"; with "at most", 8995 would do, since the 8996th term is exactly 0.001 from 2. | "the smallest whole number $N$ that answers the challenge $\varepsilon = 0.001$: every term after the $N$th is less than 0.001 from 2". |
| 284 | "Limits keep non-strict inequalities" was proved for $a_n \le M$, then applied the other way round ("the limit is at least $a_m$"). | States the mirror statement (if $a_n \ge c$ from some index on, then $L \ge c$) and applies it with $c = a_m$. |
| 316 | "Module 7 proved more, with its formula for the error": Module 7's formula is for $x_{n+1} - \sqrt a$, the error with its sign reversed (Module 7's $e_n$). | Quotes the formula $x_{n+1} - \sqrt2 = (x_n - \sqrt2)^2/(2x_n)$ (checked). |
| 224 | Proof of Theorem 14.4 quoted "for every large enough $x$" as Definition 3.7's words; the definition says "by taking $x$ large enough", and its ε–N form is in the Going deeper box at the end of Section 3.7. | "that is the precise form of Definition 3.7, given in the Going deeper box at the end of Section 3.7". |
| 9 | Goal "Show that a monotone bounded sequence converges": the course takes this as an axiom. | "Use the Monotone Convergence Theorem to show that a sequence converges, and find the limit of a recursive sequence". Lead and Example 14.11: "a guaranteed bound on the error". |

## Consistency with other modules

- **Completeness (cross-module item).** Line 282 said that "this course takes the Monotone Convergence
  Theorem as its starting point" and the key idea (292) that Module 3 used it for the Intermediate Value
  Theorem, without showing how. Module 3's proof now takes completeness as an axiom in the nested-interval
  form ("some number $c$ lies in every one of the intervals") and says that Module 14 states it as the
  Monotone Convergence Theorem, with $c$ the limit of the $a_n$. Now line 282 says the course takes
  completeness as an axiom and states it as the Monotone Convergence Theorem, and a new paragraph proves
  Module 3's form from it (the left ends increase, every right end $b_m$ is an upper bound for them, so their
  limit $c$ is at least every $a_n$ and at most every $b_m$). This matches Module 3's Going deeper box,
  Module 12 (line 904), Module 13 (line 221), Module 15 (line 88, least upper bounds, which the Going deeper
  box of Section 14.2 covers) and Module 6's deeper box.
- **Line 292 (cross-module item):** "Module 6 [used it] to show that the slope of $2^x$ at 0 exists":
  Module 6 only sketches it, leaving out the convexity of $2^x$. Now: "Modules 6, 12 and 13 used the same
  property for functions (one that increases and is bounded above has a limit), to sketch why the slope of
  $2^x$ at 0 exists (Section 6.1), to compare improper integrals (Section 12.8) and to explain why solutions
  approach a stable equilibrium (Section 13.3)", with links.
- Line 274: the page defines increasing and decreasing **sequences** with $\le$, while Module 4 (line 338)
  and Module 8 (line 455, Section 8.3) define increasing and decreasing **functions** strictly. The page
  did not say so. Now it says that an increasing sequence may repeat a term, names the strict versions, and
  notes the difference from Module 4 and Section 8.3. (The integral test's "decreasing" is Module 8's,
  which is stricter than needed and so still correct.)
- Line 331 re-introduced **mathematical induction** in bold as a new term; Module 9 introduces it
  (Section 9.2, `#power-sums`). Now recalled with a link, with Module 9's terms base case and inductive step.
- Line 103: "by the argument at the end of Section 2.7": the uniqueness argument follows Example 2.14, in
  the middle of the section. Fixed. Line 141: Theorem 2.4's proof is in the Going deeper box of Section 2.7;
  said so. Line 889: "Module 12 showed" now links to Theorem 12.2.
- Zeno (line 453) agrees with `notes/FACTS.md`; "of Elea, in the 5th century BC", from FACTS, added.
- Every reference inside the page (Sections 14.1–14.9, Definitions 14.1–14.5, Theorems 14.1–14.18,
  Examples 14.1–14.17, Figures 14.1–14.5, Exercises 14.1, 14.10, 14.11) points to what it claims. The claims
  about other modules are true: Example 2.14 and the uniqueness argument, Sections 2.4 and 2.7, Theorems 2.4
  and 2.5; Definition 3.7, Theorems 3.4 and 3.10, Section 3.7 (Bernoulli's inequality, by induction;
  $1/x^p \to 0$), the Going deeper box of Section 3.8 (ratios of consecutive terms); Module 6's compound
  interest and Theorem 6.6 ($(1 + x/n)^n \to e^x$); Example 7.9, Theorem 7.2 ($x_n \ge \sqrt2$ and
  decreasing from $x_1$), Theorems 7.6 and 7.7, Examples 7.17 ($a = 2$) and 7.18; Modules 9 to 12 (sigma
  notation, bounds for integrals, substitution, partial fractions, $p$-integrals, centres of mass);
  Module 15 proves $\sum(-1)^{n-1}/n = \ln 2$, $\sum 1/n! = e$, $e^x = \sum x^n/n!$ for every $x$ (so
  $\sum(-1)^n/n! = 1/e$) and the sum $\ln\tfrac32$ of Exercise 14.9. What Modules 3, 6, 12, 13 and 15 and
  `formulas.md` say about Module 14 is true.

## Check blocks

- Line 793 (harmonic grouping proof): the block took 6.5 s (an exact sum of $2^{13}$ fractions and
  $H_{2^{14}}$). Ranges reduced; the whole page now checks in about 11 s, with no slow-block warning.
- Lines 986, 1789, 1953 checked approximation − exact; reversed with the page (see above).
- Added: the sign changes of $\ln 2 - S_N$; Module 7's formula with $a = 2$; $|\ln 1.5 - S_7| < 1/2048$;
  the mirror inequality; the block sizes $2^{j-1}$ of the grouping proof.
- Every number shown with ≈ has a `rounds` check; the other checks test what the page says.

## Widget (series-explorer)

- For $\sum 1/n!$ the readout "Sum − $S_N$" was `Math.E - S_N` in floating point: $8.149 \times 10^{-13}$ at
  $N = 15$ (true $8.155 \times 10^{-13}$), $2.22 \times 10^{-15}$ at $N = 17$ (true $2.976 \times 10^{-15}$),
  and $-4.441 \times 10^{-16}$ for every $N \ge 18$, a negative gap for a series of positive terms. Now the
  tail $1/N! + 1/(N+1)! + \cdots$ is summed exactly (40 terms, BigInt fractions; the rest is below
  $10^{-49}$ of it) and rounded to 4 digits: $e - S_{20} \approx 4.315 \times 10^{-19}$,
  $e - S_{200} \approx 1.274 \times 10^{-375}$.
- Harmonic series at $N = 1$: "1 + ln N ≈ 1.000001" (outward rounding of an exact 1). Now "= 1".
- Test: these cases folded into existing checks (15 checks, all pass). Looked at the widget at 1100 and
  360 px: nothing overlaps or overflows.

## Figures and rendering

- Figure 14.1: the label "$a_2 = 1.5$" ran into the dashed line $N = 4$; now centred above its dot. The
  other figures are drawn from their formulas and match their captions.
- 1100 px: no KaTeX errors, nothing cut off; one code line (compute box of Section 14.5) scrolled by 10 px
  and is shortened, with the same output.
- 360 px: no page overflow. 29 display formulas scroll inside their line (by 6 to 94 px), and the value
  table of Example 14.5 and several code blocks scroll inside their frames, as the brief allows. Left as
  they are.

## Not changed

- `check.mjs` reports an error in `en/glossary.md` (line 6, anchor `#g-a`), which another author is writing.
- The exercises are 4 ★, 6 ★★ and 2 ★★★: one ★★ more than the usual 4–5, which AUTHORING.md allows.

## For other modules and the coordinator

- Module 15, line 88, writes "the monotone convergence theorem of Module 14" in lower case; Modules 3, 12,
  13 and 14 capitalise it.
- Module 15 links to Exercise 14.9 and uses "the alternating series bound of Module 14" (lines 342, 1806):
  both still true; keep the id `ex-14-9`.
