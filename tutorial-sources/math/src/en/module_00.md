## Choose the review you need {#start}

Use the [entry diagnostic](diagnostic_EN.html) first. If the first five tasks are unfamiliar, work through this refresher. If only one operation is uncertain, study that section and its practice. The estimated six hours include writing your own calculations, drawing graphs, correcting mistakes, and explaining why each operation is allowed.

Work on paper before using a calculator. A numerical answer is useful, but the purpose is to recover the relationship that produces it. Keep a short error log: record the incorrect step, the rule it violated, and a corrected example. Revisit that example at the start of your next session.

## Fractions signs and operation order {#s1}

A fraction $p/q$ describes division by a nonzero denominator. Multiplying its numerator and denominator by the same nonzero value preserves the ratio: $1/2=2/4$. To add fractions, express them using the same denominator; adding denominators does not perform the required operation.

::: worked title="Subtract with a common denominator"
$3/4-2/3=9/12-8/12=1/12$. The denominator twelve works because both four and three divide it. A useful check is the sign: $0.75$ exceeds approximately $0.667$, so the result should be small and positive.
:::

Multiplication gives $(p/q)(r/s)=pr/(qs)$. Division by a nonzero fraction multiplies by its reciprocal: $(3/4)/(2/3)=(3/4)(3/2)=9/8$. The divisor cannot be zero. Cancel factors in products, rather than cancelling terms in sums: $(2x)/(2y)=x/y$ when $y\ne0$, but $(x+2)/(y+2)$ generally does not simplify to $x/y$.

The negative of a negative value is positive. Subtracting a negative adds the corresponding positive amount: $5-(-2)=7$. Parentheses determine whether the minus belongs to a squared base: $-3^2=-9$, but $(-3)^2=9$. For several operations, handle parentheses first, then powers, then multiplication/division, then addition/subtraction. Operations of equal precedence are read in their appropriate order; add parentheses whenever a formula could be misread.

::: check
Calculate $1/2+1/3$ and $2-(-4)$. Why is $(x+2)/2=x/2+1$, rather than $x$?
:::
::: answer
The results are $5/6$ and $6$. Dividing each numerator term by two gives $x/2+2/2=x/2+1$. The numerator is a sum; deleting the two would not preserve it.
:::

## Ratios percentages and scientific notation {#s2}

A percentage is a ratio per hundred. Twenty-five percent is $25/100=1/4$. A percentage change compares a difference with the chosen starting value: increasing from eighty to one hundred gives $(100-80)/80=25\%$, while falling from one hundred to eighty is a $20\%$ decrease. The different denominators explain the difference.

Ratios need units and a reference. Three milliseconds per request multiplied by ten requests gives thirty milliseconds under a simple additive timing model. The same arithmetic does not establish a concurrent system's elapsed time; the model tells us when adding durations is appropriate.

Scientific notation writes a nonzero value as $a\times10^k$, normally with $1\le|a|<10$. Thus $0.00032=3.2\times10^{-4}$ and $45000=4.5\times10^4$. When multiplying, multiply the leading factors and add the powers: $(2\times10^3)(3\times10^{-2})=6\times10^1=60$. This keeps small and large scales readable.

::: check
Convert $0.0045$ to scientific notation. A value rises from fifty to sixty; what is the percentage increase?
:::
::: answer
$4.5\times10^{-3}$; the increase is $(60-50)/50=0.2=20\%$. State which original value supplies the denominator.
:::

## Equations inequalities and reversible operations {#s3}

Solving an equation means finding values that make both sides equal. Apply the same reversible operation to both sides to preserve its solutions. Adding or subtracting a fixed value is reversible. Multiplying or dividing by a nonzero fixed value is reversible. Dividing by an expression that might be zero needs a separate case; otherwise you may discard a valid solution.

::: worked title="Solve and check a linear equation"
From $3x+5=17$, subtract five to get $3x=12$, then divide by three to get $x=4$. Substitute into the original: $3(4)+5=17$. Checking the original equation catches transcription and arithmetic errors.
:::

For inequalities, adding the same value preserves the comparison direction. Multiplying or dividing by a positive value also preserves it, but a negative value reverses it. From $-2x<6$, division by $-2$ gives $x>-3$. Check one included value such as zero, and the excluded boundary $-3$.

Squaring is not reversible on all reals: both two and minus two square to four. If a rearrangement squares both sides, verify any candidate in the original equation. For example, $\sqrt{x}=x-2$ requires both $x\ge0$ and $x-2\ge0$; squaring alone can produce a candidate that violates these restrictions.

::: check
Solve $2x-7=5$ and $-3x\ge9$. In $x(x-1)=0$, why can you not simply divide by $x$?
:::
::: answer
$x=6$; $x\le-3$. The product equation permits $x=0$, so dividing by $x$ would remove that valid case. Its full solution set is $\{0,1\}$.
:::

## Expansion factoring and polynomials {#s4}

Distributivity is the rule $a(b+c)=ab+ac$. Applying it to each term gives $(x+2)(x-3)=x^2-3x+2x-6=x^2-x-6$. Combine like terms only: $x$ and $x^2$ represent different powers and cannot be added into a single coefficient of $x$.

Factoring reverses expansion. A common factor gives $3x+6=3(x+2)$. The polynomial $x^2-x-6$ factors as $(x-3)(x+2)$ because minus three and two have sum minus one and product minus six. Expand your factorisation to check it.

If a product of real numbers is zero, at least one factor is zero. Thus $(x-3)(x+2)=0$ has solutions $x=3$ and $x=-2$. A factor can be cancelled in a fraction only where it is nonzero. The expression $(x^2-1)/(x-1)$ agrees with $x+1$ for $x\ne1$; it remains undefined at one unless a new function is deliberately defined there.

::: check
Expand $(x+1)^2$. Explain why it is not $x^2+1$, using both algebra and $x=1$.
:::
::: answer
Expansion gives $x^2+2x+1$. At one the original expression is four while $x^2+1$ is two; the missing cross term causes the discrepancy.
:::

## Powers logarithms and a trigonometry preview {#s5}

For nonzero $a$, $a^0=1$ and $a^{-k}=1/a^k$. With positive bases, $a^r a^s=a^{r+s}$ and $(a^r)^s=a^{rs}$. Distinguish $x^2$ from $2^x$: the variable occupies a different role. Real square roots require nonnegative inputs; a root symbol gives the nonnegative square root, so $\sqrt9=3$, while solving $x^2=9$ gives two answers.

For $a>0$, $a\ne1$, and $x>0$, $\log_a x$ is the exponent that makes $a$ produce $x$. Thus $\log_2 8=3$ because $2^3=8$. Solving $2^x=8$ gives $x=3$. Logarithms turn positive products into sums; they do not generally distribute over addition. Module 01 explains these domains and identities in detail.

Trigonometry is a preview for later geometry and calculus. An angle in radians measures arc length divided by the circle's radius. A half-turn is $\pi$ radians, or $180$ degrees. On the unit circle, an angle $\theta$ gives coordinates $(\cos\theta,\sin\theta)$, satisfying $\cos^2\theta+\sin^2\theta=1$. At zero the point is $(1,0)$; at $\pi/2$ it is $(0,1)$. Python's standard trigonometric functions use radians. No trigonometric calculation is required for Module 01's labs.

::: check
Calculate $2^{-3}$ and solve $x^2=9$. What is the real domain of $\ln(x-2)$?
:::
::: answer
$1/8$; the equation has $x=3$ and $x=-3$. The logarithm requires $x-2>0$, hence $x>2$.
:::

## Coordinates slopes and reading graphs {#s6}

An ordered pair $(x,y)$ names a point: horizontal coordinate first, vertical second. A function graph places $(x,f(x))$ for allowed inputs. To read a value, find the input on the horizontal axis and follow to the curve, then read the vertical coordinate. Check the axis units and displayed range before interpreting a shape.

The slope through points $(x_1,y_1)$ and $(x_2,y_2)$ with distinct horizontal coordinates is $(y_2-y_1)/(x_2-x_1)$. Through $(1,2)$ and $(3,6)$ it is $(6-2)/(3-1)=2$. A corresponding line is $y=2x$. For $y=2x+1$, the slope is still two, but the vertical intercept is one.

Draw a line by calculating two or three points. For $y=2x+1$, use $(0,1),(1,3),(2,5)$. Draw the square using $(-2,4),(-1,1),(0,0),(1,1),(2,4)$; it is curved, so joining just two points with a straight line would misrepresent it. A vertical line has no finite slope under this formula because its horizontal difference is zero.

::: check
Find the slope through $(0,1)$ and $(2,5)$. Does changing metres to centimetres on one axis change the numerical slope?
:::
::: answer
The slope is $(5-1)/(2-0)=2$. Changing units on one axis changes the numerical ratio; state the units before interpreting it physically.
:::

## Ten practice tasks {#practice}

The first six tasks are hand calculations, the next two concern graphs, and the final two repair invalid manipulations. Rework missed tasks with new values until you can justify each step.

::: exercise #e1 level=1 kind=calculation
Calculate $3/4-2/3$ and $(3/4)/(2/3)$.
:::
::: solution
$9/12-8/12=1/12$; multiplying by the reciprocal gives $9/8$.
:::
::: exercise #e2 level=1 kind=calculation
Evaluate $-3^2$, $(-3)^2$, and $5-(-2)$.
:::
::: solution
$-9,9,7$; the parentheses determine whether the negative sign is squared.
:::
::: exercise #e3 level=1 kind=calculation
Solve $3x+5=17$ and check the solution.
:::
::: solution
Subtract five, divide by three: $x=4$; substituting gives seventeen.
:::
::: exercise #e4 level=1 kind=calculation
Expand $(x+2)(x-3)$, then factor your result.
:::
::: solution
$x^2-x-6=(x+2)(x-3)$. The cross terms are $-3x+2x=-x$.
:::
::: exercise #e5 level=1 kind=calculation
Solve $2^x=8$ and express $0.00032$ in scientific notation.
:::
::: solution
$x=3$; $3.2\times10^{-4}$. Moving the decimal four places left corresponds to a negative power of ten.
:::
::: exercise #e6 level=1 kind=calculation
Solve $-2x<6$ and find the percentage increase from eighty to one hundred.
:::
::: solution
$x>-3$, since dividing by a negative reverses the inequality. The increase is $20/80=25\%$.
:::
::: exercise #e7 level=1 kind=calculation
Plot $(1,2)$ and $(3,6)$; find the slope and line equation.
:::
::: solution
The slope is two and the line is $y=2x$; both points satisfy it.
:::
::: exercise #e8 level=1 kind=conceptual
Draw $y=x^2$ through five integer inputs from minus two through two. Read the value at zero and explain its symmetry.
:::
::: solution
The points are $(-2,4),(-1,1),(0,0),(1,1),(2,4)$. The value at zero is zero. Opposite inputs square to the same value, giving symmetry about the vertical axis.
:::
::: exercise #e9 level=2 kind=conceptual
A solution of $x(x-1)=0$ divides by $x$ and concludes that only one is possible. Repair the argument.
:::
::: solution
Consider $x=0$ first; it is valid. For $x\ne0$, division gives $x=1$. Together the solutions are zero and one.
:::
::: exercise #e10 level=2 kind=conceptual
A learner cancels $x-1$ in $(x^2-1)/(x-1)$ and evaluates the original expression at one as two. Repair the conclusion.
:::
::: solution
Factor the numerator as $(x-1)(x+1)$; cancellation is valid only for $x\ne1$. The original expression is undefined at one. The simplified expression describes equal values only on the original domain.
:::

## Readiness check {#ready}

Repeat the first five [diagnostic tasks](diagnostic_EN.html#d1) without consulting their answers. Explain the denominator in fraction addition, the placement of a negative sign, each reversible equation step, the cross terms in an expansion, and the inverse relationship defining a logarithm. Then start [Module 01](module_01_EN.html).

For extra practice, use the [single-variable calculus course's preparation materials](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/) selectively; its later calculus is not required yet. The refresher's worked examples and tasks are original.
