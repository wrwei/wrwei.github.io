# Review of Module 15, Power series and Taylor series

Reviewed 22 November 2026 against `notes/REVIEWING.md`, `notes/AUTHORING.md`, `PLAN.md`,
`notes/FACTS.md`, the Module 1 reference page and `notes/reviews/cross-module.md`.
Line numbers below refer to the original 2085-line page at commit `b3416e2`.
Worked calculations and proofs were independently derived and compared with the prose and check
blocks; the review also covered exercises, quiz explanations, figures and widget behaviour.

## Correctness and teaching

| Original line | Finding and correction |
|---|---|
| 88 | Capitalised Monotone Convergence Theorem, matching Modules 3 and 14 and the cross-module note. |
| 297 | The proof that the differentiated power series has the same radius used the ratio test at `q = 0`, where its displayed quotient is undefined. Added the finite-sum case explicitly. |
| 338–355 | The four-term logarithm approximation was rounded to 0.095308 before an error bound of 0.000002 was attached to it; the error of that displayed decimal exceeds the bound. Now gives the exact partial sum `11437/120000`, rounds only afterwards, and states and checks its positive remainder. |
| 428 | Clarified that the alternating harmonic series' errors approach `1/(2n)` in magnitude; their signs alternate. |
| 712 | Added the binomial series' polynomial exception to the summary: for a nonnegative integer exponent it terminates and is valid for every real x. |
| 735, 755 | Replaced the claim that some integrals have no antiderivative with the correct distinction that their antiderivatives are not elementary. Strengthened the Gaussian-integral checks to verify both sides of the stated enclosing interval. |
| 863 | The widget caption claimed that error grows whenever the degree is raised outside convergence. For `ln(1 + x)` at `x = 1.5`, its magnitude initially decreases. Caption now distinguishes convergence from monotonic improvement and includes checks for that counterexample. |
| 946 | Replaced exact equalities to rounded sine-polynomial terms with exact fractions followed by an approximation sign. Added matching intermediate checks. |
| 1002–1035 | Reversed the forward- and central-difference errors to exact derivative minus estimate, including theorem, proof, leading terms and checks. Their leading signs are negative; absolute bounds and orders remain unchanged. Made `h > 0` explicit in the central formula. |
| 1037–1045 | Preserved Module 7's named exception `e_n = x_n − r` and explained that it reverses the approximation-error convention. Added the differentiability and nonzero-denominator assumptions and the case where an iterate is already the root. |
| 1161–1176 | Alternating-series estimates now bound error magnitudes. The displayed rounded Machin bounds summed to more than `3 × 10⁻⁸`, although the exact bound is smaller. Now combines exact fractions, checks the sum and the rounded displayed estimate, and rounds only at the end. Strengthened the consecutive-term ratio check. |
| 1195–1216 | Changed the printed Machin error to `pi − approximation`; regenerated its output through `calc.py`. Added a check that the approximation and pi round to the same 52 significant digits. |
| 1237–1253 | The asserted upper endpoint `0.69314718` for ln 2 was false. Now proves the outward interval `(0.69314707, 0.69314719)` from the exact partial sum and exact remainder bound, checks both endpoints, and uses an approximation sign for the six-decimal answer. |
| 1295 | Specified positive rest mass and speed below the speed of light in the relativistic kinetic-energy formula. |
| 1341–1396 | Removed universal claims about processors lacking sine instructions and libraries always using minimax polynomials. Describes range reduction and polynomial approximation as a common implementation, and identifies CPython's dependence on the platform C library. |
| 1519–1522 | Corrected a comment claiming equality in a coefficient bound for the series centred at 1; its even coefficients have magnitude `2^(−n/2−1)`. The matching subsequence limit now uses those actual coefficients. |
| 1535–1573 | Distinguished the oscillation parameters from Module 13's differential-equation coefficients. Clarified that the damped spring's trigonometric factor has a period; the decaying displacement itself is not periodic. |
| 1806–1824 | Exercise 15.6 rounded a remainder bound down before multiplying it by 10. Retained the exact bound `0.00000390625`, scaled it exactly, then rounded outward. Checked the stated enclosure and explained the remainder's negative sign. Added the geometric comparison that makes its terms tend to zero. |
| 1837–1853 | Exercise 15.7 used equality signs for rounded logarithm terms. Now shows `T₃(−0.2) = −167/750` before rounding and attaches the remainder bound to that exact value. Also checks that the displayed decimal bound rounds outward. |
| 1869–1876 | Exercise 15.8 now bounds the arctangent remainder's size explicitly; sample checks cover negative and positive inputs for its two-sided limit. |
| 1950–1963 | Exercise 15.11 now distinguishes the contribution from one arctangent approximation from the total error in pi, and bounds magnitudes. Clarifies that the eight-term bound is insufficient while nine terms suffice. |
| 1992–2010 | Exercise 15.12 explicitly handles an iterate reaching the root, after which all errors remain zero. Recalls Module 7's sign convention and adds a root-hit check. |
| 2053 | Quiz question 6 admitted multiple valid upper bounds. It now asks specifically for Taylor's inequality with `n = 4`, `M = 1`, so the intended answer is unique. |

The remaining radius, endpoint, term-by-term differentiation/integration, Abel, Taylor, binomial and
Euler arguments were checked with their hypotheses. In particular, the binomial proof uses its
differential equation rather than assuming that a convergent Taylor series equals its function.
The smooth nonanalytic example and the local Newton convergence proof retain their necessary
conditions. Prerequisites and the seven teaching sections match the stated goals; the longer proofs
remain in optional Going deeper boxes.

## Cross-references and notation

- Verified the references to Modules 4 and 7 for finite differences, linearisation and Newton's
  method, including Theorem 7.3 and the square-root convergence constant in Example 7.9.
- Verified the earlier examples and exercises used for L'Hôpital's rule, logarithms and alternating
  series, including Examples 7.5, 7.6, 7.13 and 14.14 and Exercise 14.9.
- Checked the link to Module 13's oscillating solutions and the claims about what that module proves.
- All section, exercise and figure identifiers are preserved. Other modules and shared implementation
  files were left unchanged.

## Software sources

The software explanation was checked against primary sources:

- [Intel's discussion of x87 instructions and mathematical functions](https://www.intel.com/content/www/us/en/developer/articles/technical/the-difference-between-x87-instructions-and-mathematical-functions.html)
  documents hardware instructions such as FSIN, disproving the original blanket claim.
- [fdlibm sine implementation](https://netlib.org/fdlibm/s_sin.c) and
  [sine kernel](https://netlib.org/fdlibm/k_sin.c) demonstrate range reduction and a tuned polynomial.
- [Python math documentation](https://docs.python.org/3/library/math.html) identifies CPython's thin
  wrappers around the platform C mathematics library.

## Widget and figures

- The taylor-explorer's English and Chinese warnings now say that a series diverges outside its
  convergence interval and that increasing the degree need not improve the approximation.
- Added a numeric regression for `ln(2.5)`: the signed errors at degrees 1 and 2 are approximately
  `−0.5837093` and `+0.5412907`, so the absolute error decreases. All existing widget cases remain.
- Independently verified the square-root binomial coefficients stored in the widget.
- Generated and visually inspected all four figure previews. No mathematical or layout defect was
  found. Discarded SVG element-order differences caused solely by regeneration on this machine.

## Validation

- Python 3.12.13 in an isolated environment, with all four versions pinned by
  `tools/requirements.txt`: SymPy 1.14.0, mpmath 1.3.0, NumPy 2.4.6 and matplotlib 3.11.2.
- `calc.py --module 15 --update`, then `calc.py --module 15`: **804 checks, 0 problems,
  all outputs match**. The only changed output block is the signed Machin-error listing.
- `node tools/check.mjs --lang en`: **22 pages, 0 errors, 0 warnings**.
- `node tools/build.mjs --lang en`: passed. The build notes that the code ZIP is absent in this
  fresh worktree; regenerating it needs the full-series calculation run at publication time.
- `node tools/widget-test.mjs --only taylor-explorer`: **15 checks passed, 0 failed**, against
  the freshly built page using local Google Chrome.
- Page inventory: 7 teaching sections plus summary, exercises and quiz; 17 worked examples,
  12 exercises (4 single-star, 5 double-star, 3 triple-star), 8 quiz questions, 4 figures,
  1 widget, 7 Python/output blocks, 74 check blocks and 3 value tables.
- Section, exercise and figure identifiers compared with the original: all preserved.
- `git diff --check`: clean. Original checkout status, tracked diff and every untracked file
  match the fingerprints recorded before the review; the uncommitted MDE work is untouched.

- Desktop rendering at 1100 px: inspected all 66 overlapping screenshots of the full page,
  including all 12 open solutions and all 8 quiz explanations. No overlapping or clipped content,
  missing figures, KaTeX errors or JavaScript errors.
- Phone rendering at 360 px: inspected the widget and every scrolling formula/table at both scroll
  positions. Five display formulas scroll by 2–11 px; three tables scroll by 15–98 px inside their
  frames, as the brief permits. The document itself stays 360 px wide. Also exercised and inspected
  the revised outside-convergence warning at degree 2, with no widget overflow.
- Evidence retained in ignored `out/review-qa/` (screenshots and `report.json`), `out/figs/`, and
  `out/review-{calc-update,calc-final,check,build,widget}.log`.

No unresolved issue was found within Module 15's review scope.

## For the coordinator

- Module 15's cross-module items are addressed; Module 7's Newton sign convention is preserved.
  The outstanding Module 19 sign error and formula-sheet items are outside this review's scope.
- The widget test runner skips missing built pages without failing. Build before testing; the
  focused suite must report actual checks, not only a successful exit status.
- The original checkout's uncommitted MDE work is separate from this review worktree. Nothing has
  been merged, published or committed.
