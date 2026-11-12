## Approximation becomes a precise geometric problem {#start}

An equation Xw=y can fail to have a solution while still admitting one uniquely closest predicted vector. The distinction matters whenever measured targets do not lie in the design's column space. Least squares chooses that closest prediction according to a specified distance. It does not by itself make the coefficients unique, the measurements trustworthy, or the predictions reliable on future records.

This module derives the geometry before introducing algorithms. You will prove projection formulas, construct an orthonormal basis, solve with QR, and establish the normal equations without differentiation. The last section describes the whole family of rank-deficient minimisers and its minimum-norm representative. The labs compare mathematical equivalence with floating-point computation and data sensitivity.

**Retrieval check:** give the column space and null space of a matrix and explain why a null displacement leaves predictions unchanged. Review [Module 11](module_11_EN.html#s4) if needed. Dot products and lengths come from [Module 09](module_09_EN.html#s3). No calculus is assumed; a later lesson will derive the same normal equations by differentiation. Use the pinned environment in [NumPy preparation](numpy_primer_EN.html).

## Inner products orthogonality and Pythagoras {#s1}

A real **inner product** assigns a real number ⟨u,v⟩ to two vectors. It is linear in each argument, symmetric, and positive definite: ⟨v,v⟩≥0 with equality only for v=0. These conditions generalise the coordinate dot product while preserving useful geometric reasoning. The associated norm is √⟨v,v⟩. Orthogonality means ⟨u,v⟩=0. It refers to the selected inner product, so changing coordinate weights can change which vectors are orthogonal even though addition and linear dependence remain the same.

The Euclidean product is uᵀv=Σuᵢvᵢ. A weighted product is uᵀWv for a symmetric positive-definite W. For a diagonal W with entries αᵢ>0, this is Σαᵢuᵢvᵢ. Symmetry and bilinearity follow term by term, and a nonzero vector has at least one nonzero coordinate contributing a strictly positive square. Thus this diagonal construction satisfies every condition. It corresponds to scaling coordinates by √αᵢ before using the ordinary product. A zero weight instead allows a nonzero vector to have zero length, so the expression is only semidefinite and not an inner product on the full coordinate space. Negative weights fail even nonnegativity.

If u and v are orthogonal, expansion gives ‖u+v‖²=‖u‖²+2⟨u,v⟩+‖v‖²=‖u‖²+‖v‖². This **Pythagorean identity** is the engine of projection and least squares. Without orthogonality the cross term remains, and adding squared lengths is generally wrong. The vectors need not be coordinate axes; any pair perpendicular under the specified product works. A decomposition into mutually orthogonal components extends the identity to any finite sum by the same expansion.

::: worked title="The inner product changes the perpendicular direction"
Let u=(1,1),r=(1,−1). Their Euclidean dot product is zero. With W=diag(4,1), their weighted product is 4−1=3, so they are not orthogonal in that geometry. The vector s=(1,−4) is weighted-orthogonal to u because 4·1+1·(−4)=0. The vector space and linear relationships have not changed; the measurement of distance and perpendicularity has.
:::

An **orthonormal** list q₁,…,q_r has unit vectors that are pairwise orthogonal. Such a list is automatically independent: dot a zero combination with q_j and its jth coefficient must vanish. For a matrix Q with these columns, QᵀQ=I_r. This identity has dimensions r×r. It does not generally imply QQᵀ=I_m when Q is m×r with r<m; the latter operation will be the projection onto the smaller column space. Calling rectangular Q an orthogonal square matrix would confuse two different contracts.

In data fitting, a weighted distance encodes a modelling choice about which discrepancies count more. Large weights penalise some coordinate errors more strongly. This can reflect known measurement precision or an application-specific objective, but the weights need justification. Simply declaring a weighted inner product does not supply a statistical noise model. For the main derivations below, use Euclidean geometry unless explicitly labelled otherwise. This keeps the objective, residual-orthogonality condition and algorithm consistent.

The zero vector is perpendicular to every vector but has no unit normalisation or defined angle. A procedure asking for a direction must guard against dividing by its norm. Similarly, a pair of nonzero vectors is orthogonal exactly when their angle has zero cosine in the Euclidean geometry, but using cosine as a probability would add an interpretation unsupported by these algebraic facts. Here orthogonality is an exact relation that makes a decomposition provable, rather than a vague claim of feature “unrelatedness.”

::: check
Does QᵀQ=I imply QQᵀ=I when Q has one unit column in R³? Can weights (1,0,1) define an inner product on R³?
:::
::: answer
No. QQᵀ has image a line and cannot be the identity on R³. The zero middle weight gives (0,1,0) zero length, violating positive definiteness. Both conclusions follow from dimensions and definitions, not from an implementation convention.
:::

## Projection onto a line and onto a subspace {#s2}

Given a nonzero vector u and a target y, seek its closest point p=cu on the line span{u}. Requiring the residual r=y−cu to be perpendicular to u gives uᵀy−c uᵀu=0. Since uᵀu>0, the unique coefficient is c=(uᵀy)/(uᵀu). This coefficient is a scalar; p is a vector in the original target space. They coincide numerically only in particular coordinate conventions, so an implementation should name them separately.

Why does the perpendicular choice minimise distance? For any other scalar a, y−au=r+(c−a)u. The two terms are orthogonal, so ‖y−au‖²=‖r‖²+(c−a)²‖u‖². The second term is nonnegative and vanishes exactly at a=c. This is a complete optimality and uniqueness proof without calculus. If the generator is zero, its span is the zero space and the projection is simply zero; the fraction is undefined and unnecessary. Rescaling a nonzero generator changes c inversely and leaves p unchanged, as a subspace projection should.

::: worked title="Projecting a point onto the diagonal line"
For y=(3,2),u=(1,1), c=5/2 and p=(5/2,5/2). The residual is (1/2,−1/2), perpendicular to u. Its squared length is 1/2. Any candidate (a,a) has squared discrepancy 1/2+2(a−5/2)², so the minimum is unique. The target lies outside the line; a nonzero residual is expected rather than evidence that the projection failed.
:::

For a finite-dimensional subspace S with orthonormal basis columns Q, define p=QQᵀy. Its coefficients in that basis are Qᵀy. The residual r=y−p satisfies Qᵀr=Qᵀy−QᵀQ Qᵀy=0, so it is perpendicular to every basis vector and hence every vector of S. For any other s∈S, y−s=r+(p−s), an orthogonal sum. Pythagoras gives ‖y−s‖²=‖r‖²+‖p−s‖², proving existence of a closest point and uniqueness of the predicted vector p. Section 3 supplies the orthonormal-basis construction needed for any finite-dimensional S.

The projection matrix P=QQᵀ is symmetric and idempotent: Pᵀ=P and P²=Q(QᵀQ)Qᵀ=P. Idempotence means projecting an already projected vector changes nothing. Symmetry reflects Euclidean perpendicularity. The image of P is S, since Py∈S and Ps=s for s∈S. Its kernel is S⊥ because Qᵀy=0 exactly when y is perpendicular to the basis. The complementary projection I−P sends y to its residual. These operations express one unique orthogonal decomposition y=p+r, not an invertible change of coordinates.

Pythagoras also proves that projection cannot increase Euclidean length: ‖Py‖²≤‖y‖². Applying this to a difference gives ‖Py−Pz‖≤‖y−z‖, since P is linear. Thus fitted observation vectors vary no more than their targets for a fixed subspace, even though recovering coefficient coordinates from them can be very sensitive. This gives a precise reason to discuss stability of predictions separately from stability of parameters.

::: figure #fig-12-1
The target decomposes into its diagonal-line projection and a perpendicular residual. Every other point on the line adds an orthogonal extra discrepancy.
:::

If U has independent but nonorthonormal columns spanning S, perpendicularity gives Uᵀ(y−Uc)=0. The matrix UᵀU is invertible: cᵀUᵀUc=‖Uc‖² is positive for every nonzero c by independence. Thus c solves (UᵀU)c=Uᵀy, and formally P=U(UᵀU)⁻¹Uᵀ. The formula explains the map; it does not prescribe explicitly calculating an inverse as the best numerical algorithm. QR will compute the same projection without forming that Gram matrix.

For diagonal positive weights, the line coefficient becomes (uᵀWy)/(uᵀWu), and the residual satisfies uᵀWr=0. With y=(3,2),u=(1,1),W=diag(4,1), it is 14/5, giving p=(2.8,2.8). The residual (0.2,−0.8) is weighted-orthogonal but not Euclidean-orthogonal to u. The closest point changed because the objective changed. To project onto an affine set p₀+S, project y−p₀ onto S then add p₀; an offset feasible set should not be silently treated as a subspace through zero.

::: widget name=projections
Change a two-dimensional target and a nonzero line direction. Read the projection, residual and dot-product check; compare Euclidean and positively weighted distances.
:::

::: check
If two different orthonormal bases span the same subspace, can their Euclidean projection matrices send a target to different vectors?
:::
::: answer
No. Both constructions yield a member of S with residual perpendicular to S, and the closest-point uniqueness proof forces the same member. Basis coefficients may differ; the projected vector and its projection map are basis independent for the specified subspace and inner product.
:::

## Gram–Schmidt and the meaning of orthonormal coordinates {#s3}

Start with independent vectors a₁,…,a_d in Rᵐ. Gram–Schmidt constructs orthonormal vectors with the same successive spans. First take q₁=a₁/‖a₁‖. At step j, remove the components along earlier q's: v_j=a_j−Σ_{i<j}(qᵢᵀa_j)qᵢ, then set q_j=v_j/‖v_j‖. Dotting v_j with any earlier q_k gives q_kᵀa_j−q_kᵀa_j=0, because the orthonormal cross products remove every other term. Thus the remainder is perpendicular to the existing span.

The remainder cannot be zero in exact arithmetic for an independent input list. If it were, a_j would already be a combination of earlier q's and therefore of earlier a's, contradicting independence. Normalisation consequently creates a well-defined unit vector. Each a_j is a combination of q₁,…,q_j, and each q_j is a combination of a₁,…,a_j, so the successive spans are equal. Induction establishes both the construction and its promised span preservation. This proves every finite-dimensional Euclidean subspace admits an orthonormal basis, starting from any ordinary basis.

::: worked title="A two-column construction"
Take a₁=(1,1,0),a₂=(1,0,1). Then q₁=(1,1,0)/√2 and q₁ᵀa₂=1/√2. The remainder v₂=(1/2,−1/2,1) has length √(3/2), so q₂=(1,−1,2)/√6. Their dot product is zero and both lengths are one. The upper triangular coefficient matrix is R=[[√2,1/√2],[0,√(3/2)]], with columns expressing a₁ and a₂ in the q basis. Q R reconstructs the original columns.
:::

Writing all columns together gives A=QR. For m≥d and independent input columns, reduced Q is m×d with QᵀQ=I_d, while R is d×d upper triangular. Its entries above the diagonal are rᵢⱼ=qᵢᵀa_j and its positive diagonal entries are the remainder lengths. Nonzero diagonal makes R invertible. This triangular structure records the order in which spans were built. Changing the sign of one q column and the matching row of R leaves QR unchanged. A QR returned by a library can therefore differ in signs from the hand construction without being incorrect.

For dependent columns, the exact zero remainder is a diagnostic. Do not divide by it or claim that d orthonormal directions were obtained. One can skip redundant vectors to construct an r-column basis for the rank-r column space, or use a factorisation designed to handle dependence. In floating-point arithmetic, a very small remainder needs a stated resolution policy; it may reflect exact dependence, near dependence or accumulated error. A fixed absolute threshold changes meaning when column units change. The simple lab guard illustrates the decision but does not provide a general rank-revealing solver.

Classical Gram–Schmidt computes all removal coefficients against the original a_j and subtracts their combined contribution. Modified Gram–Schmidt removes one component at a time and computes the next coefficient against the current remainder. They give the same exact formulas, because earlier q's are exactly orthogonal. Floating-point rounding can make the procedures behave differently; sequential removal often preserves orthogonality better, but it is not immune to severe near dependence. Reorthogonalisation or Householder QR can address algorithmic error. Neither creates information missing from an ill-conditioned design.

An orthonormal basis makes subspace coordinates particularly simple: qᵢᵀy reads the component in direction i, and the sum of squared components equals the squared norm of the projection. The residual norm accounts for the missing perpendicular part. For a square orthogonal Q, these coordinates preserve the entire vector norm because there is no missing part. For a rectangular Q, Qᵀy retains only its coordinates in the smaller column space. This is the geometric difference between a full coordinate change and dimension reduction.

::: figure #fig-12-2
Subtracting the first component leaves a perpendicular remainder; normalising it produces the second orthonormal direction. The triangular coefficients retain reconstruction information.
:::

::: check
If a second column is twice the first, what happens to its Gram–Schmidt remainder? Does replacing a tiny computed remainder by zero prove exact dependence?
:::
::: answer
The exact remainder is zero, so it cannot be normalised. Thresholding a tiny computed remainder is a numerical resolution decision, not an exact proof. Report the input model and tolerance, and use exact arithmetic if the intended claim concerns an exact relation.
:::

## QR least-squares solves and floating-point limits {#s4}

For a full-column-rank design X of shape m×d with m≥d, use reduced X=QR. Decompose y as Q Qᵀy+r with Qᵀr=0. Then y−Xw=r+Q(Qᵀy−Rw). Pythagoras and Q's length preservation on d-dimensional coordinates give ‖y−Xw‖²=‖r‖²+‖Qᵀy−Rw‖². The first term is fixed. Because R is invertible, the second is zero exactly when Rw=Qᵀy. Back substitution solves this d-dimensional triangular system and gives a unique w.

The shapes are explicit: y is length m, Qᵀy is length d, R is d×d, and w is length d. The predicted vector Q Qᵀy is length m. A library implementation may store y as a column or allow several target columns, but those storage conventions must be declared separately. For multiple targets Y of shape m×k, the same R can solve for d×k weights with RHS QᵀY; each column is its own target problem. Factorisation reuse avoids recomputing geometry unnecessarily.

::: worked title="A line fit to three records"
Fit y≈w₀+w₁x for records (0,1),(1,2),(2,2). X has rows (1,0),(1,1),(1,2). The normal equations, proved next, are 3w₀+3w₁=5 and 3w₀+5w₁=6. Subtracting gives w₁=1/2,w₀=7/6. Fitted values are (7/6,5/3,13/6), residual y−Xw is (−1/6,1/3,−1/6), and SSE is 1/6. Its dot products with the intercept and x columns both vanish. QR computes the same weights without using XᵀX as its numerical input.
:::

Householder QR offers another orthonormal construction. For a unit vector v, H=I−2vvᵀ is symmetric and HᵀH=I, since expansion cancels −4vvᵀ with 4v(vᵀv)vᵀ. It is a norm-preserving reflection. For a nonzero column segment x, take v proportional to x+s‖x‖e₁ where s matches the sign of the first coordinate, choosing s=1 at zero. This avoids subtracting nearly equal leading quantities. The reflection sends x to −s‖x‖e₁. Applying successive reflections to trailing column segments zeros the entries below successive diagonals; their orthogonal product supplies Q. This explains why a practical QR need not use the simple educational Gram–Schmidt routine.

Avoid forming a Gram matrix when its loss of resolution matters. For X with columns (1,1,1) and (1,1+δ,1−δ), exact XᵀX=[[3,3],[3,3+2δ²]]. The independent difference δ becomes a much smaller squared term in the Gram matrix. With δ=10⁻⁸ and local double-precision arithmetic, 3+2δ² rounds to three in the lab, producing a singular computed matrix. The original floating-point X still retains its distinct column entries, so QR and a least-squares library can use that information. The exact formulas are equivalent; their evaluated numerical intermediates are not.

This example does not establish that every normal-equation computation fails. A well-conditioned small problem may work accurately, as the hand line-fit calculation does. It demonstrates an avoidable source of damage for near-collinear features. The familiar statement that a Gram matrix squares the two-norm condition number will be derived from singular values in Module 14. Here the δ² term already shows the mechanism explicitly without assuming that theorem.

Algorithmic stability and problem sensitivity remain separate. A sound QR calculation can return accurate coefficients for the supplied numbers yet produce very different coefficients after a tiny target perturbation along a weak direction. Lab 3 adds (0,δ,−δ) to y, changing weights by approximately (−1,1) while retaining a tiny residual. A small fitted discrepancy establishes agreement with the current targets, not stable recovery of physically true coefficients. Appropriate feature scaling, measurement assumptions and later regularisation can alter the modelling or resolution decisions; they do not change this distinction.

::: check
Why solve Rw=Qᵀy instead of explicitly constructing R⁻¹? If QR gives a tiny residual, have we proved robustness to perturbed measurements?
:::
::: answer
The triangular system directly supplies the required weights with back substitution; an explicit inverse adds unnecessary intermediate work. A tiny residual concerns the supplied data only. The design's weak directions can still amplify a small data perturbation, even with a stable numerical algorithm.
:::

## Deriving normal equations without differentiation {#s5}

For arbitrary X, minimise the Euclidean objective F(w)=‖y−Xw‖². This is the **least-squares** criterion; the word squares refers to the sum of coordinate residual squares. Dividing by the fixed number of observations or multiplying by a positive constant changes the objective value but not its minimisers. Choosing another metric, adding a penalty or restricting w can change the minimising set, so each altered problem needs its own derivation.

The column space S=C(X) is finite dimensional. Its orthogonal projection p of y exists and is unique by Section 2. Because p belongs to S, at least one w satisfies Xw=p. These and only these weights minimise F: for any candidate, ‖y−Xw‖²=‖y−p‖²+‖p−Xw‖². Thus existence of minimising weights holds even for a rank-deficient design. The fitted vector is uniquely determined by the subspace and the chosen distance, while the map from weights to that vector may be many-to-one.

Residual perpendicularity gives the **normal equations** Xᵀ(y−Xw)=0, equivalently XᵀXw=Xᵀy. Necessity can also be proved by a direct scalar variation. If residual r has a nonzero dot product with a column a_j, change only weight j by t. The objective change is t²‖a_j‖²−2t a_jᵀr. The column is nonzero in this situation. Choosing t=(a_jᵀr)/‖a_j‖² gives a strictly negative change, contradicting minimality. Consequently every column dot product is zero. This argument has no derivative and covers all unconstrained real weights.

For sufficiency, suppose Xᵀr=0. A weight change h gives residual r−Xh, with rᵀXh=0. Expansion yields F(w+h)=F(w)+‖Xh‖²≥F(w). Hence every normal-equation solution is a global minimiser. Equality holds exactly for h∈N(X). We have proved both directions and the entire minimiser family, rather than merely finding a stationary candidate. With full column rank, Xh=0 forces h=0 and the minimiser is unique. Otherwise all weights in w+N(X) minimise with the same fitted vector.

::: worked title="Residuals are perpendicular in observation space"
For the three-record line fit, Xᵀr has two entries: Σrᵢ=0 and Σxᵢrᵢ=0. With r=(−1/6,1/3,−1/6), both identities hold. The residual lives in R³, perpendicular to the two-dimensional plane of possible predictions. In a scatter plot, its three vertical discrepancies are not generally perpendicular to the fitted line drawn in the x–y plane. The normal equations concern observation-vector geometry, a different space.
:::

With an intercept column of ones, residual perpendicularity implies their sum is zero. Without that column, there is no such automatic guarantee. An exact-fit target has residual zero; zero is perpendicular to every column, so the normal equations include interpolation as a special case. The residual can be nonzero while Xᵀr is zero, as in the line-fit example. Confusing the two arrays would make a correct approximate fit appear exact.

::: figure #fig-12-3
Regression projects an observation vector in Rᵐ onto the design's column space. Vertical scatter-plot residuals represent its coordinates, while perpendicularity is a statement in observation space.
:::

Weighted least squares with symmetric positive-definite W minimises rᵀWr. The same perpendicular-decomposition or variation argument gives XᵀWr=0 and XᵀWXw=XᵀWy. For diagonal weights, one can scale rows of X and y by the square roots of the weights and solve an ordinary Euclidean problem. Zero or negative weights require separate treatment, because the inner-product proof no longer applies unchanged. The numerical shape and interpretation of weights are part of the specification.

Normal equations describe optimality; they do not require using their Gram matrix as the algorithm. A QR or SVD solution can satisfy them to numerical tolerance while avoiding that intermediate. When testing a computed fit, inspect the residual and Xᵀr with a scale-aware tolerance and the declared rank. A good optimality check establishes that the specified objective was solved well. It still supplies no independent evidence about noise, omitted variables, causal meaning or extrapolation.

::: check
Why can Xᵀr=0 hold when r≠0? Under what condition does F(w+h)=F(w) for a minimising w?
:::
::: answer
A nonzero residual can lie in the left null space, perpendicular to all prediction directions. The objective remains equal exactly when Xh=0, meaning the parameter change lies in the design's null space. Full column rank excludes any nonzero such change.
:::

## Minimum-norm weights and the pseudoinverse geometry {#s6}

For a rank-deficient design, a least-squares minimiser w₀ determines the family w₀+N(X). To choose one representative, a common additional rule minimises the Euclidean parameter norm. Module 11 gave the orthogonal decomposition of parameter space into R(X) and N(X). Write w₀=u+k with u in the row space and k in the null space. Since Xk=0, Xu=Xw₀, so u is also a least-squares minimiser. Every equivalent minimiser has form u+n with n∈N(X). Orthogonality gives ‖u+n‖²=‖u‖²+‖n‖², uniquely minimised at n=0.

Thus the **minimum-norm least-squares solution** is the unique minimiser that belongs to the row space. Its uniqueness comes from an added choice of parameter metric, not from information newly supplied by the observations. Reparameterising or rescaling features can change which coefficient vector has smallest ordinary Euclidean norm, even when the possible predictions are unchanged. The coordinate convention therefore matters for this selection rule.

::: worked title="Duplicate features split the identifiable coefficient"
Use X with rows (1,x,x) for x=0,1,2 and targets (1,2,2). The fit requires w₀=7/6 and w₁+w₂=1/2, giving the family (7/6,t,1/2−t). Its norm square is (7/6)²+t²+(1/2−t)²=(7/6)²+1/8+2(t−1/4)². The minimum-norm choice is (7/6,1/4,1/4). Adding any multiple of (0,−1,1) leaves the fit unchanged. Splitting the slope equally is a convention justified by this parameter norm, not evidence that each duplicate feature has half the physical effect.
:::

The map taking y to this unique representative is the **pseudoinverse** X⁺. Its geometry has two stages: project y onto C(X), then apply the inverse of X restricted from R(X) to C(X). That restricted map is bijective by Module 11: its kernel in the row space is zero, and it reaches the whole column space. Projection and this inverse are linear, so their composition is a linear map from Rᵐ to Rᵈ, represented by a d×m matrix. This construction supplies the pseudoinverse without requiring a square inverse of X.

It satisfies XX⁺=P_C and X⁺X=P_R, the orthogonal projections onto the column and row spaces. The first identity follows because projecting and lifting then remapping returns the projected target. The second follows because any parameter splits into row-space and null-space parts, and the lift selects exactly its row-space part. Therefore XX⁺X=X and X⁺XX⁺=X⁺, and both XX⁺ and X⁺X are symmetric. These four identities are the Moore–Penrose conditions. The geometric construction proves them and explains why the rectangular pseudoinverse is different from an ordinary two-sided inverse. Module 14 will derive its singular-value formula and numerical cutoff issues.

::: figure #fig-12-4
Targets first project into the column space. The inverse restricted to the row space then selects a coefficient vector with no null component, producing the minimum-norm representative.
:::

A numerical pseudoinverse may discard sufficiently weak directions according to a tolerance. That changes the effective subspaces used in the calculation. A returned minimum-norm vector concerns that numerical policy and the supplied array; keep the exact mathematical construction separate. In the pinned least-squares interface, rank-deficient designs can also yield an empty returned residual-summary array even when the actual residual is nonzero. Compute y−Xw explicitly to assess the discrepancy rather than treating an empty summary as a proof of exact fit.

Least squares finally separates three questions. What vector is closest to the observed targets under the objective? Which coefficient representative is selected among equivalent fits? What prediction or interpretation should transfer to new records? Orthogonal projection answers the first, and full rank or an added convention answers the second. The third needs a feature-domain assumption and later statistical evidence. A zero training residual can arise from interpolation and still accompany poor future behaviour; a small residual can coexist with unstable coefficients. Keep these limits with the useful algebra, rather than attaching unsupported conclusions to a successful solver call.

::: check
Does the pseudoinverse make all targets exactly reachable? Does its unique minimum-norm vector remove a design's null space?
:::
::: answer
No. XX⁺y is the projection, equal to y only when y belongs to the column space. The null space remains a property of X. Minimum norm selects its row-space representative from an existing equivalence family; it does not make the observation map injective.
:::

## Common misconceptions {#misconceptions}

| Claim | Correction |
|---|---|
| A projection coefficient is the projected vector | Multiply the coefficient by its generator. |
| Rectangular Q has QQᵀ=I whenever QᵀQ=I | QQᵀ projects onto Q's column space. |
| Gram–Schmidt can normalise a zero remainder | Zero signals dependence and requires a guard. |
| Normal equations require differentiation | Perpendicularity or scalar variation proves both directions. |
| A scatter-plot residual is perpendicular to its line | Orthogonality holds in observation-vector space. |
| A unique fitted vector implies unique weights | Null directions leave predictions unchanged. |
| An empty residual summary means perfect fit | Compute the actual residual under the library contract. |
| A tiny residual guarantees robust coefficients | Weak directions can amplify data perturbations. |

## Three CPU labs {#labs}

Use the Python 3.11 and NumPy baseline in [array preparation](numpy_primer_EN.html). Outputs below are captured by running the downloadable scripts. Predict the shapes and expected identities first; use tolerances for floating-point equalities and distinguish them from the exact proofs.

### Lab A Projections and orthonormalisation {#lab1}

Compare the Euclidean and weighted diagonal-line projections. Predict which residual dot product should be zero in each geometry. Trace modified Gram–Schmidt, verify QᵀQ and QR, and explain the duplicate-column guard rather than removing it to continue execution.

{{LAB:lab1}}

**Deliverable:** the two objectives, projected vectors and residual conditions, followed by a two-column factorisation with shapes and reconstruction. Explain why tiny roundoff residual dots are compatible with an exact orthogonality theorem.

### Lab B QR fitting and the minimum-norm family {#lab2}

Fit the three records with reduced QR and the library least-squares solver. Check residual perpendicularity explicitly. Duplicate the x feature, predict the weight family, and verify that the minimum-norm representative is perpendicular to the null direction. Inspect the returned residual summary separately from the computed residual.

{{LAB:lab2}}

**Deliverable:** the unique predicted vector, the full equivalent coefficient family, its minimum-norm member and SSE. Explain why the library's empty rank-deficient summary does not mean that all records were fitted exactly.

### Lab C Gram rounding and target sensitivity {#lab3}

Write the exact Gram matrix before running. Compare it with the rounded matrix, then compare QR and library weights. Perturb the target along the weak direction and measure the coefficient change and residual. The captured normal-equation result is for this baseline; another arithmetic backend may produce inaccurate solvable coefficients instead of the same exception.

{{LAB:lab3}}

**Deliverable:** separate the avoidable Gram-matrix rounding loss from the design's intrinsic sensitivity to target changes. A stable solver avoids the first issue and cannot remove the second. Explain what a small residual actually certifies.

## Exercises with complete solutions {#exercises}

Exercises 1–12 are required; 13–14 add 35 optional minutes. Unless labelled weighted, every inner product is Euclidean and residual means y−Xw.

::: exercise #e1 level=1 kind=calculation minutes=6
Project (3,2) onto span{(1,1)} and compute the residual and its squared length.
:::
::: solution
c=5/2,p=(5/2,5/2),r=(1/2,−1/2),‖r‖²=1/2. The residual dot (1,1) is zero. Every alternative (a,a) gives discrepancy 1/2+2(a−5/2)², proving the displayed minimum.
:::

::: exercise #e2 level=1 kind=calculation minutes=6
Let Q=(1,0,0) be a single unit column. Compute QᵀQ, QQᵀ, and the projection of (2,3,4).
:::
::: solution
QᵀQ is the 1×1 identity, QQᵀ=diag(1,0,0), and the projection is (2,0,0). The residual (0,3,4) is perpendicular to the line. A one-dimensional projection is not the 3×3 identity.
:::

::: exercise #e3 level=1 kind=calculation minutes=6
In Gram–Schmidt for a₁=(1,1,0),a₂=(1,0,1), compute the first removal coefficient and the second remainder.
:::
::: solution
q₁=(1,1,0)/√2, coefficient q₁ᵀa₂=1/√2, and v₂=a₂−(1/2,1/2,0)=(1/2,−1/2,1). Its squared length is 3/2, so q₂=(1,−1,2)/√6. Its dot with q₁ is zero, and q₂ has unit norm.
:::

::: exercise #e4 level=1 kind=calculation minutes=6
For full-column-rank X of shape 7×3 and a single target y, give reduced Q,R,Qᵀy,w,p shapes and the equation to solve.
:::
::: solution
Q is 7×3,R is 3×3,Qᵀy and w have length three, and p=Xw has length seven. Solve Rw=Qᵀy by triangular back substitution. QᵀQ=I₃, while QQᵀ is a 7×7 projection of rank three.
:::

::: exercise #e5 level=2 kind=proof minutes=15
Prove the subspace projection is the unique closest point from its residual perpendicularity, without differentiation.
:::
::: solution
Suppose p∈S and r=y−p is perpendicular to S. For any s∈S, p−s∈S, so r and p−s are perpendicular. Therefore ‖y−s‖²=‖r‖²+‖p−s‖²≥‖r‖². Equality requires p−s=0 by positive definiteness, proving uniqueness. Existence is supplied by p=QQᵀy for an orthonormal basis of S; Qᵀr=0 verifies perpendicularity.
:::

::: exercise #e6 level=2 kind=proof minutes=15
Prove both necessity and sufficiency of Xᵀ(y−Xw)=0 for unconstrained least squares using scalar variation and orthogonal expansion.
:::
::: solution
If a column a_j has a_jᵀr≠0, changing weight j by t=(a_jᵀr)/‖a_j‖² lowers the objective by (a_jᵀr)²/‖a_j‖², contradicting minimality. Thus every column dot is zero. Conversely, if Xᵀr=0, every change h satisfies rᵀXh=0, giving F(w+h)=F(w)+‖Xh‖²≥F(w). Equality holds exactly for null directions. No differentiation or full-rank assumption is needed.
:::

::: exercise #e7 level=2 kind=proof minutes=15
Prove a rank-deficient least-squares family has a unique minimum-Euclidean-norm member in the row space.
:::
::: solution
Decompose one minimiser w₀=u+k into row-space and null-space components. Then Xu=Xw₀, and all equivalent minimisers are u+n,n∈N(X). Row and null spaces are perpendicular, so ‖u+n‖²=‖u‖²+‖n‖². Positive definiteness makes n=0 the unique norm minimum. This is an extra representative-selection rule, not uniqueness of the original least-squares objective's weights.
:::

::: exercise #e8 level=2 kind=application minutes=13
Fit the records (0,1),(1,2),(2,2) by y≈w₀+w₁x; give residuals, SSE and both normal-equation checks.
:::
::: solution
XᵀX=[[3,3],[3,5]],Xᵀy=(5,6). The equations give w₁=1/2,w₀=7/6. Predictions (7/6,5/3,13/6) produce residuals (−1/6,1/3,−1/6). SSE=1/36+1/9+1/36=1/6. Their sum is zero and x-weighted sum is 1/3−2/6=0. Full column rank ensures unique weights.
:::

::: exercise #e9 level=2 kind=application minutes=13
Project (3,2) onto span{(1,1)} using W=diag(4,1). Compare the weighted and ordinary residual orthogonality conditions.
:::
::: solution
c=(12+2)/(4+1)=14/5,p=(14/5,14/5),r=(1/5,−4/5). The weighted dot is 4/5−4/5=0, while the ordinary dot is −3/5. The changed closest point minimises 4(3−a)²+(2−a)²; the usual Euclidean point (5/2,5/2) solves a different objective.
:::

::: exercise #e10 level=2 kind=application minutes=13
Duplicate the x column in Exercise 8. Give all minimising weights and derive the minimum-norm one.
:::
::: solution
All weights are (7/6,t,1/2−t) because only the sum of duplicate-feature weights is identified. Norm square is (7/6)²+1/8+2(t−1/4)², uniquely minimised at t=1/4. Thus w_min=(7/6,1/4,1/4). The null direction is (0,−1,1), and w_min is perpendicular to it. All family members have the same predictions and SSE 1/6.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=16
A scatter plot labels vertical residuals perpendicular to the fitted line and asserts every least-squares residual has zero sum. Repair both claims.
:::
::: solution
Residual orthogonality is r∈Rᵐ perpendicular to C(X), not the geometry of each vertical segment in the x–y plane. Residual sum is zero when the design includes an intercept column of ones. Without it, take X=[[1],[2]],y=(1,0). The fit coefficient is 1/5, residual (4/5,−2/5) has Xᵀr=0 but sum 2/5. Thus the optimality condition alone does not force zero sum for every design.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=16
A program reports an empty least-squares residual-summary array as an exact fit, forms XᵀX despite a weak feature direction, and treats a tiny residual as robust coefficient recovery. Give three repairs.
:::
::: solution
Compute the actual residual y−Xw and its SSE; a rank-deficient library return can have an empty summary despite SSE 1/6 in Lab B. Use QR or an appropriate least-squares solver to avoid avoidable Gram rounding; Lab C's δ difference enters the Gram matrix as δ² and can disappear. Then perturb the data and analyse conditioning separately: the same QR computation can have a tiny residual while weights change by roughly (−1,1) under target norm change about 1.4×10⁻⁸. Algorithm choice does not certify data insensitivity.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Find the closest point to y=(3,0) on the affine line (1,0)+span{(1,1)}, and prove the translation rule.
:::
::: solution
Translate the target to y−p₀=(2,0), whose projection onto the diagonal is (1,1). Add p₀ back to get (2,1), with residual (1,−1). Any affine candidate is p₀+s,s∈S, and ‖y−(p₀+s)‖=‖(y−p₀)−s‖. Thus the ordinary subspace closest-point theorem proves the rule and uniqueness.
:::

::: exercise #e14 level=3 kind=extension minutes=20
Show that the product of two orthogonal projections need not be an orthogonal projection. Prove that commuting projections do project onto their intersection.
:::
::: solution
Take P=[[1,0],[0,0]] and Q=(1/2)[[1,1],[1,1]]. Both are symmetric idempotent. PQ=(1/2)[[1,1],[0,0]] is neither symmetric nor idempotent, so is not an orthogonal projection. If P,Q commute, (PQ)ᵀ=QP=PQ and (PQ)²=P²Q²=PQ. Every image vector PQy is fixed by P and Q, hence in both images. Conversely a vector fixed by both is fixed by PQ. Thus the product is the orthogonal projection onto the intersection; symmetry and idempotence ensure its perpendicular residual decomposition.
:::

## Ten-question self-check {#quiz}

```quiz
? For nonzero u, what is the projection of y onto span{u}?
- [x] u(uᵀy)/(uᵀu)
- [ ] The scalar uᵀy alone
- [ ] u(uᵀu)/(uᵀy) for every y
> The projected vector scales u by its perpendicular-residual coefficient. The reciprocal expression can be undefined and does not satisfy the condition.

? Q is m×d with orthonormal columns and d<m. What is QQᵀ?
- [ ] The identity on all of Rᵐ
- [x] The projection onto C(Q)
- [ ] A d×d coordinate identity
> QᵀQ is the d×d identity. QQᵀ is m×m and retains only the column-space component.

? A Gram–Schmidt remainder is exactly zero. What follows?
- [ ] Normalising it yields a new unit direction
- [ ] The vector space has ceased to exist
- [x] This column adds no new direction to the previous span
> A zero remainder expresses the column using earlier directions. Division by its norm is invalid.

? Which reduced QR equation solves full-column-rank least squares?
- [x] Rw=Qᵀy
- [ ] Qw=y for every target
- [ ] Rᵀw=Qy with these same shapes
> Orthogonal decomposition makes the variable part of the objective ‖Qᵀy−Rw‖². The other equations are generally incompatible or dimensionally invalid.

? The normal equations assert what about residual r=y−Xw?
- [ ] r=0 in every fit
- [x] Xᵀr=0
- [ ] Each scatter-plot segment is perpendicular to its drawn line
> Residuals are perpendicular to prediction directions in observation space and may be nonzero.

? When are unconstrained least-squares weights unique?
- [ ] Whenever the fitted vector is unique
- [ ] Whenever a solver returns one vector
- [x] When X has full column rank
> Null directions produce equivalent minimisers. Projection makes fitted vectors unique even when that kernel is nonzero.

? What selects the minimum-Euclidean-norm representative?
- [x] Its null-space component is zero
- [ ] It makes every target exactly reachable
- [ ] It removes the design's existing kernel
> The representative lies in the row space. It adds a selection criterion without altering the map or its reachable targets.

? A rank-deficient library fit returns an empty residual summary. What should be checked?
- [ ] Assume SSE is zero
- [x] Compute y−Xw and its norm explicitly
- [ ] Infer full column rank
> The return contract can omit this summary for rank-deficient designs. The actual discrepancy needs its own calculation.

? QR avoids Gram rounding in a near-collinear design. What remains possible?
- [ ] Exact rank must become one
- [ ] All measurements become trustworthy
- [x] Tiny target changes can still greatly change weights
> Algorithmic quality does not remove intrinsic data sensitivity. A tiny residual is not a coefficient-robustness guarantee.
```

<div class="free-response" data-free-response data-key="math-series:m12:q10">
<label for="q10-response">10. Derive least-squares optimality without calculus. Explain residual orthogonality, the complete minimiser family, and how the minimum-norm representative is chosen.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="Use a perpendicular decomposition or scalar variation, then separate predictions from parameters."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I proved sufficiency, stated the null family, and explained the extra norm criterion.</label>
</div>

::: answer
Projection p onto C(X) gives y−Xw=(y−p)+(p−Xw), an orthogonal sum; minimisation requires Xw=p. Equivalently r is perpendicular to every column, Xᵀr=0. Then F(w+h)=F(w)+‖Xh‖², so all and only changes in N(X) preserve the optimum. Weights form w+N(X), with unique predictions. Decompose w into row and null components and retain the row component: adding any null component strictly increases its squared norm unless that component is zero. This chooses a minimum-norm representative without making the original map injective.
:::

## Reading with a purpose {#reading}

Use orthogonality, projection and linear-regression selections in the authors' [Mathematics for Machine Learning companion](https://mml-book.com/). For numerical contracts, read official NumPy 1.26 documentation for [QR](https://numpy.org/doc/1.26/reference/generated/numpy.linalg.qr.html), [least squares](https://numpy.org/doc/1.26/reference/generated/numpy.linalg.lstsq.html), and [pseudoinverse](https://numpy.org/doc/1.26/reference/generated/numpy.linalg.pinv.html). These supplement the original proofs and examples above.

| When | Selection and question |
|---|---|
| Session 1 · 20 minutes | Projection: which assumption makes the extra squared-distance term nonnegative and uniquely zero? |
| Session 4 · 20 minutes | QR shapes, rank-dependent residual returns, and pseudoinverse cutoffs: what does each numerical call promise? |

## Retrieval exit task and next step {#summary}

Without notes, derive the line projection, prove subspace uniqueness, and construct a two-column QR. Derive both directions of the normal equations without calculus. Distinguish fit uniqueness, weight uniqueness and minimum-norm selection, then describe one numerical and one modelling limitation.

**Exit task:** X=[[1],[1],[1]],y=(1,2,3) has weight two, fit (2,2,2), residual (−1,0,1) and SSE two. The residual dot with X's column vanishes. Duplicating that column yields weights (t,2−t), with minimum norm at (1,1). Explain why the fitted prediction did not change and why neither result supplies a future-data guarantee.

**Ready to move on:** you can identify the relevant spaces, objective and algorithm before interpreting a fit. Module 13 develops eigenvalues and quadratic forms; Module 14 will derive singular values and the computational pseudoinverse. Check the [course overview](index.html) for availability.

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| Inner product / orthogonal | Chosen positive-definite bilinear geometry / zero product | 内积、正交 |
| Q / QᵀQ=I | Orthonormal columns / coordinate identity | 标准正交列 |
| P / p / r | Projection map / fitted vector / target minus fit | 投影、拟合向量、残差 |
| Gram–Schmidt | Remove earlier components then normalise | 格拉姆–施密特 |
| QR / R | Orthonormal–triangular factorisation / upper triangular factor | QR 分解、上三角因子 |
| Xᵀr=0 | Euclidean least-squares optimality | 正规方程 |
| SSE | Sum of squared residuals | 残差平方和 |
| Minimum norm / X⁺ | Extra coefficient-selection rule / pseudoinverse map | 最小范数、伪逆 |
| Sensitivity / stability | Data response / numerical algorithm's error behaviour | 敏感性、稳定性 |
