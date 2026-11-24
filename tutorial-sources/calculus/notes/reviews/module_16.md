# Review of Module 16, Curves and vectors

Reviewed 22 November 2026 against `notes/REVIEWING.md`, `notes/AUTHORING.md`, `PLAN.md`,
`notes/FACTS.md`, the Module 1 reference page and `notes/reviews/cross-module.md`.
Line numbers below refer to the original 1939-line page at commit `b3416e2`.
Worked calculations and proofs were independently derived and compared with the prose and check
blocks; the review also covered exercises, quiz explanations, figures and widget behaviour.

## Correctness and teaching

| Original line | Finding and correction |
|---|---|
| 55, 1282 | Required continuous component functions for the trace to be called a parametric or space curve. |
| 141, 341 | Made the positive-radius assumption explicit for the cycloid and the two length calculations. |
| 211, 286, 491 | Stated the continuity assumptions used by the tangent criteria and polar slope formula. Distinguished vertical velocity from zero velocity, which has no direction. |
| 289 | The widget caption claimed exact components although some readouts are rounded. It now says so. |
| 301 | The chord-length check assumed positive coordinate increments although curves can move left or down. The check now allows signed increments while retaining a positive parameter step. |
| 421 | Python's `atan2` can return either endpoint, including −π for a negative signed zero. Changed its stated range to [−π, π] and added checks for both endpoints. |
| 473 | Specified a positive integer n in the rose petal-count rule. |
| 522–537 | The cardioid example stopped at zero derivatives at the pole and omitted its third horizontal tangent. Added the limiting-secant calculation y/x = tan θ → 0, the tangent y = 0, and matching checks. |
| 601 | Polar area subtraction lacked conditions on the radii and angular interval. Now requires continuous nonnegative inner and outer radii, correctly ordered, over an angular span no greater than 2π. Explains why negative radii need conversion first. |
| 644 | Replaced the assertion that some lengths have no formula with the distinction that a formula may not be elementary. |
| 768 | An object can be momentarily at rest with nonzero resultant force. Changed the equilibrium statement to an object that remains at rest and added the example of a ball at the top of a vertical throw. |
| 797 | Triangle-inequality equality also occurs when either vector is zero. Added those cases and checks. |
| 872, 899–915, 949–951 | Qualified angle and cosine formulas for nonzero vectors; covered zero projections and zero work. Included angles 0 and π in the dot-product sign rules and clarified what cosine similarity measures. |
| 992, 1042, 1095 | Restricted cross-product direction and right-hand statements to nonparallel vectors. Replaced the blanket claim that cross products exist only in three dimensions with the precise limitation of the construction taught here. |
| 1088–1092 | Torque about a point was confused with torque about an axis. Defined r from the chosen point to where the force acts, and explained that torque about a fixed axis is the component along its unit direction. Qualified the spanner example and added its 60° component check. |
| 1108, 1154, 1179, 1188 | Included vertical lines in the introduction to direction vectors; required nonparallel plane normals for a line intersection; distinguished coincident planes; handled a point already in the plane in the distance proof. |
| 1379, 1423 | Stated positive speed and gravity and the launch-angle interval. Explained the endpoint extensions and comparisons used to maximise range. |
| 1451–1461 | Qualified the claim about air resistance: the optimum depends on the drag model and wind. Strengthened the elevated-launch maximum check from numerical root-finding to the unique stationary point in tan α and boundary comparisons. |
| 1466–1476 | Added continuous first and second derivatives and nonzero speed to the curvature definition. The cross-product proof now handles T′ = 0 without assigning an angle to a zero vector. |
| 1510–1521 | The projectile code used an unrestricted solver and printed an irrelevant 3π/4 critical angle. It now uses `solveset` on [0, π/2] and explicitly compares the critical value with both endpoints. Regenerated its output through `calc.py`. |
| 1540–1546 | The summary omitted the other derivative's nonzero condition for horizontal/vertical tangents. Restored those conditions and aligned its vector, cross-product, line, plane and torque statements with the corrected explanations. |
| 1664 | The figure-eight prompt said it passed through the origin twice on a closed interval that also includes the repeated endpoint. It now asks for the two parameter values in [0, 2π) and identifies the repeated endpoint explicitly. |
| 1702–1720 | The astroid solution omitted t = 2π from its list of zero-derivative parameters on [0, 2π]. Added it, explained that it repeats (1, 0), and changed the check to use the stated closed interval. |
| 1733–1741 | Equating polar radii missed the circle and cardioid's common pole, reached at different angles. Added that intersection and its checks; explained the rays containing the positive-area region and why the isolated pole adds no area. The area remains π. |
| 1805–1818 | Stated differentiability assumptions in the constant-speed exercise and positive radius/speed for its circular case. The physical conclusion now concerns a resultant force on a particle of constant mass. |
| 1832–1843 | Specified real components in Cauchy–Schwarz and explained why two distinct roots would contradict the quadratic's nonnegativity. |

The remaining slope, arc-length, polar-area, vector-product, projection, plane-distance and motion
calculations were checked with their hypotheses. The exercises practise all six goals at three
levels; prerequisites, eight teaching sections and the 270-minute estimate remain appropriate.
All eight quiz answers and explanations were checked; no quiz changes were needed.

## Cross-references and notation

- Verified the references to Modules 1, 5 and 6 for graphs, trigonometry, transformations, the chain
  rule, inverse derivatives and hyperbolic functions.
- Verified Module 8's monotonicity, constant-function and closed interval arguments, and the
  Fundamental Theorem and substitution links to Module 10.
- Checked the uses of Module 12's arc length and work, Module 13's integrated constant acceleration,
  Module 17's gradient and Module 20's work along a curved path against those pages.
- Checked the internal example, theorem, section and exercise references. All section, exercise
  and figure identifiers are preserved.
- No Module 16-specific item was pending in the cross-module notes. The series' signed-error
  convention is unaffected.

## Primary sources

- [Python's `math.atan2` documentation](https://docs.python.org/3/library/math.html#math.atan2),
  together with the local runtime's signed-zero results, supports the corrected endpoint range.
- [OpenStax, Torque](https://openstax.org/books/university-physics-volume-1/pages/10-6-torque)
  supports the distinction between torque about a point and its component about a fixed axis.

## Widget and figures

- Audited all seven parametric-curve choices, their derivatives, parameter intervals, velocity arrows,
  scale labels and readouts. No widget implementation changes were needed.
- Generated and visually inspected all five figure previews. No mathematical or layout defect was
  found. Discarded SVG element-order differences caused solely by regeneration on this machine.

## Validation

- Python 3.12.13 in an isolated environment, with the versions pinned by `tools/requirements.txt`:
  SymPy 1.14.0, mpmath 1.3.0, NumPy 2.4.6 and matplotlib 3.11.2.
- `calc.py --module 16 --update`, then `calc.py --module 16`: **580 checks, 0 problems,
  all outputs match**. The only changed output block is the projectile optimisation listing.
- `node tools/check.mjs --lang en`: **22 pages, 0 errors, 0 warnings**.
- `node tools/build.mjs --lang en`: passed. The build notes that the code ZIP is absent in this
  fresh worktree; regenerating it needs the full-series calculation run at publication time.
- `node tools/widget-test.mjs --only parametric-curve`: **15 checks passed, 0 failed**, against
  the freshly built page using local Google Chrome.
- Page inventory: 8 teaching sections plus summary, exercises and quiz; 19 worked examples,
  11 exercises (4 single-star, 5 double-star, 2 triple-star), 8 quiz questions, 5 figures,
  1 widget, 9 Python/output blocks, 81 check blocks and 3 value tables.
- Section, exercise and figure identifiers compared with the original: all preserved.
- `git diff --check`: clean. The original checkout's status, tracked diff and all 604 untracked
  files match their pre-review fingerprints. All four files from the earlier Module 15 review
  also match their pre-review fingerprints; the uncommitted MDE work is untouched.

- Desktop rendering at 1100 px: inspected all 59 overlapping screenshots of the full page,
  including all 11 open solutions and all 8 quiz explanations. No overlapping or clipped content,
  missing figures, KaTeX errors or JavaScript errors. One capture had transient unpainted maths;
  recaptured it after waiting for browser paint and verified the complete content.
- Phone rendering at 360 px: inspected all 11 mobile contact sheets, including the widget and every
  scrolling formula/table at both scroll positions. Forty-one display formulas scroll by 4–281 px;
  one table scrolls by 34 px inside its frame, as the brief permits. The document stays 360 px wide.
  No widget overflow, overlapping content, KaTeX errors, broken images or JavaScript errors.
- Evidence retained in ignored `out/review16-qa/` (screenshots and `report.json`), `out/figs/`, and
  `out/review16-{calc-update,calc-final,check,build,widget}.log`.

No unresolved issue was found within Module 16's review scope.

## For the coordinator

- No new defect was found in other modules or shared implementation files. Previously recorded
  cross-module items remain outside this review's scope.
- The widget test runner can skip a missing built page without failing; the focused suite was run
  against an existing built page and must report actual checks.
- The original checkout's uncommitted MDE work and this worktree's completed Module 15 review are
  preserved. Nothing has been merged, published or committed.
