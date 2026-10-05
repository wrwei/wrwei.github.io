## A representation can be redundant even when its predictions are clear {#start}

A matrix equation can determine its output while leaving several input coordinates interchangeable. A model containing both Celsius and Fahrenheit measurements plus an intercept supplies a concrete example: those three columns cannot carry three independent directions of information. Different weights can agree on every physically valid temperature record. A different design can agree only on the observed training rows and disagree on the next record. Distinguishing these claims is the purpose of identifiability.

This lesson turns the pivot calculations from Module 10 into statements about spaces, coordinates and information. You will prove closure, separate spanning from independence, compute all four fundamental spaces, and derive rank–nullity rather than memorising a dimension equation. The final section connects exact algebra with numerical rank policies and parameter interpretation.

**Retrieval check:** explain a reversible augmented-row operation and the meaning of a free variable. Revisit [Module 10](module_10_EN.html#s3) and [proof structure](module_04_EN.html#s1) if needed. Use [NumPy preparation](numpy_primer_EN.html) for the numerical labs. All spaces and scalars here are real; the labs deliberately distinguish exact rational arithmetic from floating-point decisions.

## Vector spaces and the subspace test {#s1}

A **vector space** is a set V equipped with addition and scalar multiplication satisfying the familiar laws of coordinate algebra. Addition is associative and commutative, there is an additive identity 0, and every vector has an additive inverse. Scalars distribute over vector addition and their own addition; multiplying scalars successively agrees with their product, and multiplication by one changes nothing. Both operations must stay inside V. Specifying a set alone does not specify a vector space: the operations and scalar field matter too.

Real coordinate space satisfies these laws component by component. Vectors need not be arrows or arrays. The real polynomials of degree at most two form a vector space under ordinary polynomial addition and scaling: coefficients add and scale, and these operations do not introduce a cubic term. The zero polynomial belongs despite having no ordinary finite degree. Real functions on a fixed domain form another space under pointwise operations. Here the zero vector is the zero function, and equality means agreement at every domain point, not merely agreement at sampled inputs.

A **subspace** W of V uses the same operations as V and is itself a vector space. A convenient sufficient and necessary test is: W is nonempty and, for every u,v in W and every real a,b, the combination au+bv belongs to W. Necessity follows from closure under the two operations. For sufficiency, nonemptiness supplies some u; choosing both coefficients zero supplies 0, choosing a=−1 gives negatives, and appropriate choices give addition and scaling. The remaining algebraic laws are inherited from V, since the operations are unchanged. This argument explains why an empty set cannot pass the test by vacuous closure alone.

Many solution sets are subspaces because a homogeneous linear equation respects combinations. If L is linear, L(au+bv)=aL(u)+bL(v). Thus the set of vectors satisfying L(v)=0 contains zero and is closed. Intersections of such sets are subspaces: a combination of two members satisfies every shared homogeneous constraint. This also shows that the intersection of any collection of subspaces is a subspace. Their union need not be one. A vector on the horizontal axis plus a vector on the vertical axis can leave the union of the two axes.

::: worked title="A homogeneous plane and a translated plane"
Let W={(x,y,z):x+y−z=0}. Zero belongs, and for u,v∈W, the constraint on au+bv equals a·0+b·0=0, proving closure for all scalars. The set U={(x,y,z):x+y−z=1} fails immediately because zero does not belong. U is an affine plane: it can be written p+W for any one solution p, such as (1,0,0), but it is not a vector subspace with the inherited operations.
:::

The distinction between a homogeneous subspace and an affine translate is important for feasible sets and model constraints. Given one solution p of Av=b, every other solution differs from p by an element of the kernel: A(v−p)=0. Conversely p+n solves the system for every kernel element n. That statement describes the entire solution set, not merely a convenient way to produce a few examples. A consistent nonhomogeneous system may happen to contain zero only when b=0; otherwise its solution set cannot be a subspace.

Do not replace the subspace test with the phrase “looks flat.” A ray is straight but fails closure under negative scaling. A bounded line segment fails closure under arbitrary scaling. A sphere fails to contain zero. Two intersecting lines through zero fail closure under addition unless they are the same line. A proof must cover every pair and scalar, whereas one counterexample suffices to disprove closure. In feature engineering, the nonnegative orthant is closed under nonnegative combinations but is not a real vector subspace; that different structure is useful and should receive its own assumptions.

::: check
Are polynomials p with p(0)=0 a subspace? What about p(0)=1?
:::
::: answer
The first contains zero and satisfies (ap+bq)(0)=a·0+b·0=0. The second omits the zero polynomial. The argument works in either the space of all real polynomials or a specified degree-bounded polynomial space; state which ambient space you use.
:::

## Span dependence and independent information {#s2}

The **span** of vectors v₁,…,vₖ is the set of every finite combination a₁v₁+…+aₖvₖ with real coefficients. It is a subspace: zero coefficients supply zero, and adding or scaling combinations simply changes their coefficients. It is also the smallest subspace containing the listed vectors. Any subspace containing them must contain every combination by closure. This gives span a constructive meaning: it describes what directions the representation can express, while the coefficients describe how a particular vector is expressed.

A list is **linearly independent** when the only combination giving zero is the one with every coefficient zero. It is **dependent** when some nonzero coefficient vector gives zero. “Nonzero coefficient vector” means at least one coefficient differs from zero, not that every coefficient must do so. Rearranging a dependence relation around any nonzero coefficient expresses that listed vector as a combination of the others. Conversely such an expression yields a dependence relation. Hence dependence is exactly a redundancy in a nonempty list. A list containing the zero vector is dependent, and a repeated vector creates dependence even when that vector is nonzero.

The definition handles boundary cases consistently. The empty list is independent, since there is no nontrivial coefficient choice. Its span is the zero subspace, using the empty sum convention. A one-vector list containing a nonzero vector is independent: av=0 forces a=0 by a nonzero coordinate, or by multiplying by 1/a if a≠0. Two nonzero vectors can be dependent without being identical; one can be any scalar multiple of the other. Independence is a collective property, so testing pairs does not establish independence of three or more vectors.

::: worked title="Three nonparallel pairs can still be redundant"
Let u=(1,0),v=(0,1),w=(1,1). No pair is a scalar-multiple pair, but u+v−w=0 makes the three-vector list dependent. The first two span all of R², and adding w changes neither the span nor the number of independent directions. By contrast, u and 2u span only the horizontal axis. Two listed vectors are not automatically two independent directions.
:::

For a matrix A with these vectors as columns, a coefficient vector c satisfies Ac=0 exactly when its coefficients give a dependence relation. This connects the definition directly to elimination: a nonzero solution of the homogeneous system certifies dependence. If every column has a pivot, there are no free coefficient variables and the columns are independent. If a free column exists, assigning its free variable one and the others zero creates a nonzero relation. The computation supplies a witness, whereas a bare numerical “rank” value can hide which columns are redundant.

To find a spanning independent subset, process a finite generating list in order. Keep a vector only if it is outside the span of those already kept. The kept list remains independent: a new nontrivial relation with a nonzero new coefficient would express that new vector using the old ones. Each rejected vector is already represented, so the final kept list spans every generator and therefore the original span. This finite greedy argument proves existence of a basis for a finitely generated space. It does not promise a uniquely preferred subset; ordering and the intended interpretation can influence the choice.

The span concerns exact representability, not automatically similarity, physical meaning or predictive quality. Two feature columns can be algebraically independent yet badly scaled or nearly redundant. Conversely a dependent feature can be a useful named quantity while providing no additional linear direction. Removing redundancy can clarify parameters, but a claim that a feature is unnecessary for every future task would require more than a dependence calculation for one chosen representation and sample.

::: figure #fig-11-1
Three vectors generate a plane, but the third is the sum of the first two. The generating list and the independent directions are different counts.
:::

::: widget name=spans
Choose two generating vectors and a target. Compare a full plane, a line and the zero subspace; obtain an exact representability witness or an inconsistency certificate for these integer presets.
:::

::: check
Why does one nonzero solution of Ac=0 establish dependence, while checking Ac≠0 for ten selected nonzero c does not establish independence?
:::
::: answer
Dependence asks for an existential witness. Independence requires that every coefficient vector solving Ac=0 be zero. A finite selection can miss a null direction. Exact elimination analyses the whole solution set; ten samples analyse only ten choices.
:::

## Bases dimension and changes of coordinates {#s3}

A **basis** is a spanning independent list. Spanning gives an expression for every vector, and independence makes that expression unique: subtracting two expressions for the same vector produces a zero combination, so their coefficients agree term by term. Both conditions are needed. A redundant spanning list can have many coordinate descriptions of the same vector. An independent list that does not span cannot describe all vectors in the space. Basis coordinates therefore depend on both the space and the selected ordered basis.

If B=(b₁,…,b_d) is a basis, write [v]_B for the coefficient tuple in v=Σcᵢbᵢ. A vector and its coordinate tuple are related by this basis map, but they are not interchangeable without identifying B. With the coordinate unit basis in Rᵈ, the distinction is easily hidden because the tuple entries coincide. For a different basis the tuple changes while the represented vector stays the same. Reordering basis vectors changes the coordinate order. Scaling one basis vector requires an inverse scaling of its corresponding coordinate.

::: worked title="A nonstandard basis changes coordinates"
Take b₁=(1,1),b₂=(1,−1). Solving c₁b₁+c₂b₂=(3,1) gives c₁+c₂=3,c₁−c₂=1, hence coordinates [v]_B=(2,1). The basis matrix P=[[1,1],[1,−1]] maps B-coordinates to standard coordinates: P(2,1)=(3,1). It is invertible, with P⁻¹=[[1/2,1/2],[1/2,−1/2]]. The vector did not move when its coordinate description changed.
:::

Why is the size of a basis well defined? We need a finite exchange argument, not a diagram. Let b₁,…,b_d span V and let u₁,…,u_k be independent. Express u₁ using the spanning list; because it is nonzero, at least one coefficient is nonzero. Solve for that corresponding b and replace it by u₁. The new d-vector list still spans. Suppose the first j−1 independent vectors have already been inserted. Express u_j in the current spanning list. At least one coefficient on a remaining original vector must be nonzero, since otherwise u_j would lie in the span of earlier u's, contradicting independence. Replace that original vector using the same rearrangement. At each stage one remaining place is used, so the process cannot insert more than d independent vectors. Therefore k≤d.

Apply this bound to two bases in both directions. The first independent basis has size no greater than the second spanning basis, and vice versa. Their sizes are equal. This common finite size is the **dimension** of V. The zero space has dimension zero and the empty basis. A subspace of a d-dimensional space has dimension at most d, because any independent list in the subspace is also independent in the ambient space. An independent list with d vectors in a d-dimensional space must span: otherwise adding a vector outside its span would create d+1 independent vectors, contradicting the bound.

The same argument proves basis extension. Start with any independent list in a finite-dimensional space and inspect an existing finite spanning list. Add a generator whenever it is outside the current span. Independence is preserved, and after the generators have been processed the list spans. Thus a basis of a subspace can be extended to a basis of its ambient space. We will use this existence proof in rank–nullity. In computations, the extension can be found through pivots; in a theorem it supplies a logical bridge between local constraints and global dimensions.

For two bases B and C of the same d-dimensional space, the coordinate-change matrix T has columns [bᵢ]_C. Then [v]_C=T[v]_B by linearity of combinations, and T is invertible because both coordinate descriptions are unique. A map's matrix also depends on the input and output bases. If input coordinates change by P and output coordinates by Q relative to the original coordinate systems, its new matrix is Q⁻¹AP. For an endomorphism using the same change on both sides this becomes P⁻¹AP. These are descriptions of one map; changing A without the accompanying convention can instead change the map itself.

::: check
Is the list (1,0),(0,1),(1,1) a basis of R²? Can its third vector have unique coefficients relative to that whole list?
:::
::: answer
It spans but is dependent, so it is not a basis. The third vector has coefficient lists (0,0,1) and (1,1,0), among infinitely many. Unique coordinates follow only after choosing a spanning independent list.
:::

## The four fundamental spaces and their ambient dimensions {#s4}

For an m×n matrix A, the **column space** C(A) is the span of its columns in Rᵐ, equivalently the image {Ax:x∈Rⁿ}. The **row space** R(A) is the span of its rows, regarded as vectors in Rⁿ. The **null space** N(A)={x∈Rⁿ:Ax=0} lives in the input space. The **left null space** N(Aᵀ)={z∈Rᵐ:Aᵀz=0} lives in the output space. The word left refers to zᵀA=0; it does not mean a fifth type of matrix operation. Their ambient dimensions matter before any calculation, especially for a rectangular matrix.

Reversible row operations preserve the row space, since each new row is a combination of old rows and the inverse operations give the reverse inclusion. They preserve the null space because they preserve the homogeneous equation's solutions. They usually change the column space as a subset of Rᵐ. If E is the invertible product of row-operation matrices, the reduced matrix is EA and its column space is E applied to the old column space. Equal dimensions do not make these two sets equal. This is why pivot columns selected in a reduced matrix must be taken from the original matrix when constructing a basis for C(A).

Here is the exact justification for that rule. In echelon form, the pivot columns are independent: inspecting pivot rows from the last to the first forces each coefficient of a zero combination to vanish. Every nonpivot column is their combination. One can solve its coefficients by back substitution on the pivot-row triangular system; rows below the pivots are zero. Thus the pivot columns form a basis for the reduced column space. Applying E⁻¹ to the relation and to the independence claim gives the same column indices as a basis for the original column space. The number of pivots is consequently the column-space dimension.

The nonzero echelon rows are independent, since their distinct leading positions force a zero combination's coefficients to vanish from the first leading position onward. They span the echelon row space, which equals the original row space. Therefore the row-space dimension is the same pivot count. We call this common value the **rank** r. This proves equality of row rank and column rank rather than treating the two numbers as an unexplained coincidence. It also yields r≤min(m,n), including zero matrices with rank zero.

::: worked title="One matrix, four spaces"
For A=[[1,0,1],[0,1,1],[1,1,2]], row three is row one plus row two. Reduction gives [[1,0,1],[0,1,1],[0,0,0]]. Original columns one and two, (1,0,1),(0,1,1), form a column basis. The two nonzero reduced rows form a row basis. Solving Ax=0 gives x₁=−x₃,x₂=−x₃, so N(A)=span{(−1,−1,1)}. A is symmetric, so its left null space has the same basis in this particular example. Both image and row spaces are the plane z=x+y; both null spaces are lines.
:::

Each null vector is perpendicular to every row, because those dot products are the entries of Ax. Each left-null vector is perpendicular to every column, because those dot products are the entries of Aᵀz. These orthogonality statements follow directly from dot products. In particular, if Ax=b, any left-null z must satisfy zᵀb=zᵀAx=0. A nonzero value is an inconsistency certificate. For the example, b=(2,3,5) meets the condition and b=(2,3,6) fails it by one.

The left-null condition is also sufficient. Reduce [A|b] using E. If no solution exists, echelon form contains a row with zero coefficients and a nonzero constant. The corresponding row zᵀ of E satisfies zᵀA=0 and zᵀb≠0. Therefore if every left-null vector is perpendicular to b, no such contradiction exists, and b belongs to the column space. This proves C(A)=N(Aᵀ)⊥. Applying the argument to Aᵀ also proves R(A)=N(A)⊥. Projection formulas for these perpendicular spaces come in Module 12; this lesson already explains their algebraic role in solvability.

::: figure #fig-11-2
Row and null spaces live on the input side; column and left-null spaces live on the output side. Their dimensions depend on the matrix rank and on the corresponding ambient space.
:::

::: check
Can the reduced matrix's first two columns be used directly as a column-space basis for the example A above?
:::
::: answer
No. They are (1,0,0),(0,1,0), spanning z=0 rather than the original plane z=x+y. Their indices identify the original columns to select. Row operations preserved column relations and rank, but transformed the actual column vectors.
:::

## Rank–nullity and the full solution family {#s5}

The **nullity** of a linear map is the dimension of its kernel. Rank–nullity states that for a linear map A from an n-dimensional input space, rank(A)+dimN(A)=n. It divides input degrees of freedom into directions that change the output and directions that disappear. The output space can have a different dimension m; left nullity is m−r, not n−r. Confusing these two counts can make a rectangular system look consistent or uniquely solvable when it is neither.

We can prove the theorem without counting free variables as an unexplained rule. Choose a kernel basis k₁,…,k_q and extend it to an input basis k₁,…,k_q,u₁,…,u_{n−q}, using the finite extension argument above. We claim that Au₁,…,Au_{n−q} form a basis of the image. For spanning, express any input x in the extended basis. Applying A removes its kernel terms, so Ax is a combination of the Au's. For independence, suppose ΣcᵢAuᵢ=0. Then Σcᵢuᵢ lies in the kernel and has an expression Σdⱼkⱼ. Subtracting these two expressions gives a zero combination of the entire extended basis. Its independence forces every cᵢ and dⱼ to vanish. Hence the image list is independent and has n−q vectors. Its size is the rank, giving r+q=n. No assumption of a square or invertible matrix was needed.

Elimination supplies a computational version of this proof. With r pivot variables and n−r free variables in a homogeneous system, set one free coordinate to one and the others to zero and solve the pivot variables. Do this for each free coordinate. The resulting n−r vectors are independent because their free-coordinate positions contain distinct unit vectors. They span because any free-coordinate assignment is that same combination of these particular assignments, and the pivot equations determine all remaining coordinates. Thus they form a kernel basis. The method describes every null vector, unlike choosing a few arbitrary examples that merely happen to satisfy Ax=0.

::: worked title="A solvable target has an affine family"
For the preceding A and b=(2,3,5), one solution is p=(2,3,0). Every solution is p+t(−1,−1,1)=(2−t,3−t,t). Substitution gives (2,3,5) for every real t. Conversely Ax=b implies x₁+x₃=2,x₂+x₃=3, so choosing t=x₃ yields exactly this family. The affine solution set has one free dimension; it is not a vector subspace because b is nonzero.
:::

These facts recover complete system classification. A target has a solution precisely when it lies in C(A). If it has one solution, the family is p+N(A); it is unique exactly when N(A)={0}, equivalently r=n. Every possible target in Rᵐ is attainable exactly when C(A)=Rᵐ, equivalently r=m. Both properties hold together only for a square full-rank matrix. A tall full-column-rank matrix can identify a unique input for a compatible target while leaving many targets incompatible. A wide full-row-rank matrix can reach every target but retains at least n−m null directions. “Full rank” alone must identify which dimension is limiting.

The orthogonality relations also separate a general input x into a row-space component and a kernel component. Their intersection contains only zero: a vector in both is perpendicular to the row space while belonging to it, so its dot product with itself is zero. The dimensions sum to n by rank–nullity. Joining bases of the two spaces gives n independent vectors, hence an input-space basis. Every x therefore has a unique decomposition x=u+k with u∈R(A),k∈N(A). A maps u and x to the same output. Its restriction to the row space is injective, and these row-space inputs reach the whole column space. The map loses exactly the kernel information.

In constraint solving, null vectors describe permissible changes after one solution has been found. In learning, they describe parameter changes that the design matrix cannot distinguish. In compression or sensing, they describe signals producing the same measurements. These are algebraically the same statement with different interpretations of x. A domain restriction can change identifiability: if inputs are required to belong to a special set, two admissible inputs must differ by a null vector for ambiguity, but not every null displacement remains admissible. This lesson's uniqueness statements concern unrestricted real inputs unless another set is explicitly stated.

::: check
An m=5,n=3 design has rank three. What are its nullity and left nullity? Does every target have a solution?
:::
::: answer
Nullity is zero and left nullity is two. Every compatible target has one input solution, but the column space has dimension three inside R⁵, so not every target is compatible. Full column rank gives injectivity, not surjectivity onto a larger output space.
:::

## Identifiability structural redundancy and numerical rank {#s6}

For a fixed design matrix X, linear predictions are Xw. Two weights w and w′ produce the same predictions exactly when X(w′−w)=0. Thus their difference lies in N(X), and all weights equivalent to one w form w+N(X). **Parameter identifiability** for this unconstrained linear representation means different weights give different predictions on the specified records; it holds exactly when X has full column rank. Unique fitted predictions can coexist with nonunique weights. An algorithm may choose one representative without proving that the data identified it.

::: worked title="Celsius Fahrenheit and an intercept"
Rows are (1,C,F) with F=1.8C+32. Every such row has dot product zero with n=(−32,−1.8,1). Therefore Xn=0. Starting with w=(5,2,−1), choose w′=w+0.5n=(−11,1.1,−0.5). Both predict −27,−25,−23 at C=0,10,20 and −21 at C=30. Algebraically the model reduces to (w₀+32w_F)+(w_C+1.8w_F)C. These two combined coefficients can be identifiable from distinct temperatures while the original three weights are not.
:::

An intercept plus all one-hot columns for a single categorical variable has the same issue. If exactly one of K category indicators equals one on each record, their sum is the intercept column. The null direction is (−1,1,…,1). Dropping one indicator creates a baseline-category representation. Its intercept is the baseline prediction and each retained coefficient is a difference from that baseline. Removing the intercept instead gives a separate category coefficient for every category. These parameterisations can represent the same prediction functions with different coefficient meanings. Full rank still requires that the observed records cover the retained categories; a missing category can create additional ambiguity.

Equivalent training predictions do not always mean equivalent functions on new records. For features (1,x,x²) observed only at x=0,1, the last two columns are equal. The weight change (0,−1,1) leaves those predictions unchanged but changes a prediction at x=2 by −2+4=2. By contrast, the Celsius–Fahrenheit relation is a structural feature identity on the stated domain of valid temperature conversions, so its null direction remains invisible there. A faulty sensor or a different feature-generation rule can violate even that domain assumption. State whether a dependence holds on the sample, on a declared input domain, or on all possible real feature tuples.

::: figure #fig-11-3
Parallel parameter points along a null direction share predictions. A feature identity can preserve this equivalence throughout a declared domain; a coincidence in training rows need not.
:::

Exact rank asks whether a relation is precisely zero in the mathematical model. Numerical rank asks which directions are distinguishable at a stated resolution. The matrix [[1,1],[1,1+δ]] has determinant δ and exact rank two whenever δ≠0. With δ=10⁻¹², it is close to the dependent δ=0 case. A small input or measurement perturbation can alter whether that tiny difference is practically resolvable. Thresholding a floating-point computation can deliberately report one effective direction without proving that the exact determinant vanished.

NumPy's pinned rank interface uses singular values, nonnegative direction-strength quantities developed in Module 14, and counts values above a tolerance. Its default scales with the largest value, matrix dimensions and machine precision. A user-specified absolute cutoff has different units and can change its conclusion when the entire matrix is scaled. In Lab 3, tolerances 10⁻¹⁴ and 10⁻¹⁰ give numerical ranks two and one for the same near-dependent input. Multiplying by a million with the same absolute cutoff changes the decision; scaling the cutoff proportionally preserves this example's decision. Record the dtype, feature units, tolerance and purpose. Choosing a threshold should reflect computational or measurement resolution, rather than silently asserting an exact theorem.

::: figure #fig-11-4
A tiny nonzero feature difference makes exact rank two, while a selected resolution policy can treat that direction as unresolved. The policy and the exact claim answer different questions.
:::

Removing an exactly redundant feature or imposing a constraint can choose a unique representation, but the resulting coefficient meaning depends on that choice. A minimum-norm convention and regularisation introduce further criteria, developed in later lessons. They can stabilise or select parameters without recovering information that the observations never distinguished. Independence also establishes no causal effect, uncertainty bound or generalisation guarantee. Those questions require statistical and modelling assumptions beyond this algebra. The useful habit is to state precisely what the matrix determines, what it leaves free, and on which domain the interpretation is intended.

::: check
If a solver returns one coefficient vector for a rank-deficient design, have the coefficients become identifiable? If numerical rank is one, is exact dependence proved?
:::
::: answer
No in both cases. A solver may select a representative by an extra convention. Numerical rank is relative to a numerical resolution policy; exact dependence requires an exact relation or a corresponding theorem. Predictions, chosen parameters and information supplied by data are separate claims.
:::

## Common misconceptions {#misconceptions}

| Claim | Correction and witness |
|---|---|
| Any straight set is a subspace | An offset line omits zero; a ray fails negative scaling. |
| Pairwise independence establishes independence | (1,0),(0,1),(1,1) have no dependent pair but a three-vector relation. |
| A spanning list always gives unique coordinates | Uniqueness requires independence as well. |
| Reduced pivot columns span the original column space | Use the original columns at the pivot indices. |
| Full column rank makes every target solvable | It gives unique compatible inputs; full row rank gives all targets. |
| Same training predictions imply the same function | x and x² coincide at zero and one, not at two. |
| A thresholded rank proves exact dependence | State exact versus effective rank and its tolerance. |

## Three CPU labs {#labs}

Use Python 3.11 and the NumPy environment from [array preparation](numpy_primer_EN.html). The first lab uses standard-library Fractions. The displayed output is captured from the downloadable scripts at build time. Keep every shape, null witness and declared tolerance in your lab notes.

### Lab A Exact spaces and certificates {#lab1}

Predict the pivot indices and all four space dimensions before running. Trace how each free variable generates one null basis vector. Check every basis vector by multiplication. Compare the original and reduced pivot columns. Explain why the left-null certificate rejects the second target but accepts the first in this particular example.

{{LAB:lab1}}

**Deliverable:** a table of the four spaces, ambient dimensions, bases and dimensions, plus a proof that these bases span all the claimed spaces. The successful multiplications alone prove membership; the pivot/free-variable argument proves completeness.

### Lab B Identical predictions different weights {#lab2}

Compute both weight vectors by hand. Check the unseen temperature within the valid feature domain, then compare the polynomial feature coincidence. Identify the null direction in the one-hot design and explain two different ways to remove that redundancy.

{{LAB:lab2}}

**Deliverable:** classify each equivalence as structural on a stated domain or limited to the observed rows. Give an unseen record that breaks the training-only claim, and avoid inferring causality from an identified coefficient.

### Lab C Exact versus numerical rank {#lab3}

Use the exact determinant as a mathematical certificate, and the numerical library output as a policy-dependent measurement. Compare two absolute thresholds and one relative threshold under global scaling. Singular values are used as library diagnostics here; Module 14 will derive their decomposition and geometry.

{{LAB:lab3}}

**Deliverable:** report exact rank, dtype, scales, tolerances and numerical ranks. Explain what resolution assumption could justify dropping the weak direction. Do not turn a chosen threshold into an assertion that the exact integer/rational model has changed.

## Exercises with complete solutions {#exercises}

Exercises 1–12 are required. Exercises 13–14 add 35 optional minutes. Include the relevant space and field when writing a closure or independence claim.

::: exercise #e1 level=1 kind=calculation minutes=6
Determine whether {(x,y):y=2x}, {(x,y):y=2x+1}, and {(x,y):x≥0} are real subspaces.
:::
::: solution
The first contains zero and any combination of (u,2u),(v,2v) has form (au+bv,2(au+bv)), so it is a subspace. The second omits zero. The third contains (1,0) but not its negative (−1,0), so fails scalar closure. One failed condition suffices for each rejection.
:::

::: exercise #e2 level=1 kind=calculation minutes=6
Find a basis for the span of (1,0,1),(0,1,1),(1,1,2), and express the third vector in it.
:::
::: solution
The first two are independent: first and second coordinates of a zero combination force both coefficients zero. Their sum is the third, so they span all three and form a basis. The third has coordinates (1,1). The span is the plane z=x+y and has dimension two.
:::

::: exercise #e3 level=1 kind=calculation minutes=6
Express (4,2) in the basis (1,1),(1,−1), and recover the standard coordinates.
:::
::: solution
c₁+c₂=4 and c₁−c₂=2 give c₁=3,c₂=1. Multiplying [[1,1],[1,−1]] by (3,1) gives (4,2). The tuple (3,1) refers to the stated basis, not the coordinate unit basis.
:::

::: exercise #e4 level=1 kind=calculation minutes=6
For a 4×6 matrix of rank three, state the dimensions and ambient spaces of its four fundamental spaces.
:::
::: solution
Column space has dimension three inside R⁴; row space dimension three inside R⁶. Nullity is 6−3=3 in R⁶, and left nullity is 4−3=1 in R⁴. Every output target is not attainable because the column space is proper; every compatible target has a three-dimensional affine input family.
:::

::: exercise #e5 level=2 kind=proof minutes=15
Prove that polynomials of degree at most three satisfying p(1)=p(−1)=0 form a subspace. Give a basis.
:::
::: solution
Zero belongs and evaluation of ap+bq at either specified point is a·0+b·0, establishing closure. A polynomial vanishing at both points has factor (t−1)(t+1)=t²−1, so with the degree bound it is (t²−1)(at+b). Thus t²−1 and t³−t span. Their leading degrees differ, so a zero combination forces the cubic coefficient and then quadratic coefficient zero. They are an independent basis. Factorisation follows by dividing by t−1 then evaluating the quotient at −1; the nonzero factor −2 forces that quotient to vanish there.
:::

::: exercise #e6 level=2 kind=proof minutes=15
Prove that an independent list gives at most one coefficient description of any vector in its span, and show why spanning is separately necessary for a basis.
:::
::: solution
If Σaᵢvᵢ=Σbᵢvᵢ, subtraction gives Σ(aᵢ−bᵢ)vᵢ=0. Independence forces aᵢ=bᵢ for every i. Existence follows for vectors in the span by definition, but not for arbitrary ambient vectors. For example (1,0) is independent in R² yet cannot express (0,1). A basis needs spanning to guarantee existence for every vector and independence to guarantee uniqueness.
:::

::: exercise #e7 level=2 kind=proof minutes=15
Derive rank–nullity by extending a kernel basis to an input basis. Include separate spanning and independence arguments for the image list.
:::
::: solution
Let k₁,…,k_q span the kernel independently and extend them with u₁,…,u_{n−q} to a basis of the n-dimensional domain. Applying A to any basis expansion removes the kernel terms, proving the Auᵢ span the image. If ΣcᵢAuᵢ=0, then Σcᵢuᵢ is in the kernel, so equals Σdⱼkⱼ. Independence of the full domain basis forces all cᵢ and dⱼ zero. The image list is therefore a basis of size n−q and rank+nullity=n. Finite basis extension was proved by adding generators outside the current span.
:::

::: exercise #e8 level=2 kind=application minutes=13
For A from Lab A, classify targets (2,3,5) and (2,3,6); give every solution for the compatible target and an inconsistency certificate for the other.
:::
::: solution
The column plane requires b₃=b₁+b₂. For the first target, all solutions are (2−t,3−t,t),t∈R, by the first two equations and the redundant third. For the second, z=(−1,−1,1) satisfies Aᵀz=0 but zᵀb=1, so any putative Ax=b would imply 0=zᵀAx=zᵀb=1. It is inconsistent.
:::

::: exercise #e9 level=2 kind=application minutes=13
A model uses intercept, Celsius and Fahrenheit columns. Find all equivalent weights to (5,2,−1) on valid temperature records. State which two combined coefficients the model uses.
:::
::: solution
The predictions are −27+0.2C. All weights (5−32t,2−1.8t,−1+t) give the same combined intercept w₀+32w_F=−27 and slope w_C+1.8w_F=0.2. On a domain containing at least two distinct Celsius values, equal predictions force equality of these two combinations, and solving the differences yields exactly this one-parameter family. The relation assumes Fahrenheit is generated by 1.8C+32.
:::

::: exercise #e10 level=2 kind=application minutes=13
A design has an intercept and three exhaustive one-hot categories, all observed. Explain its nullity and two full-rank parameterisations.
:::
::: solution
Its columns satisfy −intercept+indicator₁+indicator₂+indicator₃=0, and the three indicator columns are independent when each category occurs. Rank is three, so nullity is 4−3=1. Keeping all indicators and removing the intercept yields three category predictions. Keeping the intercept and two indicators yields a baseline-category intercept plus two category differences. Both represent every vector of three category predictions, with different coefficient meanings.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=16
A report takes reduced pivot columns as the original image basis and concludes full column rank makes every target compatible. Diagnose both claims with rectangular or explicit examples.
:::
::: solution
For Lab A, reduced pivot columns lie in z=0 while the original column space is z=x+y; use the original columns at the pivot indices. Full column rank gives kernel zero and unique compatible inputs, but does not fill a larger output space. A=[[1],[0]] has full column rank one and cannot reach (0,1). Every target is compatible only with full row rank.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=16
A numerical rank test returns one for [[1,1],[1,1+10⁻¹²]] at tolerance 10⁻¹⁰. The author declares exact dependence and identical future predictions for features x and x² observed only at zero and one. Repair both statements.
:::
::: solution
The exact determinant 10⁻¹² is nonzero, so exact rank is two. The numerical result concerns the chosen resolution, dtype and scaling; state those rather than claiming an exact null relation. The polynomial design has a training null direction (0,−1,1), but at x=2 it changes the prediction by two. Training equivalence extends only where the same feature identity holds; here that domain is not all real x.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Prove that two different bases of a finite-dimensional space have the same size using the exchange argument, without assuming dimension is already well defined.
:::
::: solution
Given an independent list u₁,…,u_k and a spanning list b₁,…,b_d, successively express u_j in a spanning list containing the earlier u's. Independence forces a nonzero coefficient on at least one remaining b; solve for it and replace it by u_j. The list still spans and has d places, so k≤d. For two bases, regard each in turn as the independent list and the other as spanning. Both inequalities hold, so their sizes agree. The exchange step is the reason counting basis vectors defines a consistent dimension.
:::

::: exercise #e14 level=3 kind=extension minutes=20
Prove C(A)=N(Aᵀ)⊥ using contradiction rows, and use it to explain why testing a complete left-null basis suffices for consistency.
:::
::: solution
If b=Ax and Aᵀz=0, then zᵀb=0, proving inclusion. If b is not in C(A), elimination of [A|b] by an invertible row-operation matrix E creates a zero coefficient row with nonzero constant. The corresponding row zᵀ of E has zᵀA=0,zᵀb≠0, so b is not perpendicular to the left null space. This proves reverse inclusion by contraposition. If b is perpendicular to each vector of a complete left-null basis, linearity makes it perpendicular to every vector of that space; the established equality then gives consistency.
:::

## Ten-question self-check {#quiz}

```quiz
? Which subset is a real vector subspace with inherited operations?
- [x] Solutions of x+y−z=0
- [ ] Solutions of x+y−z=1
- [ ] Vectors of Euclidean length one
> The homogeneous constraint contains zero and preserves every linear combination. The offset plane and unit sphere omit zero.

? What establishes linear dependence of matrix columns?
- [ ] Pairwise unequal columns
- [x] A nonzero coefficient vector c with Ac=0
- [ ] One vector c with Ac≠0
> A nontrivial zero combination is the defining witness. Unequal columns can be dependent, and a failed relation does not exclude other relations.

? What makes basis coordinates unique and available for every vector?
- [ ] Spanning alone
- [ ] Independence alone
- [x] Spanning and independence together
> Spanning gives existence; independence makes the difference of two descriptions force equal coefficients.

? After row reduction, which columns form a basis of the original column space?
- [x] Original columns at the pivot indices
- [ ] Reduced pivot columns, with no transformation back
- [ ] Every original column, including redundant ones
> Row operations transform column vectors while preserving their relations. Select the original vectors at the identified independent indices.

? An m×n matrix has rank r. What is its left nullity?
- [ ] n−r
- [x] m−r
- [ ] m+n−r
> The left null space is the kernel of Aᵀ with domain Rᵐ. The ordinary nullity uses the input dimension n.

? Full column rank guarantees what?
- [ ] Every output target is attainable
- [ ] The matrix must be square
- [x] Every compatible target has a unique input
> It makes the input kernel zero. A tall full-column-rank map need not reach every point in its output ambient space.

? What proves b is incompatible with Ax=b?
- [x] A left-null z with zᵀb≠0
- [ ] A nonzero input null vector
- [ ] A solver choosing one representative
> Left multiplication would give 0=zᵀAx=zᵀb, a contradiction. Input nullity concerns uniqueness after compatibility is established.

? Xw=Xw′ on the training rows implies what?
- [ ] They predict equally on every possible future record
- [x] w′−w lies in the training design's null space
- [ ] w and w′ must be identical
> This is the exact training equivalence relation. Future equality requires the new rows to annihilate the same difference too.

? A tolerance-based rank result differs from the exact rational rank. Which report is appropriate?
- [ ] Declare the exact determinant zero
- [ ] Hide the tolerance and feature units
- [x] State both claims with their arithmetic model, scale and resolution policy
> Numerical rank can deliberately treat a weak direction as unresolved. It does not erase a nonzero exact determinant.
```

<div class="free-response" data-free-response data-key="math-series:m11:q10">
<label for="q10-response">10. Explain why the same training predictions can leave parameters nonunique. Give one structural null direction, one training-only example, and the assumption needed for future equivalence.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State X(w′−w)=0, exhibit both examples, and delimit their domains."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I gave null witnesses and checked the claim on an unseen record.</label>
</div>

::: answer
Equal training predictions are equivalent to w′−w∈N(X), so a null family w+N(X) leaves the observations unchanged. Temperature features (1,C,1.8C+32) annihilate (−32,−1.8,1) throughout the valid conversion domain. Features (1,x,x²) at x=0,1 annihilate (0,−1,1), but x=2 does not. Future equivalence requires each new feature row to have zero dot product with the chosen weight difference. A selected representative is an additional convention, not identification by the original observations.
:::

## Reading with a purpose {#reading}

Use the linear-algebra chapter's vector spaces, bases and linear-map selections in the authors' [Mathematics for Machine Learning companion](https://mml-book.com/). Read the official [NumPy 1.26 matrix-rank interface](https://numpy.org/doc/1.26/reference/generated/numpy.linalg.matrix_rank.html) for the numerical contract. The original proofs and examples above stand independently of these supplementary readings.

| When | Selection and question |
|---|---|
| Session 1 · 21 minutes | Spaces and bases: where do existence and uniqueness enter a coordinate description? |
| Session 4 · 20 minutes | Rank interface: how does the default threshold scale, and what changes with an absolute tolerance? |

## Retrieval exit task and next step {#summary}

Without notes, prove the subspace test, distinguish a generating list from a basis, and explain why dimensions are well defined. Draw the four spaces on the correct input/output sides and derive both nullity counts. Give a null-space prediction witness and delimit its future-record claim.

**Exit task:** A=[[1,2,3],[0,1,1]] has rank two. Its kernel is span{(−1,−1,1)}, since x₂=−x₃ and x₁=−x₃. Every b=(b₁,b₂) is attainable, with solutions (b₁−2b₂−t,b₂−t,t). The left null space is zero; the column space is R². Explain why reachability of every target does not make the parameters unique.

**Ready to move on:** you can give complete bases, dimensions, solution families and interpretation boundaries. Module 12 develops orthogonal projections and least squares, including how a unique fitted prediction can coexist with many minimising weights. Check the [course overview](index.html) for availability.

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| Vector space / subspace | Closed linear operations / inherited smaller space | 向量空间、子空间 |
| Span / independence | All combinations / only trivial zero combination | 张成、线性无关 |
| Basis / dimension | Independent spanning list / its invariant size | 基、维数 |
| [v]_B | Coordinates in a specified ordered basis | 基坐标 |
| C(A) / R(A) | Column image / row span | 列空间、行空间 |
| N(A) / N(Aᵀ) | Input kernel / output-side kernel | 零空间、左零空间 |
| Rank / nullity | Image dimension / kernel dimension | 秩、零化度 |
| Identifiability | Distinct parameters yield distinct specified predictions | 可辨识性 |
| Numerical rank / tolerance | Resolved direction count / resolution threshold | 数值秩、容差 |
