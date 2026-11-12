## Invariant directions reveal a map but require assumptions {#start}

A repeated linear transformation can stretch one direction, reverse another, rotate a plane or mix directions through a shear. Eigenvectors identify directions that the map leaves invariant up to scalar multiplication. When enough independent eigenvectors exist, their coordinates turn the map into separate scalar actions. A real symmetric matrix has an especially strong version: an orthonormal eigenbasis, real eigenvalues and a direct interpretation of quadratic geometry.

Those conclusions do not hold for every matrix. A quarter-turn has no real eigenvector. A defective two-dimensional map has too few independent eigenvectors even though its characteristic equation has two roots counting multiplicity. A nonsymmetric map can amplify a norm temporarily while every eigenvalue has magnitude below one. This lesson teaches the useful spectral results together with the assumptions that make each conclusion valid.

**Retrieval check:** explain orthonormal coordinates and a similarity transformation P⁻¹AP. Review [Module 12](module_12_EN.html#s3) and [basis changes](module_11_EN.html#s3). Determinants and inverse maps come from [Module 10](module_10_EN.html#s5). Complex numbers are introduced below where needed; no calculus is required for the finite-dimensional arguments.

## Eigenpairs invariant lines and characteristic equations {#s1}

For a square linear map A, an **eigenvector** v is a nonzero vector satisfying Av=λv for some scalar **eigenvalue** λ. Together they form an eigenpair. Nonzero is essential: zero satisfies the equation for every λ and therefore identifies no special direction. Every nonzero scalar multiple of an eigenvector is another eigenvector for the same value. The invariant object is usually its line or larger eigenspace, not one uniquely signed and normalised coordinate array.

If λ>0 in a real eigenpair, A preserves the ray's orientation and scales its length by λ. Negative λ reverses orientation, and λ=0 collapses that eigenvector to zero. An eigenvalue equal to one fixes that entire eigendirection. The eigenvalue need not describe the scaling of every vector, since other vectors can combine several eigendirections or the map can lack a complete eigenbasis. Eigenvectors must also belong to the same input/output space; a rectangular map does not have this ordinary equation with arbitrary equal-shaped v unless another construction is specified.

Rearranging gives (A−λI)v=0. A nonzero solution exists exactly when the square matrix A−λI is singular, equivalently det(A−λI)=0. This is the characteristic equation. For A=[[a,b],[c,d]], it is (a−λ)(d−λ)−bc=λ²−(a+d)λ+(ad−bc)=0. Thus the two roots, counting multiplicity over the complex numbers, have sum trace(A)=a+d and product det(A)=ad−bc. These checks help detect arithmetic mistakes but do not replace verifying each corresponding vector.

::: worked title="A symmetric map's sum and difference directions"
For A=[[2,1],[1,2]], the characteristic polynomial is (2−λ)²−1=(λ−1)(λ−3). With λ=3, the equations give v₁=v₂, so (1,1) is an eigenvector. With λ=1, they give v₁=−v₂, so (1,−1) is one. Multiplication verifies A(1,1)=(3,3) and A(1,−1)=(1,−1). Their unit versions are perpendicular; trace four and determinant three agree with eigenvalue sum and product.
:::

The **eigenspace** E_λ is the kernel N(A−λI), including zero as a subspace even though zero is not itself an eigenvector. A basis for that kernel gives all eigenvectors for λ through nonzero combinations. Its dimension is the geometric multiplicity. The number of times λ appears as a characteristic-polynomial root is the algebraic multiplicity. They are different quantities; repeated roots do not automatically supply additional independent directions. A scalar matrix λI has a repeated root and every vector as an eigenvector, while the defective example below has a repeated root and only one line.

Eigenvalues are invariant under a basis change. If B=P⁻¹AP and Av=λv, then B(P⁻¹v)=P⁻¹Av=λ(P⁻¹v). The transformed vector is nonzero because P is invertible, and reversing the change gives the converse. The coordinate tuples can differ, but the map's spectral values do not. Some simple modifications can also be predicted directly: A+αI has the same eigenvectors with values λ+α, and an invertible A has inverse eigenvalues 1/λ. Verify the latter by applying A⁻¹ to Av=λv, noting that invertibility excludes λ=0. These identities are useful checks when analysing a shifted system or an inverse solve.

To compute a small eigenpair, first solve the characteristic equation, then solve each homogeneous system, and finally substitute into Av=λv. Choosing a unit length makes comparisons convenient but does not remove sign ambiguity. In floating-point calculations, inspect a scaled residual such as ‖Av−λv‖ relative to ‖A‖‖v‖ and the intended tolerance. A numerically tiny residual validates the pair for the supplied array; it does not establish that eigenvectors are unique or that a nearby repeated spectrum has been resolved reliably.

::: check
Is zero an eigenvector? If v is a unit eigenvector, does −v indicate a different eigendirection? What does λ=0 tell you about invertibility?
:::
::: answer
Zero is excluded. The sign-flipped vector spans the same line and satisfies the same equation. A zero eigenvalue supplies a nonzero null vector, so the square map is not invertible. Conversely a nonzero kernel vector is an eigenvector with eigenvalue zero.
:::

## Diagonalisation defective maps and complex eigenvalues {#s2}

If A has d independent eigenvectors in a d-dimensional space, put them into an invertible matrix V and their eigenvalues into diagonal Λ in the same order. The column equations give AV=VΛ, hence A=VΛV⁻¹. This is **diagonalisation**. In eigenbasis coordinates c=V⁻¹x, one application becomes Λc. The columns need not be orthogonal; replacing V⁻¹ by Vᵀ is valid only when V is orthogonal. Conversely any such diagonal representation supplies an eigenbasis from its columns, so the existence of a full independent eigenbasis is exactly the condition.

Eigenvectors for distinct eigenvalues are independent. A short proof uses a minimal dependent sublist. Suppose Σcᵢvᵢ=0 with every coefficient in that minimal sublist nonzero. Apply A then subtract λ_last times the original relation. The last term vanishes and each remaining coefficient becomes cᵢ(λᵢ−λ_last), which is nonzero because the values are distinct. This is a shorter dependence relation, a contradiction. Thus d distinct eigenvalues guarantee diagonalisation over the field containing them. Repeated values require checking the dimensions of their eigenspaces instead of assuming the same conclusion.

::: worked title="A repeated eigenvalue without a basis"
J=[[1,1],[0,1]] has characteristic polynomial (λ−1)². But (J−I)v=(v₂,0), so eigenvectors satisfy v₂=0. Its only eigenspace is span{(1,0)}, dimension one, insufficient for R². Therefore J is defective and cannot be diagonalised. It still acts on every vector; the missing eigenbasis is a limitation of the proposed representation, not a failure of the linear map.
:::

Complex numbers allow characteristic roots that are not real. Write i²=−1 and z=a+bi; addition and multiplication follow this rule, and |z|=√(a²+b²). Real matrices can act on complex vectors by the same entry formulas. A quarter-turn R=[[0,−1],[1,0]] has characteristic equation λ²+1=0 and values i,−i. For i, a vector (1,−i) satisfies R(1,−i)=(i,1)=i(1,−i). No nonzero real v satisfies Rv=λv with a real λ, since rotating by ninety degrees does not keep a real line invariant.

The quarter-turn is diagonalizable over the complex field, but it has no real eigenbasis. This distinction should be stated when saying “diagonalizable.” Complex conjugate roots come in pairs for real characteristic polynomials; conjugating an eigenpair also produces an eigenpair. A real two-dimensional rotation can therefore be described by a real rotation block or by two complex scalar modes. The complex magnitudes one explain preservation of amplitude; they do not mean each real coordinate remains fixed.

Repeated eigenvalues can also introduce basis ambiguity even when diagonalisation succeeds. For A=I₂ every nonzero vector is an eigenvector with value one. Any independent basis diagonalises it, and any orthonormal basis is equally valid for its symmetric spectral representation. A library can rotate the basis inside this repeated eigenspace. Comparing its individual columns with one preferred answer is consequently the wrong correctness test; compare the eigenspace or reconstructed map instead.

Diagonalisation is a change of description. It can simplify a map's powers and geometry, but it does not automatically make the coordinate change numerically safe. A nearly dependent eigenvector matrix V can strongly distort lengths in its coordinates, and an exact defective map has no invertible V at all. Numerical output that presents almost parallel columns should not be accepted as a robust independent basis merely because the array has two columns.

::: check
Why are two printed eigenvalues for J not enough to justify A=VΛV⁻¹? Does a complex pair for a real rotation indicate an invalid numerical result?
:::
::: answer
The required V must contain a full independent eigenbasis; J's repeated root has only one eigendirection. A real rotation can have valid complex eigenpairs. The field and independence condition belong to the mathematical contract, not to a preference about output formatting.
:::

## The real symmetric spectral theorem {#s3}

The **real symmetric spectral theorem** states that A=Aᵀ has an orthonormal basis of real eigenvectors, so A=QΛQᵀ with real diagonal Λ and orthogonal Q. This is stronger than arbitrary diagonalisation: Q⁻¹=Qᵀ preserves Euclidean lengths, and the eigenvalues can be ordered as real numbers. Symmetry is a hypothesis to verify. A routine that reads only one triangle of an array can return a valid decomposition of the symmetric matrix implied by that triangle without solving the nonsymmetric array you intended.

Distinct-eigenvalue eigenvectors of a symmetric matrix are perpendicular. If Au=λu and Av=μv, then λuᵀv=(Au)ᵀv=uᵀAv=μuᵀv. Thus (λ−μ)uᵀv=0, and λ≠μ forces uᵀv=0. Inside a repeated eigenspace, any linear combination remains an eigenvector, so Gram–Schmidt can create an orthonormal basis without changing its eigenvalue. These arguments explain orthogonality once eigenvectors exist; existence of enough real directions needs an additional argument.

Here is a finite-dimensional proof, with its analysis input stated explicitly. A continuous real function on the compact unit sphere attains a maximum; this standard compactness result is used here, rather than proved before the limits and continuity block. Apply it to q(x)=xᵀAx to obtain a unit maximiser v with value λ. For any u perpendicular to v and any real t, the normalised candidate (v+tu)/√(1+t²‖u‖²) has quadratic value no larger than λ. Expanding and cancelling yields 2t uᵀAv+t²(uᵀAu−λ‖u‖²)≤0 for every t. If uᵀAv were nonzero, a sufficiently small t of the same sign would make the linear term dominate the quadratic term and violate this inequality. Hence uᵀAv=0 for every u perpendicular to v.

It follows that Av is parallel to v, and dotting with v gives Av=λv. The perpendicular complement of v is invariant: for w⊥v, vᵀAw=(Av)ᵀw=λvᵀw=0. The restriction of A to this (d−1)-dimensional complement is still symmetric in any orthonormal basis of it. By induction on dimension, starting from a one-dimensional real scalar map, the restriction has an orthonormal real eigenbasis. Joining v gives one for the entire space. This proves the spectral theorem from the declared compactness fact and previously established orthonormal-basis construction, with no differentiation.

::: worked title="An orthogonal spectral reconstruction"
For A=[[2,1],[1,2]], take Q's columns q₁=(1,−1)/√2,q₂=(1,1)/√2 and Λ=diag(1,3). Direct expansion gives A=q₁q₁ᵀ+3q₂q₂ᵀ=[[2,1],[1,2]]. A vector x=c₁q₁+c₂q₂ maps to c₁q₁+3c₂q₂. Its squared output length is c₁²+9c₂². The perpendicular principal directions isolate the two scaling actions without mixing their length contributions.
:::

::: figure #fig-13-1
The difference and sum directions are perpendicular eigenvectors with scaling factors one and three. The spectral representation reconstructs the same map.
:::

In general A=Σλᵢqᵢqᵢᵀ. Each qᵢqᵢᵀ projects onto an eigendirection and λᵢ scales it. For a repeated value, sum the projectors over its whole eigenspace; that sum is basis independent. Individual signed vectors are not. This is useful for validating decompositions and interpreting geometry without attaching significance to arbitrary column signs or rotations within a repeated subspace.

Orthogonal diagonalisation also characterises real symmetry in the reverse direction: if A=QΛQᵀ with real diagonal Λ, transposing gives Aᵀ=QΛQᵀ=A. Thus a nonsymmetric real matrix cannot have this representation, even if all its eigenvalues happen to be real. The theorem is a structural result about self-adjoint Euclidean maps, not a general promise made by an eigenvalue solver.

::: check
Do distinct eigenvalues guarantee perpendicular eigenvectors for a nonsymmetric matrix? If a symmetric matrix has a repeated value, must its eigenvectors be unique up to sign?
:::
::: answer
No to both. Distinct values guarantee independence, but the perpendicularity proof used symmetry. A repeated eigenspace permits arbitrary orthonormal rotations inside that subspace; sign ambiguity is only the one-dimensional special case.
:::

## Quadratic forms definiteness and level sets {#s4}

A **quadratic form** is q(x)=xᵀAx. For a real nonsymmetric A, only its symmetric part S=(A+Aᵀ)/2 contributes: the skew part K=(A−Aᵀ)/2 satisfies xᵀKx=0 because this scalar equals its own transpose xᵀKᵀx=−xᵀKx. Thus quadratic classification concerns S, not arbitrary nonsymmetric eigenvalues of A. In the main discussion A is symmetric, making the spectral theorem directly applicable.

Write x=Qc and use QᵀQ=I. Then xᵀAx=cᵀΛc=Σλᵢcᵢ². A is **positive definite** if this value is strictly positive for every nonzero x, exactly when every λᵢ>0. It is **positive semidefinite** if it is nonnegative for every x, exactly when every λᵢ≥0. Negative definite and semidefinite reverse the signs. It is **indefinite** when both positive and negative values occur, exactly when there are eigenvalues of both signs. Zero eigenvalues create flat directions and prevent strict definiteness.

The equivalences follow in both directions: the sign conditions make every squared-coordinate sum have the claimed sign, while an eigenvector with a forbidden-sign eigenvalue supplies a counterexample. For a positive-semidefinite matrix, q(x)=0 exactly when x has components only in its zero eigenspaces, equivalently Ax=0. This implication fails for indefinite forms: positive and negative terms can cancel at a nonzero x while Ax remains nonzero. A zero quadratic value must therefore be interpreted with the definiteness assumption.

::: worked title="An ellipse and two different degeneracies"
For A=[[2,1],[1,2]], q(x)=2x₁²+2x₁x₂+2x₂². In difference/sum coordinates it is c₁²+3c₂², so q=1 is an ellipse with semiaxes one and 1/√3 along those respective directions. For diag(1,0), q=1 consists of the two parallel lines x₁=±1, unrestricted in x₂. For diag(1,−1), q=1 is a hyperbola and q vanishes on x₁=±x₂ despite a zero-dimensional kernel. These are positive-definite, semidefinite and indefinite cases, respectively.
:::

::: figure #fig-13-2
Positive eigenvalues yield an ellipse; a zero value leaves a flat direction; mixed signs yield an indefinite contour. The zero set of an indefinite form is not its kernel.
:::

For a positive-definite form in d dimensions, the q=1 surface has principal semiaxis lengths 1/√λᵢ, not λᵢ. Large eigenvalues penalise movement strongly and make the corresponding contour axis short. The transformation A itself scales eigenvector lengths by λᵢ, which is a different geometric statement. Confusing the map's stretching factors with its quadratic level-set radii reverses the contour interpretation.

These forms appear in squared errors, energy functions and later curvature matrices. A Gram matrix XᵀX is always positive semidefinite because xᵀXᵀXx=‖Xx‖²≥0. It is positive definite exactly when X has full column rank. That conclusion can be proved directly before computing eigenvalues; the spectrum then supplies direction strengths. A symmetric matrix with positive entries is not necessarily positive definite: [[1,2],[2,1]] has eigenvalues three and minus one. Entrywise positivity and quadratic positivity are different properties.

An optional connection to undirected graphs is the Laplacian L=D−G, where G is a symmetric adjacency matrix with nonnegative edge weights and D's diagonal contains their row sums. Expanding gives xᵀLx=Σ_{i<j}Gᵢⱼ(xᵢ−xⱼ)², so L is positive semidefinite. The constant vector has eigenvalue zero because each row sum of L is zero. Zero energy requires equal values across every positive-weight edge, hence values constant on each connected component. Conversely such vectors have zero energy and belong to the kernel. Therefore the zero eigenspace dimension counts components. This spectral fact has a concrete proof from an energy expression; it does not require guessing eigenvalues from a drawing.

For numerical classification, specify how close-to-zero values are treated, and do not treat rounded negative values as automatically meaningful physical instability. The exact symmetric matrix, its measurement uncertainty and arithmetic error may give different levels of certainty about the sign of a tiny eigenvalue. The explorer uses deliberately separated preset spectra so its exact classifications are clear; later numerical computation develops the more delicate cases.

::: widget name=spectra
Choose a symmetric matrix, inspect its eigenvalues and principal directions, and evaluate the quadratic form on a selected vector. Compare positive-definite, semidefinite and indefinite level sets.
:::

::: check
Can a matrix with all positive entries be indefinite? Can q(x)=0 for nonzero x prove Ax=0 without a semidefinite assumption?
:::
::: answer
Yes to the first: [[1,2],[2,1]] is negative on (1,−1). No to the second: diag(1,−1) has q(1,1)=0 while A(1,1)=(1,−1)≠0. State the sign assumption before equating zero energy and kernel membership.
:::

## Matrix powers spectral radius and discrete stability {#s5}

For e_{k+1}=Be_k, induction gives e_k=B^k e₀. In a diagonalizable case B=VΛV⁻¹, cancelling adjacent inverse factors gives B^k=VΛ^kV⁻¹. Each eigenmode has coefficient λᵢ^k times its initial coefficient. Magnitude below one decays geometrically; above one grows when that mode is excited; magnitude one need not decay and may oscillate. A negative real value alternates sign, while a complex value combines amplitude scaling and rotation.

The **spectral radius** ρ(B) is the largest eigenvalue magnitude, including complex values. For a diagonalizable finite matrix, ρ<1 makes every initial state tend to zero. If some value has magnitude at least one, its eigenvector provides a trajectory that does not tend to zero. For complex vectors of a real matrix, at least one of the real and imaginary parts must fail to tend to zero if the complex trajectory fails, so this obstruction also concerns real initial states. “Every initial state” distinguishes global asymptotic decay from a single trajectory that does not excite an unstable mode.

::: worked title="Decay growth and an unexcited mode"
For B=diag(0.5,−0.8), e₀=(1,1) yields e_k=(0.5^k,(−0.8)^k) and tends to zero. For C=diag(1.2,0.5), initial (1,1) grows in its first component, but initial (0,1) decays. The second trajectory does not make C globally asymptotically stable; its spectral radius is 1.2 and an unstable initial direction exists.
:::

For symmetric B, orthonormal coordinates give the stronger estimate ‖B^k e₀‖≤ρ(B)^k‖e₀‖. If ρ<1, Euclidean norm contracts at every step. For general diagonalizable B, a bound also includes the distortion factors of V and V⁻¹, so decay need not be monotone in ordinary coordinates. Nonsymmetric mixing can amplify some vectors before eventual decay. An estimate of an asymptotic rate is not the same as a one-step Euclidean contraction guarantee.

Defective maps require more than the simple eigenbasis power formula. Let N=[[0,3],[0,0]], so N²=0, and B=0.5I+N. The binomial expansion terminates: for k≥1, B^k=0.5^k I+k0.5^{k−1}N. At e₀=(0,1), the first step is (3,0.5), larger in norm than the initial unit vector, but both coordinates eventually decay. The factor k delays geometric decay without preventing it. At B=I+[[0,1],[0,0]], the analogous formula gives B^k e₀=(k,1), unbounded although the spectral radius is one. Equality at one is a boundary requiring further analysis.

The full finite-dimensional theorem states B^k→0 exactly when ρ(B)<1, even for defective matrices. Its general sufficiency proof uses the Jordan-form existence theorem, whose canonical-form construction is beyond this lesson. Within a Jordan block, powers are finite sums of binomial coefficients times λ^{k−j}N^j, where N is nilpotent. Each term is a polynomial in k times a decaying geometric factor when |λ|<1; zero-eigenvalue blocks vanish after finitely many powers. Such products tend to zero, as seen from their eventual ratio approaching |λ|<1. Combining finitely many blocks and a fixed coordinate change preserves convergence. Necessity follows from the eigenvector obstruction above. This explains the theorem's mechanism and explicitly identifies the additional canonical-form result used.

::: figure #fig-13-3
A defective stable map initially amplifies a vector before its geometric factor dominates the polynomial factor. The same nilpotent coupling at eigenvalue one produces growth.
:::

The weaker condition ρ≤1 is not a universal boundedness guarantee, as the unit defective example demonstrates. Conversely a quarter-turn has ρ=1 and bounded norms but does not converge to zero. Boundedness, monotone contraction and asymptotic decay are different behaviours. In an affine iteration x_{k+1}=Bx_k+c, subtract a fixed point x* satisfying x*=Bx*+c to obtain this error equation. If no fixed point has been established, one cannot simply identify x_k itself with the homogeneous error. These distinctions prepare for optimisation and iterative algorithms later in the course.

::: check
Does ρ<1 imply every Euclidean step decreases norm for a nonsymmetric map? Does a decaying trajectory prove all initial states decay? What fails at a unit defective block?
:::
::: answer
The stable defective example disproves monotone contraction. A trajectory can avoid the unstable mode and decay even when the global property fails. A unit defective block has polynomial growth, so ρ=1 does not ensure bounded powers or convergence to zero.
:::

## Rayleigh quotients principal directions and conditioning {#s6}

For nonzero x and real symmetric A, the **Rayleigh quotient** is R_A(x)=(xᵀAx)/(xᵀx). With x=Qc, it is Σλᵢcᵢ²/Σcᵢ², a weighted average of the eigenvalues with nonnegative weights summing to one. Therefore λ_min≤R_A(x)≤λ_max. Equality at an extreme occurs when x lies entirely in its extreme eigenspace. This proves the bounds and their attainment without differentiating a constrained objective.

The largest quotient identifies a direction of greatest quadratic energy per unit squared length. The smallest identifies the least. For a repeated extreme value, there is an entire subspace of maximising or minimising directions, not one preferred vector. For a nonsymmetric real matrix, the quotient describes its symmetric part, so it should not be used to claim those same ordered bounds for possibly complex eigenvalues of the original map. Match the quotient's structural hypothesis to the intended interpretation.

::: worked title="Directional energy and a condition ratio"
For A=[[2,1],[1,2]], the quotient is one on (1,−1), three on (1,1), and two on either coordinate unit vector. Every nonzero direction lies between one and three. Its positive-definite two-norm condition number is 3/1=3. The quadratic contour has semiaxis ratio √3, a different ratio because level-set radii involve square roots of inverse eigenvalues.
:::

The Euclidean operator norm is ‖A‖₂=max_{‖x‖=1}‖Ax‖. For symmetric A, squared length in eigen-coordinates is Σλᵢ²cᵢ², so the norm is max|λᵢ|, attained on a corresponding eigenvector. For symmetric invertible A, its inverse has eigenvalues 1/λᵢ and norm 1/min|λᵢ|. Thus κ₂(A)=‖A‖₂‖A⁻¹‖₂=max|λᵢ|/min|λᵢ|. In the positive-definite case every value is positive, giving λ_max/λ_min. A singular matrix has no finite ordinary inverse-condition ratio.

For Ax=b with nonzero b, a RHS change δb changes the exact solution by δx=A⁻¹δb. The norm bounds give ‖δx‖≤‖A⁻¹‖‖δb‖ and ‖b‖=‖Ax‖≤‖A‖‖x‖. Combining them yields ‖δx‖/‖x‖≤κ₂(A)‖δb‖/‖b‖. This is an upper bound, not a statement that every perturbation attains the amplification. It concerns RHS changes for a fixed invertible A; matrix perturbations require an additional analysis. The direction of the disturbance matters as well as its size.

::: figure #fig-13-4
For a positive-definite map, weak and strong eigenvalues bound directional energy and determine the worst-case inverse sensitivity ratio. This ratio is not an unrestricted formula for nonsymmetric matrices.
:::

For a nonsymmetric matrix, eigenvalue magnitudes do not generally give the Euclidean condition number. The unit defective shear [[1,1],[0,1]] has both eigenvalues one but distorts lengths and has condition number larger than one. General condition analysis uses singular values, which Module 14 develops. Similarly, a large or small spectral radius describes repeated-map modes, not automatically conditioning of a one-time solve or a statistical uncertainty estimate.

In later lessons, covariance and symmetric curvature matrices will admit this principal-direction interpretation when their assumptions are met. Here the algebra establishes which directions have high energy, which are flat and which are sensitive in an inverse calculation. It does not say that the largest-variance direction is the best classifier, or that an eigenvector is a causal feature. Numerical comparisons should allow sign changes, eigenvalue ordering and rotations inside repeated eigenspaces, and should verify eigenpair residuals, orthogonality for symmetric inputs, and reconstruction. Interpretation begins after those structural checks, not merely after a solver returns.

A simple power iteration repeatedly applies A and normalises to approximate a dominant eigendirection. For a symmetric A with one eigenvalue of strictly largest magnitude and a starting vector containing that mode, divide its spectral expansion after k steps by the dominant factor. Every other coefficient is multiplied by (λᵢ/λ_dom)^k and decays. This proves direction convergence up to sign. A negative dominant value can make the signed unit vector alternate, and equal largest magnitudes can prevent selection of a unique direction. Starting perpendicular to the dominant eigenspace also defeats that claim. Thus an attractive short numerical algorithm still needs a spectral gap and a nonzero starting component; its stopping criterion should inspect an eigenpair residual rather than just one pair of nearly equal signed arrays.

::: check
Why does κ₂=λ_max/λ_min require positive definiteness in this form? Is R_A(x) a probability? Does the worst-case bound assert equal sensitivity in every direction?
:::
::: answer
Positive values make the absolute-value norm ratio equal the stated ordered ratio; general nonsymmetric matrices need singular values. The quotient is quadratic energy per squared length, not a probability. The condition number bounds worst-case amplification; actual response depends on the perturbation direction.
:::

## Common misconceptions {#misconceptions}

| Claim | Correction |
|---|---|
| A zero vector is an eigenvector for every value | It is excluded from the definition. |
| Counting characteristic roots guarantees an eigenbasis | Repeated roots can have too few independent eigenvectors. |
| Every real matrix has a real orthonormal eigenbasis | Real symmetry guarantees it; rotations and defective maps show failures. |
| All positive entries imply positive definiteness | [[1,2],[2,1]] is indefinite. |
| Quadratic contour radii equal eigenvalues | Positive-definite semiaxes are 1/√λ. |
| ρ<1 guarantees monotone norm decrease | Nonsymmetric maps can have transient amplification. |
| ρ=1 guarantees boundedness | A unit defective block has polynomial growth. |
| Eigenvector signs or repeated-space bases are unique | Compare relations, projectors and reconstruction. |
| Eigenvalue ratios give every matrix's condition number | General matrices require singular values. |

## Three CPU labs {#labs}

Use the Python 3.11 and NumPy environment from [array preparation](numpy_primer_EN.html). Outputs are captured by executing each downloadable script. Validate equations and subspaces with tolerances; the exact examples supply the mathematical classification independently of rounded output.

### Lab A Symmetric eigenpairs and reconstruction {#lab1}

Predict the eigenvalues and unit eigenvectors before running. Compare columns allowing sign changes, verify A Q=QΛ,QᵀQ=I and QΛQᵀ=A, then evaluate two Rayleigh quotients. Explain why a rotated basis is also valid for the repeated spectrum of the identity.

{{LAB:lab1}}

**Deliverable:** hand eigenpairs, numerical residual/reconstruction checks, the quadratic classification and the SPD condition ratio. Distinguish a sign change from a different eigenspace.

### Lab B Linear iterations and scope of stability {#lab2}

Predict each behaviour from the matrix structure. Compare an excited unstable direction with an unexcited one. For the defective stable case, derive B^k=0.5^kI+k0.5^{k−1}N, then compare initial amplification and eventual decay. Explain what the unit defective and rotation cases show about the boundary ρ=1.

{{LAB:lab2}}

**Deliverable:** distinguish global asymptotic decay, one-trajectory decay, boundedness and monotone norm contraction. A finite table illustrates these behaviours; the formulas prove the infinite-time statements.

### Lab C Signs defects and solver assumptions {#lab3}

Flip a symmetric eigenvector's sign and compare its projector. Diagnose J's exact one-dimensional eigenspace, then inspect the near-parallel columns returned numerically. Deliberately pass a nonsymmetric J to the symmetric solver and verify its output against the original J. Finally check the valid complex eigenpairs of a real quarter-turn.

{{LAB:lab3}}

**Deliverable:** repair a direct-array comparison, reject a purported complete eigenbasis for J, and state the correct symmetry contract. Explain why output existing is not sufficient evidence that the intended problem was solved.

## Exercises with complete solutions {#exercises}

Exercises 1–12 are required; 13–14 add 35 optional minutes. State the scalar field, symmetry and initial-state assumptions whenever they matter.

::: exercise #e1 level=1 kind=calculation minutes=6
Find and verify the eigenvalues and eigenvector lines of [[2,1],[1,2]].
:::
::: solution
Characteristic polynomial (2−λ)²−1 gives λ=1,3. Their lines are span{(1,−1)} and span{(1,1)}. Multiplication gives the respective scaling one and three. Unit vectors are these generators divided by √2 and are perpendicular. Trace four and determinant three match the eigenvalue sum and product.
:::

::: exercise #e2 level=1 kind=calculation minutes=6
Find all eigenvectors of J=[[1,1],[0,1]] and decide whether J is diagonalizable over R.
:::
::: solution
The sole value is one with algebraic multiplicity two. (J−I)v=0 forces v₂=0, so eigenvectors are nonzero multiples of (1,0). The eigenspace dimension one cannot supply an R² basis; J is defective and not diagonalizable.
:::

::: exercise #e3 level=1 kind=calculation minutes=6
Classify diag(2,3),diag(2,0),diag(2,−3), and give one nonzero vector with zero quadratic value in the last case.
:::
::: solution
They are positive definite, positive semidefinite but not definite, and indefinite. In the last case (√3,√2) gives 2·3−3·2=0, while multiplying by the matrix gives (2√3,−3√2)≠0. Cancellation differs from a zero-eigenvalue flat direction.
:::

::: exercise #e4 level=1 kind=calculation minutes=6
For B=diag(0.5,−0.8),e₀=(1,1), find e₄ and spectral radius. State the global decay claim.
:::
::: solution
e₄=(0.5⁴,(−0.8)⁴)=(0.0625,0.4096),ρ=0.8. Every initial state decays to zero, and because B is symmetric its Euclidean norm contracts by at most factor 0.8 at each step.
:::

::: exercise #e5 level=2 kind=proof minutes=15
Prove eigenvectors for distinct eigenvalues are independent, using a shortest dependence relation.
:::
::: solution
Suppose a shortest dependent sublist satisfies Σcᵢvᵢ=0. Every coefficient is nonzero, or a shorter relation exists. Apply A and subtract the last eigenvalue times the relation. The last term vanishes and all remaining coefficients cᵢ(λᵢ−λ_last) are nonzero by distinctness. This is a shorter nontrivial relation, contradiction. A one-vector sublist cannot be dependent because its eigenvector is nonzero.
:::

::: exercise #e6 level=2 kind=proof minutes=15
For symmetric A, prove eigenvectors for distinct values are perpendicular and explain how to orthonormalise a repeated eigenspace.
:::
::: solution
Au=λu,Av=μv gives λuᵀv=(Au)ᵀv=uᵀAv=μuᵀv by symmetry. Distinctness forces uᵀv=0. In a repeated eigenspace, all combinations still satisfy Av=λv. Gram–Schmidt applied to an independent eigenspace basis stays inside it and produces unit perpendicular vectors, preserving the common eigenvalue.
:::

::: exercise #e7 level=2 kind=proof minutes=15
Use an orthonormal spectral basis to prove Rayleigh bounds and characterise positive definiteness.
:::
::: solution
Write x=Qc. The quotient Σλᵢcᵢ²/Σcᵢ² is a nonnegative-weight average, between minimum and maximum; eigenvectors attain the extremes. If all values are positive, every nonzero x has strictly positive quadratic value. If one value is nonpositive, its eigenvector gives nonpositive value, disproving positive definiteness. Both arguments use real symmetry to justify the orthonormal real basis.
:::

::: exercise #e8 level=2 kind=application minutes=13
Describe q=1 for [[2,1],[1,2]] in principal coordinates, with directions and semiaxes. Compare map stretching and contour radii.
:::
::: solution
Difference unit direction q₁=(1,−1)/√2 has value one; sum q₂=(1,1)/√2 has three. Thus c₁²+3c₂²=1 with semiaxes one and 1/√3. A stretches those vectors by one and three respectively; level-set radii are inverse square roots, so the stronger energy direction has the shorter axis.
:::

::: exercise #e9 level=2 kind=application minutes=13
Analyse B=[[0.5,3],[0,0.5]] at e₀=(0,1). Prove eventual decay and explain why the first step contradicts a monotonicity claim.
:::
::: solution
Write B=0.5I+N,N²=0. For k≥1 the binomial expansion gives B^k=0.5^kI+k0.5^{k−1}N, so e_k=(3k0.5^{k−1},0.5^k). Both coordinates tend to zero; the ratio of successive k0.5^k terms tends to 0.5. The first step (3,0.5) has norm √9.25>1, despite ρ=0.5. The map is asymptotically stable but does not monotonically contract every Euclidean norm.
:::

::: exercise #e10 level=2 kind=application minutes=13
For A=diag(1,100),b=(0,100), perturb the RHS by δb=(0.01,0). Compare relative input/output changes with the condition bound.
:::
::: solution
x=(0,1),δx=(0.01,0). Relative RHS change is 0.01/100=10⁻⁴ and relative solution change is 0.01=10⁻², amplification 100. The SPD condition ratio is 100/1=100, and this choice attains its bound because the original target uses the strong direction while the perturbation uses the weak inverse direction. Other directions need not attain it.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=16
A test rejects a sign-flipped eigenvector and treats two columns returned for J as an independent basis. Repair the tests and state the exact defect.
:::
::: solution
Check Av=λv, unit norm if requested, and the line projector vvᵀ for a unit vector rather than direct signed equality. For a repeated eigenspace compare the whole subspace projector. J's eigenspace is exactly v₂=0, dimension one; its two repeated roots do not make two independent directions. Near-parallel numerical columns need a rank/resolution check, but the exact homogeneous equations already prove the failure of diagonalisation.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=16
A report uses eigh on a nonsymmetric matrix, calls ρ≤1 a boundedness guarantee, and uses eigenvalue max/min as every matrix's Euclidean condition number. Give the missing hypotheses or counterexamples.
:::
::: solution
Verify real symmetry before the symmetric solver and verify returned eigenpairs on the intended full array; one-triangle semantics can solve another matrix. J=[[1,1],[0,1]] has ρ=1 but J^k(0,1)=(k,1), unbounded. Its eigenvalue ratio is one while it distorts Euclidean lengths and has condition number greater than one. The positive eigenvalue ratio formula applies to symmetric positive-definite matrices; nonsymmetric conditioning needs singular values.
:::

::: exercise #e13 level=3 kind=extension minutes=15
For an undirected graph with nonnegative edge weights, prove the Laplacian is positive semidefinite and its zero eigenspace dimension equals the number of connected components.
:::
::: solution
With L=D−G and symmetric G, expansion gives xᵀLx=Σ_{i<j}Gᵢⱼ(xᵢ−xⱼ)²≥0. Zero requires equality across each positive-weight edge, hence a constant on each connected component. Conversely component-constant vectors satisfy Lx=0 by row-sum cancellation within each component. The component indicator vectors are independent and span these vectors, so kernel dimension and zero eigenspace multiplicity equal the number of components, including isolated vertices.
:::

::: exercise #e14 level=3 kind=extension minutes=20
Prove power iteration approaches a dominant eigendirection for symmetric A when its largest eigenvalue magnitude is unique and the start has a nonzero component there. Explain two failures of the assumptions.
:::
::: solution
Expand e₀=Σcᵢqᵢ and divide A^k e₀ by c_dom λ_dom^k. The expression is q_dom+Σ_{i≠dom}(cᵢ/c_dom)(λᵢ/λ_dom)^kqᵢ. Each remaining ratio has magnitude below one, so all terms vanish. Normalisation therefore approaches the dominant line, with alternating sign possible for a negative dominant value. A zero initial dominant component prevents recovery of that mode; tied largest magnitudes can leave rotating or alternating combinations rather than one direction. Residual checks should allow the sign ambiguity.
:::

## Ten-question self-check {#quiz}

```quiz
? Which vector qualifies as an eigenvector?
- [x] A nonzero v satisfying Av=λv
- [ ] Zero, for any chosen λ
- [ ] Every unit vector of a general matrix
> Nonzero is part of the definition. Normalisation alone does not give the invariant-direction equation.

? What exactly permits diagonalisation over a specified field?
- [ ] Counting d roots with multiplicity
- [x] A full independent eigenbasis
- [ ] A square array printed by a solver
> Independent eigenvectors form an invertible change of basis. Repeated roots can have insufficient eigenspace dimension.

? Which hypothesis guarantees a real orthonormal eigenbasis?
- [ ] All entries positive
- [ ] The matrix is merely invertible
- [x] Real symmetry
> The symmetric spectral theorem supplies real values and orthonormal directions. Entrywise positivity and invertibility do not.

? Which spectrum makes a symmetric matrix positive definite?
- [x] Every eigenvalue strictly positive
- [ ] Every eigenvalue nonnegative, including zeros
- [ ] A positive determinant alone in all dimensions
> Zero directions exclude strict positivity. A determinant alone does not classify all directional signs.

? For a positive-definite quadratic q=1, what is a principal semiaxis length?
- [ ] λ
- [x] 1/√λ
- [ ] √λ
> In principal coordinates λc² contributes to the unit level, so its axis endpoint is ±1/√λ.

? A nonsymmetric B has ρ(B)<1. Which claim is valid for a finite fixed matrix?
- [ ] Every Euclidean step must decrease norm
- [ ] Every eigenvector basis must be orthonormal
- [x] Every initial state asymptotically tends to zero
> Defective blocks still decay through polynomial times geometric factors, but transient norm amplification is possible.

? What does ρ=1 alone guarantee about powers?
- [x] Neither boundedness nor decay without further structure
- [ ] They are always bounded
- [ ] They always converge to zero
> Unit defective blocks grow polynomially, while rotations remain bounded without decay. The boundary requires further analysis.

? Which comparison respects eigenvector ambiguity?
- [ ] Require identical signed columns in every decomposition
- [x] Check equations and compare appropriate eigenspace projectors
- [ ] Declare any repeated eigenvalue a solver failure
> Signs and orthonormal bases inside repeated spaces can vary while the invariant subspace and reconstruction remain correct.

? For a symmetric positive-definite A, what is κ₂(A)?
- [ ] The trace
- [ ] The same value for every perturbation direction
- [x] λ_max/λ_min
> Orthogonal spectral coordinates give the operator norms of A and A⁻¹. The resulting number bounds worst-case relative amplification.
```

<div class="free-response" data-free-response data-key="math-series:m13:q10">
<label for="q10-response">10. Explain why ρ<1, monotone norm contraction, and ρ≤1 boundedness are different claims. Use the stable defective map and the unit defective block, and state the global initial-state quantifier.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="Give power formulas and separate asymptotic behaviour from each individual step."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I used both defective examples and explained which statement concerns every initial state.</label>
</div>

::: answer
For finite fixed B, ρ<1 makes B^k e₀ tend to zero for every initial state, with the general proof using Jordan blocks. B=[[0.5,3],[0,0.5]] has powers 0.5^kI+k0.5^{k−1}N and eventually decays, but (0,1) first maps to (3,0.5), increasing its norm. J=[[1,1],[0,1]] has ρ=1 and J^k(0,1)=(k,1), so the nonstrict spectral bound does not ensure boundedness. Symmetry supplies the stronger Euclidean contraction estimate when ρ<1. A single trajectory can miss an unstable mode and is insufficient to prove a global property.
:::

## Reading with a purpose {#reading}

Use eigenvalues, symmetric decompositions and quadratic geometry in the authors' [Mathematics for Machine Learning companion](https://mml-book.com/). Numerical contracts are in the official NumPy 1.26 [eig](https://numpy.org/doc/1.26/reference/generated/numpy.linalg.eig.html) and [eigh](https://numpy.org/doc/1.26/reference/generated/numpy.linalg.eigh.html) documentation. The original arguments above label the compactness input to the spectral proof and the canonical-form input to general defective stability.

| When | Selection and question |
|---|---|
| Session 1 · 20 minutes | Eigenbases: what fails when geometric multiplicity is smaller than algebraic multiplicity? |
| Session 4 · 20 minutes | Solver contracts: which columns correspond to each eigenvalue, and how does eigh interpret the stored triangle? |

## Retrieval exit task and next step {#summary}

Without notes, verify a two-dimensional eigenpair and prove the diagonal representation when a basis exists. State the symmetric theorem and its proof inputs. Classify a form, draw its principal axes, and explain each stability and condition-number hypothesis separately.

**Exit task:** A=[[3,1],[1,3]] has eigenvalues two on the difference direction and four on the sum direction. Its unit quadratic contour has semiaxes 1/√2 and 1/2; κ₂=2. For B=A/5,ρ=4/5 and every Euclidean error norm contracts by at most 4/5. Explain why each conclusion used symmetry and why replacing A by a general nonsymmetric matrix invalidates the same unqualified formulas.

**Ready to move on:** you can recognise which spectral conclusions are justified and verify the representation that supports them. Module 14 develops singular values for rectangular and nonsymmetric maps, low-rank approximation, the pseudoinverse and centred PCA. Check the [course overview](index.html) for availability.

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| Av=λv | Nonzero invariant-direction pair | 特征值、特征向量 |
| E_λ | Kernel of A−λI | 特征空间 |
| Algebraic / geometric multiplicity | Root count / eigenspace dimension | 代数重数、几何重数 |
| Diagonalizable / defective | Complete eigenbasis / insufficient eigenvectors | 可对角化、亏损 |
| QΛQᵀ | Real symmetric orthogonal spectral representation | 对称谱分解 |
| xᵀAx / PSD / PD | Quadratic energy / nonnegative / strictly positive | 二次型、半正定、正定 |
| ρ(B) | Largest eigenvalue magnitude | 谱半径 |
| R_A(x) | Quadratic energy per squared length | 瑞利商 |
| κ₂(A) | Two-norm inverse-sensitivity bound | 二范数条件数 |
