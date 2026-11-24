# Review of Module 11, Techniques of integration

Reviewed 22 November 2026, against `notes/REVIEWING.md`. Line numbers are those of `src/en/module_11.md`
when the review began (2094 lines, as in commit f31dbb2). Every worked example, exercise solution, quiz
answer and explanation was worked by hand before the check blocks were read: every antiderivative
differentiated back, with its intervals, the absolute values in its logarithms and the signs of the square
roots in its substitutions; every partial fraction form, every number and every error bound recomputed.
Every cross-reference was checked against the build's numbering, and every claim about another module
against that module.

The mathematics of the examples, solutions and quiz was right, apart from two solutions (Exercises 11.1(b)
and 11.9(c)). The real problems were elsewhere: the page called a computation that rests on the area of
the unit disc a proof of that area; the secant substitution covered only $x \ge a$ without saying so;
non-elementary antiderivatives were cited for a function the page never listed, and Liouville's theorem was
not plainly marked as unproved; several sentences gave bounds credit for the behaviour of errors; and a
goal had no exercise. All checks of the series' sign convention for errors (exact minus approximation)
hold throughout: Section 11.7, the Going deeper box, the Compute it box, Exercises 11.11 and 11.12, the
widget.

Final state: `calc.py --module 11`: 766 checks (was 690) in 73 check blocks, all outputs match.
`check.mjs --lang en`: no errors or warnings for the page (the one error reported is in `glossary.md`, a
page being written by another author). Build clean, no KaTeX errors, no page errors. Section, figure,
exercise and box ids unchanged; no box, figure or exercise changed number.

## Correctness and precision

| Line | Problem | Fix |
|---|---|---|
| 533, 580–588, 1566 | "Now integration can prove the formula" $\pi r^2$, and the summary "It proves that a circle encloses $\pi r^2$". Circular: the computation uses the derivatives of sine and cosine (Module 5), which rest on $\sin\theta/\theta \to 1$, and Module 2 proves that limit with the area $\pi$ of the unit disc. | "Now integration can find such areas itself"; a note after Example 11.12 says what is and is not proved (every disc and ellipse from the one fact Module 2 took from geometry); summary "It gives the areas". |
| 564 | The secant row ($0 \le \theta < \pi/2$) covers only $x \ge a$; nothing said what to do for $x \le -a$, where $\sqrt{x^2 - a^2} = -a\tan\theta$. | New paragraph: for $x \le -a$ take $\pi/2 < \theta \le \pi$, where $\tan\theta \le 0$ and the minus sign must be carried; in both cases $\theta = \arccos(a/x) = \operatorname{arcsec}(x/a)$ in Module 6's convention; or put $x = -t$. Summary says the secant row is for $x \ge a$. Checks on $(\pi/2, \pi]$. |
| 128, 1085–1089 | Example 11.2 cites Section 11.6 for "$e^{x^2}$ has no elementary antiderivative", but Section 11.6 listed only $e^{-x^2}$ among its examples. "The proofs are beyond this series" did not say plainly that Liouville's theorem itself is not proved. | "nor has $e^{x^2}$, which Example 11.2 met"; "This series proves neither Liouville's theorem nor these consequences of it: the proofs need algebra beyond the series." Summary: "(quoted here, not proved)". |
| 1591 | Exercise 11.1(b): the other choice ($u = x^2$, $dv = \ln x\,dx$) "leads to a harder integral". It does not: the new integral contains the original one, and solving for it gives the answer. | Says so, with "more work"; checks of the step and of solving for the integral. |
| 1880 | Exercise 11.9(c): "$n = 16$ is enough, a little before the guaranteed 20". $n = 10$ is already enough ($\abs{E_S} \approx 8.2 \times 10^{-7}$). | Estimate from $n = 8$ by the $1/n^4$ law, confirmed at $n = 10$: "half the guaranteed 20". Checked exactly. |
| 1287, 1445, 1501, 2072 | The bounds were given credit for the errors: "The bounds shrink like $1/n^2$, which is why doubling $n$ divides the errors by about 4"; "as Theorems 11.8 and 11.10 predict"; quiz 8, "For a function with a continuous fourth derivative ... divides the error by about 16 ... the actual errors follow it" (false when $f'''(a) = f'''(b)$). | A bound only limits an error; the errors usually follow the same pattern, and the Going deeper box shows why. Compute it box: "as their bounds ... do". Quiz 8 asks about a smooth function such as $e^x$ on $[0, 1]$; checks of the widget's ratios. |
| 1257 | (Coordinator, from the Module 8 review.) "concave up on $[1, 2]$", but Module 8 defines concavity on open intervals, and Theorem 8.11 needs one. | "positive for every $x > 0$, so the graph is concave up on $(0, \infty)$, an open interval that contains $[1, 2]$". Line 1501 likewise: concave down on $(-1/\sqrt2, 1/\sqrt2)$, "an interval that covers most of $[0, 1]$". Checks. |
| 1224 | "That example [9.4] also found $M_4 \approx 0.69122$": Example 9.4 gives 0.6912. | "$M_4 \approx 0.6912$, or 0.69122 to five decimal places"; checked from Example 9.4's midpoint values. |
| 1079 | "most functions that turn up in practice cannot be integrated that way": not something the page can vouch for. | "many". |
| 1091 | "Each is continuous on an interval, so ... its area function is an antiderivative": $\sin x/x$, $1/\ln x$, $e^x/x$ are continuous on each interval of their domains. | "on every interval inside its domain ... an area function $\int_a^x f(t)\,dt$, with $a$ in such an interval, is an antiderivative there". |
| 701, 837 | "and it works for every rational function" (only with a polynomial added when improper); Theorem 11.7 factored $Q$ without its constant factor. | "Every rational function can be decomposed, with a polynomial added in front when it is improper"; "factored as a constant times powers of ...". |
| 1950, 1956 | Exercise 11.11: "The error equals the bound" ($E_S = -\tfrac{4}{15}$ is negative). | "The size of the error, $\abs{E_S} = \tfrac{4}{15}$, equals the bound"; "equal to $\abs{E_S}$ again". |
| 1074 | Pitfall: compare with your answer "at a few points, where the difference must be the same constant" (only on one interval). | "at a few points of one interval". |
| 1114 | "the Compute it box below tests it [the prime number theorem] at a million": one value tests no limit. | "compares the two at a million". |

## Check blocks

All 72 blocks were compared with the prose around them; they checked what the page says, with every
intermediate step of the derivations. A scripted scan confirmed that every number shown with $\approx$ has a
`rounds`. Added checks for statements that had none: the two patterns of the $E_T$, $E_M$ table (ratios
about 4, $E_T \approx -2E_M$; new block after line 1255), $f'' > 0$ on $(0, \infty)$, the concave-down
interval of $e^{-x^2}$, the ratios the widget paragraph promises for $e^x$ (4, 4 and 16, and the midpoint
error about half the trapezoidal one), the circle's two halves, and checks for every changed statement
above. 690 → 766 checks.

## Teaching

- Goal 5 ("check a computer's answer by differentiating it, and recognise integrands with no elementary
  antiderivative") had no exercise, only quiz questions. Added Exercise 11.8(e): check SymPy's
  $\tfrac12xe^{x^2} - \tfrac{\sqrt\pi}{4}\operatorname{erfi} x$ by differentiating it, then show by parts that
  an elementary antiderivative of $x^2e^{x^2}$ would give one of $e^{x^2}$. Checked. (Module 19 later calls
  erfi "a relative of the error function of Module 11", which is now true twice over.)
- Line 580: the disc's area was found as the area "between" its two halves, which is Module 12's area
  between curves. Now the upper half is the region under the graph and the lower half its mirror image
  (Module 9's areas only); the same for the ellipse.
- Line 1530, widget paragraph: "Switch to the midpoint rule and do the same", but switching keeps $n$ at 32,
  so "the same" cannot be done. Now "move $n$ back to 4"; for Simpson's rule "do the same"; for $\sqrt x$
  "double $n$ again". Line 1547: the ratio 2.8 is said of Simpson's rule ("not 16"), which is what was shown.
- Line 1185: "Module 9 met the midpoint rule": Module 9 calls it the midpoint sum. Now "The midpoint sum of
  Module 9 is one, the **midpoint rule**". Line 1313: "In the same way (Exercise 11.12)" now names the
  formula of Exercise 11.12(b) that gives the estimate. Line 1756: "Module 12 shows that it is the length of
  the parabola" → "By the arc length formula of Module 12, it is ...".
- `needs`, `goals` and `minutes` (270) are accurate. The page is long (about 10,500 words outside code,
  check blocks and display formulas, against Module 1's 10,000); 270 minutes is the top of the allowed range,
  and nothing was cut.

## Consistency

- Every reference inside the page (Sections 11.1–11.7, Definitions 11.1–11.5, Theorems 11.1–11.10,
  Examples 11.1–11.21, Figures 11.1–11.5, Exercise 11.12) points to what it claims, against the build's
  numbering. References out of the page are right: Sections 10.1, 10.4, 10.5, 10.7, 10.8, Example 10.11,
  Theorems 10.1, 10.6 and 10.7, Exercise 10.12; Examples 9.2 and 9.4, Exercises 9.2 and 9.9, Section 9.3,
  Theorem 9.7; Section 8.4 and Theorem 8.11; Exercise 6.10 (`ex-6-10`, as the cross-module list asks) and
  Module 6's arcsec convention; Modules 1, 2, 3, 5, 7 anchors. One was not: line 533 cited Section 9.6 for
  $\int_0^3 \sqrt{9 - x^2}\,dx$, which is Exercise 9.4(c) (Section 9.6 has $\int_0^4\sqrt{4x - x^2}\,dx$);
  the link now goes to Exercise 9.4.
- What other pages say about Module 11 is true: Module 9 (the trapezoidal rule, why midpoint errors
  quarter, concavity and the midpoint sum, $e^{-x^2}$), Module 10 (non-elementary antiderivatives),
  Modules 12, 13, 14, 15 and 19 (parts, partial fractions, Simpson's rule, $\cos^2$ by the half-angle
  identity, erf and erfi).
- The formula sheet cites Module 11 for $\int \csc x\,dx = \ln\abs{\csc x - \cot x} + C$, which the page did
  not have. Added one sentence after the secant trick (the same trick with $\csc x - \cot x$), with checks;
  the citation is now true.

## Style and rendering

- `check.mjs`: no errors or warnings for the page, before and after.
- Built; screenshots of the whole page at 1100 px (`out/shots/r11/m11-*.png`, sheets `sheet-*.png`) and of
  the exercises with every solution unfolded (`ex-*.png`); the widget, the substitution table, the tabular
  tables and the new paragraphs at 360 px (`ph-*.png`). No KaTeX errors; the page never scrolls sideways at
  360 px. Only code and output blocks scroll inside their frames; one display (Exercise 11.5(b), line 1725)
  scrolled by 2 px at 360 px and is now on two lines.

## Figures and widget

- Figure 11.1 (`figs_11.py`, `fig_11_1`): in the right panel the curve $v = \ln u$, drawn from $u = 0.75$,
  ran through the tick label 1. It now starts at $u = 1$; only `fig-11-1.svg` changed (the other four
  regenerate byte for byte).
- Figures 11.2–11.5 checked against their captions and the text (triangle sides, levels $\sqrt\pi/2$ and
  $\pi/2$, $T_1 = 0.75$, $M_1 = \tfrac23$, slopes $-2$ and $-4$): right, nothing overlapping or cut off.
- Widget `riemann-sums` (Module 9's; not edited): driven on the Module 11 page through every step of the
  paragraph with a scratch script. $T_4 \approx 1.727221905$, ratios 4, 3.99/4/4 and 15.9/16/16 for $e^x$,
  error $\approx 0$ for $x^3 - x$ with Simpson's rule, ratios 2.83 for $\sqrt x$, error = integral −
  approximation, accurate value by adaptive Simpson: all as the page says. Its test passes (16 checks),
  including the Module 9 reviewer's new left/right note, which does not touch Module 11's paragraph.

## Other modules and shared files

- Module 12, line 470: "This integrand has no elementary antiderivative (the integral belongs to the family
  of elliptic integrals)" is a quoted fact; Module 11 now says the series proves no such statement, so
  Module 12 could add "(Module 11 explains why the series quotes such facts)".
- Formula sheet, trigonometric substitution: the secant row says "(for $x \ge a$)"; it could add that for
  $x \le -a$ one takes $\pi/2 < \theta \le \pi$ and $\sqrt{x^2 - a^2} = -a\tan\theta$, as Module 11 now does.
- Module 2 proves $\sin\theta/\theta \to 1$ with the area of the unit disc; Module 11's new note relies on
  that being said there (it is). No other module claims to prove the area of a disc.
- `glossary.md` (being written): `check.mjs` reports a link to a missing anchor `#g-a`.
