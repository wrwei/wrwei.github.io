# Review of Module 17, Partial derivatives and the gradient

Reviewed 22 November 2026 against `notes/REVIEWING.md`, `notes/AUTHORING.md`, `PLAN.md`,
`notes/FACTS.md`, the Module 1 reference page and `notes/reviews/cross-module.md`.
Page line numbers below refer to the original 1707-line source at commit `b3416e2`.
Worked calculations and proofs were independently derived before comparison with the check blocks.
The review includes exercises, quiz explanations, software examples, widget behaviour and figures.

## Correctness and teaching

| Original line | Finding and correction |
|---|---|
| 18 | The introduction claimed every previous function had one input, overlooking Module 13's F(t, y). It now says the series concentrated on one independent variable and that two variables show the main new ideas. |
| 45, 58–106 | Qualified the description of an arbitrary graph as a surface. Defined level sets and explained that they can be points or regions, with corresponding changes to the dome example, exercises, quiz and summary. Scoped the crossing-contour statement to the illustrated passes and clarified the need for height labels. |
| 155 | A path used in the path-limit theorem must lie in the function's domain. Added the missing condition, including for boundary limits. |
| 291, 546, 601 | Strengthened derivative and error/distance checks to verify two-sided limits; added the missing check of the y-partial derivative definition. |
| 352, 385 | Qualified higher partial derivatives by their existence. Scoped the claim about continuous mixed partials to the examples under discussion and supplied a sufficient neighbourhood condition for the higher-order extension of Clairaut's theorem. |
| 410 | Added the modelling assumptions behind the heat and Laplace equations: uniform material, appropriate insulation and no internal heat sources. |
| 469, 552, 577 | Continuity of the partial derivatives is sufficient for a tangent plane, not necessary. Distinguished that practical test from differentiability itself and made the open-disc scope explicit. |
| 586–601 | The differentiability proof divided by distance without explicitly excluding the centre and applied the Mean Value Theorem to possibly zero-length legs. It now handles both cases. |
| 621–646 | Distinguished signed measurement errors, absolute errors and the differential estimate from an exact bound on volume error. Defined dr and dh as true minus measured and used the magnitude for the relative-error estimate. Added checks for all corner sign choices and a case where the exact volume error exceeds the differential bound. |
| 674–690, 729 | Added checks of the cylinder's partial derivatives and sensitivity ratio. The polar chain-rule example's substitution check now verifies both derivatives, including the theta derivative's intermediate calculation. |
| 753, 791 | Made differentiability explicit in implicit differentiation and added continuous partial derivatives near the point to the three-variable implicit-function statement. |
| 812–819, 848, 870, 889, 915 | Restored the existence, differentiability and nonzero-gradient conditions in the gradient explanations. A zero gradient gives no normal direction; the directional-derivative check now uses both sides. Removed the blanket claim that real water flow follows the negative gradient. |
| 896 | The relation between contour spacing and gradient magnitude needs equally spaced level values. Added that condition. |
| 910 | The widget caption claimed a true gradient length and the exact worked-example rate at a rounded angle of 53°. It now describes numerical estimates and the actual readout, approximately 2.199 rather than 2.2, with a matching rounding check. |
| 918 | Differentiability at one point does not by itself guarantee a regular level surface. The tangent-plane definition now assumes continuous partial derivatives nearby and invokes the implicit function theorem. |
| 1012–1023 | Stated the domain and nonzero-gradient conditions for descent and justified an actual decrease for sufficiently small steps using the differentiability remainder, rather than relying only on an approximate equality. |
| 1120–1141 | The step-count loop could run indefinitely for bounded nonconvergent sequences, such as eta = 0 or 1/3. It now has a maximum number of updates and reports that the tolerance was not reached, which does not itself establish divergence. Qualified the fixed-step claim about slow convergence. |
| 1150–1168, 1319 | Qualified universal claims about machine-learning training and forward mode. Defined an acyclic computational graph and differentiable local operations. Counts each use of an input separately, so the two contributions from e times e have precise local-derivative meanings. |
| 1170–1205, 1259 | Model errors had the opposite sign to the cross-module convention. Changed them to true value minus prediction throughout the example, caption, table, checks, Python and Figure 17.5. The loss and parameter gradients remain unchanged. Added reverse subtraction to the example's Var class. |
| 1236 | Repeating backward on the same graph reused stale adjoints and produced incorrect gradients. The backward pass now resets every reachable node's adjoint before accumulating. |
| 1292–1310 | Training printed the state before an update but numbered it as though that update had occurred. Labels now count completed updates, starting at 0. Regenerated the output and corrected the 100-step loss to approximately 0.0279, checked by an exact rational recurrence and an independent high-precision calculation. |
| 1323–1329 | Restored the summary's conditions for Clairaut, differentiability, implicit functions, directional derivatives, regular level sets and descent. Covered the zero-gradient case and qualified propagated measurement errors as first-order estimates. |
| 1342 | The ellipse description included k = 4 before calling its level a point. Now explicitly separates the ellipse levels from that single-point level. |
| 1421 | Zero directional derivatives give directions tangent to the level curve at the point; clarified that they do not mean a straight path remains on the level curve. |
| 1444–1449 | Added symbolic checks of both coordinate bounds used in the squeeze proof, covering all real coordinates rather than relying on sampled points. |
| 1463–1471 | Removed the unsupported suggestion that distance 0.14 by itself explains the linear approximation's accuracy. States and checks the signed error as exact minus approximation, approximately −0.015. |
| 1583–1594 | Explained the inequality behind continuity in the mixed-partial counterexample and added its general algebraic check. Explicitly excluded the origin from its axis formulas. |
| 1647 | Removed the false general claim that parabolas and lines require an unsquared variable. The quiz explanation now uses the positive coefficients and unequal semi-axes of the actual quadratic. |
| 1670, 1678 | Added differentiability to the quiz's gradient claim and specified an open disc around the point in its Clairaut hypothesis. |

The remaining examples, proofs, exercises and quiz computations were checked with their hypotheses.
The six goals, prerequisites, eight teaching sections and 270-minute estimate remain appropriate.
The shared-weight exercise retains its unnamed squared difference: it makes no contrary claim about
the sign of an error, and its loss and gradients are correct.

## Cross-references and notation

- Verified the linked results from Modules 2–8, including rationalisation, squeeze and precise
  limits, continuity, the Mean Value Theorem, linearisation, differentials and the signed-error
  convention.
- Checked the uses of Module 13's earlier two-input functions and Module 16's distances and planes.
- Verified the references to Module 5's dual-number implementation, Module 6's folium and implicit
  differentiation, Module 8's gradient descent and Module 18's planned optimisation topics. Checked
  the linked AI Module 2 and Mathematical Foundations Module 18 against their backpropagation and
  matrix chain-rule material.
- Checked internal definition, theorem and example numbers against the order of the boxes.
- The cross-module notes have no Module 17-specific pending item. Their exact-minus-approximation
  convention applies to the measurement and model-error explanations reviewed here.

## Primary sources

- [MIT ES.1803, Heat Equation](https://ocw.mit.edu/courses/es-1803-differential-equations-spring-2024/mites_1803_s24_heat_equation.pdf)
  gives the insulated-rod setting and the one-dimensional heat equation.
- [MIT 18.306, problem-set solutions](https://math.mit.edu/classes/18.306/PSetAnswers/AnswerPSet_2021_01.pdf)
  describes a thin homogeneous sheet with insulated top and bottom and the steady-state Laplace
  equation. These support the modelling qualifications added to the application paragraph.
- [Adam paper](https://arxiv.org/pdf/1412.6980),
  [PyTorch SGD](https://docs.pytorch.org/docs/2.15/generated/torch.optim.SGD.html) and
  [autograd mechanics](https://docs.pytorch.org/docs/2.15/notes/autograd.html) support the revised
  descriptions of optimisation, accumulated gradients and reverse differentiation on a graph.

## Widget and figures

Original widget line numbers refer to `src/widgets/contour-gradient.js` at the same commit.

- Lines 29–35: the map-wide noise filter could erase a valid small partial derivative when another
  component was large. For a typed function 100000000x + y at the origin and direction (0, 1), the
  widget incorrectly displayed 0 instead of 1. Custom functions now retain their finite-difference
  components; smooth presets retain their small-residual suppression.
- Line 59: the absolute contour-range threshold hid all contours of the nonconstant function
  10⁻¹⁰x. Removed the absolute floor while keeping a relative test against roundoff.
- Lines 180–182: numerical central differences alone cannot establish differentiability or a
  critical point. Custom formulas now carry the needed qualification; |x| at the origin is a
  regression case.
- Lines 188–193: directions within 0.5° were described as exact extrema or tangency. The descriptions
  now say nearly aligned and compare the directional derivative with the gradient magnitude.
- Updated the English and Chinese text together. Added numerical regressions while retaining the
  existing interactions and keeping the focused suite at 15 checks.
- Figure 17.5's error nodes, local derivatives and adjoints now use true value minus prediction,
  matching the revised example. All five previews were generated and visually inspected. The other
  four figures needed no edits; discarded their regeneration-only SVG ordering differences.

## Validation

- Python 3.12.13 with the pinned SymPy 1.14.0, mpmath 1.3.0, NumPy 2.4.6 and matplotlib 3.11.2.
- `calc.py --module 17 --update`, followed by `calc.py --module 17`: **348 checks, 0 problems,
  all outputs match**. Regenerated two output blocks: step-count termination wording and the
  completed-update training table.
- Current-source Python regressions pass for shared operands, repeated backward calls, reverse
  subtraction, bounded termination at eta = 0 and 1/3, and convergence in 30 updates at eta = 0.25.
- `node tools/check.mjs --lang en`: **22 pages, 0 errors, 0 warnings**.
- `node tools/build.mjs --lang en`: passed. As in the earlier reviews, the code ZIP is absent in
  this fresh worktree; publication should regenerate it with the full-series calculation run.

- `node tools/widget-test.mjs --only contour-gradient`: **15 checks passed, 0 failed**, against
  the freshly built page in local Google Chrome. This includes the three numerical regression cases.
- Page inventory: 8 teaching sections plus summary, exercises and quiz; 16 worked examples,
  11 exercises (4 single-star, 5 double-star, 2 triple-star), 8 quiz questions, 5 figures,
  1 widget, 11 Python blocks with 9 outputs, 50 check blocks and 4 value tables.
- Desktop rendering at 1100 px: inspected all 56 overlapping screenshots, including all 11 open
  solutions and all 8 quiz explanations. No overlapping or clipped content, blank maths or missing
  figures. Document width remains 1100 px.
- Phone rendering at 360 px: inspected all 7 mobile contact sheets, the widget and every scrolling
  formula/table at both positions. Twenty-one formulas scroll by 3–83 px and four tables by
  31–158 px inside their frames, as permitted by the brief. Also inspected the three custom-function
  regression states and their new explanatory text. Document width remains 360 px in every state.
- No JavaScript or KaTeX errors, broken images or blocks extending beyond either viewport.
- All section, exercise and figure identifiers are preserved. `git diff --check` is clean.
- Compared fingerprints: the original checkout's status, tracked diff and all 604 untracked files
  are unchanged. All six files from the earlier Module 15–16 reviews are also unchanged.
- Evidence is retained in ignored `out/review17-qa/`, `out/figs/`, and
  `out/review17-{calc-update,calc-final,check,build,widget,code-regressions,preservation}.log`.

No unresolved issue was found within Module 17's review scope.

## For the coordinator

- The model-error sign now follows the cross-module convention in text, code and diagram. No new
  defect was found in other modules or shared files; previously recorded cross-module items remain
  outside this review's scope.
- Existing Module 15–16 review changes and the original checkout's uncommitted MDE work were
  preserved, verified against the fingerprints saved before work began.
- No changes have been committed, merged or published.
