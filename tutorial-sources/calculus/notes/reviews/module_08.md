# Review of Module 8, The shape of a graph and optimisation

Reviewed 22 November 2026, against `notes/REVIEWING.md`. Line numbers are those of the page as it was
when the review began (commit 6e9310b, 1641 lines). Every worked example, exercise solution, quiz answer
and explanation was worked by hand before the check blocks were read; every proof was checked step by
step; every cross-reference was opened and checked against the build's numbering.

The page was in good shape. Fermat's theorem, the closed interval method, Rolle's theorem, the Mean
Value Theorem and its consequences, Cauchy's mean value theorem, the tests for increase, concavity,
inflection points and extrema, and Theorem 8.14 are stated with the right hypotheses and proved
correctly; the definitions of increasing, concave up and inflection point are precise; $f''(c) = 0$ is
never treated as enough for an inflection point; every optimisation example states its domain and says
which theorem makes the critical number the absolute extremum. All 18 examples, 12 solutions and 8 quiz
answers are right. The problems were two false statements (one about the widget, one about
derivatives), two small gaps in the general proof of L'Hôpital's rule, a few overstatements, and checks
that did not cover everything the prose claims.

## Correctness and precision

| Line | Problem | Fix |
|---|---|---|
| 810 | Widget caption: "the widget, like Python, reads `x^(2/3)` as undefined for $x < 0$". False twice: `_core.js` now takes a negative base to a power $p/q$ with $q$ odd as real (so `x^(2/3)` is $(\sqrt[3]{x})^2$), and Python makes it complex, not undefined (as the page's own compute box says). | The caption tells the reader to type `x^(2/3)(x - 5)` and says the widget, unlike Python, uses the real cube root, as the series does. Verified in the widget (same summary as `cbrt(x^2)(x - 5)`); the widget test now types exactly that. |
| 468 | "In this series $f'$ is continuous wherever it exists": false within the series, since $x^2\sin(1/x)$ (Exercises 4.11(b) and 5.11) is differentiable everywhere with a derivative that is not continuous at 0. | "Every derivative in this module is continuous wherever it exists"; a short note gives the counterexample, with its derivative $2x\sin(1/x) - \cos(1/x)$; checks added. |
| 418–424 | Going deeper, the form $\infty/\infty$: the case $L = -\infty$ was not covered ("The other directions follow" covers directions, not signs), and "choose $y$ so that $Q > 2M$" left implicit that $Q$ depends on $x$. | "choose $y$ in $(a, b)$ so that $f'(t)/g'(t) > 2M$ for $a < t < y$; then $Q > 2M$ for every $x$ in $(a, y)$ … as $M$ is arbitrary, $f(x)/g(x) \to \infty$. If $L = -\infty$, apply this to $-f$." The rest of the proof (0/0 and $\infty/\infty$, finite and infinite $L$, one- and two-sided, $x \to \pm\infty$) was checked line by line; it proves Theorem 7.5 exactly as Module 7 states it, and now links to it. |
| 727 | Tip: "The first derivative test always decides". It decides only when $f'$ keeps one sign on each side of $c$ (it says nothing for $x^4(2 + \sin(1/x))$, whose $f'$ changes sign infinitely often near its minimum). | "decides whenever $f'$ keeps one sign on each side of $c$, as it does for every function in this module". |
| 862 | Theorem 8.14 concluded only "$f(c)$ is the absolute maximum value", but Exercise 8.10(a)–(c) needs $f(x) < f(c)$ for $x \ne c$ (to get $\ln\pi/\pi < 1/e$ strictly). The proof already showed it. | "taken only at $c$" in the statement (as Theorem 8.11 has), and the proof's last line says so. |
| 184 | Pitfall: "$1/x$ on $[-1, 1]$ has no maximum value, since it is not defined at 0". Being undefined at 0 is why the method does not apply, not why there is no maximum. | "$1/x$ is not even defined at 0 … and it has no maximum value there: $1/x \to \infty$ as $x \to 0^+$." |
| 1094 | Gradient descent: "This is a rule of thumb, not a theorem". The local convergence for $0 < \eta < 2/f''(c)$ is a theorem when $f''$ is continuous near $c$ (the Mean Value Theorem applied to $f'$ gives $\abs{x_{k+1} - c} \le \rho\abs{x_k - c}$). | "This argument is a rule of thumb, not a proof … (When $f''$ is continuous near $c$, the Mean Value Theorem applied to $f'$ turns it into a proof that the steps converge for $0 < \eta < 2/f''(c)$.)" |
| 594 | "a function whose graph is concave up is called convex": the optimisation words are broader (a line is convex), while concave up here means $f'$ strictly increasing. | One sentence added: the two words also allow straight stretches, so a line is both convex and concave. |
| 260 | Figure 8.2 caption: "Tilt the left picture and you get the right one". The panels show different intervals ($[-2, 1]$ and $[-2, 2]$), so this is false as stated. | "The Mean Value Theorem is Rolle's theorem tilted: the secant takes the place of the horizontal segment, and the tangents parallel to it the place of the horizontal tangent." |
| 442 | "Module 4 … promised the converse": Module 4 promises a partial converse. | "a partial converse: where $f' > 0$ on an interval, $f$ rises". |
| 1069 | "If $f'(x_k) > 0$, $f$ increases at $x_k$": increasing is defined on intervals. | "the graph slopes upwards at $x_k$". |
| 529 | "The first derivative test also gives inequalities": Example 8.8 uses Theorem 8.8, not the test. | "The same reasoning proves inequalities …". |
| 165 | "$(-1)^{2/3} = (-1)^2 = 1$" skipped the cube root. | $\big(\sqrt[3]{-1}\big)^2 = (-1)^2 = 1$. |
| 302 | The MVT proof ended at "$h'(c) = f'(c) - m$" without the conclusion. | "…, this says $f'(c) = m$." |
| 1436–1446 | Exercise 8.8 said Section 4.7 "modelled the error … as $E(h) = h^2 + \varepsilon/h$"; Section 4.7 now states $h^2 + \varepsilon/h$ as a bound on the size of the error, with error = exact minus estimate (the coordinator's request). | "bounded the size of the error … by about $E(h)$ … this bound is smallest at …"; (a) "the rounding part of the bound, $\varepsilon/h^*$, is twice the truncation part"; (b) "its smallest central errors in size". The numbers quoted (ε = 2⁻⁵² ≈ 2.2 × 10⁻¹⁶, about 5 × 10⁻⁶, about 7 × 10⁻¹¹, central errors about 10⁻¹⁰ near those steps) agree with the current `module_04.md` (lines 962, 1056 and its table); a check now recomputes the table's central errors. No other signed error is stated in Module 8 (its other "errors" are a model's loss, the mean squared error and Python's overflow error). |

## Check blocks

Every check block was compared with its prose. Added, for claims the page makes that were not checked:
the peak at 2 and valleys at 0 and 5 of Figure 8.1; the three counterexamples to Rolle's hypotheses
(line 270; SymPy gets the left limit of the `Piecewise` at 1 wrong, so the left piece is checked);
$\sigma$ takes every value in $(0, 1)$ and no other; $f$ increasing on $[3, \infty)$ in Example 8.10; the
signs of $f'$ and $f''$ in Examples 8.11 and 8.12; the can for any volume $V$ ($r^{*3} = V/(2\pi)$,
$h = 2r^*$) in Example 8.14; every cubic's half-turn symmetry about its inflection point (Exercise 8.3(c));
the side of the oblique asymptote in Exercise 8.5; $x^2\sin(1/x)$'s derivative; Section 4.7's central
errors (Exercise 8.8). 57 check blocks, 462 checks; `calc.py --module 08` ends with `all outputs match`.
There are no `nocheck` examples.

## Teaching

- `needs` now names what the proofs rest on: the Intermediate and Extreme Value Theorems (Module 3), as
  well as asymptotes, the rules of differentiation and linearisation. `goals` and `minutes` (270) are
  accurate; the exercises cover all six goals at three levels (4 ★, 5 ★★, 3 ★★★).
- Example 8.5 now says that Module 6 proved $\arcsin x + \arccos x = \pi/2$ from the addition formula, so
  a reader who remembers it is not puzzled.
- The sign-chart aside about non-continuous derivatives is a `::: note` after the paragraph, so that
  "Mark those points" still refers to the critical numbers.
- No numbered box, section, figure or exercise was added, removed or moved, so every number and id, and
  every reference into the page from Modules 11, 17 and 18 (Theorems 8.1, 8.4, 8.11; Examples 8.14,
  8.15, 8.18; Sections 8.4, 8.7), is unchanged and still right.

## Consistency

All references inside the page (Sections 8.1–8.7, Definitions 8.1–8.6, Theorems 8.1–8.14 with Cauchy's
as 8.7 inside the Going deeper box, Examples 8.1–8.18, Figures 8.1–8.5) and into other modules are right:
Example 4.8 and the promise that the graph falls from (1, 1) to (2, 0); Theorem 4.1; Section 4.3's
definitions; Section 4.7; Exercise 1.11; Section 1.4 (even and odd); Section 1.7 (Python's complex cube
root); Module 3 (EVT, IVT, continuity of the real cube root, "Module 8 calls these the absolute
maximum"); Module 6 (power rule at $x < 0$ for the real cube root, derivatives of arcsin and arccos,
$\arctan x + \arctan(1/x)$, $x^{1/x}$); Module 7 (Theorem 7.5 as recalled, $x^* \approx 0.567143$ from
Exercise 7.9, exponentials beat powers); the Mathematical Foundations link (`../math/module_19_EN.html`,
"Convexity, gradient methods, and unconstrained optimisation"). Claims that other modules make about
Module 8 are true (Modules 3, 4, 6, 7, 9, 10, 11, 12, 13, 15, 17, 18).

## Style and rendering

`check.mjs` reports no errors or warnings for the page. Screenshots at 1100 px (all 51 screens, plus
every solution opened) show no KaTeX errors, overlaps or cut-off content. At 360 px the page does not
widen; the fourteen widest displays (the MVT statement, the sigmoid identity, Theorem 8.11, the
gradient step, the Q display of the proof, and nine in the solutions of Exercises 8.6, 8.9, 8.11 and
8.12) were split into `aligned` lines or moved into text, so none now scrolls more than about 1.3 times
the column width (before: up to 2.1). Some tables and code blocks scroll inside their frames, as the
brief allows.

## Figures and widget

- Figure 8.4 (right): the "concave down" label sat under $1.1 \le x \le 3.6$, mostly under the
  concave-up part of the curve; moved under $x < 2$ (`figs_08.py`). The other four previews were checked
  and are right. All five SVGs were regenerated: the committed ones predated the `figstyle.py` change
  that draws grid lines under halo'd tick labels (commit ab24213), so they now follow the current house
  style; their content is unchanged.
- `shape-explorer.js`: the readout wrote "f′(x) ≈ 0 : a horizontal tangent" (and "≈ 0 ：" in Chinese),
  with a space before the colon; fixed. The analysis was checked on all five examples and on the
  page's typed functions (asymptotes at ±2; the cusp of Example 8.7 with its inflection point at $-1$).
- `tools/widget-tests/shape-explorer.mjs`: types `x^(2/3)(x - 5)`, as the caption now says, and checks
  the readout at the flat point of $x^4 - 4x^3$; 15 checks pass. The widget works at 360 px.

## Elsewhere (not edited)

- Module 8 now links to `module_04_EN.html#ex-4-11` and `module_07_EN.html#the-rule`: keep those ids.
- Module 11, line 1257: "concave up on $[1, 2]$ (Section 8.4)"; Module 8 defines concavity on open
  intervals. Harmless ($1/x$ is concave up on $(0, \infty)$); "on $(0, \infty)$, so on $[1, 2]$" would be
  exact. Optional.
- `sp.solve` is first used without a word of explanation in Module 6 (line 1128) and Module 7 (line
  198); Module 8 is the first to explain it, and the formula sheet credits Module 8. Optional.
