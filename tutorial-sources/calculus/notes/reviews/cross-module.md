# Cross-module items from the reviews

Issues a reviewer found outside the module under review, for the reviewer of the module named (or the
coordinator). Struck through when done.

## Series-wide decisions

- **Sign of an error.** The error of an approximation is the exact value minus the approximation:
  Modules 4 (Sections 4.6 and 4.7), 7, 9 (which defines the term, in Section 9.3), 11, 13, 14 and 15, the formula sheet and the
  riemann-sums widget follow it. Absolute errors and O(·) statements are unaffected. Iterative methods
  (Newton) may state |x_n − r| instead.

## For the reviewer of

- ~~**Module 9:** its induction section could say that Exercise 5.10 already used induction (Module 5
  review). The riemann-sums widget is shared with Module 11: run its test after any change, and keep
  Module 11's widget paragraph true.~~ Done.
- **Module 11:** links to Exercise 6.10 (`ex-6-10`), which keeps its id.
- ~~**Module 13:** line 338 says "Section 7.2 showed"; Module 7 only states it there: say "stated" (Module 7
  review).~~ Done.
- **Module 15:** Newton's method: Module 7 defines e_n = x_n − r (the error with its sign reversed) in
  Theorem 7.3; keep that in Section 15.5 and Exercise 15.12, or change it together with Theorem 7.3
  (Module 7 review).
- **Module 15:** the theorem on difference quotients (about lines 1002–1035) states the errors of the
  forward and central differences as (h/2)f″(c) and (h²/6)f‴(c), the opposite sign to Section 4.7, which
  now uses error = f′(a) − estimate (Module 4 review): flip the theorem, its proof and its checks so that
  "these are the claims of Section 4.7" stays true.
- ~~**Module 14:** line 292 says Module 6 "shows" that the slope of 2^x at 0 exists; Module 6 only
  sketches why (Module 6 review). Module 3's Intermediate Value Theorem is now proved from the
  completeness axiom, with a link to Module 14 (Module 3 review): check that Module 14's account of
  completeness matches.~~ Done.
- **Module 15:** line 88 writes "monotone convergence theorem"; Modules 3, 12, 13 and 14 capitalise it
  (Module 14 review). Optional: the constants a, b near line 1535 clash with Module 13's coefficients a, b
  (Module 13 review). Keep the id `ex-14-9`, which Module 15 links to.
- **Module 19:** line 88: by the series' sign rule the error of M_n is −8/(3n²), not +8/(3n²) (Module 9
  review).

## For the coordinator

- ~~Formula sheet: add the definition of the derivative and the forward and central differences (Module 4
  review), and an `arcsec` row; the inverse-function rule needs f continuous and one-to-one on an open
  interval (Module 6 review).~~ Done.
- Optional: `sp.solve` appears in Modules 6 and 7 before Module 8 explains it (Module 8 review).
- Keep the ids `module_04#ex-4-11` and `module_07#the-rule`: Module 8 links to them.
- ~~Formula sheet: L'Hôpital's rule, differentials and Newton's step (Module 7 review).~~ Done.
- Not done yet (found by the reviews of Modules 9–13):
  - Formula sheet: the integral's "Definition" row is Theorem 9.4's equal-width form, not Module 9's
    definition (Module 9 review); `∫cot x` is credited to Module 10, which never derives it (Module 10
    review); the secant substitution row covers only x ≥ a, add the x ≤ −a case as Module 11 now
    states it (Module 11 review); the logistic and linear equations use letters (k, M; P, Q, I) other
    than Module 13's (Module 13 review).
  - Module 10, line 230: says Module 9 defines the integral "as the number of subintervals grows";
    Module 9 lets the largest width shrink to 0. Line 804: "Substitution proves it", but Module 9
    already proves it (Theorem 9.8) (Module 9 review).
  - Module 12, line 470: says √(1 + cos²x) has no elementary antiderivative without saying that this is
    quoted, not proved; link Module 11's section on integrands with no elementary antiderivative
    (Module 11 review).
  - Optional: `notes/FACTS.md`'s RK45 row could quote the `solve_ivp` docstring's sentence on error
    control (Module 13 review); `_core.js` y-axis tick labels crowd the axis in narrow plots (Module 9
    review, cosmetic).
- At 360 px some display formulas still scroll inside their line (Module 1: about 10, Module 2: 2) and
  some tables scroll inside their frame (Module 1: 2, Module 3: 6). The brief allows both.
