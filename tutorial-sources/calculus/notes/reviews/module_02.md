# Review of Module 2, Limits

Reviewed 22 November 2026, against `notes/REVIEWING.md`. Line numbers are those of the page as it was
when the review began (1553 lines; the version before the first work-in-progress commit of 16:21).
Every worked example, exercise solution, quiz answer and explanation was worked by hand before the
check blocks were read; every cross-reference was opened and checked.

The page was in good shape: the mathematics of every example, solution and quiz answer is right, the
informal and ε–δ arguments are labelled as what they are, and one-sided and infinite limits are handled
correctly in the prose. The problems were precision slips, a SymPy box that taught the one-sided call
first, two goals with no exercise, and formulas that scrolled on a phone.

## Correctness and precision

| Line | Problem | Fix |
|---|---|---|
| 305 | The root law remark said that other roots are "handled in the same way" (rationalising). That argument divides by a sum that tends to 0 when $L = 0$, which the root law allows for odd $n$. | Says the case $L = 0$ is simpler and why: $\lvert\sqrt[n]{f(x)}\rvert < c$ whenever $\lvert f(x)\rvert < c^n$. Check added. |
| 596 | Example 2.10: "the inequality above gives $0 < \sin\theta < \theta$". The inequality $\sin\theta < \theta < \tan\theta$ gives only the upper bound; $\sin\theta > 0$ comes from $P$ lying above the axis. | Reworded; check added. |
| 843 | Uniqueness of limits: the display went from $\lvert(L - f(x)) + (f(x) - M)\rvert$ straight to $< \varepsilon + \varepsilon$, skipping the triangle inequality that the paragraph had just introduced. | Added the line $\le \lvert L - f(x)\rvert + \lvert f(x) - M\rvert$. |
| 895 | Going deeper, quotient law: $\lvert 1/g - 1/M\rvert < \frac{2}{\lvert M\rvert^2}\lvert g - M\rvert$ is false when $g(x) = M$ (both sides 0). | $<$ changed to $\le$; the conclusion $< \varepsilon$ still follows. |
| 955 | "almost every stored number is slightly wrong": stored numbers are exact; real numbers are stored slightly wrong. | "almost every number is stored slightly wrong ... (even 4.9 has no exact binary form)"; check added. |
| 1021 | The rearranged formula $\frac{1 - \cos x}{x^2} = \big(\frac{\sin x}{x}\big)^2\frac{1}{1 + \cos x}$ was stated for $x \ne 0$; it fails at odd multiples of $\pi$, where $1 + \cos x = 0$. | Stated for $0 < \lvert x\rvert < \pi$, with "$1 + \cos x$ is positive for $\lvert x\rvert < \pi$" in the text; checks added. |
| 1050–1090 | The SymPy box opened with "SymPy computes limits exactly with `sp.limit(f, x, a)`" and used that call for the two-sided limits of Section 2.1, Example 2.7 and Theorem 2.5, although without a direction SymPy computes the limit from the right (the pitfall the box warns about three paragraphs later, and AUTHORING's SymPy pitfall). | The first block uses `'+-'`, and the prose says what it means; the "leave the side out" demonstration with $\lvert x\rvert/x$ is kept, now as the surprise it is. Outputs regenerated; checks of the four two-sided limits added. This matches the formula sheet's `sp.limit(f, x, a, '+-')`. |
| 1103 | "`AccumBounds(-1, 1)` ... says that the values keep returning to every number between $-1$ and 1": SymPy's accumulation bounds say less than that. | "says that near 0 the values keep swinging between $-1$ and 1 without settling". |
| 1112 | Pitfall: "neither limit exists" was ambiguous in a sentence about one-sided results (the right-hand limit of $\lvert x\rvert/x$ does exist). | "although neither function has a limit at 0: $\lvert x\rvert/x$ jumps there, and $1/x$ is hugely positive to the right of 0 but hugely negative to the left". |
| 1130 | Summary: "it goes from the right unless you give `'+-'`" (`'-'` also changes it). | "without a fourth argument it computes the limit from the right, so write `'+-'` for the two-sided limit". |
| 1200 | Exercise 2.3(b): "its values stay close to no number" asserted the answer instead of arguing it. | Gives the blow-up argument of Section 2.3: $1/x > \lvert L\rvert + 1$ for $0 < x < 1/(\lvert L\rvert + 1)$. Checks added. |

## Check blocks

- Line 354: `same(limit(pg, x, a), pg.subs(x, a))` checked the two-sided direct substitution theorem with
  SymPy's default right-hand limit. Now `limit_is` (two-sided), plus a rational function case.
- Added checks for every statement changed above, and for three that had none: the substitution
  $\theta = 3x$ in Example 2.11; that the quotient of Exercise 2.4(c) is the difference quotient of
  $1/x^2$ at 1 ("the rate of change of $1/x^2$"); quiz 4's distractor "2 is the limit of
  $\sqrt{1 + x} + 1$".
- All other check blocks compared with their prose: they check what the page states, with `rounds` for
  every rounded number. There are no `nocheck` examples.

## Teaching

- Line 670, Example 2.11(a): the parenthetical used the game's vocabulary ("a δ that wins", "the winning
  response") a section before Section 2.7 introduces the game. Rewritten as "Section 2.7 makes this step
  precise: if $\sin\theta/\theta$ is within ε of 1 whenever $0 < \lvert\theta\rvert < \delta$, then
  $\sin 3x/(3x)$ is within ε of 1 whenever $0 < \lvert x\rvert < \delta/3$". The paragraph's tall inline
  fractions also collided between lines at 1100 px; the rewriting of (a) and of (b) is now displayed.
- Goals and exercises. Goal 1 (estimate a limit from a table) had no exercise: added Exercise 2.3(e),
  estimate $\lim_{x\to0^+} x^x$ from a value table and say why only the right-hand limit makes sense
  (Module 7 proves the value 1; Module 6's opening table of $(2^h - 1)/h$ was avoided on purpose). Goal 5
  (ε–δ proofs for quadratics) had no exercise asking for a proof (Exercise 2.8 fixed ε = 1): added
  Exercise 2.8(c), the proof with $\delta = \min(1, \varepsilon/41)$. Exercise 2.8(b) said "the proof's δ in
  (a)", though (a) is not a proof: now "the δ of (a)".
- `needs`, `goals` and `minutes` are accurate. No box, figure, exercise or section was added or removed,
  so every number and id, and every link into the page from other modules, is unchanged.

## Consistency

All references inside the page (Sections 2.1–2.8, Definitions 2.1–2.3, Theorems 2.1–2.7,
Examples 2.1–2.14, Figures 2.1–2.5, Exercises 2.8–2.11) and into Module 1 (Sections 1.3, 1.4, 1.6,
Examples 1.3, 1.5, Exercise 1.9) point to what they claim. The claims about later modules are true:
Module 3 writes $\lim 1/x^2 = \infty$ and proves the catalogue continuous; Module 4 finds the best step
for numerical differentiation; Module 5 uses Theorems 2.5 and 2.6; Module 7 proves $x^x \to 1$. The
references into Module 2 from Modules 3, 4, 5, 7, 9, 11, 12, 13, 14, 17, 19 and the formula sheet
(Theorem 2.4, Theorem 2.5, Example 2.14, Sections 2.4–2.7, the Going deeper box, ids `#trig-limits`,
`#squeeze`, `#one-sided`, `#no-limit-proof`, `#laws`, `#precise`, `#rationalise`) are all right.

## Style

`node tools/check.mjs --lang en`: no errors and no warnings for the page. New text follows Module 1's
voice and British spelling.

## Rendering

- 1100 px, whole page, solutions open: no KaTeX errors, no page errors, nothing overlapping or cut off.
  Code and Python error output scroll inside their boxes, as designed.
- 360 px: the page never widens (scroll width 360). When first measured (after the first edits), 19
  display formulas scrolled inside their line by 6–92 px, two of them displays this review had added or
  widened. 17 are now split into aligned
  lines, or lost a condition that the sentence before already states; 2 inherently wide ones remain
  (Example 2.7's rationalising step, 28 px; Exercise 2.11(a), 8 px). Module 1 has 11 such.
- Figures: `figs.py 02 --png` redraws all five identically; every preview checked (labels, holes, bands,
  the geometry of Figure 2.4, the strips of Figure 2.5 match their captions). No change.
- Widget `limit-explorer`: no change needed. Its "This δ wins" verdict comes from 4000 samples (plus the
  exact peaks of $\sin(1/x)$), so I compared it with exact suprema for all 400 (ε, δ) slider pairs of each
  function that has a limit: 0 disagreements. The thresholds $1 + \lvert L\rvert$ it states for the
  no-limit functions are exact, and every claim of the caption (largest δ = ε for the hole, δ ≫ ε for
  $\sin x/x$, δ = ε always wins for $x\sin(1/x)$, no δ wins once ε ≤ 1) holds. `node tools/widget-test.mjs
  --only limit-explorer`: 13 checks passed. Works at 360 px in both modes.

## Final state

`$CALC_PYTHON -I tools/calc.py --module 02`: 9 python blocks, 56 check blocks (1400 checks), 6 value
tables, all outputs match, no problems. `node tools/build.mjs` builds the page without problems.

## Open, and outside this module

- Nothing open in Module 2.
- Formula sheet (`src/en/formulas.md`, SymPy table): the row for `sp.oo` credits Module 3, though Module 2
  already prints `oo` and names `sp.oo`. Harmless; change only if the sheet means "first use".
- The coordinator's work-in-progress commits picked up this review's edits while it was under way; the
  working tree holds the final version.
