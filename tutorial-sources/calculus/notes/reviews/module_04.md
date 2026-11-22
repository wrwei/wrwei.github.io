# Review of Module 4, The derivative

Reviewed 22 November 2026, following `notes/REVIEWING.md`. Line numbers are those of
`src/en/module_04.md` at the start of the review (1506 lines, the page of commit 3017e25); the
coordinator's work-in-progress commits of 16:32–16:33 picked up part of this review while it was under
way. Every worked example, exercise solution, quiz answer and explanation was worked by hand before the
check blocks were read, and every cross-reference and every claim about another module was opened and
checked.

The page was in good shape. Every example, solution and quiz answer is right, and the derivative is
defined precisely at a point (an open interval, a limit that is a real number), as a function, and from
one side; differentiable and continuous are distinguished with the right counterexamples. The problems
were one numerical result in Section 4.7 attributed to the wrong cause, a list of ways to fail to be
differentiable that read as complete, results quoted from Modules 5 and 6 without saying so, limits
justified by the wrong law, skipped algebra in derivatives from the definition, a figure label over a
guide line, and display formulas that scrolled on a phone.

Final state (after the follow-up on the sign of errors, below): `calc.py --module 04`: 526 checks
(was 454) in 52 check blocks, all outputs match;
`check.mjs --lang en`: no errors or warnings; build clean, no KaTeX errors; `widget-test --only
secant-tangent`: 14 checks pass (widget unchanged). Section ids, figure ids, exercise ids and the
numbering of every definition, theorem, example, figure and exercise are unchanged. Other modules cite
Examples 4.8 and 4.10, Theorem 4.1, Exercise 4.7, Sections 4.1–4.4, 4.6 and 4.7, and the ids `tangents`,
`derivative`, `failures`, `continuity`, `graph-of-derivative`, `polynomials`, `power-rule`, `motion`,
`truncation`, `rounding` and `ex-4-7`. Module 8's Exercise 8.8 quotes Section 4.7's "about 5 × 10⁻⁶",
"about 7 × 10⁻¹¹" and central errors "about 10⁻¹⁰": all still on the page.

## Correctness and precision

| Line | Issue | Done |
|---|---|---|
| 998 | "The forward error shrinks tenfold per row, as $3h$ predicts, down to about $4 \times 10^{-9}$ at $h = 10^{-8}$": $3h$ predicts $3 \times 10^{-8}$ there. Computed exactly (with fractions), the $4 \times 10^{-9}$ is a near-cancellation of the truncation error by a rounding error of the opposite sign and about the same size ($-3.0 \times 10^{-8}$ and $+2.6 \times 10^{-8}$ in the series' sign convention, exact minus estimate). | The tenfold shrinking is stated down to $3 \times 10^{-7}$ at $h = 10^{-7}$; at $10^{-8}$ the two errors, of about the same size and opposite signs, nearly cancel, by luck. Checks of the rounding part's sign and size. |
| 1022 | "The table agrees: errors of a few times $10^{-9}$ … near those steps", straight after the estimate $5 \times 10^{-8}$ for the forward difference. | The central errors match the estimate; the forward one beats it because of the cancellation (pointer to Exercise 4.12). Ex 4.12(b) (1417), "the rounding errors partly cancelled by luck", now says the same as the text. |
| 466 | "differentiability says, in addition, that it has no corners, cusps or vertical tangents there" read as a characterisation; a continuous function can fail in other ways ($x\sin(1/x)$, which Exercise 4.11 treats). | Differentiable at $a$ now means that zoomed in the graph looks like a non-vertical line, which rules out corners, cusps, vertical tangents "and other failures too", with a link to Exercise 4.11; checks. The summary bullet (1050) adds "nor where its difference quotients keep oscillating". Figure 4.3's "Four ways" and the key idea's list are true as they stand. |
| 327 | The argument that an increasing $f$ has $f' \ge 0$ did not assume $f$ differentiable at $x$; "The converse, that $f' > 0$ … makes $f$ increasing" is a partial converse (the converse of "increasing ⇒ $f' \ge 0$" is false); "decreasing" was used but not defined, although Module 8 calls its definitions of increasing and decreasing "the definitions of Section 4.3". | Hypothesis added; **decreasing** defined; "In the same way, $f'(x) \le 0$ where $f$ is decreasing"; "A partial converse". |
| 507 | "That is the whole proof, for every power", after an observation about $n = 3$. | "That is the idea of the proof, and the proof below carries it out for every power." |
| 922 | The truncation-error predictions for $\sqrt x$ at 4 use $f''(4)$ and $f'''(4)$, which need the power rule for fractional exponents (Module 6); the page did not say where they came from. | $f''(4) = -\tfrac1{32}$ and $f'''(4) = \tfrac3{256}$ stated and credited to Module 6; for $x^3$, $f''(a) = 6a$ and $f''' = 6$ stated; checks. |
| 1148 | Ex 4.4(b): "Module 5's chain rule gives the formula" for $(x + 1)^{2/3}$; it also needs Module 6's power rule. | Credits both modules and gives $g'(x) = \tfrac23(x + 1)^{-1/3}$; checked on both sides of $-1$. |
| 214 | Example 4.4(b): "By the limit laws, $g'(4) = \dots$": the step uses the continuity of the square root (Module 3). "is $\tfrac00$ at $h = 0$" for a quotient not defined there; the cancellation of $h$ not mentioned. | "The square root is continuous at 4 (Module 3), so $\sqrt{4 + h} \to 2$"; "Putting $h = 0$ … gives $\tfrac00$"; cancelling $h$ said, with its condition; checks. |
| 259 | Example 4.5: the limit of $1/(\sqrt{x + h} + \sqrt x)$ taken without a reason; no condition on $h$. | Continuity of the square root named; "$h \ne 0$ small enough that $x + h > 0$"; checks. |
| 245 | Definition 4.4: "at every $x$ where this limit exists" (not said: a real number, $f$ defined around $x$). | "at every $x$ at which $f$ is differentiable, that is, at which this limit exists in the sense of Definition 4.3". |
| 411 | Definition 4.5: "when these limits exist"; Ex 4.4(b) relies on infinite limits not counting. | "(as real numbers)", as in Definition 4.3. |
| 1242 | Ex 4.7(c): the ball lands faster than it was thrown "because it falls from higher than it started", which explains nothing. | It lands 1.5 m below the point of release: it falls 12.525 m and rose 11.025 m; checked. |
| 1276 | Ex 4.8: the blow-up of $(b + c - 1)/h$ was "as Theorem 4.1 predicts" (Theorem 4.1 predicts non-differentiability); the solution never said that $b = 2$, $c = -1$ do give a derivative. | Both said; checked. |
| 1291 | Ex 4.9: "$f'(1) = -1$ (as in Example 4.4)", which computed $f'(2)$. | "(the method of Example 4.4 gives $f'(a) = -1/a^2$)"; checked. |

## Steps a learner needs

| Line | Issue | Done |
|---|---|---|
| 50–56 | Example 4.1 went from $20(a + h) - 2(a + h)^2$ to the expanded form in one step, and divided by $h$ only in words. | Shows $(a + h)^2$ and $-2(a^2 + 2ah + h^2)$, names the terms that cancel, and shows the quotient before the limit; checks. |
| 115 | Example 4.2: "expanding confirms that $x^3 - 3x + 2 = (x^2 - 2x + 1)(x + 2)$", a factorisation the reader cannot find. | Factored by grouping: $(x^3 - x) - (2x - 2) = x(x - 1)(x + 1) - 2(x - 1) = (x - 1)(x^2 + x - 2)$, with a link to Module 2's factor theorem; checks, including the claim "from above when $h > 0$ and from below when $h < 0$" (111), which had none. |
| 172, 1063 | Example 4.3 and Ex 4.1(a) skipped $2(2 + h)^2 = 2(4 + 4h + h^2)$ and $3(-1 + h)^2 = 3(1 - 2h + h^2)$; Ex 4.1(a) never wrote $f(-1 + h) - f(-1)$. | Lines added; checks. |
| 253 | Example 4.5 skipped the expansion of $(x + h)^2$. | Added; checked. |
| 297 | Example 4.6: the half-turn argument that $f'$ is even did not say that the half turn takes the tangent at $x$ to the tangent at $-x$. | Said. |
| 576 | Theorem 4.3: the proof split the quotient of $f + g$ without showing the regrouping. | Regrouping shown with Module 1's $\Delta$ ($\Delta f$, $\Delta g$, as Module 5's proofs write them); check. |
| 868 | "Central differences are also the natural choice for measured data" gave no reason. | "the estimate at each inner time uses the measurements on both sides of it". |

## Check blocks

Every block was compared with the prose around it; all checked what the page says. Added checks for each
new step above, and for results that had none: the quotient $9.8 + 4.9h$ at $t = 1$ (line 20, check at
30), the sign claims of Example 4.2, the braking car's acceleration $-4$ m/s² (761), the values of $f''$
and $f'''$ (925), the forward error $3 \times 10^{-7}$ at $h = 10^{-7}$ and the rounding part at $10^{-8}$
(1006), the forward result below its estimate (1030), the quotient $\sin(1/h)$ of Exercise 4.11 from both
sides (469), and Exercises 4.4(b), 4.7(c), 4.8 and 4.9. 454 → 495 checks.

## Figures and widget

- Figure 4.2 (`fig_04_2`): the label $y = f'(x) = 3x^2 - 3$ ran across the dashed guide at $x = 1$, and
  "slope 9" sat on the curve. The label is now on two lines and "slope 9" on the open side of its dot.
  Regenerated; the other four SVGs are byte-identical to before.
- Figures 4.1 and 4.3–4.5 checked against their captions and the text (window sizes, the 0.0007 error in
  the last window of Figure 4.1, slopes, best steps): right.
- Widget `secant-tangent`: the built-in quotients are computed in forms that keep their digits, and typed
  functions use the central difference with step $10^{-5}(1 + |a|)$, as Section 4.7 says. Beyond its
  test I tried $e^x$ at 0, $\sqrt x$ at 4, $\sqrt x$ with $a + h < 0$, and typed `floor(x)`, `sqrt(x)`,
  `cbrt(x)` and `x^2`: every readout and message is right, with no page errors. It fits at 360 px. No
  change; 14 checks pass.

## Rendering

At 1100 px (45 screenshots, solutions opened): no KaTeX errors, nothing overlaps or is cut off. At 360 px
the page never widens, but 19 display formulas scrolled inside their line, several cut mid-fraction on
screen (Example 4.4(a), Theorem 4.3's proof, Example 4.8, and most displays in the solutions of
Exercises 4.1 and 4.8–4.11). All were restacked, one step per line, without changing the mathematics; at
360 px only code blocks scroll now, as on the other pages.

## Left as they are

- Section 4.4 calls it a vertical tangent when the quotients blow up from both sides; at the end of a
  domain ($\sqrt x$ at 0) Example 4.5 says the graph "starts out vertically". Module 5 (about line 641)
  says $\sqrt x$ "starts with a vertical tangent": harmless, but it could say "starts out vertically".
- "software that trains networks … usually returns 0" for the ReLU at 0 is not in `notes/FACTS.md`; it
  is true of PyTorch, TensorFlow and JAX, and the page hedges it.

## Elsewhere (not edited)

- `formulas.md` has no entry for the definition of the derivative (both forms) or for the forward and
  central differences with their $O(h)$ and $O(h^2)$ errors, which Module 4 introduces. Its $x^n$ row says
  "every $x \ne 0$ if $n$ is an integer"; for positive integers the rule holds at every $x$ (Theorem 4.2).
- Module 8 (line 442) says Module 4 "promised the converse"; Module 4 now says "a partial converse".
  Consistent enough; no change needed.
- `fig-04-1`, `fig-04-3` and `fig-04-4` already differed from commit 3017e25 when this review began
  (regenerated by someone else); the generator reproduces the current files exactly.

## Follow-up: the sign of errors

The coordinator asked for the series' convention, error = exact value minus approximation (Modules 7,
9, 11, 13 and 15 and the formula sheet; Section 4.4's $E(h) = f(a + h) - (f(a) + mh)$ already follows
it). Section 4.7 used estimate minus $f'(a)$. Changed, with signs flipped everywhere and sizes, absolute
values and $O(\cdot)$ statements kept as they were:

- Definition 4.7: "The **error** of such an estimate is $f'(a)$ minus the estimate: the exact value minus
  the approximation, as for every approximation in this series. It is positive when the estimate is too
  small, and negative when it is too large."
- Example 4.11: errors $-3ah - h^2$ and $-h^2$; "Both estimates are too large, so both errors are
  negative."
- The $\sqrt x$ value table: columns $\tfrac14 - \text{forward}$ and $\tfrac14 - \text{central}$
  (regenerated: $0.001543, \dots$ and $-1.954 \times 10^{-5}, \dots$), with a sentence on the signs.
- The velocities box: the end estimates have errors $-4.9h$, that is $-2.45$ and $+2.45$ m/s (it said
  "have error $4.9h$", which also had the wrong sign at the backward end).
- Truncation: forward error $-3ah - h^2$, central $-h^2$; key idea "about $-\tfrac{h}{2}f''(a)$" and
  "about $-\tfrac{h^2}{6}f'''(a)$"; predictions $-3ah$, $-h^2$, and for $\sqrt x$ at 4 $\tfrac{h}{64}$
  and $-\tfrac{h^2}{512}$ ($0.00156$ and $-0.0000195$).
- Rounding: the rounding error "can have either sign; its size is about $\varepsilon\abs{f(a)}/h$"; the
  models $3h + \varepsilon/h$ and $h^2 + \varepsilon/h$ are now stated as bounds on the size of the
  error (the "about $7 \times 10^{-11}$" that Module 8 quotes is still there).
- The Compute it box now prints the signed errors `exact - forward` and `exact - central` (before:
  absolute values of estimate minus exact). Outputs regenerated; the prose now reads the signs: the first
  rows negative, close to $-3h - h^2$ and $-h^2$; $-3 \times 10^{-7}$ at $10^{-7}$; $-4 \times 10^{-9}$
  at $10^{-8}$ as truncation $-3.0 \times 10^{-8}$ plus rounding $+2.6 \times 10^{-8}$; either sign once
  rounding dominates. Every value was compared with the regenerated output, and checks were added for
  each.
- Figure 4.5 (`fig_04_5`): it plots sizes, so the axis is now "size of the error" and the line labels
  read "size ≈ $3h$", "size ≈ $h^2$", "rounding error: size ≈ $\varepsilon/h$"; the caption and the text
  say "sizes of the errors". The plotted data are unchanged.
- Exercise 4.9: question (c) asks for each error to be "less than $10^{-6}$ in size"; (b) errors
  $-\tfrac{h}{1 + h}$ and $\tfrac{h^2}{1 - h^2}$, values $-0.090909$, $0.010101$, $-0.009901$,
  $0.000100$, with "the forward difference is too large and the central difference too small".
- Exercise 4.12: "Section 4.7 bounded the size of the error … by about $3h + \varepsilon/h$"; (b) and (c)
  speak of the two parts and the smallest value of $E$; the solution quotes the signed table values
  ($-4 \times 10^{-9}$, $-3 \times 10^{-7}$, $-2.5 \times 10^{-7}$) and compares sizes with the model.
- Quiz 8: "The truncation error, $-3h - h^2$, shrinks in size with $h$"; its check flipped.
- Unchanged on purpose: the widget's readout row "Quotient − derivative" (it is labelled by its formula,
  is not called an error, and comes before Section 4.7); "off by" statements; the summary's $O(h)$,
  $O(h^2)$ and "grows like $\varepsilon/h$".

Checks: 495 → 526. `calc.py --update`, then without it: all outputs match; `check.mjs`: no errors or
warnings; build clean; widget test 14/14; nothing scrolls at 360 px except code.

Outside Module 4 (not edited):

- Module 15, Theorem "Errors of the linearisation and of difference quotients" (lines 1002–1007): parts 2
  and 3 define the error of the forward and central differences as the estimate minus $f'(a)$, equal to
  $\tfrac{h}{2}f''(c)$ and $\tfrac{h^2}{6}f'''(c)$. Under the convention they are $f'(a)$ minus the
  estimate, $-\tfrac{h}{2}f''(c)$ and $-\tfrac{h^2}{6}f'''(c)$. The proof (1011: "subtract $f(a)$, divide
  by $h$ and subtract $f'(a)$"; 1019: "Divide by $2h$ and subtract $f'(a)$: the error is $\tfrac{h^2}{6}$
  times …"), the check block (1022–1032) and line 1035 ("the error is about $\tfrac{h}{2}f''(a)$ … about
  $\tfrac{h^2}{6}f'''(a)$ … These are the claims of Section 4.7") need the same flip, or line 1035 no
  longer matches Section 4.7. Part 1, $f(x) - L(x)$, already follows the convention.
- Module 5, Going deeper "A proof of the chain rule" (line 527): $E(k) = \dfrac{f(u + k) - f(u)}{k} -
  f'(u)$ is called "the error of the difference quotient", the opposite sign. Either define
  $E(k) = f'(u) - \dfrac{f(u + k) - f(u)}{k}$, so that $f(u + k) - f(u) = \big(f'(u) - E(k)\big)k$, or
  call $E$ something else; the proof works either way.
- Module 8, Exercise 8.8 (line 1441): "Section 4.7 modelled the error of the central difference … as
  $E(h) = h^2 + \varepsilon/h$". Section 4.7 now calls this a bound on the size of the error; "the size
  of the error" would match, and in (b) "its table had its smallest central errors, about $10^{-10}$" is
  true of the sizes. Optional.
- No other module states a signed error of a difference quotient (checked Modules 5, 6, 8, 10, 13, 15
  and the formula sheet).

