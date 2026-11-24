# Series-wide Calculus review

24 November 2026. This pass covers the 20 English modules and builds on the individual
reviews in this directory. It checks the recorded follow-ups against the current sources,
audits numbered references, reruns the calculations and checks the built pages.

## Corrections

| Source | Finding and correction |
|---|---|
| Module 6, line 1137 | The doubling-time example uses `sp.Eq` and `sp.solve` before the solver is introduced in Module 8. It now explains the equation and the result list. |
| Module 7, line 207 | The related-rates example now explains how `sp.solve` interprets the expression and why the code takes the first entry in the list. |
| Module 9, lines 865, 883–915 | The strict inequalities are specific to this example. The midpoint sums now print to nine decimal places, with independent high-precision checks for each of the four values. The earlier index log misidentified the example as NumPy code. It uses Python's `math.exp` and built-in `sum`. |
| Riemann-sums widget, Modules 9 and 11 | On $[0, 6.5]$, the earlier single-interval calculation for $\sin(100x)$ exhausted its evaluation budget. It also returned 1 for $\cos(1024\pi x)$ on $[0, 1]$ because the initial samples lined up with the peaks, while the integral is 0. The reference calculation now starts on short, slightly unequal panels with a shared evaluation budget. It gives approximately 0.01952431355 for the first function and withholds the reference estimate and error for the second. |
| Module 11, line 4 | The lead promised guaranteed numerical accuracy for any integral. It now ties error bounds to the derivative conditions used in the module. |
| Module 12, lines 465–470 and 1520 | The sine-arch example identifies the non-elementary antiderivative as a result used without proof and links to the Module 11 explanation. The arc-length section describes Simpson's rule as a way to approximate the integral. The exercise solution uses Simpson's rule directly. |
| Module 20, line 1385 | The ε–δ definition is in Section 2.7. The list of results used without a full proof now reflects the optional proof of Clairaut's theorem in Module 17 and the continuous case of Fubini's theorem in Module 19. |

Confirmed the existing signed-error corrections, Module 10's cross-references, Module 12's
positive-area centroid condition, the exercise and section IDs cited by other modules, and the
formula-sheet follow-ups. Marked the completed items in the [cross-module notes](cross-module.md).

For the elliptic integral classification, rewrite $1 + \cos^2 x$ as
$2(1 - \tfrac12\sin^2 x)$ and compare with the standard elliptic integral of the second
kind. [NIST Digital Library of Mathematical Functions, equation 19.2.5](https://dlmf.nist.gov/19.2.E5)

## Verification

- The numbered-reference audit examined 1,477 mentions across the 20 module sources,
  including 205 links with anchors. The Section 2.7 correction resolved the numbering mismatch it found.
- The full calculation run passed 12,320 checks across 22 pages, with every Python output and computed
  table matching. The standard page checker reported zero errors and warnings. The build passed, and
  the 23-script archive passed its integrity check and matched the copy served by the local build.
- Chrome checked all 20 modules at 1100 px and 360 px, with exercise solutions open and all
  eight quiz explanations revealed per module. All 98 figures loaded. There were no document-width
  overflows, KaTeX errors or uncaught JavaScript errors. Wide formulas and tables scroll within
  their own frames. Inspected the phone screenshots of the page starts and widgets, and the changed
  sections in Modules 12 and 20.
- All 19 widget instances mounted. The 18 widget suites passed all 264 checks, and the two instances
  of the Riemann-sums widget both reproduced the corrected result on a phone-width viewport.
- The original checkout's staged and unstaged diffs, status and 604 untracked-file hashes matched the
  before-review snapshot. This pass used the existing review worktree. No commit or publication was made.
