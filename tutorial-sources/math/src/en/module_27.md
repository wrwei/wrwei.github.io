## Information measures connect prediction with coding {#start}

Why does probability fitting use logarithmic loss, and what does perplexity actually measure? This module builds finite discrete entropy, conditional entropy, cross-entropy, KL divergence and mutual information from explicit probability models. It proves the relevant inequalities, connects expected loss to decodable codes and likelihood, and finishes with sequence factorisation and a carefully limited continuous preview. Every reported information quantity names its log base, alphabet and averaging unit.

**Retrieval check:** use [Module 16](module_16_EN.html#s1) for the logarithm inequality, [Module 23](module_23_EN.html#s1) for expectations and joint laws, and [Module 25](module_25_EN.html#s1) for likelihood. The optional density preview uses Module 17. All labs are standalone standard-library scripts on a CPU; no external corpus or model download is needed.

## Surprisal log bases and decodable coding {#s1}

For an outcome with probability p(x)>0, its surprisal is −log_b p(x), where b>1 is the declared log base. Smaller probability means larger surprisal; a certain outcome has zero surprisal. Base two measures bits and base e measures nats. For independent outcomes, probabilities multiply and surprisals add. More generally a joint probability factors into conditional probabilities, so conditional surprisals add without assuming independent outcomes. The additivity of log turns a probability product into a useful additive information or loss quantity.

An impossible outcome has infinite surprisal under the model. In an expectation under p, outcomes with p(x)=0 have zero weight; define 0 log 0=0 by the limit t log t→0 as t approaches zero from above. This convention does not let us replace a positive-weight zero predicted probability by a harmless zero term. When p(x)>0 but another model q(x)=0, its expected log-loss contribution is infinite. Support handling therefore belongs in both mathematical definitions and executable implementations.

Changing log base rescales information. A nats value divided by log 2 becomes bits, because log₂ u=log u/log 2. A numerical loss of one has different meaning in those two units. Probability, code length and log-loss should not share an unlabeled column. When exponentiating a loss later, the exponential base must match the logarithm base; Lab 3 exposes the familiar exp(bits) mistake.

::: worked title="A three-symbol dyadic source has an exact prefix code"
For probabilities (1/2,1/4,1/4), surprisals in bits are (1,2,2). The codewords 0,10,11 have those lengths, and no word is a prefix of another. Their expected length is (1/2)·1+(1/4)·2+(1/4)·2=1.5 bits per symbol, equal to expected surprisal. A two-bit fixed-length code uses 2 bits per symbol for this alphabet, so variable lengths can improve average length while remaining decodable.
:::

A prefix code has no codeword equal to the beginning of another. Reading to the next leaf of its binary tree gives an unambiguous next symbol, then restarts at the root. Assigning each symbol a very short word without preserving unique decoding is not a compression achievement. For example words 0,1,01 are ambiguous because the bit string 01 can mean the third symbol or the first followed by the second. A code's average length needs a decodability contract, not just an attractive weighted average.

For a finite binary prefix code with lengths ℓ_i, Kraft's inequality is Σ2^(−ℓ_i)≤1. One proof associates each binary word with its dyadic subinterval of [0,1): a length-ℓ word identifies an interval of length 2^(−ℓ). Prefix-free words identify disjoint intervals, so their total length is at most one. This finite proof will give the expected-length entropy lower bound in Section 3. The converse existence theorem for valid integer lengths is a named coding result, with further reading linked at the end.

An ideal surprisal such as −log₂(.3) is generally not an integer codeword length. It is an information quantity; rounding and a code construction are separate steps. Block coding or arithmetic-coding approaches can approach ideal average rates under stated model and decoding conditions, but we do not infer an exact real-number-length code from a fractional logarithm. Likewise entropy does not count the entire storage cost of a file: model description, headers, finite-block effects and implementation overhead also matter.

::: figure #fig-27-1
The prefix code 0,10,11 uses one or two bits according to source probabilities. Its leaf structure preserves decoding; ideal logarithmic lengths are not arbitrary free code assignments.
:::

::: check
What log base gives bits? Which zero-probability term can be skipped in a p-weighted expectation? Why does an average length need a decoding condition?
:::
::: answer
Base two. Skip outcomes with p=0, but a positive p and zero prediction gives infinite loss. Without unique decoding, a short bit string can represent several source sequences and does not identify the original data.
:::

For a nondegenerate finite source with at least two positive-probability symbols, rounded lengths ℓ_i=ceil(−log₂ p_i) are positive integers and satisfy Σ2^(−ℓ_i)≤Σp_i=1. The stated Kraft converse supplies a prefix code with those lengths. Since each rounded length is less than its ideal length plus one, its expected length is less than H₂(p)+1; the lower bound derived later places it at least H₂(p). This brackets average coding cost rather than assigning fractional codewords. Zero-probability symbols may be excluded from the declared source support for this construction, but a prediction system that must handle previously unseen symbols needs a separate support convention. Encoding the sequence length or a termination marker can also add cost if it is not already known to the decoder. The existence theorem is named here; proving its tree construction is a useful follow-on coding exercise, while the finite Kraft necessity and expected-length lower bound are proved in this lesson.

## Entropy conditional entropy and chain rules {#s2}

For a finite alphabet with probability vector p, entropy H_b(p)=−Σp_i log_b p_i is expected surprisal under that same law. It is a property of the distribution, not the surprise of one realised outcome. Each positive term is nonnegative because probabilities are at most one; entropy is zero exactly for a deterministic variable. For an alphabet of m symbols the maximum is log_b m at the uniform law, proved through KL divergence in Section 4. The bound uses declared alphabet size, while a distribution with smaller support cannot attain the full uniform maximum.

For a joint law p(x,y), joint entropy averages −log p(x,y). Conditional entropy H(X|Y) averages H(X|Y=y) with weights p(y), considering only y with positive mass. It is not the entropy of one selected conditional group, nor an unweighted average over group labels. On each positive joint cell, p(x,y)=p(y)p(x|y). Taking negative logs, weighting and summing yields H(X,Y)=H(Y)+H(X|Y), the entropy chain rule. The reverse order also holds by the same argument.

$$H(X,Y)=H(Y)+H(X\mid Y)=H(X)+H(Y\mid X).$$

For independent finite variables the conditional law equals the marginal on positive cases, giving H(X,Y)=H(X)+H(Y). Without independence, the missing amount is mutual information, developed in Section 5. Joint entropy is not usually the sum of marginal entropies. Since discrete conditional entropy is nonnegative, H(X,Y)≥H(Y), and a deterministic function Y=f(X) has H(Y|X)=0. The chain rule then implies H(Y)≤H(X): deterministic processing cannot create new discrete uncertainty about its output.

::: worked title="A noisy copy has conditional uncertainty but less than an independent bit"
Let X be a fair bit and Y=X XOR E with independent Bernoulli(.1) flip E. The joint probabilities at (0,0),(0,1),(1,0),(1,1) are (.45,.05,.05,.45). Both marginals are fair, so each entropy is 1 bit. Given X, Y has binary uncertainty h₂(.1)≈.468996 bits. Thus H(X,Y)=1+h₂(.1)≈1.468996, below the independent sum 2. The difference .531004 becomes their mutual information.
:::

Conditioning reduces entropy on average in finite discrete models: H(X|Y)≤H(X), with equality precisely under independence. This is proved by the mutual-information KL identity below. It does not assert that every individual group entropy is smaller than H(X). For instance Y chooses with probability .9 a deterministic-zero X group, and with probability .1 a fair-bit X group. Marginal P(X=1)=.05 gives entropy about .286397, while the fair group's conditional entropy is 1. The weighted conditional entropy .1 is nevertheless smaller. The average and selected-case statements have different quantifiers.

For a sequence, repeatedly apply the chain rule: H(X₁,…,X_T)=ΣH(X_t|X₁,…,X_(t−1)). No token independence is needed. A context model can reduce conditional uncertainty by representing dependence; a unigram model instead uses marginal probabilities. A causal ordering of prediction contexts is a probability factorisation, not automatically a scientific causal claim about interventions. Every conditional term must be evaluated on contexts with positive relevant probability, just as in Module 21's conditional laws.

The finite-alphabet setting keeps all entropies finite and makes rearrangement of sums safe. Countably infinite alphabets can have infinite entropy, so subtraction expressions such as infinity minus infinity need extra care even when a relative-information quantity can be defined directly. The labs and proofs here use finite alphabets. State this scope before carrying chain differences into an infinite vocabulary or continuous density model; the same notation can conceal different existence requirements.

::: check
Prove the finite chain rule from joint factorisation. Must every selected conditional group have lower entropy? Does sequence entropy addition require independent tokens?
:::
::: answer
Take logs of p(x,y)=p(y)p(x|y) on positive cells and average. Only the probability-weighted conditional entropy is guaranteed lower; selected groups can be more uncertain. Conditional chain terms work for dependent sequences, while a sum of marginal entropies requires independence.
:::

## Cross-entropy expected loss likelihood and code length {#s3}

For a source p and prediction q on the same ordered finite alphabet, cross-entropy H_b(p,q)=−Σp_i log_b q_i averages predicted surprisal under the actual source. If q_i=0 where p_i>0, it is infinite. A zero p_i contributes zero even if q_i is zero there. Checking matching alphabet semantics is essential: swapping labels in one vector changes the quantity even though each vector still sums to one. Normalisation, nonnegativity and finite numerical input are model checks, not optional formatting.

Cross-entropy differs from H(q). The former weights predictions by p, whereas the latter uses q as both source and prediction. A model can have very low own entropy by confidently choosing one outcome and still have enormous cross-entropy under a different source. Confidence is therefore not predictive correctness. Similarly a uniform q on m symbols gives cross-entropy log_b m for every p, even though the source entropy changes with p. This provides a useful fixed baseline with an explicit alphabet size.

::: worked title="Predicting the wrong categorical frequencies adds log loss"
For p=(.5,.3,.2) and q=(.25,.5,.25), H₂(p)≈1.485475 bits, while H₂(p,q)=.5·2+.3·1+.2·2=1.7 bits. The excess is about .214525 bits. Using q's own weights instead would calculate H₂(q)=1.5, a different quantity. Lab 1 also evaluates the reverse mismatch and shows that its excess is not generally the same.
:::

For IID categorical observations x₁,…,x_n from a specified q family, negative log-likelihood is −Σlog q(x_i). If empirical frequencies are p_hat_i=c_i/n, the mean loss equals −Σp_hat_i log q_i=H(p_hat,q). Thus empirical cross-entropy is the average categorical negative log-likelihood. Its expectation under IID source p is H(p,q) for a fixed q, provided the support makes loss finite. A q fitted to those same observations is data-dependent; its training loss is not automatically an unbiased estimate of its future population loss.

For unconstrained categorical MLE, q_i=p_hat_i maximises the multinomial likelihood, including zero counts as boundary values. Its apparent training optimum can assign zero probability to unseen categories and produce infinite held-out loss if those categories later occur. Additive smoothing such as q_i=(c_i+a)/(n+ma), a>0, gives positive support on a fixed alphabet. This can be interpreted through an appropriate Dirichlet model, beyond the two-category beta update, or simply stated as a specified smoothing rule. It changes the estimator and should be chosen without using held-out labels.

The code-length connection needs precision. If a complete dyadic model q_i=2^(−ℓ_i) describes integer code lengths of a binary prefix code, its expected source length is exactly H₂(p,q). A generic q does not itself specify integer codewords; ceiling lengths give a coding construction with rounding overhead. Conversely for any finite binary prefix code, let Z=Σ2^(−ℓ_i)≤1 and r_i=2^(−ℓ_i)/Z. Then ℓ_i=−log₂ r_i−log₂ Z, so expected length is H₂(p,r)−log₂ Z. Section 4's KL bound makes this at least H₂(p), proving the entropy lower bound with its decoding assumption.

The coding bound is average under the stated source, not a claim that every message uses at least its surprisal or that no individual message compresses exceptionally well. A mismatch p versus q adds average log loss; model overhead and finite-block coding cost remain separate. In prediction, a finite held-out token list estimates its own empirical mean log loss; it does not prove the source's population entropy or the model's quality along every dimension. The tiny language-model lab intentionally reports a smoothed frequency model worse than uniform on its fixed test tokens, so fitted training frequencies do not acquire an automatic held-out advantage.

::: figure #fig-27-2
Cross-entropy uses source weights p with prediction lengths −log q. It equals source entropy plus a directional mismatch cost, not the model's own entropy.
:::

::: check
Which weights define H(p,q)? How does it arise from categorical likelihood? Does an arbitrary real surprisal define an exact integer prefix-code length?
:::
::: answer
Use source p. Group the summed negative log-likelihood by category and divide by n. Real surprisals need a code construction and possible rounding/block overhead; exact equality holds only under the specified code/model conditions.
:::

## KL divergence positivity equality and support direction {#s4}

For finite probability vectors p,q, define D_b(p||q)=Σ_{p_i>0}p_i log_b(p_i/q_i), with value infinity if any required q_i is zero. A zero p_i contributes zero. When support is compatible, subtract and regroup finite sums to get H_b(p,q)=H_b(p)+D_b(p||q). This identity identifies excess expected log loss and keeps the direction visible: p is the source whose outcomes receive weight. It is not a symmetric distance formula.

$$D(p\Vert q)=\sum_{i:p_i>0}p_i\log\frac{p_i}{q_i},\qquad H(p,q)=H(p)+D(p\Vert q).$$

Prove nonnegativity using the natural-log inequality −log u≥1−u for u>0. Its difference g(u)=−log u−1+u has derivative 1−1/u, decreases below one, increases above one, and equals zero only at one. For q positive on the support S of p, apply it to u=q_i/p_i, multiply by p_i and sum: D(p||q)≥Σ_S(p_i−q_i)=1−Σ_S q_i≥0. Other bases divide by positive log b. If a required q_i is zero, infinite divergence is also nonnegative.

Equality requires q_i/p_i=1 on every positive p_i and no q mass outside that support. Since p sums to one, equality on support already uses all q mass, so globally p=q. This completes the zero-handling part often lost in a proof that silently assumes every probability is positive. Taking q uniform on m declared symbols gives D(p||q)=log_b m−H_b(p), hence H_b(p)≤log_b m with equality only for that uniform p. This also proves cross-entropy is minimised at the true source among all finite-alphabet predictions.

::: worked title="Support mismatch can be finite in one direction and infinite in reverse"
Let p=(1,0) and q=(1/2,1/2). D₂(p||q)=log₂2=1 bit because only the first source outcome has weight. D₂(q||p)=infinity because q sometimes produces the second outcome where p predicts zero. Even compatible positive vectors give unequal directions: the lab's (.5,.3,.2) and (.25,.5,.25) have divergences about .214525 and .198965 bits. Both facts disprove symmetry.
:::

KL also does not satisfy all metric axioms. It is nonnegative and vanishes at equal laws, but lacks symmetry and in general the triangle inequality. For example Bernoulli rates .1,.5,.9 have D₂(.1||.9)≈2.53594 bits, while D₂(.1||.5)+D₂(.5||.9)≈1.26797 bits, so a triangle inequality fails. A square-root or symmetrised alternative requires its own definition and properties; calling an arbitrary symmetrisation a metric without proof is not justified.

The direction matters in fitting. Minimising D(p||q_θ) over a model family is equivalent to minimising source cross-entropy because H(p) is fixed. Reversing to D(q_θ||p) changes both the weighting and objective, and can be unavailable when p is an unknown data distribution. In a restricted family the minimum may be positive; KL nonnegativity does not guarantee that the family contains p or that an optimiser finds its best member. Model fit, numerical optimisation and the loss's mathematical lower bound are separate claims.

Numerically near-equal distributions can produce a tiny negative calculated divergence from rounding even though the theorem says it is nonnegative. Validate probabilities and support first, compute stable logs and sum carefully, and interpret a scale-appropriate rounding discrepancy. Do not silently clamp a large negative value that reveals invalid inputs or a wrong formula. The lab uses finite vectors and exact zero conventions; a floating-point tolerance is disclosed in the normalisation check. All-zero weights cannot be normalised into a probability law.

::: widget name=information
:::

The explorer explicitly normalises nonnegative category weights into p and q, then reports entropy, both cross-entropies and both KL directions in the selected log unit. A positive source weight against a zero prediction gives a visible infinity message. Matching q to p makes divergence zero; a zero-weight category in both is harmless. The bars depict probabilities, not codeword lengths, and the displayed ideal lengths remain informational quantities unless a decoding scheme is specified.

Replacing a zero prediction by a small epsilon changes the model and its loss. It can be a disclosed smoothing rule followed by renormalisation, but it cannot be presented as the original distribution's exact divergence. Keep mathematical infinity and numerical log-domain stability separate.

::: check
Which inequality proves nonnegativity? What does equality require when zeros occur? Why does reversing KL change a fitting objective?
:::
::: answer
Use −log u≥1−u and account for q mass outside p's support. Equality requires the complete laws to agree. Reversal changes which distribution weights the logs and can demand unknown source probabilities at model-generated outcomes.
:::

## Mutual information dependence and processing {#s5}

Mutual information is I(X;Y)=D(p_XY||p_Xp_Y) for a finite joint law. Any positive joint cell has positive marginals, so its denominator is positive. Expand the log ratio into joint and marginal pieces to obtain I=H(X)+H(Y)−H(X,Y)=H(X)−H(X|Y)=H(Y)−H(Y|X). Nonnegativity follows from the proved KL inequality; equality holds precisely when the joint factors into independent marginals. Mutual information is symmetric even though general KL is directional, because this particular joint-versus-product expression treats X and Y symmetrically.

The entropy identities prove H(X|Y)≤H(X) on average, and I≤min(H(X),H(Y)) because discrete conditional entropies are nonnegative. A deterministic relation Y=f(X) gives I(X;Y)=H(Y), not necessarily H(X): a many-to-one function can discard information. Invertible relabelling preserves information. The quantities describe statistical dependence under a law; they do not identify causal direction. A common source can induce large mutual information without one measured variable causing the other.

::: worked title="An independent noisy channel loses information about its input"
The fair-bit noisy copy with independent flip .1 has I(X;Y)=1−h₂(.1)≈.531004 bits. Now replace Y by an independent fair bit Z, ignoring Y entirely. Then X and Z are independent and I(X;Z)=0. At flip probability zero the copy carries one bit; at flip .5 it carries none. Random noise may increase the output's entropy in other models while decreasing information about the input, so output entropy alone is not a preservation measure.
:::

Conditional mutual information is the p(z)-weighted KL between p(x,y|z) and p(x|z)p(y|z), summed over positive z. Each term is nonnegative. Entropy expansions give the chain identity I(X;Y,Z)=I(X;Y)+I(X;Z|Y). In a finite Markov relation X→Y→Z, meaning X and Z are conditionally independent given Y, I(X;Z|Y)=0. Thus I(X;Y,Z)=I(X;Y). Expanding in the other order gives I(X;Y,Z)=I(X;Z)+I(X;Y|Z)≥I(X;Z). We have proved the finite data-processing inequality I(X;Z)≤I(X;Y) with its conditional-independence assumption.

The theorem includes deterministic Z=f(Y), and more generally a stochastic channel whose conditional law depends on Y rather than extra access to X. It does not say adding a new sensor with independent information about X cannot help; that violates the stated processing chain. Nor does it say every output entropy must decrease: a stochastic processor can add fresh noise. Distinguish information about X from randomness in Z, and state the input whose information is being compared.

Mutual information is also different from linear covariance. Zero covariance can coexist with nonlinear dependence as Module 23 showed. For a finite version, let X take −1,0,1 equally and Y=X². Then Cov(X,Y)=0 by symmetry, while Y is a nonconstant deterministic function of X, so I(X;Y)=H(Y)>0. Estimating information from sparse data involves its own statistical bias and support issues; empirical contingency tables are not automatically accurate population laws. Discretising continuous data changes the observable variables and the measured information.

::: figure #fig-27-3
A finite processing chain has conditional independence between input and final output given the intermediate state. Mutual information cannot increase along that chain, even when fresh noise increases output entropy.
:::

::: check
Why is mutual information zero exactly at independence? Does data processing assert that random output entropy always decreases? Can zero covariance establish zero mutual information?
:::
::: answer
KL equality means the joint equals its marginal product. Processing constrains information about the original input; added noise can increase output randomness. Nonlinear dependent variables can have zero covariance and positive information.
:::

## Sequence likelihood perplexity and a density preview {#s6}

For a finite sequence x₁,…,x_T under model q, the probability chain rule gives q(x₁:T)=∏q(x_t|x_<t), with a start-context convention and positive prefixes where conditionals are used. Total negative log-likelihood is the sum of conditional token losses. Independence is unnecessary; an independent unigram model is a restrictive special case. For variable-length generative sequences a termination probability must also be defined for a normalised law over all finite strings. Omitting end tokens can instead define a conditional or partial evaluation score, which should be described that way.

Mean nats per scored token is L=−(1/T)Σlog q(x_t|x_<t); perplexity is exp L. In bits it is 2^L_bits. Equivalently it is the reciprocal of the geometric mean assigned token probability. It need not be an integer and is not literally the number of candidates the model considered. With a uniform model over m tokens, per-token cross-entropy log m yields perplexity m, providing a useful special-case intuition rather than a universal interpretation.

::: worked title="Changing the token unit changes perplexity without changing string probability"
Suppose two artificial joint models assign the same raw string probability 1/16. Scoring it as two tokens gives mean nats log16/2=log4 and perplexity 4. Scoring it as four tokens gives mean nats log16/4=log2 and perplexity 2. The lower per-token value is entirely a denominator change here, not better raw-string probability. Comparing model perplexities requires matching tokenisation, scoring convention, data, context and probability semantics.
:::

When aggregating unequal-length sequences, token-level corpus mean loss divides total scored loss by total scored tokens. Averaging sequence means instead weights every sequence equally and answers a different question. Include or exclude padding, prompt tokens, start/end tokens and masked positions according to a specified protocol. A model evaluation cannot quietly use a different token denominator from the advertised one. Sequence dependence also means token losses need not supply independent samples for a standard error; use suitable independent sequence or subject units if claiming statistical uncertainty.

Perplexity measures predictive log-loss under the chosen evaluation distribution. It does not by itself measure truthfulness, usefulness, fairness, reasoning success or every compression overhead. Low average loss can coexist with rare serious failures, and changing the test distribution changes the target. Held-out evaluation and selection rules from Module 26 still apply. A value of infinity from an unsupported required token is a model-support problem, while numerical overflow from exponentiating a huge finite loss is a representation problem; reporting log loss remains meaningful in the latter case.

**Optional continuous preview:** for a density f, differential entropy h(X)=−∫f(x)log f(x)dx when the integral is well defined. It is not discrete entropy on exact real points, whose probability is zero. Uniform(0,a) has density 1/a and differential entropy log a. At a=.25 this is negative in nats because density height 4 exceeds one. Changing units by Y=cX, c≠0, yields h(Y)=h(X)+log|c| when the transformation and integrability conditions hold. Thus nonnegativity and unit invariance of finite discrete entropy cannot be copied to differential entropy.

In a fine equal-width discretisation with bin width Δ and sufficient regularity, a useful approximation is H(discretised X)≈h(X)−log Δ; it records the resolution cost. This is a qualified approximation, not an identity for arbitrary mixed distributions or infinite-entropy densities. Continuous KL compares two densities with the same reference measure and has additional support/integrability conditions; a coordinate Jacobian cancels in its ratio when both laws transform consistently. Full continuous information theory is follow-on material rather than an assumption hidden in the finite proofs above.

::: figure #fig-27-4
Perplexity uses the declared log base and scored-token denominator. A continuous density's entropy additionally depends on coordinate scale and is allowed to be negative.
:::

::: check
Does sequence factorisation require independence? Which denominator defines corpus token perplexity? Why can differential entropy be negative?
:::
::: answer
Conditional chain probabilities represent dependent sequences. Use total scored-token count for the token-weighted corpus metric. Density height can exceed one and coordinate scaling changes differential entropy; it is not an exact-point probability entropy.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| One bit and one nat are interchangeable numbers. | Convert by log 2 and match the exponent base. |
| Every zero probability is a harmless zero term. | Positive source weight against zero prediction gives infinite loss. |
| Cross-entropy uses q as its averaging weights. | H(p,q) averages under p. |
| KL is a symmetric metric. | Direction, support and triangle failures matter. |
| Every selected conditional entropy must decrease. | The inequality concerns the probability-weighted average. |
| Mutual information establishes causal direction. | It describes joint dependence. |
| Random processing always decreases output entropy. | It decreases information about the input under the Markov condition. |
| Token perplexities compare across arbitrary tokenisations. | The scored units and probability conventions must agree. |
| Differential entropy is always nonnegative. | Density units and support width change it. |

## Three reproducible labs {#labs}

### Lab 1 · Entropy directional KL and information {#lab1}

{{LAB:lab1}}

Predict the support-infinite direction and prove the entropy/cross-entropy identities. Explain the prefix-code equality and the noisy bit's conditional entropy.

### Lab 2 · A tiny held-out frequency model {#lab2}

{{LAB:lab2}}

Keep alphabet and smoothing fixed before test evaluation. Derive the unigram probabilities and explain why training frequencies need not beat uniform on this held-out sequence.

### Lab 3 · Units support and scoring repairs {#lab3}

{{LAB:lab3}}

Reject invalid probability lists, repair the bit/nat exponent mismatch and explain identical raw-string probability with different perplexities. The density preview requires Module 17.

## Fourteen exercises with full solutions {#exercises}

Exercises 1–12 are required. Optional Exercises 13–14 add 35 minutes beyond the ten-hour schedule; the continuous alternative requires Module 17.

::: exercise #e1 level=1 kind=calculation minutes=6
Compute fair-bit entropy and Bernoulli(.1) entropy in bits, then convert the latter to nats.
:::
::: solution
Fair entropy 1 bit. Binary entropy −.1log₂.1−.9log₂.9≈.468996 bits, times log2≈.325083 nats. The bases change units, not the underlying law.
:::

::: exercise #e2 level=1 kind=calculation minutes=6
For p=(.5,.3,.2), q=(.25,.5,.25), compute H₂(p,q) and D₂(p||q).
:::
::: solution
Cross-entropy .5·2+.3·1+.2·2=1.7. Source entropy≈1.485475, so divergence≈.214525 bits. q's own entropy is a different weighted calculation.
:::

::: exercise #e3 level=1 kind=calculation minutes=6
Compare both KL directions for p=(1,0), q=(.5,.5).
:::
::: solution
D₂(p||q)=1 bit, while D₂(q||p)=infinity because a positive q source mass encounters zero prediction. A zero source weight is skipped; a required zero prediction is not.
:::

::: exercise #e4 level=1 kind=calculation minutes=6
Convert mean loss one bit to perplexity. For a string of probability 1/16, give two-token and four-token perplexities.
:::
::: solution
One bit gives 2, equivalently exp(log2). The two denominators give 4 and 2, despite identical raw-string probability. exp(1) is wrong for a one-bit loss.
:::

::: exercise #e5 level=2 kind=proof minutes=14
Prove finite KL nonnegativity and equality, including zero probabilities, then derive the maximum-entropy bound.
:::
::: solution
A required q zero gives infinity. Otherwise apply −log(q_i/p_i)≥1−q_i/p_i on positive-p support and sum to get D≥1−Σ_support q_i≥0. Equality requires matching positive masses and no extra mass, so p=q. Uniform q gives D=log_b m−H_b(p), proving H≤log_b m with equality at uniform.
:::

::: exercise #e6 level=2 kind=proof minutes=14
Derive the entropy chain rule and the joint/product KL expression for mutual information.
:::
::: solution
On positive cells log p(x,y)=log p(y)+log p(x|y). Weighted summation gives H(X,Y)=H(Y)+H(X|Y). Expanding log[p(x,y)/(p(x)p(y))] gives I=H(X)+H(Y)−H(X,Y). KL positivity and equality show nonnegative information and zero exactly at independence.
:::

::: exercise #e7 level=2 kind=proof minutes=14
Derive empirical categorical cross-entropy from IID likelihood, and prove the finite binary prefix-code expected-length lower bound.
:::
::: solution
Group −Σlog q(x_i) by category counts and divide by n to get H(p_hat,q). For prefix lengths, Kraft gives Z=Σ2^(−ℓ_i)≤1. Define r_i=2^(−ℓ_i)/Z; expected length=H₂(p,r)−log₂Z≥H₂(p). The decoding condition and compatible positive code masses support the bound.
:::

::: exercise #e8 level=2 kind=application minutes=10
For the fair input with independent flip .1, calculate both marginals, joint entropy, conditional entropy and information.
:::
::: solution
Joint (.45,.05,.05,.45); marginals each fair. H(Y|X)=h₂(.1)≈.468996, H(X,Y)≈1.468996, I≈.531004 bits. The independent flip is part of the model, not inferred from a few observations.
:::

::: exercise #e9 level=2 kind=application minutes=10
For training counts (6,3,1), fixed three-symbol alphabet and additive smoothing one, derive q and explain the held-out score protocol.
:::
::: solution
q=(7,4,2)/13, positive and normalised. Evaluate test token log probabilities without changing counts or smoothing from test labels. On fixed test abcac the model has mean loss≈1.232068 nats/token and perplexity≈3.428310, worse than uniform 3; this finite result does not establish a population ordering.
:::

::: exercise #e10 level=2 kind=application minutes=10
X is uniform on −1,0,1 and Y=X². Calculate covariance and mutual information, and explain their different diagnoses.
:::
::: solution
EX=0, EXY=EX³=0, hence Cov=0. Y has probabilities (1/3,2/3) at 0,1, and is determined by X, so I(X;Y)=H₂(Y)≈.918296 bits. Zero linear covariance does not imply independence or zero information.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=10
A report uses q weights for H(p,q), replaces required zero predictions by zero loss, and calls KL symmetric. Repair it.
:::
::: solution
Average −log q under source p. If p_i>0 and q_i=0, contribution is infinite; only zero-p terms can be skipped. KL direction changes weighting/support, as the finite/infinite example proves. Validate matching labels and normalisation before computing.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=10
A corpus averages each sentence's mean loss equally, omits its token convention, and compares perplexity against a different tokenizer. Repair the claimed token metric.
:::
::: solution
Sum scored losses and divide by total scored tokens for token-weighted corpus loss. State inclusion of prompts, padding, start/end tokens, context and log base. Compare on matching token/probability conventions, or use a justified common raw-data unit; unequal token denominators can alter perplexity without improved string probability.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Prove finite data processing for X→Y→Z using conditional information and the chain rule.
:::
::: solution
Conditional independence gives I(X;Z|Y)=0. Chain expansion yields I(X;Y,Z)=I(X;Y), while the opposite expansion yields I(X;Z)+I(X;Y|Z)≥I(X;Z). Conditional information is a weighted KL and nonnegative, so I(X;Z)≤I(X;Y). A processor using extra access to X is outside the condition.
:::

::: exercise #e14 level=3 kind=extension minutes=20
CS: show that a selected conditional group can have entropy larger than marginal entropy while the average is smaller. AI alternative: derive uniform differential entropy and its scaling.
:::
::: solution
CS: a .9 deterministic-zero group and .1 fair-bit group give marginal P(X=1)=.05, entropy≈.286397. The fair group has entropy 1, while weighted conditional entropy .1 is smaller. AI: Uniform(0,a) has h=log a; Y=cX changes density by 1/|c|, so substituting in the integral gives h(Y)=h(X)+log|c| under the stated conditions. Negative values for a<1 are valid.
:::

## Ten-question self-check {#quiz}

```quiz
? Which logarithm gives information in bits?
- [x] Base two
- [ ] Natural log without conversion
- [ ] Every base gives the same numerical value
> Base choice changes units by a positive scale factor.

? What happens when p_i>0 but q_i=0 in cross-entropy?
- [ ] It is a zero contribution
- [x] It gives infinite expected log loss
- [ ] It establishes a valid short code
> A required outcome is assigned zero probability by the prediction model.

? Which distribution weights H(p,q)?
- [ ] q always
- [ ] Neither distribution
- [x] p
> It averages predicted surprisal −log q under the source law p.

? What establishes H(p,q)≥H(p) for finite laws?
- [x] KL nonnegativity with support conventions
- [ ] Symmetry of KL
- [ ] Ignoring all zero predictions
> H(p,q)=H(p)+D(p||q), including infinite mismatch cases.

? Is KL a symmetric metric?
- [ ] Yes always
- [x] No; direction and triangle failures matter
- [ ] Only changing log base makes it symmetric
> Positive rescaling does not repair missing metric properties.

? When is finite mutual information zero?
- [ ] Whenever covariance is zero
- [ ] Whenever marginals look similar
- [x] Exactly when the joint factors into independent marginals
> Apply KL equality to joint versus marginal product.

? What does the stated data-processing inequality constrain?
- [x] Information about the original input under a Markov processing chain
- [ ] All output entropies under arbitrary fresh randomness
- [ ] A causal effect automatically
> Added noise can increase output randomness while losing input information.

? How is perplexity computed from mean nats/token?
- [ ] Two raised to that unconverted nats value
- [x] exp of that value
- [ ] Divide it by vocabulary size
> Exponent base must match the log-loss unit.

? Can differential entropy be negative?
- [ ] No, because density cannot exceed one
- [ ] Only if the probabilities are invalid
- [x] Yes; density scale and coordinate units differ from discrete masses
> Uniform width less than one gives log width below zero.
```

<div class="free-response" data-free-response data-key="math-series:m27:q10">
<label for="q10-response">10. Derive categorical cross-entropy from likelihood and prove its KL excess is nonnegative, including support zeros. Explain the noisy-bit mutual information, conditional sequence factorisation and why a perplexity report needs a log base, token denominator and matched evaluation protocol.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State source and prediction laws, weights, support, proof and scoring units."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I separated entropy, prediction loss, directional mismatch, dependence and token units.</label>
</div>

::: answer
Group independent categorical log-likelihood terms by counts to get empirical H(p_hat,q). Decompose H(p,q)=H(p)+D(p||q), and apply −log u≥1−u on positive source support; missing required q gives infinity. The noisy fair bit carries 1−h₂(.1) bits. Conditional sequence probabilities factor without token independence. Perplexity exponentiates mean log loss in the matching base, so tokenisation, scored positions, context and weighting must agree before comparison.
:::

## Reading with a purpose {#reading}

Use Stanford's [information-measures notes](https://web.stanford.edu/class/ee376a/files/2017-18/lecture_3.pdf), [variable-length coding notes](https://web.stanford.edu/class/ee376a/files/2017-18/lecture_5.pdf) and [continuous-information lecture](https://web.stanford.edu/class/ee376a/files/2017-18/lecture_8.pdf). The finite proofs and original examples above state zero-support assumptions explicitly; continuous theory is an optional follow-on.

| When | Selection and question |
|---|---|
| Session 1 · 15 minutes | Information measures: which law weights each logarithm, and where does conditional factorisation enter? |
| Session 4 · 15 minutes | Coding and optional density preview: which decoding, support and unit assumptions support each bound? |

## Retrieval exit task and next step {#summary}

Compute the finite measures, prove KL positivity and chain identities, derive likelihood loss and a prefix-code lower bound, and give a qualified perplexity report. Explain dependence without confusing information and causation.

**Exit task:** calculate the three-symbol mismatch, identify the infinite support direction, and repair a bit/nat or token-denominator comparison. Trace a dependent sequence's probability into additive conditional losses.

**Ready to move on:** you can connect probabilistic models to log-loss objectives. Stochastic optimisation next studies how sampled gradients fit such objectives and how regularisation changes training. See the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| Surprisal / bit / nat | Negative log probability / log-two / log-e units | 自信息、比特、纳特 |
| H(p) / H(p,q) | Source entropy / expected predicted surprisal | 熵、交叉熵 |
| D(p||q) / support | Directional relative entropy / positive-mass outcomes | KL 散度、支撑 |
| I(X;Y) | Joint versus product information | 互信息 |
| Prefix code / Kraft | Decodable leaf code / length constraint | 前缀码、Kraft 不等式 |
| Perplexity / scored token | Exponentiated mean loss / declared averaging unit | 困惑度、计分词元 |
| h(X) / density | Differential entropy / continuous reference density | 微分熵、密度 |
