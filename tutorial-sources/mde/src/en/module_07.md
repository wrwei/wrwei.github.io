## Two metamodels and one mapping {#s1}

The component model describes ports and wiring. A graph model needs only nodes and directed edges. **Model-to-model transformation** translates between these languages: the source model conforms to the component metamodel, and the target model conforms to a separate graph metamodel. The transformation must decide what to preserve, what to omit and how to reconnect references.

Here, each `Architecture` becomes a `Graph`, each `Component` becomes a `Node`, and each `Connector` becomes an `Edge`. Port names disappear in the simplest version. This is deliberate: a graph algorithm can work at component level without knowing the component language's port details. **ETL**, the Epsilon Transformation Language, defines the mapping in rules. Its rule bodies use EOL expressions from Module 4.

## Write ETL rules {#s2}

The first program has three rules. `Architecture2Graph` creates the root and populates its contained nodes and edges. `Component2Node` copies a component name. `Connector2Edge` links the graph nodes corresponding to the components at its two endpoint ports.

{{EXAMPLE:m07-basic}}

Read the captured target tree. It has a graph named `Alarm`, three nodes and two edges. The target metamodel is visible under the ETL program. `Source!Component` and `Target!Node` specify types in different models; they avoid mistaking a source component for a target node. `g.nodes ::= a.components` uses ETL's special assignment: assign each source component's **transformed counterpart**, not the source component itself.

A transformation is not just an export. It creates another model with its own types and relationships, ready for another model-management task. The local runner prints the target model's containment tree so you can inspect it; it does not persist the target as an XMI file for this lesson.

## Resolve transformed counterparts {#s3}

ETL keeps a transformation **trace** connecting source elements to the target elements produced for them. `equivalent()` asks for a source element's transformed counterpart. The next program performs the same mapping as the first, but calls `equivalent()` explicitly when it fills the target graph and links edge endpoints.

{{EXAMPLE:m07-equivalent}}

Compare the two outputs: they are the same graph. `::=` is shorthand for the common case in which a target feature receives an equivalent target element. An explicit `equivalent()` is useful when you want to calculate, select or combine counterparts in a larger expression. Neither form is a lookup by matching names: the trace records which rule created which result.

## Guards and lazy rules {#s4}

A **guard** restricts which source elements a rule transforms. In the next source model, the second connector joins a digital output to an analog input. The guarded connector rule creates an edge only when the two port types match. All three components still become nodes, but only the compatible connection becomes an edge.

{{EXAMPLE:m07-guard}}

This is a policy choice, not a replacement for validation. Silently dropping an invalid connector may be dangerous for a downstream task. A project can first run EVL to reject the model, or deliberately transform only valid connections while reporting omissions. The example isolates the guard's effect so you can see it.

A **lazy** rule runs only when an equivalent is requested. The next example maps ports, rather than components, to graph nodes. `Architecture2Graph` requests `Port2Node` for each port. Because `Port` is abstract and the instances are `InPort` and `OutPort`, the rule uses `@greedy` to match subclasses as well as the exact type.

{{EXAMPLE:m07-lazy}}

The result has seven nodes labelled with both the owning component and port name. Without `@greedy`, this rule would not apply to the concrete port subclasses in Epsilon 2.8.0; the requested counterparts would be missing. `@lazy` avoids creating port nodes unless a rule asks for them. Use it for results that are conditional or expensive, not to conceal rules whose products should always exist.

## Primary rules and trace {#s5}

Sometimes more than one rule transforms the same source type. In the next example, `Component2Node` makes the ordinary node and `Component2Audit` makes a second, audit node. `@primary` puts the ordinary node first when `equivalent()` chooses one counterpart.

{{EXAMPLE:m07-primary}}

The graph contains the three ordinary nodes. The audit nodes are also produced by their non-lazy rule; the local target printer shows them as separate roots because no graph contains them. **Primary does not suppress other rules.** It controls which counterpart comes first for a single-element `equivalent()` lookup. If a target model should contain only graph-owned nodes, remove the audit rule or give its results a deliberate home. The [ETL reference](https://eclipse.dev/epsilon/doc/etl/) describes rule scheduling, `equivalent()` and `equivalents()`.

## Check the target model {#s6}

A transformation can run successfully yet lose information you needed. The basic graph drops port names and signal types. The guarded graph drops an incompatible connection. The primary-rule graph has extra uncontained audit nodes. Read the target metamodel and the printed target tree together to see exactly what exists after transformation.

For a real mapping, write down the intended invariants: the number of nodes expected, which connectors become edges, whether names remain unique, and whether every edge endpoint belongs to the target graph. Validate the source before transforming when the mapping assumes well-formed wiring, then inspect or validate the target too. Module 10 applies this pattern to a second domain.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**Map the types.** List the source type that becomes each of `Graph`, `Node` and `Edge`. Which source information does the basic target omit?
:::

::: solution
`Architecture` becomes `Graph`, `Component` becomes `Node`, and `Connector` becomes `Edge`. The basic target omits ports, their names and signal types; it keeps only component names and component-level connections.
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**Read `::=`.** Why is `g.nodes ::= a.components` meaningful while assigning `a.components` directly to target `Node` containment would be wrong?
:::

::: solution
The right-hand side contains source `Component` elements. ETL's `::=` resolves their transformed `Node` counterparts and assigns those to `g.nodes`. Direct assignment would mix elements from incompatible metamodels.
:::

::: exercise #e3 level=1 kind=conceptual minutes=5
**Interpret primary.** In the primary example, why are audit nodes printed even though the graph's `nodes` contain only ordinary nodes?
:::

::: solution
`Component2Audit` is non-lazy, so it still runs for every component. `@primary` makes ordinary nodes the first counterpart selected by `equivalent()`; it does not disable the audit rule. The audit nodes remain separate target roots because nothing contains them.
:::

::: exercise #e4 level=2 kind=coding minutes=10
**Keep an edge label.** Extend the target `Edge` with a `label` attribute and set it to `<source port> to <target port>` in `Connector2Edge`. Check that two labelled edges are present.
:::

::: solution
The target metamodel already has the label feature in this module's examples. The rule assigns it while retaining both endpoint mappings:

{{EXAMPLE:m07-e4-solution}}
:::

::: exercise #e5 level=2 kind=coding minutes=10
**Test a guarded model.** Run the guarded transformation on the correctly typed alarm. How many edges should the result contain, and why?
:::

::: solution
Both connectors pass the type guard, so both become edges:

{{EXAMPLE:m07-e5-solution}}
:::

::: exercise #e6 level=2 kind=coding minutes=10
**Request only output ports.** Adapt the lazy example so the graph receives nodes only for `OutPort` instances. Use their full `Component.Port` labels. Do you still need `@greedy`?
:::

::: solution
The rule now matches the exact concrete `OutPort` type, so `@greedy` is unnecessary. The graph contains the two output ports:

{{EXAMPLE:m07-e6-solution}}
:::

## Self-check quiz {#quiz}

```quiz
? What does an ETL transformation produce?
- [ ] Only formatted text
- [x] A target model conforming to another metamodel
- [ ] A new Git branch
- [ ] Only warnings
> ETL maps elements and relationships into a target model.

? What does `Source!Component` identify?
- [x] The `Component` type in the source model
- [ ] A Java class generated by EGL
- [ ] A target graph node
- [ ] A Flexmi filename
> Model-qualified types distinguish source and target languages.

? What does ETL's `::=` do here?
- [ ] Assign the source element directly to the target.
- [x] Assign transformed counterpart elements.
- [ ] Delete the source model.
- [ ] Sort target nodes.
> Special assignment resolves equivalents through the transformation trace.

? What does a guard on `Connector2Edge` control?
- [ ] Whether the source metamodel parses
- [x] Which connectors this rule transforms
- [ ] The names of all nodes
- [ ] Whether every rule is lazy
> A false guard skips the rule for that source element.

? Why does the lazy `Port2Node` rule use `@greedy`?
- [ ] To create extra copies of each node
- [ ] To write files faster
- [x] To match `InPort` and `OutPort` instances through their abstract `Port` supertype
- [ ] To suppress the architecture rule
> Without it, exact-type matching would miss the concrete subclasses.

? What does `@primary` guarantee in the example?
- [ ] No other rule transforms a component.
- [x] The ordinary node is first when a single equivalent is selected.
- [ ] Audit nodes are deleted.
- [ ] Every edge is compatible.
> Primary affects counterpart ordering, not whether other rules execute.

? What should be checked after a transformation?
- [ ] Only that the program had no parse error.
- [x] That the target has the intended nodes, edges and preserved information.
- [ ] Only the source filename.
- [ ] Whether the HTML renderer ran.
> A successful run can still omit or mis-map data.
```

## Further reading {#reading}

- The [ETL reference](https://eclipse.dev/epsilon/doc/etl/) documents rules, guards, traces, lazy and primary behaviour.
- The [EOL reference](https://eclipse.dev/epsilon/doc/eol/) explains expressions used inside rule bodies.
