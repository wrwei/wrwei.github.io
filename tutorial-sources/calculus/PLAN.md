# Calculus: plan

A complete course in calculus, from functions and limits to vector calculus: single-variable
differential and integral calculus, differential equations, sequences and series, and calculus in
several variables. English (a Chinese edition may follow), published at `docs/tutorials/calculus/`.
This file is the contract for writers and reviewers; the tools in `tools/` enforce what can be checked.

The site already teaches some calculus, and this series works with it:

- **Mathematical Foundations for Computer Science and AI** (`docs/tutorials/math/`) has four compact
  calculus modules (15–18: limits, derivatives, integration, multivariable derivatives) aimed at what
  computing and AI need. This series is the full course: it proves the main theorems, teaches every
  standard technique, and covers integration, series and vector calculus in depth. Module 1 points
  readers who need algebra practice to that series' **Optional algebra refresher**
  (`../math/module_00_EN.html`); Part V links to its linear algebra modules (9–14) where vectors and
  matrices appear, and Modules 8 and 18 to its optimisation modules (19–20).
- **AI: From Machine Learning to Large Language Models** (`docs/tutorials/ai/`) uses gradients and the
  chain rule; Modules 17 and 18 show where.

## 1. Readers and what "complete" means here

Readers remember school algebra (fractions, powers, equations, graphs of lines), perhaps rustily. They
have not studied calculus, or studied it long ago and want to understand it properly. Many are students
or practitioners of computing, engineering or science; some program a little in Python. They work alone.

1. **Picture, numbers, then precision.** Each idea starts from a picture or a table of numbers, then
   gets a precise definition, then a worked example. Proofs of the main theorems are in the text; the
   hardest are in "Going deeper" boxes that a first reading may skip.
2. **Every worked result is checked by computer algebra.** Every derivative, integral, limit, sum,
   solution, extremum and number in the worked examples and exercise solutions is verified with SymPy
   by `tools/calc.py` (section 7). A wrong sign cannot reach the page.
3. **Every program output is real.** The Python shown in "Compute it" boxes is run by `tools/calc.py`,
   and every output on the page is what it printed.
4. **Nothing hand-computed.** Tables of values are computed by the tool from the formula, to the digits
   shown. Figures are drawn by plotting the functions they show.
5. **Paper first, computer second.** Everything can be followed with pencil and paper. Python is an
   optional companion: the Compute it boxes show how to check answers and explore with SymPy, NumPy and
   matplotlib, and some topics (numerical methods) are naturally computational.
6. **New words are defined when they first appear**, in a definition box or in bold in the text, and
   collected in the glossary. New notation is read aloud the first time ("$f'(x)$ reads 'f prime of x'").
7. **Mistakes are part of learning.** Common errors are shown and corrected in `::: pitfall` boxes;
   the Common mistakes page collects them.
8. **Practice.** Every module has 10–12 exercises at three levels (★ check your understanding,
   ★★ apply, ★★★ stretch), each with a full worked solution, and an 8-question quiz.
9. **Plain voice.** Short sentences, "you", present tense, British spelling (optimisation, behaviour).

## 2. Tools for readers

- Paper, pencil, and a scientific calculator are enough.
- Optional: Python 3 with SymPy (symbolic mathematics), NumPy (numerical arrays) and matplotlib (plots),
  installed in Module 1. The pages state the versions their outputs came from (Python 3.11,
  SymPy 1.14, NumPy 2.4, matplotlib 3.11). Facts about installing them are checked against the official
  documentation and listed with their sources in `notes/FACTS.md`.
- The interactive widgets run in the browser; nothing to install.

## 3. The series

Five parts, twenty modules, about 75 hours of study. Each module takes 3 to 4½ hours with its
exercises. Section ids are fixed once published.

### Part I: Functions, limits and continuity

1. **Functions and change** — what calculus is about (rates of change and accumulation; the tangent
   and area problems; Newton and Leibniz; calculus in computing, science and engineering); functions,
   domain, range, graphs, piecewise functions; the catalogue of functions (linear, power, polynomial,
   rational, root, exponential, logarithmic, trigonometric in radians, the unit circle); new functions
   from old (transformations, composition, inverse functions); average rate of change and the
   difference quotient (a falling ball, average speeds over shrinking intervals); how the series works;
   setting up Python, SymPy, NumPy and matplotlib, and a first session. Widget: `function-explorer`.
2. **Limits** — the idea of a limit from tables and graphs; one-sided limits; limits that do not exist
   (jump, blow-up, oscillation); the limit laws and direct substitution; algebraic techniques (factor
   and cancel, rationalise, combine fractions); the squeeze theorem and $\lim_{\theta\to0}\sin\theta/\theta = 1$
   with its geometric proof; the precise ε–δ definition with worked proofs; limits and floating point
   (cancellation error). Widget: `limit-explorer`.
3. **Continuity and infinity** — continuity at a point; kinds of discontinuity; which functions are
   continuous and why; the Intermediate Value Theorem and the bisection method; the Extreme Value
   Theorem; infinite limits and vertical asymptotes; limits at infinity, horizontal and oblique
   asymptotes; growth rates (logarithms, powers, exponentials, factorials) and their link to algorithm
   analysis. Widget: `bisection`.

### Part II: Derivatives

4. **The derivative** — tangent lines and instantaneous velocity; the derivative at a point as a limit;
   the derivative as a function and reading the graph of $f'$ from $f$; notation; differentiability
   (corners, cusps, vertical tangents) and differentiable ⇒ continuous; the power rule for positive
   integers, constant multiples, sums; higher derivatives; numerical differentiation (forward and
   central differences, truncation and rounding error). Widget: `secant-tangent`.
5. **Rules of differentiation** — the product and quotient rules with proofs; derivatives of the
   trigonometric functions; the chain rule (rates multiply) with many examples; strategy for combining
   rules; derivatives with SymPy and why its answers can look different; automatic differentiation with
   dual numbers (how programs differentiate programs). Widget: `derivative-grapher`.
6. **Exponentials, logarithms and implicit differentiation** — exponential functions and the number
   $e$ (compound interest; the function that is its own derivative); derivatives of $e^x$ and $a^x$;
   derivatives of inverse functions, $\ln x$ and $\log_a x$; implicit differentiation; inverse
   trigonometric functions; logarithmic differentiation and the power rule for real exponents;
   hyperbolic functions; exponential growth and decay. Widget: `exp-slope`.
7. **Rates, approximation and L'Hôpital's rule** — related rates; linear approximation and
   differentials; propagation of measurement error; Newton's method (derivation, quadratic convergence,
   failures, how square roots are computed); L'Hôpital's rule and the other indeterminate forms
   ($0\cdot\infty$, $\infty-\infty$, $1^\infty$, $0^0$, $\infty^0$); comparing growth rates rigorously.
   Widget: `newton-method`.
8. **The shape of a graph and optimisation** — absolute and local extrema, critical numbers, the closed
   interval method; Rolle's theorem and the Mean Value Theorem with consequences; increasing and
   decreasing functions and the first derivative test; concavity, inflection points and the second
   derivative test; curve sketching; optimisation problems; gradient descent in one variable.
   Widget: `shape-explorer`.

### Part III: Integrals

9. **Area and the definite integral** — the area and distance problems; sigma notation and the sums
   of $i$, $i^2$, $i^3$; Riemann sums (left, right, midpoint) and exact limits of them; the definite
   integral, integrability, signed area; properties and bounds; integrals from geometry and symmetry;
   the average value of a function. Widget: `riemann-sums`.
10. **The Fundamental Theorem of Calculus** — antiderivatives, $+C$ and initial value problems; the
    area function; the Fundamental Theorem (both parts) with proofs; indefinite integrals and the net
    change theorem; the substitution rule for indefinite and definite integrals; integration with
    SymPy. Widget: `accumulation`.
11. **Techniques of integration** — integration by parts (including repeated and tabular parts and
    reduction formulas); trigonometric integrals; trigonometric substitution; partial fractions;
    a strategy for integration; integration by computer and functions with no elementary
    antiderivative; numerical integration (midpoint, trapezoidal and Simpson's rules, their errors).
    Widget: `riemann-sums` (its trapezoidal and Simpson modes).
12. **Applications of integration and improper integrals** — area between curves; volumes by slicing,
    discs and washers; cylindrical shells; arc length; work, centre of mass; improper integrals of
    both types, $p$-integrals and comparison; probability densities, expected value, the exponential and
    normal distributions.
13. **Differential equations** — what a differential equation and its solution are; models (growth,
    cooling, motion); direction fields and equilibria; Euler's method and its error; separable equations;
    exponential growth and decay, Newton's law of cooling; the logistic equation; first-order linear
    equations and integrating factors; second-order linear equations with constant coefficients
    (springs, damping); solving with SymPy and numerically. Widget: `slope-field`.

### Part IV: Sequences and series

14. **Sequences and series** — sequences and their limits, monotone convergence; series, partial
    sums, geometric and telescoping series; the harmonic series and the divergence test; the integral
    test and $p$-series with remainder estimates; comparison and limit comparison; alternating series
    and their error bound; absolute and conditional convergence, ratio and root tests; a strategy.
    Widget: `series-explorer`.
15. **Power series and Taylor series** — power series, radius and interval of convergence; functions as
    power series; differentiating and integrating series; Taylor and Maclaurin series of the standard
    functions, the binomial series; Taylor's theorem with the Lagrange remainder; applications
    (computing $e$, $\pi$ and $\ln 2$; limits; approximations in physics; how mathematics libraries
    evaluate functions); Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$. Widget: `taylor-explorer`.

### Part V: Several variables

16. **Curves and vectors** — parametric curves, their slopes and arc length; polar coordinates, polar
    curves and polar area; vectors in two and three dimensions; the dot product and projections; the
    cross product; lines and planes in space; vector functions, velocity, acceleration and arc length;
    projectile motion. Widget: `parametric-curve`.
17. **Partial derivatives and the gradient** — functions of several variables, surfaces and contour
    maps; limits and continuity (path dependence); partial derivatives, higher partials and Clairaut's
    theorem; tangent planes, linear approximation and differentiability; the chain rule with tree
    diagrams; directional derivatives and the gradient; gradient descent and backpropagation as the
    chain rule on a graph. Widget: `contour-gradient`.
18. **Optimisation in several variables** — critical points; the second derivative test with the
    Hessian, saddle points; absolute extrema on closed bounded regions; Lagrange multipliers with one
    and two constraints; least squares; gradient descent, step size and ill-conditioning.
    Widget: `lagrange`.
19. **Multiple integrals** — double integrals over rectangles and Fubini's theorem; general regions and
    reversing the order; polar coordinates and the Gaussian integral $\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt\pi$;
    area, mass, centre of mass, joint densities; triple integrals; cylindrical and spherical
    coordinates; change of variables and the Jacobian. Widget: `region-slicer`.
20. **Vector calculus** — vector fields; line integrals and work; conservative fields, potentials and
    the fundamental theorem for line integrals; Green's theorem; curl and divergence; parametric
    surfaces and surface integrals, flux; Stokes' theorem and the divergence theorem; the one pattern
    behind all the fundamental theorems; where to go next. Widget: `vector-field`.

### Reference pages

- **Formula sheet** (`formulas`): limits, derivatives, integrals, series, identities, vector calculus,
  and the SymPy commands used in the series. Every formula on it is checked.
- **Common mistakes** (`mistakes`): the errors learners make most, by topic: the mistake, why it is
  wrong, the fix, and the module that explains it.
- **Glossary** (`glossary`): every term, with a one-line definition and the module that introduces it.
- **Downloads**: all the series' Python code, one script per module, in one ZIP.

## 4. What a module page contains

Front matter, then the sections:

```
---
title: Limits
part: 1
lead: One or two sentences: what the reader will be able to do.
minutes: 210
needs: Module 1
goals:
  - Estimate a limit from a table of values and from a graph
---
```

Every module ends with **What you learned** (`{#summary}`), **Exercises** (`{#exercises}`) and
**Check yourself** (`{#quiz}`).

## 5. Markdown dialect

Sections are `## Title {#id}`; the build numbers them. `### Title {#id}` is allowed below them.

Text boxes (three colons; the build adds the label):

- `::: definition TITLE`, `::: theorem TITLE`, `::: example TITLE` — numbered per kind and module
  ("Definition 2.3", "Theorem 2.1", "Example 2.4").
- `::: proof` (optionally `::: proof of the product rule`) — a proof, ended with ∎ by the build.
- `::: keyidea`, `::: tip`, `::: pitfall`, `::: note`, `::: analogy` — callouts.
- `::: deeper TITLE` — "Going deeper": optional material (harder proofs, extensions).
- `::: compute TITLE` — "Compute it": Python with SymPy, NumPy or matplotlib.
- `::: trouble` — folded "If something went wrong" (software problems, Module 1 mostly).
- `:::: tabs` with `::: tab Windows` / `::: tab macOS` / `::: tab Linux`.
- `::: figure id=fig-NN-k` — a figure drawn by `src/figures/_gen/figs.py`; the content is the caption.
- `::: widget name=NAME` — an interactive widget; the content is the caption.
- `:::: exercise TITLE {#ex-N-k} ★★` containing the task and a `::: solution` box (shown folded).

Blocks:

- ` ```python ` — Python, run by `tools/calc.py`. The blocks of one `::: compute` box (or of one
  solution) run in order in one fresh session, as if typed into one script; different boxes do not share
  anything. ` ```python fails ` must raise an error (for the mistakes readers make); ` ```python norun `
  is shown and not run (templates only).
- ` ```output ` — straight after a python block: what it printed, filled in by `tools/calc.py --update`.
  After a `fails` block, the error line Python prints last (`ValueError: math domain error`).
- ` ```check ` — **not shown to readers**: SymPy code that verifies the results of the surrounding
  example or solution (section 7). Every `::: example` and every `::: solution` contains at least one,
  unless it computes nothing and is marked `nocheck` (`::: example nocheck Reading a graph`).
- ` ```valuetable ` — a table of values computed by `tools/calc.py` from formulas:

  ```
  x = 0.9, 0.99, 0.999, 1.001, 1.01, 1.1
  $\dfrac{x^2-1}{x-1}$ = (x**2 - 1)/(x - 1)
  digits = 6
  ```

  `tools/calc.py --update` writes the computed rows below a `---` line; never edit them by hand.
- ` ```terminal ` — shell commands (lines starting `$ `), not run; ` ```text ` for other verbatim text.
- ` ```quiz ` — `? question`, options `- [ ]` / `- [x]` (exactly one right), `> explanation`.
- Mathematics: `$...$` inline and `$$...$$` display (KaTeX, rendered at build time). Macros:
  `\R \N \Z \Q \C`, `\abs{x}`, `\norm{v}`, `\vb{v}` (bold vector), `\dd` (the d of a differential,
  as in `\dd x`; plain `dx` is also fine), `\sech`, `\csch`, `\arcsec`.

## 6. Figures and widgets

Figures are SVG files drawn with matplotlib by `src/figures/_gen/figs.py` from `figs_NN.py`, in one
house style (`figstyle.py`): the site's colours, axes through the origin where that helps, Computer
Modern for mathematics so that figures match the page's formulas. Every curve is plotted from its
formula. 3–5 figures per module.

Widgets are plain JavaScript in `src/widgets/`, built on `_core.js` (an expression parser for what
readers type, an SVG plotting component, numerical methods, sliders and buttons). Each has a scripted
test in `tools/widget-tests/`.

| Widget | Module | What the reader does |
|---|---|---|
| `function-explorer` | 1 | Pick a function; stretch and shift it with sliders; see the formula change with the graph |
| `limit-explorer` | 2 | Zoom in on a point; set ε and find a δ that keeps the graph inside the band |
| `bisection` | 3 | Step the bisection method on a function and interval; watch the bracket shrink |
| `secant-tangent` | 4 | Shrink $h$ and watch the secant slope approach the derivative |
| `derivative-grapher` | 5 | Type a function; see $f$ and $f'$ together; move a point and its tangent |
| `exp-slope` | 6 | Change the base $a$ of $a^x$ until the slope at 0 is 1: find $e$ |
| `newton-method` | 7 | Step Newton's method from a starting point; see each tangent and the digits gained |
| `shape-explorer` | 8 | See where $f$ rises, falls and bends, with $f'$ and $f''$ sign charts |
| `riemann-sums` | 9, 11 | Left, right, midpoint, trapezoid and Simpson sums; change $n$; see the error |
| `accumulation` | 10 | Drag $x$ and watch the area function $A(x)$ and its slope $f(x)$ |
| `slope-field` | 13 | A direction field; click to start a solution; step Euler's method |
| `series-explorer` | 14 | Partial sums of a series and its terms; converge or diverge |
| `taylor-explorer` | 15 | Taylor polynomials of growing degree about a chosen centre |
| `parametric-curve` | 16 | Trace a parametric or polar curve with its velocity vector |
| `contour-gradient` | 17 | A contour map; click a point to see the gradient and a directional derivative |
| `lagrange` | 18 | Move along a constraint and see where a level curve touches it |
| `region-slicer` | 19 | Slice a region both ways and read off the limits of the iterated integral |
| `vector-field` | 20 | A field and a circle you can drag; compare circulation and flux with Green's theorem |

## 7. How results stay true: `tools/calc.py`

1. Collects, per page, the python, output, check and valuetable blocks, with their line numbers and the
   boxes that contain them.
2. Runs each compute box's python blocks in one fresh Python process, captures what each block
   prints, and compares it with the output block after it (`--update` writes it). A `fails` block must
   raise; its output is the error line.
3. Runs the page's check blocks in page order in one namespace that starts with `from sympy import *`
   and the helpers `same`, `same_set`, `antideriv`, `rounds`, `near`, `holds`, `steps`
   (`notes/AUTHORING.md` documents them). Any failed check, error or check block that checks nothing
   is reported with its line.
4. Computes every value table with 30-digit arithmetic and compares it with the page (`--update`
   writes it).
5. Reports every example and solution without a check block (unless marked `nocheck`).
6. On a full run, writes the downloadable code: one script per module (`module_NN.py`, its compute
   boxes as `# %%` cells in page order, `fails` blocks left out) and `calculus-code.zip`.

## 8. Publishing

`node tools/build.mjs --lang en --out ../../docs/tutorials/calculus`, a card on
`docs/tutorials/index.md`, then `mkdocs build` from the repository root must pass. Pushing to `main`
publishes the site.
