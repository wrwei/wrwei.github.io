## Count the outcomes your model actually distinguishes {#start}

Ten records are available and three must be selected for evaluation. If the selection is an unordered subset, there are 120 possibilities. If the three records receive distinct roles, such as first, second, and third reviewer, there are 720. The inputs look the same, but the outcomes being counted differ. A counting formula is correct only for its declared model.

This module develops that modelling habit before introducing probability. Ask what an outcome contains, whether order matters, whether an object can repeat, and whether different constructions describe the same outcome. Once the outcome set is clear, addition, multiplication, bijections, and complementary counting justify the formula. A probability calculation adds a sampling rule; a finite collection is not automatically uniform.

**Retrieval check:** form a small Cartesian product, list a power set, explain a bijection, and state a proof by cases. Review [sets](module_03_EN.html#s1) and [proofs](module_04_EN.html#s2) if needed. Counts are nonnegative integers. We count finite outcomes here; later probability modules extend the language and distinguish probability from empirical frequency more fully.

## Addition multiplication and decision trees {#s1}

The **addition rule** counts alternatives whose outcome sets are disjoint. If A and B do not overlap, then $|A\cup B|=|A|+|B|$. The vertical bars mean finite cardinality in this module, not absolute value of a number. If an outcome belongs to both sets, adding their sizes counts it twice. Either divide the outcomes into genuinely disjoint cases or correct the overlap explicitly in Section 5.

The **multiplication rule** counts successive choices when each first choice has the same number of permitted continuations. If there are a first-stage choices and b continuations for each, there are ab paths. For two independent choice sets this is the cardinality of their Cartesian product. Counting stages does not itself assert probabilistic independence; it describes the allowed construction tree. Probability independence is an additional property of a sampling model.

If continuation counts vary, sum the branch counts rather than multiplying by an unjustified common value. A catalogue may have two tasks allowing three workers each and one task allowing only one worker: there are seven permitted task–worker pairs, not nine. The product rule would become correct for an unrestricted catalogue in which every task allowed all three workers, but that would be a different constraint set.

::: worked title="Length-four binary strings"
An outcome is an ordered string of four bits, each position allowed zero or one independently of the allowed values in other positions. The choice tree has two branches at every level, so its leaf count is $2\cdot2\cdot2\cdot2=16$. Repetition is allowed, and 0011 differs from 1100 because positions matter. Requiring exactly two ones would select a smaller outcome set rather than all sixteen strings.
:::

::: figure #fig-05-1
A three-bit choice tree has eight leaves. Each root-to-leaf path represents one ordered string; shared prefixes are intermediate choices rather than extra outcomes.
:::

A **bijection** is another counting tool: construct a one-to-one correspondence between a difficult outcome set and an easier one. To use it, verify that every allowed outcome has exactly one representation and every allowed representation yields an outcome. If a representation omits cases or duplicates them, the apparent correspondence cannot justify equal counts. Stars and bars in Section 4 is a particularly useful example.

Counting by construction needs the same attention to scope as a proof. A leaf of a decision tree should represent a completed allowed outcome, not an intermediate partial choice. If two different paths lead to the same outcome after order is discarded, leaf counting overcounts the unordered model. That is why drawing an ordered selection tree is not enough to count subsets without further adjustment.

Empty choices have identity counts. Selecting no positions produces one empty sequence, not zero sequences. The product of zero stage counts is one under the empty-product convention. In contrast, an actual stage with no permitted options prevents any complete outcome, so a product containing a zero factor is zero. These two situations should not be confused by the word “empty.”

In CS, decision paths describe configurations, strings, assignments, and search spaces. Counting a search space does not give the time taken by every algorithm exploring it; an algorithm may exploit structure or inspect only part. In AI, possible data splits depend on whether records are distinct, whether roles are named, and which group constraints apply. A formula describing arbitrary record subsets does not respect subject-level grouping unless the model includes that constraint.

::: check
Two disjoint task types offer three and five distinct tasks. Each task allows exactly two worker choices. How many task–worker outcomes exist? What changes if one task permits only one worker?
:::
::: answer
There are $(3+5)\cdot2=16$ outcomes. Reducing one branch from two to one removes one outcome, giving fifteen; the unchanged common-factor model no longer holds for every task.
:::

## Permutations and repeated objects {#s2}

An ordered selection of r distinct objects without replacement from n distinct objects has count

$$P(n,r)=n(n-1)\cdots(n-r+1)=\frac{n!}{(n-r)!},\qquad0\le r\le n.$$

The first position has n choices, the next n−1, and each subsequent position one fewer. **Factorial** $n!$ is the product of positive integers through n, with $0!=1$. Selecting all n objects gives n! permutations. Selecting zero gives one empty ordered selection. If r>n and replacement is forbidden, the count is zero; the factorial expression above is stated only on its allowed range.

::: worked title="Ordered roles versus repeated draws"
For distinct objects A,B,C and two named positions, without replacement there are AB, AC, BA, BC, CA, CB: $P(3,2)=6$. With replacement there are nine strings, adding AA, BB, CC, and the general ordered count is $n^r$. Repetition means the same object may occupy several positions; it is different from having separate objects that happen to share a label.
:::

When repeated labels are indistinguishable, different named-object permutations can describe the same label string. For the multiset A,A,B, the distinct strings are AAB, ABA, BAA, only three. Temporarily naming the two A objects gives six permutations, and each final label string has exactly two such representations. Dividing by that common multiplicity gives $3!/2!=3$.

More generally, a multiset of N objects with label multiplicities $n_1,\ldots,n_k$ and $\sum n_i=N$ has $N!/(n_1!\cdots n_k!)$ distinct full arrangements. The numerator counts temporarily named objects; permutations within each equal-label group leave the final label string unchanged. Every label string has the same product of internal permutations, which justifies division. The fixed multiplicities and full-arrangement setting are assumptions of this formula.

Do not divide by an arbitrary symmetry factor without checking that every outcome has that many representations. Some problems have stabilised or exceptional cases: for example, repeated-label partial selections may have unequal numbers of named-position constructions. The pair AA can have one construction while AB has two in the three-position A,A,B model. Dividing three constructions by a guessed factor two would not produce the correct two distinct outcomes.

What counts as distinct depends on the problem. Two records with the same category label are normally still different records. Swapping them between named roles changes the record-level outcome even if the printed label sequence is unchanged. If only categories are recorded, the observed label outcomes may collapse multiple record choices. Keep the underlying outcome set and its representation separate when moving towards probability.

Counting ordered choices with replacement also needs consistent option sets. If each position has n allowed symbols, $n^r$ applies. If later allowed symbols depend on earlier selections, count the resulting branches. A password rule banning repeated characters or requiring at least one digit introduces constraints; neither n! nor $n^r$ automatically accounts for every such rule. Start with the construction and then identify the appropriate formula.

Boundary checks catch many formula mistakes. Verify r=0, r=1, r=n, and impossible r>n in the chosen model. For repeated arrangements, a multiset whose labels are all identical has one full label string, matching $N!/N!=1$. A formula giving zero or N! there describes a different notion of distinctness or contains a modelling error.

::: check
Four distinct records have labels A,A,B,B. How many full record orders exist, and how many distinct label strings? Explain why the two answers can both be correct.
:::
::: answer
There are $4!=24$ record orders and $4!/(2!2!)=6$ label strings. Each label string hides four named-record orders. The answers count different outcome sets.
:::

## Combinations binomial identities and subsets {#s3}

An unordered r-element subset of an n-element set is a **combination**. Its count is the **binomial coefficient**:

$$\binom nr=\frac{n!}{r!(n-r)!},\qquad0\le r\le n.$$

Each chosen subset of r distinct objects has exactly r! ordered arrangements. Dividing $P(n,r)$ by that common number therefore counts every subset once. This is an argument about equal representation multiplicity, not a formula to memorise independently of the model. Order is discarded and replacement is forbidden in this basic combination count.

::: worked title="Choosing three records from ten"
An evaluation subset contains three distinct records from ten, without assigned positions. Ordered construction gives $10\cdot9\cdot8=720$ possibilities. Every subset appears $3!=6$ times, so the subset count is $720/6=120$. If the three positions have different jobs, division would discard real distinctions and the correct count would remain 720.
:::

::: figure #fig-05-2
For two from {A,B,C}, ordered pairs AB and BA represent the same subset {A,B}. Each two-element subset has exactly two orders, so six ordered outcomes collapse to three subsets.
:::

Complementing a subset gives a bijection between r-element subsets and (n−r)-element subsets. Therefore $\binom nr=\binom n{n-r}$. The correspondence uses a fixed universe of n distinct objects, exactly as complements did in Module 03. The boundary counts $\binom n0=\binom nn=1$ are the empty subset and the full subset, not claims that these two subsets are the same object when n>0.

**Pascal's identity** follows by distinguishing one named object x. An r-subset either excludes x, giving $\binom{n-1}r$ possibilities, or includes x, leaving $\binom{n-1}{r-1}$ choices for its remaining members. The cases are disjoint and exhaustive, hence

$$\binom nr=\binom{n-1}r+\binom{n-1}{r-1}.$$

For n≥1 this includes boundary r values if we define a binomial coefficient as zero when the selection size is negative or exceeds its nonnegative top index. The proof's cases explain both the identity and its recurrence. They do not depend on cancelling factorials and therefore show why the count has that form.

The **binomial theorem** connects subsets with algebra:

$$ (a+b)^n=\sum_{r=0}^n\binom nr a^{n-r}b^r.$$

In a product of n copies of (a+b), each expanded term chooses b from exactly r positions and a from the rest. There are $\binom nr$ position subsets producing that monomial, which explains its coefficient. At n=0 both sides equal one by the empty-product convention. The statement uses commuting scalar a,b; matrix products need additional conditions because their order can matter.

Setting a=b=1 gives $2^n=\sum_{r=0}^n\binom nr$, another count of the power set by its disjoint subset-size classes. This connects Module 03's include/exclude argument with the combination formula. Counting one collection in two different ways is a **double-counting proof** when each method is justified and both really describe the same collection.

Data splitting adds modelling details. Selecting r records for one named group determines the complementary group when every record belongs to exactly one of those two groups. Selecting training, validation, and test groups with fixed sizes gives a multinomial count rather than just one binomial coefficient. Grouped subjects, chronology, or eligibility rules can restrict the allowed partitions. A mathematically correct unconstrained count is not automatically the application's count.

A uniform subset can be generated by making successive uniform choices without replacement and then discarding order. Each ordered sequence has the same probability, and each subset has exactly r! such sequences, so their total weights agree. That conclusion uses both properties. A procedure favouring certain records at an early stage can produce biased subsets even though it always returns r different records. “Random” in an implementation description should therefore be replaced by a precise mechanism before assigning probabilities.

Representation matters for repeated selections too. An ordinary set cannot record multiplicity: {A,A,B} is the same set as {A,B}. A multiset retains two copies of A and one of B; you can represent it by a tuple of counts or a sorted list of labels. The explorer uses double brackets for multisets to distinguish them from ordinary subset braces. Choosing a canonical sorted representation removes order while retaining repeated labels. Converting that representation to a set would discard another distinction and change the count again. Compare the representation with the outcome definition before using it as an enumeration key.

::: widget name=selections
Switch order-sensitive and order-insensitive selections, with or without repetition. The explorer uses objects A through H and shows a bounded sample of representations alongside the exact small-model count. Compare n=3,r=2: six ordered distinct choices, three subsets, nine ordered repeated choices, and six unordered multisets.
:::

::: check
Explain $\binom54=\binom51$ with a bijection. Then derive the coefficient of $a^2b^3$ in $(a+b)^5$ by choosing positions.
:::
::: answer
Each four-element subset omits exactly one element, giving the complement bijection. Choosing the three b positions gives $\binom53=10$ terms, so the coefficient is ten.
:::

## Repetition stars and bars and constraints {#s4}

Distributing n identical tasks among k named workers means finding nonnegative integer tuples $(x_1,\ldots,x_k)$ whose sum is n. Tasks are indistinguishable, workers are distinguishable, and workers may receive zero. The count is

$$\binom{n+k-1}{k-1},\qquad n\ge0,\ k\ge1.$$

The **stars and bars** construction writes n stars for tasks and k−1 bars separating workers' portions. A bar may be at an end or next to another bar, encoding zero allocations. The total string has n+k−1 positions, and choosing the bar positions determines it uniquely. Conversely, any permitted allocation produces exactly one such string. This bijection justifies the count.

::: worked title="Five identical tasks and three named workers"
For allocation (2,1,2), write `**|*|**`. Every allocation corresponds to a seven-position string containing five stars and two bars, so the count is $\binom72=21$. Allocation (0,5,0) uses `|*****|`; allowing zero is part of the model. If the tasks were individually named, each could choose a worker, giving $3^5=243$ assignment outcomes instead.
:::

::: figure #fig-05-3
The two bars specify the three named workers' portions. Moving a bar changes the allocation; identical stars do not carry task identities.
:::

Selecting r objects from n distinct types without caring about order and allowing repetition is the same nonnegative-count model: $x_i$ records how often type i is selected and $\sum x_i=r$. Its count is $\binom{n+r-1}r$ for n≥1. An ordered repeated sequence instead has $n^r$ possibilities. Forgetting order collapses sequences, but the multiplicity varies with repeated labels, so simple division by r! is generally incorrect.

Lower bounds can be removed by substitution. If every worker must receive at least one task, write $y_i=x_i-1\ge0$. The new total is n−k, giving $\binom{n-1}{k-1}$ when n≥k; when n<k, no allocation is possible. More general lower bounds $x_i\ge l_i$ use $y_i=x_i-l_i$ and reduce the total by $\sum l_i$. State feasibility before evaluating any factorial expression.

Upper bounds cannot be removed by the same subtraction alone. For five identical tasks among three named workers, each receiving at most two, start from 21 unrestricted allocations. A specified worker receiving at least three has six allocations after subtracting three from that worker, leaving two tasks among three workers. There are three such forbidden sets, and two workers cannot both receive three with only five tasks. Hence the valid count is $21-3\cdot6=3$, namely permutations of (2,2,1).

This example uses complementary counting and inclusion–exclusion, developed next. It also shows why checking constraints after applying an unrestricted formula matters. A formula can correctly count its model while incorrectly solving the posed problem. Bounds, named versus unnamed recipients, and distinguishability of tasks are all structural assumptions rather than implementation details.

If workers are unnamed, (2,1,2) and (1,2,2) may describe the same partition of task counts. The named-worker stars-and-bars formula would then overcount. Integer partitions are a different counting problem with different techniques; they are outside this module's core. Do not divide by k! automatically, because allocations with equal portions have different symmetry multiplicities from allocations with distinct portions.

Empty boundaries remain informative. With zero tasks and k≥1 named workers there is one allocation, all zeros, matching the formula. With a positive minimum per worker and zero tasks there are none. With zero workers the declared formula does not apply; a separate model could allow one empty assignment only when there are also zero tasks. A precise statement keeps exceptional domains explicit.

::: check
Distribute five identical tasks among three named workers, each receiving at least one. Transform to a nonnegative problem and count. Why would individually named tasks need another calculation?
:::
::: answer
Subtract one from each worker, leaving two tasks and three workers, so $\binom42=6$. Named tasks have individual assignments whose identities matter, so the allocation-count model collapses distinct outcomes and cannot count them directly.
:::

## Inclusion–exclusion complements and pigeonholes {#s5}

When A and B overlap, their intersection was counted twice in $|A|+|B|$. Subtracting it once gives $|A\cup B|=|A|+|B|-|A\cap B|$. A membership proof divides the universe into A-only, B-only, intersection, and neither. Members of the first two regions contribute one on both sides; intersection members contribute $1+1-1=1$; neither contributes zero. This explains the correction rather than merely naming it.

For three sets, add singles, subtract pair intersections, and add the triple intersection:

$$|A\cup B\cup C|=|A|+|B|+|C|-|A\cap B|-|A\cap C|-|B\cap C|+|A\cap B\cap C|.$$

A member of all three contributes three at first, loses three through pair subtractions, then gains one from the triple term. A member of exactly two contributes two minus one. A member of exactly one contributes one. Those disjoint membership cases cover the proof. More sets use alternating intersection terms, though explicit enumeration may be simpler for a very small teaching model.

::: worked title="Overlapping dataset labels"
In a twenty-record universe, eight records have label A, seven have label B, and three have both. The union has $8+7-3=12$ records. Its complement has eight. Saying fifteen have either label double-counts the three shared records. The complement calculation requires the twenty-record universe and does not refer to records outside it.
:::

**Complementary counting** calculates a desired count by subtracting its complement from a known total. It is useful when the undesired event has a simpler description: “at least one collision” is the complement of “all chosen buckets distinct.” The two cases must be exhaustive and disjoint in a common universe. Complementing an incomplete list of failures would omit other invalid cases.

The **pigeonhole principle** gives a guarantee rather than a probability. If n objects are placed in m boxes with n>m, at least one box contains two or more objects. If every box held at most one, the total would be at most m, contradicting n>m. More generally some box contains at least $\lceil n/m\rceil$ objects for positive m: otherwise all boxes would hold too few to reach the total.

Five named items assigned to four buckets must collide regardless of the assignment rule or whether choices are uniform. Three items in four buckets may collide, but need not: a distinct-bucket assignment is possible. Counting and a sampling model can describe its probability; the pigeonhole condition does not give a guarantee before the capacity is exceeded. High probability and certainty are different claims.

Proof by cases and proof by contradiction from Module 04 justify these tools. Inclusion–exclusion tracks each membership case's coefficient. Pigeonhole assumes every box has insufficient occupancy and derives a count contradiction. The formula's compactness should not obscure those reasons, especially when a new constraint changes which cases are possible.

An application may have unequal capacities. If bucket i has capacity $c_i$, more than $\sum c_i$ objects force an overflow somewhere. That is a direct extension of the same contradiction argument. It does not identify which bucket overflows, and fewer objects than total capacity do not guarantee that a particular assignment avoids overflow. Existence of a feasible assignment and behaviour of a chosen allocation are separate questions.

Choose the easiest justified count. For a union with a small overlap, subtract the intersection. For at-least-one events, inspect the none-event complement. For impossibility or forced repetition, compare occupancy with capacity. Naming what a calculation counts and checking its boundaries often reveals a mistaken model sooner than doing larger arithmetic.

::: check
Seven items enter three boxes. What occupancy is guaranteed somewhere? Does it mean a specific named box has that occupancy? Explain using the contradiction count.
:::
::: answer
At least one box has at least three items. If all had at most two, the total would be at most six. The argument proves existence of an overfull box, not which named box it is.
:::

## Finite probability requires a sampling model {#s6}

A finite **sample space** $\Omega$ contains all outcomes of the model. An **event** E is a subset of it. Under a **uniform** model assigning equal probability $1/|\Omega|$ to each outcome, $\Pr(E)=|E|/|\Omega|$. This familiar ratio is conditional on equal likelihood. Merely knowing an outcome set is finite does not assign probabilities to its members.

For unequal probabilities, give nonnegative weights $p_\omega$ summing to one and calculate $\Pr(E)=\sum_{\omega\in E}p_\omega$. A deterministic rule is an extreme example assigning probability one to one outcome and zero to the rest. Counting how many possible outcomes exist cannot distinguish that rule from a uniform random choice; the sampling mechanism must be part of the model.

::: worked title="Exact probability of a small collision"
Three named items choose independently and uniformly among four buckets. Outcomes are ordered bucket triples, so there are $4^3=64$ equally likely outcomes. No collision has $4\cdot3\cdot2=24$ outcomes. Therefore $\Pr(\text{collision})=1-24/64=40/64=5/8$. Three is not greater than four, so collision is possible and fairly likely under this model, but is not guaranteed.
:::

::: figure #fig-05-4
The uniform ordered-triple model has 64 outcomes: 24 all-distinct and 40 with a collision. These counts become probabilities only because the model assigns every triple the same weight.
:::

For k named items independently choosing uniformly among m buckets, with $0\le k\le m$, no-collision probability is $\prod_{i=0}^{k-1}(m-i)/m$. Its complement gives collision probability. At k=0 the empty product is one, so collision probability is zero. For k>m collision is guaranteed by pigeonhole, independent of uniformity. A real hash function applied to a particular fixed dataset may not behave like independent uniform choices, so the formula is a model calculation, not an automatic description of every implementation.

Independence matters in making all ordered triples equally likely: each complete tuple receives the product of its stage probabilities, here $(1/4)^3$. If all items are forced to use the same randomly chosen bucket, each individual choice is uniform but the choices are dependent and collision is certain for three items. Uniform marginals alone do not supply the independent-tuple model.

Collapsing representations can also destroy uniformity. Choose an unordered pair of named positions from three positions labelled A,A,B uniformly. There are three equally likely position pairs. One produces AA and two produce AB, so the two observed label outcomes have probabilities 1/3 and 2/3. Treating the observed set {AA,AB} as uniform would give the wrong answer. The mapping from original outcomes to observations preserves probability by summing all preimage weights.

Simulation samples the declared mechanism and reports observed frequency. It can check a prediction and expose implementation mistakes; its finite frequency need not equal the exact probability. A fixed random seed helps reproduce a particular run, but does not make the sample a mathematical enumeration. Later modules develop sampling error and concentration. Here, report exact count, model probability, and sampled fraction as distinct quantities.

The small collision lab enumerates all 64 tuples, then samples ten thousand independent trials under the same four-bucket model. Changing bucket weights, correlations, or the definition of a collision changes the event or mechanism and requires a new calculation. A graph that looks close to the formula is not an explanation of why the model applies. State the assumptions before comparing numbers.

Counting foundations support search-space estimates, collision analysis, dataset splits, and finite uncertainty. Their common habit is to define the outcome set before calculating. The probability extension adds another habit: describe how outcomes are selected before turning counts into chances. These two declarations are the essential exit skills of this module.

::: check
All three items use one shared uniformly chosen bucket. Each item's bucket is individually uniform. Is the collision probability still 5/8? Which assumption failed?
:::
::: answer
Collision is certain. The item choices are perfectly dependent, so the 64 ordered triples are not equally likely; only the four all-equal triples occur. Independent uniform choices, not just individually uniform choices, justified the 5/8 result.
:::

## Common misconceptions {#wrong}

| Symptom | Cause | Repair |
|---|---|---|
| An unordered subset count is too large | Named positions were retained | Prove each subset has r! ordered representations |
| A repeated-label count is too large | Labels were treated as distinct objects | Define the observed outcome and its representation multiplicities |
| Overlapping labels are added directly | Shared members counted twice | Use inclusion–exclusion in one universe |
| Stars and bars ignores an upper bound | Unrestricted allocations were counted | Remove lower bounds, then correct forbidden upper-bound cases |
| Every finite outcome is assigned equal probability | Finiteness was confused with uniformity | State the sampling weights or mechanism |
| Uniform per-item buckets give the independent formula | Dependence was omitted | Check joint construction, not only marginal choices |
| A likely collision is called unavoidable | Probability was confused with pigeonhole guarantee | State whether capacity is exceeded and whether noncolliding outcomes remain |

## Lab setup and modelling explanations {#setup}

Use Python 3.11 or later with no packages; see the [primer](python_primer_EN.html). `itertools` constructs finite sequences and subsets, `math.comb` supplies an exact integer reference, and `Fraction` retains exact probabilities. Explain the outcome model before running. Each lab receives ten explanation points: prediction 3, count/model interpretation 4, fault or variation analysis 3.

## Lab 1 Enumerate selections {#lab1}

**Forty minutes:** predict the binary-string count, six ordered pairs, three unordered subsets, and the five-task allocation count. Run the script and identify what makes outcomes distinct in each line. Explain the zero-selection case. Change the selection from two named positions to an unordered pair without replacement and justify division by two. The three-from-ten enumeration confirms the worked 120 and 720 counts without replacing their derivations.

{{LAB:lab1}}

## Lab 2 Exact and simulated collisions {#lab2}

**Forty minutes, after Section 6:** predict 64 tuples, 40 collision tuples, and probability 5/8. Run and compare the sampled fraction with the exact count. The seed reproduces the sample; it is not a proof that the frequency must equal 5/8. Change to five items and four buckets: no-collision count must be zero and collision guaranteed. Update the no-collision calculation for the changed model rather than retaining the three-item expression. Discuss why a correlated choice mechanism would invalidate the uniform-independent formula.

{{LAB:lab2}}

## Lab 3 Repeated labels and unequal observed weights {#lab3}

**Forty minutes:** predict the full label strings and pair multiplicities for named positions labelled A,A,B. Explain why full arrangement division by two works while giving each observed pair probability one half does not. Run, preserve both probabilities, and describe the mapping from the three equally likely position pairs to two label outcomes. As a variation use labels A,B,C, where all pair observations have the same weight because the mapping no longer merges distinct position pairs.

{{LAB:lab3}}

## Exercises with complete solutions {#exercises}

Exercises 1–12 take 110 minutes and earn five points each. Two extensions add 25 minutes. Give the outcome definition and assumptions before the arithmetic; a correct number for the wrong model does not earn full credit.

::: exercise #e1 level=1 kind=calculation minutes=5
Count length-four binary strings and strings with exactly two ones. Explain the different outcome restrictions.
:::
::: solution
Unrestricted strings number $2^4=16$. Exactly two ones chooses their two positions, $\binom42=6$. Both retain ordered positions; the latter restricts which of the sixteen strings qualify.
:::

::: exercise #e2 level=1 kind=calculation minutes=5
Choose three distinct records from ten, first with named roles and then as an unordered subset.
:::
::: solution
Named roles give $10\cdot9\cdot8=720$. Each subset has six orders, so unordered selection gives $\binom{10}3=120$. Replacement is forbidden in both models.
:::

::: exercise #e3 level=1 kind=calculation minutes=5
Count full label strings from A,A,B,B and explain why 24 would answer a different problem.
:::
::: solution
The count is $4!/(2!2!)=6$. Twenty-four treats the four positions' objects as separately named even within each label, retaining distinctions the label strings discard.
:::

::: exercise #e4 level=1 kind=calculation minutes=5
Twenty records contain eight A-labelled, seven B-labelled, and three with both. Count their union and its complement in this universe.
:::
::: solution
Union $8+7-3=12$; complement $20-12=8$. The intersection correction removes the second count of each shared record.
:::

::: exercise #e5 level=2 kind=proof minutes=10
Prove Pascal's identity by distinguishing one object in an n-object universe. State why the cases may be added.
:::
::: solution
An r-subset either excludes the distinguished object, leaving $\binom{n-1}r$ choices, or includes it, leaving $\binom{n-1}{r-1}$ choices. The cases are disjoint and exhaustive, so addition gives the identity. Boundary terms outside valid selection sizes are zero.
:::

::: exercise #e6 level=2 kind=proof minutes=10
Prove a three-element set has eight subsets in two ways and connect the general identity $\sum_r\binom nr=2^n$.
:::
::: solution
Include/exclude each of three members gives eight bit patterns. By subset size, there are $1+3+3+1=8$. For n members, the same collection has $2^n$ include/exclude encodings and $\binom nr$ subsets in each disjoint size class, proving the general identity.
:::

::: exercise #e7 level=2 kind=proof minutes=10
Prove seven objects placed in three boxes force at least one occupancy of three. Distinguish this from a claim about a named box.
:::
::: solution
If all three boxes had at most two, total occupancy would be at most six, contradicting seven. Therefore some box has at least three. The argument does not identify which box or assign probabilities to the possibilities.
:::

::: exercise #e8 level=2 kind=application minutes=10
Distribute five identical tasks to three named workers, allowing zero, then requiring at least one each.
:::
::: solution
Unrestricted count $\binom72=21$. For positive allocations subtract one per worker, leaving two tasks, giving $\binom42=6$. The tasks are indistinguishable and no upper bounds are present.
:::

::: exercise #e9 level=2 kind=application minutes=10
For the same allocation problem, require at most two per worker. Derive the count by excluding forbidden allocations.
:::
::: solution
There are 21 total. A specified worker with at least three leaves two tasks after subtraction, giving six forbidden allocations. There are three worker choices and no two such events can overlap with only five tasks. Thus $21-18=3$, permutations of (2,2,1).
:::

::: exercise #e10 level=2 kind=application minutes=10
Compute collision probability for three independent uniform choices among four buckets. Explain why collision is not guaranteed.
:::
::: solution
There are 64 equally likely ordered triples and 24 all-distinct triples. Complement gives $1-24/64=5/8$. Distinct triples exist, and three items do not exceed four buckets, so no pigeonhole guarantee applies.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=15
A report assigns probability one half to observed pairs AA and AB after uniformly selecting two named positions from labels A,A,B. Repair the model and probabilities.
:::
::: solution
The three position pairs are equally likely. One yields AA, two yield AB, so probabilities are 1/3 and 2/3. Collapsing records to labels changes observed weights; two possible observations do not imply uniformity.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=15
Three items all copy one uniformly drawn bucket from four. A developer uses the independent collision formula because each item is marginally uniform. Diagnose and calculate the true collision probability.
:::
::: solution
The three choices are dependent; only the four all-equal tuples occur. Every tuple collides, so probability is one. Individual uniformity is insufficient to justify equal probability for all 64 independent-model tuples.
:::

::: exercise #e13 level=3 kind=proof minutes=10
Optional: derive the coefficient of $a^{n-r}b^r$ in $(a+b)^n$ by choosing factor positions. Explain the n=0 case.
:::
::: solution
Choose the r factors contributing b; the remaining n−r contribute a. The coefficient is $\binom nr$ for commuting scalars. At zero, the empty product is one and the only r=0 term has coefficient one.
:::

::: exercise #e14 level=3 kind=application minutes=15
Optional: count assignments of ten distinct records into named groups of sizes 5,3,2. Explain what new grouping constraint would invalidate this count.
:::
::: solution
Choose five for the first group, then three of the remaining five, leaving two: $\binom{10}5\binom53=252\cdot10=2520=10!/(5!3!2!)$. Requiring records from the same subject to remain together can remove allowed record partitions, so subject grouping needs a different constrained model.
:::

## Self check quiz {#quiz}

Nine choices are automatic; the written model explanation supplies the remaining point after review. Read each explanation as a reminder of the assumptions behind a count.

```quiz
? When may sizes of alternative sets be added directly?
- [x] When the alternatives are disjoint.
- [ ] Whenever the sets are finite.
- [ ] Only when they have equal sizes.
> Disjointness prevents double counting. Finiteness alone does not prevent overlap, and equal size is unnecessary.

? What counts ordered r choices without replacement from n distinct objects?
- [ ] $n^r$ in every case.
- [x] $n!/(n-r)!$ for $0\le r\le n$.
- [ ] $\binom nr$.
> Each choice removes an option, giving a falling product. Powers allow replacement; combinations discard order.

? Why divide ordered distinct selections by r factorial for subsets?
- [ ] Every problem has that symmetry.
- [x] Every r-element subset has exactly r factorial orders.
- [ ] Factorials approximate large powers.
> A justified constant representation multiplicity permits division. Repeated objects can change multiplicities, and the argument is exact rather than an approximation.

? How many ways allocate five identical tasks to three named workers allowing zero?
- [ ] 243.
- [x] 21.
- [ ] Five.
> Stars and bars gives seven choose two. The 243 count assigns five distinct tasks; five does not enumerate the allowed tuples.

? What does stars and bars require in this allocation model?
- [x] Identical tasks, named workers, and the stated lower-bound convention.
- [ ] Unnamed workers and distinct tasks.
- [ ] No need to check constraints.
> Distinguishability and bounds define the bijection. Changing them changes the problem; upper bounds need additional treatment.

? Five objects enter four boxes. What follows without a sampling model?
- [x] Some box contains at least two.
- [ ] Every named box contains two.
- [ ] Collision probability is one half.
> Pigeonhole gives a guaranteed existence statement, not occupancy of every box or an arbitrary probability.

? When is event probability equal to its count divided by total outcome count?
- [ ] For every finite space.
- [x] Under an equally likely outcome model.
- [ ] Whenever a simulation has a fixed seed.
> Uniformity supplies equal weights. Finiteness and seed choice do not establish that model.

? What is the collision probability in the independent uniform three-item four-bucket model?
- [ ] One, because collisions are possible.
- [x] Five eighths.
- [ ] Three fourths by counting items over buckets.
> Complementing 24 distinct tuples among 64 gives 40/64. Possibility is not certainty, and item/bucket ratio is not this event count.

? A simulation reports a fraction close to an exact model probability. What is justified?
- [ ] Universal proof of every real hash implementation.
- [ ] Exact equality must occur in every run.
- [x] Agreement of that sample with a model prediction, with sampling variation remaining.
> A finite sample is evidence under its mechanism. It is neither an exhaustive proof nor guaranteed exact equality to a probability.
```

<div class="free-response" data-free-response data-key="math-series:m05:q10">
<label for="q10-response"><strong>Question 10.</strong> Explain why a finite observed outcome set can have unequal probabilities. Use the A,A,B pair-selection example and identify the equally likely underlying outcomes.</label>
<textarea id="q10-response" aria-describedby="q10-review" placeholder="Write your argument here"></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I checked the underlying position pairs and the observed multiplicities.</label>
</div>

::: answer
Uniformly choose two of three named positions. Their three pairs are equally likely; one maps to AA and two to AB. The observed probabilities are 1/3 and 2/3 despite only two distinct labels being possible. Award the written point for declaring the position-level model and summing its preimage weights, not for merely saying “some events are more common.”
:::

## Guided reading {#reading}

**Required, 15 minutes:** in the textbook linked by [MIT Mathematics for Computer Science](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/), read the product, sum, and subset-counting discussions. For one example, specify whether order and repetition matter before choosing a formula.

**Required, 20 minutes:** read the inclusion–exclusion and elementary finite-probability introductions. Identify where equally likely outcomes are assumed. Re-explain an overlap correction by membership cases, and distinguish its count from a sampling probability.

**Optional:** compare the official [itertools combinatoric iterators](https://docs.python.org/3/library/itertools.html#combinatoric-iterators) with their output order and replacement conventions, and inspect [math.comb](https://docs.python.org/3/library/math.html#math.comb) as an exact integer reference. The lesson's examples, derivations, and figures are original.

## Review and readiness for growth analysis {#summary}

Outcome definitions determine the count: choose disjoint alternatives, follow construction branches, or prove a bijection. Ordered choices, subsets, and multisets retain different distinctions. Inclusion–exclusion corrects overlap; complement counts the easier opposite case; pigeonhole proves a capacity guarantee. Probability adds weights, with count ratios justified only under uniformity.

**Exit task:** derive ordered and unordered three-from-ten counts, prove Pascal's identity, count a constrained task allocation, and explain the independent collision model alongside a dependent counterexample. Use exercises 60, lab explanations 30, and quiz 10. State every modelling assumption before arithmetic and repair any failed distinction after feedback.

Module 06 studies sums, growth, and recurrences. Before it, explain why counting a search space does not by itself establish the operation count of a particular algorithm. Keep the finite-sum induction and product-rule argument ready: both will justify growth calculations.

## Notation and bilingual terms {#terms}

| Term or symbol | Meaning | 中文 |
|---|---|---|
| $|A|$ | Finite cardinality | 基数 |
| Sum / product rule | Disjoint alternatives / successive choices | 加法 / 乘法规则 |
| $n!$, $P(n,r)$ | Factorial, ordered selection without replacement | 阶乘、排列数 |
| $\binom nr$ | Unordered distinct r-subsets | 二项式系数、组合数 |
| Multiset | Members with declared multiplicities | 多重集 |
| Stars and bars | Bijection for nonnegative integer allocations | 隔板法 |
| Inclusion–exclusion | Correct overlapping counts | 容斥原理 |
| Pigeonhole principle | Occupancy beyond capacity forces repetition | 抽屉原理 |
| Sample space / event | Model outcomes / selected outcome subset | 样本空间 / 事件 |
| Uniform / independent | Equal outcome weights / product sampling structure | 均匀 / 独立 |
| Exact probability / observed frequency | Model weight / sampled fraction | 精确概率 / 观测频率 |
