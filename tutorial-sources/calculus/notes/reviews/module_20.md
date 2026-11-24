# Review of Module 20, Vector calculus

Reviewed 22 November 2026 against the review brief, authoring notes, plan, facts register,
Module 1 and the cross-module notes. The table refers to original Module 20 line numbers
at b3416e2. The review re-derived the worked examples, exercises and quiz calculations
and compared them with the check blocks.

| Original lines | Finding and correction |
|---|---|
| 40–93 | Distinguished a source field that spreads everywhere from injection at a point. Specified the point mass and the exclusion of the origin. Scoped the fastest-increase direction and the level ellipses to nonzero gradients. Distinguished equilibrium from circular streamlines. Figure 20.1 now marks the undefined origin with an open circle and leaves space around it. |
| 125–135, 175–181, 255 | Defined paths to allow crossings, retracing and stationary endpoints. Piecewise path integrals add over ordered pieces and count repeated traversals. Explained scalar averages and the effects of changes of speed and reversal. |
| 144–156, 203–218, 344–350, 510–520 | Added the wire antiderivative and rounding, the velocities in the three-path example and the endpoint values in the potential example. The fundamental-theorem check now uses distinct potential values, so a sign or endpoint swap would fail. |
| 314–319, 352–356, 400, 458 | Qualified the matplotlib window behaviour. Stated the domain and differentiability of potentials, and justified differentiability in the path-independence proof using continuity of the resulting partial derivatives. Defined a simple curve by its repeated points. |
| 540–589 | Estimated paired square edges together so the error is small compared with area. Used substitution along the boundary arcs in the type I and type II proof, allowing vertical or horizontal endpoint tangencies. Completed the planar conservative-field argument by splitting polygonal walks and passing to a piecewise smooth limit. Added a check for the type II integration step. |
| 594–611, 649–658 | Replaced an unsupported non-elementarity claim with the actual signed term from direct parametrisation. The widget instructions give two reproducible vortex positions and distinguish numerical evidence from the theorem's assumptions. |
| 662–755 | Stated positive orientation and the simple-polygon condition for shoelace. Clarified the polar planimeter setup and the Python helper's signed area. Formatted the polygons' areas to ten decimal places so the displayed result does not depend on platform-specific floating-point tail digits. Checked these rounded values against the exact regular-polygon formula. |
| 817–879 | Replaced two identity checks with actual disc integrations for all presets. Stated the smoothness conditions for the curl and divergence limits and the spatial potential test. Scoped the paddle-wheel analogy to a local limit and the zero-divergence identity to fields with continuous second partials. |
| 954–1101 | Specified regular patches and the allowed edge exceptions. Distinguished poles, sphere and graph normals, creases, signed flux and orientation. Added the change-of-parameters explanation for surface integrals. Derived the solid-hemisphere comparison by slices and strengthened checks for the pole degeneration, derivatives, antiderivatives and sphere flux. |
| 1115–1164 | Described Stokes orientation for a nonflat surface and scoped equal curl flux to surfaces where the field meets the theorem's assumptions. Explained multiple or empty boundaries. Replaced the spatial potential argument's unsupported spanning-surface step with a triangular approximation to a contraction, which permits the image to overlap. |
| 1170–1219, 1260–1292 | Included the boundary in the divergence theorem's solid and clarified the ball limit. Checked the cylinder antiderivative and the cubic field's divergence. The polar dome normal has positive vertical component only away from the parameter origin. |
| 1298–1369 | Specified outward closed surfaces, fixed oriented surfaces and signed current in Maxwell's laws. Explained the regularity needed to take the time derivative inside the integral and the small-disc argument for the differential circulation laws. Restored theorem hypotheses in the summary and qualified Cauchy's theorem and the orientation of the circle for the complex example. |
| 1384, 1406–1415, 1499, 1589–1603 | Excluded the zero arrow from the angle calculation, named the helix path and supplied the squared length unit. Explained the stationary endpoint in Exercise 20.5 and the four cusps in Exercise 20.8. The triangle-area check now uses cross products independently of shoelace. |
| 1636–1646, 1672–1684, 1721–1727 | Corrected the hemisphere orientation at the rim, distinguished the vortex's exterior case from a path through the singularity and checked all three diagonal partials in the inverse-square divergence. The charge check also covers zero and negative charges. |
| 1734–1798 | Asked for the reversal sign rule so zero is covered. Scoped path independence to piecewise smooth paths and corrected distractor explanations about area integrals and curl. Checked both components of the quiz's gradient. |

The existing structure and 44 explicit IDs are preserved. The page has eight teaching
sections, a summary, 16 worked examples, 12 exercises (4 single-star, 5 double-star and
3 triple-star), 8 quiz questions, 5 figures, 1 widget, 11 Python blocks with 10 outputs,
56 check blocks and 1 value table. The six learning goals and time estimate still fit.

The vector-field widget now distinguishes a nonfinite boundary sample, a numerical
integration failure and unreliable partial derivative estimates. It withholds affected
estimates and describes agreement as numerical. For typed fields it directs the reader
to check the theorem's hypotheses. Long typed expressions wrap within the readout.
The browser suite covers all presets, dragging, the vortex, bad input and the distinction
between an observed domain issue and exhausting the integration budget on a smooth field.

Verified earlier references for implicit differentiation, direction fields, substitution,
net change, arc length, work, centre of mass, Clairaut, spherical coordinates and the
surface-area comparison. The relevant external references are [Bjorn Poonen's MIT
calculus notes](https://math.mit.edu/~poonen/notes02.pdf) for the curl-free criterion
and contraction argument, the [SymPy vector API](https://docs.sympy.org/latest/modules/vector/api/vectorfunctions.html)
and its implementation for the computer examples, [MIT's Maxwell chapter](https://ocw.mit.edu/courses/6-641-electromagnetic-fields-forces-and-motion-spring-2005/d4def2d4e5fb8327cc15f7db87a640bf_02.pdf)
for the fixed-surface calculation, and the [polar planimeter derivation](https://dornsife.usc.edu/~sergey-lototsky/wp-content/uploads/sites/211/2024/04/A-Closer-Look-at-the-Compensating-Polar-Planimeter.pdf)
for the wheel's connection to Green's theorem.

## Validation

- Pinned computation environment. `calc.py --module 20 --update` followed by
  `calc.py --module 20` returned **326 checks, 0 problems, all outputs match**.
  The regular-polygon output is the only changed output. The value table is unchanged.
- `node tools/check.mjs --lang en` reported **22 pages, 0 errors, 0 warnings**.
  `node tools/build.mjs` passed. The default build reports the existing missing code ZIP,
  which is generated by a full-series calculation run before publication.
- `node tools/widget-test.mjs --only vector-field` passed **15 checks**.
- Inspected all five figure previews. Regenerated Figure 20.1 after the origin correction.
- Inspected the whole rendered page at 1100 px across 62 overlapping captures, with
  all 12 solutions and 8 quiz explanations visible. At 360 px inspected 30 targets,
  including wide formulas, all four tables and the widget, plus nine widget states.
  The radius slider responded to ArrowRight. Long custom formulas wrapped inside
  the readout. Both document widths matched their viewports, with no escaped blocks,
  broken images, JavaScript errors or KaTeX errors.
- `git diff --check` passed. The original checkout's status, diff and all 604
  untracked file hashes matched their before-review values. All 20 files from the
  Module 15–19 reviews matched as well. This work used the existing worktree, with
  changes limited to Module 20, its figure, widget, widget tests and this log.

## Cross-module follow-up

No cross-module item was assigned to Module 20. The series' signed-error convention
does not require a change here. The [formula sheet](../../src/en/formulas.md) should
clarify that simple connectivity is a sufficient domain condition for the derivative
test, while specific conservative fields may exist on regions with holes (line 1223).
Its Stokes and divergence rows should specify the respective neighbourhoods of the
surface and the solid, and the divergence row should give boundedness and piecewise
smooth boundary (lines 1231–1232).
