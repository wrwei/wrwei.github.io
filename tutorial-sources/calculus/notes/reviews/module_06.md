# Review of Module 6, Exponentials, logarithms and implicit differentiation

Reviewed 22 November 2026, against `notes/REVIEWING.md`. Line numbers are those of the page as it was
when the review began (1576 lines; commit 147683e). The work-in-progress commits 120456f and c5d4bd2
contain part of this review's changes. Every worked example, exercise solution, quiz answer and
explanation was worked by hand, and every number recomputed with 30-digit arithmetic, before the check
blocks were read; every cross-reference was opened and checked.

The mathematics of every example, solution and quiz answer was right, and the page already kept
proofs, sketches and memory aids apart. The problems were in what the page said about its own
foundations (what is proved and what is taken on trust), a few conditions stated loosely (the implicit
function theorem, logarithmic differentiation, the vertical tangents of arccos), the missing arcsec
convention, a goal that no exercise practised, and a figure label across an axis.

## Correctness and precision

| Line | Problem | Fix |
|---|---|---|
| 141 | "Now choose $c = 1/m(2)$" without saying that $m(2) \ne 0$; and "With $m(2) \approx 0.693147$": the table gives only 0.6931, so the six digits came from nowhere. The check compared 0.693147 with $\ln 2$, not with where the page got it. | Says that $m(2)$, about 0.69, is not 0, and gets 0.693147 as the average of the table's quotients at $h = \pm0.0001$, the central difference of Module 4. Checks of both table values, their average and the central difference added. |
| 162 | Note "What is proved and what is taken on trust": "Everything else is proved from these two" claimed too much. The uniqueness of $e$ and the logarithm itself use Module 1's facts that $e^x$ increases and takes every positive value, not only the laws of exponents; and Sections 6.2 and 6.4 take further facts on trust (continuity of inverses, the implicit function theorem). "The Going deeper box at the end of this section" is not at the end. | Lists the properties of Module 1's powers that are used (the laws; for $a > 1$, $a^x$ increases and takes every positive value once, so that logarithms exist); "Everything else in this section"; "later in this section". The summary (1135) names both things taken on trust. |
| 238 | Going deeper: the logarithm-first route "takes nothing on trust". In this series it rests on Module 9's theorem that a continuous function is integrable, which Module 9 uses without proof. | "takes nothing about powers on trust; it rests instead on a theorem that Module 9 uses without proof, that a continuous function has an integral". |
| 417 | "its slope $1/x$ is never 0, so $\ln x$ goes on increasing": a slope that is never 0 does not make a function increase. | "stays positive, so $\ln x$ keeps increasing". |
| 589 | Implicit function theorem: the condition "(for equations built from the functions of this series)" is not the theorem's (continuous derivatives near the point), and the page did not say that the series uses the theorem without proof. | States the condition as Module 17's Theorem does; "This series uses the theorem without proof; Module 17 states it precisely." The summary (1139) says when the method is legitimate. |
| 717 | "At $x = \pm1$ the derivative of the sine ... is 0, so ... the graphs of arcsin and arccos have vertical tangent lines": for arccos the derivative that vanishes is that of the cosine, at 0 and $\pi$. | Both stated, with "$1/\sqrt{1 - x^2}$ grows without bound as $x$ approaches $\pm1$"; checks for the cosine and for the one-sided limits of both derivatives. |
| 745 | Note on arccot, arcsec and arccsc: the derivative "changes with the choice" of range, but neither formula was given, and the page did not say which range the series uses (AUTHORING section 5). | States the series' convention, $\operatorname{arcsec} x = \arccos(1/x)$ with values in $[0, \pi/2) \cup (\pi/2, \pi]$, derives $\frac{d}{dx}\operatorname{arcsec} x = \frac{1}{\lvert x\rvert\sqrt{x^2 - 1}}$ for $\lvert x\rvert > 1$ with the chain rule, showing where the absolute value comes from ($\sqrt{x^2} = \lvert x\rvert$) and why the slope is positive for $x < -1$, and gives the other convention's $\frac{1}{x\sqrt{x^2 - 1}}$, negative for $x < -1$. Checks for both signs of $x$ and both conventions. |
| 757 | "for whole numbers $n$, positive and negative": whole numbers are not negative; Module 5's theorem is for every integer. | "for every integer $n$, positive, negative or zero". |
| 802 | Example 6.8 differentiated $\ln y$ "implicitly" without saying why $y = x^x$ is differentiable, which implicit differentiation assumes. | Says first that $x^x = e^{x\ln x}$ is differentiable by the chain rule; check added. |
| 821 | Key idea, logarithmic differentiation: "It works wherever $y \ne 0$" left out that the pieces must be differentiable. | "wherever $y \ne 0$ and the pieces that $y$ is built from are differentiable; where $y > 0$, $\ln y$ will do in place of $\ln\lvert y\rvert$". |
| 1138 | Summary: "$(\ln u)' = u'/u$" with no condition. | "$(\ln\lvert u\rvert)' = u'/u$ where $u \ne 0$". |
| 1282 | The page recommended $\ln\lvert y\rvert$ but never used it where $y < 0$. | Exercise 6.5(c) now shows that $\ln\lvert y\rvert = 2\ln\lvert x + 1\rvert + 3\ln\lvert x + 2\rvert + 4\ln\lvert x + 3\rvert$ gives the same formula wherever $y \ne 0$ (every $x$ except $-1$, $-2$, $-3$; for example $x = -2.5$, where $y < 0$). Checks added. |
| 1485 | Exercise 6.11: "the astroid is the curve its positions sweep out": the ladder's positions sweep out a region. | "the astroid is the edge of the region that the ladder sweeps across". |

## Check blocks

- All 66 check blocks were compared with their prose. Apart from line 143 (above), they check what the
  page states, every intermediate result included. A scripted scan confirmed that every number shown
  with $\approx$ has a `rounds`. There are no `nocheck` examples.
- Added checks for statements that had none: the collected form $(x + 2y)\,y' = -(2x + y)$ of
  Exercise 6.3 (1230); "$70/5 = 14$" and 13.86 (1053); "about 7.4%" (1086); "8 cm" and "a sag of 5.4 m" in
  Exercise 6.9 (1410); and checks for every changed statement above. Now 67 blocks, 513 checks;
  `calc.py --module 06` ends with `all outputs match`.

## Teaching

- Goal 1 ("Explain how compound interest and the slope of $a^x$ at 0 both lead to the number $e$, and what
  is proved and what is assumed") had no exercise and no quiz question. Added Exercise 6.12 ★★★, "Two
  routes, one number": (a) prove $m(ab) = m(a) + m(b)$ without logarithms; (b) estimate $m(6)$ and
  $m(3/2)$ from the table's $m(2)$ and $m(3)$, and see the laws of logarithms in (a) and Theorem 6.2;
  (c) 6% added monthly against 5.9% added continuously (Theorem 6.6). It goes last, at ★★★, so that the
  levels stay in order without renumbering (Module 11 links to `ex-6-10`); the levels are now 3 ★,
  5 ★★ and 4 ★★★.
- Line 899: the hyperbolic section opened with the definition; it now starts from the hanging chain of
  Figure 6.5 (picture first).
- `needs`, `goals` and `minutes` (270) are accurate. No section, box, figure or exercise id changed, and
  no existing box changed number.

## Consistency

- Every reference inside the page (Sections 6.1–6.8, Definitions 6.1–6.3, Theorems 6.1–6.10,
  Examples 6.1–6.12, Figures 6.1–6.5) and into Module 1 (Example 1.6, Exercise 1.10) points to what it
  claims (scripted against the build's numbering). The claims about other modules are true: Module 3
  (the Intermediate Value Theorem, bisection, the mirror image of an unbroken graph), Module 4 (central
  differences; differentiable implies continuous), Module 7 (the balloon "per second"), Module 8 (zero
  derivative on an interval implies constant; concavity; the maximum of $x^{1/x}$), Module 9
  (integrability used without proof), Module 13 (no other solutions of $y' = ky$), Module 14 (monotone
  limits), Module 17 (implicit function theorem, used without proof).
- What other pages say about Module 6 is true (Modules 4, 5, 7–17, 20 and `formulas.md`), except the
  wording point on Module 14 below.

## Style and rendering

- `check.mjs`: no errors or warnings for the page.
- Built; screenshots of the whole page at 1100 px (`out/shots/r06/`), the solutions unfolded, and the
  widget and every display at 360 px. No KaTeX errors, and the page never scrolls sideways at 360 px. The
  two new displays were laid out so that none scrolls at 360 px.
- Figure 6.2 (`figs_06.py`, line 87): the label "slope $e^{1/2} \approx 1.65$" ran across the $y$-axis,
  and the curve $y = e^x$ crossed the tick label 1. The label now sits left of the axis and the tick 1 is
  gone; only `fig-06-2.svg` changed (the other four regenerate byte for byte). Figures 6.1 and 6.3–6.5:
  right curves and labels, nothing overlapping or cut off.
- Widget `exp-slope`: its numbers are right (central difference, marked $\approx$; exact values for
  $a = e$), it works with the keyboard and at 360 px, and its test passes (14 checks). Not changed.

## Other modules and shared files

- Module 14, line 292 says that Module 6 used the Monotone Convergence Theorem "to show that the slope of
  $2^x$ at 0 exists". Module 6 only sketches that proof, in a Going deeper box that leaves out the
  convexity of $2^x$; "to sketch why" would be exact.
- `formulas.md`: Module 6 now states the series' arcsec convention and its derivative; the formula
  sheet's table of inverse trigonometric functions could add the row. Its "Inverse function" row leaves
  out the hypothesis of Theorem 6.4 that $f$ is continuous and one-to-one on an open interval.
- PLAN.md and HANDOVER.md list a glossary page and a common mistakes page; `src/en/` has neither yet.
