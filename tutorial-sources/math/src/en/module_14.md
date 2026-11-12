## Rectangular maps need singular directions {#start}

Eigenvectors compare a square map's input and output in the same space. A rectangular design, image matrix or embedding table instead connects different spaces. Even a square nonsymmetric map can lack an orthonormal eigenbasis. The singular value decomposition supplies orthonormal input and output directions for every real finite matrix, with nonnegative strengths connecting them. It extends the useful geometry from the symmetric spectral theorem without claiming that arbitrary eigenvectors are orthogonal.

This module derives that decomposition, the pseudoinverse and best-rank approximation, then applies them to centred principal component analysis. You will distinguish full, reduced and compact shapes, calculate discarded reconstruction energy, and fit preprocessing on training records before applying it elsewhere. High explained variance measures a particular geometric objective; it does not establish predictive usefulness.

**Retrieval check:** state the real symmetric spectral theorem and explain why AᵀA is positive semidefinite. Revisit [Module 13](module_13_EN.html#s3). Projection, minimum-norm selection and the four spaces come from [Modules 12](module_12_EN.html#s6) and [11](module_11_EN.html#s4). The PCA scatter calculations here are algebraic; probability and statistical interpretation return in Module 23. Use [NumPy preparation](numpy_primer_EN.html) for labs.

## Deriving SVD and keeping three shape conventions distinct {#s1}

For A of shape m×n, AᵀA is an n×n symmetric positive-semidefinite matrix. The spectral theorem supplies an orthonormal basis v₁,…,v_n with nonnegative eigenvalues, sorted from largest to smallest. Define σᵢ as their nonnegative square roots. For each positive σᵢ, set uᵢ=Avᵢ/σᵢ. Then uᵢᵀuⱼ=vᵢᵀAᵀAvⱼ/(σᵢσⱼ), which equals one for i=j and zero otherwise. Thus the nonzero image directions are orthonormal. A zero eigenvalue gives ‖Avᵢ‖²=0, hence Avᵢ=0.

Expanding any input x in the full v basis now gives Ax=Σ_{σᵢ>0}σᵢuᵢ(vᵢᵀx). This proves A=Σ_{i=1}^rσᵢuᵢvᵢᵀ, where r is the number of positive values. The u's span the column space and the corresponding v's span the row space; the remaining v's span the kernel. Extend the u list to an orthonormal basis of Rᵐ. These constructions yield the **singular value decomposition**, or SVD, A=UΣVᵀ. Its existence follows from the symmetric theorem even if A itself is rectangular or defective.

The **full SVD** has U of shape m×m, V of shape n×n, and rectangular diagonal Σ of shape m×n. Its first q=min(m,n) diagonal entries are singular values, including zeros when rank is smaller than q. The remaining positions are zero. Full U and V describe complete output and input bases, including directions not used by the map. The formula does not multiply an m×m U by an n×n diagonal array unless m=n; the middle factor's rectangular shape matters.

The **reduced SVD** retains q columns on each side: U_q is m×q, V_q is n×q, and the diagonal middle factor is q×q. It still includes zero singular values if r<q. The **compact rank-r SVD** retains only positive directions: U_r is m×r,V_r is n×r,Σ_r is r×r. Reduced and compact are therefore different when the matrix is rank deficient. Library terminology can vary; specify shapes and whether zero directions are present rather than relying on one word.

::: worked title="A tall rank-two matrix has different reduced and compact shapes"
For a 5×3 matrix of rank two, full factors have shapes U5×5,Σ5×3,V3×3. Reduced factors are U_q5×3,Σ_q3×3,V_q3×3, with one zero singular value. Compact factors are U_r5×2,Σ_r2×2,V_r3×2. Every product has shape5×3. In NumPy's real reduced output, Vh is V_qᵀ with shape3×3, not an array whose columns are the right singular vectors.
:::

The rank-zero case also fits the compact formula: the positive lists are empty and the sum is the zero matrix. Full or reduced factors can still contain arbitrary orthonormal zero-direction bases. Repeated positive singular values permit paired orthonormal rotations of the corresponding u and v lists. Flipping both a u vector and its matching v vector leaves their outer product unchanged. Comparing signed columns without allowing these ambiguities is not an appropriate correctness criterion.

The construction through AᵀA proves existence, but does not prescribe forming that Gram matrix as a numerical SVD algorithm. As Module 12 showed, squaring weak direction strengths can destroy resolution in floating-point intermediates. A library SVD works through specialised numerical routines. Validate the factor shapes, orthogonality and reconstruction, and record dtype and tolerance when deciding which values are effectively zero.

An SVD also separates coordinates from invariant quantities. If orthogonal input and output basis changes replace A by PᵀAQ, the Gram matrix becomes QᵀAᵀAQ and has the same eigenvalues. Singular values, rank and the two matrix norms therefore remain unchanged; singular-vector tuples change with the bases. Multiplying the whole map by a scalar α multiplies every strength by |α|. Scaling just one feature generally changes them in a less uniform way because that operation is not an orthogonal coordinate change. These identities let you distinguish a reorientation that preserves Euclidean geometry from a unit conversion that changes its metric.

::: check
Does full_matrices=False guarantee only r positive directions are returned? Why do zero eigenvalues of AᵀA identify the input kernel?
:::
::: answer
No. The reduced dimension is q=min(m,n), which can exceed rank r. A zero eigenvalue gives vᵀAᵀAv=‖Av‖²=0, hence Av=0; the corresponding full right-basis vectors span every kernel direction.
:::

## Rotation scaling and rotation between different spaces {#s2}

The full formula acts in three stages. Vᵀ expresses the input in an orthonormal basis, preserving its Euclidean length. Σ scales the matched coordinates and inserts or removes coordinates as required by the rectangular dimensions. U expresses the resulting output coordinates in an orthonormal output basis, again preserving length. Orthogonal factors may be rotations or reflections; calling them both rotations would omit determinant-minus-one possibilities. The middle diagonal strengths are nonnegative, unlike potentially signed or complex eigenvalues.

For each positive pair, Avᵢ=σᵢuᵢ and Aᵀuᵢ=σᵢvᵢ. The second relation follows from AᵀAvᵢ=σᵢ²vᵢ. Hence uᵢ is also an eigenvector of AAᵀ with value σᵢ². AᵀA and AAᵀ share the positive eigenvalues but generally have different numbers of zeros because their dimensions differ. These are input and output versions of one map's direction strengths, not a claim that A has the same ordinary eigenvalues.

::: worked title="A rectangular map stretches and embeds a circle"
Let A=[[3,0],[0,1],[0,0]], mapping R² to R³. The coordinate directions are singular vectors, strengths are three and one, and every input unit circle point (cos t,sin t) maps to (3cos t,sin t,0). The output ellipse lies in z=0 with semiaxes three and one. This is an image of a unit sphere under A, whereas Module 13's quadratic unit contour had inverse-square-root radii. The two geometries answer different questions.
:::

With rank r<n, some input directions vanish. Their coordinates remain part of a full V basis even though they contribute no output. With r<m, the image occupies a proper subspace of the output space and some output directions are unattainable. The last full U directions span the left null space. This makes all four fundamental spaces visible: the first r right directions span the row space, remaining right directions the null space; the first r left directions span the column space, remaining left directions the left null space.

Singular values directly give the Euclidean operator norm. For a unit input x=Vc, ‖Ax‖²=Σ_{i=1}^rσᵢ²cᵢ²≤σ₁²Σcᵢ²=σ₁². The first right singular vector attains the bound, so ‖A‖₂=σ₁, with norm zero for the zero map. For a square invertible matrix, the smallest value bounds the least stretching and the inverse norm is 1/σ_n. Therefore κ₂(A)=σ₁/σ_n without a symmetry assumption. This repairs the unqualified eigenvalue-ratio shortcut diagnosed in Module 13.

For a full-column-rank rectangular design X, the ratio σ₁/σ_d measures its least-to-greatest input stretching and the norm of its pseudoinverse. Its Gram matrix has eigenvalues σᵢ², so κ₂(XᵀX)=(σ₁/σ_d)². This proves the conditioning-square mechanism introduced earlier. A rank-deficient design has zero input directions and no finite inverse sensitivity over the full input space, although one can discuss a ratio restricted to positive singular directions if that restriction is stated.

Storage conventions deserve the same care as geometry. Real NumPy output has s as a one-dimensional array, U as left vectors in columns, and Vh as right vectors in rows. Multiplying U*s broadcasts the values across U's columns when U has the matching reduced shape. Scaling its rows would represent a different matrix. For complex inputs the returned Vh is a conjugate transpose; this course's main examples are real, where ordinary transpose suffices. A reconstruction test with the expected shape detects many orientation mistakes before they become misleading interpretations.

::: figure #fig-14-1
The input basis, nonnegative rectangular scaling and output basis have distinct jobs. Positive singular directions reveal the row and column spaces; unused directions reveal the two kernels.
:::

::: check
Why can two matrices have the same positive singular values but different nullities? Does a negative eigenvalue force a negative singular value?
:::
::: answer
The kernels also depend on the input/output dimensions, which can differ despite the same r positive values. Singular values are nonnegative square roots of Gram eigenvalues. For a symmetric map, they are absolute eigenvalue magnitudes, with sign absorbed into its left/right direction pairing.
:::

## Pseudoinverse weak directions and numerical resolution {#s3}

For compact A=U_rΣ_rV_rᵀ, define A⁺=V_rΣ_r⁻¹U_rᵀ, where only positive strengths are inverted. Its shape is n×m. It projects an output target onto the column space by taking u coordinates, divides each retained coordinate by its strength, and constructs an input in the row space. This is precisely Module 12's geometric minimum-norm least-squares map. An ordinary inverse appears as the special square full-rank case, not as a requirement for the formula.

Multiplying gives AA⁺=U_rU_rᵀ and A⁺A=V_rV_rᵀ, the column- and row-space projections. They are symmetric and idempotent. Consequently AA⁺A=A and A⁺AA⁺=A⁺, recovering all Moore–Penrose conditions. For any y, w_min=A⁺y has prediction U_rU_rᵀy, the unique closest reachable output. Every least-squares minimiser is w_min+n with n in the kernel, and orthogonality makes w_min uniquely smallest in Euclidean norm.

::: worked title="A rank-one map projects before lifting"
Let A=[[1,1],[0,0]]. Its positive singular value is √2, right direction (1,1)/√2 and left direction (1,0). The pseudoinverse is [[1/2,0],[1/2,0]]. For y=(4,3), it returns w=(2,2), with predicted output (4,0) and residual (0,3). Every weight (2+t,2−t) has that same fit. The second target coordinate cannot be recovered because it lies outside the column space, and the minimum-norm rule splits the first equally.
:::

A small positive σ can amplify target noise: a disturbance εuᵢ produces coefficient change (ε/σᵢ)vᵢ when that direction is retained. The input and output norms of those changes are |ε|/σᵢ and |ε| respectively. This is an exact directional sensitivity statement. It explains why a numerical algorithm can be accurate for the supplied targets and yet return unstable coefficients after a measurement perturbation. Singular vectors make the mechanism visible rather than hiding it behind one scalar condition number.

For diag(1,10⁻¹⁰), the target (1,10⁻¹⁰) gives inverse weights (1,1). Adding (0,10⁻⁸) changes them to (1,101). A numerical pseudoinverse that discards the second direction returns (1,0) instead and leaves a second-coordinate residual. It has deliberately altered the effective inverse problem to limit amplification. That choice is not a proof that the exact second singular value vanished. It trades resolution and fit against parameter response, requiring a stated tolerance and purpose.

The pinned pseudoinverse interface uses a relative cutoff based on the largest singular value. An absolute rank threshold, a relative pseudoinverse threshold and a measurement-noise policy are not automatically interchangeable. Global scaling interacts with absolute thresholds differently from relative ones, and scaling individual columns also changes the geometry. Report the positive directions retained, the feature units, dtype and tolerance. If a value is close to the cutoff, small input changes can change the selected rank and the returned representative.

Do not form 1/s blindly when the reduced list includes zeros. Even “multiply by zero afterwards” is unsafe because an infinite intermediate can yield NaN. Build a retained-direction mask or use a library with an explicit cutoff policy. An all-zero matrix has a zero pseudoinverse; there is no positive direction to divide by. A meaningful verification checks the selected projected output and minimum-norm geometry, not just that a numerical call finished without an exception.

::: check
Does A⁺ undo every output target? If weak directions are discarded, is the result still the exact pseudoinverse of the original real matrix?
:::
::: answer
AA⁺y is the column-space projection, equal to y only for reachable targets. A cutoff that removes an exactly nonzero direction computes a pseudoinverse for an effective truncated map, so distinguish that policy from the exact mathematical pseudoinverse of the original matrix.
:::

## Truncation reconstruction error and the best-rank theorem {#s4}

Keep the k strongest terms to define A_k=Σ_{i=1}^kσᵢuᵢvᵢᵀ, with 0≤k≤r. Its rank is k for positive retained values, and A₀=0. This is a low-rank approximation in the original matrix shape. Keeping factors rather than constructing all entries can save storage or computation when k is small. The factor scalar count is k(m+n+1) if both direction factors and k strengths are stored. This must be compared with mn and with actual file-format overhead; low rank alone does not guarantee a smaller stored file.

The **Frobenius norm** is ‖M‖_F=√ΣᵢⱼMᵢⱼ², equivalently the square root of the sum of squared column lengths. Left multiplication by an orthogonal matrix preserves each column length; right orthogonal multiplication also preserves the total, by applying the same reasoning to the transpose. Hence Frobenius norm is unchanged by full orthogonal basis changes. In the SVD coordinates, A−A_k has only discarded strengths on its diagonal, so ‖A−A_k‖_F²=Σ_{i>k}σᵢ². The operator norm error is the largest discarded value σ_{k+1}, with zero after every positive direction is kept.

::: worked title="Three strengths give an exact error budget"
Suppose A has positive singular values six, three and one. Its squared Frobenius norm is 36+9+1=46. Rank-one truncation leaves squared error ten, rank-two leaves one and rank-three leaves zero. Retained energy ratios are 36/46 and 45/46. For the lab's 8×6 matrix, one, two and three retained terms require 15,30 and45 scalar entries versus48 original entries; these are factor counts, not measured file sizes or task-quality scores.
:::

The **best-rank-k approximation theorem** says no matrix B of rank at most k has smaller Frobenius or operator error than A_k. Here is a complete Frobenius proof. Let P project onto C(B), of dimension t≤k. In each column, the error splits into its component in that space and the perpendicular component, so ‖A−B‖_F²≥‖(I−P)A‖_F²=‖A‖_F²−‖PA‖_F². Using the left singular basis gives ‖PA‖_F²=Σσᵢ²wᵢ, where wᵢ=‖Puᵢ‖² lies between zero and one. Include all full left-basis vectors, assigning zero strength to unused directions. Their weights sum to t, because summing squared projections of an orthonormal basis onto a t-dimensional space counts t unit directions.

The weighted strength sum is at most Σ_{i≤k}σᵢ². To see this when k>0, bound every tail strength by σ_k² and use the remaining weight budget k−Σ_{i≤k}wᵢ. Then the sum is at most Σ_{i≤k}[σᵢ²wᵢ+σ_k²(1−wᵢ)], no greater than Σ_{i≤k}σᵢ². For k=0 the projection is zero. Thus every candidate error is at least the discarded square sum, which A_k attains. The argument handles arbitrary candidate images rather than assuming their directions already align with A.

For operator error with k<r, restrict B to the span of the first k+1 right singular vectors. Its rank is at most k, so rank–nullity gives a unit vector z in this subspace with Bz=0. Then ‖(A−B)z‖=‖Az‖≥σ_{k+1}, since all its included strengths are at least that large. The truncated matrix attains equality. This proves the second norm claim. With repeated values at the truncation boundary, several retained subspaces can be optimal; best error need not identify a unique approximation.

::: figure #fig-14-2
Discarding strengths has a calculable squared-error budget. Optimality concerns the specified matrix norm, rather than future prediction quality or every alternative task loss.
:::

::: widget name=truncation
Move the retained-rank control for a generated small matrix. Compare its reconstructed entries, discarded squared energy and factor storage; include rank zero and full reconstruction.
:::

::: check
Does keeping ninety-nine percent of squared singular energy prove ninety-nine percent classification accuracy? Can a rank-three factorisation always save scalar storage?
:::
::: answer
Neither follows. Energy measures a reconstruction objective, not labelled prediction performance. Storage depends on dimensions and retained rank; compare k(m+n+1) with mn, then account for the actual encoding and overhead.
:::

## Centred PCA scores reconstruction and scatter {#s5}

Let a data matrix X contain m records as rows and d features as columns. Compute the feature mean μ using training rows and form Z=X−1μᵀ, so each column sums to zero. Its right singular vectors are principal feature directions. For k retained columns V_k, **PCA scores** are T=ZV_k, shape m×k. Reconstruction is X_hat=TV_kᵀ+1μᵀ. Subtraction and addition of the mean make this an affine reconstruction of the original records, with a linear projection of their centred displacements.

The sample scatter matrix is ZᵀZ. Its eigendirections are V and its eigenvalues are σᵢ². With m>1, dividing by m−1 gives the customary sample covariance matrix and eigenvalues σᵢ²/(m−1). At this stage this is an algebraic normalisation convention; distributional estimation claims come later. Scores along orthonormal principal directions have diagonal cross-product matrix diag(σ₁²,…,σ_k²), since TᵀT=V_kᵀZᵀZV_k. This explains the decorrelation of these centred coordinates without claiming statistical independence.

::: worked title="Training mean and a two-feature scatter matrix"
For rows (10,0),(12,1),(14,0),(16,1), μ=(13,0.5). Centred rows are (−3,−0.5),(−1,0.5),(1,−0.5),(3,0.5), and scatter is [[20,2],[2,1]]. Its values are (21±√377)/2. The leading unit direction is approximately (0.994623,0.103562). Its explained squared-energy share is about0.962297, and discarding the other direction leaves squared reconstruction error (21−√377)/2≈0.791756. Sample covariance values divide these scatter values by three.
:::

Explained variance ratios are σᵢ²/Σσⱼ². Their retained sum measures the fraction of centred training squared spread preserved by the projection. If all training records are identical, Z=0 and the denominator is zero; the ratios are undefined rather than automatically perfect. With one record, the sample-covariance denominator is also undefined. State these boundary cases instead of quietly emitting NaN or changing the mathematical definition.

PCA chooses an orthonormal k-dimensional feature subspace that minimises centred squared reconstruction error. For any candidate orthonormal W, its projection is ZWWᵀ, and retained energy is the sum of the selected direction Rayleigh values of ZᵀZ. The same projection-weight argument from the best-rank theorem bounds this by the top k squared strengths. Taking V_k attains the bound. Its scores reconstruct Z_k=U_kΣ_kV_kᵀ, exactly the truncated SVD of the centred data. Thus variance maximisation and squared-error minimisation are two algebraic views of the same objective.

Because centring forces 1ᵀZ=0, rank is at most min(d,m−1), not merely min(d,m). This matters for small training sets. A wide dataset cannot produce more than m−1 positive principal components after centring. Repeated scatter eigenvalues also make individual principal directions nonunique, while the corresponding whole eigenspace remains well defined. A sign flip changes scores and basis signs together and leaves reconstruction unchanged.

For a new mathematical column x, use t=V_kᵀ(x−μ), with t of length k. For a stored row, compute (x−μ)V_k. Reuse the training μ and V_k. The new row need not project with zero residual, and held-out scores need not have mean zero; neither indicates failure. They are measurements in a coordinate system fixed by training data. Refitting that system on each test batch creates a different transformation and changes what the evaluation means.

For one new centred displacement z, the reconstruction is V_kV_kᵀz. Its discarded part is perpendicular to the retained subspace, so its error square is the sum of its discarded coordinate squares. Training tail strengths give the aggregate training error, but they do not predict this new displacement's error automatically. A new record can lie largely outside the retained subspace even when training reconstruction was excellent. Evaluate held-out reconstruction separately if that is the intended task.

::: figure #fig-14-3
Training records determine the centre and principal directions. Held-out records use the same transformation rather than defining a new centre or basis.
:::

::: check
Why does centred PCA have at most m−1 positive components? Must held-out score means be zero? Does diagonal score covariance prove independence?
:::
::: answer
The all-ones left-null vector from centring limits rank. Held-out rows use the training centre and need not share its mean. Diagonal cross-products or covariance express zero linear correlation in those coordinates, not statistical independence without further assumptions.
:::

## Scaling leakage and the limits of explained variance {#s6}

PCA depends on feature units because its Euclidean reconstruction objective adds coordinate squares. Multiplying one feature by a hundred multiplies its contribution to squared spread by ten thousand and alters the scatter cross terms. A largest-spread direction can therefore change even when the underlying physical measurements are the same. In the lab, changing the second feature's scale rotates the leading direction almost onto that axis and changes its explained-energy share. Those are meaningful consequences of a changed coordinate metric, not automatically a computational error.

Standardising features by training means and scales can create another justified objective, but it is a modelling choice. A zero-variance feature cannot be divided by its zero standard deviation; remove it or define a documented policy. Scales and any feature-selection decisions belong to the fitted transformation and must also be estimated from training data. A centre, scale and basis have to be kept together for subsequent scores and inverse reconstruction in original units.

::: worked title="Almost all variance can discard every label distinction"
Take centred records (−100,−1),(−100,1),(100,−1),(100,1), with label determined by the sign of the second coordinate. Scatter is diag(40000,4), so the first direction explains 40000/40004≈99.99 percent of spread. Keeping only it maps opposite-label records at each first-coordinate value to identical scores. The small second direction perfectly distinguishes these labels; the large first one does not. Reconstruction energy alone cannot promise classification accuracy.
:::

**Leakage** occurs when information reserved for evaluation influences the fitted model or preprocessing. PCA uses no labels, yet fitting its mean or directions on combined training and held-out features still changes the learning procedure. The usual held-out question concerns a transformation trained without those records. In Lab C, adding two distant held-out rows changes the mean from (13,0.5) to about(58.666667,5.333333). Replacing the training centre with that value is already a different transformation, even before its directions are recomputed.

The operational contract is simple: split records first; fit mean, any scales and components on training only; apply those saved parameters to validation and test records; use validation to choose k or other modelling choices; evaluate the final selected procedure on the reserved test data. In cross-validation, each fold needs its own training-fitted transform. Reusing components fitted on the whole dataset across folds gives each fold access to its held-out features. If a deliberately transductive setting permits using unlabelled evaluation features, state that different task explicitly rather than presenting its result as ordinary inductive evaluation.

Uncentred SVD is also a different objective. It approximates raw vectors about the origin, combining mean offset and variation. With records far from zero, a leading direction can primarily represent their common location rather than deviations around their mean. Uncentred factorisation can be useful for a stated application, but should not be silently interpreted as centred PCA. The lab compares line projectors to distinguish actual directional changes from arbitrary vector-sign changes.

::: figure #fig-14-4
Variance retained, feature scaling and labelled usefulness are separate decisions. Preprocessing fitted on held-out records changes the procedure being evaluated even when no labels are used.
:::

Low-rank factors can support image approximation, embedding compression and compact parameter updates. The best-rank theorem guarantees the closest matrix under its specified norms, not the best downstream model, fastest implementation or minimum file size. An update UVᵀ has rank at most k when both factors have k columns, but choosing such an update for a learning task introduces optimisation and statistical questions beyond SVD truncation. Keep the algebraic rank statement separate from a claim of task equivalence.

Finally, numerical rank and principal-component interpretation need a declared resolution. Repeated or near-repeated strengths can make individual directions unstable even when their combined subspace and reconstruction remain stable. A weak inverse direction can magnify noise, while discarding it changes the effective operator. Record selected k, retained strengths, training centre/scales, dtype and tolerances alongside reconstruction error. Those details make the approximation reproducible and its limits assessable without treating one successful decomposition as evidence for every intended use.

::: check
Does unsupervised PCA fitted on test features avoid leakage? Is uncentred SVD the same objective? What does high explained variance establish?
:::
::: answer
For ordinary held-out evaluation, test-fitted preprocessing changes the authorised training procedure even without labels. Uncentred SVD approximates around zero rather than the training mean. High explained variance establishes retained centred squared spread under the chosen feature metric, not prediction accuracy or causal meaning.
:::

## Common misconceptions {#misconceptions}

| Claim | Correction |
|---|---|
| Reduced SVD always omits zero directions | It retains q=min(m,n), not necessarily rank r. |
| Vh contains right vectors in columns | In real NumPy output, they are its rows. |
| Constructing AᵀA is required for a numerical SVD | It proves existence but can lose weak-direction resolution. |
| Pseudoinverse reaches every target exactly | It projects onto the column space first. |
| Low rank always saves storage | Compare factor counts with original entries and actual encoding. |
| Explained variance means prediction accuracy | A low-spread direction can contain every label distinction. |
| No labels means no preprocessing leakage | Held-out features can still alter the fitted transform. |
| PCA is independent of feature units | Units change its Euclidean objective and spectrum. |
| Zero score covariance proves independence | It establishes a linear second-moment relation only. |

## Three CPU labs {#labs}

Use the Python 3.11 and NumPy baseline in [array preparation](numpy_primer_EN.html). Outputs below come from executing the downloadable scripts. Predict shapes, retained directions and error budgets first. Lab values can differ in harmless signed basis conventions; compare reconstructed maps and subspaces.

### Lab A Generated-matrix compression {#lab1}

The script constructs an 8×6 matrix from three orthonormal direction pairs and strengths six, three and one. Verify those generating directions, then compare reduced dimensions with exact rank. For each retained rank, predict the discarded squared error and factor scalar count before running.

{{LAB:lab1}}

**Deliverable:** rank, factor shapes, reconstruction error and storage table, with a proof of the tail formula. Explain why a printed zero after rounding does not itself establish exact rank, and why the known construction supplies that exact claim here.

### Lab B Training-centred PCA {#lab2}

Compute the training mean and scatter by hand. Compare their spectrum with squared singular values, then reconstruct one-component training data. Apply the saved training parameters to two held-out batches without refitting. Check score/reconstruction shapes and the aggregate tail-error identity.

{{LAB:lab2}}

**Deliverable:** saved mean and component directions, training scores/reconstruction, held-out scores and explained-energy ratios. State the undefined ratio policy for all-zero centred data and the difference between training and new-record error.

### Lab C Centring leakage scaling and weak inverse modes {#lab3}

Compare centred and uncentred line projectors, then compute the leaked combined mean. Change feature units and explain the rotated principal line. Finally compare two relative pseudoinverse cutoffs under a small target perturbation.

{{LAB:lab3}}

**Deliverable:** identify each changed objective or evaluation procedure, and report the inverse resolution trade-off with actual residuals. Distinguish deliberate weak-mode truncation from a claim that the exact nonzero direction disappeared.

## Exercises with complete solutions {#exercises}

Exercises 1–12 are required; 13–14 add 35 optional minutes. Use real factors and state rank, retained dimension and centring assumptions.

::: exercise #e1 level=1 kind=calculation minutes=6
For a 5×3 rank-two matrix, list full, reduced and compact SVD shapes, including NumPy Vh and the number of positive values.
:::
::: solution
Full U5×5,Σ5×3,V3×3; reduced U5×3,Σ3×3,V3×3; compact U5×2,Σ2×2,V3×2. There are two positive values, with one reduced zero. NumPy reduced Vh=Vᵀ is3×3 with right vectors in rows; a compact V_rᵀ would be2×3. Every reconstructed product is5×3.
:::

::: exercise #e2 level=1 kind=calculation minutes=6
For A=[[3,0],[0,1],[0,0]], find its positive singular values, right and left directions, and the image of the input unit circle.
:::
::: solution
Strengths three and one; right directions are the two R² coordinate units, left directions the first two R³ units. Input (cos t,sin t) maps to (3cos t,sin t,0), an ellipse in z=0 with semiaxes three and one. The left null space is span{(0,0,1)} and the input kernel is zero.
:::

::: exercise #e3 level=1 kind=calculation minutes=6
Compute the pseudoinverse solution for A=[[1,1],[0,0]],y=(4,3), its prediction, and every least-squares minimiser.
:::
::: solution
A⁺=[[1/2,0],[1/2,0]],w_min=(2,2),prediction(4,0),residual(0,3),SSE9. Every minimiser is (2+t,2−t), since only the sum four affects the reachable first coordinate. Their norms are 8+2t², uniquely smallest at zero. The second target coordinate is unattainable.
:::

::: exercise #e4 level=1 kind=calculation minutes=6
With strengths six, three, one, give rank-one squared Frobenius error, operator error and retained-energy fraction. For an 8×6 matrix, compare factor scalar count with original count.
:::
::: solution
Discarded square sum9+1=10; operator error is the next strength three; retained share36/46. One retained pair requires1(8+6+1)=15 scalars versus48 entries. These calculations concern the specified reconstruction and scalar storage, not measured file size or labelled accuracy.
:::

::: exercise #e5 level=2 kind=proof minutes=15
Starting from AᵀA eigenpairs, prove positive left singular vectors uᵢ=Avᵢ/σᵢ are orthonormal and justify zero right directions belonging to the kernel.
:::
::: solution
uᵢᵀuⱼ=vᵢᵀAᵀAvⱼ/(σᵢσⱼ)=σⱼ²vᵢᵀvⱼ/(σᵢσⱼ), giving one when i=j and zero otherwise. If σᵢ=0, ‖Avᵢ‖²=vᵢᵀAᵀAvᵢ=0, so Avᵢ=0. Expanding every input in the complete right basis shows the positive pairs reconstruct all of A and the zero directions span its whole kernel.
:::

::: exercise #e6 level=2 kind=proof minutes=15
Derive the discarded-square Frobenius error and prove no rank-at-most-k candidate has less error using projection onto its image.
:::
::: solution
Orthogonal left/right changes preserve Frobenius norm, so the truncated diagonal gives tail sum Σ_{i>k}σᵢ². For candidate B, project onto C(B) by P. Columnwise Pythagoras gives ‖A−B‖_F²≥‖A‖_F²−‖PA‖_F². The retained term is Σσᵢ²wᵢ with wᵢ=‖Puᵢ‖²∈[0,1] and total≤k. Sorted strengths make this no larger than the sum of the first k squares: bound tail strengths by σ_k² and allocate remaining weight budget to the top k. The error is therefore at least the tail sum, attained by A_k. For k=0 the projection and candidate are zero.
:::

::: exercise #e7 level=2 kind=proof minutes=15
Prove the SVD pseudoinverse yields the column/row projections and the minimum-norm least-squares representative.
:::
::: solution
A=U_rΣ_rV_rᵀ and A⁺=V_rΣ_r⁻¹U_rᵀ give AA⁺=U_rU_rᵀ,A⁺A=V_rV_rᵀ using orthonormal columns. Thus A⁺y lies in the row space and its prediction is the closest column-space projection. Every minimiser differs by n∈N(A). Row/null orthogonality gives ‖A⁺y+n‖²=‖A⁺y‖²+‖n‖², uniquely smallest at n=0. The two projection identities also imply the four Moore–Penrose conditions.
:::

::: exercise #e8 level=2 kind=application minutes=13
For training rows (10,0),(12,1),(14,0),(16,1), calculate the centre, scatter and one-component squared reconstruction error.
:::
::: solution
Centre(13,.5),centred rows(−3,−.5),(−1,.5),(1,−.5),(3,.5). Summing outer products gives scatter[[20,2],[2,1]], trace21,determinant16. Characteristic values(21±√377)/2, so discarded rank-one squared error is(21−√377)/2≈.791756. Sample covariance values divide by m−1=3, and explained ratios divide by total21.
:::

::: exercise #e9 level=2 kind=application minutes=13
Using Exercise8's training centre and leading direction approximately(.994623,.103562), compute scores for held-out rows(20,2),(8,−1). Must their mean be zero?
:::
::: solution
Centred rows(7,1.5),(−5,−1.5) give scores7(.994623)+1.5(.103562)≈7.117704 and −5(.994623)−1.5(.103562)≈−5.128458. Their mean need not be zero because the transform uses training centre, not held-out centre. Refitting on these rows would change the evaluated procedure. Reversing direction sign reverses both scores without changing reconstructed points.
:::

::: exercise #e10 level=2 kind=application minutes=13
For records(±100,±1), all four combinations, labels follow the second sign. Compute scatter and leading explained share, then explain what one-component scores lose.
:::
::: solution
Mean zero; cross terms cancel. Scatterdiag(40000,4). Leading share40000/40004≈.999900. Scores retain only ±100, so each first-coordinate value occurs with both labels and those opposite-label records become identical. The second coordinate alone distinguishes every label. Excellent reconstruction-energy retention need not preserve the information needed by a supervised task.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=16
A pipeline calls uncentred raw SVD “centred PCA,” fits its mean/components on training plus test because labels are unused, and reuses this fit across validation folds. Repair the objective and evaluation contract.
:::
::: solution
Centred PCA subtracts a training-fitted feature mean before SVD; raw SVD approximates vectors about zero and includes their mean offset. Split data first and fit every mean, scale and component on training only for ordinary held-out evaluation. Test features can alter the transformation without labels, so combining them is leakage for that procedure. In cross-validation each fold needs preprocessing fitted on that fold's training partition. Any transductive alternative using evaluation features must be explicitly identified as a different task.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=16
A program treats Vh columns as right vectors, inverts every reduced s including zeros, and declares a cutoff removing10⁻¹⁰ proves exact rank one. Give three repairs.
:::
::: solution
Real Vh contains right vectors in rows; use its transpose for feature-direction columns and check reconstruction dimensions. Reduced lists can contain zeros, so retain positive/resolved directions before reciprocal operations or use a library cutoff policy; blind division can create infinities/NaN. diag(1,10⁻¹⁰) has exact rank two. Dropping its weak direction is an effective-resolution decision with a residual trade-off, not an exact zero certificate.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Prove the operator-norm best-rank-k error bound using rank–nullity on the first k+1 right singular directions.
:::
::: solution
For k<r, any rank≤k B restricted to the(k+1)-dimensional span of v₁,…,v_{k+1} has a nonzero kernel vector. Normalise it to z. Then Bz=0 and ‖(A−B)z‖=‖Az‖≥σ_{k+1}, since each included strength is at least that value. Thus operator error≥σ_{k+1}. A−A_k retains only the tail and has operator norm exactlyσ_{k+1}, attaining the bound. For k≥r exact reconstruction gives zero.
:::

::: exercise #e14 level=3 kind=extension minutes=20
For full-column-rank X, derive κ₂(XᵀX)=(σ₁/σ_d)², then explain why this is a warning about forming a Gram matrix rather than proof every normal-equation computation fails.
:::
::: solution
XᵀX=Vdiag(σᵢ²)Vᵀ is positive definite. Its norm isσ₁² and inverse norm1/σ_d², so the condition number is the square ratio. Weak differences therefore enter squared strengths and can lose resolution. But actual numerical errors depend on conditioning, arithmetic and data; a well-conditioned small system can be solved accurately through normal equations. QR/SVD can avoid additional Gram damage without removing sensitivity already present in X or its measurements.
:::

## Ten-question self-check {#quiz}

```quiz
? What does reduced SVD retain for an m×n rank-r matrix?
- [x] q=min(m,n) directions, potentially including zeros
- [ ] Always exactly r positive directions
- [ ] Only one direction whenever the matrix is rectangular
> Compact rank-r factors omit zero directions. Reduced shapes use the smaller matrix dimension regardless of exact rank.

? In real NumPy SVD output, where are right singular vectors stored?
- [ ] Columns of Vh
- [x] Rows of Vh
- [ ] Entries of the singular-value array
> Vh is Vᵀ; transpose it for feature-direction columns. The one-dimensional array contains nonnegative strengths.

? What are the positive eigenvalues of AᵀA?
- [ ] Signed ordinary eigenvalues of A
- [ ] Singular values with no squaring
- [x] Squared positive singular values
> The SVD construction defines strengths as nonnegative square roots of the positive Gram spectrum.

? What is the squared Frobenius error of retaining k terms?
- [x] Sum of discarded singular-value squares
- [ ] Sum of retained singular values
- [ ] Classification error on future records
> Orthogonal invariance reduces the reconstruction discrepancy to its discarded diagonal strengths. It is a matrix-error objective.

? What does the pseudoinverse predict for an arbitrary target?
- [ ] The target itself in every case
- [x] Its column-space projection
- [ ] A new target-space dimension invented by the solver
> Unreachable components remain as residual. The lift selects minimum-norm weights for the closest reachable prediction.

? Which data should fit PCA mean and directions in ordinary held-out evaluation?
- [ ] Training plus test because PCA uses no labels
- [ ] Each test batch independently
- [x] Training data only
> Preprocessing is part of the learned procedure. Held-out features can alter it even without their labels.

? All centred training records are zero. What is the explained-variance ratio?
- [x] Undefined because total spread is zero
- [ ] Automatically one for every component
- [ ] A proof that future predictions are perfect
> The denominator vanishes. Handle this boundary explicitly rather than divide by zero or attach a predictive claim.

? A component retains99.99% of training variance. What follows?
- [ ] Classification accuracy is99.99%
- [x] That share of centred squared spread is retained under the chosen metric
- [ ] Feature units cannot affect it
> Labels can lie entirely in a low-spread direction. Scaling changes the geometric objective and often the spectrum.

? Dropping a weak nonzero singular value in a numerical pseudoinverse means what?
- [ ] The exact original rank has been proved smaller
- [ ] Every target is now fitted exactly
- [x] An effective inverse has been chosen with a resolution/amplification trade-off
> The cutoff changes retained directions and can leave extra residual while reducing noise amplification. State the policy.
```

<div class="free-response" data-free-response data-key="math-series:m14:q10">
<label for="q10-response">10. Specify a training-centred PCA pipeline for held-out records. Give every shape, the reconstruction-error formula, a zero-spread boundary, and one reason high explained variance need not preserve labels.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State which parameters are fitted and reused, then separate geometric and predictive claims."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I kept held-out rows out of fitting and included both boundary and interpretation limits.</label>
</div>

::: answer
For training X of shape m×d,fit μ of length d and SVD of Z=X−1μᵀ. Retain V_k d×k; scores ZV_k are m×k and reconstruction ZV_kV_kᵀ+1μᵀ is m×d. Training squared Frobenius error isΣ_{i>k}σᵢ². Apply the saved mean and directions to new rows without refitting; any scales are also training fitted. Explained ratios divide by totalσ² and are undefined at zero spread. The four(±100,±1) records show that the largest-spread first direction can discard every second-coordinate label distinction. Reconstruction and evaluation claims are separate.
:::

## Reading with a purpose {#reading}

Use SVD, pseudoinverse and PCA selections in the authors' [Mathematics for Machine Learning companion](https://mml-book.com/). The official NumPy 1.26 [SVD interface](https://numpy.org/doc/1.26/reference/generated/numpy.linalg.svd.html) and [pseudoinverse interface](https://numpy.org/doc/1.26/reference/generated/numpy.linalg.pinv.html) specify the numerical shapes and cutoff conventions. The original derivations above prove the geometry and approximation claims.

| When | Selection and question |
|---|---|
| Session 1 · 20 minutes | SVD geometry: how do input and output spaces differ for a rectangular map? |
| Session 4 · 20 minutes | Returned factors and cutoffs: where are right vectors, and which exact directions does the numerical policy discard? |

## Retrieval exit task and next step {#summary}

Without notes, derive positive singular directions from AᵀA, state full/reduced/compact shapes, and recover the four spaces. Prove one optimal rank-k error bound, write the pseudoinverse, and specify a training-only PCA pipeline with a label-information counterexample.

**Exit task:** diag(4,2,0) has rank two. Rank-one squared error is four and operator error two; exact pseudoinverse is diag(1/4,1/2,0). A target's third coordinate remains residual. Explain why its reduced SVD still has three entries, why zero must not be inverted, and what a cutoff discarding two would change.

**Ready to move on:** you can distinguish exact map geometry, numerical resolution, reconstruction and task evaluation. The next block develops limits, derivatives and optimisation, using this linear-algebra foundation. Check the [course overview](index.html) for availability.

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| UΣVᵀ / σᵢ | Singular direction factors / nonnegative strengths | 奇异值分解、奇异值 |
| Full / reduced / compact | Complete bases / q directions / positive r directions | 完整、约化、紧致 |
| A⁺ | Minimum-norm least-squares map | 伪逆 |
| A_k / ‖·‖_F | Rank-k truncation / entrywise squared-energy norm | 低秩截断、弗罗贝尼乌斯范数 |
| μ / Z | Training feature mean / centred data | 均值、中心化 |
| V_k / T | Principal feature directions / score matrix | 主方向、得分 |
| Scatter / covariance | ZᵀZ / conventionally divided by m−1 | 散布矩阵、协方差 |
| Explained ratio | Retained fraction of centred squared spread | 解释方差比例 |
| Leakage / cutoff | Evaluation information in fitting / retained-direction policy | 数据泄漏、阈值 |
