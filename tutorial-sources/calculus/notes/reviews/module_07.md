# Review of Module 7, Rates, approximation and L'Hôpital's rule

Reviewed 22 November 2026, against `notes/REVIEWING.md`. Line numbers are those of the page as it was
when the review began (1763 lines). Every worked example, exercise solution, quiz answer and explanation
was worked by hand before the check blocks were read; every cross-reference into and out of the page was
opened and checked.

The mathematics of the examples, solutions and quiz was right throughout: every number, derivative, limit
and iterate checks out. The problems were in what surrounds them: hypotheses of L'Hôpital's rule not
checked at several uses, error bounds rounded the wrong way, a signed quantity called a relative error,
the error sign convention, a false remark about floating point, a wrong explanation of a Newton failure,
and a widget column that contradicted the page's own definition.

## Correctness and precision

| Line | Problem | Fix |
|---|---|---|
| 184 | Pitfall: "the derivative of $\tan\theta$ is $\sec^2\theta$ only in radians ([Section 1.4])". Module 1 only says that Module 5 will show this. | Links Section 5.4 (Module 5, `#trig`), where "all six formulas assume radians" is explained. |
| 237 | Figure 7.2 caption called $\Delta y$ and $dy$ "the differentials"; $\Delta y$ is the actual change, not a differential. | "$dx$ and $dy$ are the differentials defined later in this section". |
| 325 | "$f(x) - L(x) \approx \frac{f''(a)}{2}(x - a)^2$ for $x$ near $a$": the $\approx$ had no stated meaning. | States it: $\big(f(x) - L(x)\big)/(x - a)^2 \to f''(a)/2$ (the meaning Module 15, line 1035, proves). Check added. |
| 434 | Definition 7.3 set the measured value to $x + \Delta x$, so its error was approximation minus true value: the opposite of the series' convention (Module 9: "the exact value minus the approximation") and of this page's own $E = f - L$ (Theorem 7.1). | Measured value $\tilde x$, error $\Delta x = x - \tilde x$, with a pointer to $f(x) - L(x)$; $\tilde x$ is now read aloud here, where it first appears. No number on the page changes. |
| 484 | Pitfall: "a 50% error in the radius ... the true error is 237.5%" holds only for a radius measured too large (too small gives 87.5%). | "If the radius is measured 50% too large". |
| 501 | Newton's method "is far faster" than bisection, with no word that it may fail. | "Near a root it is far faster; but, unlike bisection, it comes with no guarantee, and the end of this section shows how it can fail." |
| 536 | Correct decimals defined, but not what happens 0.5 or more from the root (the widget showed 0 there, see below). | Defined via the absolute error; "further away, $\tilde x$ has no correct decimals at all". |
| 671 | "For 2 they [`my_sqrt` and `math.sqrt`] differ by one unit in the 16th significant digit": false. They differ by $2^{-52} \approx 2.2\times10^{-16}$, a quarter of a unit in the 16th digit; the printed strings differ in the 17th. | "They differ in the last binary digit, by $2^{-52} \approx 2.2\times10^{-16}$ ... this function returns the next one down". Checks: the difference is exactly $2^{-52}$, and `math.sqrt` is the nearer double. |
| 696, 717, 728 | Theorem 7.2's proof and Theorem 7.3 called $e_n = x_n - r$ "the error": approximation minus exact, the opposite sign to Definition 7.3 and Theorem 7.1 on the same page. | Kept the symbol and Theorem 7.3's constant $f''(r)/(2f'(r))$, because Module 15 (Section 15.5 and Exercise 15.12, "Prove Theorem 7.3") builds on exactly that form. Before Theorem 7.2 the page now defines $e_n = x_n - r$ once, as the error with its sign reversed (positive when $x_n$ is too big, $\lvert e_n\rvert$ the absolute error); Theorem 7.3 says "$e_n$ ... so each absolute error is roughly a fixed multiple of the square of the one before". |
| 745 | "$\varepsilon_n$ is the relative error of $x_n$", but $\varepsilon_n$ is signed ($\lvert\varepsilon_0\rvert \le 0.01$); Definition 7.3's relative error is not. | $\lvert\varepsilon_n\rvert$ is the relative error, $\varepsilon_n = e_n/\sqrt a > 0$ when $x_n$ is too big; "Substituting this into the identity ... and dividing". |
| 749 | "$\varepsilon_3 \le 8.1\times10^{-19}$": the bound derived is $8.13\times10^{-19}$, so the stated bound is not proved. | $8.2\times10^{-19}$. The check now tests the bounds as stated (`holds(... <= ...)`), not `rounds` of them. |
| 763 | "Theorem 7.3 promises success when $x_0$ is close enough to a root at which $f'$ is not 0": omitted $f''$ continuous, and that the theorem does not say how close. | Both stated: "It does not say how close is close enough, and for other starting values it promises nothing." |
| 788 | Example 7.11: the iterates overshoot because "the tangent lines near [the root] are so flat". Near 0 the tangents of $\sqrt[3]x$ are steep. | The real reason: at $(u^3, u)$ the tangent has slope $1/(3u^2)$, a third of the slope $1/u^2$ of the line to the root, so it meets the axis three times as far from $x_n$, at $-2x_n$. Checks added. |
| 1067, 1089 | Examples 7.17 and 7.18 applied Theorem 7.5 without checking $g' \ne 0$. | "The derivative of the bottom, $-1/x^2$, is never 0" (with differentiability for $x > \lvert a\rvert$); "The derivative of the bottom is 1, never 0 ... So, by Theorem 7.5". |
| 1386–1392, 1491, 1497, 1538, 1544 | The same omission in Exercise 7.3 (a), (b), (d) (an exercise that asks *whether the rule applies*), 7.7(a) (the third stage's bottom $6x$) and (b), and 7.8 (b), (c). | Each use now names the derivative of the bottom and why it is not 0. Every use of the rule on the page now checks the form, $g' \ne 0$ and the existence of the limit of $f'/g'$. |
| 1309 | Summary: "$\lim f/g = \lim f'/g'$ whenever the second limit exists", without $g' \ne 0$ near $a$; "the simple form, $f'(a)/g'(a)$" without its hypotheses. | Both added. |
| 1590, 1610 | Exercise 7.10: (b) "$\varepsilon_n$ is the relative error" (signed); (c) the bounds $1.5\times10^{-4}$, $3.4\times10^{-8}$, $1.7\times10^{-15}$, $4.6\times10^{-30}$ are the derived bounds $1.505$, $3.409$, $1.749$, $4.603$ rounded *down*, so three of them are not proved. | $\lvert\varepsilon_n\rvert$; bounds rounded up ($1.51$, $3.41$, $1.75$, $4.61$), and "all are below 0.01, so the inequality applies at every step" (the recursion needs it). Checks test the bounds as stated. |
| 1672 | Exercise 7.12(c): "the last compute box of Section 7.6"; there is only one. | "the compute box at the end of Section 7.6". |

## Check blocks

- Line 755: `holds(b1 >= Rational(1, 10000)/(2*(1 - Rational(1, 100))))` compared `b1` with its own
  definition, so it checked nothing. Replaced by a check that $\varepsilon_0^2/(2(1 + \varepsilon_0)) \le b_1$
  over $[-0.01, 0.01]$ (the worst case is $\varepsilon_0 = -0.01$).
- Lines 756 and 1624: bounds stated with $\le$ were checked with `rounds`, which passed although two of them were
  rounded down. Now `holds(bound <= value shown)`, plus a check that each is rounded up by less than 0.01.
- Added: the limit $\big(\sqrt x - L(x)\big)/(x - 4)^2 \to -\tfrac1{64}$; the equating step of the idea of
  Theorem 7.3's proof and $L_n(r) = -f'(x_n)e_{n+1}$; $e_n = \sqrt a\,\varepsilon_n$; the `my_sqrt` and
  `math.sqrt` doubles; the slope ratio of Example 7.11; $-1/x^2 \ne 0$ in Example 7.17; Exercise 7.4(d) (below).
- All other check blocks compared with their prose: they check what the page states, with `rounds` for every
  rounded number (including every iterate and its count of correct decimals, through `correct_dp`). There are
  no `nocheck` examples.

## Teaching

- Goal 4 says "recognise when it fails", but no exercise practised a failure (only quiz question 5 and the
  widget). Added Exercise 7.4(d), a ★ part: why is $x_0 = 0.8$ a poor start for $x^3 - 2x - 5$? ($f'(0.8) =
  -0.08$ near the zero $\sqrt{2/3}$ of $f'$; $x_1 = -75.3$; far out each step is about $\tfrac23 x_n$, so only
  $x_{12} \approx 1.97$ is back near the root, and then the digits double.) Ten checks; the widget's own
  suggestion at line 811 now has a worked counterpart. No exercise id changed.
- Line 312: Theorem 7.1 is Module 4's Going deeper box "Differentiable means locally linear" (end of Section
  4.4) again; the page now says so.
- Line 1082: Example 7.17 re-proved Module 6's Theorem 6.6 without saying so. Now: Theorem 6.6 proved it for
  whole numbers $n$ from the derivative of $\ln$ at 1; L'Hôpital's rule gives a second proof, for real $x$.
- Line 1184: "L'Hôpital's rule proves it" ignored that Module 3 states the ranking (Theorem 3.11) and proves it
  in a Going deeper box. Both now acknowledged; the key idea (line 1280) credits the notation $f \ll g$ to
  Module 3, which defines it the same way.
- Widget caption: "$\sqrt[3]x$ from any $x_0$" became "$x_0 \ne 0$" ($x_0 = 0$ is the root).
- `needs`, `goals` and `minutes` are accurate. No section, box, figure or exercise was added or removed (the new
  material is a part of Exercise 7.4), so every number and id is unchanged.

## Consistency

- All references inside the page (Sections 7.2, 7.3, 7.4, 7.6, 7.7; Definitions 7.1–7.5; Theorems 7.1–7.7;
  Examples 7.1–7.18; Figures 7.1–7.5; Exercises 7.2, 7.4, 7.10, 7.12) point to what they claim.
- Claims about other modules, checked in those modules: Module 2 (form $0/0$, squeeze theorem, quotient law,
  $\sin x/x$, cancellation error), Module 3 (IVT, bisection, $n!$, $e^x$ continuous, Theorem 3.11), Module 4
  (definition of the derivative, differentiable ⇒ continuous), Module 5 (chain rule "rates multiply", $\tan$,
  quotient rule), Module 6 (inverse functions, $\arctan$ balloon, compound interest), Module 8 (Going deeper box
  proves Theorem 7.5 in full: $0/0$ and $\infty/\infty$, one-sided, $x \to \pm\infty$, $L = \pm\infty$),
  Module 13 (solves $x'' = -\omega^2 x$, so the linearised pendulum), Module 15 (Taylor's theorem, the bound
  $\tfrac M2(x - a)^2$, Exercise 15.12 completes Theorem 7.3).
- References into Module 7 from Modules 2, 3, 4, 6, 8, 10–15, 17, 19 and the formula sheet (Theorems 7.1, 7.2,
  7.6, 7.7, Examples 7.2, 7.6, 7.9, 7.13, 7.15, 7.17, 7.18, Sections 7.2, 7.3, 7.5, 7.7, ids `#differentials`,
  `#how-good`, `#linear-approximation`, `#errors`, `#more-rates`, `#growth`, `#products-differences`, `#powers`,
  `#newton`, `#quadratic`, `#the-rule`) are all right, and stay right after this review.

## Style

`node tools/check.mjs --lang en`: no errors and no warnings for the page. New text follows Module 1's voice and
British spelling.

## Rendering

- 1100 px, whole page with every solution open: no KaTeX errors, no page errors, nothing overlapping or cut off.
- 360 px: the page never widens. Seven display formulas scrolled inside their line by 2–19 px (Example 7.3,
  the error estimate, Definition 7.4, the $0\cdot\infty$ examples, Exercises 7.4(a), 7.7(a), 7.12(a)); all are
  now split into aligned lines or use narrower spacing, and none scrolls. Three value tables (the $\sqrt x$
  versus $L(x)$ table, the $\sqrt2$ iterates with 15 decimals, the $(e^{2x} - 1)/\sin 3x$ table) scroll
  sideways inside their frames by 47, 156 and 93 px, as two tables of Module 1 do; they cannot be narrowed
  without dropping columns the text relies on, so they are left.
- Figures: `figs.py 07 --png` redraws all five identically; every preview checked against its caption and
  formulas (ladder at $x = 3$, cone with $r = h/2$, shadow ray through the head, balloon at 3:4; Newton
  tangents and iterates; the cycle and the cube-root run-away; the ratio's hollow dot at $\tfrac23$). No change.

## Widget `newton-method`

- The "correct" column showed 0 for every iterate 0.5 or more from the reference root: for $\sqrt[3]x$ from 1
  (iterates $1, -2, 4, -8$ against the root 0) and for the cycle of $x^3 - 2x + 2$ (against $-1.769$). By the
  page's definition such an iterate has no correct decimals; `decimals()` clamped a negative count to 0. It now
  shows "none" ("无"), and the note under the table says when.
- "f′(xₙ) = 0 (very nearly): the tangent is horizontal and never meets the x-axis" was false in the "very
  nearly" case ($\lvert f/f'\rvert > 10^{12}$). Separate message: the tangent is almost horizontal and meets
  the axis more than $10^{12}$ units away.
- Checked by driving it: $x^2 - 2$ from 1 gives correct decimals 0, 0, 2, 5, 11, 15 as the caption says;
  $x^3 - 2x - 5$ from 0.8 gives $-75.3$, back near the root at $x_{12}$, then 0, 1, 3, 8, 15, as Exercise
  7.4(d) says. Works at 360 px.
- Test: two checks merged, two conditions added (the cube-root rows read "none"; the start 0.8 lands near
  $-75.3$); `node tools/widget-test.mjs --only newton-method`: 15 checks passed.

## Final state

`$CALC_PYTHON -I tools/calc.py --module 07`: 9 python blocks, 66 check blocks (452 checks, from 421), 7 value
tables, all outputs match, no problems. `node tools/check.mjs --lang en`: 0 errors, 0 warnings.
`node tools/build.mjs` builds the page without problems.

## Open, and outside this module

- **Error sign convention** (the series-wide decision in `notes/reviews/cross-module.md`: exact value minus
  approximation). Module 7 now follows it everywhere it signs an error (Theorem 7.1, Definition 7.3), and
  Module 4 has meanwhile been aligned by its reviewer. For Newton's method the page keeps the signed
  $e_n = x_n - r$, defined once as the error with its sign reversed, because Theorem 7.3's limit
  $e_{n+1}/e_n^2 \to f''(r)/(2f'(r))$ is what **Module 15** builds on: Section 15.5 derives
  $e_{n+1} = \frac{f''(c_n)}{2f'(x_n)}e_n^2$ with $e_n = x_n - r$, and Exercise 15.12 "Prove Theorem 7.3" proves
  that limit. For the reviewer of Module 15: keep that sign (its sentence "let $e_n = x_n - r$ be the error of
  the $n$th iterate" could say "the error with its sign reversed", as Module 7 now does); flipping it to
  $r - x_n$ there alone would make Exercise 15.12 prove a different statement from Theorem 7.3.
- **Formula sheet** (`src/en/formulas.md`): it has none of Module 7's formulas apart from three limits:
  no L'Hôpital's rule (with its hypotheses), no linearisation $L(x) = f(a) + f'(a)(x - a)$ or differential
  $dy = f'(x)\,dx$, no relative-error rule $dy/y = k\,dx/x$, no Newton step. Worth adding (for the
  coordinator, with the formula-sheet items already in `cross-module.md`).
- Module 13, line 338: "Section 7.2 showed that ... the tangent line misses the curve by about
  $\tfrac{h^2}{2}y''$": Section 7.2 states this and leaves the proof to Module 15 (Module 13's own line 353 says
  so). Harmless; "stated" would be exact.
- Module 15, Exercise 15.12(c): "$\approx 0.354$, the constant of Example 7.9": the constant is computed after
  Theorem 7.3, from Example 7.9's iterates. Harmless.
