## When does a grouping rule make sense? {#start}

Three documents have keyword sets: document a has “python,” b has “python” and “ai,” and c has “ai.” A grouping tool calls two documents equivalent when they share a keyword. Then a is equivalent to b, and b to c, but a is not equivalent to c. Grouping each document with an existing representative produces different results when the input order changes. The problem is mathematical before it is an implementation bug: the proposed relationship does not have the properties required of equivalence.

Sets describe collections; relations describe which pairs belong together; functions describe a special kind of relation with exactly one output per input. This module connects those ideas to record identifiers, grouping rules, and dependency orders. You will learn to name the property a rule needs and produce a concrete witness when it fails. An attractive diagram or an intuitive word such as “similar” is insufficient.

**Retrieval check:** translate “every pair satisfies a property,” negate “every object has a match,” and distinguish a function's image from its codomain. Review [quantifiers](module_02_EN.html#s4) and [functions](module_01_EN.html#s3) as needed. The finite catalogues used below are teaching models; general definitions apply to larger and infinite sets too.

## Membership subsets and collection operations {#s1}

A **set** is a collection determined by its members. In the elementary sets used here, order and repetition do not matter: $\{a,b,a\}=\{b,a\}$. A list can preserve repetitions and order, so replacing a list with a set may change the problem. If a dataset contains the same observation twice, a set of its distinct values no longer records that multiplicity. The mathematical representation must match the quantity you intend to study.

Write $x\in A$ for membership and $x\notin A$ for nonmembership. The statement $A\subseteq B$ means $\forall x,\ x\in A\Rightarrow x\in B$; it permits equality. A **proper subset**, written here $A\subsetneq B$, additionally requires $A\ne B$. Membership compares an object with a collection of objects, while inclusion compares two sets by their members. When the members are themselves sets, both questions are possible and should be asked separately.

The **empty set** $\varnothing$ has no members. It is a subset of every set: no element violates the inclusion implication. It is not automatically an element of every set. For $A=\{a,b\}$, $\varnothing\subseteq A$ is true and $\varnothing\in A$ is false. For $B=\{\varnothing,a\}$, both statements are true. This distinction often prevents errors when using collections of possible subsets.

Union $A\cup B$ contains members of either set; intersection $A\cap B$ contains members of both; difference $A\setminus B$ contains members of $A$ outside $B$. A complement is always relative to a declared **universe** $U$: $A^c=U\setminus A$, assuming $A\subseteq U$. Without $U$, the word “everything else” is incomplete. A catalogue complement means other catalogue items, not every conceivable object.

::: worked title="Compute operations in a fixed universe"
Let $U=\{0,1,2,3\}$, $A=\{0,1\}$, and $B=\{1,2\}$. Then $A\cup B=\{0,1,2\}$, $A\cap B=\{1\}$, $A\setminus B=\{0\}$, and $A^c=\{2,3\}$. Reversing difference gives $B\setminus A=\{2\}$. If the universe changes to $\{0,1,2,3,4\}$, only the listed complement changes, gaining four.
:::

The **power set** $\mathcal{P}(A)$ is the set of every subset of $A$. For $A=\{a,b,c\}$ it contains $\varnothing$, the three singleton sets, the three two-element sets, and $A$ itself: eight members. Each original element either belongs or does not belong to a chosen subset. A finite $n$-element set therefore has $2^n$ subsets; Module 05 develops the counting rule systematically. Note that the power set contains sets as elements, rather than merely repeating the members of $A$.

The **Cartesian product** $A\times B$ contains ordered pairs $(a,b)$ with $a\in A$ and $b\in B$. Order matters here because the first coordinate has a designated role. For request set $D$ and reviewer set $V$, $D\times V$ is the collection of candidate request–reviewer assignments. The reversed product describes reviewer–request pairs with different coordinate roles. If either factor is empty, there are no pairs and the product is empty.

Python uses `set()` for the empty set, because `{}` creates a dictionary. Set elements must be hashable; a mathematical set of sets can be represented using `frozenset` elements, while a mutable Python `set` cannot itself be a set member. These representation rules are programming constraints, not changes to membership mathematics. Printed set order is not guaranteed, so the labs sort elements when presenting reproducible outputs.

::: check
For $A=\{a,b\}$, decide whether $a\in A$, $\{a\}\subseteq A$, and $\{a\}\in\mathcal{P}(A)$ hold. Why is the power set not just A with different punctuation?
:::
::: answer
All three hold. The power set's elements are subsets such as $\{a\}$ and $\varnothing$, while A's elements are the original objects a and b. Their element types and sizes differ.
:::

## Set identities proved through membership {#s2}

Two sets are equal exactly when they have the same members. To prove $A=B$, show that an arbitrary object belongs to $A$ if and only if it belongs to $B$. Alternatively, prove both inclusions $A\subseteq B$ and $B\subseteq A$. Checking the number of members alone is insufficient: different sets can have equal cardinality. Checking one chosen member is insufficient unless the entire domain is that one member.

Membership definitions connect set operations to the logic from Module 02. $x\in A\cap B$ means $(x\in A)\land(x\in B)$, while $x\in A\cup B$ means their inclusive disjunction. If $x\in U$, membership in $A^c$ means $x\notin A$. A set identity can therefore follow from a logical equivalence applied to each arbitrary candidate member, without relying on the sets being small enough to list.

::: worked title="A complete distributivity proof"
For an arbitrary $x$,
$$\begin{aligned}x\in A\cap(B\cup C)&\Leftrightarrow(x\in A)\land\bigl((x\in B)\lor(x\in C)\bigr)\\&\Leftrightarrow\bigl((x\in A)\land(x\in B)\bigr)\lor\bigl((x\in A)\land(x\in C)\bigr)\\&\Leftrightarrow x\in(A\cap B)\cup(A\cap C).\end{aligned}$$
The middle step is distributivity of Boolean connectives, verified by its complete truth table or a two-case argument on membership in A. Since x was arbitrary, both sides have exactly the same members. Thus the sets are equal, including when any of them is empty.
:::

For complements relative to a common universe, De Morgan's laws give $(A\cup B)^c=A^c\cap B^c$ and $(A\cap B)^c=A^c\cup B^c$. The common universe is a hypothesis. Comparing a complement over a training catalogue with a complement over all records would change the candidate members and could invalidate the equality. Carrying the universe explicitly is particularly useful in database filtering and data-split descriptions.

Difference satisfies $A\setminus B=A\cap B^c$ within that universe. It is generally not commutative. Symmetric difference $(A\setminus B)\cup(B\setminus A)$ does commute, because it selects members appearing in exactly one set. A report of changed identifiers may need symmetric difference, whereas a report of identifiers removed from A needs only $A\setminus B$. Similar names do not guarantee interchangeable operations.

A diagram can communicate an identity by shading regions, but the diagram alone does not explain every assumption. In a two-set membership table there are four regions: neither, A only, B only, and both. A set expression selects some of these regions. Comparing its selections across all regions provides a finite logical proof for the membership expression; drawing a few sample points merely illustrates it. State which kind of evidence you are giving.

::: figure #fig-03-1
The four membership possibilities determine union, intersection, and difference. Region labels describe truth of membership, rather than the number of data points in a region.
:::

When proving inclusion, a useful writing pattern is “take any $x\in A$; by the definitions and assumptions, it follows that $x\in B$.” The argument should not start by assuming $x\in B$ unless you are proving the reverse direction or an equivalence with reversible steps. An inclusion proof may use extra hypotheses, for example $A\subseteq B$ and $B\subseteq C$ to conclude $A\subseteq C$. Those hypotheses should remain visible.

The labs inspect all subsets of one three-element universe. Their results are a useful check on the implementation and on your prediction. They do not by themselves prove identities for every conceivable set. The arbitrary-member argument above covers the general statement, including infinite sets. A successful computation and a general proof can support each other while answering different questions.

::: check
Prove $A\cap\varnothing=\varnothing$ by membership, rather than by saying the result “looks obvious.” Then explain why equal finite sizes alone cannot prove equality.
:::
::: answer
Membership in the intersection requires membership in the empty set, which no object has. Thus the intersection has no members. Sets $\{0\}$ and $\{1\}$ have equal size but different members, so size alone is insufficient.
:::

## Binary relations and their properties {#s3}

A **binary relation** from $A$ to $B$ is a subset $R\subseteq A\times B$. It selects which candidate ordered pairs hold. Write $xRy$ as shorthand for $(x,y)\in R$. A relation on $D$ has $R\subseteq D\times D$, allowing properties that compare objects of the same kind. A Boolean table can represent a finite relation: rows are first coordinates, columns are second coordinates, and a true cell records membership in R.

Four properties recur. **Reflexive** means $\forall x\in D,\ xRx$. **Symmetric** means $\forall x,y\in D,\ xRy\Rightarrow yRx$. **Antisymmetric** means $\forall x,y\in D,\ (xRy\land yRx)\Rightarrow x=y$. **Transitive** means $\forall x,y,z\in D,\ (xRy\land yRz)\Rightarrow xRz$. Each is a quantified conditional or membership requirement, so its failure has a specific witness shape.

A missing diagonal pair witnesses failed reflexivity. A pair present in one direction but absent in the reverse witnesses failed symmetry. Two distinct objects related in both directions witness failed antisymmetry. A chain $xRy$ and $yRz$ with missing $xRz$ witnesses failed transitivity. A property is not disproved by any unusual-looking pair; its exact quantified rule must be violated.

Antisymmetry does not mean “never symmetric.” It permits both directions for the same object, and it does not require any direction between distinct objects. Equality is both symmetric and antisymmetric: whenever two objects are related they are equal, so a distinct mutual pair never occurs. A relation may also have neither property. The names should be learned through their formulas rather than through a loose interpretation of the prefix “anti.”

::: worked title="Closeness is not equivalence"
On $D=\{0,1,2\}$ let $xRy$ mean $|x-y|\le1$. It is reflexive and symmetric. It is not antisymmetric because $0R1$ and $1R0$ with $0\ne1$. It is not transitive because $0R1$ and $1R2$ hold while $0R2$ fails. The relation table contains concrete witnesses for both failures.
:::

The keyword rule from the opening is another transitivity failure: a shares with b, b shares with c, and a shares nothing with c. Symmetry alone cannot fix it. Reflexivity also needs care: a document with no keywords would share no keyword even with itself, so the rule is not reflexive on a domain including such a document. A domain restricted to documents with nonempty keyword sets removes that particular failure but leaves the transitivity problem.

::: figure #fig-03-2
The chain a–b–c has its two adjacent keyword matches but lacks a–c. It supplies the three objects needed to refute transitivity.
:::

Relations can be empty or universal. On a nonempty D, the empty relation is not reflexive, but is symmetric, antisymmetric, and transitive: the relevant antecedents never hold. The universal relation $D\times D$ is reflexive, symmetric, and transitive; it is antisymmetric only when D has at most one member. On an empty D, all four properties hold vacuously. These edge cases are direct applications of quantified logic.

Properties should be tested against the declared domain, even when some domain objects never occur in a stored pair. If a table omits an object, checking reflexivity only for objects already present can miss its missing diagonal. The lab receives the domain separately from the pair set. For a general theorem, show why every relevant pair or triple obeys the rule; for a finite table, complete enumeration can establish the properties of that particular relation.

::: widget name=relations
Choose equality, equal parity, closeness, or ordinary order on {0,1,2}. Toggle any cell and inspect the failed-property witnesses. Equal parity is an equivalence; closeness gives the counterexample above. The formulas and examples remain readable without the widget.
:::

::: check
On $\{0,1,2\}$, the relation $x<y$ has no diagonal pairs. Is it symmetric, antisymmetric, and transitive? Explain why a missing reverse pair does not violate antisymmetry.
:::
::: answer
It is not symmetric, since $0<1$ but not $1<0$. It is antisymmetric because no distinct pair is related in both directions, and transitive because $x<y<z$ implies $x<z$. Antisymmetry forbids mutual distinct pairs; it does not require reverse pairs.
:::

## Equivalence classes partitions and quotient sets {#s4}

An **equivalence relation** is reflexive, symmetric, and transitive. It formalises a chosen meaning of “the same for this purpose.” Literal equality is one example, but two distinct records may be equivalent under a declared key. The equivalence statement concerns that key or representation; it does not automatically prove that the underlying people, events, or physical objects are identical.

For an equivalence relation on D, the **equivalence class** of x is $[x]=\{y\in D:xRy\}$. Reflexivity gives $x\in[x]$, so classes are nonempty. If $y\in[x]$, symmetry and transitivity imply $[y]=[x]$. Thus any member may serve as a representative of the class without changing which objects it contains. Representatives label a class; they do not create a different class each time.

::: worked title="Parity classes on integers"
Define $xRy$ when $x-y$ is even. Reflexivity follows from $x-x=0$, symmetry from negating an even difference, and transitivity from adding two even differences. There are two classes: even integers and odd integers. $[0]=[2]=[-4]$, while $[1]=[3]$. Different representatives can denote the same class, and no integer belongs to both classes.
:::

Why can two classes not partially overlap? Suppose $z\in[x]\cap[y]$. Then $xRz$ and $yRz$, so symmetry gives $zRy$ and transitivity gives $xRy$. For any $u\in[x]$, symmetry gives $yRx$ and transitivity with $xRu$ gives $yRu$, so $u\in[y]$. The reverse inclusion follows the same way. Hence overlapping classes are equal. This is the key mathematical protection missing from the keyword grouping rule.

The distinct equivalence classes therefore form a **partition** of D: nonempty blocks, pairwise disjoint, whose union is D. Every object is in its own class by reflexivity, so the blocks cover the domain. Conversely, a partition defines equivalence by “belongs to the same block.” That relation is reflexive, symmetric, and transitive because block membership is unique. The two descriptions express the same structure from different directions.

::: figure #fig-03-3
On the finite domain {0,1,2,3,4,5}, parity produces two disjoint blocks. The quotient contains those two blocks, rather than choosing just the numbers zero and one as its members.
:::

The **quotient set** $D/R$ is the set of distinct equivalence classes. Its elements are classes, not individual representatives, though a program may store a convenient representative label. A computation on representatives is meaningful on the quotient only if changing representative within a class cannot change the result's class or value as intended. Later modular arithmetic will use this condition to justify operations on residues.

Equality of a deterministic key produces an equivalence relation: $xRy$ when $k(x)=k(y)$. Equality supplies all three axioms. For example, stripping surrounding spaces and case-folding a name groups labels according to an explicit normalisation rule. That rule may merge two different people with the same name or collapse a distinction needed by the application. Mathematical equivalence of labels and suitability of the chosen key are separate questions.

If a similarity rule lacks transitivity, avoid calling its output equivalence classes. You could choose another clustering objective, or use connectivity through chains, but the latter changes the rule: a and c may become connected through b even though they share no keyword. The chosen repair should be declared and evaluated for its purpose. A programmer should not silently take a transitive closure and still describe the result as direct similarity.

::: check
Why does grouping records by exact equality of a fixed key avoid partially overlapping classes? Does it guarantee the key uniquely identifies a person?
:::
::: answer
Key equality is an equivalence; if two groups share a record, their keys are equal and the groups coincide. It says nothing about whether different people share that key. Identity suitability requires extra modelling or information.
:::

## Partial orders total orders and Hasse diagrams {#s5}

A **partial order** on D is reflexive, antisymmetric, and transitive. Write $x\preceq y$ for it. Unlike equivalence, it describes an ordering relationship rather than interchangeable membership. **Comparable** means $x\preceq y$ or $y\preceq x$. A **total order** is a partial order in which every pair is comparable. “Partial” permits incomparable pairs; it does not mean the three axioms hold only sometimes.

Set inclusion is a partial order on a power set. Every set includes itself; mutual inclusion gives equality; inclusion chains compose. On $\mathcal{P}(\{a,b\})$, singleton sets $\{a\}$ and $\{b\}$ are incomparable: neither includes the other. An implementation that assigns both a numerical position in a sorted list has chosen an additional ordering, not discovered an inclusion relation between them.

::: worked title="An inclusion order with incomparable objects"
The four objects are $\varnothing,\{a\},\{b\},\{a,b\}$. The empty set is below every object and the full set is above every object. The two singleton sets lie between them and are incomparable. This is a partial order but not a total order. Its least element is $\varnothing$ and greatest element $\{a,b\}$.
:::

A **Hasse diagram** for a finite partial order omits self-loops and edges already implied by transitivity. It draws a cover edge from x upward to y when $x\prec y$ and no domain object lies strictly between them. Upward paths represent the other comparisons. Omitting an edge does not make its comparison false if an upward path still exists. Conversely, objects without an upward path in either direction are incomparable in the diagram.

::: figure #fig-03-4
The inclusion order on the power set of {a,b} is a diamond. Upward edges are covers; reflexivity and the empty-to-full comparison are understood rather than drawn.
:::

A **least element** is below every domain element. A **minimal element** has no distinct element below it. A least element is necessarily minimal, but a minimal element need not be least when some objects are incomparable. There can be multiple minimal elements, while a least element is unique if it exists: two least elements would be related both ways, so antisymmetry would make them equal. Greatest and maximal are the corresponding reversed notions.

Consider the domain containing only $\{a\},\{b\},\{a,b\}$, ordered by inclusion. Both singletons are minimal; neither is least because each fails to be below the other. The full set is greatest. This example shows why a rule demanding “the smallest eligible item” needs a tie or incomparability policy. A partial order may not supply a unique choice without extra information.

Strict order notation removes equality: $x\prec y$ means $x\preceq y$ and $x\ne y$. For a partial order this strict relation is irreflexive and transitive. It is not itself reflexive, so do not classify $<$ as a non-strict partial order using the three earlier axioms. Conversely, a suitable strict order can be converted to a non-strict one by adding equality. State which convention is being used before checking its properties.

Dependencies often lead to partial orders through reachability: an object precedes another if it is the same object or has a directed path to it. To get antisymmetry for distinct objects, directed cycles must be excluded. Module 07 will develop graphs and topological ordering. For now, distinguish a direct dependency pair from its transitive reachability relation. A direct-edge list need not itself be transitive even when the overall dependency structure has a meaningful order.

Equivalence and order can coexist in an application but answer different questions. Grouping equal labels may give equivalence classes; ordering those groups by a prerequisite relation is another structure. Equality itself is both an equivalence and a partial order, though it is total only on domains of at most one element. This is another reason to read the axioms instead of assuming the categories can never overlap.

::: check
Remove the empty set from the diamond domain. Which objects are minimal, which are least, and why is sorting the remaining objects not enough to change those answers?
:::
::: answer
Both singletons are minimal, and there is no least object. A sorting implementation can choose which singleton comes first, but that additional order does not make it a subset of the other singleton.
:::

## Functions as relations and reversible mappings {#s6}

A function $f:A\to B$ can be represented by its graph $G_f=\{(x,f(x)):x\in A\}$, a subset of $A\times B$. It is a special relation because for every input in A there is exactly one output in B. A relation may have no output or several outputs for a given input, so not every relation is a function. Declaring A and B remains essential even when a graph is listed.

A function is **injective** when $f(x)=f(y)$ implies $x=y$ for all inputs. Distinct inputs must have distinct outputs; every attained output identifies at most one input. It is **surjective** onto B when every $b\in B$ has some $x\in A$ with $f(x)=b$. That property depends on the declared codomain. A function is **bijective** when both conditions hold, so every codomain member has exactly one preimage.

::: worked title="The codomain changes surjectivity"
Let $A=\{0,1,2\}$ and $f(x)=2x+1$. With $B=\{1,3,5,9\}$, the function is injective but not surjective: nine has no preimage. With $B'=\{1,3,5\}$ and the same input–output rule, it is bijective. Replacing the codomain with the image changes the specified function's target and resolves surjectivity; it does not invent a preimage for nine.
:::

The inverse relation reverses every pair of $G_f$. It defines a function on B exactly when f is bijective: surjectivity supplies an output for every inverse input, and injectivity ensures uniqueness. An injective function can instead have an inverse defined only on its image. If f is not injective, the reversed relation has multiple outputs for some input, so selecting one would require an extra rule rather than being the unique inverse.

For the real square function, $f(-2)=f(2)=4$, so it is not injective. Restricting the domain to nonnegative reals makes it injective and surjective onto the nonnegative reals, with inverse square root. This restriction is a mathematical choice. A feature mapping that drops an attribute can likewise lose distinctions between records. A later algorithm cannot reconstruct those distinctions uniquely from the feature value alone without extra information or assumptions.

An identifier key intended to identify every stored record uniquely should be injective on the record domain. It need not be surjective onto every possible identifier string: unused identifiers are normal. A label mapping may intentionally be many-to-one, because multiple records belong to the same class. Treating a label as a unique identifier would confuse these two purposes. The required property follows from the specification rather than from the word “mapping.”

Cardinality comparisons can be expressed by mappings. For finite sets, an injection A to B shows A has at most as many members as B; a bijection shows equal size. Equal finite sizes do not make every mapping bijective: a function may collide on two inputs and omit an output. You still need to inspect the actual rule. For infinite sets, a proper subset may have a bijection with the original set, so finite intuitions about “strictly fewer” do not transfer automatically.

A brief **countability** preview illustrates this. The map $n\mapsto2n$ is a bijection from the natural numbers, including zero, to the even natural numbers, despite the latter being a proper subset. The integers can be listed as $0,1,-1,2,-2,\ldots$, and the rational numbers can be listed by organising integer numerators and positive denominators and skipping duplicates. These sets are countably infinite. The real numbers are uncountable; a full diagonal argument is deferred as further proof practice, not required for the labs here.

The lesson's practical exit skill is to inspect a declared mapping, state what information it preserves, and determine whether a reversal is unique and total on the intended domain. Relations, equivalence classes, and orders give other ways to represent structure when a single reversible mapping is not appropriate. Choose the object matching the question before choosing an algorithm to process it.

::: check
A mapping sends record identifiers to binary class labels and maps several records to each label. Is it injective? If both labels occur, is it surjective onto {0,1}? Can a label uniquely recover a record?
:::
::: answer
It is not injective because distinct records share a label. If both labels occur, it is surjective onto that codomain. A label cannot uniquely recover a record; surjectivity does not remove collisions.
:::

## Common misconceptions {#wrong}

| Symptom | Cause | Repair |
|---|---|---|
| A repeated observation disappears | A list was replaced with a set | Preserve multiplicity when the problem requires it |
| Complement includes unexpected records | No common universe was stated | Declare U before taking any complement |
| Antisymmetry is rejected because self-pairs exist | “Anti” was interpreted as no reverse pairs | Test mutual pairs only for distinct objects |
| Similar documents form unstable groups | Symmetry was mistaken for equivalence | Exhibit the failed triple and choose an explicit grouping objective |
| A later representative produces a different class | The rule lacks equivalence properties | Use a genuine equivalence or label the alternative clustering method |
| A minimal object is called least | Incomparable objects were ignored | Test comparison against every domain object |
| An inverse is assumed from a formula alone | Domain, codomain, or collisions were omitted | Check both uniqueness and coverage of inverse inputs |

## Lab setup {#setup}

Use Python 3.11 or later and the [Python primer](python_primer_EN.html) if needed. No packages are required. `&`, `|`, and `-` on sets mean intersection, union, and difference; they are not scalar arithmetic in these expressions. Explain predicted results, observed structure, and a fault or variation for each lab. Allocate ten explanation points per lab: 3 for prediction, 4 for interpretation, 3 for diagnosis.

## Lab 1 Enumerate set identities {#lab1}

**Forty minutes:** list the eight subsets of {0,1,2}, predict the number of ordered triples of subsets, and run the script. It compares distributivity and a complement identity on every triple in this one universe. Explain why there are 512 triples, why the output sorts elements, and why the general proof still needs an arbitrary-member argument. Replace the right-hand intersection in De Morgan's law with union; preserve a failing A,B pair and repair it.

{{LAB:lab1}}

## Lab 2 Classify finite relations {#lab2}

**Forty minutes:** predict all four properties for equal parity, distance at most one, $\le$, and $<$. Run the classifier and read each returned witness against the exact definition. Modify the domain to (0,1,2,3) and predict a new witness before execution. The identity relation's final check demonstrates that symmetry and antisymmetry can coexist. The explorer above lets you create missing diagonal, reverse-pair, and transitivity failures directly.

{{LAB:lab2}}

## Lab 3 Diagnose a grouping rule {#lab3}

**Forty minutes:** predict the normalised-name groups and the two greedy keyword groupings. Run and explain the different results. Equality of a fixed key forms equivalence classes, while direct shared-keyword similarity does not. Do not describe normalised names as verified personal identity. As a variation, add a fifth record with name “Ada” but representing another person; explain why the code remains mathematically correct for its key and unsuitable for identifying people.

{{LAB:lab3}}

## Exercises with complete solutions {#exercises}

Exercises 1–12 have a 110-minute budget and five points each. The optional pair adds 25 minutes. For a failed property, give inputs satisfying the premise and violating the conclusion. For a proof, state the domain and use an arbitrary member or complete logical argument.

::: exercise #e1 level=1 kind=calculation minutes=5
For $U=\{0,1,2,3\}$, $A=\{0,2\}$, $B=\{1,2\}$, compute union, intersection, both differences, and $A^c$.
:::
::: solution
The results are $\{0,1,2\}$, $\{2\}$, $\{0\}$, $\{1\}$, and $\{1,3\}$. Difference direction changes the selected members; the complement uses the specified U.
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
For $A=\{a,b\}$ decide $a\in A$, $\{a\}\subseteq A$, $\varnothing\subseteq A$, and $\varnothing\in A$. List $\mathcal{P}(A)$.
:::
::: solution
The first three are true and the fourth false. The power set is $\{\varnothing,\{a\},\{b\},\{a,b\}\}$. Membership and inclusion ask different questions.
:::

::: exercise #e3 level=1 kind=calculation minutes=5
List $\{0,1\}\times\{a,b\}$ and compare with the reversed product. What if the second factor is empty?
:::
::: solution
The pairs are $(0,a),(0,b),(1,a),(1,b)$. Reversed pairs put letters first and numbers second. An empty factor yields no pair, so the product is empty.
:::

::: exercise #e4 level=1 kind=conceptual minutes=5
State the four relation properties as quantified rules and identify the shape of one counterexample for each.
:::
::: solution
Reflexivity requires every $(x,x)$; a missing one refutes it. Symmetry requires a reverse for each present pair; a missing reverse refutes it. Antisymmetry forbids distinct mutual pairs. Transitivity requires $(x,z)$ whenever $(x,y),(y,z)$ are present; a missing closing pair in a triple refutes it.
:::

::: exercise #e5 level=2 kind=proof minutes=10
With complements relative to U, prove $(A\cup B)^c=A^c\cap B^c$ by arbitrary membership.
:::
::: solution
For arbitrary $x\in U$, $x\in(A\cup B)^c$ iff $x\notin A\cup B$, iff $x\notin A$ and $x\notin B$, iff $x\in A^c\cap B^c$. Outside U neither complement side has members. Hence the sets agree everywhere.
:::

::: exercise #e6 level=2 kind=proof minutes=10
Prove equal parity is an equivalence on integers using differences, not a finite table.
:::
::: solution
$x-x=0$ is even. If $x-y=2k$, then $y-x=2(-k)$ is even. If $x-y=2k$ and $y-z=2l$, then $x-z=2(k+l)$ is even. These prove reflexivity, symmetry, and transitivity for arbitrary integers.
:::

::: exercise #e7 level=2 kind=proof minutes=10
Show any two overlapping classes of an equivalence relation are equal. Name where symmetry and transitivity enter.
:::
::: solution
For shared z, $xRz,yRz$ and symmetry give $xRy$. For $u\in[x]$, symmetry gives $yRx$, and transitivity gives $yRu$, so $[x]\subseteq[y]$. Reversing x,y proves the opposite inclusion. Thus overlap forces equality.
:::

::: exercise #e8 level=2 kind=application minutes=10
Draw the Hasse diagram of inclusion on $\mathcal{P}(\{a,b\})$. Identify the incomparable pair, least element, and greatest element.
:::
::: solution
Draw empty at the bottom, the two singletons in the middle, and the full set at the top, with four upward cover edges. The singletons are incomparable. Empty is least and full greatest. The empty-to-full relation follows by a path and needs no direct edge.
:::

::: exercise #e9 level=2 kind=application minutes=10
Let $f:\{0,1,2\}\to\{0,1\}$ satisfy $f(0)=0,f(1)=1,f(2)=0$. Classify injectivity and surjectivity and describe its inverse relation.
:::
::: solution
It is not injective because zero and two collide. It is surjective because both outputs occur. The inverse relation contains $(0,0),(0,2),(1,1)$ and is not a function: input zero has two outputs.
:::

::: exercise #e10 level=2 kind=application minutes=10
Group {0,1,2,3,4,5} by equal parity. Write the quotient set and distinguish it from one possible set of representative labels.
:::
::: solution
The quotient is $\{\{0,2,4\},\{1,3,5\}\}$. Labels such as {0,1} may represent its two classes in a program, but the quotient's mathematical elements are the blocks themselves.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=15
A report says a relation cannot be antisymmetric because it contains $(0,0)$. Refute the reasoning and give a genuine failed-antisymmetry witness.
:::
::: solution
The implication permits mutual pairs when their objects are equal, so $(0,0)$ is harmless. A relation containing $(0,1)$ and $(1,0)$ fails antisymmetry because zero and one are distinct. Equality is both symmetric and antisymmetric.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=15
Use the keyword example to explain order-dependent representative grouping. Is making all chain-connected documents one block a faithful implementation of direct keyword sharing?
:::
::: solution
Starting with a groups a,b, then excludes c because c does not match representative a. Starting with b can group all three. The rule is not transitive. Chain connectivity would group all three consistently, but then a,c are grouped without a direct shared keyword. It is a different declared relation, not preservation of the original direct-match rule.
:::

::: exercise #e13 level=3 kind=proof minutes=10
Optional: prove $n\mapsto2n$ is a bijection from $\mathbb{N}$ onto the even natural numbers and explain why it is not surjective onto all of $\mathbb{N}$.
:::
::: solution
If $2m=2n$, cancellation gives $m=n$, so it is injective. Every even natural is $2k$ for a natural k, giving a preimage. An odd natural such as one has no preimage, so enlarging the codomain to all naturals breaks surjectivity.
:::

::: exercise #e14 level=3 kind=proof minutes=15
Optional: prove a least element of a partial order, if present, is unique. Then give an order with two minimal elements and no least element.
:::
::: solution
If a and b are both least, $a\preceq b$ and $b\preceq a$, so antisymmetry gives $a=b$. Inclusion on $\{\{a\},\{b\},\{a,b\}\}$ has two incomparable minimal singletons and no least member. Existence and uniqueness are different issues.
:::

## Self check quiz {#quiz}

Complete nine automatically checked choices and one written explanation. Review the definitions when feedback identifies a confusion; a familiar name does not replace its quantified rule.

```quiz
? Which statement holds for every set A?
- [x] The empty set is a subset of A.
- [ ] The empty set is an element of A.
- [ ] A has at least one member.
> Empty inclusion is vacuously true. Membership of the empty set needs an explicit member, and A itself may be empty.

? What is the complement of A relative to U?
- [ ] Every conceivable object outside A.
- [x] Members of U that are not in A.
- [ ] Members shared by A and U.
> The universe restricts the complement. Shared members form an intersection and an unspecified collection of all objects is not the declared complement.

? How many subsets does {a,b,c} have?
- [ ] Three.
- [x] Eight.
- [ ] Six.
> Each of three members can be included or excluded, giving 2 cubed. Counting just singletons or omitting empty/full subsets misses valid members.

? What refutes transitivity?
- [ ] A missing self-pair alone.
- [x] xRy and yRz hold but xRz does not.
- [ ] Two equal objects related both ways.
> Transitivity concerns chains and closing pairs. A missing self-pair refutes reflexivity; mutual equal objects do not violate antisymmetry.

? Can a relation be symmetric and antisymmetric?
- [x] Yes, equality is an example.
- [ ] No, the names are opposites.
- [ ] Only if it is not transitive.
> Equality has reverse pairs but no distinct mutual pairs. It is also transitive, so the other answers misread the definitions.

? What happens when two equivalence classes overlap?
- [ ] They may partly overlap indefinitely.
- [x] They are equal.
- [ ] Their relation stops being reflexive automatically.
> Symmetry and transitivity force all their members to agree. A partial overlap signals a failed equivalence assumption rather than a normal pair of classes.

? Which extra property makes a partial order total?
- [ ] Every object has a different predecessor.
- [x] Every pair is comparable.
- [ ] Every pair is equivalent.
> Totality requires one ordering direction for each pair. A predecessor is not required, and equivalence is a different structure.

? Surjectivity of f:A to B depends on what?
- [ ] Only its formula, never its codomain.
- [x] Whether every declared member of B is attained.
- [ ] Whether two inputs collide.
> Codomain coverage defines surjectivity. Collisions concern injectivity; changing B can change surjectivity while keeping the same rule.

? When does reversing a function's pairs give a function on its entire codomain?
- [ ] Whenever it is surjective, even with collisions.
- [ ] Whenever it is injective, even with unused outputs.
- [x] When it is bijective.
> Surjectivity supplies an inverse output for every codomain member; injectivity makes that output unique. Both are necessary for a total inverse on B.
```

<div class="free-response" data-free-response data-key="math-series:m03:q10">
<label for="q10-response"><strong>Question 10.</strong> Explain why shared-keyword grouping does not define equivalence classes. Give the three documents and identify the violated axiom.</label>
<textarea id="q10-response" aria-describedby="q10-review" placeholder="Write your argument here"></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I checked the two present pairs and missing closing pair against the model answer.</label>
</div>

::: answer
Use keyword sets a={python}, b={python,ai}, c={ai}. Then aRb and bRc, but not aRc, violating transitivity. Equivalence needs reflexivity, symmetry, and transitivity; symmetry alone is insufficient. Award the written point for the explicit three-object witness and correct axiom, not just a statement that grouping “looks inconsistent.”
:::

## Guided reading {#reading}

**Required, 15 minutes:** in the textbook linked by [MIT Mathematics for Computer Science](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/), read the elementary set and binary-relation definitions. Rewrite one membership identity using logical connectives and compare the use of subset notation.

**Required, 20 minutes:** read its equivalence-relation and partial-order discussions. Write their axiom lists side by side and explain which axiom changes the purpose. Draw the four-object inclusion diagram yourself. Advanced countability is optional here.

**Optional:** use the official [Python set documentation](https://docs.python.org/3/library/stdtypes.html#set-types-set-frozenset) to compare mutable sets with `frozenset` and to distinguish empty-set construction from an empty dictionary. All diagrams and teaching examples here are original.

## Review and readiness for proofs {#summary}

Membership gives set operations; arbitrary-member arguments establish identities. Relations select pairs, and quantified axioms determine which structures they represent. Equivalence gives partitions into interchangeable blocks. Partial orders give comparisons that may leave some objects incomparable. Functions add unique outputs; bijections permit unique reversal on the whole codomain.

**Exit task:** prove one complement identity, classify a three-object relation with concrete failure witnesses, draw a Hasse diagram with an incomparable pair, and determine whether a listed function has a total inverse. Use exercises 60, lab explanations 30, and quiz 10 including the reviewed written point. Explain any failed prerequisite after correction.

Module 04 develops direct proofs, contradiction, induction, and program invariants. Its starting skill is to take an arbitrary object, use the relevant definitions, and state a conclusion whose scope matches the argument. Keep the membership and parity proofs as examples of that pattern.

## Notation and bilingual terms {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| $\in$, $\subseteq$ | Membership, inclusion allowing equality | 属于、包含于 |
| $\cup$, $\cap$, $\setminus$ | Union, intersection, difference | 并、交、差 |
| $A^c=U\setminus A$ | Complement in a fixed universe | 补集 |
| $\mathcal{P}(A)$, $A\times B$ | Power set, Cartesian product | 幂集、笛卡尔积 |
| Reflexive / symmetric | All self-pairs / all reverse pairs | 自反 / 对称 |
| Antisymmetric / transitive | No distinct mutual pairs / chains close | 反对称 / 传递 |
| $[x]$, $D/R$ | Equivalence class, quotient set | 等价类、商集 |
| Partition | Disjoint nonempty blocks covering a domain | 划分 |
| Partial / total order | Order axioms / additionally all pairs comparable | 偏序 / 全序 |
| Least / minimal | Below all / no distinct predecessor | 最小 / 极小 |
| Injective / surjective / bijective | No collisions / codomain covered / both | 单射 / 满射 / 双射 |
