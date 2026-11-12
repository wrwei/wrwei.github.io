## A formula is a small specification {#start}

Imagine an application that scores the first four results of a search. One developer starts counting at zero; another starts at one. One returns a total; another returns an average. Both implementations run, and both produce numbers, but they answer different questions. Before deciding which is correct, we need a precise description of the intended computation.

Mathematical notation gives us that description. It names the objects involved, says which inputs are allowed, and describes the relationship between an input and its result. A formula becomes useful when you can read those commitments. Recognising a symbol without understanding its role is insufficient: the meaning of a sum changes when its bounds change, and the meaning of a function changes when its domain changes.

Our running task is deliberately small. Given a nonnegative integer $n$, add the first $n$ positive odd integers. For $n=4$, the terms are $1,3,5,7$ and the result is $16$. For $n=0$, there are no terms and the result is $0$. We will express this task as a formula, translate its indices into Python, and distinguish a few successful executions from a statement about every valid input.

Along the way, keep three questions beside each expression: **What kind of object is this? Which values are permitted? What must the result mean?** The same questions will later help you read a loss function, a probability model, a matrix transformation, or an algorithm's cost. This module establishes the language; later modules develop proofs and the more specialised mathematics.

Before the labs, use the [Python primer](python_primer_EN.html). If school algebra feels uncertain, try the [entry diagnostic](diagnostic_EN.html) and the [optional refresher](module_00_EN.html). Neither resource is a gate: use it to identify what needs practice.

## Mathematical objects and number systems {#s1}

A mathematical **object** is something we can describe and reason about: a number, an ordered pair, a set, a function, or a sequence. The operations that make sense depend on the object. You can add two real numbers, but a library catalogue and a temperature are different kinds of objects. A programming language may allow many representations; the mathematical description supplies the meaning.

A **definition** gives a term its intended meaning. In this series, we define the natural numbers to include zero: $\mathbb{N}=\{0,1,2,\ldots\}$. A different book may reserve that symbol for $\{1,2,\ldots\}$. Neither convention is universally compulsory; declare the convention before using it. We write $\mathbb{N}_{>0}$ when we specifically require a positive integer. The distinction matters when zero means an empty input, an initial counter, or an invalid count.

An **assumption** specifies the setting in which an argument or calculation applies. “Let $n\in\mathbb{N}$” permits zero and excludes $2.5$. A **claim** is a statement to examine, such as “the sum of the first $n$ odd integers is $n^2$.” That claim concerns every permitted $n$; defining the sum does not make the claim true automatically. A **theorem** is a claim established by a proof from stated assumptions and accepted rules. Module 04 will develop proof methods systematically.

The main number systems form a useful hierarchy. The integers $\mathbb{Z}$ add negative whole numbers. The rationals $\mathbb{Q}$ contain fractions $p/q$ with integers $p,q$ and $q\ne0$. The reals $\mathbb{R}$ also contain irrational quantities such as $\sqrt{2}$. A decimal representation is a way to write a number, not a new number system: $0.5=1/2$ is rational, whereas the infinite decimal expansion of $\sqrt{2}$ does not terminate or repeat.

| System | Examples | Typical role |
|---|---|---|
| $\mathbb{N}$ | $0,1,4$ | Counts and nonnegative indices |
| $\mathbb{Z}$ | $-3,0,7$ | Signed differences and integer positions |
| $\mathbb{Q}$ | $1/3,-7/2,0.125$ | Exact ratios and proportions |
| $\mathbb{R}$ | $\sqrt{2},\pi,1/3$ | Measurements and continuous models |
| $\mathbb{C}$ | $2+3\mathrm{i}$ | A later extension for rotations and spectral methods |

Membership and containment use different symbols. The statement $3\in\mathbb{N}$ says that one object belongs to a set. The statement $\mathbb{N}\subseteq\mathbb{Z}$ says that every element of the first set also belongs to the second. We need this small amount of set language to declare domains; Module 03 will study set operations in depth.

::: figure #fig-01-1
The natural numbers, integers, rationals, and reals are nested. The labels give examples introduced at each level; the boxes represent inclusion, not a measurement of how many numbers each set contains.
:::

::: worked title="Classify a value without confusing its representation"
The value $-6/3=-2$ is an integer, a rational, and a real, but it is not natural under our convention. The value $0$ belongs to all four systems. The finite decimal $1.414$ is the rational $707/500$; it is an approximation to $\sqrt{2}$, not another exact representation of $\sqrt{2}$.

A count of records must be a natural number. A measured voltage may be modelled as a real number, although a computer stores a finite approximation. Choosing the real-number model does not imply that every real value has an exact machine representation.
:::

The complex numbers have the form $a+b\mathrm{i}$, where $a,b\in\mathbb{R}$ and $\mathrm{i}^2=-1$. This is a preview, not a prerequisite for the module's labs. A real number is the special case with $b=0$. Complex numbers will matter in spectral and Fourier methods; for now, our calculations use real numbers and integer indices.

When a formula uses a letter, declare its role rather than guessing from the shape of the letter. A **variable** may range over permitted values; a **parameter** is held fixed while a particular operation is studied; a **constant** has a specified value in the current setting. These roles are contextual. In $f_a(x)=ax+1$, we may treat $a$ as a parameter and $x$ as the input. Later, fitting $a$ from data makes it the quantity we vary.

::: check
A record count is stored as the numeric value `4.0`. Does that representation change the mathematical count into a non-integer? Would `4.5` be an admissible count?
:::
::: answer
The value $4.0=4$ is mathematically an integer, although a Python float and an integer are different software representations. A contract may require the integer representation explicitly. The value $4.5$ is not an integer and is not an admissible count. Keep the mathematical domain and the software input-type policy distinct.
:::

## Symbols equality intervals and indices {#s2}

The symbol $=$ asserts that two expressions denote the same value. It is symmetric: if $a=b$, then $b=a$. It does not mean “do the next step” or “store a new value.” The symbol $\ne$ asserts inequality. The relations $<$ and $\le$ compare ordered real values; $x\le3$ includes the boundary $3$, while $x<3$ excludes it. Read a chain such as $0\le x<1$ as two simultaneous conditions.

In mathematics, $x=x+1$ has no real solution: subtracting $x$ would give $0=1$. In Python, `x = x + 1` evaluates the expression on the right using the current value and assigns the result to the name on the left. Python uses `==` for an equality comparison. A mathematical text may use $x:=3$ or “define $x$ to be 3” to distinguish a definition from an equation to solve. These notational differences express different operations.

Order of operations is another part of meaning. Exponentiation is evaluated before a leading minus in the conventional expression $-3^2=-(3^2)=-9$. Parentheses change the base: $(-3)^2=9$. A fraction bar groups its numerator and denominator; writing $1/(x-2)$ in code preserves that grouping. The code `1/x-2` represents a different expression. When translating a formula, add parentheses for clarity even if the language's precedence would give the same answer.

An **interval** specifies a range of real inputs. Square brackets include an endpoint; round brackets exclude it. Thus $[0,1]$ includes both boundaries, $(0,1)$ includes neither, and $[0,1)$ includes only zero. Infinity is not a real endpoint that can be included, so we use $(0,\infty)$ for positive real numbers. An interval such as $[0,4]$ is not the same as the five-element set $\{0,1,2,3,4\}$: the interval also contains $1/2$ and $\sqrt{2}$.

**Absolute value** measures distance from zero: $|x|=x$ when $x\ge0$ and $|x|=-x$ when $x<0$. It is always nonnegative. This is why $|-3|=3$, rather than $-3$. A condition $|x|<2$ means that $x$ lies less than two units from zero, equivalently $-2<x<2$. This way of writing a distance will later appear in approximation errors and tolerances.

::: worked title="Translate a boundary condition"
A score is accepted when $0\le s<1$. The corresponding test is `0 <= s < 1`. The values $0$ and $0.5$ satisfy it; $1$ and $-0.1$ do not. Replacing `< 1` with `<= 1` changes the contract at a boundary, even if a typical dataset never happens to contain that value.
:::

Subscripts label components or terms. For a sequence $a_0,a_1,a_2$, the symbol $a_2$ denotes the term labelled two; it is not the product $a\cdot2$ and is not the square $a^2$. Superscripts often mean powers, but their meaning is also declared by context: a later text may write $x^{(t)}$ for an iterate. Parentheses and explanations prevent the two meanings from being confused.

Our odd-number task uses $a_i=2i+1$ for integer indices $i=0,1,\ldots,n-1$. With $n=4$, the indices are $0,1,2,3$ and the terms are $1,3,5,7$. There are four terms even though the final index is three. Starting at $i=1$ without changing the formula would start at $3$ and describe a different sequence.

The notation $\sum_{i=0}^{3}(2i+1)$ means “substitute each permitted integer index, then add the terms.” It expands to $(2\cdot0+1)+(2\cdot1+1)+(2\cdot2+1)+(2\cdot3+1)=16$. The large Greek sigma is an aggregation instruction. Section 5 will examine its scope and nested forms; you already know enough to trace Lab 1.

::: note
Mathematical summation bounds are inclusive. Python's `range(start, stop)` excludes `stop`. To express integer indices from zero through three, use `range(4)`; to express one through four, use `range(1, 5)`. The official [Python range tutorial](https://docs.python.org/3/tutorial/controlflow.html#the-range-function) explains the convention.
:::

Distinguish exact equality from approximation. Writing $\sqrt{2}\approx1.414$ acknowledges a difference. A displayed decimal rounded to three places is not evidence that the underlying values are exactly equal. The labs use integer arithmetic for exact sums and explicit tolerances where floating-point calculations are involved. Module 29 will explain how to choose numerical comparisons in more demanding calculations.

::: check
Translate $i=1,2,\ldots,4$ into Python `range` notation. Explain the difference between $a_2$ and $a^2$, and between $(0,1]$ and $\{0,1\}$.
:::
::: answer
Use `range(1, 5)`. The first expression labels a term or component; the second squares the value $a$. The interval contains every real value greater than zero and at most one, including $1/2$ but excluding zero. The finite set contains exactly zero and one.
:::

## Functions domains and composition {#s3}

A **function** assigns exactly one output to each input in its declared **domain**. We write $f:D\to C$ to name its domain $D$ and **codomain** $C$. Every output must belong to $C$, but not every element of $C$ needs to be produced. The set of outputs that are actually produced is the **image** $f(D)=\{f(x):x\in D\}$. This distinction affects whether an inverse exists and whether a proposed output can ever occur.

A formula is one way to describe a function. It is not the whole specification: the same expression with different domains can describe different functions. The rule $f(x)=x^2$ on all real inputs has image $[0,\infty)$. On the domain $\{0,1,2\}$ it has image $\{0,1,4\}$. In both cases, we could choose $\mathbb{R}$ as the codomain, but the unused values in that codomain are not outputs of the function.

::: figure #fig-01-2
The mapping $f(x)=2x+1$ on the domain $\{0,1,2\}$ produces $\{1,3,5\}$. The declared codomain also contains $9$, which is not attained. One arrow leaves each input; an unused codomain value is permitted.
:::

Domain restrictions may come from an expression or from the problem. The reciprocal $r(x)=1/(x-2)$ cannot accept $x=2$ as a real input because division by zero is undefined. A real square-root function requires a nonnegative argument. A count-based function may exclude negative inputs even when its algebraic formula could be evaluated there. Declare the restriction that belongs to the problem before relying on a formula's mechanical evaluability.

A function can also be **piecewise**. For example,

$$
h(x)=\begin{cases}2x+1,&x<0,\\x^2,&x\ge0.\end{cases}
$$

The conditions select the applicable rule. They must assign one result to every input in the domain. Here every real number belongs to exactly one branch, including the boundary $x=0$. Overlapping branches with inconsistent values would fail to define a function; a missing branch would leave part of a proposed domain uncovered.

::: worked title="Evaluate a piecewise function at its boundary"
The first branch gives $h(-2)=2(-2)+1=-3$. The second gives $h(3)=9$ and $h(0)=0$. We do not use the first branch at zero: its condition is strict. A Python implementation uses `if x < 0: return 2*x + 1` followed by `return x*x`. Testing the boundary is part of checking the mathematical specification.
:::

**Composition** means applying one function to the output of another. The notation $(f\circ g)(x)=f(g(x))$ places the outer function on the left, but evaluation begins with $g$. An input is valid only when it belongs to the domain of $g$ and the intermediate output belongs to the domain of $f$. If all outputs of $g$ lie in $f$'s domain, the composition is defined on all of $g$'s domain. Otherwise, restrict the composition to the inputs that satisfy both checks.

::: worked title="Composition order changes the result"
Let $f(t)=2t+1$ and $g(t)=t^2$, both with real domain. Then

$$f(g(x))=2x^2+1,\qquad g(f(x))=(2x+1)^2.$$

At $x=3$, the first produces $g(3)=9$, then $f(9)=19$. The second produces $f(3)=7$, then $g(7)=49$. These are different functions. Composition generally cannot be reordered simply because both rules accept the same types of input.
:::

::: figure #fig-01-3
The two routes start with the same input and use the same rules, yet produce different outputs. Read the arrows in evaluation order rather than reading the written composition from left to right.
:::

Suppose instead that $f(t)=\ln(t-1)$ and $g(x)=x^2$. The outer rule requires $t>1$, so the composition requires $x^2>1$, or $x<-1$ or $x>1$. Although the inner square accepts zero, the composition does not. Checking only the original input against the inner domain misses the failure at the intermediate value.

::: widget name=composition
Choose two rules, change the order, and enter an input from $-4$ to $4$. First reproduce $19$ and $49$ at $x=3$. Then choose $f(t)=\ln(t-1)$ and $g(t)=t^2$; compare $x=0$, $x=1$, and $x=2$. The plot shows only values inside its displayed vertical range. An absent point can mean an invalid domain or a value outside the visible range; inspect the calculation message.

Without JavaScript, use the worked calculations above: $f(g(0))$ is undefined, $f(g(1))$ is undefined, and $f(g(2))=\ln3$ in the logarithmic example.
:::

An **inverse function** reverses a mapping uniquely. The inverse of $f(x)=2x+1$ on $\mathbb{R}$ is $f^{-1}(y)=(y-1)/2$: substituting it in either direction restores the original value. The notation $f^{-1}$ denotes the inverse mapping, not the reciprocal $1/f$. A square on all real inputs has no inverse function to recover the input: $2$ and $-2$ both produce $4$. Restricting both the square's domain and codomain to $[0,\infty)$ gives the inverse $\sqrt{y}$.

Do not infer that an implementation is a mathematical function of its displayed argument alone. A procedure that reads a clock, a mutable global variable, or a random generator may return different results on repeated calls with the same explicit input. Include the additional state in the model when you need a deterministic mapping. Later probability modules will model random outputs directly.

::: check
For $f(t)=1/(t-2)$ and $g(x)=x+1$, state the domain and formula of $f(g(x))$. Does checking that $g$ accepts the input suffice?
:::
::: answer
The composition is $1/(x-1)$, defined for real $x\ne1$. At $x=1$, the inner rule is valid but produces $2$, which the outer rule rejects. Both the original input and the intermediate output need domain checks.
:::

## Powers logarithms and growth {#s4}

Powers describe repeated multiplication when the exponent is a positive integer. Thus $a^3=aaa$. For a nonzero base, the zero power is $a^0=1$ and a negative integer power is $a^{-k}=1/a^k$. The restriction on the base matters: a negative power of zero would require division by zero. Expressions such as $0^0$ have context-specific conventions; this module does not assign them a general real-valued interpretation.

Within their valid domains, powers obey $a^r a^s=a^{r+s}$ and $(a^r)^s=a^{rs}$. For positive real bases these rules extend naturally to real exponents. When a base is negative and an exponent is non-integer, the real-domain question becomes more delicate: $(-1)^{1/2}$ is not real. Do not apply a positive-base identity to every possible expression merely because the symbols look similar.

Exponential functions fix the base and vary the exponent. In $2^x$, $x$ is the input. This differs from the power function $x^2$, whose base varies and whose exponent is fixed. At $x=2$ both yield $4$, but at $x=3$ they yield $8$ and $9$, and at $x=4$ both again yield $16$. A few coincidences do not make the functions identical. The plot in Lab 2 lets you compare them on a declared interval; their eventual growth is studied more carefully in Module 06.

A **logarithm** asks which exponent would produce a positive value. For a real base $a>0$ with $a\ne1$, $\log_a x=y$ means $a^y=x$, with $x>0$. The function is the inverse of $a^x$ on the corresponding real domain and positive codomain. The natural logarithm $\ln x$ uses the base $e$, a positive irrational constant approximately $2.71828$. In this series, an unqualified mathematical $\log$ means the natural logarithm unless a different base is stated.

The domains are part of these identities. For any real $y$, $\ln(e^y)=y$. For positive $x$, $e^{\ln x}=x$. The second expression is undefined as a real calculation at $x=0$ or at a negative input. A calculator error there is not a random software inconvenience: it reflects the domain of the specified real function.

::: worked title="A shifted logarithm has a shifted domain"
Let $q(x)=\ln(x-1)$. The argument of the logarithm must be positive, so $x-1>0$, hence $x>1$. Its domain is $(1,\infty)$, not $(0,\infty)$. We obtain $q(2)=\ln1=0$ and $q(1+e)=1$. At $x=1$, the argument is zero and the expression is undefined over the reals.
:::

For positive real $u,v$, logarithms convert multiplication into addition:

$$\ln(uv)=\ln u+\ln v,\qquad \ln(u/v)=\ln u-\ln v.$$

The multiplication identity follows from the exponential rule: writing $u=e^r$ and $v=e^s$ gives $uv=e^{r+s}$, so its natural logarithm is $r+s$. The arguments and the quotient must remain in the valid domain. A corresponding real-power identity is $\ln(u^r)=r\ln u$ for $u>0$. These relationships will later turn products of independent probabilities into sums of log-likelihoods.

There is no corresponding general identity for addition. At $u=v=1$, $\ln(u+v)=\ln2$ is positive, while $\ln u+\ln v=0$. One valid counterexample disproves a claimed identity over all positive inputs. It does not establish a replacement formula; the product identity needs its own explanation.

::: worked title="Change the base without changing the function's information"
For $a>0$, $a\ne1$, and $x>0$,

$$\log_a x=\frac{\ln x}{\ln a}.$$

To see this, let $y=\log_a x$, so $a^y=x$. Taking natural logarithms gives $y\ln a=\ln x$; divide by $\ln a$, which is nonzero because $a\ne1$. Thus $\log_2 8=\ln8/\ln2=3$. The ratio, rather than either rounded decimal alone, expresses the exact relationship.
:::

Growth comparisons need an input range and a purpose. Multiplying $\ln n$ by the positive constant $1/\ln2$ changes its numeric values but not its broad growth pattern as $n$ increases. In a coding or information calculation, the base still matters because the units change: base-two logarithms express bits, while natural logarithms express nats. We will return to these units in information theory.

A graph is evidence about its displayed window, not a proof about all positive inputs. An exponential can appear smaller than a polynomial over a limited range and later grow faster. Also check the axes: a logarithmic axis changes the spacing of plotted values. Lab 2 uses shared ordinary axes so you can inspect the values directly. A curve leaving the visible rectangle has not ceased to exist.

::: check
Which inputs are valid for $\ln(3-x)$? Does $\ln(a+b)=\ln a+\ln b$ hold for every positive $a,b$? Explain with a calculation rather than a slogan.
:::
::: answer
Require $3-x>0$, so $x<3$. For the proposed identity, choose $a=b=1$: its left side is $\ln2>0$ and its right side is $0$. Both sides are defined, so this is a valid counterexample.
:::

## Finite sums products and scope {#s5}

A finite sum combines terms over a declared index range. The summation symbol binds the index inside its expression: in $\sum_{i=1}^n a_i$, the letter $i$ takes each integer value from one through $n$, while $n$ remains a parameter controlling the range. An occurrence of a letter outside that binding has its own meaning. This is the mathematical counterpart of a loop variable with a specified scope.

To read a sum reliably, identify four pieces: the index name, its start, its end, and the term being evaluated. Then expand a small case before trying to simplify. For example,

$$\sum_{i=1}^{4}(i+2)=(1+2)+(2+2)+(3+2)+(4+2)=18.$$

This expression contains four terms. Neither the index nor the term is multiplied by the upper bound as a shortcut. Replacing the sum with $4(4+2)=24$ would incorrectly use the final term four times.

The index is a **bound** or **dummy** variable. Renaming it consistently does not change the sum: $\sum_{i=1}^4 i^2=\sum_{j=1}^4 j^2$. But a rename must not capture a variable already doing another job. In $\sum_{i=1}^n(x+i)$, $x$ is free and $i$ is bound. Renaming the bound index to $x$ without changing the original free variable would silently alter the expression. Choose distinct names, just as you would avoid overwriting a parameter in code.

Finite sums can be rearranged and distributed using ordinary addition. For constant $c$,

$$\sum_{i=1}^n(ca_i+b_i)=c\sum_{i=1}^n a_i+\sum_{i=1}^n b_i.$$

Expand both sides to see each term appear once. This is a property of the addition and multiplication used here; it is not evidence that every function satisfies $f(a+b)=f(a)+f(b)$. Infinite sums require further convergence conditions before similar rearrangements are justified. The present section concerns finite sums only.

The **empty sum** is zero. This convention means that adding no contributions leaves an accumulated total unchanged. In our task, $n=0$ makes the range from zero to $n-1$ empty. There is no final term with a negative index to evaluate. The result is defined by the aggregation rule, not by pretending that a nonexistent term has the value zero.

A finite product uses $\prod$ instead of $\sum$. For example, $\prod_{i=1}^4 i=1\cdot2\cdot3\cdot4=24$. The **empty product** is one, because multiplying by no factors leaves a product unchanged. Setting it to zero would make every ordinary product vanish whenever it was split into a nonempty part and an empty part. These two identity values explain Python's `sum([])` and `math.prod([])` results.

::: worked title="Express the same four odd terms with different index conventions"
Starting at zero gives $\sum_{i=0}^{3}(2i+1)=16$. Starting at one requires a changed term: $\sum_{j=1}^{4}(2j-1)=16$. The translation is $j=i+1$. Keeping both the old term and the new start would give $3+5+7+9=24$, which is a different task.
:::

A **double sum** has two aggregation instructions. In

$$\sum_{i=1}^{2}\sum_{j=1}^{3}(10i+j),$$

fix the outer index $i$, complete the inner sum over $j$, and then add the inner results. At $i=1$, the terms are $11,12,13$ and total $36$. At $i=2$, they are $21,22,23$ and total $66$. The whole sum is $102$. There are six terms because each of two outer values has three inner values.

::: figure #fig-01-4
The rectangular index grid makes all six terms visible. A row corresponds to one outer index; adding the row totals completes the outer sum. This is an indexing diagram, not a prerequisite in matrix algebra.
:::

Because this range is a finite rectangle, summing columns first gives the same result: $(11+21)+(12+22)+(13+23)=32+34+36=102$. A nonrectangular range needs more care. In $\sum_{i=1}^3\sum_{j=1}^i j$, the inner upper bound depends on $i$. The rows contain $1$, then $1,2$, then $1,2,3$, for a total $10$. Simply switching the two written summation symbols without translating the valid index pairs changes the range.

The variable remaining after a sum tells you what kind of output it defines. In $s(x)=\sum_{i=1}^3(x+i)$, the bound index disappears after aggregation, but $x$ remains as the function input. Expanding gives $s(x)=3x+6$. In $t_j=\sum_{i=1}^2 a_{ij}$, $j$ remains free and labels which column total is being described. These distinctions will prevent shape and axis mistakes when arrays appear in Module 09.

To translate the rectangular double sum, use `range(1, 3)` for the outer indices and `range(1, 4)` for the inner ones. To translate the triangular example, use `range(1, 4)` outside and `range(1, i + 1)` inside. Check a tiny example and an empty range before trying a large input. A large, plausible result does not expose which indices were omitted.

::: check
Expand $\sum_{i=0}^{2}\sum_{j=1}^{2}(i+j)$. Which symbols are bound? What would remain free in $\sum_{i=0}^{2}(x+i)$?
:::
::: answer
The rows are $1+2$, $2+3$, and $3+4$, so the total is $15$. Both $i$ and $j$ are bound in the double sum. In the second expression, $i$ is bound and $x$ is free; expansion gives $3x+3$.
:::

## Contracts claims and translation into code {#s6}

A mathematical **contract** states what inputs are allowed and what relationship the result must satisfy. For the odd-number task, an input is a nonnegative integer $n$. The output is the integer total

$$S(n)=\sum_{i=0}^{n-1}(2i+1),$$

with the empty sum interpreted as zero. The input is not modified. Negative counts, fractional counts, and a request to average rather than total the terms are outside this specification. A separate software policy determines how invalid inputs are handled; the labs raise a clear `ValueError`.

Break the translation into explicit decisions. The mathematical count $n$ becomes a Python integer. The inclusive range ending at $n-1$ becomes `range(n)`. Each term becomes `2 * i + 1`; multiplication needs its own operator in code. The total starts at zero and receives one term per iteration. This describes the computation more faithfully than copying symbols into a language that interprets them differently.

::: worked title="Trace the contract before running the program"
For $n=4$, the successive indices are $0,1,2,3$. The terms are $1,3,5,7$ and the running totals are $1,4,9,16$. For $n=0$, there are no iterations and the initial total $0$ is already the required output. For $n=1$, one iteration contributes the term at index zero, producing $1$.

The trace checks the boundary cases that often reveal an incorrect start or stop. It does not prove the program correct for all possible nonnegative counts. We will later use an invariant to make that general argument.
:::

The formula defining $S$ and the claim $S(n)=n^2$ have different roles. The definition tells us what to compute. The identity claims that an apparently different expression gives the same value for every valid $n$. A test at $n=4$ confirms one case. To establish the general identity, one can use induction in Module 04 or an algebraic finite-sum argument like the optional exercise at the end of this module.

Disproving a universal claim is often cheaper than proving one. To refute “every real function is additive,” choose $f(x)=x^2$, $a=2$, and $b=3$. Then $f(a+b)=25$ but $f(a)+f(b)=13$. Both inputs and all intermediate values lie in the declared domain, so the counterexample is valid. A supposed counterexample using an undefined logarithm would not be valid evidence about an identity stated only for positive arguments.

Distinguish three possible faults. A **specification fault** means the formula describes the wrong task: an average where a total was required. A **translation fault** means the program implements the wrong expression: `range(1, n)` where `range(n)` was required. A **numerical fault** means the machine arithmetic does not sufficiently approximate the intended calculation: an overflowing exponential or an unsuitable equality check. Different faults require different repairs.

When an AI paper writes an objective such as $L(\theta)=\frac1n\sum_{i=1}^n\ell_i(\theta)$, these basic skills still apply. The parameter $\theta$ is free; $i$ is bound; $n$ is a positive count because division by zero would make the average undefined; and changing a sum to a mean changes its scale. You do not yet need to know how to minimise the objective to read its declared relationship. Differentiation and optimisation will supply those later steps.

Do not add a case to a formula silently. If the task later needs $n=0$ to return “no score” rather than zero, update the contract and its tests. If a function must accept an array instead of a scalar, state its new input and output shapes. Mathematical precision is useful precisely because it makes these choices visible enough to discuss and verify.

::: check
Why is `sum(2*i+1 for i in range(1,n))` inconsistent with the contract? Give the smallest positive input that exposes the mistake.
:::
::: answer
It omits index zero, whose term is $1$. At $n=1$ the faulty range is empty and returns $0$, while the contract requires $1$. At $n=0$ both happen to return zero, so the empty case alone would miss the fault.
:::

## Common misconceptions {#wrong}

| Symptom | Cause | Repair |
|---|---|---|
| “The count is 4, so the last zero-based index is 4” | Confusing a count with a label | Write the index list `0,1,2,3` |
| An outer function fails after a valid inner call | Checking only the original input | Check the intermediate value against the outer domain |
| A codomain value is assumed reachable | Confusing codomain with image | Compute the attained values or describe the image |
| A claim is accepted after a few examples | Confusing evidence with proof | State the quantifier and seek an argument or a valid counterexample |
| Logarithms are distributed over addition | Applying the product rule to a different operation | Compare both expressions at positive inputs such as `1,1` |
| “The plotted curve ends here” | Confusing a display range with a function's domain | State the domain and inspect whether values leave the axes |
| A floating result is treated as exact | Ignoring representation and rounding | Label approximation and use a justified tolerance |

## Prepare the labs {#setup}

Read the [Python primer](python_primer_EN.html) if any notation in the scripts is unfamiliar. Download each script into a folder you can find, open a terminal in that folder, and run `python lab1_sums.py`, `python lab2_functions.py`, or `python lab3_diagnose.py`. On Windows, `py` may be the appropriate command; on macOS/Linux it is often `python3`. Check that the selected interpreter is Python 3.11 or later. These scripts use only the standard library.

Each block below is the complete distributed script followed by output captured by the page builder. Read the questions and predict the important numbers before executing it. Changing a script locally should change its output; the published output describes the unmodified version. The figures generated by Lab 2 can be opened directly in a browser.

## Lab 1 Expand and trace a finite sum {#lab1}

**Goal:** connect a declared integer range to its terms and total. Predict the terms and totals at $n=0,1,4,6$, then run the code.

{{LAB:lab1}}

**Investigate:** change the test values to $n=2,3,8$ and predict the totals. Explain why the two-dimensional table has six entries and why their total is $102$. Check the empty product and explain why one is the relevant identity.

**Written result:** show one complete expansion and trace. State exactly which inputs the assertions checked. Explain why these checks do not establish the identity for every $n$.

## Lab 2 Compare functions and their domains {#lab2}

**Goal:** connect values, formulas, and a plot. Predict the row for $x=0$ and the two compositions at $x=3$. The logarithm uses its real domain $x>0$.

{{LAB:lab2}}

**Investigate:** open `functions.svg`. Locate the curve for each rule and inspect where the logarithm begins. Change the sampled table inputs to `0.5, 1, 3`; update the integer-format input label to a floating format if you do so. Explain why the plot's absence at $x\le0$ differs from a valid curve lying above its vertical limit.

**Written result:** show the intermediate values leading to $19$ and $49$. Describe the four functions' domains and explain why a plot over $[-2,4]$ is insufficient to prove an eventual-growth claim.

## Lab 3 Diagnose invalid translations and identities {#lab3}

**Goal:** use valid counterexamples to locate a fault before repairing it. Predict the off-by-one total and the square-function counterexample.

{{LAB:lab3}}

**Investigate:** use $n=1$ as the minimal positive boundary case; choose other positive $a,b$ for the logarithm comparison; use `shifted_log(0)` and `shifted_log(3)` to test both sides of the domain boundary. Do not disable the domain checks to make the program appear to succeed.

**Written result:** distinguish the index-range fault, the false mathematical identity, and the invalid input. Explain each repair in terms of the original contract. Python booleans are deliberately rejected as counts even though Python treats them as an integer subtype.

## Exercises with complete solutions {#exercises}

Exercises 1–12 are required and take about 80 minutes. Exercises 13–14 are optional extensions adding about 25 minutes. Try a written solution before revealing the answer.

::: exercise #e1 level=1 kind=conceptual minutes=4
Classify $0,-3,5/2,\sqrt{2}$ in $\mathbb{N},\mathbb{Z},\mathbb{Q},\mathbb{R}$. Can one number belong to several systems?
:::
::: solution
$0$ belongs to all four; $-3$ belongs to $\mathbb{Z},\mathbb{Q},\mathbb{R}$; $5/2$ belongs to $\mathbb{Q},\mathbb{R}$; $\sqrt2$ belongs to $\mathbb{R}$ and is irrational. The systems are nested, so membership can overlap. Our natural-number convention includes zero.
:::

::: exercise #e2 level=1 kind=calculation minutes=4
Evaluate $-3^2$, $(-3)^2$, and $|-3|$. Explain a Python assignment `x = x + 1` without reading it as a real equation.
:::
::: solution
The values are $-9,9,3$. The minus is outside the square in the first expression. Assignment reads the current value on the right, adds one, then associates the resulting value with `x`. It does not assert that the old value equals the new value.
:::

::: exercise #e3 level=1 kind=conceptual minutes=4
List which of $0,1/2,1,2$ belong to $(0,1]$. Translate integer indices from one through four into a Python range.
:::
::: solution
$1/2$ and $1$ belong. Zero is excluded by the round bracket; two exceeds the upper bound. Use `range(1,5)` because the stop is excluded. The interval contains other real values too, not just the listed candidates.
:::

::: exercise #e4 level=1 kind=calculation minutes=4
Expand $\sum_{i=0}^3(2i+1)$ and $\prod_{i=1}^3(i+1)$. State the values for their corresponding empty index ranges.
:::
::: solution
The sum is $1+3+5+7=16$. The product is $2\cdot3\cdot4=24$. An empty sum is zero and an empty product is one. Do not substitute an invalid endpoint when the range has no terms.
:::

::: exercise #e5 level=2 kind=derivation minutes=5
For $f(t)=3t-2$ and $g(x)=x^2+1$, derive $f(g(x))$ and $g(f(x))$. Evaluate both at $x=2$.
:::
::: solution
$f(g(x))=3(x^2+1)-2=3x^2+1$, so its value is $13$. The other order gives $g(f(x))=(3x-2)^2+1=9x^2-12x+5$, with value $17$ at $x=2$. Both have real domain, but they differ as functions.
:::

::: exercise #e6 level=2 kind=derivation minutes=6
Expand and simplify $s(x)=\sum_{i=1}^3(x+i)$. Identify free and bound variables. Rename the bound variable safely.
:::
::: solution
Expansion gives $(x+1)+(x+2)+(x+3)=3x+6$. The input $x$ is free; $i$ is bound by the sum. Writing $\sum_{k=1}^3(x+k)$ preserves the expression. Writing $\sum_{x=1}^3(x+x)$ would capture the original input and change the meaning.
:::

::: exercise #e7 level=2 kind=derivation minutes=6
Derive the inverse of $f(x)=4x-3$ on $\mathbb{R}$. Verify both composition directions, and explain why the square needs a domain restriction before it has an inverse.
:::
::: solution
Solve $y=4x-3$ for $x$: $f^{-1}(y)=(y+3)/4$. Then $f^{-1}(f(x))=(4x-3+3)/4=x$ and $f(f^{-1}(y))=4(y+3)/4-3=y$. The real square maps both $2$ and $-2$ to $4$, so recovering a unique input is impossible. Restrict its domain and codomain to nonnegative reals to obtain the inverse square root.
:::

::: exercise #e8 level=2 kind=calculation minutes=8
Compute $\sum_{i=1}^2\sum_{j=1}^3(10i+j)$ by rows and by columns. Explain why the same reordering argument does not automatically apply to $\sum_{i=1}^3\sum_{j=1}^i j$.
:::
::: solution
Rows total $36$ and $66$, giving $102$. Columns total $32,34,36$, also giving $102$. The rectangular calculation includes each of six pairs exactly once in either order. In the triangular range, the valid pairs depend on the outer index. Its total is $1+(1+2)+(1+2+3)=10$; a reordered expression must preserve that triangular set of pairs rather than use an arbitrary rectangle.
:::

::: exercise #e9 level=2 kind=coding minutes=8
Specify and implement $h(x)=2x+1$ for $x<0$, otherwise $x^2$, on real scalar inputs. Give three checks including the boundary and describe the possible output signs.
:::
::: solution
Contract: one real scalar input, one real scalar output, no mutation. Implementation:

```python norun
def h(x):
    if x < 0:
        return 2 * x + 1
    return x * x
```

Checks: $h(-2)=-3$, $h(0)=0$, $h(3)=9$. The negative-input branch can produce negative, zero, or positive values: at $x=-1,-1/2,-1/4$ the outputs are $-1,0,1/2$. The other branch produces nonnegative outputs. The sign of the input does not alone determine the sign of the first branch's result.
:::

::: exercise #e10 level=2 kind=conceptual minutes=8
Let $f(t)=\ln(t-1)$ and $g(x)=x^2$. State the composition's domain and evaluate it at $x=-2,0,2$. If its codomain is declared as $\mathbb{R}$, is every real output attained?
:::
::: solution
Require $x^2-1>0$, giving $(-\infty,-1)\cup(1,\infty)$. At $-2$ and $2$, the result is $\ln3$; at zero it is undefined. Every real $y$ is attained: choose $x=\sqrt{e^y+1}>1$, then $\ln(x^2-1)=y$. In this particular example the image equals the codomain; that needs an argument and is not true of every function.
:::

::: exercise #e11 level=2 kind=coding minutes=11
A programmer implements the first $n$ positive odd integers using `range(1,n)`. Find a minimal positive counterexample, repair it, and specify invalid-input behaviour.
:::
::: solution
At $n=1$, the range is empty and returns zero instead of one. Use `range(n)` with term `2*i+1`, or `range(1,n+1)` with term `2*i-1`. Require a nonnegative integer and reject negative/fractional inputs clearly. If the contract excludes booleans, check them explicitly because Python's `bool` is a subclass of `int`. Check zero, one, and a larger count after the repair.
:::

::: exercise #e12 level=2 kind=conceptual minutes=12
Diagnose two claims: “every function distributes over addition” and “$\ln(a+b)=\ln a+\ln b$ for positive inputs.” Give valid counterexamples and explain why successful checks cannot prove either universal claim.
:::
::: solution
For the first, choose $f(x)=x^2$, $a=2$, $b=3$: $25\ne13$. For the second, choose $a=b=1$: $\ln2\ne0$. Every involved expression is defined on its declared domain. A universal statement fails when one valid input contradicts it; a finite collection of successful cases still leaves other inputs unexamined. The valid logarithm identity involves a product, not a sum.
:::

::: exercise #e13 level=3 kind=derivation minutes=10
Optional: derive $\sum_{i=0}^{n-1}(2i+1)=n^2$ using a reversed finite sum. Include $n=0$.
:::
::: solution
For $n>0$, let $A=0+1+\cdots+(n-1)$. Reverse its order and add termwise. Each of the $n$ paired terms equals $n-1$, so $2A=n(n-1)$. Therefore $\sum(2i+1)=2A+n=n(n-1)+n=n^2$. At $n=0$, the sum is empty and both sides are zero. The derivation covers the declared domain rather than only observed examples.
:::

::: exercise #e14 level=3 kind=derivation minutes=15
Optional: correctly reverse the order of $\sum_{i=1}^n\sum_{j=1}^i j$. Give the new bounds and verify $n=3$.
:::
::: solution
Valid pairs satisfy $1\le j\le i\le n$. Fixing $j$ first means that $i$ ranges from $j$ through $n$, so the equivalent expression is $\sum_{j=1}^n\sum_{i=j}^n j=\sum_{j=1}^n(n-j+1)j$. At $n=3$, this is $3\cdot1+2\cdot2+1\cdot3=10$, agreeing with the original. The index-pair description explains why the bounds change.
:::

## Self check quiz {#quiz}

Nine choices are checked automatically. Question 10 requires an explanation; compare it with the model answer and mark your own reasoning. The automatic score concerns the nine choices only. The written response and its review mark are saved in this browser, alongside session progress.

```quiz
? Under this series' convention, is zero a natural number?
- [x] Yes; the convention includes zero.
- [ ] No; natural numbers must universally start at one.
- [ ] Only when it is represented as a float.
> Our convention defines the set to include zero. Other texts may use a different convention, so neither a universal starting rule nor the software representation settles the meaning.

? What does Python `range(1,5)` generate?
- [ ] 1, 2, 3, 4, 5
- [x] 1, 2, 3, 4
- [ ] 0, 1, 2, 3, 4
> The start is included and the stop excluded. Including five or starting at zero changes the range.

? What is the image of the real square function?
- [ ] Every real number, because its codomain can be real.
- [ ] Positive numbers only.
- [x] Nonnegative real numbers.
> Squares cannot be negative, and every nonnegative output is reached by its square root. Zero is attained; a real codomain can contain unattained negatives.

? If $f(t)=2t+1$ and $g(t)=t^2$, what is $f(g(3))$?
- [x] 19
- [ ] 49
- [ ] 16
> Square first: 9; then double and add one: 19. Reversing the order gives 49. Adding function values is a different operation.

? What is the real domain of $\ln(x-1)$?
- [ ] $x>0$
- [x] $x>1$
- [ ] $x\ge1$
> The argument must be strictly positive. Positive x alone is insufficient, and equality at one would produce a zero logarithm argument.

? Which general identity holds for positive $a,b$?
- [ ] $\ln(a+b)=\ln a+\ln b$
- [x] $\ln(ab)=\ln a+\ln b$
- [ ] $\ln(ab)=\ln a\,\ln b$
> Logarithms turn multiplication into addition. Neither distributing over addition nor multiplying the two logarithms is the product rule.

? What is an empty product?
- [ ] 0
- [ ] Undefined in every setting.
- [x] 1 under the finite-product convention.
> One is multiplication's identity, so splitting a product into a nonempty and an empty part preserves it. Zero would erase the nonempty factors.

? In $\sum_{i=1}^3(x+i)$, which variable remains free?
- [x] x
- [ ] i
- [ ] Both disappear.
> The summation binds i but does not bind x. Expansion gives 3x+6, which still depends on x.

? A proposed universal identity succeeds on ten inputs. What follows?
- [ ] It is proved on its entire infinite domain.
- [ ] It is automatically false because testing is useless.
- [x] It agrees on those cases; a general argument is still needed.
> Testing supplies useful evidence and can reveal counterexamples, but finite successful checks do not establish an unrestricted universal identity.
```

<div class="free-response" data-free-response data-key="math-series:m01:q10">
<label for="q10-response"><strong>Question 10.</strong> Explain why a valid inner-function input can still make a composition undefined. Give one example and state its allowed domain.</label>
<textarea id="q10-response" aria-describedby="q10-review" placeholder="Write your argument here"></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I checked the input, the intermediate value, and the final domain against the model answer.</label>
</div>

::: answer
For $f(t)=1/(t-2)$ and $g(x)=x+1$, every real $x$ is valid for $g$, but $x=1$ produces $g(1)=2$, outside $f$'s domain. The composition is $1/(x-1)$ on $\mathbb{R}\setminus\{1\}$. Award the written point only when the response states the intermediate failure and the resulting domain; a different correct example is acceptable.
:::

## Guided reading {#reading}

**Required, 10 minutes:** use the functions material in [MIT Mathematics for Computer Science](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/). Read the definitions of a function, its domain, and its codomain in the linked textbook; stop before the later relation/proof material. Write a mapping whose codomain has one unused value and explain why it is still a function.

**Required, 15 minutes:** read the notation and mathematical-language introduction in [Mathematics for Machine Learning](https://mml-book.com/), alongside the notation summary below. Locate a finite indexed expression, name each symbol's role, and expand a three-term instance. This is a preview of the book's notation; you are not expected to understand its later linear algebra yet.

**Optional:** read the official [Python range examples](https://docs.python.org/3/tutorial/controlflow.html#the-range-function) and [math logarithm documentation](https://docs.python.org/3/library/math.html#math.log) when comparing code with notation. Use the documentation matching your installed interpreter if behaviour matters. The mathematical exposition and exercises here are original; external sources supply further reading.

## Review and readiness for logic {#summary}

The chain of ideas is: declare an object and its permitted values; name the operation; inspect its domain; expand a small case; translate the scope and indices; then check a claim using a valid argument. A function's image is the output it actually attains, while its codomain is the declared target set. A finite sum binds its index; its other inputs may remain free.

**Exit task:** specify the piecewise function from Exercise 9, give its Python implementation, expand a small double sum, and refute the logarithm addition identity on valid inputs. Explain these without merely reproducing the answer. Use the proposed course rubric: written exercises 60 points, lab explanations 30, and quiz 10 including your reviewed written response.

[Module 02](module_02_EN.html) makes the words “every,” “some,” “if,” and “only if” precise. Before proceeding, explain the difference between a definition and a statement claiming something about every input. Keep the counterexample from this module: it is the first step towards logical reasoning.

## Notation and bilingual terms {#terms}

| Symbol or term | Meaning | 中文 |
|---|---|---|
| Domain | Allowed inputs | 定义域 |
| Codomain | Declared target set | 陪域 |
| Image | Attained outputs | 像 |
| Composition $f\circ g$ | Apply g then f | 复合函数 |
| Inverse $f^{-1}$ | Unique reversal of a mapping | 反函数 |
| $\in$ / $\subseteq$ | Membership / set inclusion | 属于 / 包含于 |
| $[a,b)$ | Include a, exclude b | 左闭右开区间 |
| $\sum$ / $\prod$ | Sum / product | 求和 / 乘积 |
| Bound / free variable | Scoped index / remaining input | 绑定变量 / 自由变量 |
| Definition / assumption / claim | Meaning / setting / statement to establish | 定义 / 假设 / 主张 |
| Counterexample | Valid case refuting a universal claim | 反例 |
| Contract | Allowed inputs and promised result | 约定 |
