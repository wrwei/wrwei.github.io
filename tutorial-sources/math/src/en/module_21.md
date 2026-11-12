## Probability begins with an experiment and a model {#start}

Probability quantifies uncertainty inside a stated model. The same outcome labels can carry different probabilities, and conditioning changes the population against which an event is compared. This lesson builds exact finite models, proves elementary identities, derives Bayes' rule, and tests independence and selection claims. The binary positive-result example is synthetic mathematics with specified rates, rather than guidance about any actual diagnostic system.

**Retrieval check:** [Module 03](module_03_EN.html#s1) supplies sets, intersections and complements; [Module 05](module_05_EN.html#s1) supplies counting with explicit uniformity assumptions. No calculus is required. The labs use only the Python standard library, exact rational arithmetic and a locally seeded pseudorandom generator.

## Sample spaces events and probability axioms {#s1}

An experiment has a sample space Ω of possible elementary outcomes. An outcome ω is one element, while an event A is a set of outcomes answering a yes/no question. A probability model specifies Ω, an event collection F and a probability function P. In a finite model all subsets can be events, so F is the power set. In more general spaces an event collection is a sigma-algebra: it contains Ω and is closed under complements and countable unions. We state this structure now without requiring measure-theory machinery for our finite computations.

The axioms are P(A)≥0, P(Ω)=1, and countable additivity on pairwise disjoint events: P(∪A_i)=ΣP(A_i). Finite additivity follows by padding a finite disjoint collection with empty events. P(∅)=0 follows from P(Ω)=P(Ω)+P(∅). The complement identity P(Aᶜ)=1−P(A) follows from the disjoint decomposition Ω=A∪Aᶜ. Therefore every probability lies between zero and one. These are model rules; an arbitrary table of scores is not a probability table until nonnegativity and normalisation are established.

In finite Ω, assign masses p_ω≥0 summing to one and define P(A)=Σ_{ω∈A}p_ω. This automatically satisfies the axioms. Raw nonnegative weights w_ω with positive finite total W can be normalised as p_ω=w_ω/W. Uniformity is the special choice p_ω=1/|Ω|, not a consequence of having finitely many outcomes. If some outcomes are impossible in the model, their mass can be zero; their presence in Ω does not force a positive probability. Probabilities express the specified mechanism or belief model, whose adequacy must be evaluated separately.

::: worked title="Identical labels can have different masses"
Take Ω={HH,HT,TH,TT} with weights 1,2,3,4, total 10. Let A mean the first symbol is H and B the second is H. Then P(A)=3/10, P(B)=4/10 and P(A∩B)=1/10. The outcome HH has mass 1/10, not 1/4. These labels do not describe two independent fair coins unless that additional mechanism is explicitly assumed. The finite weighted table is itself a complete valid model.
:::

For a countably infinite example, Ω={1,2,…} with p_n=2^{−n} is normalised because its geometric sum is one. There is no uniform positive mass on every positive integer: any fixed mass c>0 makes the partial sums eventually exceed one, while c=0 gives total zero by countable additivity. Thus “choose a random integer uniformly from all integers” does not specify such a probability distribution. Choosing uniformly from a finite range is a different, well-defined experiment with a stated range.

Countable additivity also gives continuity of probabilities. If A₁⊂A₂⊂… increases to A, write A as the disjoint union of A₁ and differences A_k\A_{k−1}; its probability is the limit of the partial sums P(A_k). For decreasing events use complements to obtain P(∩A_k)=lim P(A_k). This connects an infinite event to finite approximations without replacing a mathematical limit by a finite simulation. General uncountable unions need not be covered by the same axiom; a continuous outcome can have zero point mass while a whole interval has positive probability, as the next module develops.

Set identities determine event operations. A∩B means both, A∪B means at least one, and Aᶜ means the event does not occur. “Exactly one” is (A\B)∪(B\A), not the ordinary union. A partition consists of disjoint events covering Ω and is useful for conditioning by cases. Translate the verbal experiment first: selecting two records with replacement and selecting without replacement use different outcome spaces and dependence mechanisms even if the result labels look similar.

::: figure #fig-21-1
An event selects outcomes from a normalised model. Four labels need not imply four equal masses or two independent fair draws.
:::

::: check
What separates an outcome from an event? Can a finite sample space be nonuniform? Why is a uniform distribution on all positive integers impossible under these axioms?
:::
::: answer
An outcome is an element and an event is a set of elements. Arbitrary nonnegative masses summing to one give a finite model. Equal positive integer masses would sum beyond one, whereas equal zero masses sum to zero; neither normalises countably many integers.
:::

## Uniformity unions inclusion–exclusion and event bounds {#s2}

Counting gives P(A)=|A|/|Ω| only when elementary outcomes are equally likely. The choice of elementary outcomes matters: sums of two fair independent dice range from 2 to 12, but those eleven sums are not equally likely. The ordered die pairs are the 36 equiprobable elementary outcomes. Sum seven has six pairs and sum two only one. Grouping elementary outcomes creates a new representation with masses equal to the sums of the grouped probabilities, rather than resetting each group to equal mass.

If A⊂B, decompose B into A and B\A to obtain P(B)=P(A)+P(B\A)≥P(A). This monotonicity lets probability bounds follow from set inclusions. For arbitrary A,B, decompose their union into disjoint A\B, A∩B and B\A. Adding masses gives P(A∪B)=P(A)+P(B)−P(A∩B). The subtraction corrects double counting; it does not assume independence. For three events add singleton probabilities, subtract all three pairwise intersections, and add the triple intersection once.

The union bound P(∪_{i=1}^m A_i)≤Σ_i P(A_i) follows by discarding nonnegative overlap corrections, or by replacing each A_i with its part not already counted. The same disjointification and countable additivity extend it to countably many events. This bound requires no independence and can be loose. Since probability is at most one, report the tighter of one and the sum when that improves presentation. A bound above one is still an algebraically valid upper bound, but supplies no useful additional restriction.

::: worked title="A reliability bound without independent failures"
Suppose three components have failure probabilities .01, .02 and .03 in a specified operation. Without a joint model, failure of at least one has probability at most .06 by the union bound and at least .03 by inclusion of the third failure event. If their failures are mutually independent, the exact probability is 1−(.99)(.98)(.97)=.058906. That exact expression needs independence, whereas the interval [.03,.06] does not. Common power loss could make the independence assumption unrealistic.
:::

Disjointness and independence describe different relations. Disjoint events cannot occur together, so P(A∩B)=0. Independence asks for P(A∩B)=P(A)P(B). If both probabilities are positive, disjoint events are necessarily dependent: knowing A occurred excludes B. If one event has probability zero, the product condition can hold even for disjoint events, though conditioning on that null event remains undefined by the elementary ratio. Avoid defining independence solely by a conditional statement with an unavailable denominator.

For the weighted four-symbol table, union mass is .3+.4−.1=.6 and exactly-one mass is .3+.4−2(.1)=.5. Under independent fair symbols, those corresponding masses would be .75 and .5. The exactly-one equality across two different models is coincidental and does not establish that the models are identical. A few matching event probabilities cannot recover every elementary mass unless the chosen events determine the complete distribution.

Event bounds also clarify algorithm claims. If each of m checks fails with probability at most ε, the probability any fails is at most mε even when the failures are dependent. A target total failure bound δ can therefore be obtained by making each bound at most δ/m. This is a sufficient allocation of error budgets, not proof that exactly mε failures occur. Randomised algorithms need a model for their random bits and often condition on a fixed input; randomness of the input is an additional assumption, not supplied by the algorithm's seed.

For repeated sampling without replacement, the denominator changes with the draw. From a box of three red and two blue tokens, probability of two reds is (3/5)(2/4)=3/10 for ordered draws without replacement. With replacement and independently repeated draws it is (3/5)²=9/25. Both answers use the same initial proportions but different experiments. The counting version agrees: without replacement choose two tokens uniformly from the ten unordered pairs; three pairs are both red. Agreement checks the complete model rather than legitimising an unspecified drawing procedure.

::: check
Which assumption justifies favourable-count divided by total-count? Does the union bound need independence? Can two disjoint positive-probability events be independent?
:::
::: answer
Equiprobable elementary outcomes justify counting ratios. The union bound is valid without independence. Positive disjoint events have joint mass zero but a positive product, so they are dependent.
:::

## Conditioning chain rules and table denominators {#s3}

For P(B)>0 define P(A|B)=P(A∩B)/P(B). Conditioning restricts attention to B and renormalises its probabilities. On a finite model, each outcome in B gets conditional mass p_ω/P(B), while outcomes outside B get zero. This produces a valid probability model on the restricted population. The conditioning event need not occur earlier in time and does not automatically describe an intervention. Learning that an event happened and externally forcing a mechanism are different operations unless a causal model justifies equating them.

The denominator is the population after the vertical bar. P(A|B) asks what fraction of B outcomes also satisfy A; P(B|A) asks the reverse fraction. They share the same intersection numerator but generally different denominators. In the weighted example P(A|B)=(1/10)/(4/10)=1/4, while P(B|A)=(1/10)/(3/10)=1/3. The numerical values are conditional probabilities of sets, not informal translations of the same sentence.

::: worked title="Two table ratios answer two different questions"
In a synthetic population of 100,000 records, label D has prevalence 1%, a positive system result has rate 90% within D, and rate 5% outside D. Expected table counts are D+:900, D−:100, not-D+:4,950, not-D−:94,050. Sensitivity P(+|D)=900/1,000=.9, while P(D|+)=900/5,850=2/13≈.153846. The positive-result population is larger than the D population, so reversing the denominator changes the answer dramatically. These are model-expected counts, not observed data.
:::

Rearranging the conditional definition gives the multiplication rule P(A∩B)=P(B)P(A|B)=P(A)P(B|A), where the relevant denominators are positive. For a sequence, P(A₁∩…∩A_k)=P(A₁)P(A₂|A₁)…P(A_k|A₁∩…∩A_{k−1}), provided each conditioning prefix has positive probability. This chain rule does not assume independence. Independence is the extra simplification that replaces conditional factors by corresponding marginal factors. A probability tree encodes exactly these conditional branches, whose children must sum to one under each positive parent.

If a prefix has zero probability, its intersection with later events also has zero mass. One can compute that branch as zero without pretending a ratio conditioned on the zero prefix is defined. Some models assign branch probabilities to unreachable states as part of a generative specification; these assignments do not determine unique conditional ratios at those states. For continuous observations, conditioning on exact zero-mass points requires a more advanced conditional-density construction later. The elementary event formula cannot be extended by dividing zero by zero.

The law of total probability uses a finite or countable partition B_i with positive-probability cases: P(A)=Σ_i P(A|B_i)P(B_i). It follows by decomposing A into disjoint A∩B_i. Null cases contribute zero through intersection masses without defined conditional ratios. Partition cases must be mutually exclusive and cover the population; overlapping groups cannot be inserted into the sum without correcting double counting. This law combines within-group rates using group proportions, so different mixture proportions can change a pooled rate even if every within-group mechanism stays fixed.

For two-stage selection, suppose a record is from group H with probability .2 and L with probability .8, and event E has respective probabilities .8 and .1. Then P(E)=.2(.8)+.8(.1)=.24. The H-and-E mass is .16, hence P(H|E)=2/3, while the initial H mass was .2. This shift follows from explicit event filtering and does not establish a causal effect of group membership. The joint table or tree provides an auditable calculation when verbal claims obscure the base population.

Chain-rule factorizations also appear in sequence models. P(tokens t₁,…,t_k)=Π_i P(t_i|t₁,…,t_{i−1}) is a general identity for positive-probability prefixes, not an assumption that tokens are independent. A language model approximates those conditional distributions using its own parameterisation and training data. The mathematical factorisation does not certify the quality of those approximations; it separates the probability identity from the modelling choice.

::: figure #fig-21-2
The same joint table supplies sensitivity and posterior, but each uses a different denominator. The positive rate is .0585, not .058.
:::

::: check
What makes elementary conditioning defined? Does the chain rule need independence? What weights combine partition-specific conditional rates?
:::
::: answer
The conditioning event must have positive probability. Chain factors are conditional and need no independence. Total probability weights each within-case rate by that case's probability, with disjoint exhaustive cases.
:::

## Bayes' rule likelihood ratios and prior odds {#s4}

Bayes' rule follows by using the same joint mass in both conditional directions: P(A|B)=P(B|A)P(A)/P(B), with P(B)>0 and the right-side conditional defined. A partition gives the denominator as Σ_i P(B|A_i)P(A_i). The prior P(A) specifies mass before learning B; the likelihood P(B|A) describes how likely that evidence is under the case; the posterior renormalises their product after learning B. These are functions of different arguments and cannot be interchanged merely because both are probabilities.

$$P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}.$$

For a binary case D with prior π, sensitivity s=P(+|D), and false-positive rate r=P(+|Dᶜ), total positive probability is πs+(1−π)r. Provided this is positive, posterior is πs/[πs+(1−π)r]. With π=.01,s=.9,r=.05, the true-positive mass is .009 and false-positive mass .0495, giving .0585 total and 2/13 posterior. A rare case can be outnumbered by false positives despite a large sensitivity. The expression makes that effect a countable comparison rather than a slogan about system accuracy.

::: worked title="Updating odds reveals the evidence multiplier"
Prior odds are P(D)/P(Dᶜ)=1/99. The positive likelihood ratio is s/r=.9/.05=18. Posterior odds are 18/99=2/11, giving posterior probability odds/(1+odds)=2/13. For a negative result, likelihood ratio is (1−s)/(1−r)=.1/.95=2/19; posterior odds become 2/1881 and probability 2/1883. The negative posterior is small because negative evidence and the low prior both favour not-D in this model.
:::

The odds derivation divides P(D|B) by P(Dᶜ|B); the common evidence denominator cancels, leaving likelihood ratio times prior odds. It requires nonzero relevant denominators, or a careful limiting/support treatment when evidence is impossible under one case. If r=0 and πs>0, a positive result has posterior one. If πs+(1−π)r=0, positives have zero probability and the elementary posterior is undefined. Distinguish a genuinely impossible-evidence case from a numerical zero caused by rounding or an unsupported model parameter.

When prior π changes but conditional rates s,r remain stable, the posterior changes. At π=.5 with the same rates, positive posterior is .9/(.9+.05)=18/19≈.947368. This is a calculation under a transport assumption: the within-case response rates must remain applicable in the new population. Real dataset changes can alter those rates too, so Bayes' formula does not promise that simply replacing the prevalence repairs every deployment shift. State which part of the model is assumed invariant and which is re-estimated.

Repeated evidence cannot be multiplied independently without a conditional-independence assumption. If two result events E₁,E₂ are conditionally independent given D and also given Dᶜ, their combined likelihood ratio factors into the product of the two separate ratios. Without both conditions use P(E₁∩E₂|D)/P(E₁∩E₂|Dᶜ) from the joint model. A duplicate of the same observation is perfectly dependent and provides no new information: conditioning twice on B is just conditioning on B once. Counting copied evidence twice can manufacture unjustified confidence.

Bayesian event updating here assumes the model probabilities are supplied. Later modules estimate unknown parameters and introduce priors over parameters; those are additional levels of uncertainty. A known-rate event posterior is neither a confidence interval nor a guarantee about an individual realised outcome. Its meaning is conditional probability within the model. To evaluate a system empirically, record the population, outcomes and sampling protocol, then assess whether the assumptions and estimated rates remain defensible.

For computational implementation form nonnegative joint masses first and then normalise. Check that their sum is positive. With many factors, products may underflow; logarithms and stable normalisation later help preserve meaningful arithmetic, but they do not fix a wrong conditional model. An explanation should report the numerator's joint event and denominator's evidence event in words. That check catches reversed conditionals more reliably than memorising the order of letters in a formula.

::: widget name=bayes
:::

The explorer changes the prior, sensitivity and false-positive rate for this synthetic binary model. It shows expected counts per 100,000 records, the evidence probability and both conditional directions. Endpoint settings include impossible positive evidence; the posterior must then be labelled undefined rather than shown as zero or left at its previous value. At zero D or not-D prior mass, the generative mechanism can still specify a branch parameter, while its conditional ratio from the joint table is undefined.

::: check
Which event does the Bayes denominator describe? Why do copied positive results not supply two independent likelihood ratios? What makes the posterior undefined?
:::
::: answer
The denominator is the probability of the evidence event, here all positives. Copied evidence is the same event, not a conditionally independent new draw. A zero evidence probability makes the elementary conditional ratio undefined.
:::

## Pairwise mutual and conditional independence {#s5}

Events A,B are independent when P(A∩B)=P(A)P(B). With positive denominators this is equivalent to P(A|B)=P(A) and its reverse. Complementation preserves independence: P(A∩Bᶜ)=P(A)−P(A∩B)=P(A)(1−P(B)), and the other complemented forms follow similarly. This exact product identity belongs to the model. Finite sample frequencies will usually fail exact equality even under an independent generating mechanism, so small numerical deviations need statistical interpretation rather than automatic rejection of the mechanism.

For k events, mutual independence requires factorisation for every subcollection, not only every pair and not only the full intersection. Pairwise independence checks the two-event subcollections; it can coexist with a higher-order dependence. For fair independent bits X,Y, define events A={X=1}, B={Y=1}, C={X xor Y=1}. Each has probability 1/2 and each pair has intersection 1/4, yet the triple intersection is empty because X=Y=1 makes their xor zero. The triple product is 1/8, disproving mutual independence.

::: worked title="Pairwise independence does not licence a three-factor product"
The four equiprobable outcomes (0,0),(0,1),(1,0),(1,1) give A∩B={(1,1)}, A∩C={(1,0)} and B∩C={(0,1)}. All three pair masses are 1/4, matching (1/2)². But A∩B∩C=∅ has mass zero. A reliability calculation multiplying three marginal success probabilities would therefore be wrong even though all pair checks pass.
:::

Conditional independence given E with P(E)>0 is independence inside the conditional model: P(A∩B|E)=P(A|E)P(B|E). Conditioning can create or destroy independence. Given each value of a latent group, two measurements may be independent, while mixing groups creates marginal association. Conversely selecting records by a condition involving two originally independent events can create dependence among the selected records. Neither conditional nor marginal independence automatically implies the other.

For a latent binary group Z with equally probable values, let A and B be conditionally independent with rate .9 when Z=1 and .1 when Z=0. Marginal P(A)=P(B)=.5, but P(A∩B)=.5(.81)+.5(.01)=.41, exceeding .25. Shared group variation explains the association despite within-group independence. This example gives a complete joint mechanism: draw Z then draw A and B independently using that group's rate. Declaring independence merely from the existence of distinct variables would erase the common source.

For the opposite selection effect, start with independent fair bits A,B and retain only S={A or B}. The selected outcomes are (1,0),(0,1),(1,1), each with conditional mass 1/3. Thus P(A|S)=P(B|S)=2/3 and P(A∩B|S)=1/3, which differs from 4/9. Within the selected records, observing A=0 forces B=1. The original independent model remains correct; selection creates a new conditional population in which it no longer factors.

::: figure #fig-21-3
The xor table passes every pair test but fails the triple test. Independence is a claim about specified collections and the specified conditioning population.
:::

Mutual independence of generated outcomes should also be distinguished from reproducibility. A fixed seed makes a pseudorandom simulation repeatable; it does not magically create independent experiments if the same generated sequence is reused and treated as fresh data. Mathematical analyses usually idealise random draws with specified independence; the implementation should state its generator, local seed and reuse pattern. Correlated draws and repeated evidence affect probability products, and later modules quantify their effect on uncertainty estimates.

::: check
Does pairwise independence imply mutual independence? Does conditional independence imply marginal independence? Can retaining A or B create dependence from independent fair bits?
:::
::: answer
The xor construction disproves the first claim. A latent-group mixture disproves the second. Conditioning on the union removes the (0,0) outcome and gives joint 1/3 versus product 4/9, so the selected population is dependent.
:::

## Base populations selection effects and model verification {#s6}

Every rate has a denominator and a population. A positive-only sample estimates a fraction conditional on positivity, rather than the population prevalence. In the synthetic table, the selected D fraction is 2/13 while population prevalence is 1/100. A selection rule depending on outcomes therefore changes what a reported frequency estimates. Enlarging that selected sample can estimate the wrong target ever more precisely; size does not remove a denominator mismatch. State the target event and population before collecting or interpreting counts.

Pooled comparisons also depend on group mixtures. Suppose system A succeeds on 9/10 easy records and 30/100 hard records, while B succeeds on 80/100 easy and 2/10 hard records. A has higher within-group success in both groups: .9>.8 and .3>.2. Yet A's pooled success is 39/110≈.354545, below B's 82/110≈.745455, because A was evaluated mostly on hard records. This Simpson reversal is an arithmetic mixture effect, not a contradiction in probability.

::: worked title="Use a common evaluation mixture before comparing pooled rates"
With a specified target mixture of half easy and half hard, A's standardised success is .5(.9)+.5(.3)=.6 and B's is .5(.8)+.5(.2)=.5. This answers a different, explicitly shared evaluation question from the original pooled samples. It assumes the within-group rates transport to that target. Neither standardisation nor the raw observational comparison alone proves that changing the system causes the difference; causal identification needs a suitable design and assumptions developed later.
:::

An auditable finite model has a complete outcome list or generative tree, nonnegative masses, a normalised total, precise events and explicit conditioning. Check that complementary branches sum to one and a partition really covers the space. Test identities with exact fractions where practical. A finite enumeration can prove an identity for that finite model, while a simulation only samples its mechanism. Neither establishes that the chosen mechanism adequately represents every real application.

Lab 1 enumerates weighted outcomes and the xor construction exactly. Lab 2 generates a million locally seeded synthetic records and compares conditional frequencies at increasing checkpoints with the derived posterior. A trace can fluctuate, and its error need not decrease at every checkpoint. This lesson does not infer a convergence theorem from one run. The law of large numbers, concentration and Monte Carlo error statements arrive in Module 24 with their assumptions. Report zero-denominator frequencies as undefined, especially in small or rare-event samples.

Lab 3 separates sensitivity from posterior, demonstrates a selected-population dependency and computes the Simpson reversal. Its examples use known mathematical masses or explicit finite tables. When a real dataset is substituted, rates become estimates of an unknown model and need uncertainty analysis. A synthetic expected table can contain fractional expected counts and is not a promise that a finite realised sample has those exact counts. Keep model probabilities, expected populations and observed frequencies labelled distinctly.

::: figure #fig-21-4
Within-group success and pooled success answer different questions when evaluation mixtures differ. A shared mixture makes the comparison's denominator explicit.
:::

The same checks matter in CS and AI. Reliability needs joint failure assumptions; randomised algorithms need stated randomness and input conditions; classifiers need a target population and class-conditional rates; sequence factorizations need the right conditional prefixes. Bayes identities connect events within a model but do not manufacture model validity, independent evidence or causal interpretation. Your exit result is a complete finite model and a correctly explained conditional calculation, with uncertainty about the model itself kept visible.

::: check
Does a large selected sample fix a wrong target population? Can simulation alone prove the posterior formula? What does a common-mixture comparison assume?
:::
::: answer
No: selection changes the target even at large size. The formula follows from the axioms and conditional definition; simulation illustrates a specified mechanism. Standardisation assumes within-group rates apply to the shared target mixture and does not alone establish causation.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| Finite outcomes are automatically uniform. | Specify elementary masses or a mechanism establishing uniformity. |
| Disjoint events are independent. | Positive disjoint events cannot factor. |
| P(A|B)=P(B|A). | The conditioning denominators differ. |
| The chain rule assumes independence. | Its conditional factors are general. |
| High sensitivity means a high positive posterior. | The prior and false-positive mass also matter. |
| Pairwise independence licences every product. | Mutual independence checks all subcollections. |
| Conditioning preserves independence. | Mixture and selection can alter it. |
| More selected data fixes selection bias. | More data can estimate a different target more precisely. |

## Three reproducible labs {#labs}

### Lab 1 · Exact weighted events and independence {#lab1}

{{LAB:lab1}}

Write each event set before running and predict both conditional denominators. Verify normalisation, inclusion–exclusion and the pair/triple xor distinction using exact fractions.

### Lab 2 · Synthetic base-rate simulation {#lab2}

{{LAB:lab2}}

Predict the posterior 2/13 and explain every counter. Check that cumulative counts sum to N. Distinguish conditional empirical sensitivity from conditional empirical posterior, and explain why a single seeded trace is illustrative rather than a convergence proof.

### Lab 3 · Reversed conditioning and selected populations {#lab3}

{{LAB:lab3}}

Repair the denominator reversal, derive the selected union table and compare raw pooled rates with a specified common mixture. Describe exactly which target each quantity answers.

## Fourteen exercises with full solutions {#exercises}

Exercises 1–12 are required. Optional Exercises 13–14 add 35 minutes beyond the ten-hour core schedule.

::: exercise #e1 level=1 kind=calculation minutes=6
For weights HH:1, HT:2, TH:3, TT:4, compute P(first H), P(second H) and their union.
:::
::: solution
Total 10 gives .3 and .4; joint HH has .1. Union .3+.4−.1=.6. Equal label counts are irrelevant because masses are unequal.
:::

::: exercise #e2 level=1 kind=calculation minutes=6
Use the same table to compute P(first H|second H) and the reverse conditional.
:::
::: solution
The shared numerator is .1; denominators are .4 and .3 respectively, giving 1/4 and 1/3. Both conditioning events have positive mass, so both ratios are defined.
:::

::: exercise #e3 level=1 kind=calculation minutes=6
Three event probabilities are .02,.03,.04. Give an independence-free upper bound on their union and a lower bound.
:::
::: solution
Union bound gives at most .09; inclusion of the largest event gives at least .04. No exact value follows without intersections or another joint assumption.
:::

::: exercise #e4 level=1 kind=calculation minutes=6
For π=.01, s=.9, r=.05, compute P(+), P(D|+) and the positive likelihood ratio.
:::
::: solution
P(+)=.009+.0495=.0585=117/2000. Posterior .009/.0585=2/13≈.153846. Likelihood ratio s/r=18, which multiplies prior odds 1/99 to give posterior odds 2/11.
:::

::: exercise #e5 level=2 kind=proof minutes=14
Prove the complement identity and event monotonicity from disjoint additivity.
:::
::: solution
Ω=A∪Aᶜ disjoint gives 1=P(A)+P(Aᶜ). If A⊂B, disjoint B=A∪(B\A) gives P(B)=P(A)+P(B\A)≥P(A). Nonnegativity is used in the last step.
:::

::: exercise #e6 level=2 kind=proof minutes=14
Prove total probability for a finite partition and derive Bayes' rule with its domain conditions.
:::
::: solution
A is the disjoint union of A∩B_i, so P(A)=ΣP(A∩B_i)=ΣP(A|B_i)P(B_i) for positive cases; null cases contribute zero via intersections. The shared mass P(A∩B)=P(B|A)P(A)=P(A|B)P(B) gives Bayes when the relevant denominators are positive. Division by a null conditioning event is unavailable.
:::

::: exercise #e7 level=2 kind=proof minutes=14
Prove independence survives replacing B by its complement and explain the null-event distinction.
:::
::: solution
P(A∩Bᶜ)=P(A)−P(A∩B)=P(A)(1−P(B))=P(A)P(Bᶜ). The product identity works even if a marginal is zero. Its equivalent conditional expression requires a positive conditioning denominator, so one cannot use P(A|B) when P(B)=0.
:::

::: exercise #e8 level=2 kind=application minutes=10
A box has three red and two blue tokens. Compare the probability of two red draws with and without replacement.
:::
::: solution
Without replacement it is (3/5)(2/4)=3/10; with independent replacement it is (3/5)²=9/25. Alternatively, without replacement there are ten equiprobable unordered pairs and three red pairs. The drawing mechanism determines the appropriate calculation.
:::

::: exercise #e9 level=2 kind=application minutes=10
Groups H,L have masses .2,.8 and E rates .8,.1. Compute P(E) and P(H|E), then explain the denominator.
:::
::: solution
P(E)=.16+.08=.24. H-and-E mass .16 gives P(H|E)=.16/.24=2/3. The denominator includes E records from both groups, not all H records. This is conditional selection, with no causal conclusion supplied.
:::

::: exercise #e10 level=2 kind=application minutes=10
In the synthetic binary model, change π to .5 while holding s=.9,r=.05 fixed. Compute the new positive posterior and state the transport assumption.
:::
::: solution
Joint masses .45 and .025 give posterior .45/.475=18/19≈.947368. The calculation assumes both class-conditional rates remain valid in the new population; a prevalence change need not be the only real dataset change.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=10
Three xor events pass every pair independence check. A report multiplies their three marginal masses. Repair it.
:::
::: solution
Each event has mass 1/2 and each pair joint 1/4, but the triple event is empty, mass zero versus product 1/8. Pairwise independence is insufficient for a three-factor product; mutual independence requires all subcollections.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=10
A positive-only sample reports disease fraction 2/13 as population prevalence, and a copied test result is treated as new independent evidence. Repair both.
:::
::: solution
The selected fraction estimates P(D|+), whereas the model prevalence is P(D)=1/100. Selection changes the denominator. A copied result is the same event, so conditioning again gives no new evidence; multiplying its likelihood ratio twice unjustifiably assumes conditional independence.
:::

::: exercise #e13 level=3 kind=extension minutes=15
For independent fair A,B, retain only A or B. Derive the selected joint table and disprove conditional independence.
:::
::: solution
Selection mass is 3/4; retained (1,0),(0,1),(1,1) each have conditional mass 1/3. Each event has conditional marginal 2/3 but joint 1/3≠4/9. Original independence is preserved as a statement about the original population, not the selected one.
:::

::: exercise #e14 level=3 kind=extension minutes=20
Compute pooled and half-easy half-hard success for A with 9/10 easy and 30/100 hard, and B with 80/100 easy and 2/10 hard. Explain the reversal.
:::
::: solution
Pooled A=39/110 and B=82/110, so B appears better. Within groups A=.9,.3 exceeds B=.8,.2. The common half mixture gives A=.6>B=.5. Different group weights cause the reversal. Standardisation specifies a target and assumes within-group transport; it does not alone identify a causal effect.
:::

## Ten-question self-check {#quiz}

```quiz
? A finite outcome space has four labels. What determines their probabilities?
- [x] The specified masses or generating mechanism
- [ ] Four labels always imply mass 1/4 each
- [ ] Event names alone establish independence
> Uniformity and independence are modelling assumptions, not consequences of label counts.

? Two disjoint events both have positive probability. Are they independent?
- [ ] Yes, because they are separate
- [x] No, their joint is zero while the product is positive
- [ ] Only their names determine it
> Disjointness excludes joint occurrence and differs from the independent product rule.

? What is the denominator of P(A|B)?
- [ ] P(A)
- [ ] P(A∪B)
- [x] P(B), required to be positive
> Conditioning renormalises the population B, not the reverse population A.

? Does the general probability chain rule require independence?
- [x] No, its factors retain the conditional prefixes
- [ ] Yes, every factor must be marginal
- [ ] Only when a tree is drawn
> Independence permits simplification of conditional factors but is not needed for the identity.

? In the synthetic π=.01,s=.9,r=.05 model, what is P(+)?
- [ ] .058
- [x] .0585
- [ ] .9
> Add true-positive mass .009 and false-positive mass .0495; sensitivity .9 has a different denominator.

? What is its positive posterior?
- [ ] .9
- [ ] .01
- [x] 2/13≈.153846
> The posterior is .009/.0585; sensitivity and prevalence are different model quantities.

? Does pairwise independence imply mutual independence?
- [x] No, the xor construction fails its triple product
- [ ] Always
- [ ] Only if the sample has four outcomes
> Every pair can factor while higher-order intersections do not.

? What can conditioning do to independence?
- [ ] It always preserves it
- [x] It can create or destroy it in the selected population
- [ ] It changes the original unconditional model retroactively
> The conditioning population has different masses; the original model remains a separate statement.

? A large positive-only sample estimates which quantity in this model?
- [ ] Population prevalence automatically
- [ ] Sensitivity automatically
- [x] The case fraction conditional on positivity
> More selected records do not repair a target-population mismatch.
```

<div class="free-response" data-free-response data-key="math-series:m21:q10">
<label for="q10-response">10. Specify the complete four-cell synthetic model for π=.01,s=.9,r=.05, derive P(D|+) using both joint masses and odds, and explain why duplicate evidence or positive-only sampling changes an inference claim.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State all masses, denominators, positive evidence condition and independence assumptions."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I separated prior, likelihood, posterior, population and selected frequencies.</label>
</div>

::: answer
Masses D+ .009, D− .001, not-D+ .0495, not-D− .9405 sum to one. Positive mass .0585 gives posterior .009/.0585=2/13. Prior odds 1/99 times likelihood ratio 18 give 2/11 posterior odds and 2/13 probability. Duplicate evidence is not a new conditionally independent event; a positive-only sample estimates P(D|+) rather than prevalence .01. These statements belong to the specified synthetic model.
:::

## Reading with a purpose {#reading}

Use the probability-model and conditioning materials in [MIT 6.041SC](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/) and the discrete probability selections in [MIT Mathematics for Computer Science](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/). All worked tables and demonstrations here are original constructions with explicit assumptions.

| When | Selection and question |
|---|---|
| Session 1 · 15 minutes | Models and axioms: where does uniformity enter a counting calculation? |
| Session 4 · 15 minutes | Conditioning and independence: what denominator and factorisation does each claim require? |

## Retrieval exit task and next step {#summary}

Create a complete weighted model, calculate a union and two reversed conditionals, derive Bayes in masses and odds, and disprove a pairwise-to-mutual claim. Identify the population before interpreting a selected rate.

**Exit task:** reproduce the four-cell base-rate table and posterior 2/13, explain why .9 sensitivity answers a different question, and show why copying evidence does not justify a second independent update.

**Ready to move on:** you can specify probabilistic assumptions and conditional denominators. Random variables next map outcomes to numerical observations and distinguish discrete masses, continuous densities and distribution functions. See the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| Ω / ω / A | Sample space / outcome / event | 样本空间、结果、事件 |
| P(A|B) | Conditional probability on a positive-mass B | 条件概率 |
| Partition / union bound | Exhaustive disjoint cases / overlap-safe upper bound | 划分、并集界 |
| Prior / likelihood / posterior | Before-evidence mass / evidence rate / updated mass | 先验、似然、后验 |
| Odds / likelihood ratio | p/(1−p) / evidence-rate ratio | 几率、似然比 |
| Pairwise / mutual independence | Pair products / every subcollection product | 两两、相互独立 |
| Selection / target mixture | Conditional population / specified group weights | 选择、目标混合 |
