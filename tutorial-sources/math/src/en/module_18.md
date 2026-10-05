## Derivatives become linear maps with shapes {#start}

A scalar training objective depends on many parameters, often through repeated computations and batches of records. Its derivative must account for every dependency, distinguish a partial observation from a whole-input approximation, and preserve array shapes. This lesson develops total differentials, Jacobians, Hessians and matrix gradients before implementing the chain rule as automatic differentiation.

**Retrieval check:** recall [Module10](module_10_EN.html#s1) matrix multiplication, transposes and batch shapes, and [Module16](module_16_EN.html#s1) local models, chain rules and nondifferentiable boundaries. The NumPy labs use the course's pinned baseline; the scalar reverse engine needs only standard-library Python.

## Partials directional derivatives and level sets {#s1}

For a scalar f:Rⁿ→R on an open domain, the partial derivative with respect to coordinate i at a is the limit[f(a+h e_i)−f(a)]/h, where e_i is that coordinate's unit vector. Other coordinates are held fixed. Partial existence only checks a coordinate line. It does not automatically certify continuity for simultaneous changes or a first-order approximation in every direction. A function's multivariable domain still matters: a log of a coordinate combination or a zero denominator can exclude nearby paths.

For a vector v, the directional derivative is D_v f(a)=lim_{t→0}[f(a+tv)−f(a)]/t when this finite limit exists. A unit v describes rate per unit distance; a nonunit v also scales the speed along the path. The two-sided definition here allows both signs of t. One-sided directional derivatives at a boundary or for a nonsmooth function are differently qualified objects. The symbol D_v is not a guarantee that all these limits form one linear map in v.

A level set consists of inputs having the same scalar output. Where total differentiability holds, its gradient points in the direction of steepest first-order Euclidean increase and is perpendicular to differentiable level-set paths with nonzero tangent. These claims will follow from the differential and chain rule, rather than from a contour drawing alone. Different feature units change the Euclidean geometry unless a metric is specified; use the gradient under the chosen coordinate and inner-product convention.

::: worked title="Partials and a directional rate of an elliptical objective"
For f(x,y)=x²+3y² at(1,1), partials are2 and6. Along unit v=(.6,.8), the directional rate is2(.6)+6(.8)=6. The largest unit-direction rate is√40, attained along(2,6)/√40. The level set through the point is x²+3y²=4; tangent directions satisfy2v₁+6v₂=0. A direction's length and orientation both affect its rate, so v=(3,4) would give30 instead of six.
:::

Partials can miss discontinuity. Define f(x,y)=xy/(x²+y²) away from the origin and f(0,0)=0. Both coordinate-axis restrictions are zero, giving both partials zero at the origin. Along x=y=t≠0, the output is1/2, so continuity fails. Since differentiability implies continuity, those existing partials cannot establish total differentiability. Lab1 samples these paths to illustrate the already exact counterexample.

Even continuity and every directional derivative can be insufficient. Set g(x,y)=x³/(x²+y²) away from zero, g(0,0)=0. Its magnitude is≤|x|≤‖(x,y)‖, so it is continuous at zero. For nonzero v, the directional quotient is v₁³/(v₁²+v₂²). Axis rates are one and zero, but along v=(1,1) the rate is1/2 rather than the linear candidate one. The map of directions is not linear, so no single total derivative can represent it. Testing many straight lines still does not replace the uniform small-vector remainder requirement below.

::: figure #fig-18-1
Axis restrictions can hide a diagonal discontinuity. Total differentiability requires one local linear map for all small-vector approaches.
:::

::: check
Do existing coordinate partials prove continuity? Do all directional derivatives necessarily equal a dot product with one gradient? Why specify a unit direction for a geometric rate?
:::
::: answer
The xy/(x²+y²) counterexample defeats continuity. The continuous x³/(x²+y²) example has nonlinear direction rates, defeating a total linear model. A nonunit direction changes path speed, so the rate is also multiplied by its length.
:::

## Total differentials and a column-gradient convention {#s2}

A scalar f is differentiable at a when there exists a linear functional L with f(a+h)=f(a)+L(h)+r(h), where r(h)/‖h‖→0 as the whole vector h→0. The limit covers every small-vector path, not just coordinate directions. Every linear functional on finite-dimensional Euclidean space can be written gᵀh: expand h in coordinate basis, let g_i=L(e_i), and use linearity. The coefficients equal existing partials because restricting the remainder to one coordinate line recovers their limits.

We use the **column gradient** ∇f(a) of shape n×1, so the differential is df=∇f(a)ᵀdx, a scalar. The row derivative mapping inputs to a scalar is its transpose, shape1×n. A NumPy flat array of shape(n,) can represent those coefficients in code but is neither an explicit row nor column. Annotate the mathematical convention and each operation's stored shape; otherwise a transpose error can hide when square examples happen to fit.

For a vector F:Rⁿ→Rᵐ, differentiability means F(a+h)=F(a)+Jh+r(h), with ‖r(h)‖/‖h‖→0. The Jacobian J has shape m×n: row i contains derivatives of output i with respect to all inputs. Its entries are J_{ij}=∂F_i/∂x_j. Thus dF=J dx. Componentwise scalar differentiability is equivalent in finite dimensions because a finite collection of vanishing remainders also vanishes in vector norm. The Jacobian is a linear map between input and output spaces, rather than a coordinate list with an arbitrary orientation.

Continuous partial derivatives in a neighbourhood supply a sufficient differentiability condition. For a scalar function, change coordinates one at a time and telescope the total increment. Apply the one-variable mean value theorem to each change. The resulting coefficients are coordinate partials at intermediate points approaching a. Subtract the partials at a; continuity makes every coefficient error≤ε for all sufficiently small h. The total remainder is at most εΣ|h_i|≤ε√n‖h‖, so its ratio vanishes. This proves the C¹ sufficient condition. It is not a necessary condition; a function can be differentiable at one point without having a continuous derivative throughout a neighbourhood.

::: worked title="Reading a Jacobian as an input-to-output map"
Let F(x,y)=(x²y,sin x+y²). Its Jacobian is[[2xy,x²],[cos x,2y]], shape2×2. At(.7,−.4) it is approximately[[-.56,.49],[.764842,−.8]]. Applied to v=(.6,.8), Jv=(.056,−.181095). This predicts the first-order output increment tJv along input perturbation tv; the true increment also has a remainder small relative to|t|. Columns describe separate input-coordinate responses, while rows describe separate output gradients.
:::

Total differentiability implies every directional derivative equals ∇fᵀv and implies continuity: a bounded linear map sends h→0 to zero and the remainder does too. For unit v, Cauchy–Schwarz gives ∇fᵀv≤‖∇f‖, with equality in the gradient direction if the gradient is nonzero. If it is zero, every first-order unit-direction rate is zero; higher-order responses may remain. Along a differentiable level-set path c(t), the chain rule yields ∇f(c(t))ᵀc′(t)=0, proving the normal interpretation under the specified assumptions.

The differential is a mathematical first-order mapping, not a literal infinitesimal stored by Python. It can be applied to a specified finite perturbation as an approximation, with a remainder whose size must be controlled separately. Scaling coordinates or changing the metric changes which gradient vector represents the same differential. In a weighted inner product with positive-definite M, the representing gradient is M⁻¹ times the Euclidean gradient. The differential itself retains the same scalar action; geometric steepest directions depend on the chosen notion of length.

An explicit example separates differentiability at a point from C¹ regularity nearby. Define s(x)=x²sin(1/x) for nonzero x and s(0)=0. Its quotient at zero is x sin(1/x), bounded in magnitude by|x|, so s′(0)=0. For nonzero x, the rules give s′(x)=2x sin(1/x)−cos(1/x), which oscillates near zero. The function f(x,y)=s(x)+y² is differentiable at the origin because its magnitude is at most x²+y²=‖(x,y)‖², giving a zero linear map and a vanishing remainder ratio. Its derivative is not continuous nearby. Thus the neighbourhood C¹ condition is useful and sufficient, while demanding it as the definition would exclude valid pointwise differentiability.

::: check
For F:R⁴→R³, what is the Jacobian shape? For scalar f:R⁴→R, what are column-gradient and row-derivative shapes? Does C¹ mean partial existence only at the centre?
:::
::: answer
J is3×4, ∇f is4×1 and the row derivative1×4. C¹ includes partial existence and continuity in a neighbourhood, providing the uniform coefficient control missing from isolated partial existence.
:::

## Jacobian composition JVP and VJP {#s3}

For differentiable F:Rⁿ→Rᵐ and G:Rᵐ→Rᵖ with compatible local domains, the chain rule is J_{G∘F}(a)=J_G(F(a))J_F(a), shape(p×m)(m×n)=p×n. The inner map acts first on input increments, so its Jacobian is on the right. This order matches the matrix composition rule already established in Module10. A reversed product may be undefined or describe a different map even when square shapes permit it.

The proof uses local remainders. Write ΔF=J_Fh+r_F(h), with ‖r_F‖/‖h‖→0. In particular ‖ΔF‖/‖h‖ is bounded near zero. The outer increment is J_GΔF+r_G(ΔF). After substitution, J_G r_F is negligible relative to‖h‖; the second remainder is bounded by[‖r_G(ΔF)‖/‖ΔF‖][‖ΔF‖/‖h‖], tending to zero when ΔF≠0, and is zero directly when ΔF=0. Thus the product is the total derivative. This is the same safeguard against dividing by a vanished inner increment used for the scalar chain rule.

::: worked title="Pulling a scalar objective back through a vector map"
Use F from Section2 and G(u,v)=u²+3v. The output column gradient is q=(2u,3). The input gradient is J_Fᵀq, not J_Fq under our convention. At(.7,−.4), u=−.196, giving input gradient approximately(2.514047,−2.59208). Directly differentiating (x²y)²+3(sin x+y²) gives(4x³y²+3cos x,2x⁴y+6y), agreeing with the pullback. Each output dependency contributes to its appropriate input coefficient.
:::

A **Jacobian–vector product** or JVP computes Jv for an input direction v, returning an output perturbation direction of length m. A **vector–Jacobian product** or VJP is traditionally written qᵀJ for an output row seed qᵀ. In our column convention its transpose is Jᵀq, an input adjoint vector of length n. These two equivalent notations must not be confused with multiplying J by an output seed. The seed specifies which output combination is being differentiated; a vector output does not have one unique gradient without that choice.

A rectangular example exposes shape mistakes that a square Jacobian can hide. Take F(x,y)=(xy,x²,y²) and L(u,v,w)=u+2v−3w. At(1,2), J_F has rows(2,1),(2,0),(0,4), so its shape is3×2. The output seed is q=(1,2,−3), length three. The valid pullback J_Fᵀq is(6,−11), length two, agreeing with derivatives of xy+2x²−3y². Trying J_Fq has incompatible inner dimensions. A direction v of length two instead produces three output rates through J_Fv. Writing shapes before numerical values makes the distinction visible without relying on an accidental dimension error later in a program.

Forward mode propagates an input tangent through each local JVP. Reverse mode propagates an output adjoint through each local transpose-Jacobian action. For a scalar output with many inputs, one reverse pass returns all input coefficients for seed one. Obtaining a full m×n Jacobian can require n input-basis forward passes or m output-basis reverse passes; neither mode automatically produces every entry in the cost of one scalar path. Special structure can alter practical costs, but the shape and seed contract remains.

For L(y) scalar and y=Ax, dy=A dx and dL=qᵀA dx, so the pullback is Aᵀq. For a composed nonlinear map, evaluate local Jacobians at the actual forward values before reversing them. Reusing a derivative from a different input or changing stored forward values before backward propagation can invalidate the result. Automatic differentiation systems store or recompute the required intermediate information; the chain rule explains why it is needed.

Shared inputs require sums of contributions. If a variable feeds two outputs or two parents, its differential influences each path, and the final scalar coefficient adds those influences. Reverse traversal must wait until all downstream contributions have reached a shared node before applying its local backward rule. A unique-node topological order ensures this schedule; treating a graph as a tree by recursively backpropagating without accumulation can lose paths or propagate a shared total multiple times.

::: figure #fig-18-2
Forward tangents move with Jacobian products; reverse adjoints move with transpose products and add at shared inputs.
:::

::: check
If F:R²→R³ and G:R³→R⁴, what multiplication composes their derivatives? What seed and shape does a reverse scalar pass use? Why are contributions added at a shared input?
:::
::: answer
(4×3)(3×2)=4×2 in outer-times-inner order. A scalar output uses seed one and returns a two-component column adjoint through the transposed composition. The input affects every path, so linear differential contributions sum.
:::

## Hessians mixed partials and second-order models {#s4}

For scalar f, the Hessian is the Jacobian of its column gradient, shape n×n. Entry H_{ij} is the derivative of gradient component i with respect to coordinate j. If second partials are continuous in a neighbourhood, mixed derivatives commute and H is symmetric. One justification considers the four-corner increment over a small coordinate rectangle and applies the mean value theorem in both orders. Dividing by the rectangle's area and taking both widths to zero gives equal limits by mixed-partial continuity. State that hypothesis rather than assume every twice-written partial must agree.

Without continuity, mixed partials can differ. For f(x,y)=xy(x²−y²)/(x²+y²) away from zero and f(0,0)=0, f_x(0,y)=−y while f_y(x,0)=x. Hence at zero the derivative of f_x with respect to y is−1, while the derivative of f_y with respect to x is1. The smooth symmetry theorem's neighbourhood hypothesis fails. This is not a contradiction; it identifies the boundary of a theorem that automatic symbolic rearrangement might hide.

For C² f, the second-order local model is f(a+h)=f(a)+∇f(a)ᵀh+(1/2)hᵀH(a)h+o(‖h‖²). To derive it, restrict to the scalar path g(t)=f(a+th). Chain rules give g′(t)=∇f(a+th)ᵀh and g″(t)=hᵀH(a+th)h. One-variable Taylor between zero and one provides an intermediate Hessian along that segment. Continuity of H makes its difference from H(a) vanish uniformly as h→0, so the quadratic remainder divided by‖h‖² tends to zero. This also shows why one fixed coordinate-axis expansion is weaker than the multivariable model.

Listing existing second coordinate partials is weaker than proving the gradient itself has a total derivative. The unequal-mixed-partial example above supplies such entries but does not supply the smooth second-order map required by this Taylor argument. Its failure should therefore be described as a failure of the hypotheses, rather than inserting a nonsymmetric entry table into a C² theorem. In numerical work, a nearly nonsymmetric estimate can also arise from finite differences or implementation errors even for a smooth objective. Identify the mathematical regularity first, then assess the estimator and array convention separately.

::: worked title="A scalar objective with coupled curvature"
Let f(x,y)=x²y+exp(y). Gradient is(2xy,x²+exp(y)), Hessian[[2y,2x],[2x,exp(y)]]. At(.7,−.4), gradient(−.56,1.16032) and Hessian approximately[[-.8,1.4],[1.4,.67032]]. The off-diagonal terms record coupled changes. For a displacement(h₁,h₂), the quadratic correction is y h₁²+2x h₁h₂+exp(y)h₂²/2 at the centre. Dropping the mixed term changes predictions even when both pure curvatures are retained.
:::

At an interior differentiable stationary point the gradient must be zero, by applying scalar Fermat along every coordinate. With C² regularity and positive-definite Hessian, the quadratic term dominates the smaller remainder and gives a strict local minimum; negative definite gives a maximum. An indefinite Hessian supplies positive and negative curvature directions and therefore a saddle. A positive-semidefinite Hessian with zero directions is inconclusive without more information. At zero, x⁴+y⁴ has a strict minimum, while x⁴−y⁴ is a saddle; both have zero Hessian. These are local classifications, with global optimisation developed next module.

For a symmetric Hessian, the directional second derivative along v is vᵀHv. Hessian–vector multiplication Hv also describes first-order change of the gradient along v. Computing such products can avoid storing all n² entries, which matters for large models. It still differentiates a gradient under sufficient smoothness; at a kink the classical Hessian may not exist. A finite difference of gradients is a separate estimator with its own step and rounding errors.

The positive-definite local-minimum test requires a uniform quadratic margin, not only positive values in a few sampled directions. The minimum of vᵀHv over the unit sphere is some λ>0 by compactness and positivity. Thus hᵀHh≥λ‖h‖² for all h. The little-o remainder can be bounded by λ‖h‖²/4 in a sufficiently small neighbourhood, leaving the stationary function increment at least λ‖h‖²/4 for every nonzero h there. This completes the domination argument behind the strict local test and explains why zero curvature directions prevent this certificate.

::: figure #fig-18-3
Gradient and Hessian have different roles: a vector of first-order sensitivities and a square map of their changes, including mixed terms.
:::

::: check
When does Hessian symmetry follow here? Does a zero Hessian classify a stationary point? What is the shape and meaning of Hv?
:::
::: answer
Continuous second partials in a neighbourhood suffice. Zero curvature is inconclusive, as the fourth-power examples show. Hv has length n and is the derivative of the gradient in direction v, while vᵀHv is a scalar directional curvature.
:::

## Matrix gradients through differentials {#s5}

For vectors, collect the coefficient of dx in df=gᵀdx. For a matrix A, use the Frobenius inner product: df=Σ_{ij}(∇_A f)_{ij}dA_{ij}=tr((∇_A f)ᵀdA). The gradient has the same shape as A. Here tr sums a square matrix's diagonal. The identity tr(BC)=tr(CB) for compatible rectangular factors follows by writing both asΣ_{ij}B_{ij}C_{ji}; cyclic rearrangements can then collect a matrix differential while preserving valid dimensions.

For fixed b, f(x)=bᵀx gives df=bᵀdx and gradient b. For a general square A, f(x)=xᵀAx gives df=dxᵀAx+xᵀA dx=[(A+Aᵀ)x]ᵀdx. Thus the gradient is(A+Aᵀ)x, reducing to2Ax only when A is symmetric. The antisymmetric part contributes zero to the quadratic scalar and therefore no gradient. A formula2Ax for an arbitrary nonsymmetric A is not repaired merely because its output shape fits.

::: worked title="Least-squares gradients with the residual shape intact"
Let X have shape B×d, w a d-component column and y a B-component column. Residual r=Xw−y is B×1. For L=‖r‖², dL=2rᵀdr=2rᵀX dw, so ∇_wL=2Xᵀr of shape d×1. Differentiating again gives Hessian2XᵀX. With X=[[1,0],[1,1],[1,2]],y=(1,2,2),w=(1,0),r=(0,−1,−1), the gradient is(−4,−6). A half-squared loss divides that gradient by two; a mean-squared loss divides it by B.
:::

Loss reductions are mathematical definitions. For L=(1/B)Σr_i², gradient is(2/B)Xᵀr. If outputs have o columns and “mean” averages all B·o scalar entries, denominator is B·o rather than B. If it instead averages rows after summing output errors, denominator is B. These objectives differ by a factor o. Report the exact reduction; silently changing it alters derivatives and the effective scale of subsequent updates.

For matrix predictions XW with X:B×d,W:d×o,Y:B×o, write R=XW−Y. The half-squared Frobenius objective L=(1/2)‖R‖_F² has differential tr(RᵀdR), with dR=X dW+dX W−dY. Collecting coefficients gives ∇_W L=XᵀR of shape d×o, ∇_X L=R Wᵀ of shape B×d, and ∇_Y L=−R of shape B×o. Verify each by a differential or indexed sum before implementing it. The residual and gradient arrays need explicit output columns to prevent accidental broadcasting with a flat target.

Adding a shared bias b with mathematical shape o×1 gives prediction XW+1bᵀ. Its differential repeats db across B rows, so the bias gradient is Rᵀ1 for the half-squared objective, equivalently a sum of output adjoints over the batch. In NumPy b often has shape(o,), with backward sum(axis=0) returning that same stored shape. Broadcasting in the forward operation corresponds to summation in the backward operation because one parameter influences every replicated entry. Overwriting the bias with the last row's contribution drops the others.

These derivations also apply to a two-layer network. With Z=XW₁+1b₁ᵀ,H=tanh(Z),P=HW₂+1b₂ᵀ, and output adjoint G=∂L/∂P, gradients are HᵀG for W₂ and row sums of G for b₂. Hidden adjoint is G W₂ᵀ; multiply elementwise by1−H² for Z's adjoint D. Then W₁ gradient is XᵀD and b₁ gradient sums D over rows. Matrix products and elementwise products serve different roles and cannot be exchanged. The lab annotates every shape and verifies every parameter entry numerically at a smooth point.

For the lab's batch of three records with two features, three hidden units and one output, W₁ is2×3, Z and H are3×3, W₂ is3×1, and P,G are3×1. The hidden pullback G W₂ᵀ is3×3; XᵀD is2×3, matching W₁. The stored biases have shapes(3,) and(1,), recovered by row sums. These dimensions deliberately make a missing output-weight transpose fail instead of silently multiplying square arrays. The loss is a mean over three scalar residual entries, so G=2R/3. Checking the stated loss before backward propagation is as necessary as checking the transposes: a correctly shaped gradient can still have the wrong reduction factor.

::: check
Why is a matrix gradient the same shape as its parameter? What is the general quadratic gradient? Why does a broadcast bias sum over rows? Does a mean over all output entries always divide by B alone?
:::
::: answer
It supplies one coefficient for each parameter entry in the Frobenius differential. The quadratic gradient is(A+Aᵀ)x. Every repeated row contributes to the same bias, so contributions add. An all-entry mean divides by B·o; a row mean of summed outputs is a different definition.
:::

## Automatic differentiation and shared-node accumulation {#s6}

Automatic differentiation applies local derivative rules to the executed computation graph. It is distinct from finite differences, which perturb inputs and divide output differences, and from symbolic differentiation, which constructs algebraic expressions. Forward mode carries values and tangents; reverse mode first records forward values and then propagates adjoints in reverse dependency order. Both evaluate chain-rule derivatives of the selected mathematical primitive operations, with ordinary numerical rounding in those evaluations.

The literal floating-point input-output map includes discrete rounding behaviour; AD normally differentiates the intended real primitive formulas evaluated at stored values, rather than the staircase map of every rounding instruction. Thus “automatic” does not imply exact real arithmetic, eliminate conditioning, or establish differentiability across a branch. If a program selects a branch, the returned derivative describes that executed path under the primitive conventions. Thresholds and kinks need separate interpretation; a chosen ReLU backward value at zero remains a convention.

::: worked title="A repeated intermediate collects every reverse path"
Let u=x*x and z=u*u+u+x. At x=2, u=4 and z=22. Reverse seed z̄=1 gives ū=2u+1=9: two multiplication edges plus the addition path. Then x̄=2x ū+1=37, including both x inputs of its multiplication and the direct path. Traversing a shared node once does not mean keeping only one edge contribution. The derivative of the expanded polynomial x⁴+x²+x is4x³+2x+1, confirming37.
:::

::: figure #fig-18-4
The repeated-square graph shows forward values and reverse adjoints. Shared intermediates accumulate contributions before their local rule runs.
:::

::: widget name=adjoints
Vary x and the output seed for z=(x*x)²+x*x+x. Inspect the forward graph and every reverse contribution, including a zero or negative seed.
:::

The lab engine stores parents and a local backward closure for each node. It first creates a topological list containing every reachable node once. Before a fresh backward pass it resets all adjoints, seeds the output, and traverses the reversed list. Each closure uses += for every parent edge, including when both operands are the same object. This ensures all downstream contributions are present before a shared node propagates its accumulated adjoint. Repeated passes with no reset would instead accumulate old and new requests, which is useful only when deliberately specified.

A seed other than one computes a scalar VJP scaled by that seed. At x=2, seed two returns74 and seed zero returns zero, while the ordinary derivative remains37. For multiple outputs, a vector seed specifies a weighted output combination. Gradients are therefore answers to a defined differentiated quantity, not context-free attributes permanently attached to a variable. Model state, graph reuse and output reduction must be included in that specification.

Gradient checks compare an analytic or AD result with central differences at selected smooth points and a range of meaningful step sizes. Use absolute and relative tolerances suitable for magnitude, and inspect shapes before comparing entries. An erroneous formula can agree at a symmetric or zero-residual point, so choose nontrivial values and perturb each parameter or independent directions. The network lab checks every small parameter entry, then explicitly exhibits a transpose fault, lost batch contribution and missing mean factor. Passing these checks supports that implementation on those examples; the differential derivation supplies the general formula.

Reverse mode needs stored or recomputed intermediate values and a sound graph schedule. Its practical memory and execution cost depend on the computation, not only the parameter count. Large systems can use checkpointing or Hessian–vector products, but those engineering choices retain the same chain and accumulation contracts. This foundation is sufficient to assess a manual backward pass and interpret what an automatic one is calculating before studying optimisation.

::: check
Does AD estimate derivatives by choosing h? Why must a shared-node adjoint use addition? What does output seed zero return, and does it change the function's derivative?
:::
::: answer
AD applies primitive chain rules rather than a finite perturbation quotient. Every path contributes to the same input coefficient, so adjoints add. Seed zero returns a zero pullback for the zero-weighted output; it does not change the ordinary derivative.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| Existing partials certify total differentiability. | Axis restrictions can hide discontinuity or nonlinear direction rates. |
| A gradient and Jacobian use arbitrary orientation. | State column gradients and output-by-input Jacobians. |
| Reverse mode multiplies J by an output seed. | Its column pullback is Jᵀq. |
| Mixed derivatives always commute. | Check the stated smoothness neighbourhood. |
| General quadratic gradient is2Ax. | It is(A+Aᵀ)x unless A is symmetric. |
| Broadcast bias keeps one row's gradient. | Sum every replicated contribution. |
| Mean and sum losses have identical gradients. | Their reduction factors differ. |
| AD proves differentiability at every branch. | It follows executed primitives and stated kink conventions. |

## Three reproducible labs {#labs}

### Lab1 · Vector derivatives and a partials counterexample {#lab1}

{{LAB:lab1}}

Derive J,∇f,H before running, then compare their shapes and numerical errors. Explain the JVP's output dimension and the smoothness behind each check. The final axis/diagonal values illustrate a mathematical counterexample; they are not a sampling-based proof of continuity.

### Lab2 · A minimal reverse-mode engine {#lab2}

{{LAB:lab2}}

Trace the unique-node topological order and distinguish it from parent-edge contributions. Explain why x*x adds two contributions even though both parents reference the same object. Predict seed-two and reset results, then compare the nonlinear example with a finite difference at a smooth point.

### Lab3 · Every two-layer parameter gradient {#lab3}

{{LAB:lab3}}

Annotate forward and backward shapes and write the exact mean loss. Check each parameter entry, inspect the rejected transpose, and explain why overwriting a shared bias or omitting the mean factor violates the contract even when resulting arrays have plausible shapes.

## Fourteen exercises with full solutions {#exercises}

Exercises1–12 are required. Optional Exercises13–14 add35 minutes beyond the twelve-hour core schedule.

::: exercise #e1 level=1 kind=calculation minutes=7
For x²+3y² at(1,1), calculate the gradient and rate along unit(.6,.8). Give a unit steepest-increase direction.
:::
::: solution
Gradient column(2,6), rate2(.6)+6(.8)=6. Its norm is√40; normalising gives(2,6)/√40, which attains the maximal unit-direction rate by Cauchy–Schwarz. A nonunit direction changes the parameterised speed as well as direction.
:::

::: exercise #e2 level=1 kind=calculation minutes=7
For F(x,y)=(xy,x²,y²) at(1,2), give J and the column VJP for output seed(1,2,−3).
:::
::: solution
J=[[2,1],[2,0],[0,4]], shape3×2. Jᵀq=(2+4,1−12)=(6,−11), length two. It differentiates the scalar output combinationxy+2x²−3y². Jq is invalid because its inner dimensions are two and three.
:::

::: exercise #e3 level=1 kind=calculation minutes=7
For A=[[1,2],[0,3]],x=(1,−1), calculate the gradient of xᵀAx and compare with the incorrect2Ax.
:::
::: solution
A+Aᵀ=[[2,2],[2,6]], so the correct gradient is(0,−4). Ax=(−1,−3), giving incorrect2Ax=(−2,−6). The general formula uses both differential paths; symmetry is required to simplify it to2Ax.
:::

::: exercise #e4 level=1 kind=calculation minutes=7
For X rows(1,0),(1,1),(1,2),y=(1,2,2),w=(1,0), calculate the mean-squared gradient and Hessian.
:::
::: solution
r=(0,−1,−1),B=3,gradient(2/3)Xᵀr=(−4/3,−2). XᵀX=[[3,3],[3,5]], so Hessian(2/3)XᵀX=[[2,2],[2,10/3]]. Sum loss would multiply both by three. Keep y and predictions as matched columns or matched flat arrays, without mixing representations that broadcast into a matrix.
:::

::: exercise #e5 level=2 kind=proof minutes=15
Prove continuous coordinate partials in a neighbourhood imply total differentiability, using coordinate telescoping and a norm bound.
:::
::: solution
Change input coordinates one at a time from a to a+h. Each scalar increment equals its coordinate change times the corresponding partial at an intermediate point by the one-variable mean value theorem. All such points approach a. SubtractΣ∂_i f(a)h_i; continuity bounds each coefficient discrepancy byε for sufficiently small‖h‖. Hence |r(h)|≤εΣ|h_i|≤ε√n‖h‖. Sinceε is arbitrary, r/‖h‖→0, giving the total differential. Partial existence only at a does not supply this neighbourhood control.
:::

::: exercise #e6 level=2 kind=proof minutes=15
Derive the multivariable chain rule from total local models and account for ΔF=0.
:::
::: solution
LetΔF=J_Fh+r_F(h),with‖r_F‖/‖h‖→0. Outer incrementJ_GΔF+r_G(ΔF) gives main termJ_GJ_Fh. The remainderJ_G r_F is negligible; for nonzeroΔF,‖r_G(ΔF)‖/‖h‖ factors into a vanishing outer remainder ratio and bounded‖ΔF‖/‖h‖. WhenΔF=0 the outer remainder is zero directly. Thus total Jacobian is outer-times-inner, with compatible domains and differentiability at the relevant points.
:::

::: exercise #e7 level=2 kind=proof minutes=15
For L=(1/2)‖XW−Y‖_F², derive gradients for W,X,Y using a differential and state all shapes.
:::
::: solution
X:B×d,W:d×o,Y:B×o,R=XW−Y:B×o. dL=tr(Rᵀ[X dW+dX W−dY]). Cyclic coefficient collection or indexed sums give∇_W=XᵀR:d×o,∇_X=R Wᵀ:B×d,∇_Y=−R:B×o. Each has its parameter's shape and supplies its Frobenius differential coefficient. A different loss scaling multiplies all three consistently.
:::

::: exercise #e8 level=2 kind=application minutes=12
For u=x*x,z=u*u+u+x atx=2, trace reverse seed−1 through u and x. Distinguish the seeded result from the ordinary derivative.
:::
::: solution
u=4,z=22. Seed−1 gives u adjoint−(2u+1)=−9 and x adjoint2x(−9)−1=−37. Both multiplication edges and the direct addition path contribute. This is the derivative of−z with respect to x; the ordinary derivative of z is37. Resetting adjoints before a new seed-one pass recovers37 rather than accumulating−37 into it.
:::

::: exercise #e9 level=2 kind=application minutes=12
Residual matrix rows are(1,−1),(2,0),(−1,3). For a mean over all six squared entries, give the output adjoint and shared-bias gradient. Compare a sum loss and a row mean of summed outputs.
:::
::: solution
All-entry mean givesG=2R/6=R/3,so bias gradient sums rows to(2/3,2/3). Sum loss givesG=2R and bias(4,4),six times the first. A mean over three row sums givesG=2R/3 and bias(4/3,4/3),twice the all-entry mean. Shape alone cannot identify the objective reduction.
:::

::: exercise #e10 level=2 kind=application minutes=12
Write the second-order model of f=x²y+exp(y) about(.7,−.4) for displacement(.01,−.02). Explain which assumption controls its remainder.
:::
::: solution
Centre value−.196+exp(−.4). Linear correction−.56(.01)+(.49+exp(−.4))(−.02). Quadratic correction−.4(.01)²+1.4(.01)(−.02)+exp(−.4)(−.02)²/2. Their total prediction is about.445327710; actual value.71²(−.42)+exp(−.42)≈.445324820. The function is smooth, so a second-order little-o remainder applies locally; a specified finite error certificate would additionally need a bound on relevant higher derivatives over the displacement segment. The observed error is not itself that universal bound.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=12
A proof finds two zero partials for xy/(x²+y²) at the origin and claims a zero total derivative. Repair it and name a valid sufficient alternative.
:::
::: solution
Set the origin value zero. Axes are zero, but diagonal values are1/2 for every nonzero step, so continuity and therefore total differentiability fail. Existing axis partials are insufficient. A direct uniform remainder proof or continuous partials throughout a neighbourhood would provide sufficient evidence for a total differential, but this function meets neither claim at the origin.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=12
A backward pass multiplies G by W₂ instead of W₂ᵀ, overwrites a bias with the final batch row, and uses2R for an all-entry mean loss. Give three repairs.
:::
::: solution
UseG W₂ᵀ soB×o timeso×hidden returnsB×hidden. Sum every row's adjoint into the broadcast bias rather than overwrite; one shared parameter affects all records. For an all-entry mean useG=2R/(B·o),then propagate that scaling consistently through the entire graph. Each repair addresses a different part of the contract: shape, accumulated paths and differentiated objective.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Explain a Hessian–vector product as a derivative of the gradient along a path, and derive it for f(x)=xᵀAx with constant general A.
:::
::: solution
Under differentiability of the gradient, d/dt∇f(x+tv) atzero equalsH(x)v by the chain rule. Here∇f=(A+Aᵀ)x,soH=A+Aᵀ andHv=(A+Aᵀ)v. Directional curvature isvᵀHv. A JVP of a gradient computation can obtain this product without explicitly storing a full matrix; a finite difference of gradients is a different numerical estimator.
:::

::: exercise #e14 level=3 kind=extension minutes=20
For f=xy(x²−y²)/(x²+y²) away fromzero andf(0,0)=0, derive the unequal mixed partials and explain why a smooth Hessian theorem cannot be applied.
:::
::: solution
At fixed nonzero y, dividing f(h,y) by h and letting h→0 gives f_x(0,y)=−y; along y=0, the origin x partial is zero. Similarly f_y(x,0)=x, including zero. Thus ∂_y f_x(0,0)=−1 and ∂_x f_y(0,0)=1. The second partials are not continuous in a suitable neighbourhood, so the stated symmetry theorem fails. An entry table of coordinate second partials does not establish a total derivative of the gradient or the C² Taylor model.
:::

## Ten-question self-check {#quiz}

```quiz
? Existing partials at one point establish what by themselves?
- [x] Coordinate-line rates, without necessarily a total derivative
- [ ] Full continuity in every direction
- [ ] A uniform linear remainder bound
> Axis restrictions can miss diagonal behaviour. Additional hypotheses or a direct total-model proof are needed.

? For F:R⁴→R³, what is the Jacobian shape here?
- [ ] 4×3
- [x] 3×4
- [ ] One scalar
> Rows index outputs and columns inputs, so the map acts on a four-component increment to produce three components.

? How does a column output seed q pull back through J?
- [ ] Jq in every case
- [ ] q without a derivative map
- [x] Jᵀq
> The equivalent row VJP isqᵀJ. Distinguish an output seed from an input tangent.

? Which condition suffices for mixed-partial symmetry here?
- [x] Continuous second partials in a neighbourhood
- [ ] Merely writing both derivative symbols
- [ ] Equality of one sampled finite difference
> The four-corner argument needs smoothness to share the limiting value; isolated existence can fail.

? For a general square A, what is∇(xᵀAx)?
- [ ] Always2Ax
- [x] (A+Aᵀ)x
- [ ] tr(A) alone
> Both vector factors vary. The simplified2Ax formula requires symmetric A.

? An all-entry mean over B×o squared residuals has output adjoint what?
- [ ] 2R in every case
- [ ] R with no specified scale
- [x] 2R/(B·o)
> A row mean after summing output errors instead divides byB. Specify the reduction.

? A forward bias broadcasts over all rows. Its backward adjoint does what?
- [x] Sums contributions over those rows
- [ ] Keeps only the last row
- [ ] Adds a new output dimension
> Every replicated use depends on the same parameter, so chain contributions accumulate.

? Reverse mode at a shared node requires what?
- [ ] Overwrite each earlier contribution
- [x] Accumulate downstream contributions before applying its local rule
- [ ] Process its total repeatedly once per graph appearance
> A unique-node topological schedule and per-edge additions avoid lost or duplicated paths.

? Does automatic differentiation prove a classical derivative exists at a ReLU kink?
- [ ] Yes, because no step h is chosen
- [ ] Yes, if a number is returned
- [x] No; an executed backward value can be a convention
> AD follows primitive and branch rules. Mathematical differentiability needs its own hypotheses.
```

<div class="free-response" data-free-response data-key="math-series:m18:q10">
<label for="q10-response">10. Derive the mean-squared least-squares gradient with every shape, then trace z=(x*x)²+x*x+x at x=2 with reverse seed one. Explain shared accumulation and one limit of a numerical gradient check.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State the column convention, residual reduction, transpose, path sums and evidence boundary."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I kept shapes and loss scaling explicit and included every shared path.</label>
</div>

::: answer
For X:B×d,w:d×1,y:B×1,r=Xw−y:B×1,L=rᵀr/B, differential(2/B)rᵀXdw gives gradient(2/B)Xᵀr:d×1. For u=x*x,x=2,u=4,z=22,seedone givesū=2u+1=9 andx̄=2x·9+1=37. Each repeated operand edge and direct path contributes; reverse nodes run after downstream sums arrive. A finite check at selected smooth inputs can expose implementation faults but does not establish differentiability at a kink or prove a formula globally.
:::

## Reading with a purpose {#reading}

Use gradient, Jacobian, Hessian and chain-rule selections in the authors' [Mathematics for Machine Learning companion](https://mml-book.com/) and the primary [MIT OpenCourseWare multivariable calculus course](https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/). The differential derivations and small reverse engine above provide the lesson's own concrete shape and accumulation conventions.

| When | Selection and question |
|---|---|
| Session1 · 20 minutes | Total derivatives and gradients: what does one uniform remainder require beyond partials? |
| Session4 · 20 minutes | Matrix calculus and chain rules: which transpose and reduction carry an output adjoint back to each parameter? |

## Retrieval exit task and next step {#summary}

Give a partial-existence counterexample and a C¹ differentiability proof. State column-gradient and output-by-input Jacobian conventions, derive a chain pullback and a second-order model, then recover quadratic and least-squares gradients through differentials.

**Exit task:** For X:B×d,W:d×o and half-squared residualR=XW−Y,deriveXᵀR,RWᵀ and the row-summed bias contribution. Extend through a tanh hidden layer, specifying elementwise factors and the exact mean reduction. Explain how a unique-node reverse schedule still accumulates both edges of x*x.

**Ready to move on:** you can derive and verify local vector/matrix sensitivities and interpret an automatic backward pass. Optimisation next studies what those derivatives do and do not imply about minimisers and update convergence. See the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| ∂_i f / D_v f | Coordinate / path-direction rate | 偏导、方向导数 |
| df=∇fᵀdx | Scalar total differential, column-gradient convention | 全微分、列梯度 |
| J:m×n | Output-by-input local linear map | 雅可比矩阵 |
| Jv / Jᵀq | Input tangent / output-adjoint propagation | JVP、VJP |
| H / hᵀHh | Derivative of gradient / directional curvature | Hessian、曲率 |
| Frobenius differential | One coefficient per matrix parameter entry | 弗罗贝尼乌斯微分 |
| Reverse adjoint / seed | Output sensitivity at a node / selected output weighting | 反向伴随量、种子 |
| Accumulation / broadcast | Sum dependency contributions / replicated forward use | 累积、广播 |
| AD / finite difference | Primitive chain propagation / perturbed numerical estimator | 自动微分、有限差分 |
