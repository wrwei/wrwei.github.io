# Review of Module 10, The Fundamental Theorem of Calculus

Reviewed 22 November 2026, against `notes/REVIEWING.md`. Line numbers are those of the page as it was
when the review began (1467 lines; commit ab24213); widget and figure lines likewise. The work-in-progress
commit 6ee6f1e contains this review's changes. Every worked example, exercise solution, quiz answer and
explanation was worked by hand, and every antiderivative on the page differentiated back, before the
check blocks were read; every cross-reference was opened and checked.

The mathematics of every example, solution and quiz answer was right. The problems were in the
foundations: Theorem 10.1's proof used Module 8's theorem beyond its hypotheses (Module 8 proves it on
open intervals; Definition 10.1 allows endpoints), and Part 1 of the Fundamental Theorem did not state
the one-sided derivatives at the endpoints that the page then relies on. Module 9 was restated loosely
in places, the page never said what $\ln\abs{x}$ means for a definite integral across 0, one check tested
the wrong derivative, and the widget showed meaningless numbers for integrals across a pole and for
fast oscillations.

## Correctness and precision

| Line | Problem | Fix |
|---|---|---|
| 56 | Proof of Theorem 10.1: "Module 8 ... prove[d] that two functions with the same derivative at every point of an interval differ by a constant". Module 8's Theorems 8.5 and 8.6 are for open intervals, while Definition 10.1 lets $I$ contain endpoints, with one-sided derivatives there; nothing covered them. | The proof now runs Module 8's argument on any interval: $H = G - F$ has $H' = 0$; for $x_1 < x_2$ in $I$, $H$ is continuous on $[x_1, x_2]$ (Theorem 4.1, whose proof works from one side), and the Mean Value Theorem gives $H(x_2) = H(x_1)$. Links to Theorems 8.5 and 4.1. The next paragraph says why the interval matters in terms of this proof. |
| 59 | "the function equal to $\ln\abs{x}$ for $x > 0$ and to $\ln\abs{x} + 5$ for $x < 0$ is also an antiderivative of $1/x$, at every $x \ne 0$": Definition 10.1 defines antiderivatives on an interval only. | "also has derivative $1/x$ at every $x \ne 0$"; adds that no antiderivative of $1/x$ reaches across 0, with a pointer to Section 10.5. |
| 91 | Power rule for antiderivatives: "holds on $(0, \infty)$ ... and for negative $x$ as well when $n$ is an integer" never said that it holds at 0 for $n = 0, 1, 2, \dots$, which Example 10.6(a) uses ($x^3/3$ on $[0, 1]$). | "When $n$ is an integer it holds for negative $x$ as well, and for $n = 0, 1, 2, \dots$ on all of $\R$." |
| 230 | Module 9's definite integral restated as the limit of $\sum f(x_i^*)\,\Delta x$ "as the number of subintervals grows". Module 9 takes the limit as the norm of the partition shrinks to 0 (more subintervals need not make a partition finer), with widths $\Delta x_i$. | "as the norm of the partition, the width of its widest subinterval, shrinks to 0", with $\Delta x_i$. |
| 233–236 | Splitting "when $f$ is integrable on an interval containing all three" (integrability is defined on closed intervals); the bounds property and the Mean Value Theorem for integrals stated without $a < b$, which Module 9's theorems need. | "on a closed interval that contains all three"; "if $a < b$ and ..."; "where $a < b$". |
| 241 | Definition 10.2: "Let $f$ be integrable on an interval $I$": $I$ may be open or unbounded, where Module 9 defines no integrability. | "let $f$ be integrable on every closed interval inside $I$ (as it is when $f$ is continuous on $I$)". |
| 331 | Theorem 10.2 (Part 1) gave $A'(x) = f(x)$ only on $(a, b)$. The proof's last sentence proves the one-sided derivatives at $a$ and $b$, and the key idea ("every continuous function on an interval has an antiderivative") needs them, since Definition 10.1 asks for one-sided derivatives at endpoints. | The statement adds $A'_+(a) = f(a)$, $A'_-(b) = f(b)$ (Module 4's notation) and "So $A$ is an antiderivative of $f$ on $[a, b]$." |
| 346 | Proof of Part 1: "For $0 < \abs{h} < \delta$" tacitly needs $x + h$ in $[a, b]$. | "(with $x + h$ in $[a, b]$, as throughout)". |
| 445 | Proof of Part 2 cited Module 8 for "the same derivative on an interval". It is used on the open interval $(a, b)$, which is right, but did not say so. | "on an open interval ... ([Theorem 8.6](module_08_EN.html#consequences))". |
| 483 | Pitfall (1) on Part 2 showed the trap for $1/x^2$ but not for $1/x$, whose antiderivative $\ln\abs{x}$ holds on each side of 0 separately: nothing said what that means for a definite integral across 0. | New item (2): $\int_1^2 \frac{dx}{x} = \ln 2$ and $\int_{-2}^{-1} \frac{dx}{x} = -\ln 2$, but $\big[\ln\abs{x}\big]_{-1}^{2} = \ln 2$ is not $\int_{-1}^{2} \frac{dx}{x}$, which does not exist ($1/x$ is unbounded near 0). Checks: both one-sided values, SymPy's `nan` for the integral across 0 and $\infty$ for $\int_0^2$. The old (2) is now (3). |
| 804 | "Module 9 used symmetry ... Substitution proves it": Module 9 had already proved it (Theorem 9.8, with Riemann sums). | "It proved this with Riemann sums ([Section 9.6](module_09_EN.html#symmetry)); for continuous functions, substitution gives a two-line proof." |
| 1012 | $\operatorname{Si} x = \int_0^x \frac{\sin t}{t}\,dt$: the integrand is not defined at $t = 0$. | "at $t = 0$ its integrand is given the value 1, its limit there ([Module 2](module_02_EN.html#trig-limits)), so that it is continuous", as Module 11 does; check of the limit added. |
| 1037–1040 | Summary: an initial value problem "has exactly one solution on an interval" (only if $f$ has an antiderivative there); Part 1 "if $f$ is continuous"; Part 2 "and $F' = f$", with no interval. | "on an interval where $f$ is continuous"; Part 1 on an interval containing $a$, one-sided at an endpoint; Part 2 with "$F$ is an antiderivative of $f$ there". |
| 376, 407, 742 | "no formula from the catalogue of Module 1 can express", "none can be written with the functions of Module 1's catalogue": the claim is about formulas built from those functions, as line 1031 says. | Same wording as line 1031 in all three: "no formula built from the functions of Module 1's catalogue". |
| 325 | Figure 10.3 caption: "The area function $A(x)$ is the light region." | "The value $A(x)$ of the area function is the area of the light region." |

## Check blocks

- All 53 check blocks were compared with their prose; they check what the page states, intermediate
  steps included, and every number shown with $\approx$ has a `rounds`. There are no `nocheck` examples.
- Line 150: `same(diff(3*x**2, x), 6*x)` checked something the page does not say; the page says that
  $3x^2$ is the derivative of $x^3$. Now `same(diff(x**3, x), 3*x**2)`.
- Added: Example 10.1(a)'s intermediate $6\cdot\frac{x^3}{3} - 4\cdot\frac{x^2}{2} + 5x$ (131); the quiz's
  distance 4 m by the two triangles as well as by `integrate(Abs(...))` (1463, AUTHORING 6.1); the checks
  for the changes above. Now 53 blocks, 418 checks (was 409); `calc.py --module 10` ends with
  `all outputs match`.

## Teaching

- Lines 116 and 1053: Example 10.1(d) and Exercise 10.1(d) named their function $k(x)$, right after
  part (c) of the same box used the table's constant $k$ ("With $k = 2$ in the table"). Renamed $q(x)$.
- Line 245: "dummy variable" was set in bold as a new term; Module 9 introduced it. "As in Module 9, the
  letter $t$ is a dummy variable".
- Line 4: the lead had three sentences (AUTHORING: one or two); merged into two.
- `needs`, `goals` (each practised by examples, exercises and quiz) and `minutes` (255) are accurate. The
  exercises are 4 ★, 5 ★★, 3 ★★★. No section, figure or exercise id changed, and no numbered box was added,
  moved or removed, so every reference from other pages still holds (Modules 11, 12, 16, 19 and 20 cite
  Theorems 10.1, 10.5–10.7, Example 10.11, Exercise 10.12 and Sections 10.1, 10.4, 10.5, 10.7, 10.8).

## Consistency

- Every internal reference (Sections 10.1–10.8, Definitions 10.1–10.4, Theorems 10.1–10.8, Examples
  10.1–10.13, Figures 10.1–10.5, Exercise 10.6) points to what it claims. The claims about other modules
  were checked in them: Module 1 (Section 1.1's promise, the catalogue), Module 2 (the limit of
  $\sin t/t$), Module 3 (Extreme Value Theorem, limits at infinity), Module 4 (one-sided derivatives,
  Theorem 4.1, Section 4.4's corner of $\abs{x}$, Example 4.10's particle, Exercise 4.7's ball), Module 5
  (chain rule, Section 5.7), Module 6 ($(\ln\abs{x})' = 1/x$), Module 7 (Section 7.2's differentials),
  Module 8 (Theorems 8.5, 8.6, the Mean Value Theorem, the increasing test), Module 9 (definition,
  properties, symmetry, average value), Module 11 (parts, erf and Si "(Module 10)"), Module 12 (the
  $1/x^2$ integral diverges; the normal distribution), Module 13 ($y' = ky$).
- What Module 9 promises Module 10 shows ($\ln 2$ for Example 9.4, the area 2 under one arch of $\sin x$,
  the net change theorem for displacement) is all here.

## Style and rendering

- `check.mjs`: no errors or warnings for the page. Voice and spelling checked by eye as well.
- Built; screenshots of the whole page at 1100 px and of opened solutions (`out/shots/r10/`); no KaTeX
  errors (none in the built HTML either). At 360 px the page never scrolls sideways; 13 display formulas
  and the table of $A(x)$ scroll inside their own frames, which the brief allows. The table of midpoint
  sums (502) scrolled only because of `layout = columns`; it is now three rows and fits.
- Figures (`figs_10.py`): in Figure 10.1 (lines 27, 37) the dot at $(0, 1)$ covered the tick label 1 and
  the label "$(0, 1)$" touched the curve above it; the tick keeps its grid line without a label, and the
  label moved into the gap between the curves. In Figure 10.4 (lines 130–134) the area labels mixed a
  sans-serif 4 with a math $-4$; all are now math. A comment (line 43) named "Example 10.5" for the
  function of Example 10.4. Figures 10.2, 10.3
  and 10.5 are right and were not changed (they regenerate byte for byte).
- Widget `accumulation`: its readout showed meaningless numbers in three situations, because the core's
  adaptive Simpson rule (`api.num.integrate`) returns whatever it has when its evaluation budget runs out:
  - $f = 1/x$ with $a = 1$, $x = -0.9$ gave "A(x) ≈ −1.323", and $\tan x$ from 0 to 2 gave a number,
    although these integrals across a pole do not exist (it caught the pole only when 0 happened to be a
    sample point);
  - $\sin 100x$ from 0 to 6.5 gave $-0.1004$; the integral is $(1 - \cos 650)/100 \approx 0.019524$;
  - the slope of $A$ for $\abs{x}$ at 0 read "≈ 5 × 10⁻⁵ = f(x) = 0", and for $\sin 100x$ at 1
    "≈ −0.5063 = f(x) ≈ −0.5064".

  Fixed in `accumulation.js` (lines 34–46 and 97–108): integrals are taken in pieces no wider than a grid
  step, each with its own budget, and fail where a piece does not settle, with a new readout message
  ("A(x) cannot be computed: somewhere between a and x, f is unbounded (then A(x) is not defined) or
  oscillates too fast"); results are kept until $f$ changes; the slope combines the two steps as
  $(10q - p)/9$. The test has three new checks for these cases (they fail on the old widget and pass now):
  17 checks, all passing. The widget works with the keyboard and at 360 px.

## Other modules and shared files

- `src/widgets/_core.js`, `num.integrate`: when its evaluation budget (default 200,000) runs out it
  returns an unconverged value without any sign of failure (for $1/x$ on $[-0.9, 1]$, $-1.32$; for
  $\sin 100x$ on $[0, 6.5]$, $-0.10$ instead of $0.0195$). Returning `NaN`, or reporting exhaustion, would
  protect every widget; `accumulation.js` now works around it.
- `src/widgets/riemann-sums.js` (Modules 9 and 11), lines 89–93: its guard throws after 400,000
  evaluations, but `num.integrate` stops at its own 200,000 first, so the guard never fires. On Module 9's
  page, $f(x) = \sin 100x$ on $[0, 6.5]$ shows "Integral (accurate numerical value) ≈ −0.1538311352"
  (the value is 0.0195243136), and so wrong errors. Fix: pass `maxEvals` to `num.integrate` and treat
  more evaluations than that as failure, or integrate in pieces, as `accumulation.js` now does.
- `formulas.md`, line 519: the row $\int \cot x\,dx = \ln\abs{\sin x} + C$ cites Module 10, which derives
  only $\int \tan x\,dx$ (Example 10.11(a)); the cotangent is the same substitution, $u = \sin x$, but no
  module shows it.
- `glossary.md`: `check.mjs` reports a broken anchor `#g-a` at line 6 (a page another agent is writing).
