# Review of Module 5, Rules of differentiation

Reviewed 22 November 2026, following `notes/REVIEWING.md`. Line numbers are those of
`src/en/module_05.md` at the start of the review (1568 lines, the page of commit 3017e25); the
coordinator's work-in-progress commits picked up part of this review while it was under way. Every
worked example, exercise solution, quiz answer and explanation was worked by hand before the check
blocks were read, and every cross-reference and every claim about another module was opened and
checked.

Final state: `calc.py --module 05`: 298 checks (was 286), all outputs match; `check.mjs --lang en`: no
errors or warnings; build clean;
`widget-test --only derivative-grapher`: 15 checks pass (was 14). Section ids, figure ids, exercise
ids and the numbering of every definition, theorem, example, figure and exercise are unchanged (Modules
9, 10, 11, 13, 16 and 17 link to `#trig`, `#other-trig`, `#product`, `#chain`, `#different-looks` and
`#autodiff`, and cite Sections 5.5, 5.7 and 5.8).

The page was in good shape. Every example, solution and quiz answer is right. The proofs are sound:
the product and quotient rules are proved completely (the quotient rule including why $f/g$ is defined
near $x$); the chain rule's division by $\Delta u$ is labelled "the idea of the proof", its gap
($\Delta u = 0$ for $h$ arbitrarily close to 0) is stated, and the Going deeper box gives a complete
proof with the error function $E(k)$, $E(0) = 0$, which never divides by $\Delta u$ and uses the
limit-of-a-composition theorem of Module 3 correctly. Definition 5.1 (dual numbers) is correct, and the
link to automatic differentiation is right: the $\varepsilon$-part of a product is the product rule,
Theorem 5.7 is proved by induction on how a polynomial is built, and a function with a declared
derivative composes by the chain rule. The problems were imprecise statements (a vertical tangent at an
endpoint, a slip in the addition-formula proof, an overstated accuracy claim), results used before the
module that introduces them (induction, roots as powers, the sign test of Module 8), skipped steps,
a figure label under a curve, and display formulas that scrolled on a phone.

## Correctness and precision

| Line | Issue | Done |
|---|---|---|
| 640 | "At $x = 0$ … the graph of $\sqrt x$ starts with a vertical tangent." Module 4 defines a vertical tangent by difference quotients tending to $\infty$ (or $-\infty$) from both sides, impossible at an endpoint of the domain (raised by the Module 4 reviewer through the coordinator). | One-sided statement: $\sqrt x$ is not defined left of 0, and from the right its quotients $\dfrac{\sqrt h - 0}{h} = \dfrac{1}{\sqrt h}$ grow without bound, so the graph leaves the origin vertically. Checks added. |
| 1184 | Ex 5.3(e): the semicircle's slope "grows without bound … as $x$ approaches $\pm2$, where the tangents are vertical": the same endpoint problem. | "where the semicircle meets the $x$-axis vertically". |
| 359 | Deeper box, addition formulas: "Replacing $y$ by $-y$ …, and then taking $x = \pi/2$, gives" the two formulas; taking $x = \pi/2$ after the replacement gives $\cos(\pi/2 + y) = -\sin y$, not the displayed $\cos(\pi/2 - y) = \sin y$. | The two substitutions are separated: $-y$ for $y$ gives the first formula; $x = \pi/2$ in the formula for $\cos(x - y)$ gives the second. |
| 899 | Automatic differentiation is "as accurate as the value of $f$ itself": not true in general (rounding in the derivative's own operations can make it less accurate). | "There is no step $h$ and so no truncation error: the result is exact apart from floating-point rounding, of the kind that affects the value of $f$ itself". |
| 1044 | "SymPy, given the formula, agrees": SymPy was given the program `g`, run on a symbol, not a formula. | "run on the symbol `x`, the same program builds the formula, which `sp.diff` then differentiates". |
| 506 | The counterexample for the chain rule's hypothesis did not say that $f(u) = \lvert u\rvert$ is differentiable at $x = 1$, which is the point of "at $g(x)$, not at $x$". | "$f$ is differentiable at 1 but not at $g(1) = 0$"; check added. |
| 475 | Gears: $\dfrac{d\theta_B}{d\theta_A} = 2$ is false for signed angles (meshing gears turn in opposite directions; the caption says so). | "each measured in its own direction of turning". |
| 522 | Deeper chain-rule proof: "defined on an interval around $u$". | "an open interval" (as in Module 4's definition). |
| 611, 650 | The power-of-a-function and square-root formulas omitted the hypothesis that $g$ is differentiable. | Added. |

## Using what Modules 1–4 introduce (AUTHORING section 11)

| Line | Issue | Done |
|---|---|---|
| 1374 | Exercise 5.10 asks for a proof "by induction"; induction is first taught in Module 9 (line 225) and nowhere in Modules 1–4. | Two sentences in the exercise explain the method (base case, inductive step, dominoes), with "Module 9 uses the method again". |
| 690 | Strategy, step 1: "Use powers for reciprocals and roots", but the power rule for fractional exponents is Module 6's (the page says so at line 636). | "Use negative powers for reciprocals". |
| 1114 | Ex 5.1(b): "the graph falls on each side of $x = 3$" from $y' < 0$ uses the sign test that Module 8 proves. | "every tangent line slopes downwards, and the graph falls … (Module 8 proves that a negative derivative on an interval means a falling graph)", as Module 4 does. |
| 262 | Example 5.4 used "a small step $\Delta r$ changes the pull by about $F'(r)\,\Delta r$" (linear approximation, Module 7) without saying why. | "Near $r$ the graph of $F$ is close to its tangent line (Module 4), so …", as Module 4's tangent-line estimates do. |

## Teaching

| Line | Issue | Done |
|---|---|---|
| 213 | Example 5.3: "the lowest point, since $y = 1 - \frac{2}{x^2+1} \ge -1$" skipped both steps (where the rewritten form comes from; why the fraction is at most 2). | Both written out; check with `function_range` added. |
| 1230 | Ex 5.5(a) stopped at $y^2 \le 2$ and did not show where $y^2 = 1 + 2\sin x\cos x$ comes from. | Squaring shown; concluded $-\sqrt2 \le y \le \sqrt2$, reached at the two points. |
| 289 | The text listed tangents at four points but five slopes ($1, 0, -1, 0, 1$), as in Figure 5.2. | Added the tangent at $2\pi$; check of $\cos$ at the five points added. |
| 163 | The three-factor product rule named a function $h$, the letter used for the step on every other line. | Renamed $k$ (the check block already used $k$). |
| 497–504 | New notation $f'\big(g(x)\big)$ was not read aloud; "Leibniz notation" here, "Leibniz's notation" in Module 4. | Read aloud ("f prime of g of x", the derivative of $f$ evaluated at $g(x)$); "Leibniz's notation" twice. |
| 519 | The gap in the idea of the proof was illustrated only by a constant $g$; a first reading was not told it may skip the proof. | Points to Exercise 5.11's $x^2\sin(1/x)$; "a first reading may skip it". |
| 118 | "The hypotheses make the rule work; they are not needed for the product to have a derivative" was hard to parse. | "The hypotheses are what the proof needs, not what a product needs in order to have a derivative." |
| 721, 845 | "you could not see this" (overstated); $\cos^2 x - \sin^2 x = \cos 2x$ used without a pointer. | "hides this"; "the addition formula with $y = x$". |
| 1416 | Ex 5.11(a) repeats Exercise 4.11(b) without saying so. | "This is Exercise 4.11(b) again", linked. |
| 48, 536, 636 | Results of earlier modules cited by module only. | Linked: Theorem 4.1, the limit laws and the two trigonometric limits of Module 2, Theorem 3.4, Example 4.5. |

## Check blocks

All 59 blocks were compared with the prose around them; every displayed derivation is checked line by
line with `steps`, and every rounded number with `rounds`. Added: the lowest point of Example 5.3
(`function_range`), $\cos$ at the five points of Figure 5.2, $\lvert u\rvert$ differentiable at 1, the
quotient $1/\sqrt h$ at 0, $1 + \cos x \ge 0$ for the widget caption's "positive wherever defined",
the bracket $2(1 - 3x) - 15x = 2 - 21x$ of Ex 5.6(a), the numerator of Ex 5.2(c) line by line, and the
quiz distractors' arithmetic (questions 2, 6 and 8).

## Rendering

- **Figure 5.2.** In the lower panel the cosine curve ran through the $y$-tick label "1" (the label had
  been moved left to clear the dot at $(0, 1)$, onto the curve). The cosine is now drawn from $x = 0$
  (`figs_05.py`); regenerated and checked. Figures 5.1, 5.3 and 5.4 were checked against the text
  (strips and corner, gear ratios, arrow directions and meshing, the 9- and 11-digit maxima).
- **Phone width.** At 360 px, 18 display formulas scrolled sideways inside their line (up to 45 px;
  Module 4 has none), and the $\sin(2h)/h$ table, set with `layout = columns`, was cut off. The
  formulas are now split at natural points (Ex 5.2(c) and Ex 5.6(a) restructured so that the
  arithmetic is in the sentence or on its own lines, checks updated), and the table uses rows. Now no
  display formula, inline formula or table is wider than its box at 360 px, and the page never widens.
  Code blocks with long comment lines scroll, as in other modules.
- Screenshots of the whole page at 1100 px (`out/shots/r05/`), the solutions opened, and the widget,
  figures and tables at 360 px: no KaTeX errors, no overlaps, no page errors.

## Widget

`derivative-grapher` does what its caption says. Swept over every slider position: $x^3 - 3x$ reads
"Flat" exactly at $\pm1$; $x\sin x$ exactly at 0; `sin(x)/(1 + cos(x))` reads "Rising" at all 1401
positions in $[-7, 7]$, including $\pm3.14$ next to the asymptotes; $\lvert x\rvert$ reports a corner at 0.
The test gained the caption's second step ($x\sin x$ flat at 0) and its comment's "Example 5.14" is now
5.13. The widget code is unchanged.

## Left as it is

- The quotient rule opens with a verbal argument rather than numbers; the pitfall after Example 5.4
  supplies the numbers, and the rule follows the product rule closely.
- The dashed line at $x = a$ in the widget can cross an $x$-axis tick label (`P.vline` in `_core.js`
  draws the full height; the labels' halo keeps them legible).

## Other modules and shared tools

- Every claim that Modules 1–4 make about Module 5 is true of the page (Module 1 lines 49, 587, 678
  and 783 as they now stand; Module 2 line 667; Module 4's notes on the Leibniz fraction, the product
  rule, negative powers, the chain rule for $(x + 1)^{2/3}$ and automatic differentiation). Module 17's
  account of Section 5.8 (dual numbers carry derivatives forwards, one input per run) is accurate.
- `module_09.md` line 225 introduces induction as new; Exercise 5.10 now explains it in two sentences
  and points to Module 9, which could mention the earlier use.
- At 360 px (out/site built from the sources of 22 November, about 17:00): Module 1 has 10 display
  formulas that scroll sideways (up to 86 px) and 2 value tables wider than their box; Module 2 has 2
  scrolling formulas (up to 28 px); Module 3 has 6 wide tables. They scroll inside their boxes, so the
  page does not widen; Modules 4, 5 and 6 have none.
- `tools/shot-parts.mjs` matches its search text against the page's text content, which contains
  KaTeX's duplicated MathML text, so a search string containing mathematics is never found; plain-text
  fragments work.
