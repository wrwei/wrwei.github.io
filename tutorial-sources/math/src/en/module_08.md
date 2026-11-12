## Division needs a domain and an inverse {#start}

On an ordinary clock, adding hours wraps around a fixed cycle. In modular arithmetic, the same idea applies to all integers, including negative ones. Addition and multiplication remain well defined, but division behaves differently: a nonzero residue may have no inverse. A cancellation step that is valid over the real numbers can silently turn a true modular equation into a false one.

This module connects integer divisibility to legal modular operations. You will derive Euclid's invariant, compute a Bézout certificate, identify invertible residues, trace fast powers, and distinguish groups, rings, and fields. The final examples separate binary field arithmetic from machine-word arithmetic and show precisely what a tiny checksum does and does not establish.

**Retrieval check:** manipulate integer equations, expand a finite product, and explain an invariant together with a decreasing integer variant. Review [Module 01](module_01_EN.html#s1) and [Module 04](module_04_EN.html#s6) as needed. The core lesson does not require the graph or counting modules. All moduli here are integers m≥2 unless a different convention is explicitly stated.

## Divisibility primes and unique quotient–remainder {#s1}

For integers a,b, **a divides b**, written a|b, means there is an integer k such that b=ak. This is an existence statement in the integer domain. It does not mean a/b is an integer, and it does not mean b must be larger than a. For example 3 divides −12 because −12=3·(−4). Every integer divides zero; zero divides only zero. Prime and gcd definitions below avoid confusing this special case with positive divisors.

If a|b and a|c, then a divides every integer linear combination xb+yc: substitute b=as and c=at to obtain xb+yc=a(xs+yt). If a|b and b|c, then a|c by multiplying the witnesses. These short proofs explain why subtracting a multiple of one integer from another preserves their common divisors. The coefficients must be integers; arbitrary real combinations would not preserve an integer divisibility conclusion.

The **division algorithm** is a theorem: for any integer a and positive integer m, there are unique integers q,r with a=qm+r and 0≤r<m. “Algorithm” here names the quotient–remainder property rather than requiring a particular implementation. One existence argument chooses q as the largest integer no greater than a/m, then r=a−qm. Its floor inequalities give exactly the stated remainder range, including when a is negative.

For uniqueness, suppose qm+r=q′m+r′ with both remainders in that range. Then (q−q′)m=r′−r. The right side has magnitude less than m; the only multiple of m in that interval is zero. Thus q=q′ and r=r′. A different remainder convention, such as allowing negative remainders after truncating division, changes the representation rule. Our mathematical representative matches Python's integer remainder when the modulus is positive.

::: worked title="A negative input still has a nonnegative representative"
For a=−17 and m=7, choose q=−3 and r=4: −17=(−3)·7+4 with 0≤4<7. Choosing q=−2 would leave r=−3, which is an integer decomposition but violates our representative range. For positive 17, q=2 and r=3. The two signs should be handled by the declared convention, not by an unexplained absolute-value shortcut.
:::

::: figure #fig-08-1
Whole groups of seven and a remainder illustrate 17=2·7+3; the negative example requires quotient −3 to keep the remainder in zero through six.
:::

A **prime** is an integer p>1 whose positive divisors are only 1 and p. An integer greater than one that is not prime is composite. The integer one is neither prime nor composite; negative primes are outside this convention. To factor a positive integer greater than one, recursively split any composite factor into smaller factors until all factors are prime. Strong induction on the integer proves that this process has a prime factorisation.

The **fundamental theorem of arithmetic** also states uniqueness up to factor order. Its key lemma is that a prime dividing a product divides at least one factor. We justify that lemma using Bézout in the next section. Repeatedly apply it to match a prime on one factorisation to an equal prime on the other, cancel that positive integer factor, and continue. Existence and uniqueness are separate obligations; listing one successful factorisation proves only existence for that input.

Prime factorisation is a mathematical description, not a claim that finding the factors of every large integer is fast. Our small examples use exact arithmetic and elementary reasoning. Euclid computes gcd without first factoring both inputs, which is one reason the invariant-based algorithm is useful. Later cost analysis should count bit operations when integer sizes grow, rather than treating enormous products or divisions as fixed-cost steps.

::: check
Write the unique quotient and remainder for −10 divided by 3 under our convention. Is one prime, and does 5 divide zero?
:::
::: answer
−10=(−4)·3+2, so q=−4,r=2. One is not prime because primes are greater than one. Five divides zero with integer witness k=0.
:::

## Euclid Bézout certificates and termination {#s2}

For nonnegative integers a,b not both zero, the **greatest common divisor** gcd(a,b) is the greatest positive integer dividing both. It exists because common positive divisors are nonempty and bounded by a nonzero input. In particular gcd(a,0)=a for a>0. For arbitrary signs, use gcd(|a|,|b|). Both-zero has no greatest positive common divisor; software often defines gcd(0,0)=0 as a useful separate convention.

If a=qb+r, the pairs (a,b) and (b,r) have exactly the same common divisors. A divisor of a and b divides r=a−qb. Conversely, a divisor of b and r divides a=qb+r. Hence gcd(a,b)=gcd(b,r). This proves preservation by **Euclid's algorithm**, which repeatedly replaces (a,b) with (b,a mod b) while b is nonzero. The invariant is equality with the original gcd, not merely a decreasing remainder.

Termination follows because each nonzero second component is a nonnegative integer and the next remainder satisfies 0≤r<b. A strictly decreasing nonnegative integer cannot continue forever. When b=0, the first component is the gcd by the invariant and the gcd(a,0) base case. Preservation explains correctness if the loop ends; the decreasing variant separately proves that it does end. Both are needed, as in Module 04.

::: worked title="Euclid and a certificate for gcd(252,105)"
252=2·105+42, 105=2·42+21, and 42=2·21+0, so the gcd is 21. Back-substitute: 21=105−2·42=105−2(252−2·105)=−2·252+5·105. The coefficients −2 and 5 certify the identity. Since 21 divides both inputs and every common divisor divides that linear combination, it is their greatest positive common divisor.
:::

::: figure #fig-08-2
The quotient–remainder trace preserves the common-divisor set and ends at remainder zero. Back-substitution recovers the Bézout coefficients.
:::

**Bézout's identity** says there are integers x,y with ax+by=gcd(a,b). Extended Euclid computes them by tracking two coefficient pairs. Initially a=1·a+0·b and b=0·a+1·b. Subtracting q times the second tracked equation from the first updates the remainder and its coefficients together. Swapping the two rows preserves the representation invariant. The final nonzero remainder therefore carries a concrete integer certificate.

The coefficients are not generally unique. If ax+by=d, then replacing x by x+(b/d)t and y by y−(a/d)t preserves the identity for any integer t. A lab returning different coefficients can still be correct; check the actual equation and gcd value rather than demanding a particular pair. Zero inputs have valid identities too, while the both-zero software convention returns a representation of zero rather than a greatest positive divisor.

If p is prime and p does not divide a, then gcd(p,a)=1, so Bézout gives px+ay=1. If p divides ab, multiply that equation by b: pxb+aby=b. Both terms on the left are divisible by p, hence p divides b. Thus p|ab implies p|a or p|b. This proves the prime-product lemma used for factorisation uniqueness without assuming that an arbitrary composite divisor has the same property.

For example 6 divides 2·3 but divides neither 2 nor 3, so substituting “any integer” for “prime” would make the lemma false. The precise hypotheses matter again in modular cancellation. A nonzero factor and a factor coprime to the modulus have different powers. Bézout will turn coprimality into an inverse and allow a valid cancellation proof.

Euclid's division count grows logarithmically in the smaller positive input. One elementary reason is that the second component falls by at least a factor two within two iterations: if the first remainder r≤b/2 the reduction is immediate; if r>b/2, the next remainder of b by r is b−r<b/2. This bounds the number of remainder steps. It is a step-count argument, not a proof that each division of long integers costs constant time.

::: check
Which two arguments prove Euclid correct and terminating? What do the coefficients −2,5 certify for 252,105?
:::
::: answer
Common-divisor preservation establishes the gcd invariant, and the strictly decreasing nonnegative second component proves termination. The identity −2·252+5·105=21, together with 21 dividing both inputs, certifies their gcd.
:::

## Congruence classes and well-defined operations {#s3}

For integers a,b and fixed m≥2, **a is congruent to b modulo m**, written $a\equiv b\pmod m$, when m divides a−b. This is a relation between integers, not an assertion that a and b are literally equal. Congruence is reflexive because m|0, symmetric because a divisibility witness can be negated, and transitive because divisible differences add. Its equivalence classes collect all integers differing by a multiple of m.

The class of a can be written [a]ₘ. It contains a+km for every integer k, including negative k. The division theorem gives each class a unique representative from 0 through m−1; call that representative a mod m. Thus [−17]₇=[4]₇, whereas −17 and 4 remain different integers. Writing an equation between classes is appropriate, but replacing it with equality between the original integers loses the distinction.

Define class addition and multiplication by [a]+[b]=[a+b] and [a][b]=[ab]. To be **well defined**, the result must be independent of representative choices. If a′=a+km and b′=b+ℓm, their sum differs from a+b by (k+ℓ)m, and their product differs from ab by m(kb+ℓa+kℓm). Both differences are divisible by m. This proof permits reducing operands before an operation without changing the final residue.

::: worked title="Reduce operands and keep the same residue"
Modulo seven, 17 has representative three and −10 has representative four. Their sum 7 is congruent to zero, matching 3+4. Their product −170 is congruent to five, matching 3·4=12≡5. Intermediate integers differ, but their classes agree. Reduction keeps stored numbers small without changing these exact modular results.
:::

Subtraction is addition of the additive inverse: [a] has inverse [−a]. For example −3 mod7 is four, because 3+4≡0. This inverse always exists for addition. It should not be confused with a **multiplicative inverse**, which would solve ab≡1 rather than a+b≡0. The same word inverse refers to the chosen operation, so name the operation when it is ambiguous.

Modular powers with nonnegative exponent are repeated class multiplication, with exponent zero interpreted as the empty product [1]. This algebraic convention also makes the exponent-zero algorithm return one for base zero. It does not settle every analytic use of the expression 0⁰; the earlier discussion of domains still applies. Negative exponents require a multiplicative inverse and cannot be defined for every residue.

A residue clock displays addition as rotation by a fixed number of steps. Adding a is always a permutation of the m residue positions, since subtracting a reverses it. Multiplication by a is different: it can send distinct positions to the same result. Modulo six, multiplying one and four by two gives two in both cases. The next section explains exactly when this multiplication map is a permutation.

Comparing or ordering canonical representatives is a display convention. From a≡b mod m it does not follow that they have the same ordinary magnitude or sign. Similarly, reducing an inequality modulo m is not a valid order-preserving operation: 6<8 but 6 mod7=6 exceeds 8 mod7=1. Congruence supports algebraic operations with a proof, not every operation that happens to work on integers.

The representative set {0,…,m−1} is often used as shorthand for the classes themselves. Keep the interpretation visible when crossing into software. A Python integer such as three does not carry a modulus in its type; the programme must apply the intended modulus consistently. Combining residues from different moduli without a stated map is not a single modular calculation, even if their numeric representatives happen to match.

::: check
Are −2 and five equal integers or congruent modulo seven? Why can operands be reduced before multiplication? Can inequalities be reduced in the same way?
:::
::: answer
They are distinct integers in the same modulo-seven class. Representative changes alter a product by a multiple of seven, proving well-definedness. Inequalities are not preserved: 6<8 becomes representatives six and one, reversing their displayed order.
:::

## Inverses legal cancellation and linear congruences {#s4}

A **multiplicative inverse** of a modulo m is a residue b satisfying ab≡1 mod m. It exists exactly when gcd(a,m)=1. For necessity, ab−1=km gives ab−km=1, so every common divisor of a and m divides one. For sufficiency, Bézout gives ax+my=1 when the gcd is one, so x is an inverse modulo m. These directions prove an if-and-only-if statement rather than a rule supported by sample calculations.

::: worked title="Nonzero and invertible are different conditions"
Modulo seven, 3·5=15≡1, so five is the inverse of three. Modulo six, two is nonzero but gcd(2,6)=2, so it has no inverse. Checking representatives also gives products 0,2,4,0,2,4, never one. Multiplication by two collapses pairs of inputs; multiplication by three modulo seven permutes every residue.
:::

::: figure #fig-08-3
An invertible multiplier permutes residue positions. A noninvertible multiplier repeats outputs and never reaches one.
:::

If an inverse exists, it is unique as a class. Given ab≡1 and ac≡1, multiply by b to obtain b≡c. Equivalently use a's established inverse to cancel a. An inverse representative may be negative before canonical reduction: extended Euclid gives −2 as an inverse of three modulo seven, and −2 mod7 is five. Uniqueness concerns classes, not all integer representatives of one class.

Cancellation from ax≡ay mod m to x≡y mod m is valid when gcd(a,m)=1: multiply both sides by the inverse. Without that condition it can fail. Modulo six, 2·1≡2·4, yet one is not congruent to four. Dividing both representatives by ordinary integer two does not preserve the original modulus. In this example the remaining condition is x≡y modulo three, a different and weaker statement.

More generally let d=gcd(a,m). From m|a(x−y), divide the integer divisibility equation by d. The integers a/d and m/d are coprime, so Bézout cancellation gives (m/d)|(x−y). Thus the appropriate reduced modulus is m/d. Integer division of an exact equation and inversion of a class are different operations; writing the intermediate divisibility equation prevents a misleading cancellation symbol from hiding that distinction.

The linear congruence ax≡b mod m has a solution exactly when d=gcd(a,m) divides b. Necessity follows because d divides ax and m, hence also b. For sufficiency, divide a,b,m by d; now a/d is invertible modulo m/d, giving one reduced solution x₀. In the original residue range the solutions are x₀+k(m/d), k=0,…,d−1. They are distinct modulo m and exhaust the solutions because any solution differs from x₀ by a multiple of m/d.

For 4x≡2 mod6, d=2 and the reduced equation is 2x≡1 mod3. Two has inverse two modulo three, so x≡2 mod3; representatives modulo six are two and five. For 2x≡1 mod6, d=2 does not divide one, so there is no solution. An equation can have zero, one, or several solutions depending on its gcd condition; treating every nonzero coefficient as a unique divider loses all three distinctions.

When d=m, such as a=0 modulo m, divisibility of b by m determines the result. If b≡0, every residue solves 0x≡0; otherwise none does. The reduced modulus is one, which is a trivial congruence relation rather than the m≥2 algebraic structures we otherwise study. State this boundary separately instead of calling the modulo-one class an ordinary nontrivial field.

A nonzero residue with a nonzero partner whose product is zero is a **zero divisor**. In modulo six, two and three multiply to zero. In a prime modulus p, every nonzero residue is coprime to p and invertible, so no such pair exists: multiplying a zero product by an inverse would force the other factor to zero. This is the algebraic reason prime moduli differ from composite ones.

::: widget name=residues
Change the modulus and multiplier. Read canonical results, inverse availability, the multiplication map, and the Euclidean trace. The worked examples above provide a static alternative.
:::

::: check
Solve 4x≡2 mod6 and diagnose cancellation by two modulo six. What is the additive inverse of two, and does that imply a multiplicative inverse?
:::
::: answer
Solutions are x=2,5. Cancellation by two only yields equality modulo three, not modulo six. Two's additive inverse modulo six is four, but two has no multiplicative inverse because gcd(2,6)>1.
:::

## Fast powers Fermat's conditions and coprime reconstruction {#s5}

**Repeated squaring** evaluates aᴱ mod m for a nonnegative integer E without performing E consecutive multiplications. Maintain result r, current base b, and remaining exponent e, initially 1,a mod m,E. The invariant is rbᵉ≡aᴱ mod m. If e is odd, multiply r by b; square b; replace e by floor(e/2). For even e=2k, the new product is r(b²)ᵏ. For odd e=2k+1, it is (rb)(b²)ᵏ. Both equal the old product as classes.

The nonnegative exponent strictly decreases when positive, so the loop terminates at e=0. The invariant then gives r≡aᴱ. Zero exponent takes no iterations and returns one under the empty-product convention. Reducing after every multiplication preserves the invariant and bounds stored residues by m−1. It avoids constructing the enormous unreduced power, although multiplication itself still has a bit cost depending on the modulus size.

::: worked title="Trace 3¹³ modulo seven"
Loop-head triples (r,b,e) are (1,3,13), (3,2,6), (3,4,3), and (5,2,1), then the returned residue is three. Thirteen has four binary digits, so there are four iterations. Our implementation counts a square even in its last iteration and an extra product for each odd remaining exponent: four squares plus three result products, seven modular multiplications. An implementation skipping the unused last square would have a different exact count.
:::

For E>0 the iteration count is floor(log₂E)+1, its binary length. Each iteration performs at most two modular multiplications, giving O(log(E+1)) such operations including the E=0 boundary. This is logarithmic in the exponent's numeric value and linear in its bit length, not logarithmic in the length of its binary encoding. Very large moduli make each operation more expensive; the multiplication count alone is not a complete runtime proof.

**Fermat's little theorem** states: if p is prime and p does not divide a, then aᵖ⁻¹≡1 mod p. To prove it, multiplication by a permutes the nonzero residues, because a has an inverse. Multiply all p−1 nonzero outputs: aᵖ⁻¹(p−1)!≡(p−1)! mod p. Every factorial factor is nonzero and invertible modulo p, so its product can be cancelled. The remaining equation is exactly the claimed power congruence.

For a divisible by p, the nonzero-base conclusion is false; instead the common all-integer form is aᵖ≡a mod p, proved by handling zero and nonzero classes separately. A composite modulus does not satisfy the prime theorem in general: 2⁵ mod6 is two, not one, and even the coprime base five gives 5⁵ mod6 equal to five. Some composite numbers pass particular power checks, so one successful check is not automatically a proof of primality.

When p is prime and a is nonzero modulo p, the inverse can be computed as aᵖ⁻² modulo p. This follows by multiplying a by that power and using Fermat. The hypotheses remain necessary; extended Euclid works for any coprime modulus without needing primality. Our labs use both the gcd condition and Python's exact modular power contract rather than applying the prime formula indiscriminately.

The **Chinese remainder theorem (CRT)** for coprime positive moduli m,n states that specified residues modulo m and modulo n determine a unique class modulo mn. Construct a solution using inverses: if u is an inverse of n modulo m and v an inverse of m modulo n, then x=anu+bmv has residues a modulo m and b modulo n. Each term vanishes in one modulus and supplies the requested residue in the other.

::: worked title="Reconstruct a class from two coprime clocks"
Solve x≡2 mod3 and x≡3 mod5. Write x=2+3k; then 3k≡1 mod5. Three's inverse modulo five is two, so k≡2 mod5 and x≡8 mod15. Check eight directly: its remainders are two and three. If two solutions differ, their difference is divisible by three and five, hence by fifteen because those moduli are coprime. This proves uniqueness of the combined class, not uniqueness of the integer eight among all integers.
:::

::: figure #fig-08-4
Within zero through fourteen, the two residue conditions intersect at eight. Integers eight plus any multiple of fifteen represent the same combined class.
:::

For the uniqueness proof in general, if m and n both divide a difference Δ, write Δ=mk. Coprimality lets n be cancelled from n|mk, giving n|k, hence mn|Δ. Without coprimality the compatibility condition changes and the combined period need not be mn. For example x≡0 mod2 and x≡1 mod4 is impossible because every second condition's representative is odd. We do not claim the coprime construction handles this conflicting pair.

::: check
State the missing hypotheses in “aᵐ⁻¹≡1 mod m” and “any two residues combine uniquely modulo mn.” What exactly does the CRT example uniquely determine?
:::
::: answer
The Fermat form requires prime m and a nonzero residue. The displayed CRT statement requires coprime moduli. It uniquely determines [8]₁₅, containing all integers 8+15k, rather than one integer without a representative range.
:::

## Groups rings fields binary arithmetic and checksums {#s6}

An algebraic structure specifies a set together with operations and laws. A **group** has one closed associative operation, an identity, and an inverse for every element. A group is **abelian** if its operation is commutative. Integers with addition form an abelian group: zero is identity and −a is the inverse of a. Integers with multiplication do not form a group, because zero and most other integers have no integer multiplicative inverse.

Residue classes modulo m form an abelian group under addition. Under multiplication, the **units**, exactly the classes coprime to m, form a group: one is identity, products of units have inverses obtained by multiplying their inverses, and each unit's inverse is another unit. All nonzero classes modulo a composite number need not form such a group, because zero divisors may multiply to zero and may lack inverses. Here a unit means an invertible element; it is distinct from the operation's identity.

A **commutative ring with identity** has an abelian additive group and a closed associative commutative multiplication with identity, distributing over addition. We use nontrivial rings with 1≠0 here. The integers and the modulo-m classes are examples. Addition, multiplication, and distributivity survive reduction because the class operations are well defined. A ring does not promise division by every nonzero element; that extra promise distinguishes a field.

A **field** is a commutative ring with 1≠0 in which every nonzero element has a multiplicative inverse. The rationals and reals are fields; the integers are not, since two has no integer inverse. Modulo p is a field exactly when p is prime. Prime p gives inverses by the gcd criterion; composite m=uv with 1<u,v<m gives nonzero classes [u],[v] with product zero, which a field cannot permit.

::: worked title="Bit arithmetic and word arithmetic use different operations"
The field with two elements has 1+1=0 and 1·1=1. On individual bits, field addition is XOR and multiplication is AND. An eight-bit unsigned integer instead uses addition modulo 256: one plus one is two, with ordinary binary carrying, not zero. Applying XOR independently to bits gives vector addition over the two-element field, which is a different structure from integer addition of the encoded word.
:::

Many fixed-width unsigned operations wrap modulo 2ʷ, but the representation and language still determine behaviour. A modulo-256 ring has zero divisors, for example 16·16≡0, and is not a field. Python integers do not automatically wrap at a fixed width; an explicit reduction is required in our scripts. These observations describe the model used in an example, not every language's signed-overflow rule or every hardware instruction.

A **checksum** can be a function c(values)=sum(values) mod7 for byte values from zero through 255. Its output is one of seven residues. Equal inputs necessarily give equal checksums; different checksums therefore prove inputs differ. Equal checksums do not prove equality. The distinct lists [1,2] and [0,3] both give three; reversing [1,2] also preserves the sum, and adding seven to an allowed byte preserves its residue.

Compression to a small output set inevitably permits collisions over a larger input set: an injective assignment would need a different output for each distinct input. More specifically this checksum has easily constructed collisions and ignores order. It may detect some accidental changes, such as increasing one byte by one while staying in range, but it fails on compensating changes, transpositions, and changes by a multiple of seven. A report should state the particular detection property rather than advertising universal error detection.

Modular arithmetic also appears in cryptographic mathematics, but the presence of primes, inverses, or a fast power calculation does not itself establish security. A toy checksum or a small illustrative modular construction supplies no resistance claim against an adversary. Such a claim needs a specified construction, threat model, assumptions, and analysis far beyond the calculations here. The lesson's transfer goal is to recognise the algebraic operations and the limits of the evidence, not to design a production security system.

::: check
Which of the integers, modulo-six classes, and modulo-seven classes are fields? What can an equal toy checksum establish?
:::
::: answer
Only modulo seven is a field among these examples. Integers lack inverses such as 1/2, and modulo six has nonzero zero divisors. Equal toy checksums establish equal function outputs, not identical inputs or any cryptographic security guarantee.
:::

## Common misconceptions and failure cases {#misconceptions}

| Claim | Why it fails | Repair |
|---|---|---|
| Congruent integers are literally equal | Their difference may be a nonzero multiple of m | Separate classes from representatives |
| A negative input needs a negative remainder | Our positive-modulus representative is nonnegative | Check 0≤r<m and a=qm+r |
| Every nonzero residue can be divided out | Composite moduli have nonunits | Check gcd(a,m)=1 |
| Additive inverse is multiplicative inverse | They solve different equations | Name the operation and identity |
| A prime-power theorem works for any modulus | Primality and the base condition matter | State Fermat's hypotheses |
| CRT gives one unique integer | It gives a class modulo the combined period | Specify a canonical range if needed |
| XOR is ordinary multi-bit integer addition | It omits carries | Distinguish a bit vector from a word integer |
| Equal checksums prove equal data | Explicit collisions exist | Describe only demonstrated detection properties |

## Three CPU labs {#labs}

Use Python 3.11+ and the standard library. Predict the identities and counterexamples before running. Downloaded scripts are the exact sources used to capture the output below.

### Lab A Euclid and extended Euclid {#lab1}

**Predict:** the gcd and Bézout coefficients for 252,105. **Run:** read quotient rows and verify each reported identity. **Explain:** why zero inputs need separate conventions, especially (0,0). **Change:** add a positive pair with gcd one and verify that either coefficient gives an inverse with the appropriate modulus. Negative inputs are outside this lab's declared input domain.

{{LAB:lab1}}

### Lab B Repeated squaring and operation counts {#lab2}

**Predict:** 3¹³ mod7 and its four loop-head triples. **Run:** compare results with Python's three-argument pow, including zero exponent and negative base. **Explain:** why one million as an exponent takes twenty iterations and why this does not make all long-integer multiplications constant-cost. **Change:** skip the final unused square, keep the invariant and outputs, and compare exact multiplication counts. The script's zero-base zero-exponent case uses the stated empty-product convention; its nonnegative exponent restriction is narrower than Python's full pow interface.

{{LAB:lab2}}

### Lab C Illegal division and checksum collisions {#lab3}

**Predict:** inverse availability, the solutions of 4x≡2 mod6, and each collision's output. **Run:** inspect rejected inverses and exhaustive six-residue solutions. **Explain:** why the inverse gcd condition is a theorem, whereas finite enumeration checks only these specific equations. **Change:** substitute modulus eleven in the checksum and build a new permitted-byte collision. A larger residue range does not turn this sum into a security construction.

{{LAB:lab3}}

## Exercises with full solutions {#exercises}

Exercises 1–12 are required; 13–14 are optional extensions. Give domains, inverse conditions, and exact modular checks rather than an unexplained division sign.

::: exercise #e1 level=1 kind=calculation minutes=5
Find q,r for −17=7q+r with 0≤r<7. Compute 17·(−10) mod7 after reducing operands.
:::
::: solution
q=−3,r=4. Reduced operands are three and four, so the product is twelve with representative five. Direct −170 also differs from five by −175, a multiple of seven.
:::

::: exercise #e2 level=1 kind=calculation minutes=5
Trace Euclid for 252,105 and verify −2·252+5·105.
:::
::: solution
Remainders 42,21,0 arise from quotients two,two,two. The gcd is twenty-one, and −504+525=21 verifies the certificate.
:::

::: exercise #e3 level=1 kind=calculation minutes=5
Find the additive and multiplicative inverses of three modulo seven. Which inverses does two have modulo six?
:::
::: solution
Three's additive inverse is four and multiplicative inverse five: 3+4≡0,3·5≡1. Two's additive inverse modulo six is four; it has no multiplicative inverse because gcd(2,6)=2.
:::

::: exercise #e4 level=1 kind=conceptual minutes=5
List solutions of 4x≡2 mod6 and decide whether 2x≡1 mod6 is solvable.
:::
::: solution
First reduce by d=2 to 2x≡1 mod3, giving x≡2 mod3 and representatives two,five modulo six. The second equation is impossible because gcd(2,6)=2 does not divide one.
:::

::: exercise #e5 level=2 kind=proof minutes=14
Prove Euclid preserves the common-divisor set and terminates for nonnegative inputs not both zero.
:::
::: solution
For a=qb+r, a divisor of a,b divides r=a−qb; a divisor of b,r divides a=qb+r. Thus the common-divisor sets and gcd agree. Each loop with b>0 replaces it by 0≤r<b, so the nonnegative second component strictly decreases. On termination gcd(a,0)=a and the invariant gives the original gcd. Both correctness and termination have been justified.
:::

::: exercise #e6 level=2 kind=proof minutes=14
Prove a has an inverse modulo m≥2 exactly when gcd(a,m)=1.
:::
::: solution
If ab≡1, write ab−km=1; any common divisor of a,m divides one, so the gcd is one. Conversely Bézout supplies ax+my=1 when the gcd is one, hence ax≡1 and [x] is an inverse. This covers both directions for integer a and positive m≥2.
:::

::: exercise #e7 level=2 kind=proof minutes=14
Prove repeated squaring's invariant through even and odd exponent steps, and explain termination and the zero-exponent result.
:::
::: solution
Initially rbᵉ≡aᴱ with r=1,b=a modm,e=E. If e=2k, replacing b with b² and e with k keeps rbᵉ. If e=2k+1, also replacing r with rb keeps (rb)(b²)ᵏ=rb²ᵏ⁺¹. Reduction preserves classes. Positive e strictly decreases under floor-halving; when zero the invariant identifies r. Initial E=0 takes no step and returns one by the empty-product convention.
:::

::: exercise #e8 level=2 kind=application minutes=10
Reconstruct x≡2 mod3 and x≡3 mod5, and prove the combined class is unique.
:::
::: solution
x=2+3k gives 3k≡1 mod5, so k≡2 and x≡8 mod15. Check eight's two remainders. A difference of solutions is divisible by three and five; coprimality implies their product divides it, so solutions are exactly one class modulo fifteen. Integers 8+15t all represent it.
:::

::: exercise #e9 level=2 kind=application minutes=10
Use Fermat with its hypotheses to find the inverse of three modulo seven and to reduce 3¹³ modulo seven. Would the same prime formula apply to two modulo six?
:::
::: solution
Seven is prime and three nonzero, so 3⁶≡1. Thus inverse 3⁵≡5 and 3¹³=(3⁶)²·3≡3. Six is composite and two is not coprime to it; the prime inverse formula does not apply, and no inverse exists.
:::

::: exercise #e10 level=2 kind=application minutes=10
Compute the toy checksum of [1,2], give two distinct collisions, and state one kind of byte change it detects.
:::
::: solution
The checksum is three. [0,3] and [2,1] are distinct inputs with the same sum, hence collisions; [8,2] also differs by a multiple of seven. Increasing a single byte by one within the allowed range changes the checksum by one modulo seven and is detected. Equal output still does not prove identical data.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=10
Diagnose cancelling two from 2·1≡2·4 mod6, and claiming that nonzero residues modulo six form a multiplicative group.
:::
::: solution
The original products both give two, but one and four are not congruent modulo six. Two lacks an inverse; cancellation only gives equality modulo three. Nonzero residues are not closed under multiplication, since two times three gives zero, and two has no inverse. Therefore they fail group conditions. The units one and five do form a multiplicative group.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=10
A program uses XOR for eight-bit integer addition and calls a seven-valued sum checksum collision-free. Identify concrete counterexamples and repair both claims.
:::
::: solution
One XOR one is zero, whereas eight-bit integer one plus one is two. XOR is coordinatewise addition over the two-element field, not modulo-256 integer addition. Inputs [1,2] and [0,3] share checksum three, refuting collision freedom. Describe the actual word operation and the checksum's limited change-detection property rather than changing only its name.
:::

::: exercise #e13 level=3 kind=proof minutes=15
Extension: for d=gcd(a,m), prove ax≡b modm has exactly d residue solutions when d|b, including a≡0.
:::
::: solution
For d<m, divide by d to obtain an invertible coefficient modulo m/d and a unique class x₀ there. Its d representatives modulo m are x₀+k(m/d), k=0,…,d−1. They are distinct; any original solution reduces to that class and is one of them. If d=m, a≡0 and d|b means b≡0, so all m=d residues solve the equation. If d does not divide b there is no solution by necessity.
:::

::: exercise #e14 level=3 kind=proof minutes=20
Extension: prove multiplication by a modulo m is a permutation exactly when gcd(a,m)=1. Show how a nontrivial gcd constructs a collision.
:::
::: solution
If the gcd is one, multiplication by the inverse is a two-sided inverse map, so multiplication is bijective. If d>1, zero and m/d are distinct representatives because 1≤m/d<m. Their products differ by a(m/d)=(a/d)m, hence are congruent. The map is not injective and cannot be a permutation. This also applies when a≡0 and d=m, where zero and one collide.
:::

## Self-check quiz {#quiz}

Automatic scoring covers Questions 1–9. The last question is written and self-reviewed.

```quiz
? What does a|b mean for integers?
- [x] b=ak for some integer k
- [ ] a/b is always an integer
- [ ] a must be positive and smaller than b
> The witness is an integer multiplier for b. The fraction is reversed, and signs or relative magnitudes are not required by divisibility.

? What is −17 mod7 under our convention?
- [ ] −3
- [x] 4
- [ ] 3
> −17=(−3)·7+4 with 0≤4<7. −3 is the quotient here, and three is the positive seventeen's remainder.

? What preserves Euclid's gcd?
- [ ] The two inputs always stay equal
- [ ] Every intermediate value is prime
- [x] (a,b) and (b,a−qb) have the same common divisors
> Subtracting an integer multiple preserves common divisors in both directions. Neither equality of inputs nor primality is an invariant.

? When does a have an inverse modulo m≥2?
- [x] Exactly when gcd(a,m)=1
- [ ] Whenever its residue is nonzero
- [ ] Only when a=1 as an integer
> Bézout proves the criterion. Composite moduli have nonzero nonunits; many residues other than one are invertible.

? What follows from 2x≡2y mod6 without other assumptions?
- [ ] x≡y mod6 always
- [x] x≡y mod3
- [ ] x=y as integers
> Removing gcd two reduces the modulus to three. x=1,y=4 refutes modulo-six cancellation and integer equality.

? What is repeated squaring's invariant?
- [ ] r+b+e remains the exponent
- [ ] Every intermediate integer equals the original unreduced power
- [x] rbᵉ is congruent to the original power
> The product with the remaining exponent is preserved as a class. Reduction changes integers, and the sum is unrelated to this invariant.

? Which conditions permit aᵖ⁻¹≡1 modp?
- [x] p prime and a nonzero modulo p
- [ ] p merely positive
- [ ] a=0 modulo p
> Fermat needs primality and a nonzero class for this form. Zero has a different all-integer formulation aᵖ≡a.

? What does coprime CRT uniquely determine?
- [ ] One integer without a range restriction
- [x] A class modulo the product of the moduli
- [ ] The order of the two moduli
> All integer representatives in the combined class solve the conditions. Uniqueness is modulo the product; swapping condition order does not alter it.

? Which claim is correct?
- [ ] Modulo six is a field because every nonzero residue has an inverse
- [ ] Equal toy checksums prove identical byte lists
- [x] Modulo seven is a field, but modulo six has zero divisors
> Primality gives nonzero inverses modulo seven; two times three is zero modulo six. Explicit checksum collisions disprove the equality claim.
```

<div class="free-response" data-free-response data-key="math-series:m08:q10">
<label for="q10-response">10. Prove the modular inverse criterion in both directions and use it to diagnose cancellation by two modulo six.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="Give the integer identities, gcd condition, and an explicit counterexample."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I checked both proof directions and included the cancellation counterexample.</label>
</div>

::: answer
If ab≡1 modm, then ab−km=1 for an integer k; every common divisor of a,m divides one, so gcd=1. Conversely gcd=1 supplies ax+my=1 by Bézout, making x an inverse. For two modulo six the gcd is two, so no inverse exists. Indeed 2·1 and 2·4 are congruent, but one and four are not congruent modulo six. A complete response supplies both identities and the specific failed conclusion, not just a memorised phrase “check the gcd.”
:::

## Reading with a purpose {#reading}

Read number-theory selections in [MIT Mathematics for Computer Science](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/). The [MIT Theory of Numbers notes](https://ocw.mit.edu/courses/18-781-theory-of-numbers-spring-2012/pages/lecture-notes/) provide Euclidean-algorithm and linear-congruence/CRT selections for comparison. Check the integer three-argument interface in the [Python pow documentation](https://docs.python.org/3.11/library/functions.html#pow). These are external primary readings; our lesson examples and required practice are original.

| When | Selection and question |
|---|---|
| Session 2 · 15 minutes | Euclid, Bézout, and inverse selections: which identity proves the legal division condition? |
| Session 4 · 5 minutes | Python pow: what extra condition permits a negative exponent with a modulus, and how is our lab narrower? |

Python's modular negative exponent requires the base to be coprime to the modulus. Our repeated-squaring lab deliberately accepts nonnegative exponents and moduli at least two, so do not mistake its restricted interface for every case supported by Python.

## Retrieval exit task and next step {#summary}

Without notes, state quotient–remainder uniqueness, prove Euclid's preservation and termination, and derive inverse existence from Bézout. Explain the difference between a class and a representative, give one failed cancellation, and state Fermat's and CRT's exact hypotheses.

**Exit task:** work modulo ten. Find the units, solve 4x≡6, and compare a field with this ring. Units are 1,3,7,9. Dividing the congruence by gcd two yields 2x≡3 mod5, so x≡4 mod5 and representatives four,nine solve it. Modulo ten is not a field: two and five are nonzero zero divisors.

**Ready to move on:** you can justify an operation before computing it and qualify the conclusion of a toy experiment. The linear-algebra branch starts with vectors, geometry, and array shapes; the CS route later returns to probability. See the [course overview](index.html) for available lessons and routes.

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| a|b | b is an integer multiple of a | 整除 |
| Prime / composite | Positive integer >1 with only trivial divisors / not prime | 素数、合数 |
| gcd / Bézout coefficients | Greatest common divisor / integer identity witnesses | 最大公因数、贝祖系数 |
| a≡b modm / [a]ₘ | Difference divisible by m / congruence class | 同余、剩余类 |
| Unit / zero divisor | Multiplicatively invertible class / nonzero factor of a zero product | 可逆元、零因子 |
| Repeated squaring | Binary-exponent modular power method | 重复平方 |
| Fermat / CRT | Prime power congruence / coprime residue reconstruction | 费马小定理、中国剩余定理 |
| Group / ring / field | One-operation inverse structure / two-operation structure / nonzero division structure | 群、环、域 |
| XOR / checksum / collision | Bitwise exclusive-or / summary function / distinct inputs with equal output | 异或、校验和、碰撞 |
