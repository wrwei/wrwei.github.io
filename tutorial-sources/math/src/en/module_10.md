## A matrix product expresses a particular composition {#start}

Scaling horizontally and then shearing an image can give a different result from shearing first and then scaling. The same issue appears in an AI layer: a table of feature rows, a weight matrix, and a bias must meet a specific shape contract. Writing a multiplication sign without stating which map acts first or which axis holds features is insufficient to define the calculation.

This module connects matrix entries to maps, equations, and executable operations. You will derive products from composition, preserve solution sets during elimination, classify three kinds of system, and separate invertibility from numerical reliability. The final section reconciles column-vector mathematics with batched row-oriented code.

**Retrieval check:** compute a dot product and a linear combination, distinguish a point from a displacement, and predict a broadcast shape. Review [Module 09](module_09_EN.html#s2) and its [NumPy preparation](numpy_primer_EN.html). Optional algorithm-cost comparisons use [Module 06](module_06_EN.html#s4); they are not required for the algebraic core. Matrices here have finite real entries and positive row and column counts.

## Matrices as maps and data tables {#s1}

An m×n **matrix** A is a rectangular array of entries aᵢⱼ, indexed by row i and column j. Its shape records the order: m output coordinates, n input coordinates when used as a column-vector map. A matrix can also store a table of m observations and n features. The same rectangular layout supports both roles, but an application must identify which interpretation is intended. Rows of a data table are not automatically output coordinates of a particular physical transformation.

For a column vector x∈Rⁿ, define y=Ax∈Rᵐ by $y_i=\sum_{j=1}^n a_{ij}x_j$. Every output entry is the dot product of a row of A with x. Matching n input entries to n row entries is necessary; m may differ from n. A two-by-three matrix maps three coordinates to two, while a three-by-two matrix has the opposite input/output sizes. Neither is interchangeable with the other merely because both store six numbers.

Alternatively Ax is a linear combination of A's columns: $Ax=\sum_jx_jA_{:j}$. In particular Aeⱼ is column j, because the coordinate unit vector selects that column. Thus choosing the images of all coordinate unit vectors determines the map on every coordinate vector. This gives a geometric meaning to the stored columns without requiring a separate example for every possible input.

::: worked title="Columns determine a two-coordinate map"
Let A have rows (2,1) and (0,1). Its first column is (2,0), its second (1,1). Therefore A(3,4)=3(2,0)+4(1,1)=(10,4). Row dot products give the same result: 2·3+1·4=10 and 0·3+1·4=4. The coordinate directions are stretched and tilted, while each arbitrary input follows by linear combination.
:::

::: figure #fig-10-1
The two columns are the images of the two coordinate unit vectors. Their scaled sum gives the image of an arbitrary input.
:::

A map L is **linear** when L(u+v)=L(u)+L(v) and L(αu)=αL(u) for all inputs and real α. Matrix maps satisfy these laws by distributing each finite row sum. A linear map necessarily sends zero to zero: L(0)=L(0)+L(0) implies L(0)=0. Checking only a few vectors does not prove linearity, but a formula constructed as Ax has a general coordinate proof.

Conversely, any linear map from Rⁿ to Rᵐ has a matrix in these coordinate conventions. Write x=∑xⱼeⱼ and use linearity to obtain L(x)=∑xⱼL(eⱼ); choose those images as columns. Coordinate choice matters: a different basis can give a different array for the same abstract map, a topic developed in Module 11. The matrix's relationship to its coordinates should remain explicit.

An **affine map** x↦Ax+b adds a fixed output offset. It preserves line and affine-combination structure but is linear only when b=0. For example x↦2x+1 on the real line fails the zero-to-zero requirement. In an AI layer the bias supplies this offset; calling every layer linear is common shorthand, but the mathematical distinction affects proofs about addition, origins, and fixed points.

Matrix addition and scalar multiplication are entrywise and require equal shapes. A+B represents the sum of two compatible linear maps with the same domain and codomain; αA represents output scaling. Addition of a two-by-three matrix and a three-by-two matrix is not defined by this rule. Array broadcasting can define a different numerical operation, so distinguish matrix algebra's shape rules from every operation allowed by a general array library.

::: check
What is the input dimension of a 2×3 map? Why is column j equal to Aeⱼ? Does Ax+b send zero to zero when b≠0?
:::
::: answer
It accepts three-coordinate columns and produces two-coordinate columns. The unit vector has only entry j nonzero, so the column combination selects A's jth column. The affine map sends zero to b, so a nonzero offset prevents linearity.
:::

## Products transpose and noncommutative composition {#s2}

Let B be n×p and A be m×n. Acting on x∈Rᵖ, first B produces n coordinates and then A produces m. Their composition is represented by the m×p matrix AB with $(AB)_{ik}=\sum_{j=1}^n a_{ij}b_{jk}$. The matching inner dimension n is the number of intermediate coordinates. The outer dimensions m,p determine the output matrix shape. On column vectors, the rightmost map acts first.

Derive the formula rather than memorising a diagram. The ith coordinate of A(Bx) is ∑ⱼaᵢⱼ∑ₖbⱼₖxₖ. Reordering finite sums gives ∑ₖ(∑ⱼaᵢⱼbⱼₖ)xₖ, exactly (AB)x. This also explains why matrix multiplication differs from entrywise multiplication: intermediate coordinates are summed to form one composite coefficient. An entrywise product is useful in other tasks, but it does not implement this composition.

::: worked title="A shear and scale disagree when reversed"
Let S=diag(2,1) and H have rows (1,1),(0,1). SH has rows (2,2),(0,1); HS has rows (2,1),(0,1). At x=(1,1), SHx=(4,1) and HSx=(3,1). The shear adds the vertical coordinate into the horizontal one, and horizontal scaling affects that added quantity differently depending on order. Thus AB=BA is not a general matrix law, even for two square matrices with compatible shapes.
:::

::: figure #fig-10-2
The same starting point follows two composition paths. Both operations are linear, but their order changes the final horizontal coordinate.
:::

Compatible matrix multiplication is **associative**: (AB)C=A(BC). Expanding either entry gives the same finite double sum ∑ⱼ∑ₖaᵢⱼbⱼₖcₖℓ. This allows grouping a fixed ordered composition in different ways. It does not allow swapping the order. Grouping can change intermediate array sizes and numerical rounding or work, even though the real-number algebraic result is the same.

The **identity matrix** Iₙ has diagonal ones and all other entries zero. It maps each n-coordinate input to itself. For A of shape m×n, IₘA=A and AIₙ=A, using differently sized identities on the two sides. A **diagonal matrix** scales each coordinate separately. Zero diagonal entries collapse directions, whereas negative diagonal entries reverse them. Neither identity nor diagonal terminology implies a general matrix is invertible.

The **transpose** Aᵀ interchanges rows and columns, with (Aᵀ)ⱼᵢ=aᵢⱼ. Its shape is n×m. The product law is (AB)ᵀ=BᵀAᵀ: entry (k,i) on the left is ∑ⱼaᵢⱼbⱼₖ, while the right gives ∑ⱼbⱼₖaᵢⱼ, equal by scalar commutativity. The reversed order also makes the dimensions fit. Transposing each factor without reversing them may be undefined or represent a different map.

A symmetric square matrix satisfies A=Aᵀ. This describes entry symmetry, not automatically positivity, invertibility, or a particular data interpretation. The identity is symmetric and invertible; the all-zero square matrix is symmetric and singular. Later modules use symmetry for inner products, spectral geometry, and covariance. Here it is one checkable matrix property, with its own definition and scope.

**Block matrices** partition rows and columns into groups. Block products follow the same sum-of-compatible-products rule, provided intermediate partitions align. For instance [A B] times a vertically stacked vector [u;v] equals Au+Bv when u and v match the respective column groups. A block is still a rectangular map with dimensions; treating every block as a scalar can conceal an invalid product. The notation helps organise a larger system without changing the underlying entry formula.

::: check
Predict the product shape for a 4×2 matrix times a 2×3 matrix. Which map acts first on a column? Can associativity justify reversing the factors?
:::
::: answer
The result is 4×3 and the rightmost 2×3 map acts first on a three-coordinate input. Associativity changes parentheses, preserving order; it does not justify reversing factors. Their reverse product would also fail the inner-dimension check here.
:::

## Linear systems and solution-preserving row operations {#s3}

A **linear system** Ax=b specifies m equations in n unknown coordinates. Row i states ∑ⱼaᵢⱼxⱼ=bᵢ. The right-hand side b has one entry per equation. The **augmented matrix** [A|b] stores both coefficients and constants; the separator distinguishes unknown coefficients from the fixed target. Changing only A while leaving b untouched can change the solution set, even when the coefficient operation looks algebraically familiar.

There are three elementary row operations: swap two equations; multiply an equation by a nonzero scalar; add a scalar multiple of another equation to one equation. Apply each to the entire augmented row, including the right-hand side. Each operation has an inverse of the same type, so it preserves the solution set in both directions. Multiplication by zero is excluded because it can erase a constraint and cannot be reversed.

::: worked title="Elimination solves a two-equation system"
Solve x+y=3 and 2x−y=0. Subtract twice the first equation from the second to obtain −3y=−6, hence y=2. Substitute into x+y=3 to get x=1. The augmented rows start [1,1|3],[2,−1|0]; the replacement second row is [0,−3|−6]. Replacing only its coefficient entries would incorrectly leave constant zero and produce a different system.
:::

To prove the row-addition operation, suppose an assignment satisfies both original rows. It also satisfies their indicated linear combination, so it satisfies the new row. Conversely, the unchanged source row and the new row recover the old target by subtracting the same multiple. This reverse implication is what establishes equality of solution sets. A one-way statement that all old solutions remain would not rule out extra new solutions.

A **pivot** is a selected nonzero coefficient used to eliminate a variable from other rows. If a candidate diagonal entry is zero but a lower row has a nonzero entry in that column, swap rows. If every remaining entry in that column is zero, skip it and continue to later columns rather than divide by zero. Pivot columns identify constrained coordinates; a skipped column can correspond to a free variable once consistency is established.

For exact arithmetic any nonzero suitable pivot permits a legal algebraic step. For floating-point work, choosing the largest available absolute entry in the column is **partial pivoting**, which avoids dividing by a needlessly small available pivot. This practical rule does not make every system well conditioned or prove every numerical error is small. The lab uses exact rational Fractions for its trace, separating algebraic row equivalence from floating rounding.

Row operations change equations, not the coordinate identities of the unknowns. Swapping rows reorders constraints; swapping columns reorders variables and requires corresponding changes to the interpretation of x. A solver may use column permutations deliberately, but a learner must record them. Confusing a row interchange with an unknown-variable interchange can produce a numerically plausible answer assigned to the wrong feature or quantity.

The elimination invariant is that the current augmented system has exactly the original solution set. At each step the row-operation proof preserves that fact, while the pattern of zeros makes subsequent solution easier. Termination comes from advancing the pivot row or column through finite bounds. As with earlier algorithm proofs, the invariant alone does not establish that progress occurs; the finite traversal of candidate positions supplies that argument.

::: check
Why must a row operation include the right-hand side? Why exclude zero row scaling, and what should happen when a pivot column has no remaining nonzero entry?
:::
::: answer
The row represents a complete equation, so both sides must undergo the same operation. Zero scaling erases information and has no inverse. An all-zero candidate column is skipped; later pivots and a consistency check determine whether that variable is free.
:::

## Echelon forms consistency free variables and back substitution {#s4}

An augmented system is in **row-echelon form** when nonzero coefficient rows appear before zero coefficient rows and each successive pivot lies strictly to the right of the preceding pivot. Entries below pivots are zero. A contradiction row may have all zero coefficients and a nonzero right-hand side; it should be recognised explicitly rather than counted as an ordinary unknown-variable pivot. We separate coefficient pivots from the augmented constants.

**Gaussian elimination** produces such a form by choosing a pivot, optionally normalising its row, eliminating entries below it, and continuing with the remaining rows and columns. Normalising a pivot is not required for echelon form, but the lab does so to simplify its back substitution. Eliminating above pivots as well would produce a reduced row-echelon form; that is a further transformation, not necessary merely to solve a unique triangular system.

::: worked title="A zero first entry need not make the system singular"
Use coefficient rows [0,2,1],[1,−2,−3],[2,3,1] and target [3,0,7]. Swap the first and third rows to use pivot two. The lab's normalised exact echelon rows become [1,3/2,1/2|7/2],[0,1,1|1],[0,0,1|−1]. Back substitution gives z=−1, y=2, x=1. Check all original equations, especially the first zero-leading row; the solved vector satisfies them.
:::

**Back substitution** starts at the last pivot row. After free-variable values are chosen, each pivot equation solves its pivot variable from already known later variables, dividing by the nonzero pivot when the row is not normalised. Proceed upward until all pivot variables are assigned. The structure ensures later unknowns are known at the required moment. Solving top-down without that structure could require a value not yet determined.

Three cases describe exact real solution sets. If a row reads 0=c with c≠0, the system is **inconsistent** and has no solution. If no contradiction exists and every unknown column has a pivot, there is a **unique** solution. If no contradiction exists and at least one unknown is free, the system is **underdetermined** and has infinitely many real solutions, because each real choice of a free coordinate can be extended by back substitution.

For rows [1,1|3],[2,2|7], eliminating gives a contradictory zero-coefficient row with constant one, so no solution exists. Changing the second constant to six instead gives a redundant equation and x+y=3, whose solutions are (3−t,t) for real t. The coefficient matrix is identical in both cases. Singularity is a matrix property, whereas consistency also depends on b; reporting only “singular” does not classify the system's solution set.

::: figure #fig-10-3
The same duplicate coefficient rows can describe coincident constraints or contradictory parallel constraints depending on the constants. A different independent pair intersects once.
:::

Counting equations alone is inadequate. A square system can be inconsistent or have infinitely many solutions if its equations are dependent. A tall system can have a unique solution when every unknown has a pivot and all extra equations are compatible. A wide system cannot constrain every unknown with coefficient pivots, but it can still be inconsistent. Always inspect the actual transformed equations and their constants instead of using shape as a complete classification.

The classification also gives a completeness argument for the parametrisation. Every assignment satisfying the echelon equations has some free-coordinate values; upward pivot equations then force exactly the reported dependent coordinates. Conversely, any allowed free-coordinate choice satisfies all pivot equations after back substitution and all remaining zero rows when no contradiction exists. Row equivalence transfers both directions to the original system, so the displayed family neither misses nor adds solutions.

Exact zero and near-zero are different in numerical computation. The rational lab can decide a coefficient is exactly zero; floating calculations need a tolerance and scale-aware interpretation. A tiny residual or a tiny computed determinant is not, by itself, an exact symbolic classification. Module 11 introduces numerical rank and Module 28 treats floating-point reliability. Here the exact small examples establish the algebraic categories before those numerical questions are added.

::: check
How do [0,0|0] and [0,0|1] differ? Does a free column imply infinitely many solutions before checking contradictions?
:::
::: answer
The first row imposes no additional constraint; the second is impossible. A free column gives an infinite solution family only after consistency is established. A contradiction means no solution regardless of free-column count.
:::

## Invertibility determinants and the limits of residuals {#s5}

A square n×n matrix A is **invertible** when there is an n×n matrix A⁻¹ satisfying both A⁻¹A=Iₙ and AA⁻¹=Iₙ. The inverse undoes the map and gives x=A⁻¹b for each target b. If B and C are both inverses, B=B(AC)=(BA)C=C, so the inverse is unique. Square shape is a necessary part of this definition; rectangular maps can have one-sided inverses under other conditions, but those are different claims.

For a square matrix, elimination has a pivot in every column exactly when it is invertible. Full pivots make every target system consistent and uniquely solvable. Solving Aeⱼ for each coordinate unit target builds the inverse's columns. Conversely, an invertible map cannot have a nonzero vector z with Az=0, because applying A⁻¹ would force z=0. A missing coefficient pivot gives a nonzero homogeneous solution by choosing a free variable, so it contradicts invertibility. This connects the map, equation, and pivot interpretations.

For the constructed matrix B, the column equations give AB=I. Also BAx and x both solve Ay=Ax; uniqueness for that target gives BAx=x for every x, hence BA=I. This verifies both inverse obligations rather than quietly treating a one-sided identity as the full definition.

For a two-by-two matrix with rows (a,b),(c,d), the **determinant** is ad−bc. Its columns form the two edges of an image parallelogram, and this expression is its signed area relative to the unit square. Absolute determinant measures area scaling; a negative sign indicates reversed orientation. Zero means the parallelogram collapses to a line or point. The determinant is not an individual output length or the number of stored entries.

::: worked title="Check the inverse rather than only dividing by a determinant"
For A with rows (3,1),(1,2), detA=5. The candidate inverse has rows (2/5,−1/5),(−1/5,3/5). Multiplying it by A in both orders yields the identity. Applying it to b=(9,8) gives x=(2,3), and the original equations give 3·2+3=9 and 2+2·3=8. The formula requires the nonzero determinant; for rows (1,2),(2,4), the determinant is zero and division by it is invalid.
:::

For general two-by-two A, direct multiplication verifies the inverse formula $(ad-bc)^{-1}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}$ when the determinant is nonzero. If ad−bc=0, the columns are dependent and the map collapses a nonzero direction, so it has no two-sided inverse. This small proof supports the area interpretation and inverse criterion without relying on a successful numerical library call.

In higher dimensions the determinant generalises signed volume scaling, and a square real matrix is invertible exactly when its determinant is nonzero. We use this general theorem with its scope stated; a full construction of the determinant from alternating multilinear volume is a follow-on topic. Under elimination, row swaps change its sign, nonzero row scaling multiplies it by that scale, and row addition preserves it. A triangular matrix's determinant is the product of its diagonal entries, tying the criterion to its pivots.

Algebraically x=A⁻¹b is correct when an inverse exists. Numerically, use a direct system solver for the requested right-hand side rather than explicitly constructing all inverse entries. A solver can use a factorisation and substitution without forming a complete inverse, and reusable factorisations help with several targets. The lab's well-behaved example makes both approaches agree; that does not prove inverse code always fails or that every direct solve is insensitive to data error.

Cramer's rule expresses each unknown as a ratio of determinants, replacing one coefficient column with b in the numerator. It is an exact formula for nonsingular square systems, but evaluating many determinants separately repeats work and does not cure sensitivity in a ratio. It is useful for a small symbolic derivation, while a direct factorisation-based solve is the numerical workflow used here. An algebraically valid expression need not be the preferred computational procedure.

A **residual** is r=A x̂−b for a proposed solution x̂. A zero residual establishes that the proposed vector solves the stored equations in exact arithmetic. A small numerical residual measures near-satisfaction of those equations; it does not establish that the original data were accurate or that the inferred vector is close to a solution for slightly different data. Its scale and the system's sensitivity matter.

For A=diag(1,10⁻¹²), the target b=(1,10⁻¹²) gives x=(1,1). Changing only the second target by 10⁻⁹ gives x′=(1,1001). The matrix remains invertible and x′ has zero residual for the changed target, yet the solution changed substantially. This is inherent sensitivity of the equations, not automatically a solver bug. Spectral and condition-number analysis later quantify it; this example already refutes the claim that invertibility or residual alone guarantees reliable coefficients.

::: widget name=matrices
Change a two-coordinate map and inspect the transformed grid, column images, determinant, and a sample point. Compare singular collapse and the two shear/scale composition orders. The worked calculations above give a static alternative.
:::

::: check
Does detA≠0 imply every numerical answer is reliable? What does a small residual measure, and what must an inverse satisfy?
:::
::: answer
A nonzero determinant establishes algebraic invertibility, not insensitivity or numerical accuracy. A residual measures satisfaction of the stored equations. An inverse must undo A on both sides, producing the identity, with compatible square dimensions.
:::

## Batched affine maps and shape-safe implementation {#s6}

For an input column x with d coordinates and output column y with o coordinates, write y=Mx+b with M of shape o×d and b of shape o×1. Every row of M selects one output's weighted feature sum. For a batch of B input records stored as rows, use X of shape B×d and W=Mᵀ of shape d×o. Then Y=XW+bᵀ has shape B×o, with the same affine transformation applied to each row.

The transpose relationship reconciles conventions; it does not make multiplication commutative. Row-oriented XW and column-oriented Mx use the same coefficients under explicitly different storage orientations. A library's weight layout may choose either convention. Read its definition and annotate the axes before copying a formula. The numbers B,d,o stand for observation, feature, and output counts, not interchangeable generic sizes.

::: worked title="Compute a complete batched affine layer"
Let X have rows (1,0),(0,1),(2,−1), W have rows (1,2),(−1,3), and output bias (0.5,−0.5). XW has rows (1,2),(−1,3),(3,1). Adding the bias to each row gives (1.5,1.5),(−0.5,2.5),(3.5,0.5). The input shape is (3,2), weights (2,2), bias (2,), and output (3,2). The two output values are separate coordinates, not a summed scalar.
:::

::: figure #fig-10-4
The shared feature dimension is contracted by the matrix product. Batch rows remain separate, and each output bias is broadcast along the batch axis.
:::

In NumPy, `X @ W` is this matrix product and `X * W` is entrywise multiplication or broadcasting. When shapes happen to match, the wrong operator can run and give plausible numbers. Likewise a flat bias `(o,)` broadcasts over B rows, while a column bias `(o,1)` can fail or add different row offsets when B=o. Equality of two axis lengths can conceal a semantic mistake, so shape compatibility alone is not sufficient.

For the first two rows of the worked example, a wrong bias column adds 0.5 to both outputs of the first row and −0.5 to both outputs of the second. It gives rows (1.5,2.5),(−1.5,2.5), different from the intended output-specific bias. Both results have shape (2,2). Label the output and batch axes, and check values on a deliberately nonuniform small example as well as asserting the shape.

The elementary product algorithm uses mnp scalar multiplications for an m×n matrix times an n×p matrix. Summing each output's n products requires n−1 additions when the first product initializes the sum, giving mp(n−1) additions; an implementation starting from zero can count n additions instead. State the charged operations before comparing counts. These formulas come directly from the finite index domains, and optional asymptotic interpretation is available in Module 06.

Affine bias addition contributes one further addition per output entry. A different parenthesisation of a longer product can change intermediate dimensions and work even though associativity preserves the exact map. Numerical libraries exploit structure and hardware, so the simple scalar-operation count is a transparent educational model, not a direct prediction of seconds on a particular machine. Keep algebraic validity, operation counts, and measured time distinct.

An implementation contract should record input/output shapes, axis meanings, numeric representation, and the intended exceptional cases. `np.linalg.solve(A,b)` in our tested environment expects a square nonsingular coefficient matrix for a unique exact-system solve. It does not return the family of an underdetermined system or classify a contradictory singular system. Least-squares approximation and minimum-norm solutions require their own definitions, which arrive in Module 12.

Verification has several layers. Check dimensions before multiplication, validate a small hand example, and verify residuals or inverse identities as appropriate. A known exact solution can reveal a transposed convention or misplaced bias. Numerical tolerance is chosen for the data and computation; it does not transform finite checks into a general proof. The row-operation and composition proofs explain why the formulas work beyond the particular arrays tested.

::: check
For B=5,d=3,o=2, give X,W,Y and flat-bias shapes. Why can an `(o,1)` bias appear to work when B=o, and why is solve not a classifier of every system?
:::
::: answer
Shapes are (5,3),(3,2),(5,2), with bias (2,). When B=o, the column can broadcast along rows and add the wrong offsets while retaining the expected shape. The square nonsingular solver returns a unique solution under its contract; singular consistency and free-variable families need separate analysis.
:::

## Common misconceptions and failure cases {#misconceptions}

| Claim | Why it fails | Repair |
|---|---|---|
| Matrix entries have one automatic interpretation | The same array can be a map or data table | State domains and axis meanings |
| Matrix products commute | Shear and scale give a counterexample | Follow the ordered composition |
| Transpose keeps product order | (AB)ᵀ=BᵀAᵀ | Check the entry formula and dimensions |
| Only coefficients need row updates | The row represents a complete equation | Operate on the entire augmented row |
| A zero first entry means singular | A row swap can supply a pivot | Search the remaining column |
| Every square system has one solution | Dependent rows can contradict or be redundant | Inspect pivots and constants |
| Singularity alone decides consistency | The same A can fit different b categories | Classify the augmented system |
| Nonzero determinant or small residual guarantees reliability | Invertible equations can be very sensitive | Separate algebraic and numerical claims |
| Any bias with two entries is interchangeable | Axis orientation can change the additions | Declare output-specific broadcasting |

## Three CPU labs {#labs}

Use the [NumPy preparation](numpy_primer_EN.html) and its pinned numerical environment. The elimination trace additionally uses standard-library Fractions for exact arithmetic. Downloaded scripts generated the captured outputs, including the actual residuals.

### Lab A Matrix products and an affine batch {#lab1}

**Predict:** SH,HS and their images of (1,1); annotate X,W,bias shapes. **Run:** compare the loop product with NumPy and inspect the affine output. **Explain:** why the rightmost column map acts first and why the final bias is output-specific. **Change:** replace a weight matrix with a rectangular one and update the bias/output contract accordingly. The script rejects ragged matrices and incompatible inner dimensions.

{{LAB:lab1}}

### Lab B Exact pivoted elimination {#lab2}

**Predict:** which row supplies the first pivot and whether each system is unique, inconsistent, or underdetermined. **Run:** inspect the exact augmented rows, pivots and free columns. **Explain:** a zero constant row versus a contradiction and verify the unique solution in the original equations. **Change:** alter the duplicate-row right-hand side and predict the new classification before running. Printed column indices are zero-based; mathematical x,y,z names follow their original order.

{{LAB:lab2}}

### Lab C Solvers singularity and sensitivity {#lab3}

**Predict:** solve [[3,1],[1,2]] at target [9,8], then inspect the two singular targets. **Run:** compare the direct and inverse results; both work for this example. **Explain:** why the singular exception cannot distinguish an infinite family from no solution, and why the diagonal system's perturbed solution still has zero residual. **Change:** increase the small diagonal entry and compare the response to the same target perturbation. The example demonstrates data sensitivity rather than asserting that one library routine is always more accurate.

{{LAB:lab3}}

## Exercises with full solutions {#exercises}

Exercises 1–12 are required; 13–14 are extensions. Use exact arithmetic for the small systems and state the solution set rather than only a solver status.

::: exercise #e1 level=1 kind=calculation minutes=6
For A with rows (2,1),(0,1), find Ae₁,Ae₂,A(3,4) and identify input/output dimensions.
:::
::: solution
Columns give (2,0),(1,1). Their weighted combination 3(2,0)+4(1,1)=(10,4). Both input and output have two coordinates; row dots give the same image.
:::

::: exercise #e2 level=1 kind=calculation minutes=6
Compute SH and HS for S=diag(2,1), H=[[1,1],[0,1]], then apply them to (1,1).
:::
::: solution
SH=[[2,2],[0,1]] gives (4,1); HS=[[2,1],[0,1]] gives (3,1). Rightmost acts first on a column, and the results refute general commutativity.
:::

::: exercise #e3 level=1 kind=calculation minutes=6
Give AB and (AB)ᵀ shapes for A of shape 4×2 and B of shape 2×3. Which transposed product equals (AB)ᵀ?
:::
::: solution
AB is 4×3 and its transpose 3×4. BᵀAᵀ has shapes (3×2)(2×4), so yields that result. AᵀBᵀ has incompatible inner dimensions here.
:::

::: exercise #e4 level=1 kind=conceptual minutes=6
Test whether x↦Ax+b with b≠0 is linear, and explain the matrix interpretation of Aeⱼ.
:::
::: solution
At zero the affine map gives b≠0, violating a necessary linear-map condition. Aeⱼ selects column j, the image of that coordinate direction. The matrix part is linear while the offset makes the full map affine.
:::

::: exercise #e5 level=2 kind=proof minutes=15
Derive A(Bx)=(AB)x from finite sums, including the three shapes.
:::
::: solution
Let B be n×p,A m×n,x a p-coordinate column. Coordinate i expands to ∑ⱼaᵢⱼ∑ₖbⱼₖxₖ=∑ₖ(∑ⱼaᵢⱼbⱼₖ)xₖ. The inner coefficient is (AB)ᵢₖ, and AB is m×p. Reordering finite sums is valid and gives every coordinate equality.
:::

::: exercise #e6 level=2 kind=proof minutes=15
Prove the row replacement Rᵢ←Rᵢ+cRⱼ, i≠j, preserves a system's solution set. Explain the RHS and invertibility conditions for other row operations.
:::
::: solution
An old solution satisfies the indicated linear combination as well as the unchanged source row. Conversely subtract c times that source row from the new target equation to recover the old one. Thus the sets agree in both directions. Constants are part of each equation, so the full augmented row changes. Row swaps invert themselves, and nonzero scaling inverts by its reciprocal; scaling by zero erases a constraint and is invalid for equivalence.
:::

::: exercise #e7 level=2 kind=proof minutes=15
Explain why a consistent echelon system with a free variable has infinitely many real solutions, and why the resulting parametrisation is complete.
:::
::: solution
Choose any real values for free coordinates. Upward back substitution solves each nonzero pivot equation for its pivot coordinate; zero rows add no condition. Different free values give different vectors, hence infinitely many. Every solution has some free values and pivot equations force its remaining coordinates, so it appears in this family. Row equivalence transfers completeness to the original system. A contradiction row would invalidate the initial consistency assumption.
:::

::: exercise #e8 level=2 kind=application minutes=13
Solve x+y=3,2x−y=0. Classify x+y=3,2x+2y=7 and x+y=3,2x+2y=6, giving the actual solution sets.
:::
::: solution
Subtract twice the first row in the first system: −3y=−6, giving (x,y)=(1,2). The second system yields 0=1 and has the empty solution set. The third yields 0=0 and has {(3−t,t):t∈R}. The same duplicate coefficient rows in the last two systems do not decide consistency without their constants.
:::

::: exercise #e9 level=2 kind=application minutes=13
Compute XW+b for X rows (1,0),(0,1),(2,−1), W rows (1,2),(−1,3), b=(0.5,−0.5). State all storage shapes and the corresponding column-map matrix M.
:::
::: solution
XW rows are (1,2),(−1,3),(3,1); bias gives (1.5,1.5),(−0.5,2.5),(3.5,0.5). Shapes X (3,2),W (2,2),b (2,),Y (3,2). The column matrix is M=Wᵀ=[[1,−1],[2,3]], so y=Mx+b_col for each record.
:::

::: exercise #e10 level=2 kind=application minutes=13
For A=diag(1,10⁻¹²), solve at b=(1,10⁻¹²), then at b′=(1,10⁻¹²+10⁻⁹). State what the changed-system residual can and cannot establish.
:::
::: solution
Coordinate division gives x=(1,1) and x′=(1,1001). The target change has length 10⁻⁹ while the second solution changes by one thousand. Residual zero establishes satisfaction of the changed equations; it does not establish closeness to the original solution or insensitivity. The determinant is nonzero throughout.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=16
A routine declares a matrix singular after seeing a zero first diagonal entry and updates only coefficients during elimination. Diagnose both mistakes using the pivoted example and the two-equation example.
:::
::: solution
The pivoted matrix's first entry is zero, but swapping with the row starting in two supplies a pivot and leads to unique (1,2,−1). A candidate zero alone is not a singularity proof. For [1,1|3],[2,−1|0], subtracting twice row one must produce [0,−3|−6]; leaving constant zero changes solutions to y=0,x=3, which fails the original second equation.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=16
For a two-row two-output batch, a developer adds bias `(2,1)` and sees the expected `(2,2)` output. They also say every singular solver exception means no solution. Give counterexamples and repairs.
:::
::: solution
Linear rows (1,2),(−1,3) and flat bias (0.5,−0.5) should yield (1.5,1.5),(−0.5,2.5). A column bias instead yields (1.5,2.5),(−1.5,2.5), adding offsets by batch row. Use output-axis bias and test values as well as shape. Singular rows (1,2),(2,4) with target (3,6) have infinitely many solutions, while (3,7) is inconsistent. Analyse the augmented rows; the unique-system solve exception does not classify the distinction.
:::

::: exercise #e13 level=3 kind=proof minutes=15
Extension: prove (AB)ᵀ=BᵀAᵀ and (AB)⁻¹=B⁻¹A⁻¹ for compatible invertible square matrices. Why must order reverse?
:::
::: solution
Transpose entries give ∑ⱼaᵢⱼbⱼₖ=∑ⱼbⱼₖaᵢⱼ, the (k,i) entry of BᵀAᵀ. For the inverse, (AB)(B⁻¹A⁻¹)=AIA⁻¹=I and (B⁻¹A⁻¹)(AB)=B⁻¹IB=I. Associativity allows cancellation of adjacent inverse factors; preserving order would not generally put the cancelling pairs adjacent. The shear/scale example confirms order matters.
:::

::: exercise #e14 level=3 kind=application minutes=20
Extension: suppose both X and W are 2×2. Give an explicit case where entrywise X*W has the expected output shape but differs from XW, and state a hand-check test that catches it.
:::
::: solution
Take X=[[1,1],[0,1]],W=[[2,0],[0,1]]. The matrix product is [[2,1],[0,1]], while entrywise multiplication is [[2,0],[0,1]], both 2×2. Applying the first row's record (1,1) to the column map predicts (2,1), so the missing second output one reveals the wrong operator. A shape assertion alone cannot detect it; a known nonuniform input checks the intended sums.
:::

## Self-check quiz {#quiz}

Automatic scoring covers Questions 1–9; Question 10 is written and self-reviewed.

```quiz
? What is column j of a column-vector map A?
- [x] The image Aeⱼ
- [ ] The jth input for every calculation
- [ ] The sum of every row
> A coordinate unit vector selects one column. Input values vary, and row sums correspond to a different particular input.

? Which map acts first in ABx?
- [ ] A
- [x] B
- [ ] Either, because all matrix products commute
> B creates the intermediate coordinates consumed by A. Reversing generally changes the map or fails dimensions.

? What is (AB)ᵀ?
- [ ] AᵀBᵀ always
- [ ] AB
- [x] BᵀAᵀ
> Entry sums and shapes require the reversed transposed order. The original product need not be symmetric.

? Which row operation preserves solutions?
- [x] Add a multiple of another entire augmented row
- [ ] Multiply an equation by zero
- [ ] Change coefficients while leaving the RHS untouched
> Row addition has an inverse and includes constants. Zero scaling destroys information; changing one side alters the equation.

? What does a zero candidate pivot mean immediately?
- [ ] The matrix must be singular
- [x] Search remaining rows or skip an all-zero coefficient column
- [ ] Divide by zero to continue
> A row swap can supply a nonzero pivot. The full coefficient structure, not one candidate entry, determines the final classification.

? What does [0,0|1] establish?
- [ ] A redundant equation
- [ ] A unique zero vector solution
- [x] Inconsistency
> It asserts zero equals one. A redundant row has zero RHS; no assignment can satisfy this contradiction.

? When does a free unknown produce infinitely many real solutions?
- [x] When the echelon system is consistent
- [ ] Even when a contradiction row exists
- [ ] Only when the matrix is square
> Consistency allows arbitrary real free choices and back substitution. Contradictions eliminate all solutions, and rectangular shape does not prevent a family.

? What does detA≠0 establish for a square real matrix?
- [ ] Every numerical calculation is insensitive
- [x] Algebraic invertibility
- [ ] Every output coordinate is positive
> The determinant criterion is algebraic. It does not guarantee conditioning or output signs.

? What is the batched-row weight shape for B records with d features and o outputs?
- [ ] B×o
- [ ] o×d with no transpose adjustment
- [x] d×o in XW
> X is B×d and W contracts the shared feature dimension to produce B×o. The column convention instead uses M=Wᵀ of shape o×d.
```

<div class="free-response" data-free-response data-key="math-series:m10:q10">
<label for="q10-response">10. Explain why the same singular coefficient matrix can give no solution or infinitely many solutions. Use the duplicate-row equations and state the row-operation invariant.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="Give both augmented systems, their reduced rows, and their solution sets."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I checked both cases and explained preservation of the complete solution set.</label>
</div>

::: answer
For x+y=3,2x+2y=7, row two minus twice row one gives 0=1, so there is no solution. Changing seven to six gives 0=0 and the family (3−t,t),t∈R. Coefficient rows are the same; constants decide compatibility. Each legal entire augmented-row operation is reversible and preserves exactly the solution set, which is the elimination invariant. Singularity rules out the square unique-for-every-target property but does not alone decide the current target's consistency.
:::

## Reading with a purpose {#reading}

Use linear-system, matrix-product, and determinant selections in the authors' [Mathematics for Machine Learning companion](https://mml-book.com/). Read the official [NumPy solve contract](https://numpy.org/doc/1.26/reference/generated/numpy.linalg.solve.html) and compare [the inverse interface](https://numpy.org/doc/1.26/reference/generated/numpy.linalg.inv.html). These primary readings supplement the original examples and arguments here.

| When | Selection and question |
|---|---|
| Session 2 · 20 minutes | Elimination: which inverse operation proves that a transformed equation system is equivalent? |
| Session 3 · 6 minutes | Determinants: distinguish signed area/volume scaling from individual vector length. |
| Session 4 · 4 minutes | NumPy solve: what assumptions exclude a singular system's free-variable family? |

The library's phrase exact-system solve refers to solving Ax=b rather than a least-squares objective; floating-point implementation is still numerical. Do not read it as a guarantee of symbolic exactness or data insensitivity.

## Retrieval exit task and next step {#summary}

Without notes, explain columns as coordinate-direction images, derive a product entry, and prove row-addition equivalence. Solve and classify one system in each category. State the determinant and residual claims separately, then annotate a batched affine calculation.

**Exit task:** take A=[[1,2],[0,1]],b=(5,2). Back substitution gives y=2,x=1; detA=1. Its inverse [[1,−2],[0,1]] recovers the input. Explain how b stored as `(2,)` versus `(2,1)` changes storage shape without changing this one mathematical target. Neither shape alone creates a batch of two independent target systems.

**Ready to move on:** you can interpret equations, classify their complete solution sets, and keep map and storage conventions consistent. The next lesson develops spaces, bases, rank, null directions, and parameter identifiability. See the [course overview](index.html) for availability.

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| m×n / aᵢⱼ | Rows×columns / indexed entry | 矩阵形状、元素 |
| Linear / affine map | Addition-and-scaling preserving / linear map plus offset | 线性映射、仿射映射 |
| AB / Aᵀ / I | Ordered composite / transpose / identity | 矩阵积、转置、单位矩阵 |
| [A|b] / row operation | Coefficients with constants / equivalent equation update | 增广矩阵、行操作 |
| Pivot / echelon / free variable | Nonzero elimination coefficient / structured rows / selectable coordinate | 主元、阶梯形、自由变量 |
| Consistent / underdetermined | At least one solution / consistent with free unknowns | 相容、欠定 |
| Inverse / determinant | Two-sided undoing map / signed volume scaling | 逆矩阵、行列式 |
| Residual / sensitivity | Equation discrepancy / response to changed input data | 残差、敏感性 |
| Batch / bias | Independent input rows / fixed output offset | 批次、偏置 |
