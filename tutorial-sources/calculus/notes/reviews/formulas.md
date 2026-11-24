# Review of the shared formula sheet

Reviewed in the existing Calculus worktree against the review brief, authoring notes, plan,
facts register, Module 1 and the cross-module notes. Line numbers below refer to the original
1,367-line sheet at b3416e2. Checked the formulas against the module statements and their
conditions, and reviewed the symbolic checks and the example session.

| Original lines | Finding and correction |
|---|---|
| 20, 55–56 | Stated the real quadratic discriminant condition and limited the negative-base extension to integer-exponent laws. |
| 192–196, 223–234, 253–271 | Clarified L'Hôpital's hypotheses for one-sided and infinite limits. Added the second derivative-limit form from Module 4 and made the floating-point step sizes scale-dependent guidance. Specified where the chain rule needs differentiability and when the implicit-function formula gives a local branch. |
| 306–307, 356–357 | Scoped the real power rule to positive arguments and separated the inverse secant domain from its derivative domain. |
| 401–406, 421–429 | Resolved the Module 9 note. The definition now uses arbitrary sample points and partitions whose largest width tends to zero. The equal-width result is kept separately. Added an unequal-width partition check using both endpoint choices. |
| 452–482, 507, 519 | Stated the intervals for the variable-limit rules and distinguished definite substitution from the indefinite chain rule. Added the reduction formula's integer requirement, partial-fraction exclusions and the negative integer power restriction at zero. The cotangent antiderivative now points to the logarithmic derivative used to verify it, rather than crediting a derivation to Module 10. |
| 563–585 | Resolved the Module 11 note. Added the negative secant branch, its square-root sign and checks at the endpoint and three interior angles. |
| 590–606, 643–660 | Scoped the quadrature error bounds to the indicated continuous derivatives and corrected the equality claim to refer to absolute errors, consistent with exact minus estimate. Clarified truncated integrals, two independent limits at interior singularities and comparison hypotheses. |
| 683–702 | Supplied the continuous boundary and slice conditions, positive average interval, mass and centroid area, and absolute integrability for a finite mean. Distinguished a spring's restoring force from the force required to stretch it slowly. |
| 757–827 | Matched Module 13's logistic, integrating-factor and second-order notation. Stated the logistic forward-time domain and zero equilibrium, normalised the leading coefficient before using the complex-root formula, and specified regularity for Euler's first-order error bound. Updated the checks to exercise the displayed equations. |
| 864–918 | Scoped the integral-test remainder to convergent series and its decreasing tail. Added the existence and eventual nonzero conditions where needed for ratio and root tests. The Taylor polynomial has degree at most its order. |
| 1006–1131 | Scoped geometric angle formulas to nonzero vectors and the level-surface plane to a regular point. Distinguished partial derivatives from differentiability. The Hessian test needs an interior stationary point, and the multiplier equations need regular constraints. Singular points and boundary restrictions need separate checks. |
| 1163–1194 | Matched the spherical angle notation and stated the one-pass coverage and change-of-variables hypotheses. Added the positive mass condition. Replaced the shortcut over an unspecified improper plane integral with the finite-disc formula and the route used by Module 19. The checks now verify the finite-disc expression, its limit and the unsquared Gaussian integral. |
| 1208–1237 | Added the line and surface integrability conditions, clarified that the conservative-field derivative test is sufficient on a simply connected region, and restored Stokes' and divergence theorem neighbourhood, boundedness and boundary conditions from Module 20. |
| 1294–1367 | Qualified the descriptions of SymPy's solvers, numerical evaluation and series. The example now requests a two-sided limit explicitly. Added a check of the actual ODE solver result. |

Verified the earlier change-of-base and `sp.oo` citations, the Gaussian section link, and the
inverse-derivative, inverse-secant, differences, differentials and Newton entries. The later
Module 11 csc antiderivative is already present at the cited location. The signed-error rule holds
throughout. Software details were cross-checked against the pinned runtime and the official
[limits and series](https://docs.sympy.org/latest/modules/series/series.html),
[integration](https://docs.sympy.org/latest/modules/integrals/integrals.html) and
[numerical evaluation](https://docs.sympy.org/latest/modules/evalf.html) documentation.

## Validation

- Ran `calc.py --page formulas --update` and `calc.py --page formulas` in the
  pinned environment. **790 checks, 0 problems, all outputs match.** The generated
  example output is unchanged.
- `node tools/check.mjs --lang en` returned **22 pages, 0 errors, 0 warnings**.
  `node tools/build.mjs` passed. The existing local build note about the missing
  full-series code ZIP still applies.
- Inspected the whole sheet at 1100 px across 27 overlapping captures. At 360 px,
  inspected all 32 tables and 11 wide display formulas, including both scroll ends and
  the middle of the three widest formulas. Both document widths matched their
  viewports. The browser reported no escaped blocks, broken images, JavaScript
  errors or KaTeX errors.
- `git diff --check` passed. All 32 explicit section IDs were preserved. The original
  checkout's status and staged and unstaged diffs matched, as did all 604 untracked
  files and all 26 earlier review files. The sheet and this log are the only changes
  made by this review.

The formula-sheet items in the shared notes and earlier logs are addressed here.
The Module 12 source centroid condition remains a separate module follow-up.
