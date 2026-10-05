## A graph makes the meaning of an edge explicit {#start}

A file dependency, a friendship, a road, and a program transition can all be drawn as dots joined by lines. Their lines mean different things. Dependencies have direction; friendship might be symmetric; a road may have travel cost; a transition depends on the whole program state. An attractive drawing alone does not establish the mathematical model needed for a correct conclusion.

This module starts with finite graphs and declared conventions. You will count incidences, prove a tree theorem, explain traversal certificates, order prerequisites, and check a bounded retry protocol. Each result states what it guarantees and what information it needs. The same ideas later describe computation graphs, graph data, finite automata, and dependency systems.

**Retrieval check:** describe a relation as ordered pairs, separate an invariant from termination, and explain a linear operation count. Review [Module 03](module_03_EN.html#s2), [Module 04](module_04_EN.html#s6), and [Module 06](module_06_EN.html#s4). Lists and dictionaries in the labs represent finite objects; the mathematical claims do not require a particular Python container.

## Vertices edges walks and representations {#s1}

A **finite simple undirected graph** consists of a finite vertex set V and an edge set E whose elements are two-element subsets of V. The edge {u,v} has two distinct endpoints and no orientation. Simple means there are no self-loops and no parallel copies of an edge. Edges AB and BA denote the same unordered pair under this convention, so storing both as separate edges would double-count.

A **directed graph** uses ordered pairs (u,v), often written u→v. The edge u→v does not imply v→u. We exclude loops and repeated pairs in our examples, although other graph conventions allow them. A loop, a repeated edge, and a weighted edge can each be useful in a different model. State those choices before applying a theorem whose proof counts endpoints or distinct neighbours.

Vertices are labels, not necessarily numbers or positions. A graph drawing assigns coordinates only to make the structure visible; crossing lines do not create a vertex unless one is declared. Moving a dot preserves the graph when the vertex and edge sets are unchanged. By contrast, deleting an isolated vertex changes V even though none of the visible edges change. This distinction matters when counting states or reporting unreachable objects.

An undirected vertex's **degree** is its number of incident edges. In a simple graph this equals the number of neighbours. In a directed graph, indegree counts incoming edges and outdegree counts outgoing edges. A vertex can have high outdegree and zero indegree; treating those numbers as interchangeable could reverse a dependency interpretation. A directed loop, if allowed, contributes one to each directed degree.

A **walk** is a sequence of vertices with an appropriate edge between consecutive vertices. Its length is the number of edges traversed, one less than its vertex count. A **path** here is a walk with no repeated vertex. A **cycle** closes a walk without repeating other vertices; a simple undirected cycle has at least three edges under our conventions. A zero-length path consists of one vertex and establishes its reachability from itself.

::: worked title="Declare a graph before counting it"
Use V={A,B,C,D,E,F} and E={AB,AC,BD,CD,DE}, with all edges undirected. The walk A,B,D,C,A has length four and is a cycle. A,B,D,E is a path of length three. F has degree zero and belongs to V despite being absent from every edge. Degrees in vertex order are 2,2,2,3,1,0.
:::

An **adjacency list** stores each vertex's neighbours. Include an empty list for F. For an undirected graph, each edge appears in two lists; for a directed graph, a list normally records outgoing neighbours only. The distinction affects both interpretation and storage counts. Sorted neighbour lists make our traces reproducible, but sorting is an implementation choice and not part of the graph's mathematical definition.

An **adjacency matrix** uses a declared vertex order and entries Aᵢⱼ=1 when the corresponding edge exists, otherwise zero. For a simple undirected graph it is symmetric and its diagonal is zero. Row sums are degrees. With directed outgoing-edge conventions, row sums are outdegrees and column sums are indegrees. A matrix without its row and column labels leaves the represented relation ambiguous.

::: figure #fig-07-1
One graph appears as edges, adjacency lists, and a labelled symmetric matrix. The all-zero F row preserves the isolated vertex.
:::

For v vertices and e edges, lists occupy O(v+e) entries; an undirected list has 2e neighbour incidences. A dense matrix has v² entries even when almost all are zero. Scanning all neighbours takes degree-dependent work in a list and v entry checks in a matrix. A matrix gives direct indexed edge lookup; an ordinary unsorted list may require scanning neighbours. Choose the representation for the operation and sparsity, rather than declaring one universally faster.

These costs assume small fixed-size labels and constant-cost indexing, with dictionary operations treated under the stated implementation model. They do not prove every hash table lookup has deterministic constant worst-case cost. Graphs with variable-size labels or enormous integer identifiers may incur extra representation work. As in Module 06, an O(v+e) conclusion belongs to a cost model, not to every possible encoding of the same abstract graph.

::: check
For the example, how many neighbour incidences and matrix entries are stored? Does a zero row mean the vertex is missing?
:::
::: answer
There are 2e=10 neighbour incidences and v²=36 matrix entries. The zero row represents the present isolated vertex F. An omitted row would be a different representation or a missing vertex.
:::

## Degree sums connectivity and cycles {#s2}

For every finite undirected graph without loops, the **degree-sum identity** is $\sum_{v\in V}\deg(v)=2|E|$. Count the same incidences in two ways. Grouping by vertices gives the left side; grouping by edges gives two endpoints per edge. This is a double-counting proof for all finite graphs under the convention, not an inference from a few computed degree sequences. If loops are allowed, assigning two incidences to each loop preserves the identity.

::: worked title="Odd-degree vertices come in an even count"
The example has degree sum 10=2·5. Its odd-degree vertices are D and E. In general, even-degree terms contribute an even sum; therefore the sum of odd-degree terms is even. A sum of k odd integers has the parity of k, so k must be even. Three odd-degree vertices would contradict the identity regardless of the drawing.
:::

For a directed graph, $\sum_v\operatorname{outdeg}(v)=|E|$ and $\sum_v\operatorname{indeg}(v)=|E|$. Each directed edge has one source and one target. Adding both sums yields 2|E|, but either one separately counts only e. These identities give useful input checks; they do not by themselves prove a graph is connected or acyclic. Many nonisomorphic graphs share the same degree sequence.

Two vertices of an undirected graph are **connected** when there is a path between them. Reachability by walks gives the same condition: whenever a finite walk repeats a vertex, remove the closed intervening portion until no repetition remains. Connection is reflexive via a zero-length path, symmetric via reversing a path, and transitive via concatenating walks and removing repetition. Thus it is an equivalence relation, connecting this construction to Module 03.

Its equivalence classes are **connected components**. In our example one component is {A,B,C,D,E} and another is {F}. A graph is connected if all vertices lie in a single component; for trees below we additionally require a nonempty graph. The empty graph requires an explicitly chosen convention and is outside our tree theorem. A graph can contain a cycle and still be disconnected elsewhere, as this example does.

Direction changes reachability. From u there may be a directed path to v without a path back. **Strong connection** requires both directions and yields strongly connected components. **Weak connection** ignores orientation before finding components. A one-way chain A→B→C is weakly connected but its three vertices are in separate strongly connected components. The unqualified word connected is inadequate when an application needs directed reachability.

An edge whose removal increases the component count is a **bridge**. DE is a bridge in the example: deleting it separates E. AB is not a bridge because A can still reach B through C,D. An undirected edge on a cycle is not a bridge: the rest of that cycle provides a replacement route. Conversely, if an edge is not a bridge, an alternate endpoint path together with that edge forms a cycle.

Cycle detection must respect the graph type. In a directed traversal, an edge to an active ancestor witnesses a directed cycle. In an undirected traversal, the reverse appearance of the parent edge is expected and is not a two-edge cycle in a simple graph. A routine that flags every already-seen neighbour as a cycle will misclassify even a single undirected edge unless it handles the parent and discovery status correctly.

Degree identities are necessary checks, not complete recognition rules. A list of proposed degrees may have an even sum and still be impossible in a simple graph; for instance a three-vertex graph cannot give one vertex degree three. Similarly, e=v−1 alone does not imply a tree without connectedness or acyclicity. A triangle plus an isolated vertex has four vertices and three edges but is disconnected and cyclic.

::: check
Does degree sum 2e certify connectedness? Give the components and a bridge in our graph.
:::
::: answer
No: the identity holds for disconnected graphs too. The components are {A,B,C,D,E} and {F}; DE is a bridge. Its removal isolates E in addition to the already isolated F.
:::

## Trees rooted structure and the edge theorem {#s3}

A **tree** is a finite nonempty connected undirected graph with no cycle. A **forest** is an undirected graph with no cycle and may have several components, including isolated vertices. Every connected component of a finite forest is a tree. A one-vertex graph with no edges is a tree: it is connected by the zero-length path and has no cycle. Its edge count should be included in any proof claiming all positive sizes.

In a tree there is exactly one path between any two vertices. Connectedness supplies existence. If two distinct paths joined the same endpoints, follow them from the first point where they separate to a point where they meet again; those two different segments form a cycle. Conversely, a connected graph with unique endpoint paths cannot have a cycle, because the two arcs of that cycle would supply two paths between selected cycle vertices.

A **leaf** in an unrooted tree of at least two vertices has degree one. To prove such a tree has a leaf, take a path of maximum length, which exists because the graph is finite. An endpoint cannot have a neighbour outside the path, as that would extend it. It cannot have another neighbour farther along the path, as that would make a cycle. Therefore its only neighbour is the next vertex of the path. Both endpoints are leaves.

::: worked title="A tree with n vertices has n−1 edges"
Induct on positive n. At n=1 the tree has zero edges. For n>1 choose a leaf and remove it with its unique incident edge. The remaining graph is acyclic, and paths between remaining vertices never need the removed leaf as an internal vertex, so it stays connected. It is a tree on n−1 vertices, with n−2 edges by induction. Restoring the one edge gives n−1. The leaf lemma and the preservation of connectedness are essential parts of the proof.
:::

::: figure #fig-07-2
Removing a leaf deletes exactly one vertex and one edge while preserving all paths between the remaining vertices. The one-vertex base case closes the induction.
:::

For a forest with v vertices and c components, summing the tree theorem component by component gives e=v−c. Isolated vertices contribute one vertex and zero edges, so the formula handles them correctly. The empty forest has v=e=c=0 and also satisfies the identity, even though it is not a tree under our definition. This extension is a sum over components rather than an unproved substitution into the connected theorem.

A **rooted tree** chooses one vertex as the root. The root-to-vertex path determines each nonroot vertex's parent; the other neighbours are its children. Depth is the number of edges from the root. Height here is the maximum depth, so a single-node rooted tree has height zero. Other books sometimes count vertices instead of edges; comparing formulas requires checking that convention. Root choice changes depths and parents while preserving the unrooted tree.

A rooted leaf is a node with no children. For a tree with at least two vertices, a degree-one root has a child and is not a rooted leaf, although it is an unrooted leaf. This small distinction explains many confused endpoint counts. The single-node root has no children and is a rooted leaf despite having unrooted degree zero. Definitions should resolve these cases before using a formula such as the full-binary-tree identity from Module 04.

A **spanning tree** uses every vertex of a connected graph and only some of its edges. A traversal's discovery-parent edges form one: every reachable nonroot vertex gets exactly one parent leading back toward the source, so the parent structure connects the component without a cycle. If the original graph is disconnected, traversing all components yields a spanning forest. A search from A in our graph cannot produce a spanning tree containing F because there is no connecting edge.

The edge theorem helps justify minimality. A tree loses connectedness when any edge is removed; its unique endpoint path used that edge. A connected graph with a cycle can lose a cycle edge without losing connectedness, so repeated deletions eventually leave a spanning tree. Finiteness ensures the deletion process ends. Therefore a connected graph needs at least v−1 edges, and a connected simple graph with exactly v−1 edges is a tree.

::: check
How many edges does a forest with nine vertices and three components have? Why can a degree-one root fail to be a rooted leaf?
:::
::: answer
The forest has 9−3=6 edges by summing its component trees. A degree-one root has one child, whereas a rooted leaf has none. Rooted and unrooted leaf definitions differ at that root.
:::

## Traversals reachability and shortest-path certificates {#s4}

**Breadth-first search (BFS)** maintains a first-in-first-out queue. Mark the source discovered, assign it distance zero, and enqueue it. Repeatedly remove the queue front and examine outgoing neighbours. For each undiscovered neighbour, mark it immediately, assign a parent and distance one greater than the current vertex's, then enqueue it. Marking at discovery ensures a vertex enters the queue only once, even when several predecessors point to it.

The queue processes discovered vertices in nondecreasing assigned distance. New neighbours get distance d+1 when a distance-d vertex is processed; they join behind all already waiting vertices. The queue's frontier therefore advances one edge layer at a time. An invariant states that every discovered label is the length of a concrete parent path from the source and that every processed vertex's outgoing edges have been examined. The parent path supplies an upper bound on the shortest distance.

::: worked title="Explain the BFS labels rather than only printing them"
Starting at A and using alphabetic neighbours, processing order is A,B,C,D,E. Distances are A:0, B:1, C:1, D:2, E:3, with parents B←A, C←A, D←B, E←D. A,B,D,E is a three-edge path. No path to E can use fewer edges: E's only neighbour is D, which first becomes reachable in layer two. F receives no finite label because it is outside A's component.
:::

For a general shortest-path proof, suppose a reachable vertex had a shorter path than its BFS label. Along a shortest path choose the first vertex with a label larger than its path-prefix length. Its predecessor has the correct smaller label and is processed before larger-distance vertices. Examining their connecting edge would discover the next vertex with a label no larger than that prefix length, or it would already have such a label. Either case contradicts the choice. Thus the discovered parent path has minimum edge count.

::: figure #fig-07-3
BFS layers have distances zero, one, two, and three. Discovery edges certify paths; the separate isolated vertex remains unreachable.
:::

A returned distance map can also be checked as a **certificate**. Require source label zero, a valid parent edge for each other labelled vertex with distance increasing by one, and the inequality d(v)≤d(u)+1 on every outgoing edge from a labelled u. Require all successors of labelled vertices to be labelled. Parent chains provide paths of the reported lengths, while chaining the inequalities along any source path shows the reported label cannot exceed its length. Together these conditions establish optimality without repeating BFS's exact queue trace.

**Depth-first search (DFS)** explores an undiscovered neighbour recursively before returning to examine the next neighbour. Discovery order is preorder; completion order is postorder. On our alphabetically ordered lists the recursive preorder is A,B,D,C,E, whereas postorder is C,E,D,B,A. Both orders reach the same component as BFS, but the DFS discovery path to C is A,B,D,C even though edge AC exists. DFS parent depth therefore need not be a shortest-path distance.

DFS's conceptual recursion maintains an active path on the call stack. In a directed graph, an edge to a currently active vertex closes a directed cycle. An edge to an already completed vertex does not establish such a cycle. Distinguish undiscovered, active, and finished states when reasoning about DFS; a single visited Boolean proves reachability but does not capture every cycle-detection claim. The stack or an explicit stack representation also uses memory proportional to the maximum exploration depth.

With adjacency lists, each discovered vertex is processed once and each outgoing neighbour entry is scanned once. A full traversal across every component costs O(v+e) in the declared operation model; searching from one source only scans its reachable part, plus any separately initialised bookkeeping. A matrix scan takes O(v²) for a full traversal. Python's deque implements queue removal without shifting all remaining elements; repeatedly using list.pop(0) would add work not covered by the simple queue-operation model.

BFS minimises edge count, which is also total cost when every edge has the same positive weight. For unequal weights, a one-edge route costing ten can be worse than a two-edge route costing one plus one. Running ordinary BFS unchanged does not minimise that total. A weighted shortest-path algorithm requires additional assumptions and a different invariant; do not import the unweighted proof merely because both methods use a frontier.

::: widget name=traversal
Step through BFS from A or the isolated F. Read the queue, discovered distances, parent links, and processed set. The worked trace above remains usable without scripting.
:::

::: check
Why mark at discovery? Can DFS depth replace BFS distance? Does F need a distance of zero?
:::
::: answer
Marking before queueing prevents duplicate enqueues from different predecessors. DFS depth is the length of its chosen parent path and can exceed the minimum. F is unreachable from A, so its distance is absent or explicitly infinite; zero is reserved for the source itself.
:::

## DAGs dependency orders and induction {#s5}

A **directed acyclic graph (DAG)** has no directed cycle. In a dependency model u→v will mean that u must be completed before v. This orientation is a design decision: another application might store the reverse lookup of what v depends on. Declare the meaning rather than inferring it from an arrow style. A **topological order** lists each vertex exactly once and places every source u before its target v for every edge u→v.

::: worked title="An order and a cycle are different certificates"
Let edges be A→C, B→C, C→D, C→E. A,B,C,D,E is a valid order; B,A,C,E,D also works because some tasks are incomparable. Adding D→A creates the cycle A→C→D→A. Any alleged order would require A before C before D before A, an impossibility. Printing vertices in alphabetic order alone is not a proof: every declared dependency must be checked.
:::

Every finite nonempty DAG has a vertex of indegree zero. Otherwise start at any vertex and repeatedly choose an incoming predecessor. A finite graph cannot supply endlessly distinct vertices, so a repetition would produce a directed cycle. The contradiction establishes a starting vertex. Notice the role of finiteness: an infinite backward chain could lack both a zero-indegree vertex and a finite cycle, so this proof does not extend automatically to infinite graphs.

**Kahn's algorithm** repeatedly chooses an indegree-zero remaining vertex, outputs it, and removes its outgoing edges by decrementing remaining indegrees. Its invariant says output vertices respect all already-output dependencies, and remaining indegrees count exactly the predecessors not yet output. Every selected vertex has no unfinished predecessor. Removing a vertex from a DAG leaves a DAG, so the zero-indegree lemma allows the process to continue until all vertices are output.

If vertices remain but none has indegree zero, the remaining graph contains a directed cycle by that same predecessor argument. The blocked set can also include vertices downstream of a cycle, so it is not itself an exact list of cycle vertices. In the example with D→A, B can be processed, while A,C,D,E remain blocked. E is blocked because of C but lies on no directed cycle. A cycle witness requires an actual closed edge sequence such as A,C,D,A.

Topological order need not be unique. A queue chooses a valid ready task according to its insertion order; a heap gives alphabetic tie-breaking in our lab. That reproducibility has a cost: heap insertion and removal add logarithmic factors, so the heap version is not simply the plain O(v+e) queue implementation. A full validation of an order checks both that it is a permutation of V and that position(u)<position(v) for every edge. Missing isolated vertices fail the permutation condition.

A topological order also supports induction over dependencies. Suppose a value at v is computed only from already completed predecessor values. Prove a property for zero-indegree vertices, then assume it for all predecessors when processing v and show the update preserves it. This is ordinary induction on the position in a valid order, with edges establishing which earlier hypotheses are available. It underlies evaluation of acyclic computation graphs and dynamic programs.

For a simple scheduling example, give each task a nonnegative duration and unlimited parallel workers. Its earliest finish is its duration plus the maximum predecessor finish, with maximum zero when there are no predecessors. In our DAG, durations A=2, B=5, C=3, D=4, E=1 give finishes 2,5,8,12,9. The total makespan is 12. Summing all durations gives 15 and describes serial work, not the unlimited-parallel completion time.

This recurrence assumes tasks start as soon as dependencies finish, durations are fixed, and resources do not conflict. With one worker, memory limits, shared devices, or uncertain durations, that calculation need not describe a feasible schedule. A DAG models precedence, not every scheduling constraint. Keeping the assumptions visible helps a learner transfer the same graph to build systems or AI computation without promising unrealistic throughput.

::: check
After adding D→A, does every blocked vertex lie on a cycle? How would you validate a proposed topological order?
:::
::: answer
No: E is blocked downstream of the A,C,D cycle. Validate that the order contains each vertex exactly once, then check every edge's source appears before its target. A cycle cannot pass this edge-by-edge test.
:::

## Finite state machines safety and exploration limits {#s6}

A **state-transition system** specifies a state set S, permitted initial states, and a directed transition relation. An event labels an allowed change, but the state must contain enough information to determine its permitted successors. Two situations that look identical at the control-flow level may have different futures because their counters or flags differ. The model's vertex is the whole state, not merely the line of code currently executing.

A two-control-state retry protocol uses idle and waiting. A send changes idle to waiting; an acknowledgement returns waiting to idle. To discuss a bounded implementation, also record the number of sends and whether an acknowledgement has been seen. These are **product states**: a state is a tuple of control, count, and flag. With two control values, counts zero through two, and two flag values there are twelve possible tuples, although only a subset are reachable under the declared rules.

::: worked title="A timeout must not pretend delivery was acknowledged"
Start at (idle,0,false). Send gives (waiting,1,false), retry gives (waiting,2,false), and acknowledgement from either waiting state gives (idle,count,true). Define safety: if control is idle and count>0, an acknowledgement must have been seen. A faulty timeout changes (waiting,2,false) to (idle,2,false), violating that rule. The three-event witness is send, retry, timeout. The repair keeps waiting on timeout; it preserves safety in this bounded model.
:::

::: figure #fig-07-4
The reachable product states distinguish initial idleness, waiting attempts, acknowledged completion, and the faulty unacknowledged return. A repaired timeout is a self-loop rather than a false completion.
:::

To **explore** a finite model, run BFS or DFS from the initial state, generating exactly the declared successors. Keep a visited set of complete state tuples and a parent event for newly discovered states. BFS's first path to a bad state is a shortest counterexample in number of model transitions. A trace names a concrete sequence of permitted changes and its violating state; merely reporting that an assertion failed would omit useful evidence for repairing the transition rule.

For a safety predicate I, an inductive invariant proof checks all initial states satisfy I and every permitted transition from an I-state preserves I. Induction on finite execution length then proves all reachable states satisfy I, including arbitrarily long executions. Exhaustive checking instead computes reachable states and tests I there. On a complete finite model it decides that model's reachable-state safety; a general symbolic invariant may cover a much larger or unbounded system.

The lab finds six reachable states in the faulty model, including one unsafe tuple, and five in the repaired model. The unreachable tuple (idle,2,false) still belongs to the ambient product domain. It is unreachable because of the repaired rules, not because the tuple is syntactically impossible. Conversely, some unreachable tuples might violate I without affecting reachable-state safety. An inductive proof may strengthen I to exclude such tuples if its transition-preservation obligation otherwise fails.

**Safety** says a forbidden event or state never occurs. **Liveness** asks that a desired event eventually occurs. The repaired waiting-timeout self-loop is safe but permits an infinite execution that never receives acknowledgement. Neither finite reachability nor the absence of an unsafe state establishes eventual delivery. A liveness argument would need additional assumptions about the environment, such as a justified fairness condition, and a proof that those assumptions imply progress.

Exhaustiveness is only as complete as the chosen model. We permit at most two sends, one request, no cancellation, and no delayed-message or concurrent behaviour. Checking those states does not prove an unlimited-retry network implementation correct. Omitting a counter from the state can collapse situations with different legal retries; omitting message contents can hide a wrong-recipient acknowledgement. An abstraction requires its own argument about which real behaviours it represents.

The potential number of product states grows quickly when components are combined. Independent-looking flags, counters, and processes multiply the domain size even before transitions are generated. Reachable-state search can remain practical for small educational models while becoming costly for real software. A bounded test offers a useful counterexample or a precisely scoped checked claim; a proof, a sound abstraction, or a different analysis may be needed for a larger conclusion.

::: check
Does checking the repaired five-state model prove that acknowledgement eventually arrives, or that an unlimited implementation is safe?
:::
::: answer
Neither. The timeout self-loop permits waiting forever, and the checked model bounds sends and omits several real behaviours. The established claim is safety of all reachable states under these particular finite transition rules.
:::

## Common misconceptions and failure cases {#misconceptions}

| Claim | Why it fails | Repair |
|---|---|---|
| A line crossing creates a vertex | Drawings can cross without an endpoint | Read the declared V and E |
| Degree sum certifies connectivity | It holds in every component | Supply reachability or component evidence |
| e=v−1 proves a tree | A triangle plus an isolated vertex is a counterexample | Add connectedness or acyclicity as appropriate |
| DFS parent depth is shortest distance | It can take a long detour before discovering a neighbour | Use BFS for minimum edge count |
| BFS minimises arbitrary travel costs | Edge count differs from total unequal weight | Choose an appropriate weighted algorithm |
| Every Kahn-blocked vertex is on a cycle | Downstream tasks also remain blocked | Give an explicit directed cycle witness |
| Finite safety checking proves eventual success | Safe self-loops can wait forever | State and prove a separate liveness claim |
| Control labels are complete states | Counters, flags, and messages affect successors | Include the relevant product-state information |

## Three CPU labs {#labs}

Each script uses the Python standard library and runs locally without a GPU. Predict the graph facts and witness first. Downloaded scripts are the exact sources executed for the displayed output.

### Lab A Lists matrices and rejected graph inputs {#lab1}

**Predict:** write F's list and matrix row; compute the degree sum. **Run:** execute the script. It builds both representations and rejects a loop, a duplicate undirected edge, and an unknown vertex. **Explain:** why AB and BA are duplicates under this convention, while the all-zero F row must remain. **Change:** remove AC, predict which cycle disappears, and rerun after updating the edge count checks.

{{LAB:lab1}}

### Lab B Traversals and topological certificates {#lab2}

**Predict:** BFS distances from A, recursive DFS preorder, and a valid dependency order. **Run:** inspect the returned parents and assertions checking local distance inequalities. **Explain:** why C's DFS parent route can be longer than its BFS route, and why E can be blocked without lying on a directed cycle. **Change:** reverse neighbour orders and distinguish changed parent choices from unchanged shortest distances. The heap chooses alphabetic ready tasks and adds its own overhead.

{{LAB:lab2}}

### Lab C A bounded protocol repair {#lab3}

**Predict:** trace send, retry, timeout and evaluate the declared safety predicate. **Run:** compare faulty and repaired reachable states. **Explain:** the scope of the five-state safety result and the possible infinite timeout execution. **Change:** permit a third send, expand the count domain and successor rule consistently, and check whether the same repair preserves the intended predicate. Do not describe this toy model as a verified network protocol.

{{LAB:lab3}}

## Exercises with full solutions {#exercises}

Exercises 1–12 are required; 13–14 are extensions. Prove claims for the declared graph conventions and give an actual edge sequence for a cycle witness.

::: exercise #e1 level=1 kind=calculation minutes=5
For the undirected example, list D's neighbours, the degree sum, and the connected components.
:::
::: solution
D has neighbours B,C,E and degree three. Degrees 2,2,2,3,1,0 sum to ten, twice the five edges. Components are {A,B,C,D,E} and {F}; no edge reaches F.
:::

::: exercise #e2 level=1 kind=calculation minutes=5
For directed edges A→B, A→C, C→B, give indegrees and outdegrees in order A,B,C. Check both sums.
:::
::: solution
Indegrees are 0,2,1; outdegrees are 2,0,1. Each sum is three, the edge count. Summing both gives six endpoint incidences.
:::

::: exercise #e3 level=1 kind=calculation minutes=5
A forest has twelve vertices and four components. How many edges? Can this graph be a tree?
:::
::: solution
Summing nᵢ−1 over four component trees gives 12−4=8 edges. It is not a tree because it has four components rather than one.
:::

::: exercise #e4 level=1 kind=conceptual minutes=5
From A in the example, give BFS distances to D,E,F and a path certifying E's label.
:::
::: solution
D has distance two, E three, and F is unreachable. A,B,D,E is a three-edge path to E. F's absence from the finite distance map is intentional, not a zero-distance assignment.
:::

::: exercise #e5 level=2 kind=proof minutes=14
Prove the degree-sum identity for finite simple undirected graphs and deduce that the odd-degree vertex count is even.
:::
::: solution
Count vertex-edge incidences by vertex to get the degree sum and by edge to get two per edge. Thus the sum is even. Removing the even-degree terms preserves parity; a sum of k odd terms has parity k, so k is even. The argument includes isolated vertices contributing zero.
:::

::: exercise #e6 level=2 kind=proof minutes=14
Prove the tree edge theorem by deleting a leaf. Include the leaf's existence and preservation of connectedness.
:::
::: solution
For n=1 there are zero edges. For n>1 a longest path exists by finiteness; an endpoint's extra neighbour would either extend it or close a cycle, so it is a leaf. Deleting that leaf and its edge leaves an acyclic graph. Paths between remaining vertices never use a degree-one vertex internally, so the graph stays connected. Induction gives n−2 edges in the remaining tree, hence n−1 after restoration.
:::

::: exercise #e7 level=2 kind=proof minutes=14
Prove a finite nonempty DAG has a zero-indegree vertex. Explain why the proof needs finiteness.
:::
::: solution
If every vertex had a predecessor, repeatedly choose one. In a finite set some vertex repeats; following the chosen predecessor edges in their forward orientation yields a directed cycle, contradicting acyclicity. An infinite chain indexed by integers can have incoming predecessors everywhere without a finite cycle, so repetition cannot be assumed outside the finite domain.
:::

::: exercise #e8 level=2 kind=application minutes=10
For edges A→C, B→C, C→D, C→E, validate order B,A,C,E,D and compute earliest finishes with durations 2,5,3,4,1 for A,B,C,D,E and unlimited workers.
:::
::: solution
The order contains all five vertices once and every source precedes its target. Finishes are A=2, B=5, C=max(2,5)+3=8, D=8+4=12, E=8+1=9. Makespan is twelve under the unlimited-worker assumptions; serial total work is fifteen.
:::

::: exercise #e9 level=2 kind=application minutes=10
A source-distance certificate has valid parent paths, source label zero, and d(v)≤d(u)+1 for each edge from a labelled u, with all its successors labelled. Explain why it proves minimum edge counts.
:::
::: solution
Following parents gives a source path of length d(v), hence shortest distance≤d(v). Along any source path of length k, repeated edge inequalities give d(v)≤k. Applying this to a shortest path gives d(v)≤shortest distance. The two inequalities establish equality. Successor closure ensures no reachable vertex is silently omitted.
:::

::: exercise #e10 level=2 kind=application minutes=10
State the full tuple and safety predicate in the protocol. Trace the shortest faulty timeout witness, and state what the repaired exhaustive result actually proves.
:::
::: solution
The tuple is (control,send_count,ack_seen). Safety is idle and count>0 implies ack_seen. Send, retry, timeout reaches (idle,2,false) from (idle,0,false) and violates it. Timeout is enabled only at count two, so three events are required. The repair makes timeout a waiting self-loop; all five reachable states satisfy safety for this bounded single-request model. Eventual acknowledgement and larger implementations remain separate claims.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=10
A report says “four vertices, three edges, therefore a tree.” Find a simple counterexample and repair the criterion. Then diagnose “every blocked task is cyclic.”
:::
::: solution
A triangle plus an isolated vertex has v=4,e=3 but is disconnected and cyclic. Add connectedness: a connected graph needs v−1 edges for a spanning tree, and an additional cycle would allow deletion while keeping connectedness, contradicting that minimum. In Kahn's algorithm downstream vertices may also be blocked; E in the modified DAG is a concrete example. Supply a closed edge sequence to identify a cycle.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=10
BFS chooses a direct edge of weight ten over two edges of weight one each. A developer calls this a shortest-path proof and says a safe timeout loop proves delivery. Diagnose both conclusions.
:::
::: solution
BFS proves minimum edge count under this traversal, not minimum unequal-weight sum; the two-edge route costs two. A timeout self-loop can preserve safety forever while never delivering an acknowledgement. Delivery is liveness and needs an additional progress argument and environmental assumptions.
:::

::: exercise #e13 level=3 kind=proof minutes=15
Extension: prove an edge of a finite simple undirected graph is a bridge exactly when it lies on no cycle.
:::
::: solution
If the edge lies on a cycle, the rest of that cycle replaces it in endpoint routes, so removing it preserves connectivity within the original component. Conversely, if removal does not separate its endpoints, take an alternate endpoint path in the remaining graph. Adding the removed edge closes a cycle containing it. If endpoints were separated, component count increases, which is the bridge definition.
:::

::: exercise #e14 level=3 kind=application minutes=20
Extension: allow three sends in the repaired protocol. Predict reachable tuples and explain whether permitting infinitely many consecutive timeouts affects safety or liveness.
:::
::: solution
Reachable states are initial (idle,0,false), waiting(k,false) for k=1,2,3, and idle(k,true) for k=1,2,3: seven tuples. Retry increases k until three; acknowledgements return with true. A timeout self-loop at the maximum count introduces no unsafe tuple, so safety remains. Repeating it indefinitely still gives an execution with no acknowledgement, hence liveness is not established. This seven-state check still excludes unlimited counters and concurrent requests.
:::

## Self-check quiz {#quiz}

The automatic score covers Questions 1–9. Question 10 is written and self-reviewed; the two activities test different kinds of evidence.

```quiz
? What is an undirected simple edge?
- [x] A two-element subset of the vertex set
- [ ] An ordered pair whose reverse must be different
- [ ] Any line crossing in a drawing
> The unordered pair identifies two distinct endpoints. Direction belongs to a directed model, and drawing crossings are not vertices unless declared.

? What does the undirected degree sum equal?
- [ ] |E|
- [x] 2|E|
- [ ] |V|−1 in every graph
> Each edge supplies two incidences. |E| is the directed indegree or outdegree sum; |V|−1 is a tree edge count, not a general degree sum.

? Which condition defines our finite tree?
- [ ] Exactly v−1 edges alone
- [ ] No isolated vertices alone
- [x] Nonempty, connected, undirected, and acyclic
> Connectivity and absence of cycles are both required. A triangle plus an isolated vertex refutes the edge-count-only criterion; absence of isolated vertices also permits cycles.

? Why mark a BFS vertex before enqueueing it?
- [x] To avoid multiple enqueues from different predecessors
- [ ] To remove the need for outgoing edges
- [ ] To turn unequal weights into equal ones
> Discovery marking controls repeated work. The graph edges remain needed, and marking has no effect on their weights.

? What does ordinary BFS minimise?
- [ ] Every possible edge-weight sum
- [x] Number of edges on a source path
- [ ] The alphabetic order of the path
> FIFO layers minimise edge count. Unequal-weight costs require different reasoning; alphabetic neighbours only break ties in discovery.

? What validates a topological order?
- [ ] Alphabetic sorting of labels
- [ ] Every vertex has even indegree
- [x] Every vertex occurs once and each edge points forward in the order
> Both permutation and edge conditions matter. Label sorting and degree parity do not establish dependency precedence.

? What can Kahn's blocked set include?
- [x] Cycle vertices and vertices downstream of cycles
- [ ] Only vertices lying on a cycle
- [ ] Only isolated vertices
> Downstream prerequisites remain unfinished too. Isolated vertices have indegree zero and can be processed; give an explicit cycle witness for the cyclic subset.

? What is a complete protocol state in our lab?
- [ ] The control label alone
- [x] The tuple of control, send count, and acknowledgement flag
- [ ] Only the last event name
> All three components affect permitted successors and the predicate. A control label or event alone loses relevant information.

? What does the repaired finite exploration establish?
- [ ] Every network request eventually succeeds
- [ ] All unlimited concurrent implementations are safe
- [x] All reachable states of the specified bounded model satisfy safety
> The checked model is finite and explicitly restricted. Timeout loops defeat automatic liveness conclusions, and real implementation coverage needs another argument.
```

<div class="free-response" data-free-response data-key="math-series:m07:q10">
<label for="q10-response">10. Explain why BFS labels are minimum edge counts. Include a parent-path witness, an edge inequality, and the weighted-cost limitation.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State the graph assumptions and both directions of the certificate argument."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I compared my argument with the model and included the graph assumptions.</label>
</div>

::: answer
For a finite unweighted graph, source label zero and valid parent edges produce a source path of length d(v), so the minimum is at most d(v). Successor closure and d(v)≤d(u)+1 on every outgoing edge imply d(v) is at most every source-path length, hence at most the minimum. Together they give equality. Ordinary BFS supplies this certificate by processing FIFO layers. Unequal edge weights make edge count and total weight different objectives; this proof does not optimise their sum. A response needs both inequalities, not merely a claim that the queue “looks shortest.”
:::

## Reading with a purpose {#reading}

Use [MIT Mathematics for Computer Science](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/) for graph, tree, and state-machine selections. Use [MIT's handshaking, connectivity, and trees notes](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2005/resources/slides5m/) to compare graph conventions. Read the BFS and DFS/topological sorting selections in [MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). These are external primary readings; the lesson and required exercises are original.

| When | Selection and question |
|---|---|
| Session 2 · 15 minutes | Trees and BFS: where do finiteness and the unweighted assumption enter the proofs? |
| Session 4 · 5 minutes | State machines: which state components determine successors, and which claim is safety? |

Treat a reading as a comparison of definitions and arguments. Reconcile any differences in path, leaf, or height conventions before transplanting a formula.

## Retrieval exit task and next step {#summary}

Without notes, define our tree, prove its edge count, describe BFS's discovery rule, and give both a valid topological order and a cycle witness. Explain why a shortest-edge certificate does not minimise arbitrary weights and why a safe finite protocol need not deliver eventually.

**Exit task:** add an isolated vertex G to the example. State the new degree sum and component count; explain the unchanged distances from A and the effect on a full spanning forest. For a forest built by traversals, there are now seven vertices and three components, hence four discovery edges. The original graph still has five edges and degree sum ten; its nonforest cycle edge is not a discovery edge.

**Ready to move on:** you can distinguish the abstract graph, its representation, a traversal witness, and the scope of a correctness claim. The discrete branch next studies modular arithmetic and invertibility. See the [course overview](index.html) for lesson availability.

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| V,E | Vertex set, edge set | 顶点集、边集 |
| Degree / indegree / outdegree | Undirected incidences / incoming / outgoing counts | 度、入度、出度 |
| Walk / path / cycle | Edge sequence / no repeated vertex / closed simple route | 游走、路径、环 |
| Component / bridge | Connected class / edge whose removal disconnects | 连通分量、桥 |
| Tree / forest | Connected acyclic nonempty graph / acyclic graph | 树、森林 |
| Root / parent / depth / height | Chosen origin / predecessor / edge distance / maximum depth | 根、父节点、深度、高度 |
| BFS / DFS | Breadth-first / depth-first search | 广度优先搜索、深度优先搜索 |
| DAG / topological order | Directed acyclic graph / dependency-respecting permutation | 有向无环图、拓扑序 |
| Product state / invariant | Complete component tuple / preserved predicate | 乘积状态、不变式 |
| Safety / liveness | Forbidden behaviour absent / desired progress eventually occurs | 安全性、活性 |
