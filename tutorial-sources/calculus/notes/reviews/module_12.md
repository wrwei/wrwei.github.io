# Review of Module 12, Applications of integration and improper integrals

Reviewed 22 November 2026, against `notes/REVIEWING.md`. Line numbers are those of the page as it was
when the review began (1735 lines; commit 4abcdf3). The work-in-progress commit b034f66 contains this
review's figure changes. Every worked example, exercise solution, quiz answer and explanation was worked
by hand before the check blocks were read: each set-up (top and bottom on each piece, horizontal strips,
disc, washer and shell radii about every axis used, the arc length integrands, the work of springs, ropes
and tanks, the centroid formulas, the densities and means) was rederived, not only its value. Every
cross-reference was opened and checked.

Every result on the page was right, and every integral was the right one for its set-up. The problems
were a missing link to the proof that the page quotes (the Gaussian integral), statements that applied
a formula outside its hypotheses or defined a term loosely, two places that disagreed with other
modules, a goal (the comparison tests) that no exercise practised, checks that tested less than the page
says, and the size of Figure 12.2.

## Correctness and precision

| Line | Problem | Fix |
|---|---|---|
| 1198 | The Gaussian integral is quoted, and "Module 19 proves this value", with no link. Module 19 does prove it (Section 19.4, `#gaussian`: the square of $\int_{-a}^a e^{-x^2}dx$ squeezed between integrals over two discs, in polar coordinates, then $a \to \infty$, both halves of the improper integral treated separately, with a link back to Section 12.8), and its link to Section 12.9 `#normal` is right. | "This module quotes the value; [Module 19](module_19_EN.html#gaussian) proves it, by squaring the integral, which turns it into a double integral, and evaluating that in polar coordinates." ("with a beautiful trick" dropped.) The summary still says "(proved in Module 19)". |
| 973 | Going deeper, surface area: the sphere check applied $S = 2\pi\int f\sqrt{1 + f'^2}\,dx$ to $f = \sqrt{a^2 - x^2}$ on $[-a, a]$, where $f'$ is unbounded, although the formula was stated for $f'$ continuous. | Takes the band between $x = \pm b$, $0 < b < a$: area $4\pi ab \to 4\pi a^2$ as $b \to a$. Checks of the unbounded $f'$, the band and the limit. |
| 979 | Gabriel's horn: "no finite amount of paint could cover its inside with a coat of a fixed thickness $d$, which would need about $Sd$": inside, a coat of thickness $d$ cannot even fit where the radius $1/x$ is below $d$, so the $Sd$ estimate is wrong there. | "cover its outside", where the estimate holds; the resolution sentence is unchanged. |
| 1041 | "it is **continuous** if it can take any value in an interval": not the definition (a random variable can do that and have no density). | A random variable with a density is now defined as **continuous**, inside Definition 12.9; the introduction says only that a waiting time can take any value in an interval, so a curve describes its probabilities. |
| 1211 | The normal density "with mean $\mu$" was never shown to have mean $\mu$. | One line with the same substitution: $\int x f\,dx = \int(\mu + \sigma z)\varphi(z)\,dz = \mu \cdot 1 + \sigma \cdot 0$. Checked. |
| 216, 316 | Discs and the shell method did not say that $f$ is continuous (Definition 12.2 needs it). | "a continuous function $f \ge 0$" in both. |
| 731 | "So far every integral has had ... a continuous integrand": Module 9 integrated functions with jumps. | "a bounded integrand", which is exact (Module 9: integrable functions are bounded), and is what improper integrals give up. |
| 104 | "Between two meeting points the same curve stays on top" is true only for consecutive meeting points. | "Between the two meeting points". |
| 1034 | "otherwise the integral left unevaluated, because it diverges" read as if SymPy knew that it diverges. | "otherwise the integral, left unevaluated: for $p \le 1$ it diverges, so there is no value to give." |

## Consistency with other modules

- Line 903, proof of the comparison test: "**completeness**, which this series takes for granted; Module
  14 states it ... as the monotone convergence theorem". Module 3 already introduces completeness (in
  bold, as the axiom behind its proof of the Intermediate Value Theorem), and Modules 3 and 14 write
  "Monotone Convergence Theorem". Now: "a form of the completeness of the real numbers, the property that
  the number line has no gaps, which the proof of the Intermediate Value Theorem used in
  [Module 3](module_03_EN.html#ivt); Module 14 states it for sequences, as the Monotone Convergence
  Theorem." Line 899: "the comparison property of integrals" is now "the comparison theorem for
  integrals", Module 9's name.
- Line 696: "A thin flat plate of uniform density ... is called a **lamina**", but Module 19 (line 661)
  uses "lamina" for plates of variable density. Now: "A thin flat plate is called a **lamina**. Here its
  density ... is uniform ...; Module 19 lets it vary."
- Line 449: Example 12.9 re-defined **catenary** in bold and wrote $y = c\cosh(x/c)$; Module 6 defines
  the term and writes $y = a\cosh(x/a)$. Now "a catenary (Module 6), the graph of $y = a\cosh(x/a)$".
- Every reference inside the page (Sections 12.1–12.9, Definitions 12.1–12.10, Theorems 12.1–12.5,
  Examples 12.1–12.22, Figures 12.1–12.5, Exercises 12.8, 12.11, 12.12) points to what it claims. The links
  and claims about other modules are true: Section 2.6 (squeeze), Module 3 (Extreme and Intermediate
  Value Theorems, limits at infinity), Module 6 (cosh, sinh, their identity, arctan's asymptotes,
  half-life), Example 7.2 (the cone tank, same dimensions), Theorem 7.7 (powers against exponentials),
  Example 7.15 ($x\ln x \to 0$), Module 8 (Mean Value Theorem, concavity), Module 9, Module 10 (power rule
  for antiderivatives), Module 11 ($\int\ln x\,dx$ by parts, Simpson's rule, erf, no elementary
  antiderivative of $e^{-x^2}$), Modules 14, 16 and 20 (parametric arc length, surface area).
- What other pages say about Module 12 is true: Modules 6, 9, 10, 11, 14, 16, 19 and 20 and
  `formulas.md` (Examples 12.5, 12.7, 12.15, Sections 12.1–12.3 and 12.6–12.9 with their anchors,
  the half-disc centroid, the bowl's $\pi h^2/2$, the $p$-integrals, $\int_0^1 dx/\sqrt x = 2$,
  $\int_{-1}^1 dx/x^2$ infinite, the sphere's area found from a surface of revolution).

## Check blocks

- All 68 check blocks were compared with their prose. Most check exactly what the page states, every
  intermediate result included, and every number shown with $\approx$ has a `rounds`. Strengthened:
  Example 12.16(c) now checks both halves' values, $\arctan t$ and $-\arctan t$ (785); Exercise 12.4(d)
  checked $\int_0^t (4 - x)^{-1/2}dx = 4 - 2\sqrt{4 - t}$ only at $t = 3$, now for every $t$ (1434);
  Exercise 12.11 checked only the parts step on its instances, now the whole chain
  $\pi\int_0^1 g^2\,dy = -\pi\int_0^1 x^2 f'\,dx = 2\pi\int_0^1 xf\,dx$ with each instance's inverse
  function (1618); the normal-density checks declared $\mu$ positive although the page allows any real
  $\mu$, now real (1222).
- Added checks where there were none: the simulation's claim that $-\ln(1 - U)/\lambda$ has the
  exponential density (1308), and every new statement above. Now 69 blocks, 449 checks (was 413);
  `calc.py --module 12` ends with `all outputs match`.

## Teaching

- Goal 4 names the comparison tests, but no exercise or quiz question used them. Exercise 12.4 gains
  (e) $\int_1^\infty \cos^2 x/x^2\,dx$ (converges by comparison with $1/x^2$; about 0.327, checked against
  the closed form $\tfrac12(1 + \cos 2 - \pi + 2\operatorname{Si} 2)$ and an independent numerical
  integration) and (f) $\int_1^\infty x/\sqrt{x^3 + 1}\,dx$ (diverges: a bound from below by
  $1/(\sqrt2\sqrt x)$, then the same by limit comparison, and why the true bound from above proves
  nothing). Exercise ids and levels unchanged (4 ★, 5 ★★, 3 ★★★).
- Everything else follows from the earlier modules with every step shown; `needs`, `goals` and `minutes`
  (270) are accurate; about 9,800 words. No section, box, figure or exercise id changed, and no existing
  box changed number.

## Style and rendering

- `check.mjs`: no errors or warnings for the page.
- Built; screenshots of the whole page at 1100 px (`out/shots/r12/`). No KaTeX errors; nothing
  overlaps or is cut off. At 360 px, with every solution unfolded, the page never scrolls sideways, no
  table overflows, and no display formula scrolls (measured in the browser); the new displays were laid
  out for that.
- Figure 12.2 (`figs_12.py`): 372 KB, the largest SVG of the series; its two translucent surfaces were
  2,262 polygons (30 × 40 meshes), each with its own clip path, and the washer 60 translucent quads,
  which showed faint radial seams. Now: meshes of 32 steps round and 10 (outer, equal steps in
  $\sqrt x$, which follows the steep start of $\sqrt x$) or 8 (inner) along the axis, unclipped (they lie
  inside the axes); the washer is one polygon (round the outer circle, in along a cut, back round the
  inner one), so no seams; and the two labels on white space below the washer lose their white halo,
  which made `label` emit their text as two 7 KB outlines each. 96 KB, a quarter of the size; compared at twice
  screen resolution and zoomed in, it looks the same as before, without the seams. Its caption now says
  what shows the inner surface (the purple circles; the near-white fill hardly shows).
- Figures 12.1 and 12.3–12.5: right curves, set-ups and labels. Regenerating them picks up the current
  `figstyle.py` (white halos on tick labels, so the tick 1 of Figure 12.1 no longer collides with a dashed
  line); nothing else changed.

## Other modules and shared files

- `formulas.md`: the Gaussian integral row links to `module_19_EN.html` without `#gaussian`.
- Module 6, line 987: "Deriving this [the catenary] needs arc length (Module 12) and differential
  equations (Module 13)" is true, but neither module derives it (Module 13 does not mention it), so a
  reader may wait for a derivation that never comes; "this series does not derive it" would settle it.
- `figstyle.label` (shared): with `halo=True` (the default) the text is drawn through a path effect,
  which writes every glyph out twice as one-off outlines instead of reusing glyph definitions: about
  7 KB per short formula label. Labels on plain white need no halo. And `set_clip_on(False)` on 3D
  surfaces drops a clip-path attribute from every polygon (about 20% of each). Both could shrink the other
  large 3D figures (fig-17-1, fig-17-2, about 310 KB each) without visible change.
- `check.mjs` currently reports one error, in `glossary.md` (link `#g-a`), a page another agent is
  writing.
