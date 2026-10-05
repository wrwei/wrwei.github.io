## Evidence asks questions proof answers the declared claim {#start}

The polynomial $n^2+n+41$ gives a prime number for each integer from zero through thirty-nine. It is tempting to guess that it always gives primes. At forty it equals $1681=41^2$, so the unrestricted claim is false. Forty successful cases were useful evidence for a conjecture, but one later valid input refutes that conjecture. More successful tests would never repair this particular universal statement.

A proof has a different obligation: start from explicit hypotheses and definitions, and give an argument covering every case in the stated domain. A program correctness proof adds another distinction. Showing that a returned answer is correct does not establish that the program ever returns. You need both a result argument and a termination argument when the contract promises completion.

**Retrieval check:** write an implication's contrapositive, describe an equivalence class, and prove an elementary set inclusion using an arbitrary member. Review [Module 02](module_02_EN.html#s2) and [Module 03](module_03_EN.html#s2) if needed. We use classical logic, ordinary finite lists, and natural numbers including zero. Statements about all lists mean all finite lists unless explicitly stated otherwise.

## Statements hypotheses and the role of definitions {#s1}

A **theorem** is a statement established by proof. Its **hypotheses** specify the assumptions under which its **conclusion** follows. A **lemma** is a proved supporting statement used within another argument; the name describes its role rather than a lesser standard of correctness. A **conjecture** is a proposed statement still needing justification. A successful example illustrates a theorem or supports a conjecture, but it is not a substitute for proof of an unrestricted claim.

Before choosing a method, rewrite the claim with its domain and logical structure visible. “Odd numbers multiply to odd numbers” means: for all integers a,b, if both are odd then their product is odd. The universal scope and implication suggest taking arbitrary integers satisfying the hypotheses, then using the definition of odd. There is no need to enumerate integers or use an advanced theorem when the definitions supply the argument directly.

::: worked title="Definitions turn a claim into a calculation"
Let a,b be arbitrary odd integers. By definition, $a=2k+1$ and $b=2l+1$ for integers k,l. Then $ab=4kl+2k+2l+1=2(2kl+k+l)+1$. The expression in parentheses is an integer, so the product is odd by the same definition. The arbitrary choice of a,b covers every pair satisfying the hypotheses; the conclusion follows without testing particular numbers.
:::

This short argument has an architecture worth copying: name arbitrary allowed inputs, unpack the hypotheses, transform the expression using justified steps, and recognise the conclusion's definition. Writing only the algebra omits why the introduced symbols exist and why their combination is an integer. Writing only “odd times odd is odd” repeats the claim. A proof connects the two with reasons.

An assumption is available within its scope. To prove $P\Rightarrow Q$, you may assume P and derive Q; you may not assume Q itself and treat its consequences as proof. Some calculations can be run backwards if every step is reversible, but then that reversibility should be stated. Squaring an equation or multiplying by a quantity that may be zero can lose equivalence or introduce extra candidates. A chain of implications is not automatically a chain of equivalences.

For a universal statement, your chosen input must be arbitrary within the domain. Starting with “let n=4” proves a fact at four, not at every n. For an existential statement, a chosen value may be exactly what is needed, provided it is a valid witness. For an equality of sets, arbitrary membership establishes both sides' agreement. Logical structure tells you which form of evidence is relevant.

::: figure #fig-04-1
A proof travels from declared inputs and hypotheses through definitions and justified steps to a conclusion. Testing adds evidence about selected inputs, while this chain covers the stated arbitrary inputs.
:::

Keep notation stable. If k is introduced as an integer witnessing oddness, do not later silently use it for a list index or a different witness. If two existential hypotheses provide integers, use distinct names unless you have justified their equality. A clear proof is easier to audit because each symbol has a role and every conclusion has a reason. Brevity helps only when it leaves the necessary links visible.

Counterexamples need the same care. To refute $\forall x\in D,\ P(x)$, give $x\in D$ with P false. To refute an implication under a hypothesis, show the hypothesis true and the conclusion false. A negative input cannot refute a nonnegative-input claim; a case where the premise fails does not refute a conditional. You may still use such cases to clarify scope, but label their purpose correctly.

::: check
Someone tests odd products for five pairs and says the theorem is proved. Which parts of the worked argument do the tests omit? Why is a single even product of two valid odd inputs, if one existed, decisive?
:::
::: answer
The tests do not cover arbitrary allowed pairs or connect the definitions to every product. A valid odd pair with even product would satisfy both hypotheses and violate the conclusion, directly refuting the universal implication.
:::

## Direct proof cases contrapositive and contradiction {#s2}

A **direct proof** derives the conclusion from the hypotheses. The odd-product proof is direct. A **proof by cases** splits the allowed domain into cases that cover it completely, then proves the conclusion in each. Cases may overlap, but they must not leave allowed inputs uncovered. The reason for choosing cases should relate to a definition or operation that behaves differently in those regions.

::: worked title="Cases follow an absolute-value definition"
For any real x, if $x\ge0$, then $|x|=x$, so $|x|^2=x^2$. If $x<0$, then $|x|=-x$, so $|x|^2=(-x)^2=x^2$. The cases cover every real number and include the boundary zero in the first branch. Thus the identity holds on the entire declared domain.
:::

For $P\Rightarrow Q$, a **contrapositive proof** establishes $\neg Q\Rightarrow\neg P$. Module 02 proved these implications equivalent, so this method is logically justified. It is often convenient when not-Q gives a simpler representation than P. Do not confuse it with proving the converse $Q\Rightarrow P$ or inverse $\neg P\Rightarrow\neg Q$, which generally establish different statements.

::: worked title="A parity claim by contrapositive"
Claim: if an integer's square is even, the integer is even. Prove the contrapositive: if n is not even, it is odd, so $n=2k+1$ for an integer k. Its square is $4k^2+4k+1=2(2k^2+2k)+1$, which is odd and therefore not even. Every integer is either even or odd; that elementary parity fact is used explicitly. The contrapositive proves the original implication.
:::

A **proof by contradiction** assumes the hypotheses together with the negation of the desired conclusion, then derives an impossibility. In classical logic, no consistent allowed case can satisfy those assumptions, so the conclusion must hold under the hypotheses. The contradiction should be identifiable: a statement and its negation, a number both strictly above and not above another, or a violation of a previously established fact.

::: worked title="There is no largest integer"
Assume a largest integer M exists. The integer $M+1$ is greater than M, contradicting the claim that M is at least every integer. Hence no largest integer exists. The witness $M+1$ depends on the hypothetical maximum; choosing one fixed large number would not rule out every proposed maximum.
:::

Contradiction and contrapositive can look similar, but their starting assumptions differ. For a contrapositive you assume not-Q and prove not-P. For contradiction you assume P and not-Q and derive false. Both methods are valid when applied to the intended statement. Selecting a method should simplify the reasoning, not supply an excuse to hide the conclusion among the assumptions.

To disprove a claim, use a counterexample rather than constructing an argument for its opposite by wishful algebra. “All functions preserve addition” fails for the square function at two and three; the valid counterexample settles the unrestricted claim. The opposite “no function preserves addition” is also false, since the identity function does. Negating a universal gives some failure, not failure of every possible object.

Proofs by cases need complete coverage in software contexts too. A search may return a successful position or an absence sentinel. Verifying only the successful branch leaves the absence branch unproved. A recurrence may have two base constructors. Handling one does not cover objects constructed from the other. Before reviewing algebra, list the cases required by the object's definition.

When a theorem is imported rather than proved, state it and check its hypotheses. Later AI arguments may use a differentiability or convexity theorem. The conclusion is available only if the current function meets its assumptions. In this module the imported facts are elementary parity, integer arithmetic, and the logical rules already proved. Keeping that dependency visible prevents circular justification.

::: check
To prove “if $n^2$ is even, n is even,” why is proving “if n is even, $n^2$ is even” insufficient? Name the exact equivalent statement used above.
:::
::: answer
The proposed argument proves the converse. The equivalent contrapositive is “if n is not even, $n^2$ is not even.” The worked proof establishes that direction using the odd representation.
:::

## Existence uniqueness and constructive arguments {#s3}

An existence statement requires at least one object satisfying the property. A **constructive proof** supplies that object or gives a procedure producing it, then verifies the property and domain. “There should be a solution” is not evidence. A candidate derived by algebra must be substituted back when the derivation may have introduced extra values or lost a domain restriction.

::: worked title="Existence and uniqueness are separate obligations"
For the real equation $3x+5=17$, existence follows by choosing $x=4$ and checking $3\cdot4+5=17$. For uniqueness, suppose u and v both solve it. Subtracting their equations gives $3(u-v)=0$, hence $u=v$. The first argument finds a solution; the second rules out any two distinct solutions. Together they prove exactly one solution.
:::

The uniqueness notation $\exists!x,\ P(x)$ combines existence and at-most-one. Showing “any two solutions are equal” alone proves at-most-one and can hold even when there are no solutions. For example, the real equation $x^2=-1$ has no solutions; the conditional comparison of two hypothetical real solutions says nothing about existence. Showing one solution alone also does not prove uniqueness, as $x^2=1$ has two real solutions.

A constructive proof can depend on a given input. To prove every integer x has a larger integer, define the witness $x+1$ and verify it. This proves $\forall x\exists y,\ y>x$, not that there is one fixed y larger than every x. Quantifier order from Module 02 remains relevant inside proofs. An algorithm constructing a witness for each input should state its input domain and guarantee.

Sometimes existence follows indirectly. If assuming no witness produces a contradiction, classical logic establishes a witness exists even without giving a convenient construction. That may suffice for a mathematical theorem but not for an implementation requiring an actual returned object. Distinguish the theorem's existential conclusion from an algorithm's operational promise to find and output a witness within available resources.

Uniqueness arguments often compare arbitrary hypothetical solutions. Suppose a and b are both least elements of a partial order. Each is below the other; antisymmetry gives equality. This does not show a least element exists in every partial order. The two incomparable singleton sets from Module 03 give a counterexample to existence. Separating these claims prevents a valid uniqueness lemma being overstated as an existence theorem.

Definitions can supply constructive procedures. For a nonempty finite list of integers, a minimum exists: start from its first member, then update the candidate when a smaller member appears. A full correctness argument needs an invariant saying the candidate is a minimum of the processed prefix, while termination follows from the finite number of elements. The construction suggests the proof, but saying “the algorithm obviously finds it” skips those obligations.

To show two representations define the same object, you may construct maps in both directions and verify their compositions recover the inputs. A bijection between records and identifiers would give unique reversibility, but a many-to-one class-label map does not. A constructive inverse requires both coverage of the intended inverse domain and uniqueness of the recovered output, as the previous module showed.

A counterexample can also be constructive: choose an object and verify exactly why it violates the claim. For “every relation that is symmetric is transitive,” the three-object closeness relation provides two present pairs and a missing closing pair. The witness need not be large or realistic to refute the statement; it needs to satisfy its declared assumptions. In application review, a small witness is often easier to understand and preserve.

::: check
An argument proves any two objects satisfying P are equal. Why may $\exists!x,P(x)$ still be unproved? Give an elementary property with no real witness and one with two witnesses.
:::
::: answer
Existence remains unproved. $x^2=-1$ has no real witness; $x^2=1$ has two, one and minus one. A uniqueness proof and an existence proof address different obligations.
:::

## Weak induction strong induction and well-ordering {#s4}

**Mathematical induction** proves a family of statements indexed by natural numbers. To establish P(n) for every $n\ge n_0$, prove a base P($n_0$) and a step: for an arbitrary $k\ge n_0$, assume P(k) and derive P(k+1). The temporary assumption is the **induction hypothesis**. It is legitimate within the step because the step proves an implication; the base starts the chain of implications.

::: worked title="A full finite-sum induction"
Claim: $\sum_{i=1}^n i=n(n+1)/2$ for every $n\in\mathbb{N}$. Base n=0: the sum is empty and both sides are zero. Step: let arbitrary $k\ge0$ satisfy the formula. Then
$$\sum_{i=1}^{k+1}i=\left(\sum_{i=1}^k i\right)+(k+1)=\frac{k(k+1)}2+(k+1)=\frac{(k+1)(k+2)}2.$$
The middle substitution uses the induction hypothesis; the other steps split the finite sum and simplify algebra. Thus P(k) implies P(k+1), and the base plus step prove all nonnegative cases.
:::

::: figure #fig-04-2
The base establishes the first case and the step connects each established case to the next. A valid connecting rule without an established starting case proves no chain of truths.
:::

A missing base can leave a false family with a perfectly consistent algebraic step. The proposed odd-sum formula $\sum_{i=0}^{n-1}(2i+1)=n^2+1$ has a step that carries the extra one forward: adding $2n+1$ to $n^2+1$ gives $(n+1)^2+1$. Its base n=0 is false, so the induction does not establish anything. A step is an implication, and false antecedents do not manufacture true conclusions.

In **strong induction**, the step may assume every earlier case P($n_0$),…,P(k) to prove P(k+1). This is convenient when a recursive object depends on several smaller inputs or one smaller input not necessarily k. Strong induction and ordinary induction have the same proving power over naturals. Ordinary induction can track the stronger statement “all cases through k hold,” producing the strong hypothesis in its next step.

Every integer n≥2 can be expressed as a product of primes. Base two is prime. For the strong step, consider k+1. If it is prime, it is already a one-factor product. Otherwise it factors as ab with $2\le a,b<k+1$. The hypothesis supplies prime products for a and b, whose combined factors give one for k+1. This proves existence of a factorisation. It does not prove its uniqueness; that requires an additional argument.

Base coverage follows the step's backward dependence. If your step reaches back by three, one base may not cover all residue positions. For example every integer n≥8 is $3a+5b$ for nonnegative integers a,b: bases 8=3+5, 9=3+3+3, and 10=5+5; for n≥11, n−3≥8 has such a representation by strong induction, and adding another three gives one for n. All three bases are needed for this particular argument.

The **well-ordering principle** says every nonempty subset of naturals has a least member. It explains induction through a smallest-counterexample argument. If a claimed family had a failure, select its least failed index. It cannot be the established base; the earlier index succeeds, so the induction step makes this index succeed too, a contradiction. This reasoning depends on a lower-bounded natural index domain, not an arbitrary collection with no least elements.

State the start index, the hypothesis's range, and the exact target of the step. Assuming P(k+1) while proving P(k+1) is circular. Proving P(k) implies P(k+2) with only base zero may cover even indices and leave odd indices unproved. Testing the first several cases can reveal these mistakes, but the written argument must show how its base cases and step cover the whole claimed domain.

::: check
A proof has P(0) and P(k) implies P(k+2). Does it establish all nonnegative indices? What extra base would make that particular step sufficient?
:::
::: answer
It establishes the even chain only. Add P(1) to start the odd chain, then the step covers both parities. Alternatively change the step to reach the immediate successor.
:::

## Recursive definitions and structural induction {#s5}

Some objects are defined by how they are built rather than by an integer formula. A finite list is either empty or a head followed by a smaller tail list. A finite full binary tree is either a leaf or a node with exactly two child trees. A recursive definition should specify every constructor, the allowed smaller pieces, and a base. These rules define the domain over which a structural proof must operate.

For lists, write $[]$ for empty and $h::t$ for head h with tail t. Define length by $\ell([])=0$ and $\ell(h::t)=1+\ell(t)$. Define concatenation by $[]\mathbin{+\!+}b=b$ and $(h::t)\mathbin{+\!+}b=h::(t\mathbin{+\!+}b)$. The notation names a mathematical operation, not Python syntax. Python lists and `+` can implement the corresponding finite behaviour, though an efficient implementation need not copy this recursive definition literally.

**Structural induction** proves a property for the base constructors, then for every composite constructor assuming it for the constituent smaller structures. It follows the grammar of the object. You do not assume the property of the object currently being proved; you assume it of its already smaller components and show the constructor preserves it. The argument covers every object generated by the finite construction rules.

::: worked title="Concatenated list lengths"
For any finite lists a,b, claim $\ell(a\mathbin{+\!+}b)=\ell(a)+\ell(b)$. Induct on the structure of a, keeping b arbitrary. Base a=[]: the left side is $\ell(b)=0+\ell(b)$. Step a=$h::t$: assume the claim for t and every b. Then $\ell((h::t)\mathbin{+\!+}b)=1+\ell(t\mathbin{+\!+}b)=1+\ell(t)+\ell(b)=\ell(h::t)+\ell(b)$. The recursive definitions and smaller-tail hypothesis justify each step.
:::

::: figure #fig-04-3
List induction has an empty-list base and a head–tail constructor step. The hypothesis belongs to the tail, and the length definition adds one for the new head.
:::

A tree proof may need two hypotheses. Let L(T) count leaves and I(T) count internal nodes of a finite full binary tree. Claim L(T)=I(T)+1. For a leaf, L=1,I=0. For a node with child trees A,B, leaf counts add and internal count is $1+I(A)+I(B)$. Using the two hypotheses gives $L(A)+L(B)=I(A)+I(B)+2=I(T)+1$. The “exactly two children” condition matters; the formula need not hold for a general tree.

A recursive computation also needs termination. Calling a function on the tail of a finite nonempty list decreases length by one until empty. Calling it on the same list again does not. A useful **termination measure** takes values in naturals and decreases strictly on every recursive call. Finite list length is such a measure. A decrease in an arbitrary real number is insufficient: the sequence 1,1/2,1/4,… decreases forever without reaching zero.

Recursion on integers needs a declared allowed domain and a reachable base. A countdown on nonnegative n with base zero and call n−1 when n>0 terminates because n decreases in naturals. Allowing negative inputs without another base can make repeated subtraction move away from zero. A syntactically present base case is not enough; every allowed call path must eventually reach a handled case.

Structural induction is closely related to induction on size, but its shape can make assumptions clearer. For two-child trees, assuming facts about both smaller children is more direct than inventing an arbitrary traversal order. For a recursive expression language with several constructors, each constructor becomes a proof case. Leaving one out leaves that part of the domain unproved, even if all examples use the handled constructors.

A proof of a recursive definition's property need not establish a fast implementation. Correctness and operation count are separate questions. A recursive concatenation may repeatedly copy data in a particular language, even though the length identity is mathematically correct. Module 06 will analyse growth and recurrences. Here, first establish that the operation is defined, terminates on allowed finite structures, and satisfies its claimed property.

::: check
Why does the full-binary-tree formula use two induction hypotheses? Give a tree outside the full-binary domain for which leaves equals internal nodes plus one fails.
:::
::: answer
The constructor has two smaller child trees, and the count uses both. A root with only one leaf child has one leaf and one internal node, so $1\ne1+1$; it violates the exactly-two-children assumption.
:::

## Loop invariants and separate termination arguments {#s6}

A **loop invariant** is a predicate that holds at a fixed point on every iteration reachable from the precondition. To use it in a correctness proof, establish **initialisation**, **preservation**, and **exit consequence**. The predicate need not describe every line of the loop; it must describe the chosen observation point consistently. An invariant assertion passing on a few runs is useful instrumentation but is not the general proof.

Consider first-match search on a fixed finite list a of n integers and integer target t. Start i=0. At each loop head while i<n, if $a_i=t$, return i; otherwise increment i. At ordinary exit return −1. Assume comparisons and list access terminate, and the list is not mutated during search. These assumptions make the state model clear and exclude changing data from silently invalidating the argument.

Use the invariant at the loop head:

$$0\le i\le n\quad\land\quad\forall k\in\{0,\ldots,i-1\},\ a_k\ne t.$$

It states a valid boundary and absence of matches in the processed prefix. Initially i=0 and the prefix is empty, so both clauses hold. For preservation, assume the invariant and guard i<n. If the current entry is not the target, increment to i+1. The old prefix has no match and the newly included old position i also has no match; the new prefix therefore has none. The new boundary remains at most n.

::: worked title="From the invariant to the search postcondition"
If the match branch returns i, the guard ensures $0\le i<n$, the branch ensures $a_i=t$, and the invariant ensures no earlier match, proving first occurrence. If the loop exits normally, the false guard gives $i\ge n$, while the invariant gives $i\le n$, hence i=n. Its prefix clause then covers the entire list, so −1 correctly reports absence. Empty lists satisfy the same initial and exit reasoning.
:::

::: figure #fig-04-4
For an absent target, the processed prefix expands while the natural-number measure n−i falls from four to zero. Correctness uses the prefix predicate; termination uses the decreasing measure.
:::

The invariant supplies a partial-correctness argument: every returned result satisfies the contract. To prove termination, use the **variant** $V=n-i$. It is a nonnegative integer at each loop head. Any iteration continuing rather than returning increments i, so V decreases by exactly one. A nonnegative integer cannot decrease strictly forever, and the loop cannot continue beyond n unsuccessful comparisons. A successful branch terminates immediately.

An invariant alone need not imply any decrease. A faulty loop that repeatedly inspects the same nonmatching first item can preserve “no match before i” with i=0 forever. Its returned results, if any, may still satisfy a partial-correctness statement, but a total-correctness promise fails. Conversely, a loop can terminate and return a wrong position. Both obligations need independent reasoning.

::: widget name=invariants
Step through present, absent, duplicate, and empty-list searches. Observe the loop-head index, processed prefix, invariant, and variant. The full general proof above remains available without scripting.
:::

Boundary details matter. After examining an entry, the processed region changes from indices less than i to indices at most i; after incrementing, that same region is described as indices less than the new i. Confusing old and new values is a common preservation error. Use names such as $i_{old}$ and $i_{new}=i_{old}+1$ when the distinction is unclear, and specify exactly where the predicate is asserted.

The same method applies to minimum search, counting, and accumulation. A running total invariant might say “the accumulator equals the sum of entries before i.” Initialisation uses an empty sum, preservation adds the next term, and exit gives the complete sum. A decreasing unprocessed-count variant establishes termination. Each algorithm needs its own predicate; merely copying the words initialisation and preservation without showing the transitions is not a proof.

Proofs and executable checks work together. Assertions can reveal a misstated invariant, and small edge cases can reveal a missing branch. A proof gives the reason the property holds for every allowed finite input, under the assumptions. If real code mutates a, uses a different stop condition, or returns after checking a later duplicate, compare that implementation with the proved transition rules rather than assuming the theorem transfers automatically.

::: check
A loop keeps i=0 on every nonmatching iteration. Does the search invariant still hold? Does its variant prove termination? Explain the gap using an absent target.
:::
::: answer
The empty-prefix invariant can remain true forever. The variant n−i stays n instead of decreasing. On a nonempty list whose first item is not the target, the loop repeats without completing, so the total-correctness claim fails.
:::

## Common misconceptions {#wrong}

| Symptom | Cause | Repair |
|---|---|---|
| Many examples are called a universal proof | Evidence was confused with domain coverage | Name arbitrary inputs or prove constructor/index coverage |
| Algebra starts from the desired result | Circular reasoning or unstated reversibility | Begin with hypotheses and justify each direction |
| A converse is offered as the theorem | Conditional direction was reversed | Write the original and its contrapositive before choosing a method |
| At-most-one is called unique existence | Existence was omitted | Supply a witness and a separate comparison of arbitrary solutions |
| Induction has no base or skips a residue chain | Step dependency was not checked | List reachable bases and the exact successor rule |
| Recursive calls repeat the same input | No decreasing well-founded measure | Show strict decrease in naturals and a reachable base |
| A loop invariant is called a termination proof | State truth was confused with progress | Add a nonnegative strictly decreasing variant |

## Lab setup and proof commentary {#setup}

Use Python 3.11 or later; all labs are standard-library scripts. See the [Python primer](python_primer_EN.html) for running files. For each lab predict the result, explain the mathematical obligation being checked, and diagnose a variation. Ten explanation points per lab divide into prediction 3, interpretation 4, and fault analysis 3. Assertions verify actual executions; your written proof must still cover arbitrary allowed inputs.

## Lab 1 Compare evidence with proof {#lab1}

**Fifty minutes:** predict the finite-sum outputs and the polynomial's first displayed counterexample. Run the script. Explain why nine successful sum checks do not prove the infinite family, while the value at forty refutes the prime conjecture. Reconstruct the sum induction in Section 4 after your second session. As a variation, change the sum range to exclude n and find the smallest failing nonnegative case. Preserve the counterexample and distinguish an implementation fault from a false theorem.

{{LAB:lab1}}

## Lab 2 Instrument a search invariant {#lab2}

**Fifty minutes, after Section 6:** predict the loop-head rows for a successful late match, an absent target, a first-position duplicate, and the empty list. Run the script and label initialisation, preservation, successful return, and normal exit. Explain which assertion checks the invariant and which checks the variant decrease. Change the increment from one to two; locate a skipped-match case and explain why the old preservation argument no longer establishes absence over the whole processed prefix.

{{LAB:lab2}}

## Lab 3 Expose two faulty arguments {#lab3}

**Fifty minutes:** the proposed odd-sum formula has an internally consistent algebraic step but a false base. Predict all four displayed rows and explain why that step cannot start induction. The recursion trace is deliberately bounded to five displayed calls so the lab does not hang; it illustrates a call that repeats the same n. Explain why the trace bound is not a termination proof of the faulty recursion, and why the repaired countdown has a valid natural-number measure.

{{LAB:lab3}}

## Exercises with complete solutions {#exercises}

Exercises 1–12 take 140 planned minutes and earn five points each. The two optional extensions add 25 minutes. State assumptions, the proof's scope, and why each decisive step follows. A proof template with empty obligations earns no credit for the missing argument.

::: exercise #e1 level=1 kind=conceptual minutes=6
Identify hypotheses, conclusion, and domain in “the product of two odd integers is odd.” Explain why testing 3 and 5 is not the full argument.
:::
::: solution
The inputs are arbitrary integers, both assumed odd; the conclusion is that their product is odd. Testing 3,5 establishes only that pair. Writing both as twice integers plus one and expanding covers every allowed pair.
:::

::: exercise #e2 level=1 kind=conceptual minutes=6
Write the contrapositive of “if an integer is divisible by four, it is even.” Distinguish its converse.
:::
::: solution
Contrapositive: a non-even integer is not divisible by four. Converse: an even integer is divisible by four, which fails at six. The first is equivalent to the original, the second is not.
:::

::: exercise #e3 level=1 kind=conceptual minutes=6
List the required parts of induction over all nonnegative integers. What fails if only a successor-by-two step and base zero are supplied?
:::
::: solution
Need base P(0), arbitrary k≥0, temporary hypothesis P(k), derivation of P(k+1), and conclusion for all naturals. A by-two step from zero covers only even indices, leaving odd cases without a starting chain.
:::

::: exercise #e4 level=1 kind=calculation minutes=6
For list [2,5,2,7], target 3, and loop-head i=2, state the processed prefix, invariant truth, and variant. What changes at the next head?
:::
::: solution
Prefix [2,5] contains no target, boundary is valid, so invariant true; variant 4−2=2. Entry two is not three, so the next head has i=3, prefix [2,5,2], invariant true, and variant one.
:::

::: exercise #e5 level=2 kind=proof minutes=15
Give a direct proof that the sum of two odd integers is even, with explicit integer witnesses.
:::
::: solution
Let arbitrary odd a=2k+1,b=2l+1 with integer k,l. Then a+b=2(k+l+1), twice an integer, hence even. The hypotheses supply witnesses and integer closure supplies the conclusion's witness.
:::

::: exercise #e6 level=2 kind=proof minutes=15
Prove $\sum_{i=0}^{n-1}(2i+1)=n^2$ for all n≥0 by induction.
:::
::: solution
Base n=0 is empty sum zero. For arbitrary k≥0, assume the sum through k terms is $k^2$. Adding the next term $2k+1$ gives $k^2+2k+1=(k+1)^2$. Thus the step reaches k+1 and, with the base, proves every natural n.
:::

::: exercise #e7 level=2 kind=proof minutes=15
Prove every integer n≥8 is $3a+5b$ for nonnegative integers a,b, and explain the three base cases.
:::
::: solution
Bases: 8=3+5,9=3+3+3,10=5+5. For arbitrary n≥11 assume all cases from eight to n−1. Since n−3≥8, write n−3=3a+5b; then n=3(a+1)+5b. Subtracting three reaches all three residue chains, so the chosen argument needs three starting cases.
:::

::: exercise #e8 level=2 kind=application minutes=13
Prove by list structural induction that concatenation length is the sum of the two lengths. Specify which list you induct on.
:::
::: solution
Induct on first list a, keeping b arbitrary. Empty a gives length b=0+length b. For a=h::t, the definition gives one plus length(t concatenated b). The tail hypothesis gives one+length t+length b, equal to length a+length b. Both constructors are covered.
:::

::: exercise #e9 level=2 kind=application minutes=13
Write an invariant for summing a fixed finite integer list, with i counting processed entries and s the accumulator. Prove its three correctness obligations and give a variant.
:::
::: solution
At the head: $0\le i\le n$ and $s=\sum_{k=0}^{i-1}a_k$. Initially i=s=0, using the empty sum. A continuing step adds $a_i$ then increments i, making the new sum cover the new prefix. Normal exit has i=n, so s is the full sum. Variant n−i is nonnegative and decreases by one each continuing iteration, proving termination under finite access/arithmetic assumptions.
:::

::: exercise #e10 level=2 kind=application minutes=13
Give separate existence and uniqueness arguments for a least element in the full power-set inclusion order. Do not confuse minimal with least.
:::
::: solution
Existence: the empty set is a member of the power set and is included in every member, so is least. Uniqueness: any two least members are mutually included and therefore equal. Minimal only forbids a smaller distinct member and need not imply comparison with all others.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=16
An odd-sum induction uses $n^2+1$, shows a consistent successor step, and omits its base. Diagnose and repair the proof.
:::
::: solution
At zero the empty sum is zero, while the candidate is one. A successor implication cannot repair a false base. Replace the claim by $n^2$, establish base zero, and use the step from Exercise 6. State the domain and temporary hypothesis rather than assuming the next case.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=16
A search loop preserves its empty-prefix invariant by leaving i unchanged after a nonmatch. Its author claims the invariant proves it correct and terminating. Separate the two claims and repair the progress argument.
:::
::: solution
The invariant may support correctness of any result actually returned, but the loop can repeat a nonmatching entry forever. The variant n−i does not decrease. Increment i after a nonmatch, prove the enlarged prefix clause, and show a unit decrease in the nonnegative variant. Successful return and normal exit require their separate postcondition arguments.
:::

::: exercise #e13 level=3 kind=proof minutes=10
Optional: prove a finite full binary tree has one more leaf than internal node by structural induction.
:::
::: solution
A leaf has L=1,I=0. For a two-child node with subtrees A,B, assume $L(A)=I(A)+1$ and $L(B)=I(B)+1$. Then L adds to $I(A)+I(B)+2$, while I is $1+I(A)+I(B)$, giving L=I+1. The two-child domain assumption is essential.
:::

::: exercise #e14 level=3 kind=proof minutes=15
Optional: explain why a strictly decreasing positive real measure alone does not prove termination, and contrast it with a natural-number variant.
:::
::: solution
The sequence $1,1/2,1/4,\ldots$ is strictly decreasing and stays positive forever. A nonnegative integer sequence cannot decrease strictly forever because each decrease is at least one and the initial value bounds the possible steps. Well-foundedness, not decrease alone, supplies the termination argument.
:::

## Self check quiz {#quiz}

Nine choices receive automatic feedback; the written proof outline supplies the tenth point after review. A useful answer states which obligation is met and which remains open.

```quiz
? What does a counterexample to P implies Q require?
- [x] P true and Q false within the domain.
- [ ] P false and Q false.
- [ ] Q true on one example.
> Only a true premise with false conclusion violates an implication. False-premise cases satisfy it vacuously; a successful conclusion is not a counterexample.

? Which method proves an equivalent form of P implies Q?
- [ ] Prove Q implies P.
- [x] Prove not-Q implies not-P.
- [ ] Assume Q and restate it.
> The contrapositive is equivalent. The converse can differ, and assuming the desired conclusion is circular.

? What is missing from an at-most-one argument for unique existence?
- [x] A proof that a witness exists.
- [ ] An extra successful sample of the same witness.
- [ ] A proof that all candidates work.
> Unique existence combines existence and uniqueness. Repeating a candidate adds no missing obligation, and every candidate need not work.

? When is an induction hypothesis legitimate?
- [ ] When it assumes the next case currently being proved.
- [x] As a temporary assumption for earlier cases in the step.
- [ ] Whenever several examples passed.
> The step proves a conditional from earlier cases. Assuming the target case is circular; examples do not supply the hypothesis globally.

? A valid successor step with no established base gives what?
- [ ] Every indexed case automatically.
- [x] An implication without a started truth chain.
- [ ] A counterexample in every case automatically.
> The step needs a base to propagate truth. Missing a base proves neither the family nor that every case is false.

? Why use strong induction for prime-product existence?
- [x] Composite n depends on two smaller factors, not necessarily n minus one.
- [ ] It automatically proves uniqueness too.
- [ ] It removes every base obligation.
> The broader earlier-case hypothesis covers both factors. Existence does not establish unique factorisation, and base cases remain necessary.

? Which constructors must list structural induction cover?
- [ ] Only nonempty lists.
- [x] Empty and head–tail construction.
- [ ] Every permutation of three chosen lists.
> The constructors generate all finite lists. Omitting empty loses the base; a finite example collection does not cover the full domain.

? What does a loop invariant alone establish in a correct proof?
- [ ] Termination regardless of progress.
- [x] State facts used to derive the result upon return or exit.
- [ ] The loop has optimal running time.
> Invariants support partial correctness. Termination needs a progress argument and efficiency needs separate analysis.

? Which is a valid termination measure for this finite search?
- [ ] A real value halved forever.
- [ ] An unchanged processed index.
- [x] Nonnegative integer n minus i, decreasing on each continuing iteration.
> A natural-number decrease is well-founded. A halved real can decrease forever and an unchanged value supplies no progress.
```

<div class="free-response" data-free-response data-key="math-series:m04:q10">
<label for="q10-response"><strong>Question 10.</strong> Give the first-match search's loop-head invariant and separate termination variant. Explain initialisation, preservation, successful return, and absent-target exit.</label>
<textarea id="q10-response" aria-describedby="q10-review" placeholder="Write your argument here"></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I reviewed the correctness cases and the separate progress obligation.</label>
</div>

::: answer
Invariant: valid boundary $0\le i\le n$ and no target in positions before i. At zero the prefix is empty; a nonmatch followed by increment preserves it. A returned matching i has no earlier match. Normal exit has i=n, so no list member matches. Variant n−i is a nonnegative integer and decreases by one in every continuing iteration; a match returns immediately. Award the written point only for both result reasoning and a separate decreasing measure under the fixed finite-list assumptions.
:::

## Guided reading {#reading}

**Required, 25 minutes:** in the open textbook linked by [MIT Mathematics for Computer Science](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/), read its proof-method and induction introductions. Label a proof's hypotheses, base, induction hypothesis, and target. Compare a direct argument with an indirect one.

**Required, 11 minutes:** read the recursive-data/structural-induction discussion, focusing on the constructors of one finite structure. List the exact base and step cases, and identify the smaller objects to which the hypothesis applies.

**Required, 9 minutes:** read the state-machine or invariant discussion and identify its observation point. State separately what proves the desired state property and what establishes progress or termination. These short selections total the forty-five-minute reading budget; longer proofs are optional.

**Optional:** consult the official [Python assert statement documentation](https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement) when explaining the limits of executable assertions. The lesson's proofs and diagrams are original.

## Reasoning checkpoint and readiness for counting {#summary}

A proof follows a statement's logical structure: arbitrary inputs for universals, witnesses for existence, comparison of hypothetical solutions for uniqueness, and covering cases for piecewise definitions. Induction covers indexed chains or recursively built structures. Program correctness uses an invariant tied to a specific program point; termination needs a separate well-founded measure.

**Checkpoint combining earlier ideas:** search a list of requests for the first one satisfying $admin\lor(owner\land approved)$. Translate the predicate using Module 02, then replace equality-to-target in the search invariant by failure of this predicate. Prove that a returned index is the first eligible request and that −1 means none is eligible. Explain why a parenthesisation error changes the proved specification even if the search loop itself is correct.

**Exit task:** produce one direct proof, one complete induction, and one search correctness/termination argument without looking at the examples. Use exercises 60, lab explanations 30, and quiz 10. Every missing base, circular assumption, or failed progress condition should be corrected and explained before moving on. Module 05 uses these reasoning tools to justify counts rather than merely apply formulas.

## Notation and bilingual terms {#terms}

| Term | Meaning | 中文 |
|---|---|---|
| Hypothesis / conclusion | Assumed setting / result to establish | 假设 / 结论 |
| Theorem / lemma / conjecture | Proved statement / supporting result / unproved proposal | 定理 / 引理 / 猜想 |
| Direct / contrapositive / contradiction | Derive result / prove equivalent reversed negation / derive impossibility | 直接 / 逆否 / 反证 |
| Existence / uniqueness | A witness / at most one together with existence | 存在性 / 唯一性 |
| Base / induction hypothesis / step | Starting truth / temporary earlier-case assumptions / successor proof | 基础 / 归纳假设 / 归纳步 |
| Strong / structural induction | All earlier indices / object constructors | 强归纳 / 结构归纳 |
| Well-ordering | Nonempty natural subsets have least members | 良序 |
| Invariant / variant | State property / well-founded progress measure | 不变式 / 变式 |
| Partial / total correctness | Correct on termination / additionally terminates | 部分 / 完全正确性 |
