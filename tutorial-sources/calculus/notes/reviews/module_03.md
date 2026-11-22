# Review of Module 3, Continuity and infinity

Reviewed 22 November 2026, following `notes/REVIEWING.md`. Line numbers are those of
`src/en/module_03.md` at the start of the review (1802 lines, the page of commit 147683e); the
coordinator's work-in-progress commits of 16:49 picked up part of this review while it was under way.
Every worked example, exercise solution, quiz answer and explanation was worked by hand before the
check blocks were read; every cross-reference, and every claim about Modules 1, 2, 4, 7, 8 and 14, was
opened and checked.

The page was in good shape. Every example, solution and quiz answer is right (the bisection tables,
the step counts, the asymptotes, the crossover points 59 and 117,308, the times in years), the
theorems carry their hypotheses, with a counterexample for each hypothesis of the Intermediate and
Extreme Value Theorems, and infinite limits and limits at infinity are never treated as numbers. The
problems were a definition that contradicted itself, a proof labelled as an idea that the series
elsewhere calls a proof, a composition argument that skipped the one point where the theorem fails,
several loose phrasings, and display formulas that scrolled on a phone (32 of 71).

Final state: `calc.py --module 03`: 544 checks in 56 check blocks (was 515 in 55), all outputs match;
`check.mjs --lang en`: no errors or warnings for this page; build clean, no KaTeX errors;
`widget-test --only bisection`: 15 checks pass. Section ids, figure ids, exercise ids and the numbering
of every definition, theorem, example, figure and exercise are unchanged (other modules link
`#ivt`, `#evt`, `#bisection` and `#continuous-functions`).

## Correctness and precision

| Line | Issue | Done |
|---|---|---|
| 49 | Definition 3.1 assumed $f$ "defined on an open interval that contains $a$", then listed "$f(a)$ is defined" as a condition to check, and needed a second hypothesis for "discontinuous" | Hypothesis "except perhaps at $a$ itself" for both notions; condition 1 now makes sense |
| 103, 120 | Floor: "the largest whole number ≤ $x$", with $\lfloor -2.7\rfloor = -3$; Module 1 uses "whole number" for $n \ge 0$ | "integer" (twice) |
| 141 | Definition 3.3, infinite discontinuity: "as large as you like, positive or negative" also covers values whose sign keeps changing, which Section 3.6 does not call an infinite limit | "become, and stay, larger than any number you name, or smaller than any number you name", with both one-sided notations |
| 145 | "No single value repairs a jump or an infinite discontinuity" left out the oscillating kind | "No single value repairs the other three kinds, because at them $\lim_{x\to a} f(x)$ does not exist"; "defining, or redefining" |
| 284 | "$\abs{x} = \sqrt{x^2}$ is continuous on $\R$, as the composition of $x^2$ with the square root": at 0, Theorem 3.5 needs $\sqrt{\ }$ continuous at 0, which it is only from the right | Composition for $x \ne 0$; at 0, $\lim\abs{x} = 0 = \abs{0}$ (Example 2.9, linked); checks added |
| 423–428 | The IVT's Going deeper box was "the idea of the proof" and used $f(a_n) \to f(c)$ (sequential continuity, never established). AUTHORING makes only the EVT statement-only, and Module 14 (lines 282, 292) says Module 3 *used* completeness to *prove* the IVT | Rewritten as a complete proof: completeness taken as the one axiom (a number $c$ in every bracket, linked to Module 14's Monotone Convergence Theorem), then an ε–δ argument at $c$ (continuity with $\varepsilon = \abs{f(c) - N}$ keeps $f(a_n)$, $f(b_n)$ on one side of $N$ once $b_n - a_n < \delta$) |
| 528 | Bisection on $\tan x$: "the warning sign is in the table: the values $f(m_n)$ grow". There is no table there, and the values do not grow step by step (14.1, −5.5, −18.4, 120.5, …) | "they grow in size, from $f(m_0) \approx 14.1$ to $f(m_3) \approx 120.5$ and $f(m_6) \approx 2067$" (the widget's table shows the same); checked |
| 602 | "floating-point numbers (Module 1)": the gap $2^{-52}$ next to 1 is Module 2's material | "(Module 2)" |
| 634 | EVT: "needs the completeness of the real numbers, in a stronger form than the IVT did". It is the same axiom, used harder | "also rests on the completeness …, but takes more work than the proof of the Intermediate Value Theorem" |
| 637, 641 | "the jump at 1" for $f(x) = x$ on $[0,1)$, $f(1) = 0$: at the end of $[0, 1]$ there is no right-hand limit, so this is not a jump in Definition 3.3's sense (also in the Figure 3.4 caption) | "at 1, where $f$ is not continuous from the left, the value drops to 0"; caption states the function |
| 638 | $x/(x+1)$ on $[0,\infty)$: "never reaches 1 … no maximum value"; not reaching 1 does not by itself exclude a maximum | $= 1 - \frac{1}{x+1}$ increases, so every value is beaten by a later one; checked |
| 711, 824, 826 | Informal definitions: "$f(x)$ is larger than any number $M$ you choose, for every $x \ne a$ close enough to $a$" reads as "larger than every $M$" | "whatever number $M$ you choose, $f(x) > M$ for every $x \ne a$ close enough to $a$ (how close depends on $M$)"; "can be made as close to $L$ as you like by taking $x$ large enough" |
| 941 | $(1+q)^n \ge 1 + nq$: "each further factor $1 + q$ keeps it true" hid the induction step (Module 14 line 331 cites this as Module 3's example of induction) | Explicit: multiply both sides by $1 + q > 0$; three-line display |
| 973 | "$\frac{\sin x}{x}$ is 0 at every multiple of $\pi$": not at 0 | "every non-zero multiple" |
| 1186 | Going deeper: "$t^p$ is continuous at $t = 1$" for real $p$, which Theorem 3.3's list does not cover | "$t^p = e^{p\ln t}$ is continuous (Theorems 3.3 and 3.5)"; identity checked |
| 1397 | Exercise 3.2: "Each function is undefined at one or two numbers"; $(\sqrt{x+4} - 2)/x$ is undefined for every $x < -4$ | "Each formula has a zero denominator at one or two numbers"; (b) now says to multiply by $\sqrt{x+4} + 2$ |
| 1690 | Exercise 3.10(c): "at most three roots (each root gives a factor, and three factors already make degree 3)", too compressed for a ★★★ proof | The factor-theorem argument written out ($p = (x - r_1)q$, $q(r_2) = 0$, $s = r_3$), citing Section 2.5; checks added |
| 5 | `minutes: 255`: the page is the longest so far, about 16,600 words of prose and code against 12,800 and 14,000 for Modules 2 and 1 (240 minutes each) | 270, the top of AUTHORING's range |

## Check blocks

All 55 blocks check what the page states. Added: the two IVT counterexamples (no check before); the
semicircle claim of Example 3.3(b); $\abs{x}$ at 0; the $\tan x$ bisection values; the EVT
unbounded-interval example (monotonicity); $t^p = e^{p\ln t}$; the difference of squares in
Exercise 3.7(c) (new form with $s = \sqrt{x^2 + x}$); the factorisation and $s = r_3$ in Exercise 3.10(c).
The check of Section 3.7 works around a SymPy bug (below).

## Teaching and consistency

- The notation $f \ll g$ was not read aloud; it now reads "f is much smaller than g", as Module 7 reads it.
- The widget caption now uses the $x^3 - x$ preset (three roots) for the text's "when a bracket contains
  several roots, it finds only one".
- Checked against the other modules: Module 2's Theorem 2.7, Examples 2.2, 2.9, 2.10, root law and
  floating point; Module 1's Examples 1.2 and 1.5, Theorem 1.2, Exercise 1.10, Figure 1.3, Section 1.4;
  Module 4's big-O as $h \to 0$; Module 7's L'Hôpital proofs of the growth rates and its $\ll$; Module 8's
  "absolute maximum" and use of the EVT; Module 14's Monotone Convergence Theorem and ratio test. All
  consistent now (Module 14's "Module 3 used it to prove the IVT" is true after the rewrite).

## Rendering

- At 360 px, 32 of 71 display formulas scrolled inside their line, the worst at 1.97 times the width
  (Modules 1, 2, 4, 5: at most 1.36). Reflowed about 30 into aligned lines as Module 2 does, moved
  "$(x \to \infty)$" tags into the prose, made Exercise 3.9's list inline, named $Q(x)$ in the proof of
  Theorem 3.10 and $s = \sqrt{x^2 + x}$ in Exercise 3.7(c). Now none scrolls at 360 px (only the
  widget's table, which is designed to); no page-level overflow; no KaTeX errors. Full page checked at
  1100 px, solutions opened.
- Figure 3.1: the tick label 2 of the oscillating panel sat on the band of swings; the label is now
  below the band (the tick stays). Other figures checked; unchanged.
- Widget: at 360 px the $a_0$ label overlapped the $y$ tick label $-1$ and the dot at $(1, f(1))$. The
  end labels now go on the side of the axis away from the curve and keep out of the strip of $y$ tick
  labels (checked for all presets at 360 and 1100 px). The "cannot start" message said $f$ may have "an
  even number of roots, or one where the graph touches the axis"; now "its graph may cross the axis an
  even number of times, or touch it without crossing" (Chinese too). The test now also checks that
  bisection on $x^3 - x$ over $[-2, 3]$ closes in on 1 (the Reset check merged into another: still 15).

## Other modules and shared tools

- **SymPy 1.14 pitfall for AUTHORING section 6.1**: `limit(2**x, x, -oo)` returns `oo` and
  `limit((1/2)**x, x, -oo)` returns 0, both wrong (`exp(x)` is right). Check limits at $-\infty$ of
  $a^x$ as limits at $\infty$ with $x \to -x$.
- `src/widgets/_core.js`: the plot's tick labels have no halo, so a curve can run through them (the
  $x$ tick 2.1 in the $\tan x$ view of the bisection widget). A white halo, as in the figures, would fix
  this for every widget.
- `check.mjs` currently warns about "just" in `module_07.md` line 672 (under review by someone else).
