## Project contract and required artefacts {#contract}

Build a dependency planner that returns a precedence certificate, earliest completion times and a critical path, or rejects invalid data and supplies a cycle witness. Use eight tasks with a diamond dependency and an isolated task. The model has unlimited parallel workers, no transfer delays and no worker contention. A dependency edge u→v means u must finish before v starts; the input lists immediate prerequisites, not a precomputed transitive closure. All tasks are available at time zero subject to those edges.

The fourteen-hour core has four stages: two hours specifying, four proving, four implementing, and four quantifying/reporting. This is a project rather than another fourteen-exercise chapter. Produce these seven artefacts; each should be inspectable independently:

1. A one-page input/output contract, including invalid and empty cases.
2. A labelled graph and a table linking its tasks to input records.
3. Standalone Python implementation and a reproducible command.
4. Written order, termination and finish-time proofs tied to the actual loops.
5. Operation counts and memory analysis with a declared arithmetic model.
6. Exact and simulated finite-duration laws, including a dependence comparison.
7. A short report, fault evidence and the rubric-based self-review.

The reference implementation and its actual outputs below are a complete worked solution. First write your own contract and predict the fixture outputs, then compare the reference. Matching one printed order is insufficient: several topological orders can be correct. Assess every edge, the recurrence, a closed cycle witness, and model assumptions.

## Stage 1 · specify and model · 2 hours {#st1}

Use a list of task dictionaries with exactly `id`, `duration`, and `requires`. IDs are unique ASCII strings matching a leading letter followed by at most 31 letters, digits or underscores. A duration is a positive finite Python int or float; Boolean values are rejected. `requires` is a list of distinct known IDs. Reject unknown prerequisites and duplicate records before graph traversal. A self-dependency is a cycle. Empty input returns an empty order, empty finish map and critical path, with makespan zero.

For this CPU reference, values accepted as finite inputs must pass math.isfinite; an integer too large for that check is rejected explicitly. Integer-only fixture timing is exact Python arithmetic. Floating durations introduce rounding, and completion overflow is a declared error rather than a valid infinity time. Proofs below describe exact real arithmetic; identify this numerical boundary in your report. Validation copies prerequisite lists so later incidental mutation does not change the stored graph during planning.

| Task | Duration | Immediate prerequisites | Intended role |
|---|---:|---|---|
| A | 2 | none | Diamond root |
| B | 3 | A | First branch |
| C | 4 | A | Longer branch |
| D | 2 | B, C | Diamond join |
| E | 1 | D | Downstream preparation |
| F | 2 | E | Downstream work |
| G | 5 | none | Isolated task |
| H | 3 | F | Final task |

Choose deterministic ties by input order, using a FIFO ready queue and the first maximum prerequisite for critical-path reconstruction. This gives reproducibility without a heap or lexicographic sort. It does not make the returned order unique mathematically. Your contract may choose another rule if you state it and revise the complexity claim.

::: figure #fig-31-1
The eight-task graph marks one longest path A→C→D→E→F→H; isolated G remains part of the makespan calculation.
:::

::: check
If all prerequisites of D are finished but only one worker is free, does this model delay D because another task uses that worker?
:::
::: answer
No. Workers are unlimited here. A finite-worker requirement is a different scheduling problem and needs additional state and constraints.
:::

**Stage gate:** reconstruct all seven edges from the table, state the empty result, and write the cycle fixture X→Y→Z→X before implementing anything.

## Stage 2 · derive and prove · 4 hours {#st2}

Maintain an indegree count equal to the number of incoming edges from vertices not yet removed. Initialise it from prerequisite lists. Place every zero-indegree vertex in the ready queue. Removing v appends it to the order and decrements each outgoing child's count once. A child enters the queue exactly when that count reaches zero. This is Kahn's algorithm with a simple-graph input contract; allowing duplicate prerequisites silently would change the counting obligation.

When v is removed, none of its predecessors remain. Thus every predecessor is already earlier in the output. Induction over removals proves every emitted edge u→v respects position(u)<position(v). Each vertex can enter the queue once, each iteration removes a new vertex, and the finite graph ensures termination. On a DAG the algorithm removes everything: any nonempty remaining acyclic graph has a zero-indegree vertex, as proved in Module 06 by tracing predecessors and ruling out a repeat.

If removal stops early, every remaining vertex has a remaining predecessor. Following such predecessors eventually repeats a vertex in the finite graph, proving a directed cycle exists. A remaining vertex may merely be downstream of that cycle, so returning the entire leftover list is not a cycle witness. The reference performs an iterative colour DFS, keeping an active path and positions. An edge to an active vertex closes the path segment into a genuine directed cycle. The returned witness repeats its start at the end and every adjacent pair is checked against the graph.

### Proof obligations and timing recurrence {#proofs}

For a valid order, define earliest finish F(v)=d(v)+max_(u→v) F(u), with empty maximum zero. Start time is that maximum. This recurrence is not the sum of all predecessor durations: independent branches can overlap. For the fixture, F(A)=2, F(B)=5, F(C)=6, F(D)=8, F(E)=9, F(F)=11, F(G)=5 and F(H)=14. A valid order is A,G,B,C,D,E,F,H, but the finish values do not depend on the chosen valid order.

$$F(v)=d(v)+\max_{u\in\operatorname{pred}(v)}F(u),\qquad \max\varnothing=0,\qquad T=\max_vF(v).$$

Prove the recurrence by induction over the order. Base vertices have no prerequisites and can start at zero. For an inductive vertex, no feasible schedule can start it before its latest predecessor finishes. The previously computed predecessor times attain their lower bounds, and unlimited workers allow v to start at their maximum without delaying another task. Therefore the recurrence both lower-bounds and attains the earliest finish. The maximum finish is the earliest overall makespan under this model.

For a critical-path certificate, remember a predecessor achieving each maximum, then follow parents backwards from a vertex achieving the overall maximum. Reverse that list. It is a directed path, and its durations sum to T by repeated substitution of the recurrence. Every feasible schedule must take at least the duration of any dependency path, so this path supplies a makespan lower-bound certificate. Ties may create several valid critical paths; returning one is sufficient. Zero-task input needs its separately defined empty path rather than an argmax of an empty set.

::: figure #fig-31-2
The indegree invariant proves the order; finish-time induction and a longest-path certificate prove the timing result.
:::

**Stage gate:** submit these proofs in your own words and identify which lines of your code initialise, preserve and use each invariant. A statement that "Kahn is standard" does not replace the proof tied to your edge convention.

## Stage 3 · implement and challenge · 4 hours {#st3}

### Reference planner and contract cases {#lab1}

Run with Python 3.11+; no numerical package is required. Inspect the returned dictionary and the CycleError witness. The six invalid cases exercise duplicate IDs, missing prerequisites, zero duration, NaN, Boolean duration and repeated prerequisite entries. Empty input, exact finish values, every edge's output position and every cycle edge are asserted. Extend the challenges with a self-loop, a cycle plus a downstream tail, an invalid ID and a long chain that would expose a recursive DFS depth limit.

{{LAB:lab1}}

### Operation counts and memory {#complexity}

Building maps and adjacency lists requires O(V+E) expected dictionary/set operations under the usual unit-cost hashing model. Kahn removes V vertices and examines E outgoing edges. The finish pass considers every predecessor edge once, and critical-path reconstruction uses at most V parents. A cycle DFS uses at most V vertices and E edges. Thus these relevant graph passes are O(V+E), with O(V+E) stored graph plus O(V) traversal state. The iterative stack avoids a dependency on Python's recursion limit.

ID parsing, numeric bit lengths, hashing pathological cases and input serialisation are not automatically unit-cost. For bounded IDs and ordinary small durations the model is useful; arbitrary large integer arithmetic requires bit-cost analysis. Canonical checksum sorting is additional work and must not be hidden inside a blanket linear claim. Lab 3 counts removals and inspected edges exactly on chains; it does not mistake one measured runtime for an asymptotic proof.

### Educational checksum and required fault diagnoses {#lab3}

Canonicalise records by sorted IDs and sorted prerequisite lists, serialise keys deterministically, then sum ASCII payload bytes modulo 257. This is a small consistency exercise connecting Module 07 modular arithmetic to a data representation. Equivalent record ordering intentionally has the same checksum; the checksum does not certify a particular queue tie order. One changed digit can change the sum, but compensating digit changes can preserve it. A matching checksum therefore does not guarantee integrity, authenticity or valid scheduling data.

The reference changes A's duration 1→2, detecting a checksum change, then changes B's duration 2→1, restoring the original checksum despite different records. Both changes are valid durations. This is a concrete collision, not merely an abstract warning. Check input validity and mathematical output certificates independently. With a finite residue range and more possible inputs, collisions must also exist by the pigeonhole principle.

{{LAB:lab3}}

::: figure #fig-31-3
Canonical bytes connect to the modular sum; a compensating change leaves the residue unchanged.
:::

**Stage gate:** give actual evidence for the empty case, a cycle witness and each requested input fault, then explain the checksum collision and the scope of your operation count.

## Stage 4 · quantify and report · 4 hours {#st4}

### Exact and simulated duration models {#lab2}

Use a four-task diamond A→B,C→D with d(A)=d(D)=1. B and C each take 1 or 3 with marginal probability one-half. In the independent model their joint outcomes have probabilities one-quarter. Overall duration is T=2+max(B,C), so P(T=3)=1/4 and P(T=5)=3/4. Exact expectation is 9/2 and variance 3/4. Use Fraction weights for exact enumeration, rather than claim a floating sum is symbolic exact arithmetic.

In the shared-delay model, draw one fair duration and set B=C to it. Their marginal distributions are unchanged, but joint outcomes become (1,1) and (3,3), each one-half. Now T has equal mass at 3 and 5, mean four and variance one. This example demonstrates why dependence must be modelled, without asserting that every possible dependence changes a maximum in the same direction.

The recurrence evaluated at marginal means gives 1+max(2,2)+1=4. Independent expected completion is 4.5. In general E[max(B,C)]≥max(E B,E C), because max(B,C)≥each argument; this example gives strict inequality. A deterministic average-duration plan therefore is not generally the expected random makespan. Enumerate the joint duration law or simulate the same joint model before making an expectation claim.

The script uses 20,000 independent simulation replicates for each model and records random.Random seeds 31031/31032. Known-law Monte Carlo SE is sqrt(Var(T)/N); it quantifies simulation error of the mean, not spread of individual project completion times. Since T∈[3,5], a per-model 95% Hoeffding radius is 2sqrt(log40/(2N)), about .019206. This is a separate guarantee for each model, not a claimed simultaneous 95% statement. Pseudorandom code illustrates the ideal sampling model; the exact enumeration remains the reference.

{{LAB:lab2}}

::: figure #fig-31-4
Same duration marginals, different completion laws: independent mass .25/.75 versus shared mass .5/.5.
:::

**Stage gate:** report both exact laws, simulated means, sampling units, SE and bound interpretations. Explain why random duration does not change the deterministic graph-pass operation count. If the graph itself changes, that is a different input model.

## Submission appendix and defence {#appendix}

Use a report of roughly 1,200–1,800 words plus code, figures and tables. Include the input schema and fixture, edge direction, real-arithmetic proof boundary, algorithm invariants, one critical-path trace, invalid/cyclic outputs, complexity model, canonical checksum collision, exact joint-law enumeration, Monte Carlo evidence and worker limitation. Record Python version, command, seeds and any changed fixture. If you alter the reference, regenerate outputs instead of copying its numbers.

For oral or written defence, answer: why does the ready count certify predecessors are already removed? Why do leftovers imply some cycle but not that every leftover is on it? Why is max rather than sum used at a join? Which schedule attains the recurrence? Why does a checksum collision invalidate an integrity guarantee? Why are E[max] and max(E) different? What changes with one or two workers?

## Assessment rubric and exit criteria {#rubric}

| Criterion | Weight | Evidence required for full credit |
|---|---:|---|
| Modelling and contract | 20% | Edge direction, unlimited workers, valid/invalid/empty schema and eight-task fixture. |
| Correctness and termination | 25% | Indegree preservation, order proof, actual cycle certificate and finish induction. |
| Implementation and diagnosis | 20% | Runnable outputs, required faults and a demonstrated checksum collision. |
| Complexity and uncertainty | 20% | Relevant O(V+E) passes, exact joint PMFs, simulation error and dependence explanation. |
| Communication and reproducibility | 15% | Mathematical trace, versions, commands, seeds and stated limits. |

Score each criterion from zero to its weight and cite its artefact. Recommended pass is at least 80/100, **with no missing correctness proof or uncertainty explanation**. A high total does not compensate for those missing obligations. The reference is evidence to compare with, not a completed learner submission merely because it executes.

## Saved defence report and optional extension {#assessment}

<div class="free-response" data-free-response data-key="math-series:m31:report">
<label for="q10-response">Defence report: state your invariant, critical-path argument, cycle witness, checksum counterexample and exact-versus-simulated uncertainty conclusion.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="8" placeholder="Link each claim to an artefact and distinguish model limits from implementation faults."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I supplied both required proofs and the joint-duration uncertainty explanation.</label>
</div>

::: answer
A complete defence links the remaining-predecessor indegree invariant to every output edge, gives a closed real cycle, proves earliest finishes by induction and unlimited-worker attainability, and traces the path summing to 14. The modular collision proves matching checksums insufficient. Exact independent/shared laws give means 4.5/4, while simulation SE measures mean-estimation error. Finite workers require additional scheduling constraints.
:::

The optional extension adds a worker limit and a feasible scheduling policy, then explains why the previous critical-path recurrence remains a lower bound but no longer determines the whole schedule. Three independent two-unit tasks finish at time two with unlimited workers, six with one worker, and four with two. After Module 20, formulate precedence and capacity constraints; label heuristic output separately from any claim of optimality. This extension is outside the fourteen-hour core.

## Reading and next step {#reading}

Revisit Modules [04](module_04_EN.html), [06](module_06_EN.html), [07](module_07_EN.html), [08](module_08_EN.html), [21](module_21_EN.html) and [24](module_24_EN.html) for induction, graph structure, modular arithmetic, complexity, finite probability and Monte Carlo bounds. The capstone derives its recurrence and certificates here. Return to the [course overview](index.html); the AI capstone integrates the numerical learning route.
