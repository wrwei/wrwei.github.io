# Mathematical Foundations for Computer Science and AI Series Plan

This series develops the mathematics needed to reason about programs, analyse algorithms, represent data, understand learning objectives, and evaluate AI systems. It connects definitions and proofs to calculations and small runnable experiments. A learner should finish able to explain why a method works, state its assumptions, recognise when those assumptions fail, and implement a small example correctly.

**Planning date:** 4 October 2026. **Current status:** All 32 modules, the optional algebra refresher, entry diagnostic, Python primer, and NumPy preparation are implemented in English and Simplified Chinese. Each taught module 01–30 includes three executed labs, four original bilingual figures, an interactive demonstration, fourteen exercises with solutions, and ten quiz questions. Both capstones provide three executed reference scripts, four original figures, proof obligations, actual plots/outputs, a saved defence and assessment rubric. **Destination:** `docs/tutorials/math/`. This English plan remains the authoring specification for the complete curriculum.

The proposed curriculum has **32 modules and an optional algebra refresher**. Modules 01–30 develop the foundations; Modules 31–32 are assessed CS and AI capstones. The full route is **328 study hours**, or **334 hours with the refresher**, including required reading, labs, exercises, quizzes, and capstones. Optional extensions are additional. These are planning estimates to be revised after a learner completes each pilot module.

## Audience and entry requirements

The primary audience is CS students, engineers entering AI, and independent learners who can use school algebra but need a connected university-level foundation. No previous university mathematics or machine learning is assumed. Basic arithmetic, fractions, rearranging a simple equation, and reading a coordinate plot are the minimum mathematical starting point. Module 00 supplies a refresher when needed.

Programming is a separate entry skill. The theory can be studied with pencil and paper; the labs require Python variables, lists, loops, functions, and running a script. Include a short Python lab primer before Module 01, and refer learners needing a full introduction to the existing CS series. NumPy array notation is taught before Module 09; unfamiliar programming syntax must not become an unstated mathematical prerequisite.

The default delivery is self-study in British English and Simplified Chinese. Both editions must contain the same definitions, examples, equations, lab outputs, exercise numbering, and assessment criteria. A learner may switch languages without restarting progress. The plan itself is initially written in English, with bilingual module titles and a starter terminology table.

### Entry diagnostic

Provide twelve ungraded questions, one task per row below. Each has a worked solution and a link to the relevant refresher section. This diagnostic guides study; it does not block access.

| Task | Expected evidence | Remediation |
|---|---|---|
| Compute `3/4 − 2/3` | Common denominator and answer `1/12` | Module 00 fractions |
| Evaluate `−3²` and `(−3)²` | Distinguish `−9` from `9` | Module 00 order of operations |
| Solve `3x + 5 = 17` | Reversible steps giving `x = 4` | Module 00 equations |
| Expand `(x + 2)(x − 3)` | `x² − x − 6` | Module 00 polynomials |
| Solve `2^x = 8` | `x = 3`; explain an inverse operation | Module 00 exponents |
| Explain the domain of `1/(x − 2)` | Exclude `x = 2` | Module 01 functions |
| Read `Σᵢ₌₁⁴ i` | Expand to `1 + 2 + 3 + 4 = 10` | Module 01 notation |
| Negate “every item is valid” | “At least one item is invalid” | Module 02 quantifiers |
| Explain `f(a + b) = f(a) + f(b)` | Identify a claim that is false for many functions | Module 01 functions |
| Read a three-line Python loop | Predict its printed values | Python primer |
| Write a function returning a square | Correct input, output, and function call | Python primer |
| Run a provided script | Find its output and describe one error message | Lab setup guide |

Recommend Module 00 when any of the first five tasks cannot be explained, even if a calculator produces the answer. Advanced learners may skip a module after completing its entry task and exit assessment, while retaining all prerequisites for later modules.

## Learning design

### Mathematical depth

Use three levels explicitly throughout the lessons:

1. **Core:** definitions, assumptions, derivations, and computations required by a subsequent module. Every learner on that route completes these.
2. **Proof focus:** substantial arguments such as induction, correctness, rank–nullity, least-squares orthogonality, and selected convergence results. Give complete proofs for the chosen statements; label results whose proofs are deferred.
3. **Extension:** additional theory such as measure-theoretic probability, advanced functional analysis, generalisation bounds beyond the introductory cases, and specialised optimisation. Extensions must never be hidden prerequisites.

The aim is mathematical fluency for CS and AI. Full real analysis, abstract algebra, cryptography, causal inference, and graduate statistical learning theory remain follow-on subjects. The core still includes enough explanation of conditions to prevent formulas becoming recipes.

### Standard module contract

Each taught module should contain the following deliverables. Capstones use their project briefs instead of three small labs.

| Component | Required detail |
|---|---|
| Opening problem | A concrete CS or AI question that motivates the mathematics |
| Prerequisites | Module numbers, assumed skills, and a short retrieval check with remediation links |
| Learning outcomes | Four to six observable actions: derive, prove, compute, diagnose, implement, or interpret |
| Study plan | Four sessions whose activities add up to the published hours |
| Concept lessons | Six main sections, each with notation, assumptions, an example, and an inline check |
| Worked examples | At least six, including a small hand calculation, an application, and a failure case |
| Labs | Three small CPU-only tasks: implement, investigate, and diagnose; complete scripts and expected behaviour |
| Exercises | Twelve required problems: four fluency, three derivation/proof, three application, two fault diagnosis; two optional extensions |
| Solutions | Full reasoning, intermediate steps, assumptions, and an alternative method when instructive |
| Quiz | Ten questions with explanations for correct and incorrect choices; include one free-response explanation |
| Visual material | Three to six purposeful figures and one small interactive demonstration where it improves understanding |
| Failure analysis | At least three misconceptions or numerical/model failures, each with symptom, cause, and repair |
| Reading | One required short selection and one optional deeper selection, with a purpose and follow-up question |
| Review | A compact concept map, notation summary, bilingual terms, and readiness task for the next module |

Target roughly 4,000–7,000 words of English exposition per taught module, excluding code and solutions; use the actual study time to adjust this rather than stretching every module to a fixed length. Dense proof or calculation sections need fewer words and more time.

### Session budgets

Divide each module into four sessions: language and intuition; derivation and hand calculation; implementation and diagnosis; synthesis and assessment. The six lesson sections normally split 2–2–1–1 across these sessions. Arrange labs and practice so a learner applies ideas in the same session they first appear.

| Module hours | Session lengths | Reading and examples | Labs | Exercises | Quiz and retrieval | Guided reading |
|---|---|---|---|---|---|---|
| 6 | 4 × 90 min | 140 min | 90 min | 80 min | 25 min | 25 min |
| 8 | 4 × 120 min | 180 min | 120 min | 110 min | 35 min | 35 min |
| 10 | 4 × 150 min | 220 min | 150 min | 140 min | 45 min | 45 min |
| 12 | 4 × 180 min | 260 min | 180 min | 170 min | 55 min | 55 min |

Long sessions can be split into two study periods. Budget setup separately as an optional one-hour orientation. The 14-hour CS capstone uses 2 + 4 + 4 + 4 hours; the 16-hour AI capstone uses four four-hour stages.

### Assessment and progression

For each taught module, score required exercises out of 60, the three lab explanations out of 30, and the quiz out of 10. Recommend progression at 80/100, with at least 36/60 on written reasoning, 18/30 on labs, and 7/10 on the quiz. These are instructional targets, not validated admission thresholds. All exit tasks must also be explained correctly after feedback; a high total must not conceal a failed prerequisite skill.

A proof earns credit for stating assumptions, a valid argument, and an explicit conclusion. A computation earns credit for intermediate steps, units or dimensions where relevant, and a reasonableness check. A lab earns credit for predicting behaviour, explaining observed results, and diagnosing a deliberately introduced fault. Producing the expected plot alone is insufficient.

Provide retrieval questions after Modules 04, 08, 14, 18, 20, 24, 26, and 30. Each checkpoint reuses two earlier ideas in a new context; it adds no hours beyond that module's review allocation. Suggest one short review a week later and another a month later as optional maintenance.

## Curriculum overview

Prerequisites in the detailed module briefs are **direct** dependencies; all their ancestors are also required. Numbers indicate mathematical prerequisites, not a requirement to finish every preceding module. Module 00 is optional and the Python primer applies to all labs.

| Part | Modules | Purpose | Hours |
|---|---|---|---|
| A Mathematical language and reasoning | 01–04 | Read statements, define objects, and prove claims | 32 |
| B Discrete mathematics for CS | 05–08 | Count possibilities, analyse growth, and reason about discrete structures | 34 |
| C Linear algebra and geometry | 09–14 | Represent data and understand linear transformations and decompositions | 58 |
| D Calculus and change | 15–18 | Understand limits, approximation, accumulation, and derivatives through programs | 40 |
| E Optimisation | 19–20 | Formulate and solve smooth and constrained objectives | 24 |
| F Probability and statistics | 21–26 | Model uncertainty, estimate parameters, and assess evidence | 64 |
| G Information and learning | 27–30 | Connect objectives, stochastic training, numerical reliability, and generalisation | 46 |
| H Integrated projects | 31–32 | Combine mathematics into explained, evaluated systems | 30 |

### Recommended routes

These routes are proposed study choices. They are not claims that every CS or AI topic requires every listed module.

| Route | Module sequence | Hours | Intended result |
|---|---|---|---|
| Full foundation | 01–32 | 328 | Both discrete and continuous foundations with both capstones |
| CS core | 01–08 → 21–24 → 31 | 120 | Correctness, algorithm analysis, graphs, number theory, and discrete uncertainty |
| AI foundation | 01–06 → 09–19 → 21–30 → 32 | 286 | Linear algebra, calculus, probability, statistics, and learning mathematics |
| Return to the existing AI series | 01–05 → 09–13 → 15–19 → 21–25 | 192 | The mathematical entry skills stated in AI Module 01 |

The CS route uses the discrete branches of Modules 22–24: sums and finite distributions, with continuous material explicitly optional for this route. The other routes complete the continuous branches and therefore take Module 17 first. All route hours assume the listed modules' full estimated budgets; a discrete-only version may be shorter after piloting. Add six hours for Module 00 if needed.

For the shorter AI entry route, add Module 06 for deeper algorithm analysis, Module 14 for PCA, Module 26 for experimental evaluation, Module 27 for information theory, and Module 28 for stochastic optimisation before reading those corresponding advanced topics. The existing AI series supplies some of these ideas itself; this route prepares its entry requirements rather than replacing its teaching.

### Dependency map

| Branch | Main dependencies | Joins |
|---|---|---|
| Reasoning | 01 → 02 and 03 → 04 | Required by proofs and discrete analysis |
| Discrete structures | 04 → 05 and 06; 03 + 04 + 06 → 07; 04 → 08 | Probability uses 05; CS capstone uses 07 and 08 |
| Linear algebra | 01 + 03 → 09 → 10 → 11 → 12 → 13 → 14 | Multivariable calculus, optimisation, and covariance |
| Calculus | 01 → 15 → 16 → 17; 10 + 16 → 18 | Continuous probability uses 17; optimisation uses 13 + 18 |
| Optimisation | 13 + 18 → 19 → 20 | Stochastic optimisation also needs 23 and 25 |
| Probability | 03 + 05 → 21 → 22 → 23 → 24 | Continuous track adds 17; covariance geometry adds 12 |
| Statistics | 16 + 23 + 24 → 25 → 26 | Regression adds 12 and 19 |
| Learning | 16 + 23 + 25 → 27; 19 + 23 + 25 → 28; 14 + 18 + 19 → 29; 12 + 24 + 26 + 27 → 30 | AI capstone combines 14 + 18 + 26–30; Module 20 supports the Module 30 duality extension |

Module 30 includes a constrained optimisation introduction for learners following the AI route without Module 20; its full duality/SVM extension requires Module 20. The metadata records conditional prerequisites separately so alternative routes remain honest.

## Module 00 Optional algebra and Python orientation

**Time:** 6 hours for the algebra refresher; the optional one-hour Python setup is separate. **Prerequisites:** arithmetic with whole numbers. **Chinese title:** 可选代数复习与 Python 入门.

**Outcomes:** manipulate fractions and signs; rearrange equations without changing their solutions; use exponents and logarithms with correct domains; read a graph; execute a provided Python script.

**Lesson sequence:** fractions, signs, and order of operations; ratios, percentages, and scientific notation; linear equations and inequalities; polynomials and factoring; exponentials, logarithms, and simple trigonometry; coordinates, slopes, and graph reading. Introduce radians, sine, and cosine only to support later geometric and calculus examples.

**Worked examples:** compare `−3²` with `(−3)²`; solve `3x + 5 = 17`; simplify `log₂(8)`; find the slope through `(1, 2)` and `(3, 6)`; identify the illegal step in dividing by an expression that might be zero.

**Practice:** six hand calculations, two graph interpretations, and repairs of two invalid manipulations. The exit task is to solve and explain the first five diagnostic tasks without guessing.

**Orientation lab:** install or locate Python, run a script, call a function, inspect a list, and read a traceback. Supply equivalent Windows PowerShell, macOS, and Linux instructions. No package installation is needed until the NumPy primer.

## Part A Mathematical language and reasoning

### Module 01 Mathematical language numbers and functions

**Time:** 6 hours. **Prerequisites:** entry algebra skills or Module 00. **Chinese title:** 数学语言 数与函数.

**Outcomes:** distinguish definitions from claims; track free and bound symbols; state a function's domain and codomain; expand a finite sum or product; translate an expression into a small program.

**Lesson sequence:**

1. Mathematical objects and number systems: natural numbers with an explicit zero convention, integers, rationals, reals, and a preview of complex numbers.
2. Symbols, equality, inequalities, indexed notation, intervals, absolute value, and the difference between an assignment and an equation.
3. Functions as mappings: domain, codomain, image, composition, inverse functions, and piecewise definitions.
4. Powers and logarithms: domains, inverse relationships, growth comparisons, and logarithm base changes.
5. Finite sums and products: indices, empty sums/products, double sums, and avoiding variable capture.
6. Reading a mathematical specification: inputs, outputs, assumptions, and checking a proposed identity.

**Worked examples:** evaluate a piecewise absolute-value function; compose `f(x) = 2x + 1` with `g(x) = x²`; expand `Σᵢ₌₀³ (2i + 1) = 16`; compare `log₂ n` and `ln n`; find where `log(x − 1)` is defined.

**Labs:** A implements finite sums and compares loops with written expansions. B plots linear, quadratic, exponential, and logarithmic functions over stated domains. C repairs an off-by-one sum and an incorrect assumption that a general function distributes over addition.

**Assessment:** specify and implement a piecewise function, explain all symbols in a double sum, and reject `log(a + b) = log a + log b` with a valid counterexample. **Visual:** function composition explorer with domain warnings. **Transfer:** program contracts and indexed AI losses. **Pitfall:** treating a codomain as the set of values actually attained. **Reading:** R1 definitions and functions; R6 introductory notation.

### Module 02 Logic quantifiers and specifications

**Time:** 8 hours. **Prerequisites:** 01. **Chinese title:** 逻辑 量词与规格说明.

**Outcomes:** construct truth tables; distinguish implication from its converse; negate quantified statements; translate requirements into predicates; identify vacuous truth and scope errors.

**Lesson sequence:**

1. Propositions and Boolean connectives, with truth-table semantics.
2. Implication, equivalence, necessary/sufficient conditions, converse, inverse, and contrapositive.
3. Predicates, universal and existential quantifiers, and finite versus infinite domains.
4. Quantifier scope, nested order, and negation using De Morgan's laws.
5. Preconditions, postconditions, and assertions for simple programs.
6. Satisfiability, validity, and finite model checking; explain what enumeration can establish.

**Worked examples:** compare `∀x ∃y` with `∃y ∀x` using integer addition; negate “every request has an approved reviewer”; derive the contrapositive of “divisible by four implies even”; evaluate an implication with a false antecedent.

**Labs:** A builds truth tables from small expressions. B checks quantified predicates over a finite catalogue. C generates counterexamples to a wrongly formalised access rule.

**Assessment:** translate three requirements with explicit domains, prove two truth-table equivalences, and explain why a finite search is insufficient for a universal claim over all integers. **Visual:** truth-table and quantifier explorer. **Transfer:** branching logic, verification, and the assumptions behind universal AI claims. **Pitfall:** confusing “if” with “if and only if”. **Reading:** R1 propositions and predicate logic.

### Module 03 Sets relations and discrete structures

**Time:** 8 hours. **Prerequisites:** 01 and 02. **Chinese title:** 集合 关系与离散结构.

**Outcomes:** compute set operations; represent and classify relations; build equivalence classes; distinguish an order from an equivalence; test injectivity and surjectivity.

**Lesson sequence:**

1. Membership, subsets, power sets, complements relative to a universe, and Cartesian products.
2. Set identities and their proof by membership or logical equivalence.
3. Binary relations and reflexive, symmetric, antisymmetric, and transitive properties.
4. Equivalence relations, partitions, and quotient sets through concrete examples.
5. Partial and total orders, Hasse diagrams, and incomparable elements.
6. Functions as relations; injective, surjective, bijective, and inverse mappings; a brief countability preview.

**Worked examples:** form all subsets of `{a, b, c}`; partition integers by parity; order sets by inclusion; explain why “shares a keyword” is generally not transitive; compare an injective identifier mapping with a lossy feature mapping.

**Labs:** A checks set identities on small universes. B classifies relations represented as pairs or Boolean tables. C groups records under an equivalence relation and exposes a broken deduplication rule.

**Assessment:** prove one set identity, give a counterexample for each failed relation property, and construct a Hasse diagram. **Visual:** relation explorer with highlighted failing pairs/triples. **Transfer:** databases, dependency orders, equivalence of representations, and data labels. **Pitfall:** interpreting antisymmetric as “never symmetric”. **Reading:** R1 sets, relations, and mappings.

### Module 04 Proof methods induction and invariants

**Time:** 10 hours. **Prerequisites:** 02 and 03. **Chinese title:** 证明方法 归纳法与不变式.

**Outcomes:** choose an appropriate proof method; write complete induction arguments; distinguish a counterexample from a proof; prove correctness and termination separately; state a loop invariant at the correct program point.

**Lesson sequence:**

1. Theorems, hypotheses, conclusions, lemmas, and the role of definitions.
2. Direct proof, cases, contrapositive, and contradiction.
3. Existence and uniqueness proofs; constructive arguments and counterexamples.
4. Weak and strong induction, base cases, induction hypotheses, and well-ordering.
5. Recursive definitions and structural induction over lists and trees.
6. Loop invariants, initialisation, preservation, postconditions, and decreasing termination measures.

**Worked examples:** prove a sum formula; prove a parity claim by contrapositive; use strong induction on a recursive process; verify linear search returns the first matching position; explain why its invariant alone does not prove termination.

**Labs:** A exhaustively checks small instances of a proposed identity while recording that this is experimental evidence. B instruments a search invariant. C finds the missing base case and non-decreasing variant in two faulty arguments.

**Assessment:** submit one direct proof, one induction proof, and one correctness/termination argument with separate obligations. **Visual:** execution trace with invariant and variant annotations. **Transfer:** algorithm correctness, recursive definitions, and reading mathematical AI derivations. **Pitfall:** using the statement to be proved as an intermediate assumption. **Reading:** R1 proof methods, induction, and state machines.

## Part B Discrete mathematics for CS

### Module 05 Counting combinatorics and finite probability

**Time:** 8 hours. **Prerequisites:** 03 and 04. **Chinese title:** 计数 组合数学与有限概率.

**Outcomes:** choose sum/product rules correctly; count ordered and unordered selections; apply inclusion–exclusion and the pigeonhole principle; identify when equally likely counting gives a probability.

**Lesson sequence:**

1. Addition and multiplication rules, decision trees, and disjointness assumptions.
2. Permutations with and without repeated objects.
3. Combinations, binomial coefficients, Pascal's identity, and the binomial theorem.
4. Counting with repetition, stars and bars, and constraints on selections.
5. Inclusion–exclusion, complementary counting, and the pigeonhole principle.
6. Finite sample spaces, equally likely outcomes, and a preview of probability versus counting.

**Worked examples:** count length-four binary strings; choose three records from ten; distribute five identical tasks across three named workers; count records matching either of two labels; compute the probability of at least one collision in a small uniform hash space.

**Labs:** A enumerates small selections and checks counting formulas. B compares exact collision counts with a simulation. C repairs a count that treats repeated labels as distinct outcomes.

**Assessment:** explain the modelling assumptions before each count; prove Pascal's identity combinatorially; calculate a collision probability without confusing it with a guarantee. **Visual:** selection tree switching between order-sensitive and order-insensitive tasks. **Transfer:** search spaces, hash collisions, and dataset splits. **Pitfall:** assuming a finite sample space is automatically uniform. **Reading:** R1 counting and combinatorial probability.

### Module 06 Sequences sums asymptotics and recurrences

**Time:** 10 hours. **Prerequisites:** 01 and 04. **Chinese title:** 数列 求和 渐近分析与递推关系.

**Outcomes:** evaluate common finite sums; prove Big O and Theta statements from definitions; solve simple recurrences; distinguish exact operation counts from asymptotic growth and elapsed time.

**Lesson sequence:**

1. Arithmetic and geometric sequences, finite sums, and telescoping.
2. Growth rates, logarithm bases, and comparison of polynomials and exponentials.
3. Big O, Omega, Theta, little o, quantified definitions, and witnesses.
4. Operation counts for loops, nested loops, and input-dependent branches.
5. Recurrences solved by expansion, recursion trees, and induction/substitution.
6. Master-theorem cases with stated applicability; simple aggregate amortised analysis.

**Worked examples:** sum `1 + … + n`; count a triangular loop; prove `3n² + 7n + 2` is Theta of `n²`; solve `T(n) = 2T(n/2) + n` for powers of two; analyse doubling capacity using total copies.

**Labs:** A records exact counts for three loops. B compares recurrence counts against predicted growth. C diagnoses misleading timings and a recurrence outside the standard Master theorem.

**Assessment:** provide explicit constants for a Big O proof, solve and verify a recurrence, and distinguish worst-case from amortised cost. **Visual:** growth and recurrence-tree explorer. **Transfer:** algorithm analysis and the cost of matrix-based AI computation. **Pitfall:** interpreting Big O as an exact time or a tight bound. **Reading:** R1 sums, asymptotics, and recurrences.

### Module 07 Graphs trees and state transitions

**Time:** 8 hours. **Prerequisites:** 03, 04, and 06. **Chinese title:** 图 树与状态转移.

**Outcomes:** choose a graph model; prove a basic graph property; explain BFS and DFS invariants; identify DAGs and valid topological orders; relate a state-transition graph to reachability.

**Lesson sequence:**

1. Directed/undirected graphs, vertices, edges, degrees, paths, walks, and representations.
2. Degree sums, connectivity, cycles, and simple counting arguments.
3. Trees, rooted trees, leaves, height, and the edge-count theorem.
4. BFS/DFS as mathematical traversals; reachability and unweighted shortest paths.
5. DAGs, topological ordering, dependency scheduling, and induction over a graph.
6. Finite state machines, product states, invariants, and limits of exhaustive exploration.

**Worked examples:** prove a finite tree with `n` vertices has `n − 1` edges; explain a BFS distance certificate; find a cycle in prerequisites; model a two-state retry protocol.

**Labs:** A builds adjacency lists and matrices. B traces traversals and checks distance/order claims. C explores a finite protocol and repairs an unreachable or unsafe state.

**Assessment:** prove the tree theorem, construct a topological order or a cycle witness, and explain BFS correctness in an unweighted graph. **Visual:** graph traversal and state-space explorer. **Transfer:** dependency systems, automata, computation graphs, and graph data. **Pitfall:** expecting BFS to solve arbitrary weighted shortest-path problems. **Reading:** R1 graphs and state machines.

### Module 08 Modular arithmetic and algebra for computing

**Time:** 8 hours. **Prerequisites:** 01 and 04. **Chinese title:** 模运算与计算中的代数.

**Outcomes:** work with divisibility and congruence; compute gcd and modular inverses; explain when cancellation is valid; distinguish integers, modular rings, and prime finite fields.

**Lesson sequence:**

1. Divisibility, primes, factorisation, and the division algorithm.
2. Euclid's algorithm and its invariant; extended Euclid and Bézout coefficients.
3. Congruence, modular addition/multiplication, and representative choices.
4. Modular inverses, solvability of a linear congruence, and zero divisors.
5. Fast modular exponentiation; Fermat's little theorem with conditions; a small Chinese remainder example.
6. Groups, rings, and fields through examples; binary arithmetic, hashing, and a conceptual cryptography connection.

**Worked examples:** compute `gcd(252, 105) = 21`; find the inverse of `3 mod 7`; explain why `2 mod 6` has no inverse; solve two coprime congruences; calculate a small exponent by repeated squaring.

**Labs:** A implements Euclid and verifies Bézout identities. B implements modular powers and compares with Python's built-in result. C detects illegal modular division and constructs a tiny checksum collision.

**Assessment:** prove gcd preservation, justify an inverse using gcd, and explain how a checksum differs from a cryptographic security claim. **Visual:** residue clock and Euclidean trace. **Transfer:** arithmetic representations, checksums, hashes, and later finite-field study. **Pitfall:** dividing by a non-zero residue that is not invertible. **Reading:** R1 number theory.

## Part C Linear algebra and geometry

### Module 09 Vectors geometry and array notation

**Time:** 8 hours. **Prerequisites:** 01 and 03. **Chinese title:** 向量 几何与数组记法.

**Outcomes:** compute vector operations and distances; interpret a dot product geometrically; choose and explain a norm; distinguish vectors from their coordinate arrays; track shapes in simple data operations.

**Lesson sequence:**

1. Scalars, vectors, coordinates, features, and points versus displacements.
2. Addition, scalar multiplication, linear combinations, lines, and affine combinations.
3. Dot products, lengths, angles, orthogonality, and Cauchy–Schwarz.
4. Euclidean, Manhattan, and maximum norms; metric axioms and feature scales.
5. Unit vectors, normalisation, cosine similarity, and the zero-vector exception.
6. NumPy shape notation, row/column conventions, broadcasting, and higher-order arrays as a preview.

**Worked examples:** calculate the distance between `(1, 2)` and `(4, 6)`; normalise `(3, 4)`; project `(2, 3)` onto a coordinate direction; show how changing a feature's units changes a nearest neighbour.

**Labs:** A implements dot products and norms with loops, then checks NumPy results. B compares neighbour rankings under feature scaling. C repairs accidental broadcasting and a division by zero in cosine similarity.

**Assessment:** justify a norm calculation, check all array shapes, and explain when two data vectors being close is meaningful. **Visual:** draggable two-dimensional vectors with angle and norm displays. **Transfer:** graphics, embeddings, nearest neighbours, and attention scores. **Pitfall:** treating similarity as a probability or assuming all feature units are interchangeable. **Reading:** R2 geometric introductions; R6 analytic geometry.

### Module 10 Matrices linear maps and linear systems

**Time:** 10 hours. **Prerequisites:** 09. **Chinese title:** 矩阵 线性映射与线性方程组.

**Outcomes:** multiply compatible matrices; interpret composition of linear maps; solve small systems by elimination; distinguish unique, inconsistent, and underdetermined systems; use a solver instead of explicitly forming an inverse.

**Lesson sequence:**

1. Matrices as linear transformations and data tables; columns as images of basis vectors.
2. Products, transpose, identity, diagonal and block matrices, and non-commutativity.
3. Linear systems, augmented matrices, elementary row operations, and pivots.
4. Gaussian elimination, row-echelon forms, consistency, and free variables.
5. Invertibility, determinants as signed volume scaling, and why determinant-based solving is unsuitable as a default numerical method.
6. Batched linear models, affine maps with bias, and shape-safe implementation.

**Worked examples:** compose a shear and a scale in both orders; solve a two-equation system; construct inconsistent and infinitely soluble systems; explain a `batch × features` matrix multiplied by `features × outputs` weights.

**Labs:** A implements small matrix products. B traces elimination with pivoting for a small system. C compares a direct solver with inverse-based code and diagnoses a singular matrix.

**Assessment:** solve and classify three systems, predict a transformed grid, and annotate every dimension in a batched affine layer. **Visual:** matrix transformation explorer. **Transfer:** constraint systems, image transforms, dense layers, and attention products. **Pitfall:** assuming matrix multiplication commutes. **Reading:** R2 systems and matrix multiplication; R6 linear algebra.

### Module 11 Vector spaces bases rank and identifiability

**Time:** 10 hours. **Prerequisites:** 04 and 10. **Chinese title:** 向量空间 基 秩与可辨识性.

**Outcomes:** test linear independence; find a basis and coordinates; compute rank and nullity; explain the four fundamental subspaces; relate non-unique parameters to null-space directions.

**Lesson sequence:**

1. Vector spaces and subspaces; closure and examples involving functions or polynomials.
2. Span, dependence, independence, and redundant representations.
3. Bases, dimension, coordinate changes, and uniqueness of coordinates.
4. Column space, row space, null space, and left null space.
5. Rank–nullity with a complete finite-dimensional argument; system solvability revisited.
6. Identifiability: duplicate features, one-hot columns with an intercept, and equivalent parameter settings.

**Worked examples:** find a basis for three vectors in two dimensions; compute a null space by elimination; show why Celsius and Fahrenheit columns plus an intercept are dependent; exhibit different weights with identical predictions.

**Labs:** A finds rank and null-space examples with exact small integers before using numerical tolerances. B checks predictions after adding a null-space vector to weights. C diagnoses redundant features and explains tolerance-dependent numerical rank.

**Assessment:** prove a set is a subspace, compute a basis for a null space, and explain the difference between unique predictions and unique parameters. **Visual:** span and dependence explorer. **Transfer:** constraint solving, feature redundancy, and parameter identifiability. **Pitfall:** treating a nearly dependent matrix as exactly dependent without discussing precision. **Reading:** R2 vector spaces and fundamental subspaces; R6 linear algebra.

### Module 12 Orthogonality projections and least squares

**Time:** 10 hours. **Prerequisites:** 11. **Chinese title:** 正交性 投影与最小二乘.

**Outcomes:** compute an orthogonal projection; construct an orthonormal basis; derive normal equations geometrically; solve least squares with QR; explain residual orthogonality and rank-deficient solutions.

**Lesson sequence:**

1. Inner products and orthogonality; weighted inner products as an extension.
2. Projection onto a vector and onto a subspace.
3. Orthonormal bases, Gram–Schmidt, and its numerical limitations.
4. QR factorisation and a stable least-squares solve.
5. Derive `Xᵀ(Xw − y) = 0` from projection; uniqueness conditions and the later calculus derivation.
6. Minimum-norm solutions and the geometric role of a pseudoinverse, preparing for SVD.

**Worked examples:** project `(3, 2)` onto the line spanned by `(1, 1)`; fit a line to three points; verify `Xᵀr = 0`; show why normal equations can magnify conditioning problems.

**Labs:** A calculates projections and residuals. B fits a small linear model using QR and a library least-squares solver. C exposes an unstable normal-equation fit using nearly collinear features.

**Assessment:** derive the normal equations without differentiation, explain every term's shape, and give conditions for a unique minimiser. **Visual:** points, fit, and orthogonal residual explorer. **Transfer:** approximation, regression, and linear model baselines. **Pitfall:** concluding a small residual guarantees reliable coefficients or extrapolation. **Reading:** R2 orthogonality and least squares; R6 analytic geometry and regression.

### Module 13 Eigenvalues spectral geometry and quadratic forms

**Time:** 10 hours. **Prerequisites:** 12. **Chinese title:** 特征值 谱几何与二次型.

**Outcomes:** compute eigenpairs in small cases; distinguish diagonalisation from the symmetric spectral theorem; classify a symmetric quadratic form; interpret repeated linear transformations; connect spectra with conditioning.

**Lesson sequence:**

1. Eigenvectors as invariant directions; characteristic equations in two dimensions.
2. Diagonalisation, defective matrices, and the role of complex eigenvalues.
3. Real symmetric spectral theorem and orthonormal eigenbases.
4. Quadratic forms, positive semidefinite/definite matrices, and level-set geometry.
5. Powers, spectral radius, and stability of a discrete linear iteration.
6. Rayleigh quotients, principal directions, and condition ratios for positive-definite matrices.

**Worked examples:** diagonalise a symmetric `2 × 2` matrix; contrast a rotation with a defective shear-like matrix; draw an ellipse from a positive-definite quadratic; predict convergence of `eₖ₊₁ = Beₖ`.

**Labs:** A compares hand eigenpairs with numerical ones. B iterates a small linear map and predicts stable/unstable behaviour. C diagnoses arbitrary eigenvector sign changes and the failure of diagonalisation.

**Assessment:** verify an eigenpair, classify three quadratic forms, and explain stability using the relevant spectral condition and matrix assumptions. **Visual:** eigenvector and quadratic-contour explorer. **Transfer:** dynamical systems, graph spectra, optimisation curvature, and covariance geometry. **Pitfall:** assuming every matrix has a real orthonormal eigenbasis. **Reading:** R2 eigenvalues and positive-definite matrices; R6 matrix decompositions.

### Module 14 SVD low rank approximation and PCA

**Time:** 10 hours. **Prerequisites:** 13. **Chinese title:** 奇异值分解 低秩近似与主成分分析.

**Outcomes:** interpret the shapes and geometry of an SVD; compute a truncated approximation; explain a pseudoinverse; carry out centred PCA; distinguish reconstruction error from predictive usefulness.

**Lesson sequence:**

1. Singular values, left/right singular vectors, and full versus reduced SVD.
2. Rotation/reflection–scaling–rotation geometry for rectangular matrices.
3. Rank, pseudoinverse, minimum-norm solutions, and small singular values.
4. Truncation and the best rank-k approximation theorem, with a worked error calculation.
5. PCA by centring a data matrix and taking its SVD; sample scatter/covariance introduced algebraically.
6. Explained variance, scaling choices, sign ambiguity, and leakage from fitting transformations on test data.

**Worked examples:** write the SVD shapes for a `5 × 3` data matrix; reconstruct a rank-one approximation; relate squared singular values to centred scatter eigenvalues; compare PCA before and after changing feature units.

**Labs:** A compresses a generated matrix and measures reconstruction error. B implements PCA using training-set centring. C diagnoses an uncentred or test-fitted transform and an unstable pseudoinverse.

**Assessment:** derive the squared Frobenius reconstruction error from discarded singular values and explain the centring/scaling choices. **Visual:** rank slider with reconstruction and error. **Transfer:** compression, dimensionality reduction, embeddings, and low-rank adaptation. **Pitfall:** interpreting high explained variance as evidence of good classification. **Reading:** R2 SVD; R6 matrix decompositions and PCA. Probability interpretations return in Module 23.

## Part D Calculus and change

### Module 15 Limits continuity and convergence

**Time:** 8 hours. **Prerequisites:** 01 and 04. **Chinese title:** 极限 连续性与收敛.

**Outcomes:** reason about finite/infinite limits; distinguish a sequence from its limit; explain continuity; identify divergent behaviour; use convergence conditions rather than relying on a plot.

**Lesson sequence:**

1. Sequences, convergence, boundedness, and monotone convergence examples.
2. Function limits, one-sided limits, and algebraic limit laws with conditions.
3. Epsilon–delta meaning through a linear example; separate intuition from proof.
4. Continuity, composition, discontinuities, and intermediate/extreme value theorems on appropriate domains.
5. Infinite geometric series and a small selection of comparison/ratio tests.
6. Convergence of an iteration, tolerances, and what a finite numerical trace cannot establish.

**Worked examples:** evaluate a removable singularity; show a geometric series converges only for an appropriate ratio; contrast `1/n` with `(-1)^n`; explain why a discontinuous threshold function has no derivative at its jump.

**Labs:** A samples sequences and compares conjectures with arguments. B approaches a limit from both sides. C constructs misleading finite plots and a falsely converged iteration.

**Assessment:** justify one limit with inequalities, state a theorem's hypotheses, and identify three failures of convergence. **Visual:** limit and tolerance explorer. **Transfer:** iterative algorithms, approximation, and later optimisation convergence. **Pitfall:** treating “very close” as equal or assuming boundedness implies convergence. **Reading:** R3 limits and infinite processes.

### Module 16 Derivatives Taylor approximation and sensitivity

**Time:** 10 hours. **Prerequisites:** 15. **Chinese title:** 导数 泰勒近似与敏感性.

**Outcomes:** derive a derivative from a difference quotient; use product/quotient/chain rules; interpret local sensitivity; construct a Taylor approximation with an error statement; classify simple stationary points.

**Lesson sequence:**

1. Derivatives as local linear approximations and rates of change.
2. Derivatives of powers, exponentials, logarithms, sine, and cosine, with domains.
3. Product, quotient, chain, and inverse-function rules.
4. First/second derivatives, stationary points, mean value theorem, and local versus global extrema.
5. Taylor polynomials, remainder conditions, and approximation error.
6. Finite differences and the truncation/rounding tradeoff; non-differentiable absolute value and ReLU.

**Worked examples:** differentiate a nested exponential; approximate `ln(1 + x)` near zero; show a stationary point need not be a minimum; calculate a central difference at several step sizes.

**Labs:** A compares analytic derivatives with difference quotients. B explores Taylor error as the expansion point moves. C diagnoses a gradient estimate at a kink and one using an excessively small step.

**Assessment:** derive and explain a chain-rule calculation, bound a small Taylor remainder under stated conditions, and classify a stationary point. **Visual:** tangent and Taylor-order explorer. **Transfer:** sensitivity, root finding, and scalar training objectives. **Pitfall:** assuming every useful function is differentiable everywhere. **Reading:** R3 differentiation and Taylor series; R6 vector calculus introduction.

### Module 17 Integration accumulation and simple differential equations

**Time:** 10 hours. **Prerequisites:** 16. **Chinese title:** 积分 累积与简单微分方程.

**Outcomes:** interpret a definite integral; apply the fundamental theorem of calculus with conditions; normalise a simple density; approximate an integral numerically; solve and discretise a simple first-order ODE.

**Lesson sequence:**

1. Riemann sums, signed area, accumulation, and the distinction between a definite integral and an antiderivative.
2. Fundamental theorem of calculus and basic antiderivatives.
3. Substitution and integration by parts through selected examples.
4. Improper integrals, normalisation, and integration for continuous probability.
5. Trapezoidal/Simpson quadrature and error behaviour on smooth functions.
6. Separable first-order ODEs, exponential growth/decay, and Euler discretisation with stability warnings.

**Worked examples:** compute an accumulated rate; normalise `p(x) = c x` on `[0, 1]`; find its mean; solve `dx/dt = −ax`; compare continuous decay with discrete Euler updates.

**Labs:** A implements quadrature and compares with an analytic integral. B checks a candidate density's total mass. C diagnoses unstable Euler steps and a divergent improper integral.

**Assessment:** compute an integral with a justified substitution, explain density normalisation, and state when an Euler simulation disagrees with a stable differential equation. **Visual:** area partitions and decay-step explorer. **Transfer:** continuous uncertainty, numerical simulation, and dynamics used in later AI study. **Pitfall:** treating density height as probability. **Reading:** R3 integration and differential equations.

### Module 18 Multivariable derivatives matrix calculus and automatic differentiation

**Time:** 12 hours. **Prerequisites:** 10 and 16. **Chinese title:** 多元微分 矩阵微积分与自动微分.

**Outcomes:** compute partial/directional derivatives; distinguish a gradient, Jacobian, and Hessian; propagate derivatives through a computation graph; derive matrix gradients with shapes; verify a manual backward pass.

**Lesson sequence:**

1. Functions of several variables, partial derivatives, level sets, and directional derivatives.
2. Total differentials and gradients; differentiability versus existence of partial derivatives.
3. Jacobians, composition, and the multivariable chain rule.
4. Hessians, second-order Taylor expansions, and mixed-partial conditions.
5. Derive gradients of dot products, quadratic forms, and least-squares losses using differentials.
6. Forward/reverse automatic differentiation, vector–Jacobian products, shared nodes, and nondifferentiable conventions.

**Worked examples:** derive `∇w ||Xw − y||² = 2Xᵀ(Xw − y)`; calculate a two-input nonlinear Jacobian; backpropagate through a repeated variable; distinguish the gradients of a summed and mean batch loss.

**Labs:** A computes and checks vector derivatives with finite differences. B implements a tiny scalar reverse-mode engine. C verifies a two-layer network backward pass and repairs a transpose, missing accumulation, or batch-factor fault.

**Assessment:** annotate every derivative's shape, derive a quadratic gradient, and trace one vector–Jacobian product by hand. **Visual:** computation graph with forward values and reverse adjoints. **Transfer:** backpropagation, differentiable programs, and sensitivity analysis. **Pitfall:** assuming automatic differentiation is finite differencing or silently choosing a row-gradient convention. **Reading:** R4 partial derivatives and chain rules; R6 vector calculus.

## Part E Optimisation

### Module 19 Convexity gradient methods and unconstrained optimisation

**Time:** 12 hours. **Prerequisites:** 13 and 18. **Chinese title:** 凸性 梯度方法与无约束优化.

**Outcomes:** distinguish convexity from smoothness; classify stationary points; derive gradient descent on a quadratic; state convergence assumptions; compare gradient, Newton, and coordinate methods.

**Lesson sequence:**

1. Objectives, feasible domains, minimisers, infima, and local/global optima.
2. Convex sets/functions, Jensen's inequality, and first/second-order characterisations where applicable.
3. Stationary conditions and Hessian classification; saddle points and flat directions.
4. Gradient descent, learning rates, line search, and descent under a Lipschitz-gradient condition.
5. Quadratic convergence analysis: eigenmodes, `0 < η < 2/λmax` for positive-definite curvature, and conditioning.
6. Newton and coordinate descent; solve the Newton system rather than invert a Hessian; failure cases for nonconvex problems.

**Worked examples:** prove a squared norm is convex; calculate the full step-size interval for a two-dimensional positive-definite quadratic; show a saddle with zero gradient; compare an exact quadratic Newton step with gradient descent.

**Labs:** A implements gradient descent on an ellipse. B compares feature scaling and step-size choices. C repairs divergence, a singular Hessian, and an inappropriate stopping test.

**Assessment:** derive the quadratic error recurrence, justify an admissible step size, and distinguish a theorem for convex objectives from a heuristic for neural networks. **Visual:** contour paths with curvature and learning-rate controls. **Transfer:** optimisation, parameter fitting, and training diagnostics. **Pitfall:** treating a zero gradient as a certificate of a global optimum. **Reading:** R7 convex functions and unconstrained minimisation.

### Module 20 Constrained optimisation Lagrange multipliers and duality

**Time:** 12 hours. **Prerequisites:** 19. **Chinese title:** 约束优化 拉格朗日乘子与对偶性.

**Outcomes:** formulate constraints precisely; derive a Lagrangian; interpret multipliers; write KKT conditions; distinguish necessity, sufficiency, weak duality, and strong duality under their assumptions.

**Lesson sequence:**

1. Equality/inequality constraints, feasible sets, active constraints, and projection.
2. Equality-constrained extrema and Lagrange multipliers, including constraint-qualification caveats.
3. Inequality constraints and KKT stationarity, primal/dual feasibility, and complementary slackness.
4. Lagrange dual functions, weak duality, and dual bounds.
5. Convex problems, Slater's condition in its appropriate form, and strong duality.
6. Projected gradients, penalties versus exact constraints, and a small quadratic programme.

**Worked examples:** minimise a quadratic subject to a line constraint; allocate a non-negative resource budget; solve a bound-constrained scalar problem; interpret an active multiplier as local sensitivity of the optimal value.

**Labs:** A projects points onto a box and simplex. B implements projected gradient descent on a small convex problem. C checks KKT residuals and diagnoses an infeasible result or an invalid strong-duality claim.

**Assessment:** solve one equality-constrained and one inequality-constrained example with all KKT conditions, then state the assumptions making the solution globally optimal. **Visual:** objective contours with feasible region and active constraints. **Transfer:** scheduling, constrained learning, support vector machines, and later reinforcement-learning constraints. **Pitfall:** treating KKT conditions as an unconditional global certificate. **Reading:** R7 duality and constrained optimisation.

## Part F Probability and statistics

### Module 21 Probability models conditioning and Bayes rule

**Time:** 10 hours. **Prerequisites:** 03 and 05. **Chinese title:** 概率模型 条件概率与贝叶斯法则.

**Outcomes:** define a sample space and events; apply probability axioms; calculate conditional probabilities; distinguish independence from disjointness; explain a base-rate effect using Bayes' rule.

**Lesson sequence:**

1. Probability models, events, axioms, complements, and countable additivity at an introductory level.
2. Uniform versus non-uniform outcomes; union bounds and event inclusion–exclusion.
3. Conditional probability, chain rules, and tree/table representations.
4. Total probability and Bayes' rule; likelihood ratios and odds.
5. Pairwise/mutual independence and conditional independence with explicit examples.
6. Base rates, selection effects, and distinguishing a model's assumptions from observed frequencies.

**Worked examples:** compute a posterior with prevalence 1%, sensitivity 90%, and false-positive rate 5%, obtaining `0.009 / 0.0585 = 2/13 ≈ 15.38%`; compare independent and disjoint events; construct three pairwise-independent events that are not mutually independent.

**Labs:** A enumerates exact probabilities in a finite weighted sample space. B simulates the base-rate example at increasing sample sizes. C diagnoses a reversed conditional probability and a selection-biased sample.

**Assessment:** specify a complete finite probability model, solve a conditional-probability tree, and explain each Bayes factor in words. **Visual:** base-rate table with population counts. **Transfer:** reliability, false alarms, probabilistic classifiers, and diagnostic reasoning. **Pitfall:** assuming `P(A|B) = P(B|A)`. **Reading:** R5 probability models and conditioning; R1 discrete probability.

### Module 22 Random variables distributions and transformations

**Time:** 10 hours. **Prerequisites:** 21; 17 for the continuous branch. **Chinese title:** 随机变量 分布与变换.

**Outcomes:** distinguish a random variable from an outcome or observation; use PMFs, PDFs, and CDFs correctly; select a distribution with stated assumptions; compute probabilities after simple transformations.

**Lesson sequence:**

1. Random variables as functions on a sample space; support and distribution.
2. Discrete PMFs and CDFs; Bernoulli, categorical, binomial, geometric, and Poisson models.
3. Continuous densities/CDFs; uniform, exponential, Gaussian, and Laplace models, requiring Module 17.
4. Quantiles, inverse-CDF sampling, and the distinction between mass and density.
5. Transformations of discrete variables; continuous monotone change of variables with its Jacobian factor.
6. Model selection from the data-generating story; parameter conventions and support checks.

**Worked examples:** calculate a binomial tail for a small trial count; derive a geometric waiting-time PMF; transform a uniform variable; explain why a continuous point has probability zero even when its density is positive.

**Labs:** A computes discrete tables and verifies normalisation. B samples from selected distributions and compares empirical CDFs. C repairs an omitted Jacobian and a distribution used with the wrong support; the CS branch uses a discrete transformation instead.

**Assessment:** derive one PMF from an experiment, calculate an event via a CDF, and justify the assumptions of a chosen distribution. **Visual:** PMF/PDF/CDF and sampling explorer. **Transfer:** randomised algorithms, noise models, and classification likelihoods. **Pitfall:** interpreting a likelihood value for a continuous observation as its event probability. **Reading:** R5 random variables; R6 probability and distributions.

### Module 23 Expectation joint distributions covariance and dependence

**Time:** 10 hours. **Prerequisites:** 22; 17 for continuous integrals; 12 for the vector covariance extension. **Chinese title:** 期望 联合分布 协方差与依赖关系.

**Outcomes:** compute moments and conditional expectations; use linearity without assuming independence; distinguish uncorrelated from independent; apply total expectation/variance; interpret a covariance matrix when following the AI branch.

**Lesson sequence:**

1. Expectation as a weighted sum or integral; expectation of a function.
2. Variance, standard deviation, moments, and existence conditions.
3. Joint/marginal distributions, dependence, and factorisation under independence.
4. Covariance/correlation, variance of sums, and examples of dependence with zero covariance.
5. Conditional expectation and the laws of total expectation and total variance.
6. AI branch: covariance matrices, positive semidefiniteness, multivariate Gaussians, and the probability interpretation of PCA.

**Worked examples:** compute a joint table's marginals; prove expectation is linear; use `Y = X²` with symmetric `X` to demonstrate dependence with zero covariance; calculate an expected search cost under a specified position distribution.

**Labs:** A computes exact moments from a joint discrete table. B simulates dependent variables and compares covariance with scatter plots. C demonstrates why an independence-based variance formula fails; the AI extension compares covariance eigenvectors with PCA directions.

**Assessment:** derive a variance formula with covariance terms and solve a conditional-expectation problem. **Visual:** joint table linked to marginal plots. **Transfer:** average algorithm cost, uncertainty propagation, feature dependence, and model noise. **Pitfall:** equating zero correlation with independence outside special cases. **Reading:** R5 expectation, joint variables, and conditioning; R6 distributions.

### Module 24 Limit theorems concentration and Monte Carlo

**Time:** 10 hours. **Prerequisites:** 04 and 23; 17 for continuous integration examples. **Chinese title:** 极限定理 集中不等式与蒙特卡洛方法.

**Outcomes:** state useful forms of the law of large numbers and central limit theorem; calculate a Monte Carlo standard error; apply a basic concentration bound; distinguish statistical error from deterministic numerical error.

**Lesson sequence:**

1. Sampling assumptions, independence, identical distribution, and what changes under dependence.
2. Markov/Chebyshev inequalities and a complete elementary proof of Chebyshev.
3. Weak law of large numbers through variance of an average under finite-variance assumptions.
4. A standard i.i.d. finite-variance central limit theorem, standardisation, and limits of the approximation.
5. Hoeffding's inequality for bounded independent variables; sample-size calculations and union bounds.
6. Monte Carlo estimation, standard error, seed management, and variance reduction by paired/common random numbers.

**Worked examples:** bound a Bernoulli sample mean's deviation; calculate how quadrupling samples changes standard error; compare CLT behaviour for a fair coin and a highly skewed finite-variance variable; expose a dependent sample that gives misleading error bars.

**Labs:** A compares repeated sample means with predicted variation. B estimates a finite-event probability, with an optional continuous integral. C diagnoses a copied seed, dependent draws, or a falsely precise report.

**Assessment:** derive the variance of an independent sample mean, compute a valid concentration bound, and report an estimate with its assumptions and uncertainty. **Visual:** sampling-distribution explorer. **Transfer:** randomised algorithms, benchmark uncertainty, and stochastic training experiments. **Pitfall:** believing the CLT says the original observations become Gaussian. **Reading:** R5 laws of large numbers and inference; R1 concentration topics.

### Module 25 Estimation likelihood and Bayesian updating

**Time:** 12 hours. **Prerequisites:** 16, 17, 23, and 24. **Chinese title:** 参数估计 似然与贝叶斯更新.

**Outcomes:** distinguish a parameter from an estimator and estimate; derive a maximum-likelihood estimator; compare bias, variance, and mean squared error; perform a conjugate Bayesian update; explain the assumptions behind MAP regularisation.

**Lesson sequence:**

1. Statistical models, parameters, samples, estimators, and identifiability.
2. Likelihood versus probability as a function of different arguments; log-likelihood and independent sample factorisation.
3. Maximum likelihood for Bernoulli and Gaussian models; boundaries and finite-sample issues.
4. Bias, consistency, variance, mean squared error, and the sample-variance denominator.
5. Bayesian updating with a beta–Bernoulli model; posterior mean, predictive probability, and credible intervals.
6. MAP estimates, priors, Gaussian/Laplace noise, and the route from a probabilistic model to a loss or penalty.

**Worked examples:** derive the Bernoulli sample-proportion MLE; derive a Gaussian mean estimate; update a `Beta(2, 2)` prior after eight successes and two failures; contrast posterior mode, mean, and a boundary MLE.

**Labs:** A computes likelihood curves and estimates. B simulates estimator bias/variance over repeated datasets. C repairs underflow, a missing normalising factor where it matters, or a prior mistakenly treated as data.

**Assessment:** derive two estimators, explain their model assumptions, and separate frequentist sampling uncertainty from posterior uncertainty. **Visual:** likelihood and posterior explorer. **Transfer:** parameter fitting, loss construction, and regularisation. **Pitfall:** treating a likelihood as a normalised distribution over parameters without specifying a prior. **Reading:** R5 inference; R6 models meeting data and regression; R8 introductory estimation.

### Module 26 Statistical inference experiments and regression

**Time:** 12 hours. **Prerequisites:** 12, 19, and 25. **Chinese title:** 统计推断 实验设计与回归.

**Outcomes:** interpret confidence intervals and p-values correctly; design a comparison with an appropriate unit of analysis; derive basic regression fits from likelihoods; distinguish fit, prediction, and causal interpretation; diagnose leakage and repeated testing.

**Lesson sequence:**

1. Sampling distributions, standard errors, confidence intervals, and coverage by repeated sampling.
2. Null hypotheses, test statistics, significance, power, effect sizes, and p-value interpretation.
3. Randomisation, pairing, confounding, sampling units, and limits of observational conclusions.
4. Bootstrap and permutation tests with exchangeability and independence assumptions.
5. Linear/logistic regression as probabilistic models; residual checks and uncertainty conditions.
6. Train/validation/test separation, cross-validation, multiple comparisons, and selecting models without using test outcomes.

**Worked examples:** simulate nominal interval coverage; compare paired and unpaired model results; derive logistic negative log-likelihood; show a large-sample tiny effect with a small p-value; identify preprocessing leakage.

**Labs:** A implements a bootstrap interval and permutation comparison. B fits a small regression/classification model and inspects residuals or calibration. C repairs test-set tuning and a benchmark that treats correlated observations as independent.

**Assessment:** write an experimental protocol before seeing results, report an effect and uncertainty, and explain why an interval or p-value does not establish a causal mechanism. **Visual:** coverage and resampling explorer. **Transfer:** model evaluation, A/B comparisons, and reproducible empirical claims. **Pitfall:** interpreting a p-value as the probability the null hypothesis is true. **Reading:** R8 regression, resampling, and multiple testing.

## Part G Information and learning

### Module 27 Information theory entropy and probabilistic objectives

**Time:** 10 hours. **Prerequisites:** 16, 23, and 25. **Chinese title:** 信息论 熵与概率目标函数.

**Outcomes:** compute discrete entropy and cross-entropy; explain KL divergence's direction and support conditions; derive cross-entropy from likelihood; interpret mutual information; calculate perplexity with a stated log base and token unit.

**Lesson sequence:**

1. Surprisal, coding intuition, logarithm bases, and units of bits/nats.
2. Discrete entropy, conditional entropy, and chain rules.
3. Cross-entropy and its relationship to expected code length and negative log-likelihood.
4. KL divergence, non-negativity using a stated inequality, asymmetry, and support mismatches.
5. Mutual information and dependence; data-processing intuition with a stated theorem rather than an omitted proof.
6. Perplexity, sequence factorisation, and a preview of differential entropy and its different properties.

**Worked examples:** compare entropy of a fair and biased coin; calculate cross-entropy for two categorical distributions; obtain infinite KL when a required probability is zero; convert a mean token loss in nats into perplexity.

**Labs:** A computes entropy/KL with careful zero handling. B compares a small frequency-based language model with a uniform baseline. C diagnoses mixed log bases, invalid probabilities, and meaningless perplexity comparisons across tokenisations.

**Assessment:** derive categorical cross-entropy from independent observations, prove a discrete KL non-negativity statement with its conditions, and interpret perplexity without claiming it measures all aspects of quality. **Visual:** categorical-distribution and coding explorer. **Transfer:** compression, classification losses, and language-model objectives. **Pitfall:** describing KL divergence as a symmetric metric. **Reading:** R9 entropy, relative entropy, and mutual information; R6 likelihood-based classification.

### Module 28 Stochastic optimisation regularisation and training dynamics

**Time:** 12 hours. **Prerequisites:** 19, 23, and 25. **Chinese title:** 随机优化 正则化与训练动态.

**Outcomes:** derive a mini-batch gradient estimator; state when it is unbiased; explain batch variance and sampling assumptions; distinguish regularisation methods; diagnose noisy, ill-conditioned, and unstable training.

**Lesson sequence:**

1. Expected risk versus empirical risk, finite dataset objectives, and stochastic gradient estimates.
2. Sampling with/without replacement, batch size, gradient variance, and correlation.
3. SGD, step schedules, momentum, and explicitly defined adaptive updates as methods to inspect rather than unconditional guarantees.
4. Ridge/lasso geometry, MAP connections, and non-smooth penalties/subgradient conventions.
5. Early stopping, explicit penalties, and when weight decay coincides with a penalty gradient.
6. Conditioning, clipping, validation curves, stochastic stopping, and seed-to-seed variability.

**Worked examples:** derive `E[g_batch] = ∇L` for uniform sampling; calculate gradient variance for a small dataset; compare ridge coefficients with unregularised ones; show why Adam-style decoupled weight decay differs from adding an L2 gradient.

**Labs:** A compares full-batch, single-sample, and mini-batch updates. B studies regularisation and feature scaling on a fixed split. C diagnoses a bad learning rate, correlated batches, and a test-based stopping rule.

**Assessment:** identify the source of randomness, derive an unbiased gradient estimate under explicit assumptions, and report training/evaluation variation across seeds. **Visual:** noisy gradient paths and regularisation slider. **Transfer:** neural-network training and reliable optimiser comparisons. **Pitfall:** interpreting lower training loss as proof of better generalisation. **Reading:** R6 optimisation and regression; R10 stochastic gradient descent. Verify any named optimiser's primary paper when writing its algorithm box.

### Module 29 Numerical computation conditioning and reliable experiments

**Time:** 12 hours. **Prerequisites:** 14, 18, and 19. **Chinese title:** 数值计算 条件数与可靠实验.

**Outcomes:** distinguish conditioning from algorithmic stability; explain rounding/cancellation; implement stable probability calculations; choose a suitable linear solver; report approximation error and reproducibility limits.

**Lesson sequence:**

1. Floating-point representation, rounding, machine epsilon, overflow/underflow, and representable spacing.
2. Absolute/relative error, catastrophic cancellation, stable summation, and safe comparisons.
3. Condition numbers, perturbation sensitivity, forward/backward error, and stable algorithms.
4. Linear solves, QR/SVD, iterative methods, and why normal equations square the two-norm condition number for full-column-rank matrices.
5. Stable sigmoid, softmax, log-sum-exp, log probabilities, and gradient checking away from kinks.
6. Precision versus memory/cost, operation counts, random seeds, tolerance-based regression checks, and reproducible reports.

**Worked examples:** explain the representation error in `0.1 + 0.2`; compare two algebraically equivalent expressions near cancellation; stabilise logits `[1000, 1001, 1002]`; perturb an ill-conditioned system and distinguish a small residual from small solution error.

**Labs:** A measures rounding/summation errors at several precisions. B compares solves and condition estimates. C repairs overflowing cross-entropy and a misleading finite-difference gradient check.

**Assessment:** provide a numerical error diagnosis with a proposed repair, compute and interpret a condition estimate, and justify tolerances from scale and precision. **Visual:** precision and conditioning explorer. **Transfer:** robust scientific code, mixed-precision awareness, and AI serving calculations. **Pitfall:** confusing an accurate computation of an ill-conditioned problem with an insensitive solution. **Reading:** R11 and R12 numerical linear algebra documentation; R2 decomposition lectures. Check documentation against the pinned lab environment when writing examples.

### Module 30 Generalisation kernels and mathematical learning theory

**Time:** 12 hours. **Prerequisites:** 12, 24, 26, and 27; 20 for the full SVM duality extension. **Chinese title:** 泛化 核方法与数学学习理论.

**Outcomes:** distinguish empirical from population risk; explain why repeated model selection affects evaluation; derive a finite-class uniform bound under assumptions; verify a small positive-semidefinite kernel matrix; connect capacity and regularisation without overclaiming.

**Lesson sequence:**

1. Hypothesis classes, empirical/population risk, and the i.i.d. sampling assumption.
2. Fixed-model concentration versus a uniform statement over a finite class; use a union bound and Hoeffding.
3. Bias–variance decomposition for squared loss with the randomness and target specified.
4. Capacity, VC-dimension intuition, distribution shift, and the limits of introductory bounds for modern networks.
5. Feature maps, kernels, Gram matrices, positive semidefiniteness, and kernel ridge regression.
6. Margins and an introductory SVM formulation; constrained-dual derivation is an optional Module 20 extension.

**Worked examples:** bound risk error for a finite set of candidate classifiers; derive a kernel from a two-dimensional feature map; show that a symmetric matrix need not be a valid kernel matrix; calculate an overfit polynomial example.

**Labs:** A measures optimism from selecting among many models. B implements kernel ridge regression with a solve. C diagnoses an indefinite similarity matrix and a failure under distribution shift.

**Assessment:** derive a finite-class risk bound with explicit sample-size, independence, loss-range, and confidence assumptions; prove a feature-map Gram matrix is PSD; explain what the result does and does not predict about a neural network. **Visual:** capacity, split, and kernel explorer. **Transfer:** model selection, kernel methods, and critical reading of learning claims. **Pitfall:** treating a loose sufficient bound as an exact practical sample-size requirement. **Reading:** R10 uniform convergence and kernels; R6 support vector machines; R8 model assessment.

## Part H Integrated projects

### Module 31 CS capstone verified dependency planner

**Time:** 14 hours. **Prerequisites:** 04, 06, 07, 08, 21, and 24. **Chinese title:** 计算机科学综合项目 可验证的依赖规划器.

**Problem:** build a small planner for tasks with prerequisites and finite random duration models. It must either return a valid dependency order and predicted completion times or provide a cycle witness. Use a DAG model with unlimited parallel workers for critical-path calculations; do not imply this solves a resource-constrained scheduling problem.

**Required artefacts:** a written input/output contract; graph model and assumptions; Python implementation; invariant/induction proofs; operation-count analysis; exact and simulated uncertainty calculations; and a concise report explaining limitations.

**Project stages:**

1. **Specify and model, 2 hours:** use 8–12 tasks, including a diamond dependency, an isolated task, and an invalid cycle case. Define task IDs, positive finite durations, invalid-input behaviour, and whether edges represent immediate prerequisites.
2. **Derive and prove, 4 hours:** prove the returned topological order satisfies every edge; derive earliest-finish recurrence `F(v) = duration(v) + max F(u)` over predecessors, with empty maximum zero; prove the recurrence by induction over the order; count operations as `O(V + E)` for the relevant passes.
3. **Implement and challenge, 4 hours:** implement cycle detection, topological order, and critical-path times; add a simple modular checksum as an educational consistency check; include duplicate IDs, missing prerequisites, zero-task input, and deliberately corrupted data.
4. **Quantify and report, 4 hours:** assign small discrete duration distributions to a 3–4 task subgraph; enumerate exact completion-time outcomes; simulate the same model and report Monte Carlo error; compare independent draws with a dependent shared-delay case.

**Exit assessment:** defend the proof obligations, explain why `E[max(X, Y)]` generally differs from `max(E[X], E[Y])`, and separate deterministic operation counts from random task duration. Demonstrate a cycle witness and a counterexample to a checksum guaranteeing integrity.

**Rubric:** modelling/contract 20%; correctness and termination arguments 25%; implementation and fault diagnosis 20%; complexity and uncertainty analysis 20%; communication and reproducibility 15%. Recommend 80% overall, with no missing proof or uncertainty explanation. **Visual:** dependency graph with the critical path and completion-time distribution. **Transfer:** build systems, workflow planning, and formal reasoning about a small application.

**Optional extension:** add a fixed worker limit and explain why the previous recurrence ceases to define the full scheduling problem; formulate a constrained optimisation approach after Module 20.

### Module 32 AI capstone a learning pipeline with mathematical checks

**Time:** 16 hours. **Prerequisites:** 14, 18, 26, 27, 28, 29, and 30. **Chinese title:** 人工智能综合项目 具备数学检验的学习流程.

**Problem:** implement and explain a small binary classifier from data generation to an honest final evaluation. Include ill-scaled and nearly dependent features so the mathematics predicts failures that the learner must then repair. No GPU, paid API, or external dataset is required.

**Dataset specification:** generate 1,000 independent examples with seed 7. Draw independent standard-normal latent variables `z1, z2, z3, e1, e2`; set features to `(z1, 100z2, z1 + 0.02e1, z3, e2)`; draw the label from a Bernoulli distribution with success probability `sigmoid(1.5z1 − 2z2 + 0.5z3)`. Use a separate split seed 11 to allocate disjoint 60%/20%/20% training/validation/test sets, preserving class proportions as closely as integer counts permit. Record the random generator and package versions.

**Project stages:**

1. **Define and inspect, 4 hours:** state the generative model and assumptions; split before fitting transformations; fit scaling only on training data; inspect singular values; derive Bernoulli negative log-likelihood and a stated L2 penalty convention.
2. **Derive and implement, 4 hours:** implement stable sigmoid/log-loss and a NumPy logistic model; derive the gradient with dimensions and batch normalisation; verify derivatives numerically on smooth small inputs; compare an unscaled unstable fit with a repaired fit.
3. **Select and diagnose, 4 hours:** compare learning rates and penalties using validation data only; include a constant class-probability baseline; test four required faults: preprocessing leakage, overflowing logits, a missing gradient factor, and a misleading metric under changed class prevalence.
4. **Evaluate and explain, 4 hours:** fix choices before final test evaluation; report log-loss, a chosen threshold metric, and calibration evidence with stated uncertainty assumptions; explain seed variation; provide one complete mathematical trace of a prediction and update.

**Required mathematical appendix:** equations for the generative model, likelihood, objective, and gradient; shapes for every array; a short explanation of Hessian curvature and feature scaling; a rank/PCA interpretation; and an empirical-versus-population-risk statement with limits. Fit a small training-only PCA variant as a comparison, keeping component selection on validation data.

**Exit assessment:** a learner must explain a mismatch between mathematical and numerical gradients, why training data define preprocessing parameters, how regularisation changes the objective, and why test performance is an estimate rather than a general guarantee. Results must include actual generated outputs when the capstone is implemented.

**Rubric:** model/assumptions 15%; derivations and gradient verification 25%; numerical implementation 20%; experimental design and evaluation 25%; reproducibility and explanation 15%. Recommend 80% overall, with all leakage and derivative faults correctly diagnosed. **Visual:** pipeline diagram, training curves, calibration plot, and singular-value plot.

**Optional extension:** build a two-layer network or a three-token attention calculation; derive its backward pass and contrast its numerical behaviour with the linear model. Keep this outside the sixteen-hour core.

## Connections to the existing tutorial series

The CS series introduces mathematics briefly in its planned Module 04; this series supplies the extended foundation. The AI series assumes calculus, linear algebra, and probability at its entry point; these modules supply a guided route to those skills. The mapping below describes mathematical support, and does not change the publication status of any existing module.

| Existing tutorial topic | Mathematics modules | Readiness evidence |
|---|---|---|
| CS computation and contracts | 01–04 | State a predicate and prove a small search invariant |
| CS binary and numeric representation | 01, 08, 29 | Explain arithmetic conventions and rounding limits |
| CS mathematical foundations | 01–05, 21–23 | Read a proof, count a finite sample space, and calculate expectation |
| CS algorithm efficiency and design | 04–07, 24 | Prove correctness, derive operation counts, and state randomised assumptions |
| CS trees and graphs | 03, 04, 07 | Use induction on a tree and provide a traversal certificate |
| CS architecture and Boolean gates | 02, 08 | Build a truth table and reason about arithmetic representations |
| CS databases | 02, 03 | Explain predicates, relations, equivalence, and keys as mappings |
| CS language limits and computability | 02, 04, 06, 07 | Use quantified claims, contradiction, growth comparisons, and state machines |
| AI machine learning foundations | 09–13, 16–19, 21–26, 28 | Derive least squares, calculate a gradient, construct a likelihood, and evaluate a split |
| AI neural networks and backpropagation | 09, 10, 16, 18, 19, 28, 29 | Track tensor shapes, propagate derivatives, and diagnose a failed update |
| AI convolutional networks | 09, 10, 18 | Treat filtering as a linear map and derive shared-weight gradients; convolution notation is introduced in the AI lesson |
| AI recurrent networks | 06, 13, 18, 28 | Trace an unrolled graph and relate repeated Jacobian products to a spectral example |
| AI autoencoders and low-rank models | 12–14, 19 | Explain linear reconstruction and rank constraints |
| AI diffusion and physics-informed models | 17, 18, 21–25 | Understand differential equations, continuous distributions, and derivative-based objectives; specialised stochastic processes are follow-on material |
| AI graph networks | 07, 09, 10, 13 | Represent adjacency, aggregate vectors, and interpret graph-derived matrices |
| AI transformers and attention | 09, 10, 18, 27, 29 | Explain dot-product scores, matrix shapes, softmax, gradients, and stable evaluation |
| AI language-model pretraining | 21–29 | Derive sequence likelihood, cross-entropy, and stochastic updates |
| AI post-training objectives | 18–20, 21–28 | Differentiate objectives and reason about probabilities and constraints; policy-gradient theory needs an additional RL reading |
| AI inference and serving | 06, 10, 14, 29 | Count matrix operations and explain low-rank/precision tradeoffs |

### Follow on subjects

The core prepares learners for these specialised mathematical topics. They are explicitly outside the 32-module workload; include short pointers when an existing AI lesson needs one, rather than implying the foundation has already taught it.

| Subject | Foundation required | Specific next topics |
|---|---|---|
| Complex numbers and Fourier methods | 10, 13, 16, 17, 29 | Complex arithmetic, orthogonal frequency bases, discrete Fourier transform, convolution theorem, and aliasing for signals and CNN analysis |
| Markov processes and reinforcement learning | 07, 13, 19, 21–25 | Transition matrices, stationary distributions, Markov decision processes, Bellman equations, discounted returns, and policy-gradient assumptions |
| Stochastic processes for diffusion models | 17, 18, 21–25 | Brownian motion, stochastic differential equations, score functions, and forward/reverse process conditions |
| Measure theory and advanced probability | 03, 04, 15, 17, 21–24 | Sigma algebras, measurable functions, expectation as integration, and conditions for exchanging limits and expectations |
| Advanced statistical learning and causal inference | 20, 24–30 | Rademacher complexity, PAC-Bayes, identifiability of causal effects, interventions, and assumptions for observational inference |
| Numerical PDEs and scientific machine learning | 10–13, 17–20, 29 | Boundary conditions, discretisation consistency/stability/convergence, sparse systems, and differential-equation residual objectives |

## Recurring examples and lab environment

### Examples used across modules

Use three recurring examples to help learners connect branches of mathematics. Change examples when a topic needs a different model.

| Example | Early appearance | Later use |
|---|---|---|
| Library catalogue | Functions, predicates, relations, counting, and search invariants | Expected search cost and discrete probability |
| Task dependency graph | Relations, induction, recurrences, and graph traversal | CS capstone with duration uncertainty |
| Synthetic sensor/data table | Vectors, rank, least squares, and PCA | Gradients, likelihood, inference, and AI capstone |

Every example states its units, data-generation assumptions, and scale. Illustrative data are labelled synthetic. Do not fabricate a benchmark result, executed output, or statistical conclusion while drafting a lesson.

### Proposed tools

Use Python 3.11 or later, a text editor, and a browser. This is a proposed compatibility baseline matching the existing CS series, not a claim that lab code has been tested. At implementation, pin and test a supported Python/package combination. Use standard-library code for discrete proofs and enumeration; introduce NumPy with Module 09. Plotting uses Matplotlib; SciPy may supply reference solvers/distributions in later modules. Jupyter is optional, and all required labs also run as scripts.

Keep the primary mathematics implementations small and visible. A library result is a reference check after the learner understands the operation. PyTorch and scikit-learn may be optional comparison tools; required labs do not depend on a GPU or training a large model.

For each future lab, record a seed when sampling, expected qualitative behaviour, one numerical check with scale-appropriate tolerance, a deliberate failure variation, and a question explaining the output. Capture outputs by running the exact distributed script in the pinned environment. Give separate errors for mathematical assumptions and software execution.

### Notation policy

| Object | Convention | Notes |
|---|---|---|
| Scalar | `a`, `x`, or `θ` | Declare units/domain when relevant |
| Vector | bold lowercase, column-vector mathematical convention | Explain NumPy one-dimensional arrays separately |
| Matrix | bold uppercase; `X ∈ R^(n×d)` | Rows are examples and columns are features unless stated |
| Index | Mathematical `i = 1, …, n`; Python `i = 0, …, n−1` | Show translation explicitly at first use |
| Norm | Subscript identifies the norm; default Euclidean for vectors | State matrix norms explicitly |
| Gradient | Column gradient of a scalar function | Jacobian entry is output index then input index |
| Random variable | Uppercase `X`; realised value lowercase `x` | Separate random design matrices from fixed observed ones in context |
| Probability | `P(A)` for events; `p(x)` with PMF/PDF identified | Conditioning domain must be clear |
| Expectation | `E[X]` or `E[g(X)]` | State existence and the probability law |
| Logarithm | `ln` or `log` for natural log; `log₂` for bits | Never silently change the base |
| Loss/objective | State sum versus mean and penalty scaling | Different conventions lead to different gradients |
| Asymptotics | State variable, input model, and worst/average/amortised case | Big O need not be tight |

### Starter English and Chinese terminology

| English | Simplified Chinese |
|---|---|
| Proposition / predicate / quantifier | 命题 / 谓词 / 量词 |
| Set / relation / equivalence class | 集合 / 关系 / 等价类 |
| Induction / invariant | 归纳法 / 不变式 |
| Permutation / combination | 排列 / 组合 |
| Recurrence / asymptotic bound | 递推关系 / 渐近界 |
| Vector space / basis / rank | 向量空间 / 基 / 秩 |
| Null space / column space | 零空间 / 列空间 |
| Orthogonality / projection | 正交性 / 投影 |
| Eigenvalue / singular value | 特征值 / 奇异值 |
| Gradient / Jacobian / Hessian | 梯度 / 雅可比矩阵 / 海森矩阵 |
| Convexity / duality | 凸性 / 对偶性 |
| Random variable / expectation | 随机变量 / 期望 |
| Covariance / conditional independence | 协方差 / 条件独立 |
| Likelihood / posterior | 似然 / 后验 |
| Confidence interval / credible interval | 置信区间 / 可信区间 |
| Entropy / cross-entropy | 熵 / 交叉熵 |
| Conditioning / numerical stability | 条件性 / 数值稳定性 |
| Regularisation / generalisation | 正则化 / 泛化 |

Review terminology before translating the first module. Add English parenthetical terms at first appearance so learners can use English documentation and papers; distinguish concept pairs such as confidence/credible intervals consistently.

## Reading catalogue

The links below were checked while preparing this plan on 4 October 2026. The module-to-reading assignments are proposed teaching choices; they are not endorsements by the source authors. Required lesson reading will be narrowed to a named section, lecture, or short page range during authoring. Learners are not expected to complete all of these external courses.

| Key | Primary source | Proposed use |
|---|---|---|
| R1 | [MIT Mathematics for Computer Science](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/) | Discrete definitions, proofs, structures, counting, and probability in 01–08 and 21–24 |
| R2 | [MIT Linear Algebra](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/) | Systems, spaces, projections, eigenvalues, and decompositions in 09–14 |
| R3 | [MIT Single Variable Calculus](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/) | Derivatives, integration, approximation, and infinite processes in 15–17 |
| R4 | [MIT Multivariable Calculus](https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/) | Partial derivatives, chain rules, and multivariable geometry in 18 |
| R5 | [MIT Probabilistic Systems Analysis and Applied Probability](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/) | Probability, random variables, expectation, limit theorems, and inference in 21–25 |
| R6 | [Mathematics for Machine Learning by Deisenroth Faisal and Ong](https://mml-book.com/) | Connections among linear algebra, vector calculus, probability, optimisation, regression, PCA, and SVMs |
| R7 | [Convex Optimization by Boyd and Vandenberghe](https://web.stanford.edu/~boyd/cvxbook/) | Convexity, duality, and optimisation in 19–20 |
| R8 | [An Introduction to Statistical Learning](https://www.statlearning.com/) | Regression, resampling, model assessment, and statistical practice in 25–26 and 30 |
| R9 | [Stanford EE376A Information Theory course outline](https://web.stanford.edu/class/ee376a/outline.html) | Entropy, relative entropy, mutual information, and coding foundations in 27 |
| R10 | [Understanding Machine Learning by Shalev Shwartz and Ben David](https://www.cambridge.org/core/books/understanding-machine-learning/3059695661405D25673058E43C8BE2A6) | Uniform convergence, model selection, SGD, and kernels in 28 and 30; publisher page with chapter catalogue |
| R11 | [NumPy linear algebra reference](https://numpy.org/doc/stable/reference/routines.linalg.html) | API and shape checks for linear algebra labs, especially 09–14 and 29 |
| R12 | [SciPy linear algebra tutorial](https://docs.scipy.org/doc/scipy/tutorial/linalg.html) | Reference solver behaviour and implementation comparisons in 12 and 29 |

The mathematical content and exercise design should be original. Link to external readings and identify borrowed results; follow each source's reuse terms for any reproduced figure or excerpt. Match the existing tutorial series' Ran Wei attribution and CC BY 4.0 licence for original lesson material.

## Files and future authoring structure

### Files created for this planning stage

| File | Role |
|---|---|
| [index.html](index.html) | English course overview with all 32 completed lesson links |
| [index_ZH.html](index_ZH.html) | Matching Simplified Chinese course overview |
| [roadmap.md](roadmap.md) | Original curriculum roadmap retained as a separate document |
| [PLAN.md](PLAN.md) | Detailed curriculum, lesson briefs, routes, assessments, capstones, and delivery requirements |
| [plan.json](plan.json) | Machine-readable module titles, hours, prerequisites, routes, outlines, and current status |

Keep `PLAN.md` and `plan.json` aligned when the curriculum changes. The course builder updates availability from implemented bilingual source modules, leaving their curriculum outlines intact. No unfinished module page should be linked as an available lesson. See `tutorial-sources/math/README.md` in the repository for the local build workflow; this source file is outside the published documentation.

### Implemented source and publication layout

The implementation follows the repository's separation between authoring sources and built HTML. Sources live in `tutorial-sources/math/`; `node tutorial-sources/math/build.mjs` renders every formula and executes every lab. The tree below records the actual layout; each module has one Markdown source per language.

```text
tutorial-sources/math/
  README.md                  Authoring and build instructions
  plan/module_NN.json        Full per-module authoring contracts
  src/en/module_NN.md        Complete English module sources
  src/zh/module_NN.md        Chinese sources with matching section identifiers
  src/figures/en/            Original labelled figures
  src/figures/zh/            Translated figures
  assets/widgets.js         Accessible interactive demonstrations and saved reviews
  assets/style.css          Course styles over the established tutorial base
  labs/module_NN/           Standalone executable Python labs
  build.mjs                 Reproducible HTML, executed labs and asset generation
  validate.mjs              Content, links, maths, output and browser checks
  tools/figures.mjs          Original bilingual SVG generation
  artifacts/                Captured lab outputs, plots and build record
docs/tutorials/math/
  roadmap.md                 Original planning overview
  PLAN.md                    Published curriculum specification
  plan.json                  Roadmap metadata
  index.html                 English lesson overview
  index_ZH.html              Chinese lesson overview
  module_NN_EN.html          Completed English lesson
  module_NN_ZH.html          Completed Chinese lesson
  assets/                    Styles, scripts, maths rendering, and figures
  labs/module_NN/            Downloadable copies of validated lab scripts
```

The original planning `index.md` has been renamed `roadmap.md`, so MkDocs does not generate a second file competing with the course's `index.html`. Source paths, build logic, and the source README are established. Edit source Markdown and metadata, then rebuild; avoid editing generated lesson HTML directly.

Reuse the existing AI/CS visual conventions where appropriate: breadcrumb, language switch, module navigation, sidebar contents, learning outcomes, session checkboxes, collapsible solutions, and quiz feedback. Adapt maths rendering from the existing AI series' KaTeX integration. Use independent progress keys such as `math-series:m18:s2`, shared only between this module's language editions. Plan responsive layouts, keyboard controls, text equivalents for figures, and non-JavaScript worked examples for every widget.

## Production roadmap

The milestones below record the production sequence used after the plan was approved. All module groups and both capstones are now implemented. Learner study hours must not be confused with authoring time; the estimates still require learner pilots.

| Milestone | Work | Completion evidence |
|---|---|---|
| 0 Curriculum and editorial baseline | Finalise scope, dependency records, notation, routes, diagnostic, and terminology | Every route satisfies its prerequisites; module counts and hours reconcile |
| 1 First complete bilingual module | Implement source/build structure, Module 00 resources, Python primer, and Module 01 | English and Chinese Module 01, three executed labs, solutions, quiz, and accessible widget |
| 2 Mathematical reasoning | Complete 02–04 | Logic, relation, and proof exit tasks form a coherent prerequisite checkpoint |
| 3 Discrete CS branch | Complete 05–08 | Counts, recurrences, graphs, and modular examples all have valid arguments and small executable checks |
| 4 Linear algebra | Complete 09–14 | Shape conventions consistent; numerical solves/decompositions verified; PCA fits transformations on training data |
| 5 Calculus and optimisation | Complete 15–20 | Assumptions and differentiability conditions stated; gradient checks and convergence/failure examples executed |
| 6 Probability and statistics | Complete 21–26 | Discrete/continuous branches explicit; sampling assumptions and uncertainty interpretations checked |
| 7 Information and learning | Complete 27–30 | Stable objectives, stochastic updates, numerical failures, and introductory learning claims verified |
| 8 Capstones and whole-series review | Complete 31–32 and audit both language routes | Proofs, reproducible scripts, reports, bilingual parity, cross-links, and final site build |

For a CS-first release, milestone 6's discrete branches of 21–24 may follow milestone 3, then Module 31. For an AI-first release, complete the reasoning branch, linear algebra, calculus, Module 19, probability/statistics, and 27–30; defer the specialised CS branch and Module 20. Preserve the detailed prerequisites when changing production order.

### Per-module authoring checklist

1. Write the complete module contract: outcomes, direct/conditional prerequisites, six lesson sections, exact session activities and minutes, worked examples, lab specifications, exercises, quiz, figure briefs, and reading selections.
2. Draft the English exposition, including derivations and selected full proofs. Check dimensions, signs, domains, normalisation constants, and the difference between a theorem and an intuition.
3. Implement and run the three labs in the chosen environment; capture actual outputs and plots. Include deterministic small checks and meaningful failure variations.
4. Produce original figures and the interactive demonstration; provide keyboard operation, labels, text descriptions, and a worked example that remains usable without scripting.
5. Write all exercises and solutions; check each outcome has at least one written assessment and the exit task directly tests the next prerequisite skill.
6. Review mathematical correctness and teaching order. Audit each named theorem's assumptions and each probabilistic conclusion's sampling model.
7. Translate into Simplified Chinese, preserving identifiers, code, numbers, maths, and semantics; review terminology and layout independently.
8. Build both pages, check local links/anchors and maths rendering, exercise quiz/progress controls, inspect mobile/desktop layouts, and complete the MkDocs build.
9. Change status from `planned` to `available` only when both editions and downloadable labs meet the checklist; update navigation and the public overview in the same release.

### Whole-series completion criteria

The implemented taught content totals **180 main concept sections, 90 executed labs, 360 required exercises, 60 optional extension exercises, and 300 quiz questions** across Modules 01–30. Each module has at least six worked examples and four original figures in both languages. The refresher and preparation pages are counted separately. The two capstones add six executed reference scripts, eight paired figures, generated diagnostic plots, project contracts, mathematical appendices and assessment rubrics.

The finished series must have no prerequisite cycles, no routes depending on unavailable core skills, no links to unfinished modules, and no lab output that was not generated by the distributed code. Both language editions must agree on all mathematical claims and examples. The CS and AI capstones must demonstrate the stated readiness outcomes using actual reports and reproducible artefacts.

**Implementation is complete through Module 32.** Sources, metadata, navigation, original figures and executable reference projects are provided for both editions. The build captures actual outputs and the validator checks content, dependencies, hours, links, formulas, controls and responsive layouts. Study estimates remain provisional until learner pilots; optional extensions remain outside the core budgets.
