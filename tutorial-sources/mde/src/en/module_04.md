## Navigate a model {#s1}

The first three modules established a modelling language and wrote alarm models in it. Now we can ask useful questions without hand-reading every XML element. EOL, the **Epsilon Object Language**, is Epsilon's shared language for navigating and changing models. EVL, EGL, EGX and ETL build on the same expressions, so the queries you learn here will reappear throughout the series.

`Component.all` obtains all elements of that metamodel type. For each component, `c.name` reads an attribute and `c.ports` follows a containment reference. The dot means “navigate from this value to that feature or operation.” The query below prints the components and how many ports each owns.

{{EXAMPLE:m04-nav}}

The program knows the metamodel, not the words `OrGate` or `Siren`. Run it on Module 3's thermostat model and it will navigate that model in the same way. `Port.all` includes `InPort` and `OutPort` instances because they inherit from `Port`. Navigation works through ordinary references too: `connector.source.eContainer().name` follows the source port and then its containing component.

::: keyidea
A query expresses a question in terms of model types and features. When a model changes but still uses the same metamodel, the question can be run again without rewriting it.
:::

## Filter and project collections {#s2}

`Component.all` is a collection. EOL offers operations that reshape collections. `select(c | condition)` keeps items for which the condition is true; `collect(c | expression)` produces a value for each item. Here, `exists(p | p.isTypeOf(OutPort))` asks whether a component has at least one output port. The example selects producing components and sorts them by name before printing.

{{EXAMPLE:m04-filter}}

Read it inside out. `c.ports` gets a component's ports. `exists` answers a yes/no question over those ports. `select` keeps components for which that answer is true. `sortBy(c | c.name)` returns a sorted collection; it does not rename or rearrange elements in the source model. `Siren` has only an input, so it is absent from the output.

A common mistake is to use `collect` when you want to filter. `collect(c | c.name)` turns components into names; it keeps one result per input. `select` keeps the original components, so you can still navigate their ports afterwards. Combine them when needed: select elements, then collect the values to report.

## Quantify and sort {#s3}

A model query often asks “all?” or “any?” rather than producing a list. `forAll` is true when every element meets a condition. `exists` is true when at least one does. The next example asks whether all connectors join ports with equal signal types, and whether any input lacks a connector targeting it.

{{EXAMPLE:m04-quantify}}

The first answer is true: every connector in the alarm links digital ports. The second is also true: `door`, `window` and `armed` have no incoming connector inside the architecture. These are intended external inputs in this example, so “unconnected” is an observation, not automatically an error. Module 5 will add information and rules to decide which inputs need a connection.

`sortBy` sorts a collection using the expression after the bar. For names, it uses string order. Sorting is useful when you need stable output: the order in which a model was written may not be the order a report should use. Keep an eye on what you sort; `Port.all.sortBy(p | p.name)` can contain equal names from different components. For a unique label, include the containing component too.

## Define operations {#s4}

When several queries repeat the same calculation, name it as an operation. In EOL, `operation Component inputCount() : Integer` applies to a `Component`. Inside it, `self` is the component that received the call. The example counts input ports and prints a line for each component in name order.

{{EXAMPLE:m04-operations}}

The main statements appear before the operation definition. This matters in EOL: loose statements placed after the first operation are not executed as part of the main body. An operation is reusable in another EOL query and, with the same model, in EVL constraints or EGL templates. A short operation can also document a domain idea more clearly than repeating a nested `select` expression.

An operation does not have to belong to a metamodel class. EOL can define an operation with no context, called like a function, or one on a built-in type such as `String`. Use a context when the question naturally belongs to an element, such as “how many inputs does this component have?” The [EOL documentation](https://eclipse.dev/epsilon/doc/eol/) describes operation dispatch and the collection operations used here.

## Change a model {#s5}

EOL can update a loaded model as well as read it. The example finds `Siren`, assigns a new value to its `name`, then prints the changed collection of component names.

{{EXAMPLE:m04-mutate}}

The assignment changes the model **in memory** for that run. The local tutorial runner does not save its Flexmi file, and the Playground does not preserve your edits when you close the page. Rerun the unchanged example and `Siren` is loaded again from the original model text. If you want a durable change, edit the Flexmi source or use a suitable persistent model format in a local project.

A modification may also invalidate references named by a path. If you rename `Siren` in the Flexmi model itself, update a connector path such as `Alarm.Siren.sound`. The query above changes an already loaded object, but it does not rewrite the textual reference in the source file. Distinguish editing source text, changing a loaded model, and saving a model resource.

## Choose a useful query {#s6}

A good query answers one question and makes its assumptions visible. “Which components have no outputs?” can be answered directly from ports. “Which inputs are incorrectly unconnected?” needs more domain information: which inputs are external and whether external connections are represented in this model. Do not turn a convenient count into a claim that the architecture is valid.

Before writing an EOL expression, identify the starting type, the path through the metamodel, and the shape of the answer. Use `select` for a subset, `collect` for reported values, `exists` or `forAll` for a Boolean, and `sortBy` when display order matters. If a repeated expression has a meaningful domain name, make it an operation. These choices will make the next modules' validation and generation rules easier to read.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**Choose an operation.** For each question, choose `select`, `collect`, `exists` or `forAll`: (a) names of every component; (b) components with outputs; (c) whether any connector is missing a target; (d) whether every component has a name.
:::

::: solution
(a) `collect`, because it maps components to names. (b) `select`, because it retains a subset of components. (c) `exists`, because one missing target is enough. (d) `forAll`, because the condition must hold for every component. You may combine these operations with navigation and sorting.
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**Read a query.** Explain what `Component.all.select(c | c.ports.exists(p | p.isTypeOf(OutPort)))` returns for the alarm, and why `Siren` is absent.
:::

::: solution
It returns the `Component` elements that have at least one port whose concrete type is `OutPort`: `OrGate` and `AndGate`. `Siren` has only an `InPort`, so its inner `exists` is false and `select` removes it.
:::

::: exercise #e3 level=1 kind=conceptual minutes=5
**Observation or rule?** The quantifier example finds unconnected inputs. Does that prove the alarm is invalid? What extra fact would a validation rule need?
:::

::: solution
No. `door`, `window` and `armed` are supplied from outside the represented architecture. A rule needs to know which inputs are external, or otherwise define which ones must be driven by an internal connector. Module 5 adds such a distinction.
:::

::: exercise #e4 level=1 kind=coding minutes=9
**Find consumers.** Print the names of components with no output ports. Start at `Component.all`, use `select` and `exists`, then print the retained names.
:::

::: solution
Negate `exists` so a component is retained only when no port is an `OutPort`:

{{EXAMPLE:m04-e4-solution}}
:::

::: exercise #e5 level=2 kind=coding minutes=10
**Count outgoing connections.** For each component in alphabetical order, count connectors whose source port is contained by that component. A component with no outgoing connector should print zero.
:::

::: solution
For each component, filter `Connector.all` by the source port's container and take the size:

{{EXAMPLE:m04-e5-solution}}
:::

::: exercise #e6 level=2 kind=coding minutes=11
**Name a reusable label.** Define a `Port` operation returning `ComponentName.PortName`, then print the label of every port in name order. The alarm has two different ports named `open`; how will your labels distinguish them?
:::

::: solution
The operation uses `self.eContainer().name` and `self.name`. The two labels become `OrGate.open` and `AndGate.open`:

{{EXAMPLE:m04-e6-solution}}
:::

## Self-check quiz {#quiz}

```quiz
? What does `Component.all` return?
- [ ] The `Component` class declaration in Emfatic
- [x] All loaded model elements of type `Component`
- [ ] Only the first component
- [ ] A list of component names
> `Type.all` selects instances in the loaded model.

? Which operation keeps the components that satisfy a condition?
- [x] `select`
- [ ] `collect`
- [ ] `println`
- [ ] `sortBy`
> `select` filters a collection while retaining its elements.

? Which operation produces one reported value for each input element?
- [ ] `exists`
- [x] `collect`
- [ ] `forAll`
- [ ] `selectOne`
> `collect` maps each element to the expression's result.

? What is true when `Connector.all.forAll(c | c.source.type = c.target.type)` returns true?
- [ ] At least one connector has matching types.
- [x] Every connector examined has matching endpoint types.
- [ ] Every input is connected.
- [ ] The metamodel is valid.
> `forAll` requires the condition for every item of its collection.

? In a contextual EOL operation, what does `self` mean?
- [ ] The first loaded model
- [ ] The operation's return type
- [x] The element on which the operation was called
- [ ] Every instance of the context type
> `self` is the current receiver, such as one `Component`.

? What happens to the Flexmi file when the mutation example renames `Siren` in this tutorial runner?
- [ ] The file is rewritten with `Bell`.
- [x] The loaded model changes for the run; the source file is not saved.
- [ ] Every connector is deleted.
- [ ] The metamodel is updated.
> The runner does not persist its Flexmi resource.

? Why might a report use `sortBy(c | c.name)`?
- [ ] It changes the metamodel order permanently.
- [ ] It makes all names unique.
- [x] It gives the reported collection a predictable name order.
- [ ] It validates every component.
> Sorting changes the result collection's order, not the source model.
```

## Further reading {#reading}

- The [EOL reference](https://eclipse.dev/epsilon/doc/eol/) documents navigation, operations, collections and model changes.
- The [Epsilon Playground guide](https://eclipse.dev/epsilon/doc/articles/playground/) explains how to edit and rerun the examples.
