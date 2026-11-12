## An operation count is a model of the work {#start}

Two nested loops are both described as “quadratic,” but one executes n squared body steps and the other n(n−1)/2. A measured runtime includes interpreter overhead, allocation, data representation, and the chosen input. An asymptotic bound describes how a particular cost model grows as the size increases. These quantities are connected, but they are not interchangeable.

This module builds exact counts first, then proves their growth and solves recursive cost models. You will state which operation is charged, what input size means, and whether the count is worst case, best case, or aggregate across a sequence. A compact Big O label should be the conclusion of an argument rather than its starting assumption.

**Retrieval check:** expand a finite double sum, use a logarithm to invert a power, and write a complete induction proof. Review [Module 01](module_01_EN.html#s5) and [Module 04](module_04_EN.html#s4) if needed. The core requires those modules; an optional binomial growth argument also uses Module 05. Counts here assume finite inputs and operations that terminate.

## Arithmetic geometric and telescoping sums {#s1}

A **sequence** assigns a value to each permitted integer index. An arithmetic sequence has a constant difference d: $a_i=a_0+id$. Summing n terms indexed zero through n−1 gives $na_0+d\sum_{i=0}^{n-1}i=na_0+d\,n(n-1)/2$. The formula is valid at n=0 because both parts vanish. State the starting index before substituting a familiar sum formula; moving from zero-based to one-based terms can change the constant.

The sum of integers from one through n is n(n+1)/2. Reverse the finite sum and add termwise: each paired term is n+1 and there are n pairs, so twice the sum is n(n+1). Module 04 also proved the formula by induction. The two arguments cover the same declared domain in different ways. Neither depends on extrapolating a plot of successful calculations.

::: worked title="A triangular loop's exact body count"
Let i run from zero through n−1, and for each i let j run from zero through i−1. The inner body runs i times, so the total is $\sum_{i=0}^{n-1}i=n(n-1)/2$. At n=0 or n=1 there are no body steps. If the inner range includes i itself, its length becomes i+1 and the total changes to n(n+1)/2. The index bounds determine the exact formula.
:::

A geometric sequence multiplies by a fixed ratio r: terms $a,ar,ar^2,\ldots$. For n≥0 and r≠1,

$$\sum_{i=0}^{n-1}ar^i=a\frac{1-r^n}{1-r}.$$

To derive it, call the sum S, multiply by r, and subtract. All intermediate powers cancel, leaving $(1-r)S=a(1-r^n)$. Division requires r≠1. When r=1 the sum is na. The n=0 formula gives zero, matching the empty sum. A ratio zero also fits the finite formula; avoid replacing the first term with an ambiguous unexamined expression.

Doubling work across levels gives $1+2+\cdots+2^{h-1}=2^h-1$. Constant work across h levels gives h times that cost. Work halving across levels gives a sum bounded by twice its first term. These three patterns will explain recurrence-tree cases later. They are finite sums; no result about infinite series is being assumed here.

A **telescoping sum** writes terms as consecutive differences, so interior parts cancel. If the terms are $b_{i+1}-b_i$, then $\sum_{i=0}^{n-1}(b_{i+1}-b_i)=b_n-b_0$. Expand three terms to see each cancellation and verify the boundary. The remaining endpoints depend on the exact first and last indices, so changing bounds requires changing the endpoint expression too.

::: worked title="A telescoping sum with explicit endpoints"
For example $1/(i(i+1))=1/i-1/(i+1)$ for i≥1. Summing from one through n gives $1-1/(n+1)$. The factors are nonzero on that domain. At n=0, a separately interpreted empty sum is zero and the same endpoint formula agrees. Partial-fraction rewriting is a useful finite algebraic trick here; no integration is needed.
:::

Sum linearity allows coefficients and separate terms to be combined, but only when the corresponding index domains match. $\sum_i(a_i+b_i)=\sum_i a_i+\sum_i b_i$ uses the same finite index set. If one term is defined only for a smaller range, specify the missing values or split the range. A computational cost model can also add disjoint operation categories, provided the accounting does not charge the same event twice by mistake.

::: check
Compute $\sum_{i=0}^{4}2^i$ and $\sum_{i=1}^{4}1/(i(i+1))$ using their derived forms. Explain why the first has five terms and the second four.
:::
::: answer
The geometric sum is $2^5-1=31$. The telescoping sum is $1-1/5=4/5$. Inclusive mathematical endpoints give the stated term counts; Python stop bounds would need translation.
:::

## Growth rates and logarithm bases {#s2}

Growth analysis compares nonnegative functions as the input size increases. Familiar candidates include constants, logarithms, n, n log n, polynomials, and exponentials. A table gives useful intuition about scale but does not prove an eventual comparison for every large input. The formal definitions in the next section state that eventual obligation and specify its constants.

| n | $\log_2n$ | n | $n\log_2n$ | $n^2$ | $2^n$ |
|---|---|---|---|---|---|---|
| 2 | 1 | 2 | 2 | 4 | 4 |
| 4 | 2 | 4 | 8 | 16 | 16 |
| 8 | 3 | 8 | 24 | 64 | 256 |
| 16 | 4 | 16 | 64 | 256 | 65536 |

::: figure #fig-06-1
The table and growth curves compare mathematical cost functions, not measured seconds. Input size and both axes are labelled; a changed axis scale can alter visual appearance without changing the functions.
:::

Logarithms with different fixed bases greater than one differ by a positive constant: $\log_b n=\ln n/\ln b$. Thus they have the same asymptotic growth class. The base still matters for an exact count. A binary doubling loop and a ternary multiplying loop have different integer iteration counts, even though both have logarithmic growth. Do not remove a base from an exact expression just because it can be ignored in a Theta classification.

Polynomial degree matters asymptotically while constants can dominate small inputs. A count 1000n may exceed n squared at n=10, but beyond n=1000 the quadratic count is larger. The crossover depends on constants and input range. A statement about eventual growth does not promise which implementation is faster for every practical dataset. It describes a model after a sufficiently large threshold.

Exponential growth eventually exceeds every fixed-degree polynomial. An optional proof using Module 05's binomial theorem makes this precise for integer degree k≥0. For n≥2(k+1), $2^n\ge\binom n{k+1}\ge(n/2)^{k+1}/(k+1)!$. Every factor in the binomial numerator is at least n/2. Dividing by $n^k$ gives a lower bound proportional to n, so the exponential-to-polynomial ratio can exceed any fixed constant. The proof uses a fixed k; letting k depend on n would change the claim.

Input size must be defined. A graph algorithm may depend on both vertex count and edge count, and a matrix multiplication on three dimensions. A training procedure may additionally depend on batch size and iteration count. Collapsing all parameters to one symbol without describing their relationship can hide the relevant cost. Later modules will retain shape parameters when counting linear-algebra operations.

Bit length is another size choice. An integer of numeric value N requires roughly log₂N binary digits. An algorithm taking N elementary iterations is exponential in that bit length when N is a power of two. Treating the value and its representation length as the same input size can reverse an efficiency interpretation. For the loop labs n is an explicit count parameter; the charged body steps are not a complete bit-complexity analysis.

Growth also depends on the quantity being bounded. Memory allocation, comparisons, arithmetic operations, and communication may each have different counts. A loop with constant body-entry count can perform large-integer multiplication whose bit cost grows with its operands. The simple unit-cost model is useful when its assumptions match the intended level of analysis, and its limits should be stated rather than hidden.

::: check
Does “logarithm bases do not matter asymptotically” imply $\log_2n=\log_{10}n$ exactly? At n=1000, which linear count exceeds the quadratic count in the example, and what happens beyond the crossover?
:::
::: answer
The logarithms differ by a fixed constant, not equality. At 1000, 1000n and n² are equal; below it the former is larger and above it n² is larger. The eventual comparison does not determine every small-input runtime.
:::

## O Omega Theta and little o with witnesses {#s3}

For eventually nonnegative functions f,g with g positive for all sufficiently large natural n, $f\in O(g)$ means there exist constants c>0 and n₀ such that every n≥n₀ satisfies $f(n)\le c g(n)$. The constants are fixed before considering every sufficiently large n. You may not choose a different c for each input and call that the same Big O proof. We sometimes write f=O(g) as conventional shorthand for membership in this class.

$f\in\Omega(g)$ means some fixed c>0 and n₀ give $f(n)\ge c g(n)$ for all n≥n₀. $f\in\Theta(g)$ means both upper and lower bounds hold, equivalently there are $c_1,c_2>0$ and n₀ with $c_1g(n)\le f(n)\le c_2g(n)$ for every n≥n₀. Big O is an upper bound; Theta is a tight growth-class statement in this two-sided sense.

::: worked title="Explicit constants prove quadratic growth"
For $f(n)=3n^2+7n+2$ and n≥1, the lower bound is $3n^2\le f(n)$. Since n≤n² and 1≤n² on that domain, $f(n)\le3n^2+7n^2+2n^2=12n^2$. Thus $c_1=3,c_2=12,n_0=1$ witness $f\in\Theta(n^2)$. The constants need not be the smallest possible ones; they must be valid and independent of n.
:::

The same f is also O(n cubed), because n²≤n³ for n≥1. That upper bound is correct but weaker. Calling Big O an exact rate would incorrectly treat both descriptions as equalities. Conversely, f=n is O(n²) but not Theta(n²): no positive lower constant times n² can stay below n forever. An upper bound alone does not supply tightness.

**Little o** is stronger than Big O. $f\in o(g)$ means for every ε>0 there is a threshold n₀ such that all n≥n₀ satisfy $f(n)<\varepsilon g(n)$. No single positive multiplicative scale remains necessary: relative to g, f eventually becomes smaller than any chosen fraction. The threshold may depend on ε, while it remains fixed across all later n for that chosen ε.

For n compared with n², choose an integer n₀>1/ε. Then for n≥n₀, $n/n^2=1/n<\varepsilon$, proving n=o(n²). In contrast n² is O(n²) but not o(n²): choose ε=1/2 and the required inequality is impossible. These direct inequality arguments do not assume the calculus limit notation that will arrive in Module 15.

::: figure #fig-06-2
An upper-bound witness fixes c and n₀, then covers every input beyond n₀. Little o instead permits any positive fraction ε and chooses a threshold appropriate to that fraction.
:::

Quantifier order connects the definitions to Module 02. Big O uses “there exist c,n₀, for every later n”; little o uses “for every ε, there exists n₀, for every later n.” Changing the order changes the requirement. A finite graph of f/g may suggest good constants, but a proof must cover the unbounded tail with an inequality or another justified theorem.

Specify which f is being analysed. Worst-case time at size n is the maximum over allowed size-n inputs; best case is the minimum. An average-case count needs a probability distribution over inputs. Each of those functions can separately be O, Omega, or Theta of a comparison function. Big O itself does not mean worst case, and Omega itself does not mean best case. Those labels describe the chosen cost function, while asymptotic symbols describe bounds on it.

Equivalent constants and lower-order terms can be suppressed after proof, but not before the model is clear. If an implementation changes from fixed-width scalars to arbitrary-precision integers or from prebuilt data to on-demand construction, the charged primitive costs may change. Revisit the model rather than carrying an old asymptotic label across a different operation definition.

::: check
Give c and n₀ proving $5n+9\in O(n)$, and explain why this function is also O(n²) without having quadratic Theta growth.
:::
::: answer
For n≥1, $5n+9\le14n$, so c=14,n₀=1 works. Since n≤n², it is also bounded above by 14n². Its positive linear lower and upper bounds give Theta(n), while a positive quadratic lower bound cannot hold eventually.
:::

## Exact loop counts and input-dependent costs {#s4}

Choose a charged operation before counting. The first lab charges one operation for each entry into a selected loop body. It does not separately charge every guard comparison, increment, list access, or Python instruction. This restricted count is useful for understanding loop shapes. A fuller model could add those categories; its exact constants would change, and its growth might also change if the body contains a nonconstant operation.

A rectangular nested loop with n outer iterations and n inner iterations has n² body entries by multiplication. A triangular loop with i inner iterations at outer index i has n(n−1)/2, as derived earlier. Both are Theta(n²) for sufficiently large n, though their exact counts differ and the triangular loop has zero entries at n=1. An asymptotic threshold can exclude those small cases without denying their exact behaviour.

::: worked title="A doubling loop needs a floor and a boundary"
Start i=1 and repeatedly double i while i≤n. For integer n≥1, the visited values are $1,2,4,\ldots,2^h$, where $h=\lfloor\log_2n\rfloor$. The body count is h+1. At n=8 there are four entries; at n=0 the guard fails initially and the count is zero. A statement “the loop runs log₂n times” omits the integer rounding, extra first visit, and zero-input case.
:::

The doubling loop's guard is evaluated once more after the last body entry. If comparisons are the charged operation instead, the exact count is h+2 for n≥1 and one at n=0. Both counts have logarithmic growth on positive sizes. State which one your formula describes; an exact-count mismatch can be a model mismatch rather than a wrong asymptotic argument.

Input-dependent branches require an explicit cost function. First-match search over a nonempty list can use one comparison when the first element matches. If the target is absent or first appears last, it uses n comparisons. The worst-case comparison count is n, the best-case count one for n≥1. An average count cannot be inferred merely from these extremes; it requires a distribution over target presence and position.

A universal worst-case bound describes every allowed input, but its tightness requires at least one family reaching the scale. The search upper bound holds because no position is inspected twice. Absent-target lists witness n comparisons at every size. For a best-case bound, identify inputs attaining the minimum without changing the input domain. A search that assumes success at the first position has a different contract, rather than an improved worst case for general search.

Multiparameter counts remain useful. A loop scanning m rows with n entries per row has mn charged entries, not necessarily n². If m is fixed independently of n, growth in n is linear; if m=n it is quadratic in that shared size. Matrix-based AI workloads frequently need several shape parameters plus iteration count. The analysis should retain them until the intended scaling relationship is declared.

Measured elapsed time is an observation of real execution under a machine, interpreter, input, and measurement scope. Timing array construction inside a supposedly constant-query measurement charges setup that a prebuilt-query model excluded. Cache behaviour, scheduling noise, compiler behaviour, and integer sizes can also change observations. Repeating measurements helps describe variability but does not by itself prove an unbounded asymptotic claim.

Use measurements to investigate a model, not to rename it silently. Report what is included, what input family was used, and which operations were predicted. If the observation disagrees, inspect setup, hidden work, and the cost of primitives before deciding whether the derivation is wrong. Later numerical-computation material extends this discipline to reproducibility and accuracy, as well as speed.

A timestamp returned in nanoseconds does not guarantee that the clock resolves every individual nanosecond. A very short query can receive identical start and end readings and appear to take zero measured time. That is a measurement limitation, not proof of zero work. Batching many queries can make the interval measurable, but the batch also includes its loop and call overhead; report that scope rather than interpreting the quotient as a perfect isolated primitive cost.

The lab keeps short timings visible precisely to make those limits discussable. It reports the best of seven runs, which is a selected observation rather than an average or a distributional guarantee. A stronger empirical investigation would record the environment, use a range of geometrically increasing sizes, separate setup, preserve repeated observations, and compare them with a justified cost prediction. None of those improvements changes the logical difference between observing a finite experiment and proving an eventual bound.

::: check
A query compares only the first entry, but its timer first creates a list of n entries. Is the whole timed operation constant under a model charging list construction per entry? State the query-only and setup-included counts.
:::
::: answer
Query alone has one comparison. Charging n constructed entries plus that comparison gives n+1 charged events, so the whole operation has linear growth in that model. The two scopes answer different questions.
:::

## Recurrences expansion and recursion trees {#s5}

A **recurrence** defines a cost using smaller input costs and work done at the current level. It needs a base condition, an allowed size domain, and a justification from the algorithm. For equal halves, we first restrict sizes to n=2ʰ with h≥0, so halving reaches one exactly. Floors and ceilings for other sizes require a separate argument rather than silently evaluating a fractional problem size.

Consider $T(n)=2T(n/2)+n$ for n>1 and T(1)=1. The two children model two size-n/2 subproblems, and n models nonrecursive work. After one expansion, $T(n)=4T(n/4)+2n$. After j levels, there are $2^j$ children of size $n/2^j$, and their total level work is n. The depth to leaves is h=log₂n.

::: worked title="An exact balanced recurrence solution"
The h nonleaf levels each cost n, and there are $2^h=n$ leaves costing one. Hence $T(n)=nh+n=n(1+\log_2n)$. Verify by induction on h: at h=0 it equals one; substituting the size-n/2 formula gives $2(n/2)(1+\log_2(n/2))+n=n(1+\log_2n)$. Thus the exact power-of-two solution has Theta(n log n) growth for n≥2.
:::

::: figure #fig-06-3
For n=8, the nonleaf levels contain 1, 2, and 4 problems with total work eight each. Eight leaves add another eight, giving T(8)=32 under this base and work model.
:::

The same method solves $T(n)=T(n/2)+n$, T(1)=1. Level work halves, so the nonleaf work is $n+n/2+\cdots+2=2n-2$, with one final leaf: T(n)=2n−1. For four half-size children, $T(n)=4T(n/2)+n$, the level work doubles, giving n(2ʰ−1)=n(n−1) before leaves and n² leaf work. Total T(n)=2n²−n.

These recurrences count a mathematical work model. A program computing the recurrence values with memoisation may evaluate the numerical formula quickly without executing every modelled child operation. The lab's cache avoids repeating identical numerical subproblems; its runtime is not the runtime represented by T. Confusing a model evaluator with the modelled algorithm would invalidate the interpretation of a measured time.

Expansion also handles decreasing-by-one sizes. If $T(n)=T(n-1)+n$, T(0)=0, repeated substitution gives $T(n)=\sum_{i=1}^n i=n(n+1)/2$. The depth is n rather than logarithmic. Treating n−1 as though it were n divided by a fixed constant gives the wrong tree and is outside the equal-ratio theorem below. First draw what the recurrence actually says.

To verify a proposed bound by **substitution**, assume the bound for smaller sizes and show the recurrence implies it for the current size, with valid base coverage. For the balanced two-child recurrence, guessing T(n)≤Cn gives $2C(n/2)+n=(C+1)n$, which does not close the proposed upper bound: the accumulated level work needs the logarithmic factor. For the one-child recurrence, T(n)≤2n does close, while the exact 2n−1 additionally retains the base's correction. Track the smaller-size factors and the nonrecursive work explicitly.

A recurrence also assumes the subproblem count and size are accurate. If the code makes unequal-size calls, performs extra data copying, or stops on an input-dependent condition, revisit the model. A recursion tree based on average balance is not a worst-case proof for an algorithm that can split extremely unevenly. Classifying the exact recurrence comes after deriving it from the intended input family and charged operations.

::: check
Solve $T(n)=T(n/2)+n$ on powers of two with T(1)=1, and substitute n=8. Why is a cached function returning that number not itself required to do that many operations?
:::
::: answer
T(n)=2n−1, giving fifteen. The recurrence value describes modelled algorithm work. A cached evaluator uses arithmetic and reuse to calculate the number and has a different operational cost.
:::

## Master-theorem conditions and amortised analysis {#s6}

For a clear proved special case of the **Master theorem**, suppose $T(n)=aT(n/b)+cn^d$, with a fixed positive T(1), integer a≥1, fixed integer b>1, c>0, d≥0, and sizes n=bʰ. Let p=log_b a. At level j, work is $cn^d(a/b^d)^j$; leaves contribute Theta(nᵖ). Thus a finite geometric sum explains the three cases:

| Comparison | Level pattern | Result |
|---|---|---|
| d<p | Costs grow towards leaves | Theta(nᵖ) |
| d=p | Every nonleaf level has the same scale | Theta(nᵖ log n) |
| d>p | Costs shrink away from the root | Theta(nᵈ) |

If q=a/bᵈ>1, the level sum has the scale of its final levels, and $n^dq^h=n^p$. If q=1, h equal-cost levels produce the logarithmic factor. If q<1, the level sum is bounded above by a constant times its root cost and below by the root itself. The leaf term does not upset those cases. These are conclusions of the tree sum under the stated conditions.

More general formulations replace the pure power with f(n). A common basic version compares f with nᵖ using a polynomial gap: f=O(nᵖ⁻ε), f=Theta(nᵖ), or f=Omega(nᵖ⁺ε) for some ε>0. In the third case it also requires regularity $a f(n/b)\le c_0 f(n)$ for some c₀<1 eventually. State the version and conditions you are applying. The balanced case is not “anything slightly below or above nᵖ,” and the pure-power proof does not automatically cover arbitrary oscillating f.

The borderline recurrence $T(n)=2T(n/2)+n/\log_2n$, T(1)=1, on n=2ʰ uses the extra work only for n≥2. Its nonleaf level work is n/(h−j), so exact expansion gives $T(n)=n(1+H_h)$, where $H_h=1+1/2+\cdots+1/h$. The basic f=Theta(n) balanced case does not apply, and f is not polynomially smaller than n. Derive or use a theorem covering the case instead of forcing it into an inapplicable rule. The exact expression is sufficient for the lab; its further asymptotic simplification is optional.

**Amortised analysis** bounds the total cost of an operation sequence and divides by the number of operations. It needs no probability distribution. A costly operation can coexist with constant amortised cost if other operations are cheap often enough. Worst-case single-operation cost, average-case cost under a distribution, and amortised sequence cost are different statements.

::: worked title="Doubling capacity by aggregate counting"
Start an empty array with capacity one. An append writes its new entry, and when full, doubles capacity and copies the old entries. Over m≥1 appends, copy counts are 1,2,4,… up to the largest old capacity strictly less than m. Their geometric sum is less than 2m. The m new-entry writes give total charged cost less than 3m, so amortised cost is O(1) per append. One resize can still copy Theta(m) entries. This model charges copies and writes, excluding allocation and zero-initialisation; adding linear allocation work changes constants but retains the geometric aggregate argument.
:::

::: figure #fig-06-4
Copy bursts occur at capacities 1,2,4,8,… . Individual appends have different costs, while total copies plus writes across a prefix remain bounded by a constant times its length.
:::

::: widget name=recurrences
Choose one, two, or four half-size children and vary a power-of-two input. Inspect the level counts, leaf contribution, and exact total. At n=8 the totals are fifteen, thirty-two, and one hundred twenty respectively. The worked derivations above explain the calculation without scripting.
:::

An amortised claim must cover every allowed sequence in its model. Here append-only sequences make occupancy increase and trigger capacities geometrically. Adding a shrink-on-every-delete rule could produce repeated resize work unless its thresholds are designed carefully; the append-only proof would not automatically cover arbitrary alternating operations. Identify the operation family before reusing the result.

::: check
Why does a single expensive resize not refute O(1) amortised append cost? Does the argument require uniformly random appends? State the charged total bound.
:::
::: answer
The claim concerns the whole append prefix, whose copies plus writes total less than 3m for m≥1. A single operation may be linear. No randomness is required; the geometric capacity schedule bounds every append-only sequence in this model.
:::

## Common misconceptions {#wrong}

| Symptom | Cause | Repair |
|---|---|---|
| Big O is called an exact runtime or a tight bound | Upper bound confused with equality or Theta | Give explicit witnesses and a separate lower bound |
| Omega is called best case automatically | Bound direction confused with input selection | Define the cost function first |
| A triangular loop is assigned n² exact steps | Inner range ignored | Sum the actual row lengths |
| A recurrence omits the base or copies | Algorithm model incomplete | Derive every nonrecursive category and stop condition |
| Basic Master theorem is forced onto n/log n work | Polynomial-gap/balanced conditions ignored | Expand the levels or use an applicable theorem |
| Fast query timing includes hidden setup | Measurement scope changed | Time and describe the scopes separately |
| An expensive append refutes amortisation | Per-operation worst case confused with aggregate | Bound total copies and writes over a prefix |

## Lab setup and cost accounting {#setup}

Use Python 3.11 or later; no packages are required. See the [Python primer](python_primer_EN.html). The recurrence lab uses `@cache` to reuse numerical results of identical function arguments; it computes a cost value rather than performing the modelled recursion's entire work. The timing lab's numbers vary across builds and machines. Both editions display the same actual captured run. Each lab explanation earns ten points: prediction 3, model interpretation 4, fault diagnosis 3.

## Lab 1 Count three loop bodies {#lab1}

**Fifty minutes:** predict every output for zero, one, four, eight, and sixteen. Run and distinguish rectangular, triangular, and doubling body counts. The reference `bit_length()` agrees with floor(log₂n)+1 for positive integers; at zero the body count is zero. Change the triangular inner stop from i to i+1 and update the exact formula. Then explain how charging guards would change the exact counts without automatically changing their eventual growth.

{{LAB:lab1}}

## Lab 2 Verify recurrence solutions {#lab2}

**Fifty minutes:** predict the n=8 row and derive each full solution with base T(1)=1. Run and compare one, two, and four half-size children. Change the base to two and calculate the new leaf contribution before execution. Preserve powers-of-two input sizes; the script does not implement floor/ceiling analysis for arbitrary n. Explain why memoising the numerical model cannot be interpreted as speeding up every real algorithm represented by that recurrence.

{{LAB:lab2}}

## Lab 3 Diagnose timing and theorem traps {#lab3}

**Fifty minutes:** identify which timing includes list construction, and predict the exact recurrence ratios independently of the measured nanoseconds. A zero or tiny query interval may reflect clock resolution. The borderline work n/log₂n lies outside the basic balanced case; compare the exact harmonic expression instead. Finally predict append copies at m=8 and m=9 and explain why one costly resize is consistent with total charged cost below 3m. Allocation and zero-initialisation are outside that copy/write counter.

{{LAB:lab3}}

## Exercises with complete solutions {#exercises}

Exercises 1–12 take 140 planned minutes and earn five points each; two optional exercises add 25 minutes. State the size domain, charged operation, and bound witnesses. Give bases and a verification argument for every recurrence solution.

::: exercise #e1 level=1 kind=calculation minutes=6
Compute the first five terms of the arithmetic sequence aᵢ=3+2i and their sum. Derive its n-term sum with zero-based indices.
:::
::: solution
Terms are 3,5,7,9,11, sum 35. The n-term sum is $3n+2\cdot n(n-1)/2=n^2+2n$, also zero at n=0.
:::

::: exercise #e2 level=1 kind=calculation minutes=6
Evaluate $\sum_{i=0}^{5}2^i$ and $\sum_{i=1}^{5}(1/i-1/(i+1))$.
:::
::: solution
The first has six terms, $2^6-1=63$. The second cancels to $1-1/6=5/6$. Its denominators are nonzero on the given range.
:::

::: exercise #e3 level=1 kind=calculation minutes=6
Count rectangular and triangular body entries at n=8, with the triangular inner loop `range(i)`. Count the doubling-loop body and guards.
:::
::: solution
Rectangular 64, triangular 28. Doubling visits 1,2,4,8, so four body entries and five guard evaluations. The categories differ and must be labelled.
:::

::: exercise #e4 level=1 kind=conceptual minutes=6
Explain why f=n may be O(n²) without being Theta(n²). Write which bound is missing.
:::
::: solution
For n≥1, n≤n² supplies an upper bound. No fixed c>0 gives n≥c n² for all large n, since that would require n≤1/c. The quadratic lower bound is missing; f is Theta(n).
:::

::: exercise #e5 level=2 kind=proof minutes=15
Give explicit witnesses proving $3n^2+7n+2\in\Theta(n^2)$ for natural inputs.
:::
::: solution
For n≥1, lower bound 3n² and upper bound 12n² follow from n≤n² and 1≤n². Thus c₁=3,c₂=12,n₀=1 suffice. The excluded n=0 case does not affect an eventual bound.
:::

::: exercise #e6 level=2 kind=proof minutes=15
Prove n=o(n²) using the quantified definition, then refute n²=o(n²).
:::
::: solution
For arbitrary ε>0 choose an integer n₀>1/ε. Then n≥n₀ implies n/n²=1/n<ε. For the second claim ε=1/2 makes n²<εn² impossible on positive n, so little o fails.
:::

::: exercise #e7 level=2 kind=proof minutes=15
Derive and verify $T(n)=2T(n/2)+n$, T(1)=1, on powers of two.
:::
::: solution
There are log₂n nonleaf levels, each n work, plus n unit leaves, giving n(1+log₂n). Base one agrees. Substitute the half-size expression: $2(n/2)(1+\log_2(n/2))+n=n(1+\log_2n)$. Induction on the exponent covers the allowed sizes.
:::

::: exercise #e8 level=2 kind=application minutes=13
For an m-by-n rectangular scan, give the body count. State growth in n if m is fixed, if m=n, and if m=n².
:::
::: solution
Count mn. With fixed positive m it is Theta(n); with m=n it is Theta(n²); with m=n² it is Theta(n³). The relationship between dimensions determines the single-parameter classification.
:::

::: exercise #e9 level=2 kind=application minutes=13
Solve $T(n)=T(n-1)+n$, T(0)=0. Explain why the equal-ratio Master theorem does not apply.
:::
::: solution
Expansion gives sum one through n, hence n(n+1)/2 and Theta(n²). The child size is n−1, not n divided by one fixed b>1; depth is linear rather than logarithmic. The formula can be verified by adding the nth term to the previous sum.
:::

::: exercise #e10 level=2 kind=application minutes=13
In the doubling-array copy/write model, compute costs for prefixes of eight and nine appends. Prove a linear total bound and distinguish the ninth operation's cost.
:::
::: solution
At eight, copies 1+2+4=7 and writes eight, total fifteen. At nine, copies add eight, so fifteen copies plus nine writes total twenty-four. In general geometric copies are below 2m and writes m, total below 3m. The ninth operation alone copies eight and writes one, costing nine; constant amortised does not mean every operation costs a constant.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=16
A theorem application treats $2T(n/2)+n/\log_2n$ as the balanced f=Theta(n) case. Diagnose the condition and derive its exact power-of-two form.
:::
::: solution
The ratio f/n=1/log₂n shrinks, so f is not Theta(n), nor does it have a fixed polynomial gap below n. At n=2ʰ each nonleaf level j costs n/(h−j); sum gives nHₕ and leaves n, hence T=n(1+Hₕ) with T(1)=1. Use expansion rather than an inapplicable basic case.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=16
A timer measuring a first-entry query builds an n-entry list first, then reports a linear curve as proof the query is intrinsically linear. Repair the interpretation and explain why a zero short interval is not zero work.
:::
::: solution
The measured scope includes linear setup. Query-only has one comparison on prebuilt data; setup-included charges n entries plus one comparison. A finite timing curve is experimental evidence under that scope, not a universal bound proof. Identical clock readings for a very short call can give zero measured duration because of resolution, while the operation still executes.
:::

::: exercise #e13 level=3 kind=proof minutes=10
Optional: use a binomial lower bound to show a fixed integer-degree polynomial is little o of 2ⁿ. This exercise uses Module 05.
:::
::: solution
For n≥2(k+1), $2^n\ge(n/2)^{k+1}/(k+1)!$. Therefore $n^k/2^n\le2^{k+1}(k+1)!/n$. Given ε>0, choose n above both the domain threshold and that fixed numerator divided by ε. The ratio is then below ε, proving the little-o statement for fixed k≥0.
:::

::: exercise #e14 level=3 kind=proof minutes=15
Optional: prove Hₕ=Theta(log h) for h≥2 by grouping harmonic terms in doubling blocks, and interpret the borderline recurrence.
:::
::: solution
In each full block from 2ʲ through 2ʲ⁺¹−1, there are 2ʲ terms between 1/2ʲ⁺¹ and 1/2ʲ, so the block contributes between one half and one. The number of full blocks is within a constant of log₂h; a final partial block contributes at most one. Thus positive constant multiples of log h bound Hₕ eventually. Since h=log₂n, T=n(1+Hₕ) has Theta(n log log n) growth for sufficiently large power-of-two n. The block argument supplies the needed harmonic estimate without calculus.
:::

## Self check quiz {#quiz}

Nine automatic choices plus a reviewed written explanation make ten points. A bound answer needs the cost function and the constants' scope, not only a familiar growth label.

```quiz
? What does Big O state?
- [x] A fixed constant upper bound relative to g beyond a threshold.
- [ ] Exact elapsed seconds for every input.
- [ ] A tight upper and lower bound automatically.
> Big O is eventual upper bounding. Exact time needs a measurement model and Theta adds the lower-bound obligation.

? Which symbols state both growth bounds?
- [ ] O alone.
- [x] Theta.
- [ ] Little o of itself.
> Theta combines O and Omega. O need not be tight, and a positive function is not little o of itself.

? Are c=12 and n₀=1 valid upper witnesses for 3n²+7n+2 relative to n²?
- [x] Yes, because n and one are at most n² for n≥1.
- [ ] No, c must vary with n.
- [ ] No, witnesses must be the smallest possible constants.
> Fixed valid witnesses suffice. Varying c with n changes the quantified requirement, and optimal constants are unnecessary.

? What is the triangular body count with inner range(i), i=0 through n−1?
- [ ] n² exactly.
- [x] n(n−1)/2.
- [ ] n(n+1)/2.
> The row lengths are zero through n−1. Including the diagonal would give the plus-one formula; the full rectangle gives n².

? Does a different fixed logarithm base change Theta growth?
- [ ] Always changes the class.
- [x] No, bases greater than one differ by a constant factor.
- [ ] No, because all logarithms are exactly equal.
> Change of base gives a positive fixed multiplier. Exact values and rounded loop counts still differ.

? What is T(8) for 2T(n/2)+n with T(1)=1?
- [ ] Fifteen.
- [x] Thirty-two.
- [ ] One hundred twenty.
> Three nonleaf levels each cost eight and leaves add eight. Fifteen and 120 correspond to one and four children under the same work/base model.

? Can the equal-ratio theorem directly handle T(n−1)+n?
- [ ] Yes, choose one fixed b so n/b=n−1 for all n.
- [x] No, its child ratio is not fixed.
- [ ] It proves every decreasing recurrence logarithmic.
> A fixed b cannot express n−1 at all sizes. Expansion gives linear depth and a quadratic sum, so decrease alone does not imply logarithmic growth.

? Constant amortised append cost means what?
- [ ] Every append costs the same fixed amount.
- [x] Total charged cost over a prefix is at most a constant times its length.
- [ ] Appends must be uniformly random.
> Aggregate bounds allow expensive individual resizes and require no probability distribution in the append-only model.

? Worst-case, average-case, and amortised costs are distinguished by what?
- [ ] O means worst, Omega means best, Theta means average.
- [ ] They are always identical.
- [x] Input extremes, a declared probability distribution, and sequence aggregation respectively.
> These define different cost functions; any can then receive asymptotic bounds. Bound direction does not choose the input model.
```

<div class="free-response" data-free-response data-key="math-series:m06:q10">
<label for="q10-response"><strong>Question 10.</strong> Prove 3n²+7n+2 has quadratic Theta growth with explicit constants, then explain why that statement is not an exact runtime in seconds.</label>
<textarea id="q10-response" aria-describedby="q10-review" placeholder="Write your argument here"></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I reviewed both bounds, the threshold, and the cost-model distinction.</label>
</div>

::: answer
For n≥1, $3n^2\le3n^2+7n+2\le12n^2$, so c₁=3,c₂=12,n₀=1 establish Theta(n²). The result bounds a declared count function up to constants beyond a threshold. Seconds additionally depend on the execution environment, operation costs, and measurement scope. Award the point only for a valid two-sided inequality with fixed constants and the interpretation.
:::

## Guided reading {#reading}

**Required, 25 minutes:** use the sums and asymptotic-analysis material in the textbook linked by [MIT Mathematics for Computer Science](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/). Rewrite one bound with explicit quantifiers and provide its constants.

**Required, 11 minutes:** read the recurrence-tree and Master-theorem discussion in [MIT 6.006 Recitation 3](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/1869dbf640ded6b31f1bd369d2001ef5_MIT6_006S20_r03.pdf). Compare its polynomial-work cases with our proved power-of-b model and note the base assumptions.

**Required, 9 minutes:** use the textbook's amortised-analysis selection to identify the total-cost argument and charged events. Contrast it with a worst-case single operation. These selections total forty-five minutes.

**Optional:** inspect the fuller conditions in [MIT Master Theorem practice](https://people.csail.mit.edu/thies/6.046-web/master.pdf), and use [Python's performance-clock documentation](https://docs.python.org/3/library/time.html#time.perf_counter_ns) to interpret units and resolution. The lesson's examples and derivations are original.

## Review and readiness for graph analysis {#summary}

Finite sums turn exact iteration patterns into formulas. Asymptotic definitions compare those formulas with fixed witnesses beyond a threshold. Recurrences encode smaller calls and nonrecursive work; tree expansion explains the cost at each level and the leaves. Theorems summarise patterns under conditions, while aggregate analysis bounds an operation sequence rather than each individual step.

**Exit task:** derive triangular and doubling body counts, prove a Theta statement with constants, solve and verify the balanced recurrence, and explain an expensive append within a linear prefix bound. Use exercises 60, lab explanations 30, and quiz 10. Keep size, primitive operations, input model, and measured scope explicit in every answer.

Module 07 analyses graphs using both structure and cost. Before it, explain why a scan of every vertex and every stored adjacency entry has a count depending on both quantities. A graph's edge count is another parameter, not automatically its vertex count squared.

## Notation and bilingual terms {#terms}

| Term or symbol | Meaning | 中文 |
|---|---|---|
| Arithmetic / geometric / telescoping sum | Constant differences / ratios / cancelling differences | 等差 / 等比 / 望远镜求和 |
| O / Omega / Theta / little o | Upper / lower / two-sided / arbitrarily small relative bound | 大 O / Omega / Theta / 小 o |
| Witness c,n₀ | Fixed bound scale and threshold | 常数与阈值见证 |
| Cost model | Input size and charged operations | 成本模型 |
| Worst / best / average case | Maximum / minimum / distributional cost | 最坏 / 最好 / 平均情况 |
| Recurrence / recursion tree | Smaller-cost equation / level accounting | 递推 / 递归树 |
| Master theorem | Equal-ratio recurrence cases under conditions | 主定理 |
| Amortised cost | Aggregate cost per operation in a sequence | 摊还成本 |
| Clock resolution | Smallest meaningful timing scale | 时钟分辨率 |
