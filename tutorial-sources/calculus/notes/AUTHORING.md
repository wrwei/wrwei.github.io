# Writing a module: the brief

Read this whole file, `PLAN.md` and `notes/FACTS.md` before you write; once Module 1 exists
(`src/en/module_01.md`), read it too: it is the reference for voice, structure, density and the use of
every element of the dialect. Your module must read as if the same person wrote the whole series.

Paths below are relative to `tutorial-sources/calculus/`. Every command assumes

```terminal
$ cd /home/user/wrwei.github.io/tutorial-sources/calculus
$ export CALC_PYTHON=/tmp/claude-0/-home-user-wrwei-github-io/7b6368c3-ecc9-5d53-a462-2dab7e36d355/scratchpad/calcvenv/bin/python
```

(`$CALC_PYTHON` has SymPy, mpmath, NumPy and matplotlib; plain `python3` has not.)

## 1. What you produce

| File | What |
|---|---|
| `src/en/module_NN.md` | The module page |
| `src/figures/_gen/figs_NN.py` | Your module's figures (section 8) |
| `src/widgets/NAME.js`, `tools/widget-tests/NAME.mjs` | Your module's widget and its test, if PLAN.md section 6 gives your module one (section 9) |

Do not edit anything else: not the tools, not `src/assets/`, not `src/widgets/_core.js`, not
`figstyle.py`, not other modules, not PLAN.md. If a shared file has a bug or lacks something you need,
say so in your final report. Do not run git commands that change anything (no add, commit, stash,
checkout, reset); the coordinator commits. Other authors work in the same folder at the same time:
touch only your own files.

## 2. Readers and voice

From PLAN.md section 1: readers remember school algebra, perhaps rustily; they have not studied
calculus or did long ago; many work in computing, engineering or science; they work alone. So:

- **Picture, numbers, then precision.** Start each idea from a picture or a table of numbers, then give
  the precise definition, then a worked example. Then the common mistakes (`::: pitfall`).
- Define every new term where it first appears, in a `::: definition` box or in **bold** in the text.
- Read new notation aloud the first time: "$\lim_{x\to a} f(x) = L$ reads 'the limit of f of x as x
  approaches a is L'".
- Show every step a learner needs; when you skip algebra, say what you did ("expand and collect").
  Justify each step of a derivation in words, before it or beside it (`\text{(product rule)}`).
- State theorems precisely, with all their hypotheses, and say why each hypothesis is needed (a
  counterexample when one is short).
- Prove the main theorems. Put long or hard proofs in `::: deeper` boxes, and say that a first reading
  may skip them. Never pretend an argument is a proof when it is only a plausibility argument; call it
  "the idea of the proof" instead.
- Short sentences, "you", present tense, British spelling (optimisation, behaviour, modelling, centre,
  metre). No filler: avoid "simply", "just", "obviously", "clearly", "of course", "trivially",
  "it is easy", and exclamation marks. No emoji.
- Use real situations from computing, engineering, science and everyday life (a car's speedometer and
  odometer, a cooling cup of tea, compound interest, a falling ball, gradient descent, a GPU's power
  draw, signal processing) once the abstract idea has been shown. Avoid invented numbers dressed up as
  data: keep made-up quantities plainly hypothetical ("suppose a tank holds 100 litres").

## 3. Size and structure

- Study time 180–270 minutes with exercises (front matter `minutes`). Aim for 7,000–10,000 words in
  total, exercises and solutions included. Depth beats breadth: cover the PLAN.md topics for your
  module properly; if something must be cut, cut breadth, and say so in your report.
- Front matter: `title` (short, e.g. "Limits"), `part` (1–5), `lead` (one or two sentences: what the
  reader will be able to do), `minutes`, `needs` (e.g. "Modules 1 and 2"), `goals` (4–6 items, each
  starting with a verb).
- 6–9 numbered sections `## Title {#id}` before the last three, with `### Title {#id}` subsections where
  useful. Ids are short, lowercase, hyphenated, unique in the page, and must not change later.
- The page ends with exactly these three sections, in this order: `## What you learned {#summary}`
  (bullets), `## Exercises {#exercises}`, `## Check yourself {#quiz}`.
- 10–12 exercises: at least two at each level, typically 3–4 ★ (check understanding), 4–5 ★★
  (apply), 2–3 ★★★ (stretch: a proof, a harder problem, or an application). Every exercise has a full
  worked solution, as careful as a worked example.
- A quiz of exactly 8 questions; vary the position of the right answer; every explanation says why.
- 3–5 figures, and the widget PLAN.md gives your module (if any).
- 2–4 `::: compute` boxes: where computing helps (checking an answer with SymPy, a numerical method,
  a table that would be tedious by hand). Python is optional for readers: the text must make complete
  sense without the compute boxes.
- Refer to boxes and figures by number ("Definition 2.3", "Theorem 2.1", "Example 2.4", "Figure 2.1"):
  the build numbers them in page order per kind (definition, theorem and example count separately;
  figures count separately). Refer to sections as "Section 2.4" (the build numbers `##` sections 1, 2,
  3, … in order, the last three included). Count carefully, or refer by name.
- Refer to other modules as "Module 3". Links to other pages of the series are `module_03_EN.html`
  (with `#id` for a section); links to the Mathematical Foundations series are
  `../math/module_00_EN.html`. `tools/check.mjs` checks every link and anchor.

## 4. The dialect (tools/md.mjs is the renderer)

- Numbered boxes: `::: definition TITLE`, `::: theorem TITLE`, `::: example TITLE`.
- `::: proof` or `::: proof of the chain rule` — straight after the theorem it proves; the build adds ∎.
- Callouts: `::: keyidea`, `::: tip`, `::: pitfall` (common mistakes), `::: note`, `::: analogy`.
- `::: deeper TITLE` — "Going deeper": optional material. `::: compute TITLE` — "Compute it".
- `::: trouble` — folded "If something went wrong" (software problems; Module 1 mostly).
- Exercises: `:::: exercise TITLE {#ex-N-k} ★★` (four colons; N = module number without a leading zero,
  k = 1, 2, … in order) containing the task and a `::: solution` box.
- `:::: tabs` with `::: tab Windows` / `::: tab macOS` / `::: tab Linux` (Module 1 mostly).
- Figures: `::: figure id=fig-NN-k` (k = 1, 2, … in page order); the content is the caption, which
  says what to look at. Widgets: `::: widget name=NAME`; the content tells the reader what to try.
- Mathematics: `$...$` inline and `$$...$$` display (KaTeX). For derivations use
  `$$\begin{aligned} … &= … \\ &= … \end{aligned}$$`. Macros: `\R \N \Z \Q \C`, `\abs{x}`, `\norm{v}`,
  `\vb{v}` (bold vector), `\dd`, `\sech`, `\csch`, `\arcsec`. Keep inline formulas short; a formula
  wider than a phone screen belongs on its own line.
- ` ```valuetable ` — a table of values computed by `tools/calc.py` (section 6.3).
- ` ```python `, ` ```output ` — Python in compute boxes (section 6.2). ` ```check ` — hidden checks
  (section 6.1).
- ` ```terminal ` for shell commands (lines starting `$ ` or `PS> `), ` ```text ` for other verbatim text.
- ` ```quiz `: `? question`, options `- [ ]` / `- [x]` (exactly one right answer), `> explanation`.
  Inline code and `$…$` work in options.
- Tables are fine; keep them to 3–5 columns so they fit a phone.

### Notation (the same in every module)

- Derivatives: $f'(x)$, $f''(x)$, $f^{(n)}(x)$; Leibniz $\dfrac{dy}{dx}$, $\dfrac{d}{dx}\big(x^2\big)$,
  $\dfrac{d^2y}{dx^2}$. Partial derivatives $\dfrac{\partial f}{\partial x}$ and $f_x$.
- Integrals with a thin space: `\int_a^b f(x)\,dx`.
- $\ln x$ is the natural logarithm; write $\log_{10}$, $\log_2$ with their base. (In Python, `math.log`
  and SymPy's `log` are $\ln$: a pitfall worth one sentence where it matters.)
- Angles are in radians unless a page says otherwise. Inverse trigonometric functions: $\arcsin x$,
  $\arccos x$, $\arctan x$ (mention the notation $\sin^{-1}x$ once, in Module 6, with its pitfall).
- Euler's number $e$; $\exp(x)$ only where $e^{\,\cdots}$ would be unreadable.
- Intervals $[a, b]$, $(a, b)$, $[a, \infty)$; the real numbers $\R$.
- Vectors in bold, $\vb{v} = \langle v_1, v_2, v_3\rangle$, unit vectors $\vb{i}, \vb{j}, \vb{k}$,
  length $\norm{\vb{v}}$, gradient $\nabla f$.
- Sequences $(a_n)$; sums $\sum_{n=1}^{\infty} a_n$.
- Rounded numbers with $\approx$ and as many digits as are useful; every rounded number on the page is
  checked with `rounds()` (section 6.1).

## 5. Mathematics must be right

Every statement of mathematics is correct and stated with its conditions (domains, $x \ne 0$,
"for $x > 0$", "if $f$ is continuous on $[a, b]$"). Where textbooks disagree on a convention
(e.g. whether $0$ is a natural number, the range of $\arcsec$), say which one the series uses. History:
only well-established facts (`notes/FACTS.md` has the ones the series uses); leave out numbers and
dates you cannot vouch for. Do not invent applications' numbers and present them as real data.

## 6. How results stay true: tools/calc.py

### 6.1 Check blocks

Every `::: example` and every `::: solution` contains at least one ` ```check ` block: SymPy code, not
shown to readers, that verifies **what the page says**. Readers see a "Checked" badge on the box. An
example that computes nothing (reading a graph, a definition in action) is marked
`::: example nocheck TITLE`; use this sparingly. Check blocks may also follow a quiz or stand after any
displayed result you want verified; all check blocks of a page run in page order in one namespace, so a
later block can use names an earlier one defined.

The namespace starts with `from sympy import *` (plus `function_range`, `continuous_domain`, `periodicity`,
`minimum` and `maximum` from `sympy.calculus.util`), the symbols `x y z t u v w r s h k m n a b c theta`
(no assumptions: declare your own, e.g. `x = symbols('x', positive=True)`, when a result needs
them), and these helpers (`tools/calccheck.py`):

| Helper | Checks that |
|---|---|
| `same(a, b)` | a and b are equal: numbers, expressions, matrices, sets, lists/tuples |
| `same_set(a, b)` | the same elements in any order (solutions of an equation, critical points) |
| `antideriv(F, f, x)` | F is an antiderivative of f: $F' = f$ (for indefinite integrals, "$+C$") |
| `rounds(value, '2.718')` | value, rounded to the decimals shown, is exactly the text shown |
| `near(a, b, tol=1e-9)` | $\abs{a-b} \le$ tol (results of numerical methods) |
| `holds(condition)` | a true statement: `holds(f(2) > 0)`, `holds(Rational(1, 3) < 0.34)` |
| `steps(e1, e2, e3, ...)` | every step of a chain of equalities $e_1 = e_2 = e_3 = \dots$ is right |
| `limit_is(f, x, a, L, dir='+-')` | the limit of $f$ as $x \to a$ (from `'+'`, `'-'` or both) is $L$ |

What to check: the final answer of every example and solution, **and every intermediate result shown
in a derivation that could hide a slip** (the derivative after the product rule, the antiderivative
before the limits are applied, the critical points, the value of each Riemann sum in a table). Check
derivations with `steps(...)`, writing each displayed line as a SymPy expression (use
`Derivative(...)`, `Integral(...)` and `Limit(...)` unevaluated where a line shows them, then `.doit()`
where the page evaluates them). Every number shown with $\approx$ gets a `rounds`. Quiz answers that
are computations get a check block after the quiz.

```check
f = x**2*sin(x)
fp = diff(f, x)
same(fp, 2*x*sin(x) + x**2*cos(x))                          # the derivative shown
steps(Integral(x*exp(x), x), x*exp(x) - Integral(exp(x), x), x*exp(x) - exp(x))
antideriv(x*exp(x) - exp(x), x*exp(x), x)                   # the antiderivative shown ("+ C")
area = integrate(x**2, (x, 0, 2))
same(area, Rational(8, 3)); rounds(area, '2.667')
limit_is(sin(x)/x, x, 0, 1)
same_set(solve(3*x**2 - 12*x + 9, x), [1, 3])               # the critical numbers
same(summation(1/2**n, (n, 1, oo)), 1)
same(series(exp(x), x, 0, 4).removeO(), 1 + x + x**2/2 + x**3/6)
xs = [1.0]
for _ in range(4):
    xs.append(xs[-1] - (xs[-1]**2 - 2)/(2*xs[-1]))          # four steps of Newton's method for sqrt(2)
rounds(xs[3], '1.41421569'); rounds(xs[4], '1.41421356')    # as the page's table shows them
```

A check must check what the page states, exactly: the reviewer compares every check block with the
prose around it. Keep each block fast (well under two seconds); avoid `simplify` on large expressions
when `expand` or `same` will do. Never weaken a check to make it pass: if a check fails, the page is
wrong (or the check), find out which.

SymPy pitfalls met so far: `limit(f, x, a)` is the limit **from the right** (SymPy's default direction is
`'+'`); a two-sided limit needs `limit(f, x, a, '+-')` (`limit_is` is two-sided by default). SymPy's
`limit` can get one-sided limits of `Piecewise` functions wrong, and `summation` returns `nan` for some
convergent series (e.g. the sum of 1/(2n² − n)): check such results another way (partial fractions, a
known series, high-precision partial sums with `near`); `steps(Derivative(Integral(...), x), ...)` fails
when the integrand has no elementary antiderivative, while `diff(Integral(...), x)` works. The scratchpad
folder is shared by all authors: keep your scratch files in a subfolder named after your module.

### 6.2 Compute boxes (Python)

A `::: compute TITLE` box holds prose and ` ```python ` blocks, each followed by an ` ```output ` block
(leave it empty; the tool fills it). The blocks of one box run in order as one script, in a fresh
process; different boxes share nothing, so each box starts with its imports. Conventions:

```python
import sympy as sp
x = sp.symbols('x')
f = x**3 - 2*x
print(sp.diff(f, x))
```

- `import sympy as sp`, `import numpy as np`, `import math`; print with clear labels, e.g.
  `print(f"midpoint sum, n = {n}: {s:.6f}")`. Blocks of at most about 15 lines.
- Output must be deterministic (no timings, no randomness without a fixed seed, no addresses).
  No warnings: the tool reports anything written to stderr.
- Plots: a compute box may plot with matplotlib (end with `plt.show()`; readers see a window) but the
  page cannot show that window; say what the reader will see and give the same picture as a figure
  (section 8). Prefer printed results.
- ` ```python fails ` shows a mistake readers make, with the error Python raises (the tool fills the
  output with the error's last line, e.g. `NameError: name 'x' is not defined`).
- In a solution, python blocks are allowed too (they run as one script per solution).
- Read the real output after every run and make the prose agree with it (SymPy may order terms or
  write a result differently from you: explain that, it is a lesson in itself).

### 6.3 Value tables

```valuetable
x = 0.9, 0.99, 0.999, 1.001, 1.01, 1.1
$\dfrac{x^2-1}{x-1}$ = (x**2 - 1)/(x - 1)
digits = 6
```

The first line names the variable and its values (decimals, integers or SymPy expressions such as
`pi/6`); each further line is a column, `$LATEX HEADER$ = SYMPY EXPRESSION`; options: `digits = N`
(significant digits, default 6), `decimals = N` (fixed decimals instead), `layout = columns`
(values across, for short wide tables), `sci = no` (never scientific notation: by default a value below
10⁻⁴ or from 10⁶ up is written as $a\times10^{k}$, which can mix formats within a column). Values are computed exactly from the decimal inputs, with 40
digits, then rounded; a short exact value (1.9) is shown exactly. A value where the expression is
undefined shows "undefined". `--update` writes the rows under a `---` line; never edit them.

### 6.4 The workflow

```terminal
$ $CALC_PYTHON -I tools/calc.py --module NN --update
$ $CALC_PYTHON -I tools/calc.py --module NN
```

The first run fills outputs and tables and reports every failed check, error, missing check block and
output problem with its line; fix and repeat. The last run, without `--update`, must end with
`all outputs match` and report no problems.

## 7. Exercises and solutions

Solutions are full worked solutions: every step a reader needs, the reasoning in words, the answer
clearly stated, units where there are units, and a check block. For a ★★★ proof, a complete proof.
When an exercise has a common wrong answer, the solution says why it is wrong.

## 8. Figures

Draw figures with matplotlib in `src/figures/_gen/figs_NN.py`, with the helpers of `figstyle.py`
(read its docstring and code):

```python
"""Figures of Module NN."""
import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, figure3d, math_axes, plot_fn,
                        #  plot_param, dot, label, shade, riemann, tangent, guide, arrow, panel_title, C, CURVES)


def fig_NN_1(L):
    """One-line description of the figure (its accessible title)."""
    fig, ax = figure(7.6, 3.8)
    math_axes(ax, (-1, 3), (-1, 5))
    plot_fn(ax, lambda x: x**2, -1, 2.2)
    label(ax, 1.6, 3.6, r'$y = x^2$', color=C['blue'])
    return fig


FIGURES = {'fig-NN-1': fig_NN_1}
```

```terminal
$ $CALC_PYTHON -I src/figures/_gen/figs.py NN --png
```

writes `src/figures/en/fig-NN-k.svg` and a preview `out/figs/fig-NN-k.png`: look at every preview
(with your image-reading tool). Rules: width 6–7.6 inches, height 3–4.5 (several panels with
`figure_grid`); colours from `C` only (`CURVES` for several curves); label curves directly rather
than with a legend where you can; text no smaller than 10 pt; mathematics in `r'$...$'`; nothing
overlapping or clipped; every curve plotted from its formula (never hand-placed points that should
lie on a curve). Use figures where a picture explains better than words: the meaning of a limit, a
secant becoming a tangent, Riemann rectangles, a solid of revolution, a contour map with gradients.
Part V figures may use `figure3d` (keep meshes modest: 40 × 40 at most).

## 9. Widgets

Read `src/widgets/_core.js` (its header documents the API) and `src/widgets/function-explorer.js`
(the reference widget) and its test `tools/widget-tests/function-explorer.mjs`. A widget is plain
JavaScript (no libraries, no modules):

```js
CalcWidgets.register('NAME', function (root, api) {
  // api.t(en, zh), api.h, api.css, api.Expr.parse(src, vars), api.plot(parent, {view, aspect, draw}),
  // api.num (deriv, integrate, riemann, simpson, bisect, newton, euler, rk4, grad, fmt),
  // api.slider, api.select, api.button, api.field, api.readout, api.row
})
```

Requirements: it teaches the one idea PLAN.md names, with the fewest controls that do it; every
visible string through `api.t` (give the Chinese too: plain, accurate Simplified Chinese); works at
360 px wide; usable with the keyboard (sliders, buttons and fields, not only dragging); never throws on
bad input (show a message: `api.Expr.parse` returns `{ ok: false, error }`); no network access. Every
number it shows is right: compute it, do not approximate what can be exact, and say "≈" where it is
approximate.

Test it in `tools/widget-tests/NAME.mjs` (`export const page = 'module_NN'`): 6–15 checks that drive the
main interactions (`t.set`, `t.select`, `t.click`, `t.type`, `t.clickAt`, `t.drag`) and check real
results (`t.text`, `t.attr`, `t.count`), not only that the widget appears. Then

```terminal
$ node tools/build.mjs && node tools/widget-test.mjs --only NAME
```

and look at the screenshot `out/shots/widget-NAME-en.png`; also look at the widget at 360 px
(`node tools/shot.mjs out/site/module_NN_EN.html --out out/shots/mNN-phone --width 360 --pages 60` and
find it).

## 10. Before you finish

1. `$CALC_PYTHON -I tools/calc.py --module NN` ends with `all outputs match` and no problems.
2. `node tools/check.mjs --lang en`: no errors and no warnings for your page (links to modules that do
   not exist yet are reported; list them in your report).
3. `node tools/build.mjs` builds your page without problems about it.
4. `node tools/shot.mjs out/site/module_NN_EN.html --out out/shots/mNN --pages 60 --width 1100`, then look
   at the screenshots (combine several with ImageMagick: `montage a.png b.png c.png -tile 3x1 -geometry
   700x+6+0 sheet.png`): boxes, mathematics, tables, figures, outputs, exercises and quiz must render
   correctly, with no KaTeX errors (red) and nothing cut off.
5. Figures and widget checked as in sections 8 and 9.
6. Re-read the page once as the reader would, start to finish, with pencil-and-paper eyes: is every
   step there? Fix anything unclear.

Final report (your last message, under 300 words): the sections; counts (words, examples, check
blocks and checks, python blocks, value tables, exercises, figures); the widget and its test result;
what you assume earlier modules taught and what you leave to later modules; links to pages that do
not exist yet; any problem with the shared tools.

## 11. What each module introduces

So that modules neither repeat each other nor use what has not been taught. A module may use anything
from earlier rows (briefly recalled, with a link, when the reader may have forgotten it), and should
introduce the items in its own row.

| Module | Introduces |
|---|---|
| 1 | functions, domain and range, interval notation, graphs, piecewise functions; linear, power, polynomial, rational, root, exponential ($e$ introduced as a number, $e \approx 2.71828$), logarithmic ($\ln$ as the inverse of $e^x$), trigonometric functions in radians, the unit circle; transformations, composition, inverse functions; average rate of change, secant lines, the difference quotient; Python setup; SymPy `symbols`, `subs`, `expand`, `factor`, `simplify`, `N`, `lambdify`; NumPy arrays and matplotlib plotting in outline |
| 2 | limits, one-sided limits, limit laws, direct substitution, the form $0/0$, algebraic techniques, the squeeze theorem, $\lim \sin\theta/\theta = 1$, $\lim (1-\cos\theta)/\theta = 0$, the ε–δ definition; floating-point cancellation; SymPy `limit` |
| 3 | continuity, kinds of discontinuity, the Intermediate Value Theorem, bisection, the Extreme Value Theorem (statement), infinite limits, limits at infinity, vertical, horizontal and oblique asymptotes, orders of growth and big-O |
| 4 | the derivative at a point and as a function, $f'$, $dy/dx$, $d/dx$, higher derivatives, differentiability and continuity, tangent lines, the power rule for positive integers (proved), constant multiple and sum rules, velocity and acceleration, numerical differentiation; SymPy `diff` |
| 5 | product, quotient and chain rules (proved), derivatives of the six trigonometric functions, the power rule for negative integers; strategy; automatic differentiation with dual numbers |
| 6 | $e$ via compound interest and via slope 1, $(e^x)' = e^x$, $\ln$ and $\log_a$ and their derivatives, $a^x$, derivatives of inverse functions, implicit differentiation, inverse trigonometric functions and their derivatives, logarithmic differentiation, the power rule for real exponents, hyperbolic functions, exponential growth and decay (solutions of $y' = ky$ verified, not yet derived) |
| 7 | related rates, linearisation and differentials, error propagation, Newton's method, L'Hôpital's rule (proved in the simple form $f(a)=g(a)=0$, $g'(a) \ne 0$ from the definition of the derivative; the general proof is in Module 8), the indeterminate forms $0\cdot\infty$, $\infty-\infty$, $1^\infty$, $0^0$, $\infty^0$, growth rates via L'Hôpital |
| 8 | absolute and local extrema, critical numbers, Fermat's theorem, the closed interval method, Rolle's theorem and the Mean Value Theorem (proved), Cauchy's mean value theorem and the general L'Hôpital proof (Going deeper), increasing/decreasing and first derivative test, concavity, inflection points, second derivative test, curve sketching, optimisation problems, gradient descent in one variable |
| 9 | sigma notation, $\sum i$, $\sum i^2$, $\sum i^3$, Riemann sums (left, right, midpoint), the definite integral, integrability, signed area, properties and bounds, symmetry, average value, the Mean Value Theorem for integrals |
| 10 | antiderivatives, indefinite integrals and $+C$, initial value problems, the area function, the Fundamental Theorem of Calculus (both parts, proved), the net change theorem, substitution (indefinite and definite); SymPy `integrate` |
| 11 | integration by parts (repeated, tabular, reduction formulas), trigonometric integrals, trigonometric substitution, partial fractions, strategy, integration by computer, functions with no elementary antiderivative (erf, Si), numerical integration: midpoint, trapezoidal and Simpson's rules with error bounds |
| 12 | area between curves, volumes by discs, washers and shells, arc length, work, centre of mass, improper integrals of both types, $p$-integrals, comparison tests for integrals, probability density functions, expected value, the exponential and normal distributions ($\int e^{-x^2}dx = \sqrt\pi$ quoted; proved in Module 19) |
| 13 | differential equations, order, solutions and initial value problems, direction fields, equilibria, Euler's method and its error, separable equations, growth and decay, Newton's law of cooling, the logistic equation, first-order linear equations and integrating factors, second-order linear homogeneous equations with constant coefficients (complex roots give $e^{at}(\cos bt, \sin bt)$, checked by substitution; Euler's formula explains it in Module 15); SymPy `dsolve`; RK4 mentioned |
| 14 | sequences and their limits, monotone convergence, series and partial sums, geometric, telescoping and harmonic series, the divergence test, the integral test and remainder estimates, $p$-series, comparison and limit comparison, alternating series and their error bound, absolute and conditional convergence, ratio and root tests, strategy |
| 15 | power series, radius and interval of convergence, term-by-term differentiation and integration, Taylor and Maclaurin series, Taylor's theorem with the Lagrange remainder, the binomial series, applications, Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$; SymPy `series` |
| 16 | parametric curves, their slopes and arc length, polar coordinates, polar curves and area, vectors in 2D and 3D, dot and cross products, projections, lines and planes, vector functions, velocity, acceleration, arc length of space curves, projectile motion |
| 17 | functions of several variables, graphs, level curves and surfaces, limits and continuity in two variables, partial derivatives, Clairaut's theorem, tangent planes and linear approximation, differentiability, the multivariable chain rule, directional derivatives and the gradient, gradient descent, backpropagation as the chain rule |
| 18 | critical points of $f(x, y)$, the Hessian and the second derivative test, saddle points, absolute extrema on closed bounded regions, Lagrange multipliers (one and two constraints), least squares, gradient descent: step size and ill-conditioning |
| 19 | double integrals, Fubini's theorem, type I and II regions, reversing the order, polar coordinates ($dA = r\,dr\,d\theta$), the Gaussian integral (proved), mass, centre of mass, joint densities, triple integrals, cylindrical and spherical coordinates, change of variables and the Jacobian |
| 20 | vector fields, line integrals (scalar and vector), work, conservative fields and potentials, the fundamental theorem for line integrals, Green's theorem, curl and divergence, parametric surfaces, surface area and surface integrals, flux, Stokes' theorem, the divergence theorem, the unified view |
