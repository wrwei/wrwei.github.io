# Review of Module 9, Area and the definite integral

Reviewed 22 November 2026, following `notes/REVIEWING.md`. Line numbers are those of `src/en/module_09.md`
at the start of the review (1559 lines, the page of commit f31dbb2). Every worked example, exercise
solution, quiz answer and explanation was worked by hand before the check blocks were read; every number
was recomputed; every cross-reference was checked against the build's numbering and every claim about
another module was opened and checked.

Final state: `calc.py --module 09`: 48 check blocks, 435 checks (was 46 and 395), all outputs match;
`check.mjs --lang en`: no errors or warnings for the page (the one error it reports is in `glossary.md`);
build clean; `widget-test --only riemann-sums`: 16 checks pass (was 15). Section ids, figure ids, exercise
ids and the numbering of every definition, theorem, example, figure and exercise are unchanged (Modules 11
and 19 cite Sections 9.3–9.7, Theorems 9.3, 9.4, 9.6, 9.7 and 9.9, Examples 9.2 and 9.4, Exercises 9.2 and
9.9).

The mathematics of every example, solution and quiz answer was right, the summation formulas are proved
three ways, and the page already said that it uses the integrability theorem without proof. The problems
were one wrong caption, statements that were looser than the definitions they rest on (the partition
without $a < b$, "the first $n$ whole numbers" in a series where 0 is a whole number, monotone bounds and
"the integral is the area of every familiar region" stated without the hypotheses or argument they need),
"total area" used but never defined, a widget note that was false for one of the widget's own functions,
and skipped steps.

## Correctness and precision

| Line | Issue | Done |
|---|---|---|
| 383 | **Figure 9.2's caption was wrong**: "the midpoint rectangles stick out over the left half of each subinterval and fall short over the right half". For a decreasing function the graph is above the midpoint height on the left half and below it on the right half (as the figure shows). | Reversed: they fall short of the graph over the left half and stick out above it over the right half. The text of Example 9.4 now says the same, and a check tests that each midpoint height lies between the end heights. |
| 8, 187, 190, 197, 252 | "The sums of the first $n$ whole numbers": the series counts 0 as a whole number (Module 1, line 322), so the first $n$ whole numbers are $0, \dots, n - 1$, whose sum is $n(n - 1)/2$. | "The whole numbers from 1 to $n$" in Theorem 9.2, its proof title and the lead-in; the goal names $1 + 2 + \dots + n$; line 252 reads "the sum of the cubes is the square of the sum". |
| 546 | Definition 9.3 (partitions) did not say $a < b$, which Definitions 9.4 and 9.5 rely on. | "Let $a < b$." |
| 563 | "The condition is the ε–δ definition of a limit from Module 2, with the partition in place of $x$" was loose, and $\lim_{\norm{P}\to0}$ was never read aloud or explained. | The condition "has the shape of" Module 2's definition, with the Riemann sums in the role of $f(x)$ and the norm in the role of the distance; it asks more than a limit of a function of one variable, since many partitions share a norm and each allows many sample points; the symbol is read aloud and called shorthand for the condition. |
| 569 | "The integral … agrees with the area of every rectangle, triangle or other region whose area you already knew": asserted, not shown, and Section 9.6 rests on it. It also omitted "integrable". | After Theorem 9.4: the right sums of $x$ on $[0, b]$ are $\tfrac{b^2}{2}(1 + \tfrac1n) \to \tfrac{b^2}{2}$ (a triangle), every Riemann sum of a constant $c \ge 0$ is $c(b - a)$ (a rectangle), and Module 11 proves the disc. Checks added. |
| 681, 721, 767 | "Total area" was used (pitfall, Example 9.8, Exercise 9.6, quiz question 5) but never defined, and the pitfall said the integral is the area "only when" $f \ge 0$ (false for an $f$ negative at a single point). | **Total area** defined beside net area, as $\int_a^b \lvert f(x)\rvert\,dx$; pitfall: "when $f \ge 0$ … Where $f$ is negative, the integral subtracts area"; summary mentions it; numerical check of $\int_0^3 \lvert x^2 - 2x\rvert\,dx = \tfrac83$. |
| 729 | Definition 9.5 stated $\int_a^a f = 0$ under the hypothesis $a < b$ and $f$ integrable on $[a, b]$, which does not cover the right end $b$ (needed in the proof of Theorem 9.6). | $\int_c^c f(x)\,dx = 0$ for every $c$ at which $f$ is defined. |
| 823, 1096, 1507 | "For a decreasing function, the right sums are lower bounds and the left sums upper bounds" was argued only for $n = 2$; the summary and quiz question 3 stated $R_n \le \int_a^b f \le L_n$ for every decreasing $f$, whose integral Theorem 9.3 does not guarantee (a monotone function can have infinitely many jumps). | Example 9.9 gives the general argument (Theorem 9.7(c) on each subinterval, then additivity) for continuous monotone $f$, with the gap $\lvert L_n - R_n\rvert = \Delta x\,\lvert f(a) - f(b)\rvert$; summary and quiz say "continuous". Checks for $n = 2, 5$. |
| 808 | "With $m$ and $M$ the smallest and largest values of $f$, part (c) says that the area under the graph lies between …": needs continuity (for the values to exist) and $f \ge 0$ (for "area"). | "When $f \ge 0$ is continuous, take for $m$ and $M$ its smallest and largest values …, which exist by the Extreme Value Theorem". |
| 70 | "Section 9.8 explains why this is no coincidence" (area under the speed graph = distance): Section 9.8 assumes it; the explanation is the displacement paragraph of Section 9.4. | "This is no coincidence: Section 9.4 explains why, and Module 10 proves it." |
| 157 | Theorem 9.1's third rule $\sum_{i=1}^{n} c = nc$ needs $n \ge 1$ (the theorem allowed $n = 0$). | "(with $n \ge 1$ in the third rule)". |
| 339 | "For an increasing function, $L_n$ is always a lower estimate of the area": "the area" assumes $f \ge 0$. | "For a positive increasing function … for a positive decreasing function". |
| 577 | "$1/x$ on every interval that does not contain 0": $(0, 1]$ is such an interval. | "on every interval $[a, b]$" (also for the polynomials, sine, cosine and $e^x$). |
| 813, 1090 | "The shortcut of Module 10 cannot evaluate it, as Module 11 explains"; "where no formula for $F$ exists": an antiderivative exists; it has no elementary formula (Module 11 makes exactly this point). | "because no formula built from the familiar functions has the derivative $e^{-x^2}$ (Module 11)"; "where $F$ has no formula built from the familiar functions". |
| 24 | "Archimedes … found areas with his method of exhaustion": the method is older (Eudoxus); Module 1 and FACTS.md say "the method of exhaustion". | "the method of exhaustion". |
| — | The formula sheet lists $\lvert\int_a^b f\rvert \le \int_a^b \lvert f\rvert$ under "Module 9 teaches these"; the page did not. | Added after Theorem 9.7: from $-\lvert f\rvert \le f \le \lvert f\rvert$, part (b) and linearity, for $f$ continuous or bounded with finitely many discontinuities; "the net area is never more than the total area". Checks added. |

The error convention (error = exact value − approximation) is defined in Section 9.3 (in the paragraph
after the first value table, line 401) and the whole page and the widget follow it: the table of
$\tfrac13 - R_n$ and $\tfrac13 - M_n$, "the error of $R_n$ is about $-\tfrac{1}{2n}$", the compute box
(`math.log(2) - riemann(...)`, "the errors are positive: … a little too small"), and the widget's
"Error = integral − approximation". Exercise 9.2 says "too large by" and "too small by", which agrees.

## Teaching

| Line | Issue | Done |
|---|---|---|
| 519 | The midpoint sum of $x^2$ skipped the midpoints $m_i = (i - \tfrac12)\tfrac1n$, the use of Theorem 9.2, and the algebra from the bracket to $\tfrac13 - \tfrac{1}{12n^2}$. | All three shown; the intermediate line $\tfrac{1}{n^3}\big(\tfrac{n^3}{3} - \tfrac{n}{12}\big)$ added and checked. |
| 366 | "The midpoint sum lies between the two: each midpoint rectangle is too tall over one half…": the reason given explains why $M_4$ is close to $A$, not why it lies between $R_4$ and $L_4$. | Two sentences: between, because each midpoint height lies between the end heights; close, because the two errors nearly cancel. |
| 225 | Cross-module item: induction is presented as new, but Exercise 5.10 already used it. | "the method that Exercise 5.10 used to prove the power rule" (linked). |
| 187 | "The Riemann sums of $x$, $x^2$ and $x^3$ in Section 9.3": only $x^2$ is there. | "(Sections 9.3 and 9.4, and Exercise 9.5)". |
| 984 | $f_{\text{avg}}$ was not read aloud. | "read 'f average'". |
| 657 | The Going deeper box did not tell a first reading it may skip it. | Added. |
| 1067 | The table of Section 9.8 cited Example 9.5 for $\int_0^b x^2\,dx = \tfrac{b^3}{3}$, which comes after the example. | "Section 9.3". |
| 93 | The Mean Value Theorem was cited without a link. | Linked to Module 8's `#mvt`. |

`needs`, `goals` (one reworded, above), `minutes` (270) and the exercise levels (4 ★, 5 ★★, 3 ★★★) are
accurate; every goal has exercises and quiz questions. The quiz positions vary (2, 1, 4, 3, 1, 4, 2, 3).

## Check blocks

All 46 blocks were compared with the prose around them; they checked what the page states, and every
number with $\approx$ has a `rounds`. Added: the error of $L_n$ for $x^2$ and the "a thousand times more
rectangles … a million times" claim; the midpoint heights of Example 9.4; $m_i$, $f(m_i)\,\Delta x$ and the
collected bracket of the midpoint derivation; the right sums of $x$; the total area; the gap
$L_n - R_n$ and $R_n < I < L_n$ for $e^{-x^2}$ with $n = 2, 5$; $\lvert\int f\rvert \le \int \lvert f\rvert$ for
three functions; the new widget caption ($L_n = R_n$ for $\sin x$ on $[0, \pi]$, error ratios near 4; near 2
for $x^2$); Exercise 9.10's bracket in its new form. One bound I wrote was too tight at first (the ratio of
right-sum errors for 10 and 10 000 rectangles is 1033, still "about a thousand"); it now tests
$1000 < \text{ratio} < 1040$.

## Rendering

- **Figure 9.4.** In the centre panel the curve $x^3 - 3x$ crossed the tick label $-2$ (it meets the axis
  at $-\sqrt3$). The label now sits above the axis, mirroring the label 2 below it, which suits an odd
  function. The right panel's ticks read $-a$ and $a$, matching its title and the caption.
- All five SVGs were regenerated: `figstyle.py` changed (commit ab24213) after these figures were drawn,
  so the files differ in structure only (grid lines drawn separately); the pictures are the same. Figures
  9.1, 9.2, 9.3 and 9.5 were checked against the text (sums, labels, dots, the partition $x_0, \dots, x_5$
  with $\Delta x_3$ and $x_3^*$ in $[x_2, x_3]$, the areas $\pm\tfrac43$, the points $\pm\tfrac{2}{\sqrt3}$).
- **Phone width.** At 360 px, nine display formulas scrolled inside their line (3 to 36 px: Example 9.6,
  Theorems 9.6 and 9.7(c), the additivity proof, Exercises 9.7, 9.10(a), 9.10(c), 9.11(b), 9.11(c)). All are
  split at natural points; now no display, table or inline formula is wider than its box at 360 px (solutions
  opened), and the page never widens. At 320 px two displays scroll by 5–6 px.
- Screenshots of the whole page at 1100 px (`out/shots/r09/`), with solutions and quiz: no KaTeX errors,
  overlaps or page errors.

## Widget

`riemann-sums` computes what it shows: checked by driving it in a browser through the Module 9 caption and
the Module 11 caption, before and after the change. One defect: for $\sin x$ on $[0, \pi]$, where the caption
sends the reader, $f(a) = f(b)$, so $L_n = R_n = T_n$ and doubling $n$ divides the error by 4.0, while the note
under the table said "by about 2". The note now says, when $f(a) = f(b)$ for the left or right rule, that the
two sums are equal and the error falls by about 4, not 2 (English and Chinese); the caption explains the
same, with a check. The test gained that case (and checks the ordinary note for $x^2$); 16 checks pass.
Module 11's widget paragraph is still true word for word: $T_4 \approx 1.727221905$ for $e^x$, ratios 4, the
midpoint errors about half as large with the opposite sign, Simpson ratios 16, $x^3 - x$ exact, $\sqrt x$ ratios
2.83.

## Left as it is

- Quiz question 5 is the integral of Example 9.10(d); it tests net against total area, and its distractors
  are good.
- At 360 px the widget's $y$-axis labels straddle the axis and a sample point can cover one (the shared plot
  layout of `_core.js`, below).
- The page is long (about 14,000 words counting the LaTeX of the prose); nothing was cut.

## Other modules and shared tools

- **Module 19, line 88**: "the error of $M_n$ is exactly $\tfrac{8}{3n^2}$". There $M_n$ overestimates
  ($M_4 = 21.5 > \tfrac{64}{3}$; its check tests $M_n - \tfrac{64}{3} = \tfrac{8}{3n^2}$), so by the series'
  convention the error is $-\tfrac{8}{3n^2}$.
- **Module 10, line 230**: "Module 9 defined the definite integral … as the limit of Riemann sums … as the
  number of subintervals grows". Module 9 defines it by the norm of the partition shrinking to 0, with
  subintervals of any widths; more subintervals do not make a partition fine. Suggest "as the widths of the
  subintervals shrink to 0".
- **Module 10, line 804**: "Module 9 used symmetry … Substitution proves it." Module 9 proves it (Theorem 9.8,
  from Riemann sums); suggest "Substitution gives a second proof".
- **Formula sheet** (`formulas.md`, the "Definition" row of the integral properties): it gives the limit of
  equal-width sums; Module 9's Definition 9.4 uses partitions of any widths with norm → 0, and the
  equal-width form is Theorem 9.4. Suggest labelling the row "Limit of sums (Theorem 9.4)". The
  "Absolute value" row is now taught in Section 9.5.
- **Glossary** (a stub at the time): Module 9's terms are sigma notation, index of summation, dummy
  variable, telescoping sum, mathematical induction (base case, inductive step), left/right/midpoint sum,
  Riemann sum, partition, norm, sample point, integrable, definite integral, integrand, limits of
  integration, net (signed) area, total area, displacement, distance travelled, error (exact value minus
  approximation), average value.
- **`_core.js`**: when the $y$-axis is near the left edge of a narrow plot, `P.axes` anchors the $y$ tick
  labels across the axis line, and points drawn later (front layer) can cover them (seen in
  `riemann-sums` at 360 px, the label 0.2 under the point at $x \approx 0.2$).
- **`tools/shot-parts.mjs`** shoots at a fixed width of 1000 px, so it cannot show parts of a page at
  phone width; scratch scripts did that for this review.
- The coordinator's note says Section 9.2 defines the error; it is Section 9.3 (Riemann sums). No page
  cites the section.
- The cross-module item for Module 9 (induction; the shared widget) is done.
