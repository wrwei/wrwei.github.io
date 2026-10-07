## Start with domain questions {#s1}

In Module 1, you used a model of a burglar alarm without having to design its language. This time you will design that language. The aim is to make the useful statements easy to express: an architecture owns components, components own ports, and connectors join output ports to input ports. The metamodel is the contract that gives those words precise meanings.

Before writing a class, ask what a learner needs to say about a system. For the alarm, we need to name the architecture and its components, list the ports of each component, and connect ports. We do **not** yet need a class for every kind of logic gate. The model can distinguish an `OrGate` from a `Siren` by name while the metamodel calls both `Component`. Add a type only when it gives the language a useful distinction or rule.

We will use **Emfatic**, a compact textual notation for the Ecore metamodelling language. The metamodel lives in `components.emf`; a matching model lives in `alarm.flexmi`. Run each example in the Playground and inspect both files. The examples are small revisions of one language, so compare each metamodel with the previous one. This stepwise approach is inspired by Dimitris Kolovos's [*Metamodelling with ChatGPT*](https://www-users.york.ac.uk/dimitris.kolovos/blog/metamodelling-with-chatgpt/) (2022); the classes and programs here were written for this series.

::: keyidea
A metamodel describes the *kinds* of elements and links allowed in models. A model records particular elements and links, such as the alarm's `OrGate` and `Siren`.
:::

## Classes, attributes and multiplicity {#s2}

Start with two classes. `Architecture` is the root of the model and contains `Component` elements. Both classes have a `name` attribute. An **attribute** stores a value, such as a string or number; a **reference** points to another model element. Emfatic uses `attr`, `ref` and `val` to make that difference visible. The line beginning `@namespace` gives the package a URI; the Flexmi file selects it with `<?nsuri components?>`.

{{EXAMPLE:m02-classes}}

Try changing `Siren` to `Bell` in the Flexmi panel. The query prints the new name, because `Component.all` selects elements by their metamodel type, not by a hard-coded list of names. Add another `<component name="Battery"/>` and run it again.

The brackets in the metamodel state **multiplicity**: how many values a feature may have. `String[1]` says exactly one name. `Component[*]` says zero or more components. When the brackets are omitted, Emfatic's Ecore default is zero or one, **not** exactly one. Common forms are:

| Emfatic | Meaning | Example |
|---|---|---|
| no brackets or `[?]` | zero or one | an optional description |
| `[1]` | exactly one | a required name |
| `[*]` | zero or more | an optional list of parts |
| `[+]` | one or more | a nonempty list of parts |
| `[2..4]` | two to four | a bounded group |

The next metamodel changes the component feature from `[*]` to `[+]`. Compare the two files and run the query.

{{EXAMPLE:m02-bounds}}

The output counts the two components. It does **not** prove that the lower bound is enforced every time a Flexmi file is loaded. Ecore records structural bounds, but this Playground workflow does not automatically perform a complete validity check on every model. If you remove both components and the query still runs, the query reports zero; the model has violated the declared lower bound. In Module 5 you will write explicit EVL checks for rules that matter to your project. Likewise, `[1]` records the requirement for a name but should not be mistaken for an automatic test of every input file.

::: pitfall
Do not infer conformance from a successful query. A tool may load and query a model even when it violates a declared bound. Check the model against the requirements you rely on.
:::

## Containment and ordinary references {#s3}

`val Component[*] components;` is a **containment reference**. An architecture owns its components; deleting that architecture removes the contained elements from that model. A component can have one container, which gives the model a tree-shaped ownership structure. In Flexmi, nested XML elements express this ownership: `<component>` appears inside `<architecture>`.

A connector needs a different relationship. Its `source` is a port owned by a component, and its `target` is another port. The connector must **point to** those ports without owning or moving them. Emfatic uses `ref` for this ordinary, non-containment reference. The next example adds ports and connectors. `Architecture` contains components and connectors; each component contains ports; each connector refers to two ports.

{{EXAMPLE:m02-references}}

Follow the model's nesting. `OrGate` contains the `open` output port, while `Siren` contains the `sound` input port. The connector sits under the architecture and names both ports with full paths such as `Alarm.OrGate.open`. If `source` were `val OutPort source`, the connector would claim ownership of a port that the component already owns. That is the wrong domain relationship.

`ref OutPort source;` and `ref InPort target;` also restrict the kinds of ports at each end. They do not, by themselves, say that a connector must join distinct components, that two ports have compatible signal types, or that every required input is connected. Those are examples of **well-formedness rules** for Module 5's validation language.

A good way to choose between `val` and `ref` is to ask where the element lives. Does the architecture *contain* a component? Yes: `val`. Does a connector merely *identify* a port already inside a component? Yes: `ref`.

## Opposite references {#s4}

The first three metamodels let you navigate from an architecture to its components: `a.components`. Suppose a query starts at a component and needs its architecture. You could walk up the containment tree with EOL's `eContainer()`, but a named relationship makes the domain easier to read. An **opposite reference** connects two declarations as inverse views of the same relationship.

In Emfatic, `#architecture` on `components` names its opposite, and `#components` on `architecture` points back. The former remains containment (`val`); the latter is an ordinary reference (`ref`). The model still writes each component only once, nested under its architecture. EMF maintains the inverse link.

{{EXAMPLE:m02-opposites}}

The program starts with each component and prints its `architecture.name`. There is no `architecture="Alarm"` attribute in the Flexmi model. The inverse is supplied by the metamodel relationship, not by duplicating the data in the model.

Opposites are useful when both directions are common questions. They also add a commitment: the two ends must stay consistent. In a larger language, do not add inverses to every link merely because you can; add them when navigation or an invariant needs them. This syntax follows the [Emfatic reference documentation](https://eclipse.dev/emfatic/).

## Inheritance and enumerations {#s5}

The port declarations introduce **inheritance**. `InPort` and `OutPort` both extend `Port`, so both inherit its `name`. The `abstract` keyword prevents a bare `Port` from being created: a port in a model must be an input or an output. A query of `Port.all` still includes instances of both subclasses, because they are ports too.

Now we need to distinguish signal kinds. A free-form `String` would allow spellings such as `digital`, `DIGITL` or `on/off` with no shared vocabulary. An **enumeration** defines a finite set of named values. The example adds `PortType` with `DIGITAL` and `ANALOG`, and adds a `type` attribute to `Port`. Because `InPort` and `OutPort` inherit from `Port`, both receive that attribute.

{{EXAMPLE:m02-types}}

The output lists each port's type. The alarm uses digital signals. Open the thermostat solution later in this module to see analog readings and a digital command in the same metamodel.

An enum constrains the *available values*, but it does not decide which connected ports are compatible. A connector that runs from an analog output to a digital input can still be represented. Whether that is legal depends on the domain; a validation rule can compare `source.type` with `target.type`.

There is a design choice here. The separate `InPort` and `OutPort` classes make connector ends type-specific. An alternative is one `Port` class with a `direction` enum. That would use fewer classes but move the source/target direction rule into validation. Neither design is universally correct; use the distinctions your tools need to enforce or navigate.

## Evolving the language {#s6}

A metamodel can change as the domain becomes clearer. In this module, the first version knew only architectures and components. Later versions added ports, wiring, inverse navigation and signal types. Each revision changed the language, and some revisions required corresponding changes to the model. For instance, after adding `PortType`, the model sets each port's `type`.

Treat a change as three questions:

1. **Which statements become possible or impossible?** `ref InPort target` excludes an output port as a connector target; an enum excludes unknown signal names.
2. **What existing models must change?** Adding a feature can require values in old models. Renaming a feature can leave old Flexmi attributes unresolved or silently fuzzy-matched.
3. **Which rules still need validation?** Ecore describes structure and types; domain rules such as no self-loop and matching signal types require more work.

A useful review is to open the metamodel diagram in the Playground and trace containment from `Architecture` down to ports, then trace the ordinary references from `Connector`. The drawing is another view of the same metamodel. Module 3 will focus on writing and reading the models that conform to it.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**Attribute, containment or reference?** For each fact, choose `attr`, `val` or `ref`: (a) a component has a display name; (b) an architecture owns components; (c) a connector points to an output port already owned by a component.
:::

::: solution
(a) `attr String name;` stores a plain value. (b) `val Component[*] components;` gives the architecture ownership of its components. (c) `ref OutPort source;` points to an existing port without moving ownership to the connector.
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**Read the bounds.** What do `String[1]`, `Component[+]` and `Connector[*]` allow? If a Flexmi model with no components still runs a query, has the lower-bound requirement been satisfied?
:::

::: solution
They mean exactly one string, one or more components, and zero or more connectors. A model with zero components violates `Component[+]` even if the query executes. A successful run is not a complete validity check.
:::

::: exercise #e3 level=1 kind=conceptual minutes=6
**Draw the ownership tree.** In the references example, who contains `OrGate`, who contains its `open` port, and who contains the connector? Why should the connector's `source` be `ref`?
:::

::: solution
`Alarm` contains `OrGate`; `OrGate` contains `open`; `Alarm` also contains the connector. The connector refers to `open`, which already has a container. Making `source` a containment reference would misstate who owns that port.
:::

::: exercise #e4 level=1 kind=coding minutes=8
**Add a description.** Starting from the classes example, add an optional `String` description to `Component`. Describe the two components in the Flexmi model and print each name with its description. Which keyword belongs before `String`?
:::

::: solution
An optional plain value is an attribute. With no brackets its multiplicity defaults to zero or one. The complete files and output are here:

{{EXAMPLE:m02-e4-solution}}
:::

::: exercise #e5 level=2 kind=project minutes=11
**Type a thermostat.** Starting from the types example, make a `Thermostat` architecture with a `Sensor` output `reading` of type `ANALOG`, a `Controller` input `raw` of type `ANALOG`, and an output `command` of type `DIGITAL`. Connect `reading` to `raw`. Run a query that prints each port and its type.
:::

::: solution
The same metamodel describes this second architecture. The connector uses fully qualified paths from `Thermostat`:

{{EXAMPLE:m02-e5-solution}}
:::

::: exercise #e6 level=2 kind=coding minutes=10
**Navigate from a port to its owner.** Starting from the opposites example, give `Component.ports` an opposite called `Port.component`. Print `component.name` and `name` for each port. Does the Flexmi model need an extra `component` attribute?
:::

::: solution
Pair `val Port[*]#component ports;` with `ref Component#ports component;`. The Flexmi nesting already states ownership, so no extra model attribute is needed:

{{EXAMPLE:m02-e6-solution}}
:::

## Self-check quiz {#quiz}

```quiz
? What does `attr String name;` declare when no multiplicity appears?
- [ ] Exactly one name
- [x] Zero or one name
- [ ] Any number of names
- [ ] A reference to another model element
> Emfatic uses Ecore's zero-to-one default when the brackets are absent.

? Which declaration expresses that an architecture owns its components?
- [ ] `attr Component[*] components;`
- [ ] `ref Component[*] components;`
- [x] `val Component[*] components;`
- [ ] `enum Component components;`
> `val` is a containment reference.

? Why is `Connector.source` an ordinary `ref`?
- [ ] It stores a string rather than a model element.
- [x] The source port is already contained by a component.
- [ ] Ordinary references are always required.
- [ ] A connector cannot have attributes.
> The connector points at a port without becoming its container.

? What does `#architecture` identify in `val Component[*]#architecture components;`?
- [ ] The package URI
- [ ] A component subclass
- [x] The opposite reference on `Component`
- [ ] The Flexmi root element
> It pairs `components` with `Component.architecture`.

? Can a model instantiate an `abstract class Port` directly?
- [ ] Yes, because all classes are instantiable.
- [x] No; instantiate a concrete subclass such as `InPort`.
- [ ] Only if the port has a name.
- [ ] Only in a diagram.
> Abstract classes supply shared features but cannot have direct instances.

? What does an enum help express?
- [ ] Unlimited free-form signal names
- [x] A fixed set of named signal types
- [ ] Ownership of a component
- [ ] A bidirectional reference
> `PortType` offers the declared literals `DIGITAL` and `ANALOG`.

? A query runs on a model with zero components, while the metamodel says `Component[+]`. What can you conclude?
- [ ] The bound means zero or more.
- [ ] Ecore changed the bound automatically.
- [x] The query ran, but the model violates the declared lower bound.
- [ ] The model must contain a hidden component.
> Executing a query is not the same as checking every declared constraint.
```

## Further reading {#reading}

- The [Emfatic documentation](https://eclipse.dev/emfatic/): syntax for classes, multiplicity, inheritance, enums and opposite references.
- The [Flexmi documentation](https://eclipse.dev/epsilon/doc/flexmi/): how models use containment and resolve references by name.
- Dimitris Kolovos, [*Metamodelling with ChatGPT*](https://www-users.york.ac.uk/dimitris.kolovos/blog/metamodelling-with-chatgpt/) (2022): the stepwise component-language example that inspired this series.
- The [Epsilon Playground guide](https://eclipse.dev/epsilon/doc/articles/playground/): using the browser editor and diagrams.
