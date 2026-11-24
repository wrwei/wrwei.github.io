# Review of Module 1, Functions and change

Reviewed on 22 November 2026, following `notes/REVIEWING.md`. Line numbers are those of
`src/en/module_01.md` at the start of the review (commit d22d2c8). Every worked example, exercise
solution and quiz answer was worked by hand before the check blocks were read; all were right. The
coordinator's work-in-progress commits picked up part of this review while it was under way.

Final state: `calc.py --module 01`: 320 checks (was 299), all outputs match; `check.mjs --lang en`:
no errors or warnings; build clean; `widget-test --only function-explorer`: 14 checks pass (was 12).
Section ids, figure ids, exercise ids and the numbering of every definition, theorem, example,
figure and exercise are unchanged: other modules cite Examples 1.2–1.12, Exercises 1.8–1.11,
Figure 1.5 and Theorem 1.2 by number, and Module 3 quotes line 349 verbatim.

## Correctness and precision

| Line | Issue | Done |
|---|---|---|
| 49 | "backpropagation … is the chain rule of Module 5", but Module 5 says it is the chain rule organised for many inputs and that Module 17 shows how it works | "the chain rule (Modules 5 and 17)" |
| 51 | "this module … ends with the first step towards the derivative (Section 1.6)": it ends with Section 1.7 (Python) | "studies functions … and then takes the first step" |
| 118 | "In the first four parts of this series, inputs and outputs are real numbers": Module 15 defines complex numbers and $e^z$ | "In Parts I to IV …, apart from a look at complex numbers in Module 15" |
| 271 | Deeper box: "can print, read the clock or change other variables, so equal inputs may give different outputs"; printing does not change outputs | Reworded: reading the clock or shared variables changes outputs; printing is something else a function may do |
| 940 | The table's middle column, $s(1+h) - s(1)$, was called "the distance fallen", but it is negative for $h < 0$ | "the change in distance", with a sentence on why the average speed stays positive |
| 1280 | Summary bullet on transformations had no condition on $c$ | "For $c > 0$ … for $c > 1$ …" |
| 1529 | Ex 1.9(c) "Why is it negative?": only when $a$ and $a + h$ lie on the same side of 0 | Condition stated ($\abs{h} < \abs{a}$), with the counterexample $a = 2$, $h = -3$ (quotient $\tfrac12$); checked |
| 1585 | Ex 1.11(b) inferred the instantaneous rate from centred intervals only, while Section 1.6 uses $(f(a+h) - f(a))/h$ | Added that this quotient is $2pa + q + ph$, which also approaches $2pa + q$; checked |
| 1587 | Ex 1.11(c): Section 1.6 used intervals "starting at $t = 1$"; they also ended there | "starting or ending at $t = 1$" |
| 1654 | Quiz 7: explanation did not cover the option 3 | "3 is the change in $x$ alone" |

## Python set-up against `notes/FACTS.md`

Every claim was compared with FACTS; versions (3.11.18, SymPy 1.14.0, mpmath 1.3.0, NumPy 2.4.6,
matplotlib 3.11.2) also match `$CALC_PYTHON` and `tools/requirements.txt`.

| Line | Issue | Done |
|---|---|---|
| 984 | "No Python runtime is installed yet, so the install manager installs the latest release": FACTS gives this as a condition, and a reader may already have Python | "If no Python runtime is installed yet, …" |
| 990 | "After installation the commands `python`, `py` and `pymanager` are available" came after the step that uses `python` | Moved into step 2 |
| 992 | "Guides that describe the traditional full installer are out of date": FACTS says only that it is deprecated since 3.14 and not produced for 3.16 or later (so it still exists for 3.15) | "Many guides still describe the traditional full installer. It has been deprecated since Python 3.14 and will not be produced for Python 3.16 or later, so this page uses the install manager." |
| 1020 | Linux readers with Python 3.11 were not told whether it works | "Python 3.11, which produced the outputs on these pages, works too" (FACTS, Packages) |
| 1209 | Only Python's complex cube root was shown; SymPy behaves the same, which Module 8 (line 213) says Section 1.7 showed | New python block: `sp.root(-8, 3)` gives `2*(-1)**(1/3)`, `sp.real_root(-8, 3)` gives `-2`; line 381 now says "Python and SymPy do not" |

## Check blocks

- 958: "the average speeds settle down to 9.8 m/s" (and the tangent slope 9.8 in Figure 1.5's caption) had no check: one-sided `limit_is` from each side, and the derivative at 1.
- Ex 1.8(c) "approach 3" had no check: `limit_is`.
- Ex 1.10(c): the completed square was shown non-negative at one sample point only: now `is_nonnegative` for all real $x_1$, $x_2$.
- 242: "ReLU is the same as max(0, x)" was checked at three points: now on both pieces symbolically.
- New text is checked: the steps added to Examples 1.2 and 1.9, the triangle derivation of the exact values, Ex 1.9(c) and Ex 1.11(b).

## Teaching

- Example 1.2 (191, 195): the input $x = \sqrt{4 - y^2}$ appeared without saying where it comes from, and "$x^2 + y^2 = 4$ … so the graph is the upper half of the circle" assumed the circle's equation: both explained (solve for $x$; Pythagoras' theorem).
- 617: "The exact values … come from two triangles of school geometry" without the computation: the two Pythagoras steps added, and the rows for 0 and $\pi/2$ traced to the points $(1, 0)$ and $(0, 1)$.
- 606: "The tangent has period $\pi$" without a reason: points to the $\pi + \theta$ formulas below.
- Example 1.9 (722): "taken at $x = -2 + \sqrt{4 - y}$" without the step: $g(x) = y$ means $(x + 2)^2 = 4 - y$.
- Widget caption (710): after "set $a = -1$", "Choose $\sin x$" kept $a$, $c$, $d$: "Press Reset, choose …".
- Ex 1.4(a) (1366) asked for $\log_2 32$, worked in the text at line 494: now $\log_3 81$.
- Compute box (1110): "These are the polynomial of Example 1.4, its value …" reworded.

## Rendering

- Figures: labels collided with curves (white halos hid the lines behind them, leaving gaps).
  Measured with a bounding-box script, then fixed: Figure 1.1 (both $Q$ labels on a secant or the
  tangent; "secants" on the curve); Figure 1.2 (y tick 2 on the semicircle; "domain" across the
  y-axis); Figure 1.3 (the $x^2$ label on the parabola; the cubic's formula on the curve and the y-axis;
  $(\frac12)^x$ on its curve; $y = x$ on the dashed line; "tan x" across an asymptote and a branch;
  $\pm\pi/2$ crossed by asymptotes and a branch; tick labels 1, −1, −2 crossed by curves); Figure 1.4
  (tick 1 on the cosine; $3\pi/2$ touched by the cosine; the angle arrow stopped short of the
  radius). All five previews looked at again; captions still match.
- Summary bullet: two inline `\dfrac` on consecutive lines touched at 1100 px; now slash forms.
- Ex 1.3 and Ex 1.9 solutions: chains of inline `\dfrac` touched at 360 px (and "−60 ·" broke across
  lines): the computations are now displays, which fit at 360 px.
- No KaTeX errors; no horizontal page overflow at 360 or 1100 px; widget usable at 360 px (checked
  with 1/x, ln x and a = 0).
- Left as is: about ten older display formulas (Definition 1.4, Examples 1.6, 1.7, 1.12, the $\pi \pm
  \theta$ formulas, Exercises 1.8, 1.10, 1.11) scroll inside their line at 360 px, which the brief
  accepts; most are in solutions, whose boxes are only about 238 px wide on a phone.

## Widget `function-explorer`

- For $b = 0.75$ it said "stretched horizontally by a factor of 1.33", an approximation without "≈"
  (against AUTHORING section 9): factors are now exact (4/3).
- For $a = 0.5$ it said "squashed vertically by a factor of 0.5", while $b = 2$ gave "squashed
  horizontally by a factor of 2" for the same halving: both now use the geometric factor (2); $a = 0$
  reads "flattened onto the x-axis" instead of "squashed by a factor of 0". Chinese strings updated
  to match.
- Test: three new checks (exact 4/3, the formula, the vertical factor).

## Other modules and shared files (not edited)

- `formulas.md`: "Change of base" is credited to Module 6, but Module 1 derives it (Section 1.4) and
  Module 6 (line 460) cites Module 1 for it; "Even power $\ln(x^2) = 2\ln\abs{x}$" is credited to
  Module 1, which does not state it; `sp.symbols(…, positive=True)` is credited to Module 1, which
  never shows assumptions.
- Module 8, line 213: "Python, and SymPy too, take $x^{2/3}$ of a negative number to be complex, as
  Section 1.7 showed": true now that Section 1.7 shows SymPy.
- Module 4, line 81: "the point-slope form of Section 1.4"; Module 1 calls it the point-slope
  equation (minor).
- Shared CSS (`src/assets/`): display formulas in nested boxes (solutions) overflow at 360 px in
  Module 1 and probably elsewhere; slightly smaller display mathematics or less padding in nested
  boxes on narrow screens would let most of them fit.
- `src/widgets/_core.js`: the plot's tick labels sit on curves that pass through them (e.g. −3, 3, 6
  for $\sin x$ in the function explorer); cosmetic.
