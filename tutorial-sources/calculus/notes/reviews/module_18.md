# Review of Module 18, Optimisation in several variables

Reviewed 22 November 2026 against `notes/REVIEWING.md`, `notes/AUTHORING.md`, `PLAN.md`,
`notes/FACTS.md`, the Module 1 reference page and `notes/reviews/cross-module.md`.
Page line numbers below refer to the original 1448-line source at commit `b3416e2`.
Worked examples, proofs, exercises and quiz answers were independently checked, including
their hypotheses and the match between each calculation and its check block.

## Correctness and teaching

| Original line | Finding and correction |
|---|---|
| 6 | The prerequisites mentioned Taylor's theorem only in the optional proof, although the main quadratic-approximation explanation uses Taylor polynomials. Made both uses explicit. |
| 17, 806–810 | Qualified the descriptions of machine-learning training and descent. A differentiable objective and a nonzero gradient give a direction of local decrease; a finite step may increase the objective and must stay in its domain. |
| 79 | The saddle definition included boundary critical points, although the module's local extrema require an interior disc. Restricted the definition to interior critical points, retaining Module 8's broader critical-point convention. |
| 83, 236 | A saddle's level curve need not cross itself. Qualified the contour description and explained the cusp of x² + y³ = 0, with a parametrisation check. |
| 183–199, 250 | Replaced claims that the zero-determinant test gives no information with the precise statement that it is inconclusive. |
| 312 | A general region need not have a boundary made of curves. The boundary-method introduction now describes this as the usual case. |
| 320–333 | Added nonemptiness to the compact-region existence and candidate statements. |
| 399, 480–483 | The largest-rectangle model silently assumed a centred rectangle. Added the justification that any rectangle with sides parallel to the axes can be centred without decreasing its area, then enlarged until a corner reaches the ellipse. |
| 426 | Restricted the hyperbolic area levels to positive values and stated the nonzero-gradient condition used in the tangency picture. |
| 454–471, 586 | Restored continuous first partial derivatives in the three-variable Lagrange rule and practical method. The sensitivity formula now explicitly assumes a differentiable family of optimal points on an open interval of constraint values. |
| 477 | The widget optimises xy, one quarter of the rectangle area 4xy. Explained why its multiplier is 1 while the area's multiplier is 4, and distinguished near alignment from an exact candidate. |
| 532–534 | Stated the cardboard model's assumptions about joins and waste and verified that the constraint gradient is nonzero for positive dimensions. |
| 606–610 | The two-constraint rule needs continuous first partial derivatives and independent constraint gradients. Stated these conditions and the regular-curve justification; checked that the cross product has squared length 72 throughout the worked circle. |
| 633–637 | The SymPy example restricted the multiplier to be positive together with the dimensions. It now leaves the multiplier real while keeping the dimensions positive. |
| 680, 683, 789–793 | Clarified uniqueness and the family of solutions when all inputs agree. Qualified the large-residual comparison and residual-pattern interpretation. A degree-at-most-two fit may be linear and needs three distinct inputs for unique coefficients. Corrected the description of NumPy's scaled least-squares computation. |
| 839, 882–899 | Coordinate shrinkage concerns magnitudes. Defined the best fixed step by its largest coordinate contraction factor and scoped proportional step counts to a fixed relative target as the condition number grows. Ellipse levels must be positive, and zigzagging is possible rather than inevitable. |
| 912, 921 | Defined standardisation of nonconstant training features precisely and distinguished it from centring. Positive Hessian eigenvalues give a local quadratic guide; a zero eigenvalue or behaviour far from the minimum needs further analysis. |
| 929–947 | Bounded the condition-number loop, validated its parameter and explained exhaustion. The tenfold comparison now starts at condition number 10. |
| 954–973 | The fitting loop skipped checking its final permitted update and returned None on exhaustion. It now counts completed updates, checks that final state and reports exhaustion or a nonfinite gradient. Specified derivative magnitudes in the stopping rule and the zero starting point for the raw-data divergence example. |
| 991 | Corrected claims that larger steps are always faster below the stability limit, gradients point at the minimum only for circles, and descent always finds a critical point. Added the step-size condition for convergence to the illustrated saddle along its stable axis. |
| 1007–1012 | Restored the summary's interior, smoothness, nonemptiness, constraint-independence, uniqueness and every-start convergence conditions. |
| 1045, 1067 | Scoped Exercise 18.2 to interior points and justified the sign along a direction using sufficiently small displacements and the quadratic remainder. Added checks of the displaced quadratic. |
| 1088 | Exercise 18.3's ellipses are sqrt(2), not twice, as wide as they are high. Corrected the ratio, restricted ellipse levels to positive values and added a symbolic ratio check. |
| 1203 | In Exercise 18.7 the plane's points at squared distance at most 9 form a singleton, not a disc. Corrected the geometry while preserving the valid compact-set existence argument. |
| 1312–1328 | Added exact integer step-count checks to Exercise 18.10, supplementing the asymptotic rounded estimates. |
| 1361 | Centred least-squares level sets are ellipses only above the minimum, possibly circles; the minimum level is one point. Made the cases explicit. |
| 1381–1400 | Added interior and neighbourhood conditions to the Hessian quiz. In question 3, fxx = 2 rules out a local maximum even though D = 0 does not distinguish a minimum from a saddle. Corrected the answer/explanation and checked all three examples' gradients, Hessians and axis restrictions. |
| 1409–1414 | Added the Lagrange smoothness assumptions and allowed a zero multiplier. A zero objective gradient need not give a regular level curve: the explanation now includes an isolated-level-set example, with checks. |
| 1435 | Made the convergence interval's upper endpoint strictly excluded. At eta = 0.08 the y-coordinate alternates without shrinking unless it is initially zero. Added the endpoint-factor check. |

Also added direct checks of the displayed cubic derivatives and Hessian in Exercise 18.1 and
the gradient in Exercise 18.8. The first-half checks now cover the quadratic chain rule along the
whole line, the indefinite quadratic's zero-leading-coefficient case, displayed gradients,
nonnegativity, the existence theorem's counterexamples, rectangle centring and the positive
hyperbola branch. The second-half checks now verify ellipse semi-axes, the
condition-number asymptotic, rescaled steps, the raw fit's unstable eigendirection and nonzero
initial component, and exact stopping thresholds for the two fitting runs.

The existing structure, five learning goals, six teaching sections and 270-minute estimate remain
appropriate. All section, exercise and figure identifiers are preserved.

## Cross-references and sources

- Checked Module 3's Extreme Value Theorem; Module 8's extrema convention, Fermat theorem,
  closed-interval method, Example 8.14 can and Example 8.18 descent; Module 15's Taylor material;
  Module 16's planes and point-to-plane distance; and Module 17's gradient and implicit functions.
- Verified the referenced Mathematical Foundations modules: 10 for matrices, 12 for least squares,
  13 for quadratic forms/eigenvalues and 19 for gradient methods and conditioning. Internal theorem,
  example and exercise numbers match their source order.
- Residuals retain the cross-module exact-minus-approximation sign convention. There is no pending
  Module 18-specific item in the cross-module notes.
- The official [NumPy polyfit documentation](https://numpy.org/doc/stable/reference/generated/numpy.polyfit.html)
  supports the coefficient order, scaled least-squares description and recommendation of Polynomial.fit
  for new code. The installed implementation was also inspected. The official
  [NumPy solve documentation](https://numpy.org/doc/stable/reference/generated/numpy.linalg.solve.html)
  confirms the full-rank square-system condition.
- The official [StandardScaler documentation](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html)
  supports training-data centring/scaling and the constant-feature exception.

## Widget and figures

Original widget line numbers refer to `src/widgets/lagrange.js` at the same commit.

- Lines 32, 85 and 177–181: gradients within 0.5 degrees were labelled exactly parallel and assigned
  an exact multiplier. Near alignment now has a separate message and approximate multiplier, with
  the remaining direction of change stated. Exact candidates retain their existing readout.
- Line 78: cardinal-angle coordinates displayed tiny trigonometric residuals as exact values.
  The known integer coordinates at those angles now display exactly, with matching gradients.
- Updated English and Chinese readouts together. Strengthened the existing tests with a real arrow-key
  interaction, near alignment at 26.5 degrees and exact axis coordinates/gradients.
- `src/figures/_gen/figs_18.py`, line 114: Figure 18.2's legend called all boundary dots critical points
  of a side, although some are corners. Renamed them boundary candidates. All five figure previews
  were generated and inspected; the other four SVGs needed no changes.

## Validation

- Python 3.12.13 with pinned SymPy 1.14.0, mpmath 1.3.0, NumPy 2.4.6 and matplotlib 3.11.2.
- `calc.py --module 18 --update`, followed by `calc.py --module 18`: **477 checks, 0 problems,
  all outputs match**. All eight generated outputs and all three value tables remain unchanged.
- Current-source Python regressions pass for the final permitted update, exhaustion, a zero step,
  an extremely large condition number and invalid condition numbers. The exact counts remain
  69/691/6908 for the three elongated bowls and 193/61 for raw/centred fitting.
- `node tools/check.mjs --lang en`: **22 pages, 0 errors, 0 warnings**.
- `node tools/build.mjs --lang en`: passed. As in the earlier reviews, this fresh worktree lacks
  the generated code ZIP; publication should regenerate it with the full-series calculation run.
- Page inventory: six teaching sections plus summary, exercises and quiz; 10 worked examples,
  12 exercises (4 single-star, 5 double-star, 3 triple-star), 8 quiz questions, 5 figures, 1 widget,
  8 Python blocks with 8 outputs, 42 check blocks and 3 value tables. All 24 explicit page IDs remain
  unchanged. `git diff --check` passes.
- `node tools/widget-test.mjs --only lagrange`: **15 checks passed, 0 failed**, against the
  freshly built page in local Google Chrome, including keyboard, near-alignment and axis regressions.
- Desktop rendering at 1100 px: inspected all 47 overlapping screenshots, including all 12 open
  solutions and all 8 quiz explanations. No overlap, blank content or clipping found.
- Mobile rendering at 360 px: inspected the widget and both ends of all 13 wide formulas and one
  scrolling table, plus four widget regression states (near-circle, near-line, exact-ellipse and
  axis-circle). All content remains readable within its container.
- Both viewport checks report the exact requested document width, no escaped content blocks,
  no JavaScript or KaTeX errors, and no broken images. All five figure previews were inspected.
- Preservation checks confirm that all 12 files from the Module 15–17 reviews are byte-for-byte
  unchanged. The original checkout's tracked diff, status and all 604 untracked files match the
  pre-review snapshot, including the uncommitted MDE work.

## Scope and remaining work

No unresolved Module 18 issue or new cross-module defect remains. The existing shared-tools and
other-module items in `cross-module.md` remain for their owners. The review uses the same worktree;
no files in the original checkout were edited, and no Git mutation, commit or publication was made.
