# Mathematical Foundations implementation state

The user approved the detailed 32-module plan and said “Good, now do it.”
The entire approved curriculum is now implemented. No commit or deployment was
requested. Sub-agent work was not authorised and none was used. Historical notes
below describe earlier milestones; they are not outstanding work instructions.

## Current publication

Modules 01–32, Module 00 refresher, diagnostic, Python primer, and NumPy preparation
are written in English and Simplified Chinese. The builder emits 72 bilingual
lesson/support pages plus two overview pages. All 32 overview cards are live,
and plan.json status is complete. PLAN/roadmap/README/tutorial index agree.

Module 27 passed strict rendering, executed labs, strict MkDocs and the full
browser validator: 62 pages and 3,726 links/assets. Screenshots are in
`C:/Users/willr/AppData/Local/Temp/wrwei-math-preview-SJBd3C`.
Module 28 now passed the complete browser suite: 64 pages / 3,852 links/assets;
screenshots `C:/Users/willr/AppData/Local/Temp/wrwei-math-preview-1G6m4N`.
Its widget has eight seeded scalar paths, analytical mean, full untruncated
autoscaling, stability/variance diagnostics, invalid clearing and repeatable reset.
Module 29 passed the full suite: 66 pages / 3,966 links/assets, screenshots
`C:/Users/willr/AppData/Local/Temp/wrwei-math-preview-EpDrEa`; widget inspected.
Module 30 passed the full suite: 68 pages / 4,080 links/assets, screenshots
`C:/Users/willr/AppData/Local/Temp/wrwei-math-preview-IhtUmt`.
Both capstones are complete and all labs execute. Final strict MkDocs passed.
The fresh full browser sweep PASSED: 72 bilingual lesson/support pages,
4,290 local links/assets, capstone output/plot/progress/defence checks,
prerequisite DAG/route totals, all widgets/quizzes and responsive layouts.
Screenshots: `C:/Users/willr/AppData/Local/Temp/wrwei-math-preview-UbFZyC`.
Capstone plots load and their final English/Chinese screenshots were inspected.
No implementation or verification work remains; no tool process is running.
Actual learning, duration and graph plots were rendered in Chrome and inspected:
`C:/Users/willr/AppData/Local/Temp/math-capstone-{learning,durations,graph}.png`.
The output corpus has 2,838 rendered mathematical expressions across editions.
Modules 01–30 contain 186 English worked examples, 180 inline checks, 90 labs,
120 original paired figures, 420 exercise/solution pairs and 30 explorers.
The 270 scored choices plus 30 saved written questions make 300 quiz questions.
The capstones add six executed scripts, eight paired figures, actual plots,
contracts, proofs, mathematical appendices, saved defences and weighted rubrics.
Do not publish incomplete pairs. All outputs shown in lessons must come from
builder execution, never handwritten expected-output blocks.

The plan is `docs/tutorials/math/PLAN.md`; its module contracts and prerequisites
remain the specification. `roadmap.md` preserves the original planning overview.
Keep publication status aligned in the plan, roadmap, source README, and the math
paragraph in `docs/tutorials/index.md`. Avoid `index.md` beside `index.html`, which
would cause a MkDocs destination collision.

## Authoring and checks

Metadata is `plan/module_NN.json`; paired sources are `src/en/module_NN.md` and
`src/zh/module_NN.md`. Every taught module 01–30 has six main headings s1–s6,
at least six worked examples and inline checks, three executed labs, four
original bilingual figures, one keyboard-accessible explorer, fourteen full
exercise solutions, nine scored choices and one saved written quiz response.
Required exercises split 4 fluency, 3 proof, 3 application, 2 diagnosis, followed
by two optional extensions. Four study sessions must sum exactly to module hours.
The validator checks at least 4,000 English concept words before misconceptions.
Do not pad text to pass it; teach definitions, proofs, boundaries, and transfer.

The builder uses the existing AI Markdown dialect and installed dependencies,
with no edits to AI content or tools. It validates every KaTeX expression,
captures lab outputs, copies exact downloads and fonts/licence, and updates
availability. Mathematics is rendered before JavaScript. Progress keys start
`math-series:` and are shared across the paired editions only.

```
node tutorial-sources/math/tools/figures.mjs
node tutorial-sources/math/build.mjs
node tutorial-sources/math/validate.mjs
python -m mkdocs build --strict
```

Numerical baseline tested locally: CPython 3.11.8, NumPy 1.26.4. This folder's
requirements pin NumPy; add other required packages with tested versions as the
later modules require them. Local Matplotlib 3.10.9 and SciPy 1.14.0 import, but
are not yet numerical-lab requirements. Standard-library modules are 01–08.
`MATH_PYTHON` selects the lab interpreter. The published numerical requirements
download is copied to `docs/tutorials/math/labs/requirements.txt`.

Strict site checks in this session use the temporary venv interpreter
`C:/Users/willr/AppData/Local/Temp/math-series-build-tiwb0viv/Scripts/python.exe`
and output `C:/Users/willr/AppData/Local/Temp/math-series-build-tiwb0viv/site`.
Set `MATH_SITE_ROOT` to that output before browser validation. The validator
launches Chrome, checks local URLs/anchors/assets/ARIA, exercises controls and
saved bilingual progress, tests widths 360/390/768/1280, and captures previews
under the system temp folder. For missing Chrome use `MATH_BROWSER_PATH`.

The last fully passing browser run checks 44 lesson/support pages, 2,610
links/assets, all eighteen module explorers, quizzes and progress. Module 18's
strict build and browser checks pass, including shared-graph seed zero/negative
and native keyboard cases. Its English widget preview was inspected at
temp/wrwei-math-preview-1RuRry. Module 16's domain-failure
handler now clears stale plotted points and its added browser assertion passes.
Visual review of17 caught imported CSS overriding a hidden control label. Source
style now contains `.widget-controls [hidden] { display:none !important; }` and
validator assertions check the unused area/decay sliders' computed visibility.
These visibility assertions pass in Module18's full build.
The test uses native SVG focus (Puppeteer's HTMLElement-only helper rejects SVG)
and instant scrolling to avoid smooth-scroll movement during coordinate measurement.
Latest previews are at `C:/Users/willr/AppData/Local/Temp/wrwei-math-preview-1RuRry`.

Tables and long arithmetic expressions now wrap on narrow screens. Widget
screenshots have been visually inspected for Modules 07–18 after functional
checks. `tools/layout.mjs` is a read-only overflow diagnostic.

## Mathematical examples worth retaining

Module 06: exact half-size recurrence totals at n=8 are 15,32,120 for a=1,2,4;
the borderline n/log2(n) work gives T/n=1+H_h, outside the basic Master cases.
Timing scope, clock-resolution zero readings, and amortisation are explicit.

Module 07: undirected V=ABCDEF, edges AB,AC,BD,CD,DE; F isolated. BFS from A
has distances 0,1,1,2,3 to A,B,C,D,E. Recursive alphabetical DFS preorder is
A,B,D,C,E, not a shortest-distance guarantee. DAG edges A→C,B→C,C→D,C→E,
with D→A creating A,C,D,A; E is blocked downstream without being on the cycle.
Bounded protocol tuples (control,count,ack) have six faulty/five repaired states;
send,retry,timeout reaches unsafe idle,2,false. Repaired timeout self-loop is
safe but does not establish liveness or an unbounded implementation result.

Module 08: gcd(252,105)=21 with coefficients −2,5. Inverse three mod7 is five;
two mod6 is nonzero but noninvertible. 4x≡2 mod6 has solutions two,five. CRT
2 mod3 and 3 mod5 gives class eight mod15. XOR bit-vector addition differs from
mod256 word addition. “Unit” translates 可逆元, distinct from identity 单位元.

Module 09: Cauchy–Schwarz and Euclidean triangle proofs are complete, squared
length is distinguished from a norm/metric, and positive feature scaling is
explicit. Raw neighbours Q,P,R change to P,R,Q after centimetres become metres
with fixed numeric weights. Wrong `(3,)-(3,1)` broadcasts to `(3,3)` with mean
squared difference 7/3; intended paired columns give 1/3. Zero cosine is undefined.

Module 10 lab results: S=[[2,0],[0,1]], H=[[1,1],[0,1]], SH=[[2,2],[0,1]],
HS=[[2,1],[0,1]], yielding (4,1) versus (3,1) at input (1,1). Exact pivoted
elimination of [[0,2,1],[1,−2,−3],[2,3,1]] with RHS [3,0,7] gives [1,2,−1].
Duplicate rows produce inconsistent or underdetermined systems according to RHS.
Direct solve of [[3,1],[1,2]] with [9,8] gives [2,3], as does inverse code here;
do not claim inverse is always worse numerically from this example. Diagonal
[1,1e−12] is invertible but RHS perturbation 1e−9 changes second solution from
one to 1001 while the new-system residual is zero.

Preserve all pre-existing/concurrent dirty AI work. Only the math folder,
`tutorial-sources/math`, and the math introduction in the tutorials index are
this task's edits. Use original repo-native SVG/canvas diagrams, no imagegen or
Sites workflow. Read primary references when exact documentation is needed;
verified readings include MIT OCW mathematics/algorithms, the MML book companion,
Python docs and NumPy 1.26 docs. No remote messages or publishing are authorised.

Module 11: exact A=[[1,0,1],[0,1,1],[1,1,2]], rank two, kernel and left kernel
span(-1,-1,1); image plane z=x+y. RREF pivot column indices must select ORIGINAL
columns. Target (2,3,5) is compatible; (2,3,6) has left-null certificate one.
Temperature design (1,C,F) with F=1.8C+32 annihilates (-32,-1.8,1) on its declared
domain. Weights (5,2,-1) and (-11,1.1,-.5) agree at C=0,10,20,30. Polynomial
(1,x,x²) training at 0,1 annihilates (0,-1,1), but at 2 the prediction change is two.
Exact [[1,1],[1,1+1e-12]] rank two contrasts numerical tolerances 1e-14 rank two
and 1e-10 rank one; fixed absolute cutoff changes with scaling. Span widget has
rank0/1/2, certificates, zero first generator, exact integer presets, invalid input.
Chinese exercise notation `[[1,1],[1,-1]](3,1)` was parsed as a Markdown link;
it now has separating prose. All local-link checks pass after correction.

Module 12: projection (3,2) on span(1,1) is (2.5,2.5), residual(.5,-.5), SSE.5;
weighted diag4,1 projection2.8,2.8, weighted orthogonality only. GS columns
(1,1,0),(1,0,1) yield q1/√2, q2=(1,-1,2)/√6. Line-fit records (0,1),(1,2),(2,2)
give w=(7/6,.5), residual(-1/6,1/3,-1/6),SSE1/6. Duplicate x makes weights
(7/6,t,.5-t), minnorm(7/6,.25,.25). Returned library residual summary is empty
despite nonzero actual residual. Near-collinear X rows(1,1),(1,1+δ),(1,1-δ),δ1e-8,
Gram rounded to all threes locally, normal solve raises singular; QR ~1,2. Target
perturb(0,δ,-δ) changes weights to~0,3 with tiny residual. Solver damage differs
from intrinsic sensitivity. Projection widget covers Euclidean/weighted/zero
space and invalid input; plot scale28 accommodates weighted images up to six.

Module 13 EN concept count4063; complete14exercises/fullsolutions,9choices,
written quiz,3lab inserts,readings,terms,exit are written. Six sections follow plan.
Spectral theorem proof explicitly uses compactness of unit sphere (named analysis
input), then no-calculus quadratic variation + invariant-complement induction.
General defective stability states Jordan-form existence as an additional theorem;
block power proof provided, not claiming diagonalizable-only stability. Optional
graph Laplacian PSD/kernel and power-iteration gap material included. Translate all.
Four pending figure IDs fig-13-1 eigenaxes,13-2 ellipse/semidefinite/indefinite,
13-3 transient versus unit Jordan powers,13-4 SPD Rayleigh/condition directions.
Pending widget name spectra: symmetric preset eigenvalues/axes/contours/quadratic
evaluation; must show PD/PSD/indefinite and shape assumptions. Add initialisation
before composition root return and add detailed browser cases. Do not run builder
before both languages and figures exist; module13 metadata already matches discovery.
Labs executed: A2,1;1,2 eigenvalues1,3; hand q=(1,-1)/√2,(1,1)/√2 signs allowed.
Stable diag(.5,-.8), unstable diag(1.2,.5) excited/unexcited, defective stable
[[.5,3],[0,.5]] e2 first(3,.5),k20(.000114441,.000000954), unit defective J
e2→(k,1), quarter-turn normone. Lab3 sign/projector, exact J eigenspace v2=0
dimension1; np.linalg.eig vector-matrix rank1tol1e-12; misused eigh(J) residual1
against original J; rotation eigvalues±i. All three exit0. NumPy1.26 eig/eigh
primary reference pages verified. Need source/readme/public status update to13
only after completed build. No active test process after the passing12 run.

PowerShell here-string piped to Python loses literal non-ASCII characters in this
environment. For text replacements use ASCII Python literals with `\u2013` etc,
or apply_patch directly. The safe replacements updated all public statuses to12.

The older Module13 pending paragraph above is superseded: BOTH lessons, all
figures, explorer and browser cases are now complete and tested. Figure13-2 ellipse
major axis rotated +45 SVG degrees so it follows the difference (1,-1) direction,
not the short sum direction. Widget spectra supports symmetric presets PD,PSD,
indefinite,negative-definite,zero and repeated identity; tested classification,
eigenvalues,quadratic energy,invalid input and keyboard reset. Visual review passed.
Public source/readme/plan/roadmap/tutorial index statuses now01–13,14–32planned.

Module14 pending: metadata complete10h sessions four150min and3labs. No lessons
yet. Verified primary NumPy1.26 SVD page and earlier pinv docs. Lab1 generated8×6
matrix from orthonormal Walsh-style left columns/three explicit right columns,
nonzero singularvalues6,3,1 (reduced q6 factors include3zeros); Frobenius squared
46 and truncation k0,1,2,3 errors46,10,1,0, factor scalarcounts0,15,30,45 vs48.
Lab2 training rows(10,0),(12,1),(14,0),(16,1),trainmean13,.5,centered scatter
[[20,2],[2,1]], eigenvalues(21±√377)/2, leadingdirection~(.994623,.103562),
sample covariance vals6.736081,.263919,explained.962297,.037703, rank1SSE
.791756080526. Heldout(20,2),(8,-1) scores7.117704,-5.128458;changedheldout
(2000,200),(-800,-100) scores1996.976519,-819.036482 using SAME training mean/basis.
Lab3 leakage testmean combinedtrain+(100,10),(200,20) becomes58.666667,5.333333;
uncentred leading projector differs;feature2×100 rotatesleadingprojector to
almost second axis andleadingratio.998404. diag1,1e-10 pinv relativecutoff1e-12
retainsweakmode target1,1e-10→weights1,1 andperturbed1,1.01e-8→1,101;
cutoff1e-8 discardsmode→weights1,0 residual1.01e-8. Allscripts exit0, standalone,
no extra package. Must explain numerical policy rather than claiming exact rank1.
Suggested rigorous14 proofs: derive SVD from PSD AᵀA and set u_i=Av_i/σ_i;
Frobenius tailerror by orthogonal invariance; optimal rank-k using projection onto
candidate image and trace weighted eigenvalues with weights in[0,1] sum≤k;
operator error lowerbound via a kernel vector in span of first k+1 right singular
vectors. Show pseudoinverse row/column projections and conditioning, including
κ(XᵀX)=κ(X)^2 for full-column-rank. PCAtraincenter/scattervariance purely algebra,
probability interpretation deferred23. No test process remains active.

## Recent complete modules and current optimisation work

The older drafting notes above are historical; the Current publication section
is authoritative. Modules14–18 have complete paired sources, figures, explorers
and browser cases. Module14 has4,047 EN concept words,15 has4,650,16 has4,006,
17 has4,002 and18 has4,007. All contract counts match across editions.

15 proves sequence completeness/Cauchy, epsilon–delta, continuity and real-line
compactness, series comparisons and contraction residual bounds. Its `limits`
explorer certifies only inequality-based sufficient bounds, labels an uncovered
square window uncertified rather than disproved, and gives actual jump witnesses.
16 derives elementary/product/chain/inverse rules, Rolle/MVT, finite Lagrange
remainder; `taylor` uses ln(1+x), centres[-.5,1],orders0–5 and exact segment-based
derivative bound. Domain failures clear old points. Labs15–17 use standard library.
17 gives Riemann/FTC/substitution/parts/improper/density/quadrature/ODE proofs.
NIST https://dlmf.nist.gov/3.5 was browsed for Simpson's named remainder theorem;
the formula constant is stated, not claimed derived by the simpler Taylor proof.
`accumulation` toggles x² rectangle bounds and x'=-2x Euler trajectory; native hidden
labels now honour CSS. Simpson count must be positive even; density height≠mass;
Euler stability0<ah<2,nonnegativity0<ah≤1,accuracy separate.
18 gives partial/directional counterexamples, C¹ sufficient proof, Jacobian chain,
Hessian/Taylor regularity, general quadratic/matrix LS gradients, AD topology.
Lab1 F=(x²y,sinx+y²) at(.7,-.4),J[[-.56,.49],[.764842,-.8]],JVP(.6,.8)=(.056,-.181095).
Scalar f=x²y+exp(y),grad(-.56,1.16032),H[[-.8,1.4],[1.4,.67032]]. Counterexample
xy/(x²+y²) origin0 axes0 diagonal.5. All-directional-but-not-total example
x³/(x²+y²) continuous with direction rate v1³/(v1²+v2²). Mixed-second example
xy(x²-y²)/(x²+y²),f_x(0,y)=-y,f_y(x,0)=x => mixed -1 and1; not C²/total gradient
derivative. AD lab2/`adjoints` graph x2,u=x*x4,v=u*u16,w=v+u20,z=w+x22;
seed1 adjoints x37,u9,v/w/z1,seed2 x74,reset x37,seed0 zero pullback not newordinary
derivative. All edges +=,unique topo nodes once. Lab3 NumPy tanh network B3,d2,h3,o1,
mean loss .12469122832324815, all parameter finite differences <2.74e-11; faults
missingW2transpose,overwriteb1lastrow error.1306617,missingmeanfactor3. No added deps.

19 is complete and passed all checks. Metadata12h,
4sessions180min, fluency4×7,proof3×15,application3×12,diagnosis2×12,optional15+20.
All three labs exit0. Lab1A[[3,1],[1,3]],b(2,-1),min(7/8,-5/8),f*=-19/16,
eig2,4;eta.2factors.6,.2,eta1/3 factors±1/3,eta.5 top -1persistent,eta.55 top-1.2grow.
Newton solve exact optimum. Lab2diag1,100 raweta.01 after200 x(.13398,0),balanced
2/101 after200(.018313,.018313),eta.1 tensteps stiff3.486e9. z=Sx,Sdiag1,10,
transformed Hessian identity,unitzstep solves; equivalent rawpreconditionerdiag1,.01.
Lab3singularHdiag2,0,b2,0,start0,5,minnormdirection1,0=>minimiser1,5(notminnormsolution);
quartic t⁴-3t² at.1,g-.596,H-5.88,Newtonp-.10136054,gp+.06041088 raisesf;
replace -g and Armijo c1e-4 acceptsalpha1,f=-1.218589. Saddle x²-y² zero grad;
scaled 1e-12(x-100)² at0 grad-2e-10 passes1e-6 butdistance100,mu2e-12 cert100;
distance.01 needsgrad≤2e-14. Source19 EN proves convex/Jensen/first&secondcriteria,
strongconvexbounds, descent lemma viaMVT comparisonφ (NO hiddenintegrationprereq),
general convex1/k gap andstronglinear gap, exactquadraticsteps/rho/condition/scaling,
Newton/coordinate safeguards. Its widget placeholder is `descent`.
Implemented widgetSPD presetsdiag1,4;rotated3,1;diag1,100;identity,eta number0–2.5,
nativepresetsets1/L exceptdefault.2,contourswith20stepsfrom(2,1),rho and strict interval
status. Omit off-window points and report count rather than huge SVG coordinates.
Show boundarytoposcillation, unstablegrowth, hiddenmodewarning. Testskeyboard,blank,
eta .5 boundary / .55unstable,conditioning preset .01rho.99,identityeta1zerofinalerror.
Primary reading root verified https://web.stanford.edu/~boyd/cvxbook/ this session.

20 complete EN/ZH, 48 pages/2,854 links PASS strict MkDocs/browser/lab checks.
Screenshot C:/Users/willr/AppData/Local/Temp/wrwei-math-preview-4ZHS8r.
12h 4x180; exercises7/15/12/12min, optional35. Proofs projection variational/nonexpansive,
weak duality, convex KKT sufficiency, projected decrease and convex1/k gap; regular
level-set/LICQ necessity and qualified Slater are stated, not falsely claimed proved.
Simplex a(1.2,.4,-.2) projects(.9,.1,0),theta.3,lower(0,0,.5),f/q.11.
Slater failure does not imply positive gap: min x under x^2<=0 has zero gap but
no finite dual attainment/KKT. Nonconvex min -x^2 on [-1,1] zero stationary max,
strict feasible but every Lagrangian inf=-infinity. Squared penalty x2/(1+rho) nonzero.
Widget name projection, variable simplexRoot MUST distinct from earlier module12
projectionRoot; the browser caught that IIFE var collision and it was fixed.
2D input1.2,.4 ->(.9,.1),q.09; faulty infeasible remains stationary but sum1.2;
negative multiplier invalidates bound; native numeric keyboard/reset/blank tested.
21 English complete4,007 concepts, labs1/2/3 executed standardlib. No metadata,
ZH, figures or widget yet. Labs exact weightedtable HH/HT/TH/TT weights1/2/3/4,
xor pairwise not mutual; random seed20261004 up to1e6,posterior.154337 vs2/13;
selection AorB yields2/3 marginals,joint1/3 not4/9; SimpsonA9/10easy30/100hard
vsB80/100easy2/10hard,pooled39/110 vs82/110,commonhalf.6 vs.5.
Corrected original PLAN and plan.json arithmetic: pi.01 s.9 r.05 has positive.0585
not.058 and posterior2/13=15.38%, not15.5%. Must retain correction.
UNRELATED AI untracked module09 and plot files appeared in git status during
this context; treat as user/other-work and do not modify, delete or commit them.

21 now complete EN/ZH/meta/4figs/widget and full browser passed. 10h4x150;
ex6/14/10/10 and35 optional. Widget bayes uses native percent number inputs,
prior0..100 step.1 default1,s90,r5; expected100k fourcell table, posterior,
evidence mass and two conditional ratios. pi0 makes P(+|D) undefined despite
supplied generative branch s; pi1 makes nonD conditional undefined. Both s=r0
make positive evidence/posterior undefined and clears prior text correctly.
Tests likelihoodzero->posterior1,pi50->18/19,default2/13,keyboard,blank/reset.
22 complete EN4,028 concepts, all assessments and3labmarkers. No ZH/meta/figs/widget
yet. Six section IDs samecontract; six worked/check. Widget name distributions,
fig22-1..4 placeholders. Need add matching Chinese roundedmeasurement and tail
cancellation paragraphs (added to EN after initial write). Main22 route CS only
discrete; AIcontinuous requires17, CSbridge in s3 plus branchalternatives e4/e7/e9/
e12/e13/e14/q10; labs clearlylabelCS vsAIsections. Use times10h4x150 same21.
Labs standardlib all exit0. Lab1binomialn5p2/5 tail>=3=992/3125=.31744,geo
trials p1/4 first10 sum989527/1048576 tail59049/1048576;Poissonrate2 finiteprefix
reportsremainders. Lab2seed22022,N20000 geometric inverse+expo2+normalECDF,
bisect_right <=. Latest sampler changed to generator.random() accepts0 (maps1),
not1-random that could1; rerun builder capturesactualnewoutput.
Lab3 discreteX -2,-1,1,2 equal=>squares1/4 eachhalf; continuousUniform0,1 doubled
densityhalf (omittedfactor mass2),Uniform-1,1 squaredCDFsqrt(y),pdf1/(2sqrt(y))
from2branches;integral eps..1 at1e-4 .99 plus omitted .01,onebranch.495.
Named normalising Gaussian integral stated (not false proof). Poissonexpseries
normaliser can be taken statedidentityCS(no hiddencalculus prerequisite).
Suggested distributions widget binomial n fixed5 p adjustable vs uniform(0,b)
AIbranch bpositive; numericthresholdt;PMF/PDF andCDF sidebyside or modeplots.
Distinguish pointprobability0 vsdensity>1;right-contCDF atinteger; nativekeyboard
invalidblank, p0/p1,uniformb.5density2, support/outside/domain checks. Avoid IIFE
varnames colliding with any earlier roots, as20didinitiallyandwasfixed.

22 now complete EN/ZH/meta/4figs/widget; full validation52pages/3,098links passed.
English concept4,028 plus3KaTeXdisplay formulas. Widget distributions usesunique
lawExplorerRoot, n5binomialp40%,t3 yieldsPMF.2304 CDF.91296; t2.75mass0,CDF.68256.
p0degenerateat0,p1at5. Uniform0,b b.5,t.25 density2,CDF.5,pointprob0; endpoints
PDF chosen0,CDFatb1; hiddenparamcontrols honored. Nativep41/b.75,blank,b0,reset
verified. DiscreteCDF draws separated horizontals withopenleftlimit/closedrightvalue
jump markers rather than connectingverticalsegments, preserving discontinuity.
23 labs exist, EN/ZH/meta/4figs/widget pending. Lab1 exactjoint(0,0)1/2,(0,2)1/4,
(1,0)1/8,(1,2)1/8;EX1/4 EY3/4 VX3/16 VY15/16 Cov1/16 VarSum5/4 (wrong9/8).
Y0mass5/8 condEX1/5 var4/25,Y2mass3/8 condEX1/3 var2/9;within11/60 between1/240.
Searchpositions1..4 masses1/2,1/4,1/8,1/8 expected15/8 (uniform5/2).
Lab2 seed23023 N20000uniformX-1,1,Ysquare deterministicresid0 sampleCov-.000509,
corr-.002920; independentYuniform0,1 refcov-.000252. CSdiscrete-1,0,1 equallylikely
Ysquare cov0 anddependent. Script--output writesactualSVGscatter to requestedpath.
Builder now uses optional lab.plotAlt[lang] escaped text rather than module1hardcoded
alt for newplots; MUST set23lab2plot='lab2_dependency.svg',plotAltbilingualdescriptive.
Builder passes--output artifactspath,copiesasset; codecaptionstillbilingualgeneric.
Need builderexecuteSVGoutputpath+viewfigure; lab2onlytestedwithout--outputsofar.
Lab3 standardlib noaddeddeps: Bernoulli.3 Y=X,VX/Cov21/100,VarSum21/25 vswrong21/50.
AIoptionalModules12/14 data(-2,-1),(-1,-.5),(1,.5),(2,1),center0,C_N[[2.5,1.25],[1.25,.625]],
top(2,1)/sqrt5 eig3.125,orth(-1,2)/sqrt5 eig0. N-1scales4/3directionsunchanged.
23 branchguards: continuous17;vectorcovariance12; PCAconnection14 explicitlyoptional.
Keep covariance matrix PSDproof coordinatewise without demanding eigen/SVDprereqs
for readerswith12; nameGaussianSPDdensity/factorization theorem where relevant.

23 now completeEN/ZH/meta/figs/widget and build54pages passed; strict MkDocs
rebuilt AFTER build completion. Full browser currently running session2519.
First attempt launched strict before long build had finished, then browser while
site was rebuilding; failed on missing tutorials/index.html. Final fresh2519
started after strict completed; use this run, do not claim firstattemptvalid.
Build orchestration MUST wait any returned session_id before dependent commands.
Module23concept4003 pluswidgetdescription; includes binary squaredloss vszeroone
decision/absolute median, and Gaussianmarginalsnotjoint counterexampleX=Z,Y=SZ
withfairindependentS,Cov0,|Y|=|X|; fullrankCov canstilljointsingularsupport.
Module23widget jointmoments c=P(X1,Y2),range0..25 step1/32 default1/8; preserves
X1marginal1/4,Y2marginal3/8. Fourmasses(.375+c,.375-c,.25-c,c). Cov=2c-.1875,
VarSum=.75+4c, within+between=.1875. Independencebuttonc3/32,caseY0/Y2,
nativekeyboard. Tests defaultcov1/16,sum5/4,within11/60,between1/240,indepc,
c0negativecov,keyboardc5/32->cov.125,Y2mean5/12,invalidblank/reset andplotalt.
Artifactscatter23 inspected viaChrome PNGC:/Users/willr/AppData/Local/Temp/math23-scatter.png
looks correct. Builder optionalplotAlt[lang] nowused for23lab2 notmodule01alt.
24 three labs exist/executed, no sources/meta/figs/widget. Standardlib. Lab1seed24024
R3000,p .5/.01,n20/1000. KnownIIDSD sqrt(p(1-p)/n); rare.01,n20 Pzero.817907
empzero.823,non-Gaussianfewvalues. CLT originalsremainBernoulli; no universal95
guarantee from1.96sd finite trace. Lab2seed24242,N100/1000/10000 finiteeventp.3
finalestimate.2986 SEknown.004583,plugin.004576,Hoeffding95radius.013581;
AIintegralU? I1/3 variance4/45 finalestimate.330839 SE.002981.
Lab3seed24reset30 times N1000p.3 =>same .305mean; wrongRNSE.002646 vsproper
copiedmodel.014491. Clusters100copied10rows nominal1000 SErow.014491 vscluster
.045826. Rareallzero100p.001 Pzero.904792,pluginSE0 butHoeffdingradius.135810.
CommonRNs pA.6,pB.55 difference.05 variancepaired.0475 vsindep.4875,10kSE
.002179 vs.006982,actualestimates.0482,.0461. Pairinghelpspositivecovonly.
ReadPLAN24 sixsections10h prereq04/23, continuous17. NeedEN4000ZHparallelall
assessments14/9MC+written, figs4, oneaccessiblewidget cases exactbinomial
samplingdistribution withindep vs cloned draws; compareexacttail/Cheb/Hoeffding
independenceguards, N maybe1..100 ppercent1..99 ? control, avoid claimingCLT
finiteguarantee. Markov/Cheb/WLLN completefiniteproof; CLT and Hoeffding qualified
namedtheorems (not falselyclaim elementaryproof without calculusCSprereq).
R5lecture19/20 verifiedprimarydirectlinks:
https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/pages/unit-iv/lecture-19/
https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/pages/unit-iv/lecture-20/
NeedprimaryHoeffding source currently searchingStanford/MIT lecture notes.

23 fresh fullbrowser session2519 PASSED54pages/3,226links. Widgetvisuallyinspected
from NEpVhE folder. All23 publicationstatusupdated. Current24 labsready, sources
pending. PrimaryHoeffding generalrange theorem foundandopenedMIT2006MathCampPDF:
https://ocw.mit.edu/courses/9-520-statistical-learning-theory-and-applications-spring-2006/f195bbc782726fc4580586a67d4fe69c_mathcamp02.pdf
IndependentXi in[a_i,b_i],twosided bound2exp(-2t?/sumranges?) forsumt>0.
Usecitednamedtheorem(nofalseCS calculusproof),bound2exp(-2N??) for[0,1]mean.

## Latest implementation notes: Modules 24–28

The historical notes above predate completion of 24–27; current publication at
the top is authoritative. Modules 24–27 each have complete paired sources,
metadata, four bilingual SVGs, three captured executable labs, fourteen full
solutions, nine choices and saved written question ten. Their main teaching is
over 4,000 English words; paired display formulas were added in 25 and 26.
All publication statuses now say 01–27 available, 28–32 planned. No process is
running. Module 27's fresh full-browser PASS is 62 pages / 3,726 links/assets,
screenshots SJBd3C (absolute folder at top); widget visually inspected.

24 sampling widget uniquely named samplingExplorerRoot. N2..100 integer,
p%1..99, epsilon%1..49 default20,50,20; exact integer boundary test
abs(100*k-N*pct)>=N*epsPct before floating mass sum. IID tail .11531829833984375,
Var .0125, Cheb .3125, Hoeff 2exp(-1.6). Copies use only 0/1 atoms, Var .25,
tail1 and show Hoeff not-applicable. Full keyboard/invalid/reset tests passed.
25 estimationExplorerRoot uses n0..30,k0..n,integer a/b1..10; default10/8/2/2.
Posterior10,4 mean5/7 mode.75 Var2/147, credible .461868..909080 by integer-beta
binomial-tail CDF and bisection. n0,a=b1 uniform case all MLE/mode tie handled.
Relative likelihood and posterior density have separate labelled scales.
26 inferenceExplorerRoot n5..40,p%1..99,count0..n,90/95/99 levels,Wald/Hoeffding.
Exact finite-model weighted coverage defaultp.5,n20 Wald .95861053466796875,
Hoeff .9974231719970703; rarep.01 Wald .182050 vs Hoeff >=.95. Selected k0
Wald is {0}, fails positive truth. Diagram all counts, weighted coverage.
27 informationExplorerRoot six nonnegative weights0..10 step.5, group sums>0,
explicit normalisation. Defaultp5,3,2 q2.5,5,2.5. Hbits1.485475,CE1.7,
KLforward .2145247 reverse .1989648208049437; floats tested with tolerances.
Match q=p, bits/nats, required-q-zero Infinity, common-zero category, allzero
invalid, blank/reset tested. All new widget roots unique (avoid collisions).

27 proves KL via -log u >=1-u with mass outside source support, code length
lower bound via Kraft, finite DPI via conditional MI chains. Rounded-length
coding existence is a named Kraft converse, not a claimed complete proof.
Three standalone stdlib labs including held-out unigram counts6,3,1 with
smoothing1 -> q7,4,2/13; fixedtestabcac PPL3.428310 worse than uniform3.
SourceZH27 wording corrected from ambiguous “先验” to “先检验”; next rebuild
will copy this two-line edit. No structural change requires separate tests.

28 src/en/module_28.md complete concepts and assessment, >4000 before
misconceptions; ZH/meta/figures/widget NOT YET WRITTEN. 12h four180 sessions,
exercise times7x4,15x3,12x3,12x2 plusoptional15/20. Needed widget name=stochastic:
suggest scalar regularised quadratic .5(a+lambda)w², eight seeded IID ±noise
paths and exact mean path, fixed60steps/w0=2, controls a1..10 eta.01.. .5,
lambda0..2 noise0..3 and seedinteger. Stability eta(a+lambda)<2. If stopping
display at numerical threshold label it explicitly; do not silently clamp.
Native keyboard/reset/invalid, noiseless recurrence/noisy reproducibility and
instability cases need browser validation. Unique root name required.

28 labs executed:
lab1_full_and_minibatch_updates.py (NumPy) four records (-2,0),(0,2),(2,0),(0,-2),
G(w)=w, C2I, b2 replacement I vs subset2/3I, copies2I. Evaluation budget2400,
updates2400/1200/600, eta=.4/(1+t/50) indexedupdates; finalgaps .010553878,
.012984558,0; explain budget differences, no universal ranking.
lab2_regularisation_and_scaling.py NumPyseed28029,240examplestrain144,val48,
test48; rawscales1/100, training-only transform; condition11263.011726->1.021254;
meanhalfSSE+lambda/2norm²; unpenalised intercept. lambdalist0,.01,.1,1 validation
chooses0, finaltestMSE.286922. Scalar a.8 lambda1 ridge.4/lasso0.
lab3_rates_correlation_and_decay.py standardlib: a10eta.1factor0 vs .25factor-1.5
grows57.665039loss16626.283650 at10; copiedb2var2 vs IID1. SGD w2,g.1,lam.5,
eta.01 both1.989; first bias-corrected Adam coupled1.99 vs decoupled1.980000001.
Clip equally likely -2/1 to -1/1 changes mean -.5 to0. Illustrative (explicitly
labelled, not model benchmark) val .30,.26,.25,.27,.29 picks epoch3/test.28;
test .31,.29,.28,.24,.26 wronglyselectepoch4/.24.
28 English proves gradient mean/importance,C batch correction, expected smooth
descent, scalarvariancefloor eta*v/[a(2-eta*a)], softthreshold, ridgeSPD,
earlystop eigenfilters vs ridge, Adam moment initialisation scope, and finite
sum stable-step product positive using MVT so shrinkingsteps neednotconverge.
Momentum convention unnormalised v=beta v+g, unlikeEMA; Adam usesraw2ndmoment,
zero buffers, corrections and epsilon OUTSIDE sqrt. No universal convergence.
Primary paper PDFs opened/parsed for exact equations:
https://arxiv.org/abs/1412.6980 and /pdf/1412.6980 Algorithm1 p1.
https://arxiv.org/abs/1711.05101 and /pdf/1711.05101 decoupledweightdecay.
R9 Stanford primary notes opened/parsed for27:
https://web.stanford.edu/class/ee376a/files/2017-18/lecture_3.pdf
https://web.stanford.edu/class/ee376a/files/2017-18/lecture_5.pdf
https://web.stanford.edu/class/ee376a/files/2017-18/lecture_8.pdf
MITlectures21(Bayes),23(MLE),24(inference) directlinks verified. ISLRauthorroot
https://www.statlearning.com/ verified regression/resampling/multipletest chapters.

Continue 28–32 to finish the original approved objective. Preserve unrelated
AI Module09 work and regenerated AI assets in git status; those are not ours.
