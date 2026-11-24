# Review of Module 19, Multiple integrals

Reviewed 22 November 2026 against `notes/REVIEWING.md`, `notes/AUTHORING.md`, `PLAN.md`,
`notes/FACTS.md`, the Module 1 reference page and `notes/reviews/cross-module.md`.
Page line numbers below refer to the original 1657-line source at commit `b3416e2`.
Examples, proofs, exercises and quiz calculations were independently derived before comparison
with their check blocks. The review also covers computing examples, figures and the widget.

## Correctness and teaching

| Original line | Finding and correction |
|---|---|
| 18, 20, 101 | Scoped the introductory volume picture to a continuous nonnegative function over a rectangle and specified nondegenerate rectangle intervals. |
| 88, 95, 306 | Resolved the Module 9 cross-module finding: midpoint error is exact minus approximation, so it is −8/(3n²). Corrected both prose occurrences and the check, and added general symbolic checks of the error, refinement factor and monotonic bounds. |
| 177, 352–356 | The general Fubini statement required both orders, but the type-I proof established only one. It now applies separately to each order whose inner integrals exist; the proof explicitly establishes that condition. |
| 200–211 | The unbounded Fubini counterexample has a divergent inner integral at the outer endpoint. Wrote the improper outer limits explicitly and checked the divergent slices and the two different limits, ±π/4. |
| 237, 252 | Added continuity to the product rule's functions and positive area to the average-value definition. |
| 368, 404, 431 | Explained splitting when slices disconnect or boundary formulas change, allowed fixed parameters in outer bounds, and specified positive area for averages and zero-area overlap for region additivity. |
| 518, 575 | Explained the harmless polar seam/origin exceptions and clarified that the Gaussian function has no elementary antiderivative. Its existing squeeze proof already establishes convergence of both improper half-line integrals. |
| 664–675 | The density may vanish, as it does in the worked plate example. Stated nonnegative continuous density on a suitable bounded region, finite moments and positive total mass for a centre of mass. A centroid requires positive area. |
| 711–714 | Qualified the rotational-energy statement by rigid rotation about a fixed axis, and stated positive mass/radius and the ideal thin-ring model. |
| 731, 741 | A pair of random variables need not have a joint density. Scoped the discussion and the density-product characterisation of independence to pairs that admit densities. |
| 754 | The exact probability 2/3 does not guarantee that fraction in a finite run of requests. Corrected the wording and explained why the diagonal boundary does not affect the probability. |
| 774–789 | A random seed does not promise identical samples across NumPy versions or environments. Qualified reproducibility and replaced guaranteed-digit/error language with the fraction's standard deviation sqrt(p(1−p)/N). For the example it is approximately 0.00047; a particular run's error need not decrease. Added the matching variance and rounding checks. |
| 798–814, 839 | Specified nondegenerate boxes, ordered continuous surfaces and the conditions for finite positive mass and moments in solids. |
| 827 | Corrected the tetrahedron centroid's position along the line joining a vertex to the opposite face's centroid: it is one quarter of the way from the face towards the vertex. Added the interpolation check. |
| 853, 868, 878 | Included the cylindrical axis exception, positive water depth and uniform positive density. The pumping-work formula now assumes the rim is at the water level and constant gravity; verified it by integrating the work directly. |
| 898–933 | Handled the spherical origin and polar-axis ambiguities, and the plane/ray exceptions to constant-angle cones. Required finite ordered radial bounds, proper angular ranges and nonnegative ordered continuous variable bounds. Distinguished the absolute Jacobian from a signed determinant. |
| 918 | Figure 19.4 shows parts of constant-angle circles through P, not entire circles. Corrected the caption. |
| 962–974 | Distinguished double coverage with an absolute spherical Jacobian from cancellation with a signed determinant. The Python example now applies nonnegative assumptions only to radial variables. |
| 1008, 1032 | Distinguished the signed one-variable substitution derivative from its absolute length scale. The two-variable theorem now requires a continuously differentiable map on a neighbourhood of the source, onto the target, with injectivity and a nonzero Jacobian in the interior; boundary seam/collapse exceptions remain allowed. |
| 1082, 1117 | Qualified the Cartesian splitting claim in the parallelogram example. Figure 19.5's map is one-to-one on the displayed region, not globally; stated the displayed bounds. |
| 1146–1157 | Made the analogous three-dimensional transformation assumptions explicit, used absolute Jacobians for coordinate volume factors, and specified that inverse Jacobians are reciprocals at matching points. |
| 1167–1173 | Restored the summary's integrability, continuity, positive-area/mass, Gaussian parameter, coordinate-coverage and Jacobian conditions. Replaced the claim of an impossible integral with the concrete benefit of reversing its order. |
| 1213 | Exercise 19.2 now assumes the generic integrand is continuous on the region. |
| 1254–1260 | Exercise 19.3 incorrectly said two integrals are necessary in the vertical order. A single integral with upper bound min(x, 2−x) is valid. Explained that splitting uses one straight-side formula on each piece, and checked the single-integral alternative. |
| 1310, 1354 | Removed an unsupported antiderivative nonexistence claim from Exercise 19.5 and described direct splitting in Exercise 19.6 as a useful choice. |
| 1367, 1423, 1503 | Specified positive radii and density where the plate, ball and drilled-ring formulas require them. |
| 1543–1558 | The dart model now uses a common length unit and equal directional standard deviations. Stated c ≥ 0 and the absolute-integrability condition for a finite mean. Explained the distinction between a radial disc and two coordinate ranges forming a square; checked c = 0 and the displayed antiderivative. |
| 1586, 1607, 1621 | Added the continuity and coordinate-range conditions to the reversal and spherical-volume quiz questions. Added asymmetric integrand checks to distinguish the correct triangle from the distractor with the same area. |

Added missing displayed-antiderivative and intermediate-value checks in the examples and exercises,
including Exercise 19.1's two antiderivatives, Exercise 19.2's area and moment antiderivatives,
Exercise 19.5's substituted antiderivative and Exercise 19.12's radial antiderivative.
The six learning goals, eight teaching sections and 270-minute estimate remain appropriate.

## Cross-references and sources

- Verified the references to Modules 2, 9 and 10 for squeeze, integrability, integral properties,
  average value and substitution; Module 12 for slicing, washers, shells, centres of mass,
  improper integrals, probability and its promised Gaussian proof; Modules 16–18 for coordinates,
  cross products, linear approximation and bounded-region extrema. Checked the determinant link
  to Mathematical Foundations Module 10 and internal box/section numbering.
- [J. M. Boardman's Johns Hopkins notes, Theorem 1](https://math.jhu.edu/~jmb/note/dblint.pdf)
  support the general Riemann-integral form of Fubini used in the corrected type-I proof and the
  zero-area continuous-graph exception.
- The official [NumPy exponential documentation](https://numpy.org/doc/stable/reference/random/generated/numpy.random.Generator.exponential.html)
  confirms scale = 1/rate; its [random compatibility policy](https://numpy.org/doc/stable/reference/random/compatibility.html)
  supplies the reproducibility conditions. The [SymPy Jacobian documentation](https://docs.sympy.org/latest/modules/matrices/matrices.html#sympy.matrices.matrixbase.MatrixBase.jacobian)
  confirms the derivative array's variable ordering. [NIST DLMF](https://dlmf.nist.gov/14.30)
  provides an example of the opposite theta/phi convention mentioned in the note.
- The signed midpoint-error item from `cross-module.md` is resolved in this module. The shared
  notes are unchanged so the coordinator can mark the item complete.

## Widget and figures

- Audited all four `region-slicer` regions in both integration orders, their bounds, exact areas,
  slice lengths and keyboard behaviour. No implementation defect was found; widget and test sources
  remain unchanged.
- Generated and visually inspected all five figure previews. Captions for Figures 19.4 and 19.5
  were clarified as described above. The generator and all five SVG files remain unchanged;
  generation-only SVG ordering differences were discarded.

## Validation

- Python 3.12.13 with pinned SymPy 1.14.0, mpmath 1.3.0, NumPy 2.4.6 and matplotlib 3.11.2.
- `calc.py --module 19 --update`, followed by `calc.py --module 19`: **408 checks, 0 problems,
  all outputs match**. All six generated outputs and both value tables remain unchanged.
- `node tools/check.mjs --lang en`: **22 pages, 0 errors, 0 warnings**.
- `node tools/build.mjs --lang en`: passed. As in earlier reviews, this fresh worktree lacks the
  generated code ZIP; publication should regenerate it with the full-series calculation run.
- Page inventory: eight teaching sections plus summary, exercises and quiz; 17 worked examples,
  12 exercises (4 single-star, 5 double-star, 3 triple-star), 8 quiz questions, 5 figures, 1 widget,
  6 Python blocks with 6 outputs, 51 check blocks and 2 value tables. All 30 explicit page IDs remain
  unchanged.
- Production `region-slicer` widget suite: **12/12 passed**, including both integration orders
  and keyboard interaction.
- Visually inspected the complete page at 1100 px across 61 overlapping captures, with all
  12 solutions and 8 quiz explanations open. At 360 px, inspected all 54 wide-formula, table
  and widget targets, both horizontal ends where needed, and all eight region/order states.
  All five figure previews were also inspected. No rendering defect was found.
- Browser report: no JavaScript or KaTeX errors, broken images or blocks escaping their
  containers. Document widths remain exactly 1100 px and 360 px; wide mathematics scrolls
  within its container. ArrowRight moves the slice correctly in both orders.
- `git diff --check`: passed. This review changes only `src/en/module_19.md` and this log.
  SHA-256 comparisons confirm all 18 files from the Module 15–18 reviews remain unchanged.
  The original checkout's diff and status are unchanged, and all 604 untracked files match
  their pre-review hashes, preserving the uncommitted MDE work.

## Remaining and cross-module work

- **Module 12, current source line 698, “Centroid of a plate”:** the definition allows continuous
  g ≤ f with zero area but divides by A. It should require A > 0. Recorded for that module's owner;
  Module 12 was not edited.
- Existing other-module and shared-tool items in `cross-module.md` remain for their owners.
- This review uses the same worktree. No Git mutation, commit or publication was made, and the
  original checkout containing the uncommitted MDE work was not edited.
