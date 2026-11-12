## A requirement is a mathematical statement {#start}

An application should allow an administrator to open a record, or allow its owner when the owner has approval. A developer writes `(admin or owner) and approved`. Another writes `admin or (owner and approved)`. Both versions look plausible; an administrator without approval receives different answers. Which matches the requirement? You need to settle the meaning before inspecting the implementation.

Logic gives a language for that conversation. Its job here is to expose exactly which circumstances make a statement true, what its variables range over, and what evidence would establish or refute it. The same skills help read claims about algorithms and AI: “every input,” “there exists a model,” and “the model succeeds on this sample” describe different obligations. Changing one phrase can change the entire claim.

**Retrieval check:** explain why a function's domain belongs in its definition and why one valid counterexample refutes a universal identity. Use [Module 01](module_01_EN.html#s6) if either point is unclear. We assume ordinary classical, two-valued logic: each proposition under a specified interpretation is either true or false. Database nulls, exceptions, unknown information, and probabilistic uncertainty require additional modelling; they are not a third truth value silently inserted into these tables.

## Propositions and Boolean connectives {#s1}

A **proposition** is a declarative statement with a definite truth value in the setting being discussed. “Seven is odd” is true. “Seven is even” is false. A false statement remains a proposition. “Please open the file” is a command, while “is the file open?” is a question. Neither is assigned a truth value in this propositional language. “The file is open” becomes a proposition once the file and observation time are fixed.

Letters such as $p$ and $q$ stand for propositions. A **valuation** assigns a truth value to each letter. The sentence represented by a formula and the current truth assignment are distinct: a formula may be true under one valuation and false under another. Evaluating a formula means applying the connective definitions to the assigned inputs. Proving two formulas equivalent means that they have the same output under every valuation.

Negation $\neg p$ reverses the truth value. Conjunction $p\land q$ is true exactly when both inputs are true. Disjunction $p\lor q$ is true when at least one input is true. Mathematical “or” is inclusive: the case in which both are true is allowed. An exclusive alternative needs its own expression, such as $(p\lor q)\land\neg(p\land q)$. English sometimes uses “or” exclusively, so a specification should remove that ambiguity rather than assume its intended meaning.

| $p$ | $q$ | $\neg p$ | $p\land q$ | $p\lor q$ |
|---|---|---|---|---|
| F | F | T | F | F |
| F | T | T | F | T |
| T | F | F | F | T |
| T | T | F | T | T |

A **truth table** lists all possible valuations. With two distinct proposition letters there are four rows; with three there are eight. You do not need to know which row occurs in a particular application to establish an identity across the table. Conversely, inspecting only the row occurring today cannot establish that two rules will always agree. The missing rows may include the very circumstance a policy was written to handle.

Parentheses communicate structure. The administrator rule is $a\lor(o\land r)$, where $a$ means administrator, $o$ means owner, and $r$ means approved. Its outer connective is disjunction. The alternative $(a\lor o)\land r$ has an outer conjunction and requires approval in every successful case. Standard precedence gives negation before conjunction before disjunction, but explicit parentheses make requirements easier to review. A change in structure may change truth values even when the same letters appear.

::: worked title="Two rules disagree on a real case"
Let $a=\mathrm{T}$, $o=\mathrm{F}$, and $r=\mathrm{F}$. Then $a\lor(o\land r)=\mathrm{T}\lor\mathrm{F}=\mathrm{T}$. In the alternative, $(a\lor o)\land r=\mathrm{T}\land\mathrm{F}=\mathrm{F}$. The row describes an administrator who is neither the owner nor approved. It is a counterexample to equivalence of the two formulas, and the first rule matches the opening requirement's administrator exception.
:::

Negation of a compound statement must account for every way it can fail. “Both checks pass” fails if either check fails; “at least one check passes” fails only if both checks fail. These give **De Morgan's laws**:

$$\neg(p\land q)\equiv(\neg p\lor\neg q),\qquad \neg(p\lor q)\equiv(\neg p\land\neg q).$$

Here $\equiv$ denotes logical equivalence between formulas, rather than the equality of two numbers. Verify the four rows, then explain the laws in words. This connects the mechanical check to their meaning.

In Python, Boolean `not`, `and`, and `or` agree with these definitions when their inputs are Boolean values. Python also permits other objects: `and` and `or` can return an operand rather than a `bool`. For example, `"ready" or ""` returns `"ready"`. Keep the logical model separate from those language details. A truth-table lab uses actual `True` and `False` inputs, so its correspondence is explicit.

::: check
Two alarms $p,q$ should trigger a notice when exactly one is active. Evaluate $(p\lor q)\land\neg(p\land q)$ when both are active. Why would $p\lor q$ implement a different policy?
:::
::: answer
With both active, the first expression is $\mathrm{T}\land\mathrm{F}=\mathrm{F}$; inclusive disjunction is true. The first rule excludes the both-active case and the second includes it.
:::

## Implication and necessary conditions {#s2}

The implication $p\Rightarrow q$ says that whenever the antecedent $p$ is true, the consequent $q$ must be true. It rules out exactly one situation: $p$ true with $q$ false. Thus its truth-table definition is $\neg p\lor q$. This is **material implication**. It does not assert that $p$ causes $q$, that the two events occur in chronological order, or that $p$ actually occurs. Those are additional claims that need their own models.

| $p$ | $q$ | $p\Rightarrow q$ | $q\Rightarrow p$ |
|---|---|---|---|
| F | F | T | T |
| F | T | T | F |
| T | F | F | T |
| T | T | T | T |

::: figure #fig-02-1
Implication excludes the true-antecedent, false-consequent row. Its converse excludes a different row. “True” in a false-antecedent row does not establish the consequent.
:::

Consider “if a request is approved, it has a reviewer.” Let $p$ mean approved and $q$ mean has a reviewer. An unapproved request does not violate the rule regardless of whether it has a reviewer. The rule promises something only in the approved case. This explains the true rows with false antecedents. They are often called **vacuously true**. The word is a reminder that the promise was not activated, rather than a claim that a reviewer was found.

An implication and its **converse** need not agree. Being divisible by four implies being even, but being even does not imply being divisible by four: six is a counterexample. The **inverse** is $\neg p\Rightarrow\neg q$. It need not agree with the original either. The **contrapositive** is $\neg q\Rightarrow\neg p$, and it is equivalent to the original. Expanding both as disjunctions gives $\neg p\lor q$ and $q\lor\neg p$, equal under every valuation.

::: worked title="Divisibility and its contrapositive"
On integers, let $p(n)$ mean “four divides $n$” and $q(n)$ mean “two divides $n$.” The original statement holds because $n=4k$ implies $n=2(2k)$. Its contrapositive says that an integer which is not even is not divisible by four. Its converse fails at $n=6$. The inverse also fails there: six is not divisible by four, yet it is even.
:::

The phrase “$p$ is sufficient for $q$” means $p\Rightarrow q$: knowing $p$ holds is enough to establish $q$ under the rule. “$q$ is necessary for $p$” means the same implication: $p$ cannot hold without $q$. A necessary condition may fail to be sufficient. A reviewer may be required for approval while a reviewer alone does not guarantee approval. Reversing the direction would introduce a stronger and possibly false policy.

“$p$ only if $q$” translates to $p\Rightarrow q$, because it makes $q$ necessary for $p$. “$p$ if $q$” translates to $q\Rightarrow p$, because it makes $q$ sufficient for $p$. “$p$ if and only if $q$” requires both directions and is written $p\Leftrightarrow q$. Its truth value is true exactly when the two inputs agree. A specification defining acceptance often needs equivalence, while a rule giving just one guarantee may need implication.

::: figure #fig-02-2
The original implication is equivalent to its contrapositive. The converse and inverse form another equivalent pair; that second pair is not generally equivalent to the first.
:::

Two familiar reasoning patterns follow. From $p$ and $p\Rightarrow q$, conclude $q$; this is **modus ponens**. From $\neg q$ and $p\Rightarrow q$, conclude $\neg p$; this is **modus tollens**. Knowing $q$ alone does not let you conclude $p$, and knowing $\neg p$ alone does not let you conclude $\neg q$. Each invalid pattern can be exposed by a row of the implication table.

Suppose passing a particular check guarantees a valid record. Observing a valid record does not prove that the check ran: another process may have validated it. Observing that the check did not run does not prove the record invalid. These are logical limitations independent of how reliable the implementation is. When reading an AI result, a sufficient condition in a theorem must not be silently converted into a necessary explanation of observed success.

::: check
A rule states that a deployed model must have an evaluation report. Does an evaluation report imply deployment? Translate the rule, give a compatible non-deployed case, and identify the necessary condition.
:::
::: answer
$D\Rightarrow E$. A model with a report and no deployment has $D=\mathrm{F},E=\mathrm{T}$ and satisfies the rule. A report is necessary for deployment under this rule, but deployment does not follow merely from the report.
:::

## Predicates domains and witnesses {#s3}

A **predicate** is a statement template whose truth value depends on its inputs. “$x$ is even” is not a closed proposition until $x$ is supplied or bound by a quantifier. Write $P(x)$ and declare a domain, such as $x\in\mathbb{Z}$. The same notation with real inputs would require an explicit meaning for “even”; familiar integer words do not automatically extend to all number systems.

A variable appearing outside a binding operation is **free**. Substituting $x=6$ in $P(x)$ creates a definite statement. Another way to close the formula is to quantify it. The universal statement $\forall x\in D,\ P(x)$ means that every element of the declared domain satisfies the predicate. The existential statement $\exists x\in D,\ P(x)$ means that at least one element does. These symbols describe obligations, not loops whose execution proves every possible domain.

To establish an existential statement constructively, exhibit a **witness** and show that it lies in the domain and satisfies the predicate. To refute a universal statement, exhibit a **counterexample** with the same two obligations. Domain membership matters in both cases. A negative integer cannot refute a claim restricted to nonnegative integers, and a fractional solution cannot witness existence in the integers.

::: worked title="A witness belongs to its domain"
The statement $\exists x\in\mathbb{Z},\ x^2=9$ is true: $x=3$ is an integer and its square is nine. The statement $\exists x\in\mathbb{Z},\ x^2=2$ is false. The real value $\sqrt2$ does not witness it, because that value is outside the declared domain. The corresponding statement over $\mathbb{R}$ is true. Domain changes are changes in the mathematical claim.
:::

For a finite domain, universality can be checked by inspecting every member and existence by searching until a witness appears. Over an infinite domain, a finite successful search cannot settle universality. An existential statement can still be settled by one valid witness even when the domain is infinite. This asymmetry is useful: finding an integer solution establishes existence, while not finding one in a particular range does not establish nonexistence over all integers.

The truth of a universal statement over an empty domain is true under this logic. There is no member that violates it. An existential statement over that domain is false because there is no possible witness. Python's `all([])` and `any([])` follow exactly these conventions. An empty catalogue passing a universal quality rule does not demonstrate that any useful records exist. If existence is part of a requirement, state it as a separate conjunct.

Domain-restricted statements can be expanded into statements over a larger universe. “Every approved request has a reviewer” is $\forall r,\ A(r)\Rightarrow H(r)$. “Some approved request has a reviewer” is $\exists r,\ A(r)\land H(r)$. Restriction behaves differently for universals and existentials. Using implication in the second expression would allow an unapproved request to witness the statement merely because its antecedent is false.

Constants and function inputs also need scope. The predicate $x>t$ can be quantified over $x$ while leaving threshold $t$ free. Then $\forall x\in D,\ x>t$ is a statement depending on the selected threshold. A training claim with a fixed dataset or a fixed model similarly depends on those choices unless it quantifies over them. “For this model” and “for every model” should not be treated as stylistic variants.

For practical specifications, write a short domain declaration alongside each predicate: requests in this catalogue, reviewers registered at this time, integer positions from zero through length minus one. This prevents a true statement about a small catalogue being read as a promise about future entries. It also explains what a stored Boolean table represents and which omitted cases remain outside its scope.

::: check
Let the catalogue contain no approved requests. Is “every approved request has a reviewer” true? Does it imply that an approved request exists? Write an extra condition if existence is required.
:::
::: answer
The universal rule is vacuously true, but existence does not follow. Add $\exists r,\ A(r)$ and require it together with $\forall r,\ A(r)\Rightarrow H(r)$.
:::

## Nested quantifiers and negation {#s4}

Many requirements relate two kinds of objects. Write $R(r,v)$ for “reviewer $v$ is approved to review request $r$,” with request domain $D$ and reviewer domain $V$. The statement $\forall r\in D\ \exists v\in V,\ R(r,v)$ means each request has at least one suitable reviewer. The chosen reviewer may depend on the request. It does not require a single person able to handle them all.

In $\exists v\in V\ \forall r\in D,\ R(r,v)$, one reviewer is selected before considering all requests. That reviewer must work for every request. This statement is generally stronger. If it holds, each request can use the common reviewer, so the first statement holds. The converse can fail when different requests require different reviewers. Nested quantifiers expose exactly which choices may depend on earlier choices.

::: worked title="Local witnesses without a common witness"
Let $D=\{r_1,r_2\}$ and $V=\{a,b\}$. Only pairs $(r_1,a)$ and $(r_2,b)$ satisfy $R$. Each request has a witness, so $\forall r\exists v\ R(r,v)$ is true. Neither reviewer covers both requests, so $\exists v\forall r\ R(r,v)$ is false. Listing the two pairs establishes both conclusions for this finite model.
:::

::: figure #fig-02-3
Each row has a true cell, but no column contains only true cells. This distinguishes per-request witnesses from a common reviewer.
:::

Order can also change statements over infinite domains. On integers, $\forall x\exists y,\ y=x+1$ is true: given $x$, choose $y=x+1$. The reversed $\exists y\forall x,\ y=x+1$ is false. If one $y$ worked for every $x$, it would equal one when $x=0$ and two when $x=1$, an impossibility. This is an argument over the declared infinite domain, rather than an extrapolation from sampled integers.

Two universal quantifiers can swap order when the predicate and fixed domains stay the same: both orders require every pair to satisfy it. Two existential quantifiers can also swap, since both seek one successful pair. These observations do not license arbitrary reordering of mixed quantifiers. If a domain depends on an earlier variable, inspect that dependence before applying any swapping rule.

Negation of a universal is existential negation, and negation of an existential is universal negation:

$$\neg\bigl(\forall x\in D,\ P(x)\bigr)\equiv\exists x\in D,\neg P(x),$$
$$\neg\bigl(\exists x\in D,\ P(x)\bigr)\equiv\forall x\in D,\neg P(x).$$

The first says a universal rule fails because some member violates it. The second says existence fails because every candidate fails. Apply these rules from the outside in, preserving order. Negating $\forall r\exists v\ R(r,v)$ gives $\exists r\forall v\ \neg R(r,v)$: there is a request with no suitable reviewer. It does not say all requests lack all reviewers, which would be a much stronger statement.

Quantified implications also need connective negation. Since $\neg(p\Rightarrow q)\equiv p\land\neg q$, negating “every approved request has a reviewer” gives “there exists an approved request without a reviewer.” The approval condition remains positive. Simply putting “not” into the conclusion while leaving the universal quantifier unchanged fails to describe all ways the original rule could be false.

Scope can be made visible by parentheses and by speaking the formula aloud. In $\forall x\in D,\ (P(x)\Rightarrow Q(x))$, both uses of $x$ are bound. Writing an existential inside an implication changes what depends on the antecedent, so do not remove parentheses as cosmetic punctuation. Renaming a bound variable consistently does not change meaning; changing its domain or moving a quantifier does.

::: widget name=quantifiers
Toggle the four request–reviewer cells. Compare “every request has some reviewer” with “one reviewer covers every request.” Start with the diagonal cells true: local witnesses exist and no common reviewer does. The same example is fully explained above without scripting.
:::

::: check
Negate $\forall x\in\mathbb{Z}\ \exists y\in\mathbb{Z},\ y>x$. Explain the proposed negation in words and decide which of the two statements is true.
:::
::: answer
The negation is $\exists x\in\mathbb{Z}\ \forall y\in\mathbb{Z},\ y\le x$: some integer bounds all integers above. It is false, since any candidate $x$ is exceeded by $x+1$. The original statement is true with witness $y=x+1$ for each input.
:::

## Preconditions postconditions and assertions {#s5}

A program contract connects an allowed starting state to a promised finishing state. A **precondition** states what must be true before a call. A **postcondition** states what the result must satisfy when the call finishes under that precondition. “If the precondition holds and the program terminates, then the postcondition holds” is a partial-correctness claim. A total-correctness claim additionally establishes termination for every allowed input. Formal proofs of those obligations come in Module 04.

The precondition should describe real assumptions rather than hide troublesome valid cases. For an integer division operation, a nonzero divisor is appropriate. For a search returning the first occurrence of a target in a finite list, it would be misleading to require that the first element is already the target just to avoid analysing the loop. A narrower domain can be legitimate, but its restriction should match the operation the caller needs.

Suppose a search returns an integer $j$ on list $a$ of length $n$ with target $t$. A precise postcondition is:

$$\bigl(j=-1\land\forall k\in\{0,\ldots,n-1\},\ a_k\ne t\bigr)\ \lor\ \bigl(0\le j<n\land a_j=t\land\forall k\in\{0,\ldots,j-1\},\ a_k\ne t\bigr).$$

The first branch means absence; the second means the returned position is valid, matches, and has no earlier match. Requiring $a_j=t$ alone would not establish first occurrence and would not describe absence. Domain restrictions also prevent out-of-range indexing from being treated as a meaningful mathematical test. In executable code, use short-circuit guards before indexing.

::: worked title="A contract accounts for duplicates and emptiness"
For $a=[4,9,4]$ and $t=4$, returning zero satisfies the first-occurrence branch: the earlier-index domain is empty. Returning two matches the target but violates the “no earlier match” clause. For $a=[]$, returning $-1$ satisfies the absence branch because the index domain is empty. The same contract handles both cases without inventing an exception.
:::

An **assertion** is a statement expected to hold at a specified program point. It can be used as executable feedback during development. An assertion after a function call may check part of a postcondition; an assertion inside a loop may check a proposed invariant on the particular execution. Passing these checks is useful evidence but does not prove the invariant for every execution. A formal argument must cover all states reachable under the assumptions.

A predicate about state needs an observation point. “Everything before position $i$ has been checked” might hold at the start of an iteration, while “position $i$ has also been checked” may hold at the end. Moving an assertion across an update without adjusting its statement can introduce an off-by-one error. The relationship between the predicate, the index domain, and the line of code is part of its meaning.

Not all software conditions belong in `assert`. Python can disable assertions in optimised mode, so explicit input validation should use ordinary conditionals and exceptions when a caller must receive a reliable rejection. This distinction does not change logical semantics; it changes whether a statement is enforced by a particular runtime configuration. Our labs use assertions to catch internal disagreement and explicit code where an input-domain check is part of the contract.

Specifications can describe implications without requiring their antecedents ever to occur. “If training finishes, save a report” says nothing about whether training finishes. “If a record is accepted, its checksum is valid” says nothing about whether valid records are accepted. To specify exact acceptance, write an equivalence. To specify completion, add a termination obligation. To specify at least one accepted record, add existence. Separating the promises makes a review more precise.

A contract also identifies what is intentionally outside the model. A finite Boolean approval table says nothing about who may edit the table, when permissions expire, or how identity is verified. Those questions need additional state and predicates. Precision about one small rule is useful without being a complete security design. Likewise a theorem about a fixed data-generating assumption does not settle whether an actual dataset satisfies that assumption.

::: check
A search claims to return the first match but only asserts `a[j] == target` after success. What additional conditions are missing? Why must the absence case be specified separately?
:::
::: answer
It needs $0\le j<n$ and no matching index before $j$. Matching alone allows a later duplicate. Absence has no matching position, so specify a sentinel such as $-1$ together with all valid entries differing from the target.
:::

## Satisfiability validity and finite checking {#s6}

A propositional formula is **satisfiable** if at least one valuation makes it true. It is **valid**, or a tautology, if every valuation makes it true. It is **unsatisfiable** if no valuation makes it true. A formula can be satisfiable without being valid: $p\land q$ succeeds in one of its four rows and fails in three. A contradiction such as $p\land\neg p$ succeeds in none.

These words describe different quantifiers over the valuations. For a fixed formula with finitely many proposition letters, its complete truth table is finite. Exhausting that table can establish validity for the propositional formula, because every valuation in its domain was checked. It can also establish satisfiability by finding one row, or unsatisfiability by finding no successful row after complete enumeration.

This is stronger than checking a few integer inputs for an unrestricted arithmetic identity. The distinction concerns whether the entire declared domain has been exhausted, not whether a computer was used. An infinite integer domain cannot be exhausted by checking a finite interval. A finite catalogue can be exhausted, but its conclusion concerns that catalogue unless a separate argument connects it to a larger setting.

::: worked title="An exhaustive finite conclusion"
The formula $(p\land(p\Rightarrow q))\Rightarrow q$ is valid. If $p$ is false, its antecedent is false. If $p$ is true and $p\Rightarrow q$ is true, $q$ must be true. Every possible valuation is therefore covered. A four-row truth table verifies the same argument completely; testing one request would not cover all four possibilities.
:::

::: figure #fig-02-4
A complete truth table exhausts a finite Boolean domain. A finite integer search examines a proper subset of an infinite domain, so successful rows alone leave an unresolved universal claim.
:::

Logical consequence means that every valuation satisfying the premises also satisfies the conclusion. Premises $p$ and $p\Rightarrow q$ entail $q$, since a row making both premises true cannot make $q$ false. If the premises are inconsistent, there is no satisfying row, so the entailment is vacuously true in classical logic. That does not make an inconsistent specification useful: no implementation can satisfy all its demands simultaneously.

When checking a specification, ask both whether its constraints are satisfiable and whether the desired conclusion follows. “Approved records must be reviewed” and “no record may be reviewed,” combined with “some record is approved,” are inconsistent. Dropping the existence requirement makes them satisfiable by approving nothing. That repair may violate the product requirement even though the logical rules no longer contradict one another.

Finite model checking treats a defined finite collection of objects and states as a model. It can identify a state or pair of objects that violates a requirement. A returned counterexample is often more informative than a Boolean failure: it tells you which domain values trigger the disagreement. Preserve the witness, reproduce it, explain the relevant formula, and decide whether the code or the intended rule needs correction.

Enumeration has practical limits. A table with $m$ independent Boolean inputs contains $2^m$ valuations. Exhaustive checking is excellent for a small rule but rapidly expensive as inputs increase. More advanced solving methods can exploit structure; they still need a faithful specification. Sampling is useful for larger systems, but it must be reported as sampling rather than a complete validity check. Probability of passing a sampled test is also a different claim from universal truth.

In an AI setting, “every tested input was classified correctly” quantifies over the test collection. “Every possible future input will be classified correctly” quantifies over another, usually much larger domain. The second does not follow from the first merely by changing the word “tested.” Statistical arguments can support probabilistic conclusions under sampling assumptions; later modules will study those assumptions. Logic makes the gap visible before statistics tries to quantify it.

::: check
You test $n^2\ge n$ for every integer $n$ from zero to one thousand. What exactly have you established? Give an argument for all nonnegative integers without using further testing.
:::
::: answer
The check establishes the inequality on that finite interval. For any nonnegative integer, either $n=0$, giving equality, or $n\ge1$, so $n(n-1)\ge0$ and $n^2-n\ge0$. The argument covers the infinite declared domain.
:::

## Common misconceptions {#wrong}

| Symptom | Cause | Repair |
|---|---|---|
| A report is treated as proof of deployment | Affirming the consequent of $D\Rightarrow E$ | Give a report-without-deployment row; only the contrapositive reverses the rule correctly |
| An administrator is refused because approval is absent | Approval was moved outside the owner branch | Parenthesise the intended formula and enumerate its eight valuations |
| “Not every” becomes “none” | Universal negation was left universal | Replace $\neg\forall$ by $\exists\neg$ and exhibit one violating member |
| Different local witnesses are rejected | $\forall\exists$ was replaced by $\exists\forall$ | State whether one common witness is required |
| Empty data is called evidence of useful coverage | Vacuous truth was mistaken for existence | Add a separate existence condition |
| A small successful search is called a proof over all integers | The checked domain was silently enlarged | Report the finite domain and add a general argument |
| An assertion is treated as guaranteed input validation | Runtime assertion behaviour was ignored | Use explicit validation for the input contract; reserve assertions for internal checks |

## Lab setup and explanation rubric {#setup}

Run the scripts with Python 3.11 or later, using `python filename.py` or `py filename.py` on Windows and `python3 filename.py` where needed. Download to one directory and run from a terminal. See the [Python primer](python_primer_EN.html) for setup. These labs require no packages. Predict the critical row before execution, preserve its inputs, and explain why the output follows from the formula. Each lab explanation earns up to ten points: prediction 3, interpretation 4, and fault or variation analysis 3.

## Lab 1 Build truth tables {#lab1}

**Forty minutes:** first write the four valuations for two Boolean inputs. Predict the implication and converse columns, then run the script. It checks the contrapositive and both De Morgan laws in all rows. Explain why this complete enumeration proves their propositional equivalence, and why it does not prove an unrelated arithmetic theorem. Change the implication implementation to `p and q`; preserve a disagreeing valuation and repair it. The non-Boolean Python example at the end is a language distinction, not an extra truth value.

{{LAB:lab1}}

## Lab 2 Check quantified catalogues {#lab2}

**Forty minutes:** use $P(x,y)$ meaning $y=x+1$. Predict the per-input witnesses and common witnesses over the two displayed catalogues. Reducing the second domain removes the witness for $x=1$; identify that failure before running. Explain the three empty-domain cases rather than memorising their outputs. Change the predicate to $y\ge x$ and predict whether the larger catalogue contains a common witness. State the domain in every conclusion; the script does not enumerate all integers.

{{LAB:lab2}}

## Lab 3 Diagnose an access rule {#lab3}

**Forty minutes:** compare the intended administrator exception with the faulty parenthesisation. Predict how many of the eight rows disagree, run the script, and explain why both disagreements have an administrator and no approval. The repair is checked on the complete Boolean domain. The final catalogue repeats the distinction between local and common reviewers; explain why it is another specification question rather than a failure of Boolean evaluation.

{{LAB:lab3}}

## Exercises with complete solutions {#exercises}

Exercises 1–12 take 110 planned minutes and earn five points each. Exercises 13–14 are optional and add 25 minutes. Show domains, intermediate logical steps, and the scope of your conclusion; the final Boolean value alone does not earn full credit.

::: exercise #e1 level=1 kind=conceptual minutes=5
Classify: “nine is prime,” “open the file,” “$x>3$,” and “all integers larger than three are prime.” State what is needed to turn the third into a proposition.
:::
::: solution
The first is a false proposition; the second is a command. The third is a predicate with free $x$; supply a value and domain or bind $x$ with a quantifier. The fourth is a false quantified proposition, refuted by integer four.
:::

::: exercise #e2 level=1 kind=calculation minutes=5
For $p=\mathrm{F},q=\mathrm{T}$, compute $p\lor q$, $p\land q$, $p\Rightarrow q$, and $q\Rightarrow p$. Explain the implications.
:::
::: solution
The values are T, F, T, F. The first implication has a false antecedent and does not violate its promise. The converse has a true antecedent and a false consequent, so it fails.
:::

::: exercise #e3 level=1 kind=conceptual minutes=5
Translate “a valid token is necessary for access” and “a valid token is sufficient for access.” Let $T$ mean valid token and $A$ mean access.
:::
::: solution
Necessary: $A\Rightarrow T$. Sufficient: $T\Rightarrow A$. They are opposite directions. If both are required, the statement is $A\Leftrightarrow T$.
:::

::: exercise #e4 level=1 kind=calculation minutes=5
Negate “both checks pass” and “at least one check passes,” using $p,q$. Give the row making the first original statement false while the second remains true.
:::
::: solution
The negations are $\neg p\lor\neg q$ and $\neg p\land\neg q$. Either mixed row works, for example $p=\mathrm{T},q=\mathrm{F}$: conjunction is false and disjunction true.
:::

::: exercise #e5 level=2 kind=proof minutes=10
Prove that $p\Rightarrow q$ and $\neg q\Rightarrow\neg p$ are equivalent by connective expansion, and verify the result with the four possible valuations.
:::
::: solution
Expansion gives $\neg p\lor q$ and $\neg(\neg q)\lor\neg p=q\lor\neg p$. Disjunction is commutative, so the expressions agree. In row order FF, FT, TF, TT, both columns read T, T, F, T. All valuations have been covered.
:::

::: exercise #e6 level=2 kind=proof minutes=10
Prove $\neg(p\lor q)\equiv\neg p\land\neg q$ and explain why $\neg p\lor\neg q$ is an incorrect replacement.
:::
::: solution
In row order FF, FT, TF, TT, both the correct columns read T, F, F, F. The proposed incorrect replacement reads T, T, T, F and disagrees in both mixed rows. Failure of an inclusive “or” requires both alternatives to fail.
:::

::: exercise #e7 level=2 kind=proof minutes=10
Over integers, establish $\forall x\exists y,\ y>x$ constructively, then refute $\exists y\forall x,\ y>x$.
:::
::: solution
Given any integer $x$, choose the integer $y=x+1$, which is larger. For any proposed common integer $y$, choose $x=y$; then $y>x$ is false. The witness in the first argument depends on $x$, while the second demands a fixed witness.
:::

::: exercise #e8 level=2 kind=application minutes=10
Translate “every request has an approved reviewer” with explicit domains, then negate it. Explain why “one reviewer handles every request” is a different requirement.
:::
::: solution
For request domain $D$, reviewer domain $V$, and predicate $R$, the rule is $\forall r\in D\exists v\in V,\ R(r,v)$. Its negation is $\exists r\in D\forall v\in V,\neg R(r,v)$. A common reviewer would require $\exists v\forall r\ R(r,v)$, which fails in the diagonal two-request example even though the original holds.
:::

::: exercise #e9 level=2 kind=application minutes=10
Specify accepting an integer $n$ exactly when it is positive and even. Use a Boolean result $b$, distinguish this from a one-way guarantee, and give boundary checks.
:::
::: solution
Precondition: $n\in\mathbb{Z}$. Postcondition: $b\Leftrightarrow(n>0\land 2\mid n)$. Checks at $n=-2,0,1,2$ produce F, F, F, T. The implication $b\Rightarrow(n>0\land 2\mid n)$ alone permits rejecting every integer, including two.
:::

::: exercise #e10 level=2 kind=application minutes=10
Write a first-match search postcondition for a finite list using result $j$, target $t$, and sentinel $-1$. Explain duplicates and the empty-list case.
:::
::: solution
Either $j=-1$ and every valid index has $a_k\ne t$, or $0\le j<n$, $a_j=t$, and every earlier index has $a_k\ne t$. A later duplicate violates the last clause. On an empty list, the first branch holds with $j=-1$ because there are no violating positions.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=15
A filter means “some approved request exists,” but is written $\exists r,\ A(r)\Rightarrow H(r)$. Give a catalogue where it is true with no approved requests and repair the existence statement.
:::
::: solution
One unapproved request makes the implication true because its antecedent is false, so the existential formula is true. Existence of an approved request alone is $\exists r,\ A(r)$. If it must also have a reviewer, use $\exists r,\ A(r)\land H(r)$. The conjunction demands both properties of the same witness.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=15
A report says “the universal claim is proved” after testing an arithmetic predicate for all integers from $-100$ to $100$. Diagnose the scope error. Contrast it with checking all valuations of a three-letter propositional formula.
:::
::: solution
The arithmetic search establishes the predicate on 201 particular integers and leaves other integers unexamined. A valid checked counterexample can refute the unrestricted claim, but successful cases cannot prove it. A three-letter Boolean formula has exactly eight valuations; checking all eight exhausts its entire valuation domain and can establish validity for that formula. State the model and domain in both reports.
:::

::: exercise #e13 level=3 kind=proof minutes=10
Optional: prove that $(p\Rightarrow q)\land(q\Rightarrow p)$ is equivalent to $(p\land q)\lor(\neg p\land\neg q)$.
:::
::: solution
The first expression requires both directions and excludes precisely the two mixed rows. The second explicitly accepts the TT and FF rows. Both columns are T, F, F, T in order FF, FT, TF, TT. Thus they express agreement of the truth values and are equivalent under all valuations.
:::

::: exercise #e14 level=3 kind=proof minutes=15
Optional: with fixed domains $D,V$, show $\exists v\forall r\ R(r,v)$ implies $\forall r\exists v\ R(r,v)$. Check empty domains and explain why the converse fails.
:::
::: solution
If a common witness $v_*$ exists, use that witness for each request. If $D$ is empty and $V$ nonempty, both statements are true; if both are empty, the premise is false while the conclusion is true, so implication still holds. If $D$ is nonempty and $V$ empty, both are false, again giving a true implication. The diagonal nonempty example refutes the converse. Empty cases do not justify treating the statements as equivalent.
:::

## Self check quiz {#quiz}

The nine choices are checked automatically; the written explanation earns the remaining point after self-review. Read the feedback even when a choice is correct. A quiz score is evidence of the assessed skills, not a proof of every later claim.

```quiz
? Which case makes $p\Rightarrow q$ false?
- [ ] Both are false.
- [x] p is true and q is false.
- [ ] p is false and q is true.
> Implication excludes a true antecedent with a false consequent. Both false-antecedent cases satisfy the conditional promise vacuously.

? Which is equivalent to $p\Rightarrow q$?
- [ ] $q\Rightarrow p$
- [x] $\neg q\Rightarrow\neg p$
- [ ] $\neg p\Rightarrow\neg q$
> The contrapositive preserves truth values. The converse and inverse are equivalent to each other, but need not match the original.

? “Access only if approved” translates to which statement?
- [x] Access implies approval.
- [ ] Approval implies access.
- [ ] Access and approval cannot both hold.
> Only if makes approval necessary for access. It does not promise access whenever approval is present and does not exclude both being true.

? What is the negation of $\forall x\in D,\ P(x)$?
- [ ] $\forall x\in D,\neg P(x)$
- [x] $\exists x\in D,\neg P(x)$
- [ ] $\exists x\in D,\ P(x)$
> One violating member suffices to refute universality. Requiring every member to fail is stronger; requiring one successful member is unrelated to the negation.

? What does $\forall r\exists v\ R(r,v)$ permit?
- [ ] Only a single common reviewer.
- [x] Different reviewers for different requests.
- [ ] No reviewer for any request in a nonempty request domain.
> The existential choice is made within each request's scope. A common reviewer is allowed but not required; every request still needs a witness.

? How do universal and existential statements behave on an empty domain?
- [x] Universal true, existential false.
- [ ] Both true.
- [ ] Both false.
> There is no counterexample to a universal rule and no witness for existence. A universal pass therefore does not imply any member exists.

? What does satisfiable mean for a propositional formula?
- [ ] True in every valuation.
- [x] True in at least one valuation.
- [ ] False in every valuation.
> Satisfiability asks for one witness valuation; validity asks for all; unsatisfiability means none succeed.

? Which fully specifies acceptance exactly when P holds?
- [ ] Accept implies P.
- [ ] P implies accept.
- [x] Accept if and only if P.
> Exact acceptance needs both directions. The first allows rejecting valid inputs; the second allows accepting invalid inputs.

? What can a successful finite integer search establish by itself?
- [x] Agreement on its stated finite search domain.
- [ ] Universal truth over all integers.
- [ ] That a counterexample is impossible outside the search.
> Checked inputs do not exhaust an infinite domain. A general proof or additional justified result is needed for an unrestricted universal conclusion.
```

<div class="free-response" data-free-response data-key="math-series:m02:q10">
<label for="q10-response"><strong>Question 10.</strong> Negate “every approved request has some registered reviewer.” Declare domains, preserve approval, and explain the resulting statement in words.</label>
<textarea id="q10-response" aria-describedby="q10-review" placeholder="Write your argument here"></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I checked both quantifier changes and the approval condition against the model answer.</label>
</div>

::: answer
For all requests $r\in D$ and registered reviewers $v\in V$, the rule is $\forall r,\ A(r)\Rightarrow\exists v,\ R(r,v)$. Its negation is $\exists r,\ A(r)\land\forall v,\neg R(r,v)$. Thus an approved request exists that has no registered reviewer. Award the point only if the negation includes existence of an approved request and failure for every reviewer, rather than failure of all requests.
:::

## Guided reading {#reading}

**Required, 15 minutes:** in the open textbook linked by [MIT Mathematics for Computer Science](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/), read the propositions section's truth tables and implication discussion. Compare its notation with ours and give your own false-antecedent example.

**Required, 20 minutes:** read the same textbook's predicate-formulas discussion of universal and existential quantifiers and their negations. Select one mixed-quantifier statement, declare its domains, and describe which witness may depend on which variable. Later proof and induction sections are reserved for Module 04.

**Optional:** consult the official [Python truth-value and Boolean operation documentation](https://docs.python.org/3/library/stdtypes.html#truth-value-testing) when explaining why `and` or `or` can return an operand. The lesson's mathematical definitions and examples are original; the textbook and documentation support further study.

## Review and readiness for sets {#summary}

Connective definitions determine rows; rows determine equivalence, satisfiability, and validity. Quantifiers state which domain members must work and which witnesses may vary. A specification uses those statements to connect allowed inputs with promised results, while a counterexample identifies a failed promise. Complete finite checking establishes a claim over its finite model; an infinite claim needs a covering argument.

**Exit task:** write the administrator rule with parentheses; translate and negate a request–reviewer requirement; state a first-match contract; and explain the difference between all Boolean valuations and a finite range of integer tests. Use the course rubric of exercises 60, lab explanations 30, and quiz 10. Explain each answer after feedback rather than relying on your score alone.

Module 03 uses these logical rules to define sets, classify relations, and prove membership identities. Retrieve the meanings of “every pair,” “some witness,” and “not every” before studying relation properties. The course overview gives the availability of the next lesson.

## Notation and bilingual terms {#terms}

| Notation or term | Meaning | 中文 |
|---|---|---|
| $\neg$, $\land$, $\lor$ | Not, and, inclusive or | 否定、合取、析取 |
| $\Rightarrow$, $\Leftrightarrow$ | Implication, equivalence | 蕴含、等价 |
| Antecedent / consequent | Conditional input / promised conclusion | 前件 / 后件 |
| Necessary / sufficient | Required / enough under the rule | 必要 / 充分 |
| Converse / contrapositive | Reversed / reversed and negated | 逆命题 / 逆否命题 |
| $\forall$, $\exists$ | For every / there exists | 全称量词 / 存在量词 |
| Predicate / domain | Statement template / allowed values | 谓词 / 论域 |
| Witness / counterexample | Successful existential case / failed universal case | 见证 / 反例 |
| Vacuous truth | Universal or implication without an activated obligation | 空真 |
| Precondition / postcondition | Starting assumption / finishing promise | 前置条件 / 后置条件 |
| Satisfiable / valid | Some valuation / every valuation succeeds | 可满足 / 有效 |
