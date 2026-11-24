# Review of the Calculus index

Reviewed 24 November 2026 against the review brief, plan, Module 1 and the
cross-module notes. Line references are to the original index at b3416e2.

| Original lines | Finding and correction |
|---|---|
| 2–3, 16–18, 30–38 | The lead and proof claims overstated the scope. The revised copy describes the course from functions to vector calculus and distinguishes proofs in the text from optional harder arguments. It explains what the Checked mark denotes. |
| 29–32 | The body said about 75 hours, while the 20 module estimates total 5,280 minutes or 88 hours. The generated banner already uses the current total. Removed the stale duplicate, added a direct starting link, and corrected the widget claim. Module 12 has no widget, while all 20 modules have exercises and a quiz. |
| 35–38 | Module 1 specifies a scientific calculator in radians as well as paper and pencil. The index now gives those prerequisites and explains that Python is optional. |
| 44–47 | Linked the formula sheet directly. Removed descriptions that presented the unfinished glossary and Common mistakes as available. Both can be linked after they are built. Corrected the ZIP description to account for the separate Python exercise solution files. |
| 51–55 | Confirmed the local companion-series destinations. Replaced generic external home-page links with the [OpenStax maths textbook catalogue](https://openstax.org/new-subjects/math-books), which lists all three calculus volumes, and MIT OpenCourseWare's [single-variable](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/) and [multivariable](https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/) courses. |

The five section IDs and the module-card insertion point are preserved. The
index has no check blocks, figures or widgets of its own.

- The English page checks passed on 22 pages with zero errors and warnings.
  The default site build passed and copied the regenerated code ZIP.
- The full calculation run executed 12,316 checks and wrote a ZIP with 23 scripts.
  The Module 9 midpoint-sum example differed in the last printed digits for 100
  and 1,000 intervals on this machine. It uses Python's `math.exp` and built-in
  `sum`. The [series-wide review](series.md) fixed the output at nine decimal
  places and verified all four printed results.
- Inspected the entire index in Chrome at 1100 px and 360 px. Both layouts had
  the expected document width, with no JavaScript or KaTeX errors. All 20 cards
  target the corresponding built modules. The start link points to Module 1,
  and the resume link points to Module 2 after one completion is recorded.
- The ZIP passed its integrity check. It contains all 20 module scripts and
  three exercise solution scripts, and the copy in the local build matches it.
- The original checkout's staged and unstaged diffs, status and 604 untracked
  file hashes matched the before-review snapshot. The 29 earlier review files
  also matched. Only the index source and this review log changed.
