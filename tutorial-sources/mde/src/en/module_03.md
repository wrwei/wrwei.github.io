## Flexmi and the metamodel {#s1}

Module 2 defined a component-and-connector language in Emfatic. A **metamodel** names its kinds of elements (`Architecture`, `Component`, `InPort`, `OutPort`, `Connector`), the values they hold and the ways they relate. This module is about writing **models** in that language. A model records particular things: an architecture named `Alarm`, an `OrGate` with an output named `open`, and a connector to another port.

We write models in **Flexmi**, a compact notation for EMF models. Flexmi has XML and YAML flavours. It uses the metamodel to interpret the text, so a small Flexmi file can create a sizeable object graph. The same model can then be queried, validated or transformed by Epsilon. Here we use a short EOL query to reveal what loaded; Module 4 will teach EOL in depth.

The workflow is: read the metamodel, write the model, run the query, then inspect the model diagram. The output beneath each example was captured during the build on Epsilon 2.8.0. The browser Playground runs the examples too, but it does not show every model-loading warning. We will deliberately encounter one in Section 5.

::: keyidea
A Flexmi file is a *concrete syntax* for a model. Its element types, features and relationships come from the metamodel; changing the syntax does not change those concepts.
:::

## XML nesting and elements {#s2}

Open the first example and compare its two visible files. `components.emf` declares `Architecture`, its containment references `components` and `connectors`, and the port classes. `alarm.flexmi` begins with `<?nsuri components?>`, which selects that metamodel's namespace. The `<architecture name="Alarm">` element then creates one `Architecture` instance.

{{EXAMPLE:m03-xml}}

Read the XML from the outside in. Each `<component>` is nested under `<architecture>` because the architecture contains its components. Each `<inPort>` or `<outPort>` is nested under its component because `Component.ports` is a containment reference. The two `<connector>` elements also sit under the architecture. Their `source` and `target` attributes are **ordinary references**, not nested port definitions.

In this model the three components contain seven ports and the architecture contains two connectors. The query prints exactly those counts. Run it, then delete the `Siren` element and the connector pointing to it. Predict what the counts will be before running it again. You will see that a small textual edit changes the object graph the program reads.

Flexmi matches XML tags to metamodel class and containment-feature names. A `<component>` inside an architecture becomes a `Component`; an `<inPort>` inside a component becomes an `InPort`. This matching is deliberately flexible, so do not treat the tag spelling as a strict parser check. When a model behaves unexpectedly, inspect its diagram and query the types and values rather than assuming that every typo will raise an error. The [Flexmi documentation](https://eclipse.dev/epsilon/doc/flexmi/) explains its matching rules.

## References by name {#s3}

Containment gives every port a place in the model tree, but connectors need to link ports in different branches. Flexmi resolves an ordinary reference using an element's identifier. Without an explicit ID attribute, it uses `name` where available. A fully qualified path starts at the named root and follows named containers down to the target.

The alarm contains two different ports named `open`: an output on `OrGate` and an input on `AndGate`. A bare `open` would not clearly identify one of them. The first connector therefore uses `Alarm.OrGate.open` for its `source` and `Alarm.AndGate.open` for its `target`. The query prints each endpoint with its containing component to make the distinction visible.

{{EXAMPLE:m03-references}}

Trace the second connector the same way: `Alarm.AndGate.sound` to `Alarm.Siren.sound`. Its two ports also share a short name. In Epsilon 2.8.0, use full paths beginning at the root for reliable reference resolution. The newer Flexmi documentation describes partial paths introduced in later versions; this series builds and checks examples on 2.8.0.

::: pitfall
If you rename a component or port, update every path that names it. The XML nesting creates the element, but a connector's `source` or `target` text must still resolve to that element.
:::

## YAML in Epsilon 2.8 {#s4}

Flexmi can also read YAML. The next example describes the **same alarm** with the **same metamodel** and runs the **same query** as the XML example. Compare the captured outputs: the architecture, component, port and connector counts are identical.

{{EXAMPLE:m03-yaml}}

Notice the 2.8 syntax. `?nsuri: components` selects the metamodel. Beneath `architecture:`, a sequence of entries records the root's properties and contained elements. An entry such as `- component:` introduces a component; entries indented below it set that component's `name` and add its ports. A connector can be written compactly as `- connector: {source: ..., target: ...}`. Indentation matters, so use spaces consistently.

The [current Flexmi documentation](https://eclipse.dev/epsilon/doc/flexmi/) shows a revised YAML mapping for Epsilon 2.9 and later, with `$nsuri`. This series' runner uses 2.8, and the live Playground check confirms that these examples run with the legacy form. Follow the [legacy YAML reference](https://eclipse.dev/epsilon/doc/flexmi/legacy-flexmi-yaml-flavour/) when editing them. Copying a 2.9 example into a 2.8 environment may not work as intended.

For this small architecture, XML makes the tree easy to scan. YAML can be convenient when most lines are names and values. Both are concrete syntaxes for the same abstract structure; choose the one that your team can review and maintain reliably.

## Warnings and conformance {#s5}

The next model has a one-letter mistake in the second connector's target: `Alarm.Siren.sond` instead of `Alarm.Siren.sound`. Its `Siren.sound` port exists, but the text names no such element as `sond`.

{{EXAMPLE:m03-broken}}

Read the captured output in order. The local runner reports a **model warning** naming the line and the unresolved `target`, then the EOL query prints the same counts as the valid alarm. The connector itself still exists, so the query counts two connectors, even though the second has no target. Counting elements alone cannot prove that the wiring is sound.

In the Playground, the console shows the four count lines **without** the model warning. Switch the model panel to its diagram: the broken connector lacks an arrow to `Siren.sound`. The diagram reveals the missing link. Section 6 explains how to change the diagram's presentation.

Other mistakes need different checks. A Flexmi tag may be matched fuzzily to a class or feature even when spelled badly; an XML attribute that no metamodel class declares is reported by this series' local runner, but the Playground does not display that warning. A bound such as `Component[+]` is a declaration, yet simply running a query is not a complete validity check, as Module 2 showed. When a rule matters, inspect the model and add a deliberate check. Module 5 will use EVL to express domain rules such as connected inputs and compatible signal types.

::: tip
Debug from the model outward: check the metamodel name, then the nesting, then the values, then every non-containment reference path. Compare the diagram with the text and read any warnings before trusting a program's plausible output.
:::

## Diagrams and syntax {#s6}

A model is not its XML or YAML file. Those files are ways to write it. The Playground can also draw the loaded model. By default, it shows an object diagram with model elements and references. Emfatic **annotations** can choose a more focused graphical presentation without changing the model's concepts or its EOL query results.

The example below uses `@node(label="name")` on classes whose instances should appear as named nodes, and `@edge(source="source", target="target")` on `Connector` so its instances appear as edges between ports. The Flexmi file is the same valid alarm as before; only the Emfatic presentation annotations differ.

{{EXAMPLE:m03-diagram}}

Open it in the Playground and switch the **model** panel to diagram view. Find the arrows made from the two connectors. Then switch back to text and remove the `@edge` annotation. The connectors are still in the model and the EOL counts do not change, but the diagram uses a different presentation. These annotations are a Playground feature; the local runner reads the metamodel and model, but its output check does not verify diagram appearance. The [graphical-syntax annotation guide](https://eclipse.dev/epsilon/doc/articles/playground/graphical-syntax-annotations/) describes the available options.

You can also open a diagram of the **metamodel** in its panel. That diagram shows classes and references, not the alarm's particular components and ports. Keep the levels distinct: the metamodel diagram explains the language; the model diagram shows one instance of that language. XML, YAML and diagrams are different concrete views of the model's abstract structure.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**Types or instances?** In the XML example, classify `Component`, `OrGate`, `OutPort`, and `Alarm.OrGate.open` as metamodel types or model elements. Which model element is an instance of `OutPort`?
:::

::: solution
`Component` and `OutPort` are metamodel types. `OrGate` and `Alarm.OrGate.open` are model elements. `Alarm.OrGate.open` is an instance of `OutPort`; `OrGate` is an instance of `Component`.
:::

::: exercise #e2 level=1 kind=conceptual minutes=4
**Read the tree.** In the XML alarm, who contains `AndGate`, its `armed` input, and the second connector? Does the connector contain either port it connects?
:::

::: solution
`Alarm` contains `AndGate` and the second connector. `AndGate` contains `armed`. The connector merely refers to its source and target ports; it contains neither of them.
:::

::: exercise #e3 level=1 kind=conceptual minutes=4
**Two ports named `open`.** Write the full paths for the first connector's source and target. Why is `open` alone a poor choice here?
:::

::: solution
The source is `Alarm.OrGate.open`; the target is `Alarm.AndGate.open`. Both ports have the short name `open`, so it does not say which one is intended. Full paths distinguish them and work in Epsilon 2.8.0.
:::

::: exercise #e4 level=2 kind=coding minutes=6
**Model a thermostat in XML.** Use the same metamodel to make a `Thermostat` architecture. `Sensor.reading` connects to `Filter.raw`; `Filter.smoothed` connects to `Display.value`. Make all four ports `ANALOG`, then run the count query. Predict its four lines first.
:::

::: solution
The architecture has three components, four ports and two connectors. The full model and captured output are below:

{{EXAMPLE:m03-e4-solution}}
:::

::: exercise #e5 level=2 kind=coding minutes=7
**Translate the thermostat to YAML.** Express the previous solution in the Epsilon 2.8 YAML flavour. Keep the same nesting and full connector paths. Does the count query change?
:::

::: solution
Only the concrete syntax changes; the query and counts stay the same. The `?nsuri` line and sequence entries use the legacy 2.8 mapping:

{{EXAMPLE:m03-e5-solution}}
:::

::: exercise #e6 level=1 kind=coding minutes=5
**Repair and inspect.** Open the broken-reference example. Find the unresolved target in its Flexmi text, fix it and run again. Compare the captured output with the repaired solution and check the second connector in the Playground's model diagram.
:::

::: solution
Change `Alarm.Siren.sond` to `Alarm.Siren.sound`. The local warning disappears and both connector endpoints resolve. This query prints the actual endpoint names so the repaired relationship is visible:

{{EXAMPLE:m03-e6-solution}}
:::

## Self-check quiz {#quiz}

```quiz
? What selects the Emfatic package for an XML Flexmi model?
- [ ] The root element's `name` value
- [x] The `<?nsuri components?>` instruction
- [ ] The first connector
- [ ] The EOL program name
> The `nsuri` instruction identifies the metamodel namespace.

? Why is `<outPort>` nested inside `<component>`?
- [ ] Because the connector owns it.
- [x] Because `Component.ports` is a containment reference.
- [ ] Because all XML elements must be nested at least twice.
- [ ] Because `OutPort` is an enum.
> XML nesting expresses containment in the model.

? What does a connector's `target="Alarm.Siren.sound"` do?
- [ ] Create a new port under the connector.
- [x] Refer to an existing port using its full path.
- [ ] Rename the siren.
- [ ] Change the metamodel.
> A non-containment reference points to an existing element.

? Which YAML namespace line belongs to the Epsilon 2.8 examples here?
- [x] `?nsuri: components`
- [ ] `$nsuri: components`
- [ ] `<?nsuri components?>`
- [ ] `namespace = components`
> This module uses the legacy YAML mapping supported by Epsilon 2.8.

? What does the broken-reference example's count of two connectors prove?
- [ ] Both connectors have valid targets.
- [ ] The model conforms completely.
- [x] Two connector elements were loaded, but one target did not resolve.
- [ ] The typo was corrected automatically.
> Element counts can look right even when a reference is unset.

? What does `@edge(source="source", target="target")` change in the diagram example?
- [ ] The EOL query's count
- [ ] The number of connectors in the model
- [x] How connector instances are drawn in the Playground
- [ ] The Flexmi namespace
> Presentation annotations change the graphical view, not the model's elements.

? What does a metamodel diagram show?
- [ ] The alarm's particular `OrGate` and `Siren` instances
- [x] Classes and relationships of the modelling language
- [ ] Only EOL output
- [ ] The Git history of the model
> The model diagram shows instances; the metamodel diagram shows their language's types.
```

## Further reading {#reading}

- The [Flexmi documentation](https://eclipse.dev/epsilon/doc/flexmi/) explains XML nesting, fuzzy tag matching and reference resolution.
- The [legacy Flexmi YAML reference](https://eclipse.dev/epsilon/doc/flexmi/legacy-flexmi-yaml-flavour/) documents the Epsilon 2.8 syntax used here.
- The [Playground graphical-syntax annotation guide](https://eclipse.dev/epsilon/doc/articles/playground/graphical-syntax-annotations/) describes `@node`, `@edge` and diagram options.
- The [Epsilon Playground guide](https://eclipse.dev/epsilon/doc/articles/playground/) explains model and metamodel diagrams and the browser controls.
