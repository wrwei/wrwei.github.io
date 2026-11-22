# Cross-module items from the reviews

Issues a reviewer found outside the module under review, for the reviewer of the module named (or the
coordinator). Struck through when done.

## Series-wide decisions

- **Sign of an error.** The error of an approximation is the exact value minus the approximation:
  Modules 4 (Sections 4.6 and 4.7), 7, 9 (which defines the term), 11, 13 and 15, the formula sheet and the
  riemann-sums widget follow it. Absolute errors and O(·) statements are unaffected. Iterative methods
  (Newton) may state |x_n − r| instead.

## For the reviewer of

- **Module 9:** its induction section could say that Exercise 5.10 already used induction (Module 5
  review). The riemann-sums widget is shared with Module 11: run its test after any change, and keep
  Module 11's widget paragraph true.
- **Module 11:** links to Exercise 6.10 (`ex-6-10`), which keeps its id.
- **Module 15:** the theorem on difference quotients (about lines 1002–1035) states the errors of the
  forward and central differences as (h/2)f″(c) and (h²/6)f‴(c), the opposite sign to Section 4.7, which
  now uses error = f′(a) − estimate (Module 4 review): flip the theorem, its proof and its checks so that
  "these are the claims of Section 4.7" stays true.
- **Module 14:** line 292 says Module 6 "shows" that the slope of 2^x at 0 exists; Module 6 only
  sketches why (Module 6 review). Module 3's Intermediate Value Theorem is now proved from the
  completeness axiom, with a link to Module 14 (Module 3 review): check that Module 14's account of
  completeness matches.

## For the coordinator

- ~~Formula sheet: add the definition of the derivative and the forward and central differences (Module 4
  review), and an `arcsec` row; the inverse-function rule needs f continuous and one-to-one on an open
  interval (Module 6 review).~~ Done.
- At 360 px some display formulas still scroll inside their line (Module 1: about 10, Module 2: 2) and
  some tables scroll inside their frame (Module 1: 2, Module 3: 6). The brief allows both.
