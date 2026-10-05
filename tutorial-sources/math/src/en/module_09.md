## Numbers become geometry only after choosing coordinates {#start}

A data record can be written as a list of numbers. Comparing two records by a dot product or distance looks straightforward, but the result depends on feature order, units, and the operation chosen. Converting centimetres to metres can change an unweighted nearest neighbour even though the physical records are unchanged. Mixing a column array with a flat array can produce every pairwise difference instead of the intended paired differences.

This module develops the mathematics and the implementation contract together. You will distinguish points from displacements, derive lengths and angle bounds, compare norms, and inspect shapes before computing. A successful numerical call establishes that an operation was executable; a mathematical interpretation needs its own assumptions about what the coordinates represent.

**Retrieval check:** work with real tuples and finite sums, and describe a Cartesian product. Review [Module 01](module_01_EN.html#s5) and [Module 03](module_03_EN.html#s1) if needed. There is no assumed earlier linear algebra. Complete [NumPy array preparation](numpy_primer_EN.html) before the labs; its roughly thirty-minute orientation is additional preparation when you need it. The numerical baseline uses Python 3.11 and the pinned NumPy environment described there.

## Scalars coordinate vectors points and displacements {#s1}

A **scalar** is a single number used to scale a vector; here scalars are real numbers. A coordinate **vector** in $\mathbb R^d$ is an ordered d-tuple of real entries. The positive integer d is the number of coordinates. The Cartesian product construction from Module 03 supplies the set of all such tuples. The coordinate order is part of the specification: (height,age) and (age,height) use different feature conventions even if both arrays have length two.

In geometry, a vector can describe a displacement independent of where it is drawn. Its arrow records both magnitude and direction. Sliding the arrow without rotating or stretching it preserves that displacement. In data work, a tuple can instead collect feature measurements, some of which have different units. Writing those measurements as a vector makes coordinate algebra possible, but it does not automatically make a Euclidean length physically meaningful.

A **point** is a location, whereas a displacement connects locations. Given points p,q in a chosen coordinate frame, q−p is the displacement from p to q. Translating the origin adds the same coordinate offset to both points and leaves their difference unchanged. Position coordinates and displacement coordinates may use the same tuple notation, so the surrounding interpretation must identify which object is being added or compared.

::: worked title="A displacement is independent of the origin"
Let p=(1,2),q=(4,6). The displacement q−p is (3,4). Moving the coordinate origin so both displayed points gain (10,−5) gives p′=(11,−3),q′=(14,1), and q′−p′ remains (3,4). An arrow from (0,0) to (3,4) represents that same displacement without being the original point q. Its Euclidean length, developed below, is five.
:::

::: figure #fig-09-1
The point-to-point arrow and its translated copy have the same coordinate difference. Coordinates of individual points change when the frame changes.
:::

A zero vector has every entry zero and describes no displacement. It is a valid vector with length zero, not a missing observation. A record with unknown age also needs a separate missing-data representation; substituting zero would assert a numerical value and change the geometry. Similarly, a vector of category codes such as 1,2,3 does not acquire meaningful distances merely because the codes are numeric. The encoding determines which comparisons make sense.

Coordinate unit vectors eᵢ have one in position i and zero elsewhere. A tuple x can be written $\sum_{i=1}^d x_i e_i$: each coordinate contributes along its own axis. In two dimensions this gives (3,4)=3(1,0)+4(0,1). These coordinate directions have unit length and are mutually perpendicular under the ordinary dot product. Module 11 develops the more general ideas of basis, dimension, and coordinate changes.

Two vectors to be added or compared must have the same coordinate dimension and corresponding meanings. A three-feature vector cannot be paired entrywise with a two-feature vector by silently dropping a coordinate. Even equal lengths are insufficient if one record uses a different feature order. The lab checks lengths before using Python zip because zip otherwise stops at the shorter input and could hide a modelling error.

The mathematical dimension d differs from storage axes. A single three-coordinate vector may be stored in a NumPy array with one axis `(3,)` or two axes `(3,1)`. A table of one hundred such vectors has shape `(100,3)`, still representing observations with three coordinates each. Keeping these counts separate prevents confusion between the number of examples, the number of features, and the number of axes in a container.

::: check
What is the displacement from (−1,3) to (2,−1)? Does a zero vector mean missing data? Does a `(100,3)` table make each observation a hundred-dimensional vector?
:::
::: answer
The displacement is (3,−4). A zero vector contains known zeros; missingness is a different modelling condition. Each row of the table has three coordinates, while one hundred counts observations and the array has two axes.
:::

## Addition scaling linear and affine combinations {#s2}

Vector addition and scalar multiplication act coordinatewise: $(u+v)_i=u_i+v_i$ and $(\alpha u)_i=\alpha u_i$. The result stays in the same coordinate dimension. Adding displacement arrows corresponds to placing the second arrow's tail at the first arrow's head; the combined displacement joins the starting point to the final endpoint. Negative scaling reverses direction, positive scaling preserves it, and scaling by zero gives the zero vector.

Coordinatewise real arithmetic implies commutativity and associativity of vector addition, additive identity zero, additive inverse −u, and distributive scaling rules. For example α(u+v)=αu+αv because the equality holds in every coordinate. These laws explain why finite sums of vectors can be rearranged or grouped under the stated real-number model. In floating-point software, different grouping can change small rounding errors, which Module 28 studies separately.

A **linear combination** has the form $\sum_{j=1}^k\alpha_jv_j$ with real coefficients and equal-dimensional vectors. Coefficients need not be positive or sum to one. The vector 2(3,4)+3(4,−3)=(18,−1) is a valid combination. Its coordinates may lie beyond either original vector's endpoints. A linear combination is an algebraic construction, not necessarily an interpolation or a probability-weighted average.

A line through a point p in nonzero direction u is p+tu for real t. Restricting t to [0,1] gives the segment from p to p+u; other t values continue along the same line. If u is zero, this expression produces only p, so calling it a full line would be misleading. An affine line allows an offset p, whereas a line consisting only of tu passes through the chosen origin.

An **affine combination** of points has coefficients summing to one. For two points it is (1−t)p+tq. When 0≤t≤1 it interpolates the segment; when t lies outside that interval it extrapolates. Translating each point by b changes the combination by exactly b, since the coefficients sum to one. A coefficient sum other than one would scale that translation, making the interpreted result depend incorrectly on the point-coordinate origin.

::: worked title="Interpolation keeps the point interpretation"
For p=(1,2),q=(4,6), take t=3/4. The affine point is (1/4)p+(3/4)q=(3.25,5), lying three quarters of the way from p to q. Its displacement from p is (3/4)(q−p)=(2.25,3). At t=2 the expression gives (7,10), a point beyond q on the same line. The coefficients still sum to one, although one is negative, so this is affine extrapolation rather than a convex interpolation.
:::

A **convex combination** is an affine combination with nonnegative coefficients. The coefficient conditions are algebraic; whether they represent actual probabilities requires a separate model. In data processing, a convex mixture of feature vectors may be meaningful for continuous measurements but not for every category encoding or constrained object. A mixture of two valid numerical records need not correspond to a physically valid or observed individual.

Feature operations must retain units. Doubling a displacement measured in metres preserves its unit; adding metres to metres is meaningful. Summing coordinates measured in seconds and metres as a single physical length has no automatic interpretation. You may deliberately choose a weighted numerical geometry for learning, but document that choice and its scale factors. Algebraic compatibility and application meaning are both necessary parts of a useful calculation.

Coordinate rearrangement must be applied consistently to all compared objects. Reordering both vectors by the same permutation preserves their dot product and the standard norms later defined. Reordering only one mixes feature positions and changes the result. This distinction is a simple example of separating a change of representation from a change of the represented relationship; shape checks alone cannot detect a feature-order mismatch.

For example, one record (height,age)=(170,20) and another stored as (age,height)=(30,180) have matching array lengths but incompatible coordinate meanings. A computation pairing their first entries multiplies height by age. Reordering the second to (180,30) repairs correspondence, while choosing feature scales is still a separate task. A reliable data interface documents names and units alongside the shape tuple.

::: check
Is 2p+3q an affine point combination? When does p+tu describe a genuine line? Why does (1−t)p+tq respond correctly to shifting the coordinate origin?
:::
::: answer
The first coefficient sum is five, so it is not affine. A genuine line requires u≠0. The affine coefficients sum to one, so adding offset b to both points adds exactly b to their combination.
:::

## Dot products orthogonality angles and Cauchy–Schwarz {#s3}

The ordinary real **dot product** is $u\cdot v=\sum_{i=1}^d u_iv_i$. It is a scalar, unlike entrywise multiplication, which retains a vector of products. It is symmetric and linear in each argument: u·(αv+βw)=α(u·v)+β(u·w). Its self-product u·u is a sum of squares, nonnegative and zero exactly when every coordinate is zero. Define Euclidean length as $\|u\|_2=\sqrt{u\cdot u}$.

Vectors are **orthogonal** when u·v=0. For nonzero vectors in ordinary geometry this means perpendicular directions. The zero vector is algebraically orthogonal to every vector but has no direction or ordinary angle. That boundary shows why the dot-product predicate and a geometric angle statement have different domain conditions. In the plane, (3,4) and (4,−3) are orthogonal because twelve minus twelve is zero.

To introduce angles, an acute right-triangle cosine is the adjacent side divided by the hypotenuse. Extend it to signed directional alignment: cosine is one for the same direction, zero at a right angle, and minus one for opposite directions. Angles between nonzero vectors run from zero to 180 degrees, equivalently zero to π radians; π radians denotes a half-turn. The inverse cosine selects the angle in that range for an alignment value between minus one and one.

For two nonzero coordinate vectors, their geometric relation is $u\cdot v=\|u\|_2\|v\|_2\cos\theta$. In the plane, choose unit direction û=u/||u||₂ and its perpendicular (−u₂,u₁)/||u||₂. The signed component of v along û is v·û; dividing it by ||v||₂ is the cosine by the right-triangle interpretation. Multiplying back gives the formula. This is not a claim that every tuple of unrelated feature measurements already has a useful physical angle.

::: worked title="A unit-axis component and a perpendicular direction"
For w=(2,3) and e₁=(1,0), w·e₁=2, so its component along that unit axis is 2e₁=(2,0). The remainder (0,3) is orthogonal to e₁. For u=(3,4),v=(4,−3), both lengths are five and the dot product is zero, so their angle is 90 degrees. Projection onto a general subspace is developed in Module 12; this example needs only a coordinate unit direction.
:::

::: figure #fig-09-2
The coordinate component and perpendicular remainder form a right triangle. A dot product selects the signed component along a unit direction.
:::

The **Cauchy–Schwarz inequality** states $|u\cdot v|\leq\|u\|_2\|v\|_2$. Give a proof before dividing by lengths to form a cosine. If v=0, both sides are zero. Otherwise let t=(u·v)/(v·v). Expanding the nonnegative square length ||u−tv||₂² gives ||u||₂²−(u·v)²/||v||₂²≥0. Multiply by the positive denominator and take nonnegative square roots to get the claimed inequality.

With both vectors nonzero, equality holds exactly when u−tv=0 in that proof, meaning one is a scalar multiple of the other. Positive multiples give cosine one and negative multiples give minus one. If either vector is zero, equality also holds in the inequality, while a cosine remains undefined. Consequently a zero self-product should never be used as a divisor simply because the inequality itself includes zero vectors.

Cauchy–Schwarz guarantees the nonzero-vector cosine quotient lies in [−1,1]. In floating-point calculations a rounding error can push a value slightly outside that interval, so angle display may clamp a numerically computed quotient after the nonzero and shape checks. This is a local numerical display policy, not a new mathematical inequality. Large magnitudes or underflow can require additional numerical handling beyond our small-coordinate labs.

The dot product depends on the chosen coordinate geometry. Scaling one feature changes its contribution to products and angles; a weighted inner product can model a different geometry, but its assumptions must be stated. In AI, attention and many similarity calculations use dot products of learned feature coordinates. Their application meaning depends on how those coordinates were constructed, not only on the arithmetic fact that corresponding entries can be multiplied.

::: check
Prove the dot product of (3,4) with (4,−3) is zero. Which condition makes the cosine quotient defined, and which inequality bounds it?
:::
::: answer
The product is 3·4+4·(−3)=0. Both vectors must be nonzero for division by their lengths. Cauchy–Schwarz bounds the quotient between minus one and one; zero vectors still satisfy the inequality but have no defined quotient.
:::

## Norms metrics and the effect of feature units {#s4}

A **norm** assigns a nonnegative length to each vector, zero only at zero, satisfies ||αu||=|α| ||u||, and obeys the triangle inequality ||u+v||≤||u||+||v||. Nonnegativity alone is insufficient: a proposed length must satisfy every law. These properties ensure that scaling, cancellation, and path-length arguments behave consistently. The Euclidean formula just introduced is one norm among several useful coordinate choices.

The **Manhattan norm** is $\|u\|_1=\sum_i|u_i|$. The **maximum norm** is $\|u\|_\infty=\max_i|u_i|$. Both have positivity and scaling directly from absolute values. For Manhattan's triangle law, apply |uᵢ+vᵢ|≤|uᵢ|+|vᵢ| and sum. For the maximum norm, every coordinate sum is at most ||u||∞+||v||∞ in absolute value, so taking the maximum proves its triangle law.

For Euclidean length, expand ||u+v||₂²=||u||₂²+2u·v+||v||₂². Cauchy–Schwarz bounds the middle term by 2||u||₂||v||₂, making the result at most (||u||₂+||v||₂)². Both sides are nonnegative, so taking square roots proves the triangle inequality. This links a dot-product theorem to a norm axiom rather than assuming the ordinary diagram proves the law in every coordinate dimension.

The **squared** Euclidean length is useful in objectives but is not itself a norm. Scaling a vector by α scales its squared length by α², rather than |α|. For u=v=(1,0), the squared length of u+v is four, greater than the sum one plus one, so the norm triangle inequality fails. Calling an optimisation penalty a squared norm describes how it was constructed; it does not transfer all norm laws to that new function.

Squaring a nonnegative distance preserves ranking, which explains why nearest-neighbour code can omit a square root when only the ordering is needed. It changes the numeric distance and its metric properties, however: on the real line the squared distance from zero to two is four, exceeding the squared zero-to-one plus one-to-two distances of two. A ranking shortcut is therefore different from substituting a new metric into a proof that needs the triangle inequality.

::: worked title="The same displacement has several valid lengths"
For u=(3,4), the Manhattan length is seven, Euclidean length five, and maximum length four. Thus the distance from p=(1,2) to q=(4,6) is five under Euclidean geometry. A movement restricted to horizontal and vertical segments has shortest total coordinate travel seven, a different model. The maximum length measures the largest individual coordinate change. Each answers a different operational question rather than correcting the other two.
:::

::: figure #fig-09-3
In two coordinates the unit balls are a diamond, a circle, and a square for the Manhattan, Euclidean, and maximum norms. They contain different directions at different displayed radii.
:::

A **metric** d(p,q) is nonnegative, zero exactly when p=q, symmetric, and satisfies d(p,r)≤d(p,q)+d(q,r). A norm induces a metric d(p,q)=||q−p||. Norm positivity gives the first two conditions, homogeneity at −1 gives symmetry, and the norm triangle law applied to (q−p)+(r−q) gives the metric triangle law. The mathematical object is now a distance between points, rather than a length of one displacement vector.

Consider a query (0,0) and candidates P=(1,100),Q=(3,0), with coordinates measured in hours and centimetres. An unweighted Euclidean formula gives distances approximately 100.005 and three, selecting Q. Converting centimetres to metres changes P to (1,1), giving √2 while Q remains three, selecting P. The physical measurements have not changed; leaving the numeric metric weights fixed changed the chosen geometry.

An explicit scale vector s with positive entries defines dₛ(p,q)=sqrt(∑ᵢsᵢ²(qᵢ−pᵢ)²). This is a metric because it applies an invertible coordinate scaling then Euclidean distance. If you convert units and want to preserve an existing metric, change its scales inversely to the coordinate conversion. If a scale is zero, differences on that coordinate can be ignored even for distinct points, so the identity-of-indiscernibles metric condition can fail.

For fixed finite dimension d, the standard norms satisfy ||u||∞≤||u||₂≤||u||₁≤√d ||u||₂. The first inequalities compare a largest squared entry, the sum of squares, and the square of the absolute-entry sum. The final inequality is Cauchy–Schwarz applied to (|uᵢ|) and the all-ones vector. These bounds compare lengths, but do not make neighbour rankings identical, and their constants depend on dimension.

Choosing a norm or feature scale therefore requires a modelling reason. Similar record lengths, local paths in a grid, and maximum permitted component error can favour different measures. A numerical result is meaningful only relative to that choice and the feature semantics. Later statistical preprocessing will introduce learned scale estimates and training-only fitting; this module uses declared unit conversions so that no unlearned statistics is required.

::: check
Compute the three norms of (−3,4). Why can centimetre-to-metre conversion change an unweighted neighbour, and what happens if a metric's scale is zero on one coordinate?
:::
::: answer
The norms are seven, five, and four. Fixed numeric weights give the second coordinate a different contribution after conversion; preserving a chosen metric requires adjusting its weights consistently. A zero scale may assign zero distance to distinct points differing only in that coordinate, violating the metric condition.
:::

## Unit directions normalisation and cosine similarity {#s5}

For a nonzero vector u, **normalisation** divides by its Euclidean length: û=u/||u||₂. Norm homogeneity gives ||û||₂=1, and the divisor is positive, so the direction is preserved. For (3,4) the unit direction is (0.6,0.8). Dividing by the length is not the same as dividing by the sum of entries; negative coordinates and cancellation make that sum an unsuitable general length.

The zero vector cannot be normalised by this formula because its length is zero and it has no direction. An application must declare its handling: reject the operation, report an undefined score, or use a separately justified convention. Silently adding a small constant to the denominator changes the function being computed; it should be explained as a policy rather than presented as the original geometric definition.

For two nonzero vectors, **cosine similarity** is $\operatorname{cosim}(u,v)=(u\cdot v)/(\|u\|_2\|v\|_2)=\hat u\cdot\hat v$. It measures alignment while ignoring positive magnitude changes: replacing u with αu for α>0 leaves the score unchanged. A negative scale reverses direction and changes its sign. A score of one means parallel positive directions, not that the original vectors have equal coordinates or lengths.

::: worked title="Alignment is not a probability or an equality test"
Vectors (1,0) and (100,0) have cosine one and Euclidean distance ninety-nine. Vectors (1,0) and (−1,0) have cosine minus one, which cannot be an ordinary probability. Orthogonal nonzero vectors have cosine zero; that does not mean a missing vector or statistical independence. The result is a geometrical score under the chosen coordinates, not a calibrated confidence in a label.
:::

For unit vectors u,v, squared Euclidean distance is ||u−v||₂²=2−2u·v=2−2cosim(u,v). Therefore among unit candidates compared with a unit query, maximising cosine and minimising Euclidean distance give the same ranking, including ties. The derivation uses both unit lengths. On raw vectors, varying magnitudes add other terms and the ranking equivalence need not hold.

Normalisation can discard information an application needs. If magnitude encodes the amount of activity or a physical displacement length, replacing each vector with its direction loses that quantity. If only direction is intended, the change may be appropriate. The important decision is which variation should count as similar; neither cosine nor Euclidean distance is universally the right choice for every embedding or measurement system.

::: widget name=vectors
Drag the endpoints or use their coordinate inputs and arrow-key controls. Compare dot product, lengths, and angle, including a zero vector. The nonzero and orthogonal examples above remain usable without scripting.
:::

::: check
Normalise (3,4). What is cosim(u,−u) for nonzero u? When does cosine ranking equal Euclidean ranking?
:::
::: answer
The unit direction is (0.6,0.8). Opposite nonzero directions have cosine −1. The ranking equivalence holds when the compared query and candidates are unit vectors; it does not follow for arbitrary raw lengths.
:::

## Array shapes broadcasting and explicit implementation contracts {#s6}

A NumPy array has a shape tuple, a number of axes, and a dtype. Mathematical coordinates need a declared storage convention. We use flat arrays `(d,)` for standalone vectors, rows `(1,d)` and columns `(d,1)` when an operation requires those orientations, and tables `(B,d)` for B observations with d features. Module 10 develops matrix products; here identifying which axis represents features already prevents many faults.

For flat compatible vectors, `u*v` produces d entrywise products, while `u @ v` produces their summed dot product. Multiplying a `(B,d)` table by a length-d scale vector applies each feature scale to each row by broadcasting. `np.linalg.norm(table, axis=1)` returns B row lengths; omitting the intended axis can collapse an entire table to one aggregate quantity. The chosen axis is part of the mathematical question.

Broadcasting compares axis lengths from the right. Equal lengths match; length one can expand; a missing leading axis acts as one. Consequently `(3,1)` combined with `(3,)` produces `(3,3)`. This is legal array arithmetic, but it pairs each column entry with every flat entry. A successful call cannot tell whether those pairwise combinations were intended. The correct output shape must be specified before running it.

::: worked title="A wrong broadcast changes the number of comparisons"
Predictions [1,2,3] have shape `(3,)`, observations [1,2,4] have shape `(3,1)`. Direct subtraction gives rows [0,1,2], [−1,0,1], [−3,−2,−1]. Their nine squared entries average to 21/9=7/3. Paired differences should be [0,0,−1] in a `(3,1)` column, whose three squared entries average to 1/3. The repaired subtraction makes both operands columns; the mathematical pairing, not merely the display, changes.
:::

::: figure #fig-09-4
The incompatible intended orientations broadcast to a full grid of pairwise differences. Matching columns retain one comparison per observation.
:::

Transposing a flat `(d,)` array does not make a column; it still has one axis. Use an explicit new axis, such as `v[:,None]`, or a reshape whose entry count is checked. Turning `(d,)` into `(d,1)` changes the operation contract without changing entry values. Flattening an arbitrary table can lose the distinction between observation and feature axes, so use it only when the intended mathematical object is genuinely that one-dimensional sequence.

Arrays with more than two axes appear in images, batches, time sequences, and AI models. A shape such as `(B,T,d)` might mean batch, time, features; another application might assign different meanings. The shape tuple itself does not name those semantics. State the axis order, identify reductions and permitted broadcasts, and check output shape at the boundary of each operation. Tensor algebra and automatic differentiation later build on these explicit conventions.

Numerical checks should combine structure and values. Require matching expected shapes before `np.allclose`, since comparisons can broadcast too. Choose a tolerance appropriate to the small floating computations rather than interpreting approximate equality as an exact proof. Our loop-versus-NumPy lab compares norms at relative and absolute tolerance 10⁻¹² for small coordinates; the algebraic proofs establish the general formulas independently of that finite numerical agreement.

::: check
Predict `(4,2)*(2,)` and `(3,1)-(3,)`. Why is `v.T` insufficient for a column, and why check shapes before approximate equality?
:::
::: answer
The first broadcasts to `(4,2)` with featurewise multiplication. The second broadcasts to `(3,3)`, potentially the wrong pairing. A flat transpose keeps `(d,)`. Approximate comparison can also broadcast and conceal a structural mismatch, so assert the intended shapes first.
:::

## Common misconceptions and failure cases {#misconceptions}

| Claim | Why it fails | Repair |
|---|---|---|
| A numeric tuple automatically has physical distance | Feature units and encodings may be incompatible | State the geometry and units |
| A point and a displacement are interchangeable | Origin shifts affect point coordinates | Use differences and affine combinations appropriately |
| Dot product is entrywise multiplication | It sums the products to a scalar | Check the operator and output shape |
| A zero vector has a cosine direction | Its length is zero | Declare an undefined-case policy |
| Cosine one means equal vectors or certainty | Positive multiples share alignment; scores can be negative | Interpret the score's actual definition |
| Norm choice cannot change neighbours | Different balls and scales change comparisons | Choose and justify a metric |
| A flat transpose makes a column | It retains one array axis | Add an explicit axis |
| No exception proves correct pairing | Broadcasting can implement a different problem | Specify inputs, axes, and output shape |

## Three CPU labs {#labs}

Complete the [NumPy preparation](numpy_primer_EN.html) and install the pinned numerical requirements. These scripts use small CPU arrays, with no external data. Predict first and explain the captured output; the downloaded files are the executed sources.

### Lab A Loop calculations and NumPy checks {#lab1}

**Predict:** orthogonal dot product, three norms, displacement length, and the unit direction of (3,4). **Run:** compare loop formulas with NumPy. **Explain:** the coordinate unit-axis component and the length guard before zip. **Change:** use a negative coordinate, keep dimensions equal, and predict which norm values remain unchanged. The comparisons use explicit numerical tolerances; the lesson's proofs are separate from these finite checks.

{{LAB:lab1}}

### Lab B Units and neighbour rankings {#lab2}

**Predict:** which candidate is closest to (0,0) before and after centimetres become metres. **Run:** read Euclidean and Manhattan orders. **Explain:** the changed geometry and the stable tie order in the scaled Manhattan result. **Change:** adjust the metric weights inversely to the unit conversion and verify the original distances return. Stability of sorting makes ties reproducible, not mathematically distinct distances.

{{LAB:lab2}}

### Lab C Wrong pairing and undefined cosine {#lab3}

**Predict:** the wrong `(3,3)` difference grid, the repaired `(3,1)` discrepancies, and the zero-vector result. **Run:** compare the two mean squared differences and rejected cases. **Explain:** why NumPy can produce nan for unchecked zero division and why the guarded function reports undefined instead. **Change:** compare unit nonzero vectors and verify distance²=2−2cosim. The code is scoped to small finite coordinates; extreme floating magnitudes require further numerical handling.

{{LAB:lab3}}

## Exercises with full solutions {#exercises}

Exercises 1–12 are required; 13–14 extend the geometry. Always annotate feature meaning and array shape when using a data interpretation.

::: exercise #e1 level=1 kind=calculation minutes=5
For u=(3,4),v=(4,−3), compute u+v,2u−v, and −u.
:::
::: solution
Coordinatewise results are (7,1),(2,11),(−3,−4). Each retains two coordinates. Negative scaling reverses the displacement direction.
:::

::: exercise #e2 level=1 kind=calculation minutes=5
For p=(1,2),q=(4,6), compute (1/4)p+(3/4)q and identify whether it is affine and convex.
:::
::: solution
The point is (3.25,5). Coefficients sum to one, so it is affine; both are nonnegative, so it is convex and lies on the segment. Its displacement from p is (2.25,3).
:::

::: exercise #e3 level=1 kind=calculation minutes=5
Find q−p for p=(−1,3),q=(2,−1), then add offset (10,5) to both and recompute.
:::
::: solution
The displacement is (3,−4). Shifted points (9,8),(12,4) give the same difference. Position coordinates change while a common translation cancels in the displacement.
:::

::: exercise #e4 level=1 kind=conceptual minutes=5
Explain why 2p+3q is not an origin-independent affine point construction. Does p+tu define a line when u=0?
:::
::: solution
A common offset b changes 2p+3q by 5b, not b, because coefficients sum to five. The result lacks the affine point transformation rule. For u=0, p+tu is always p, a single point rather than a line.
:::

::: exercise #e5 level=2 kind=proof minutes=14
Prove u·(αv+βw)=α(u·v)+β(u·w) for equal-dimensional real vectors, and prove u·u=0 implies u=0.
:::
::: solution
Expand the finite sum ∑uᵢ(αvᵢ+βwᵢ), distribute in each coordinate, and split into α∑uᵢvᵢ+β∑uᵢwᵢ. A self-product is ∑uᵢ²; all terms are nonnegative, so a zero sum forces each term zero and each coordinate zero. The result uses matching dimensions and real coordinates.
:::

::: exercise #e6 level=2 kind=proof minutes=14
Prove Cauchy–Schwarz using ||u−tv||₂². Include v=0 and the equality condition for both nonzero vectors.
:::
::: solution
If v=0 both sides vanish. Otherwise choose t=(u·v)/||v||₂². Expansion gives 0≤||u||₂²−(u·v)²/||v||₂², hence (u·v)²≤||u||₂²||v||₂². Nonnegative square roots give the absolute-value inequality. With nonzero vectors equality requires ||u−tv||₂²=0, so u=tv; scalar dependence also directly gives equality.
:::

::: exercise #e7 level=2 kind=proof minutes=14
Derive the Euclidean norm's triangle inequality from Cauchy–Schwarz, then explain why d(p,q)=||q−p||₂ is symmetric and satisfies a metric triangle law.
:::
::: solution
Expand ||u+v||₂² and bound 2u·v by 2||u||₂||v||₂. This gives at most (||u||₂+||v||₂)², and nonnegative square roots give the norm law. Symmetry follows because ||−x||₂=||x||₂. Apply the norm triangle to r−p=(q−p)+(r−q) to obtain the metric law. Positivity and equality only at zero complete the metric conditions.
:::

::: exercise #e8 level=2 kind=application minutes=10
For query (0,0),P=(1,100),Q=(3,0), compare Euclidean neighbours before and after the second coordinate is multiplied by 0.01. How would you preserve the original metric?
:::
::: solution
Initially distances √10001≈100.005 and three select Q. After scaling, P=(1,1) has √2 while Q remains three, selecting P. To preserve the original numerical metric, scale the new second coordinate by weight one hundred inside the norm, undoing the coordinate conversion. Choosing unweighted metres instead deliberately changes the geometry.
:::

::: exercise #e9 level=2 kind=application minutes=10
For a `(4,2)` table of four two-feature records, identify the shape of feature scaling by `(2,)` and row norms with axis=1. Explain why array ndim is not the feature dimension.
:::
::: solution
Scaling broadcasts to `(4,2)`, applying each of the two scale values to its feature column. Row norms reduce the feature axis and yield `(4,)`. The table's ndim is two because it has observation and feature axes; each record has two coordinates. These counts happen to agree here but refer to different things, as a `(4,3)` table shows.
:::

::: exercise #e10 level=2 kind=application minutes=10
Prove for unit u,v that ||u−v||₂²=2−2cosim(u,v). Explain the ranking equivalence and why cosine one is not a raw-vector equality test.
:::
::: solution
Expand to ||u||₂²+||v||₂²−2u·v=2−2u·v. Unit lengths make u·v=cosim. Minimising the distance or its square therefore maximises cosine among unit candidates. Raw (1,0),(100,0) have cosine one but differ greatly; the equality test needs matching coordinates, not only alignment.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=10
Predictions `(3,)` and observations `(3,1)` are subtracted without reshaping. Find the resulting shape and explain the displayed mean squared differences for [1,2,3] and [1,2,4].
:::
::: solution
Right-aligned shapes broadcast to `(3,3)`, producing rows [0,1,2],[−1,0,1],[−3,−2,−1]. Squared sum 21 over nine entries gives 7/3. Paired column differences [0,0,−1] give 1/3 over three entries. Make both operands `(3,1)` or both `(3,)` for the intended pairing and verify shape before comparing values.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=10
A similarity function normalises every vector, calls cosine a probability, and treats a flat transpose as a column. Diagnose all three assumptions with concrete cases.
:::
::: solution
Zero has zero norm and cannot be normalised by division, so specify an undefined-case policy. Opposite vectors have cosine −1, disproving probability interpretation; even positive scores are not automatically calibrated probabilities. A flat `(d,)` transpose remains `(d,)`; use an explicit new axis to obtain `(d,1)` when required.
:::

::: exercise #e13 level=3 kind=proof minutes=15
Extension: prove ||u||∞≤||u||₂≤||u||₁≤√d ||u||₂ for real d-coordinate vectors. State why this does not imply equal nearest-neighbour rankings.
:::
::: solution
A largest squared entry is at most the sum of squares, giving the first bound after square roots. The square of ∑|uᵢ| equals ∑uᵢ² plus nonnegative cross terms, giving the second. Cauchy–Schwarz between (|uᵢ|) and d ones gives the final bound. Bounds compare magnitudes but do not preserve every ordering: from the origin in two dimensions, (3,0) and (2,2) have Manhattan distances three,four but Euclidean distances three,√8, reversing their order.
:::

::: exercise #e14 level=3 kind=application minutes=20
Extension: a scale vector s=(1,0) defines dₛ(p,q)=||s*(q−p)||₂. Show the failed metric condition, and explain why positive coordinate scales avoid that failure.
:::
::: solution
Points p=(0,0),q=(0,5) differ, but their scaled displacement is zero and the proposed distance is zero. Identity of indiscernibles fails. With every scale positive, the diagonal scaling is injective, so a zero scaled displacement implies every original difference is zero. The Euclidean positivity, symmetry, and triangle laws then transfer, yielding a genuine metric.
:::

## Self-check quiz {#quiz}

Questions 1–9 are scored automatically. Question 10 is written and self-reviewed.

```quiz
? What stays unchanged when the same offset is added to two points?
- [x] Their displacement difference
- [ ] Both individual coordinate tuples
- [ ] Every arbitrary weighted point sum
> The common offset cancels in q−p. Coordinates change, and only affine coefficient sums give the appropriate one-offset point transformation.

? Which coefficients define a convex combination?
- [ ] Any real coefficients
- [x] Nonnegative coefficients summing to one
- [ ] Coefficients whose product is one
> The sum gives an affine combination and nonnegativity gives convexity. Arbitrary coefficients are linear combinations; their product is irrelevant.

? What is (3,4)·(4,−3)?
- [ ] (12,−12)
- [ ] 25
- [x] 0
> Dot products sum pairwise products, twelve minus twelve. The tuple is entrywise multiplication; twenty-five is either vector's squared Euclidean length.

? Which norm lengths does (3,4) have in order 1,2,∞?
- [x] 7,5,4
- [ ] 5,7,4
- [ ] 4,5,7
> Absolute-entry sum is seven, square-root sum of squares five, and largest absolute coordinate four. The alternatives swap the definitions.

? When is the ordinary cosine quotient defined?
- [ ] For every pair, including zero
- [x] For matching nonzero vectors
- [ ] Only for vectors of length one
> A zero vector makes the product of lengths zero. Unit normalisation is useful but not required; both original vectors may have arbitrary positive length.

? What does cosine one establish?
- [ ] Identical raw coordinate vectors
- [ ] A label probability of one
- [x] Positive parallel alignment under the chosen geometry
> Positive multiples share cosine one while differing in length. A geometric alignment score is not automatically a probability.

? What can changing one feature's units do to an unweighted distance?
- [x] Change the metric and nearest-neighbour ranking
- [ ] Never change a numerical result
- [ ] Turn every cosine into a probability
> Fixed weights assign different contributions after a coordinate conversion. Metric preservation needs consistent weight conversion; probability does not follow from units.

? What is the broadcast shape of `(3,1)+(3,)`?
- [ ] `(3,1)` automatically
- [x] `(3,3)`
- [ ] An exception in every case
> The trailing shapes align as `(3,1)` and `(1,3)`, yielding pairwise combinations. This valid operation may still be the wrong mathematical pairing.

? Why check shapes before np.allclose?
- [ ] It proves every real-number identity exactly
- [ ] A flat transpose already guarantees matching columns
- [x] The comparison can broadcast and hide a structural mismatch
> Shape is part of the contract. Approximate agreement is finite numerical evidence, and flat transpose does not add an axis.
```

<div class="free-response" data-free-response data-key="math-series:m09:q10">
<label for="q10-response">10. Explain how a unit conversion and a successful broadcast can each change the mathematical comparison. Include the nearest-neighbour example and the intended shapes.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State the geometry, coordinate scale, paired operation, and repair."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I checked both modelling errors and gave their concrete repairs.</label>
</div>

::: answer
Unweighted distances from (0,0) to P=(1,100),Q=(3,0) choose Q. Scaling the second coordinate by 0.01 makes P distance √2 and Q distance three, choosing P because the numeric geometry changed. Preserve an existing metric by adjusting its feature weight inversely. Subtracting `(3,)` predictions and `(3,1)` observations produces `(3,3)` pairwise comparisons instead of three paired differences. Make both columns or both flat and check the output shape. Arithmetic can be correct for an unintended question, so the answer must specify units, axis semantics, and the intended comparison.
:::

## Reading with a purpose {#reading}

Use analytic-geometry selections from [Mathematics for Machine Learning](https://mml-book.com/), the authors' book companion, to compare dot products, lengths, and projections. Consult [NumPy's basic array guide](https://numpy.org/doc/1.26/user/absolute_beginners.html) and [broadcasting rules](https://numpy.org/doc/1.26/user/basics.broadcasting.html) for the storage operations used by the labs. The lesson's proofs and examples are original; numerical checks do not replace the general arguments.

| When | Selection and question |
|---|---|
| Session 1 · 20 minutes | Coordinate vectors and geometry: which objects are points, and which are displacements? |
| Session 4 · 20 minutes | NumPy shapes and broadcasting: how do right-aligned lengths determine the output axes? |

Separate coordinate geometry from programming terminology such as array ndim. A word used by both subjects may refer to different counts.

## Retrieval exit task and next step {#summary}

Without notes, compute a vector combination, prove Cauchy–Schwarz, derive the Euclidean triangle law, and explain the zero-vector exception. Give a metric-changing unit conversion and a wrong-shaped operation that runs without an exception.

**Exit task:** use u=(−3,4),v=(3,4). Compute u·v=7, both Euclidean lengths five, cosine 7/25, and unit directions (−0.6,0.8),(0.6,0.8). A two-row table of these vectors has shape `(2,2)`; row norms yield `(2,)`. Explain why a three-row two-feature table would still contain two-coordinate vectors, not three-coordinate ones.

**Ready to move on:** you can state coordinate and shape assumptions before applying a formula. The next linear-algebra lesson treats matrices as maps and solves linear systems. See the [course overview](index.html) for availability.

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| Scalar / vector / point | Scale number / displacement or tuple / location | 标量、向量、点 |
| Linear / affine / convex combination | Arbitrary coefficients / sum one / additionally nonnegative | 线性、仿射、凸组合 |
| u·v / orthogonal | Sum of coordinate products / zero dot product | 点积、正交 |
| Cauchy–Schwarz | Bound on a dot product by two lengths | 柯西–施瓦茨不等式 |
| Norm / metric | Vector length / point distance satisfying laws | 范数、度量 |
| Unit direction / cosine similarity | Normalised nonzero vector / directional alignment | 单位方向、余弦相似度 |
| Shape / axis / broadcasting | Storage lengths / coordinate index dimension / compatible expansion | 形状、轴、广播 |
| Feature scale / pairing | Declared geometry weights / corresponding-record comparison | 特征尺度、配对 |
