# Review of Module 13, Differential equations

Reviewed 22 November 2026, against `notes/REVIEWING.md`. Line numbers are those of the page as it was
when the review began (commit aaf1cc0, 1672 lines). Every worked example, exercise solution, quiz answer
and explanation was worked by hand before the check blocks were read; every proof was checked step by
step; every cross-reference was opened and checked against the build's numbering (Sections 13.1–13.9,
Definitions 13.1–13.7, Theorems 13.1–13.8, Examples 13.1–13.14, Figures 13.1–13.5, Exercises 13.1–13.12).

The page was in good shape. All 14 examples, 12 solutions and 8 quiz answers are right, and every
solution of a differential equation is substituted back in its check. Separation of variables, the
growth-and-decay theorem, the integrating factor theorem and the theorem on $ay'' + by' + cy = 0$ are
proved correctly; Theorems 13.1 and 13.7 are said to be used without proof; complex roots are handled by
substitution, with Euler's formula left to Module 15 and said so; every error follows the series' sign
(exact minus approximation), including the widget's. The problems were a uniqueness statement that was
false as worded, a claim about Exercise 13.10 that the exercise did not prove, an inaccurate figure
caption, a gap in when separation finds every solution, model constants without units, and a few
overstatements about numerical methods and SymPy.

## Correctness and precision

| Line | Problem | Fix |
|---|---|---|
| 105–111 | Theorem 13.1: "two solutions of the problem agree on any open interval containing $t_0$ on which both are defined". False when $F$ is defined beyond the rectangle: a solution can leave it, reach a level where $F_y$ fails, and branch there. For $F = 3\abs{y - 2}^{2/3}$, $F$ and $F_y$ are continuous on $-1 < y < 1$ around $(0, 0)$, yet the solution $2 - (2^{1/3} - t)^3$ with $y(0) = 0$ reaches 2 at $t = 2^{1/3}$ and can stay there or rise again. | The rectangle is named $R$, its ends may be infinite (so $R$ may be the whole plane, as every later use needs), and uniqueness is for "two solutions of the problem whose graphs lie in $R$ … on every open interval containing $t_0$ on which both are defined" (true: the set where they agree is open by local uniqueness and closed). One sentence: outside $R$ it promises nothing. |
| 283, 1490, 1501 | Example 13.6: "(Exercise 13.10 shows that this happens at every step.)" Exercise 13.10(c) only showed that the value at $t = 2$ is too low. | (c) now asks for, and proves, $y_n < y(t_n)$ for every $n \ge 1$: $y(t_n) = t_n - 1 + 2(e^{-h})^n$ and $0 < 1 - h < e^{-h}$; the value at $t = 2$ for $n \ge 3$ follows. Example 13.6 says "Exercise 13.10 proves that the approximations stay below the solution at every step", and recalls once that the error is the exact value minus the approximation. Checks added for both. |
| 184 | Figure 13.1 caption: the equilibria $y = 1$ and $y = 3$ "separate the solutions that approach 1 from those that grow without bound". Only $y = 3$ does. | "The constant solutions are $y = 1$ (stable, green) and $y = 3$ (unstable, red): the solutions that start below 3 approach 1, and those that start above 3 grow without bound." |
| 528–548 | Separable equations: the key idea recovers the constant solutions, but nothing said when the steps find *every* solution, and Example 13.7 divided by $y^2$ in (a) and (b) before knowing that those solutions are never 0. | A paragraph after the key idea: when $g$ is continuous and $h'$ continuous, Theorem 13.1 (with $F_y = g(t)h'(y)$) shows that no other solution takes a value where $h = 0$, so dividing is allowed; without that condition it can fail ($y = t^3$ and $y' = 3y^{2/3}$). Example 13.7 now says first that the solutions of (a) and (b) are never 0. Line 577 (growth and decay) now notes that Theorem 13.1 already answers its question, and that Theorem 13.4 proves it without the unproved theorem. |
| 916–920, 969 | Theorem 13.7, "has exactly one solution … and it is defined for every $t$", did not quite give what the proof of Theorem 13.8 uses (a solution on any interval agrees with the formula). | "has a solution … defined for every $t$, and only one: any solution with these two values on an open interval containing $t_0$ agrees with it there"; the text adds that Theorem 13.8's formulas prove the existence half. The proof's last step reads "so $y$ agrees with the formula on its interval". |
| 387 | "RK4's error … is $O(h^4)$" needs a smooth $F$; "Methods of this family … are what numerical software uses" overstated; RK45 was not named. | "When $F$ is smooth, …"; "are standard in numerical software"; per `notes/FACTS.md`: SciPy's `solve_ivp` uses RK45 unless told otherwise, a Runge–Kutta method of order 5(4) that adapts its step to an error tolerance, with one sentence on what "5(4)" means, and that the series does not install SciPy. |
| 1144 | "`dsolve` does not produce one" for $y' = t - y^2$: true, but in SymPy 1.14 `dsolve` stops with `TypeError: bad operand type for unary -: 'list'`, which a reader who tries it meets unwarned. | "SymPy 1.14 stops with an error message"; checks that `dsolve` gives no formula and that $y = u'/u$, $u$ made of Airy functions, solves the equation. "The digits that do not change are the ones you can trust" became "usually". |
| 345, 1208 | "Halving $h$ halves the error", "halving $h$ halves it": only roughly (the table's successive errors have ratios 1.7 to 1.95). | "roughly halves", as Module 4 says; "about ten times as many steps". |
| 1404 | Exercise 13.7: "$C/t^2$ grows without bound unless $C = 0$"; for $C < 0$ it falls without bound. | "is unbounded unless $C = 0$ (it tends to $\infty$ if $C > 0$ and to $-\infty$ if $C < 0$)". |
| 1528 | Exercise 13.11: "$0 \le v < 49$" holds only for $t \ge 0$, and the reason was not given. | "for $t \ge 0$ (it rises, since $v' > 0$ there, and cannot cross the equilibrium)"; check added. |
| 99 | "Example 13.1 found exactly one solution with $y(0) = 1$": it found one member of its family. | "In Example 13.1 exactly one function of the family has $y(0) = 1$". |

**Models: assumptions and units.** The assumptions were stated; several constants had no units. Added:
$k$ of growth and decay, per unit of time, with what $k = 0.02$ per year means and that $k$ is the birth
rate minus the death rate per individual (line 132); $k$ of the cooling law, per unit of time, depending
on the object and its surroundings (138); $c$ of the falling body in kg/s, so that $cv$ is in newtons
(140); $r$ per unit of time and $K$ in the units of $y$ for the logistic equation (651); $E/R$ in amperes
and $t$ in seconds for the capacitor (849); the spring's $m$ in kg, $x$ in metres (now "displacement",
negative when compressed, rather than "distance"), $k$ in N/m and $c$ in N·s/m (885); the thermometer's
$k$ per minute (1346–1348).

## Check blocks

Every check block was compared with its prose. Added, for claims the page makes that were not checked:
every Euler value of Example 13.6 lies below the solution; $F_y = g(t)h'(y)$ and the $3y^{2/3}$
counterexample; the constant solution $y = 0$ of Example 13.7(c) substituted; the logistic denominator
is $K/y_0$ at $t = 0$ and increasing for $y_0 > K$ ("defined for all $t \ge 0$", line 682); $\mu = e^{2t}$
in the integrating-factor pitfall (line 874); the small-angle pendulum; `dsolve` and the Airy functions
(line 1144); Exercise 13.10(c)'s new proof ($y(t_n)$, $0 < 1 - h < e^{-h}$, $y_n < y(t_n)$ for several
$h$ and $n$); $v' > 0$ for $-49 < v < 49$ (Exercise 13.11). 65 check blocks (63 before), 469 checks (430);
`calc.py --module 13` ends with `all outputs match`. There are no `nocheck` examples.

## Teaching

- Notation read aloud where it was not: $F_y$ ("F sub y"), $\sigma(t)$ ("sigma of t").
- Exercise 13.10(a) names the third step of the induction (it substitutes the hypothesis).
- Module 7 (Section 7.2, line 382 of `module_07.md`) says that replacing $\sin\theta$ by $\theta$ turns
  the pendulum's equation into one that Module 13 solves exactly, but the page never mentioned the
  pendulum. Section 13.8 now has two sentences: $\theta'' = -\tfrac{g}{\ell}\theta$, period
  $2\pi\sqrt{\ell/g}$ for small swings, with a check.
- `needs`, `goals` and `minutes` (270) are accurate; the exercises cover the six goals at three levels
  (4 ★, 5 ★★, 3 ★★★). No numbered box, section, figure or exercise was added, removed or moved, so every
  number and id, and every reference into the page from other modules, is unchanged.

## Consistency

- Cross-module item (Module 7 review): line 338 "Section 7.2 showed" now reads "stated (Module 15
  proves it)". Done; it can be struck in `cross-module.md` (not in my remit to edit).
- References out of the page are right: Section 1.3 (the falling ball), Section 1.4 (addition formula),
  Module 2's one-sided limits, Section 4.2, Section 4.7 (big-O as $h \to 0$ and "order"), Module 5's chain
  rule, Module 6 (checked $Ce^{kt}$ and promised Module 13 would show there are no other solutions;
  proved $(1 + x/n)^n \to e^x$; hyperbolic functions; doubling time), Section 7.2 (`#linear-approximation`,
  `#how-good`), Module 7's products-and-differences section, Module 8 (MVT, concavity), Module 11
  (Simpson's rule, partial fractions, parts), Module 14's Monotone Convergence Theorem, Module 15 (proof
  of the linear-approximation bound; Euler's formula), Module 17 (partial derivatives).
- Claims that other modules make about Module 13 are true: Modules 1, 5 (every motion with $a = -s$ is
  a combination of a sine and a cosine: Theorem 13.8), 6, 7 (now including the pendulum), 8, 10, 11
  (the logistic integral), 15 (complex roots, checked by substitution), 20.

## Style and rendering

`check.mjs` reports no errors or warnings for the page (its one error is in `glossary.md`, another
page). Screenshots at 1100 px (all 49 screens, plus every solution opened) show no KaTeX errors,
overlaps or cut-off content. At 360 px the page does not widen and no display formula scrolls (the
thermometer's unit, first added inside a display that then scrolled by 2 px, went into the sentence);
an inline $\frac{K - y_0}{y_0}$ that rendered tiny is now $(K - y_0)/y_0$ (line 1122). Two tables
scroll inside their frames at 360 px, which the brief allows: the value table of $(1 + h)^{1/h}$ by
28 px, Exercise 13.3's table by 53 px (dropping its $n$ column would still leave 2 px).

## Figures and widget

- The five figures are drawn from their formulas, and their captions match them (checked against the
  code: the solutions of $y' = (y - 1)(y - 3)$, Euler's steps, the logistic curves, the three springs).
  They were regenerated: the committed SVGs predated the current `figstyle.py` (tick labels with white
  halos, grid drawn as lines); the output is deterministic. In Figure 13.3 the orange curve passes behind
  the tick labels −2, 2 and −1; the halos keep them readable, so it was left.
- `slope-field`: no change needed. Five presets, as the page says; error = accurate − Euler, as the series
  requires; $T = 1$ for $y' = y$, so the widget reproduces the value table; "≈" on every rounded number;
  Chinese strings checked; usable with the keyboard; works at 360 px. Its test passes (12 checks).

## For other modules and the coordinator

- **Formula sheet** (`formulas.md`, differential equations): its letters differ from Module 13's
  (logistic $dP/dt = kP(1 - P/M)$ against $y' = ry(1 - y/K)$; linear $y' + P(x)y = Q(x)$ with $I(x)$
  against $y' + p(t)y = q(t)$ with $\mu$; $\beta = \sqrt{4ac - b^2}/(2\abs{a})$ against $/(2a)$). Both are
  correct; matching Module 13 would help readers.
- **Module 15** (Euler's formula, about line 1535): "Module 13 solved $y'' + py' + qy = 0$ … gave
  $e^{at}\cos bt$ and $e^{at}\sin bt$ with $a = -\tfrac p2$". Module 13 solves $ay'' + by' + cy = 0$ and
  writes $\alpha$, $\beta$, so Module 15's $a$, $b$ clash with Module 13's coefficients; using $\alpha$
  and $\beta$ there would avoid the clash.
- **`notes/FACTS.md`**: the RK45 row could quote the `solve_ivp` docstring's sentence on error control
  (the order-4 estimate controls the error, the steps use the order-5 formula), which backs the page's
  one-sentence explanation of "order 5(4)".
