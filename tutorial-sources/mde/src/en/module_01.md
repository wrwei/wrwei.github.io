## Why model-driven engineering? {#s1}

Software projects rarely fail for lack of code. They get into trouble when the people building a system lose track of what it is supposed to be. The requirements live in one document, the design in another, and the code drifts away from both. Every change has to be made in several places by hand, and sooner or later the copies disagree.

Model-driven engineering (MDE) tackles this problem with two ideas. The first is **abstraction**: describe the system in a language made for the problem, and leave out the details that do not matter for the question at hand. The second is **automation**: make those descriptions precise enough for tools to process them. Tools can then check the descriptions, analyse them, and produce other artefacts from them, such as code, documentation or test data. The descriptions are called **models**. In MDE they are primary engineering artefacts, not pictures that sit beside the "real" work.

A small example shows the payoff. JHipster is a code generator for web applications. You describe your application in its textual language, JDL. The description says which entities exist (in Kolovos's example, a blog with blogs, posts and tags), which attributes they have, how they relate to each other, and a few configuration choices such as the database to use. From a description that fits on one screen, JHipster generates a complete application that you can run: the database tables, the server-side code with its web API, and a browser-based user interface. Changing the model and generating again is far quicker than changing all of those layers by hand. And the layers stay consistent with each other, because they all come from one source. (Adapted from Dimitris Kolovos, [*Minimal JHipster JDL Monolith Example*](https://www-users.york.ac.uk/dimitris.kolovos/blog/jhipster-jdl-monolith-example/), 2021.)

The same idea appears wherever systems are large, long-lived or safety-critical. In the automotive and aerospace industries, engineers design control software as Simulink models and generate the code from them. Systems engineers describe whole systems in SysML, as the site's [SysML v2](../sysml/SysMLv2_Module1_Foundations_EN.html) and [MBSE](../mbse/index.html) series show. And many teams define small domain-specific languages, like JDL, for a single job.

::: keyidea
In MDE, models are not documentation that drifts out of date. They are inputs that tools read, check and transform, so keeping them right pays off directly.
:::

This module gives you the vocabulary and a first taste of the tools. Sections 2 to 4 explain what models, metamodels and modelling languages are. Section 5 introduces the four core tasks that tools perform on models, using Eclipse Epsilon. Section 6 shows how to work with the examples in the Epsilon Playground, in your browser.

## Models {#s2}

What exactly is a model? Kolovos's definition is deliberately broad: a model is "a description of a system of interest". The system can be anything you want to reason about: a building, a payroll application, the cruise control of a car, or the burglar alarm used throughout this module. The description can be a drawing, a structured text file, or a set of objects inside a tool.

Models are classified by the purpose they are built for:

- A **descriptive** model describes a system that already exists. The floor plan of an existing building is descriptive. So is a class diagram that a team reverse-engineers from a legacy code base to find their way around it.
- A **prescriptive** model describes a system that does not exist yet, and says how it should be. An architect's plan for a house still to be built is prescriptive. So is the design of software you are about to write.

Prescriptive models vary a great deal in how complete and precise they are. Kolovos places them on a continuum:

- **Models as sketches** capture just enough for an informal discussion, like a free-form drawing on a whiteboard.
- **Models as blueprints** capture enough for engineers to build the system from them, but leave some decisions to people. A UML class diagram that names the classes and their relationships, but not what their operations do, is a blueprint.
- **Models as programs** are precise and complete enough to drive implementation or verification automatically, with little further human input. A Simulink model from which control code is generated is a program in this sense.

The further along this continuum a model is, the more a tool can do with it. Much of MDE is about moving models from blueprint towards program, so that the tedious and error-prone parts of implementation can be automated.

Every model is also partial. It keeps the aspects that matter for its purpose and leaves out the rest. That is not a weakness; it is the point of building a model.

::: analogy
A city's metro map and its street map describe the same place. The metro map distorts distances and leaves out every street, which makes it useless for walking and ideal for planning a train journey. Neither is *the* model of the city: each is good for its own purpose.
:::

(Adapted from Dimitris Kolovos, [*Model-Driven Engineering Terminology*](https://www-users.york.ac.uk/dimitris.kolovos/blog/mde-terminology/), 2022.)

## Metamodels and conformance {#s3}

A model is written in some language, and a language needs rules. The rules say which kinds of element a model may contain, which properties they have, and how they may be connected. In MDE, these rules are captured in a **metamodel**. Kolovos defines a metamodel as "an object-oriented specification of the abstract syntax of a language" ([*Model-Driven Engineering Terminology*](https://www-users.york.ac.uk/dimitris.kolovos/blog/mde-terminology/), 2022). A language's **abstract syntax** is its concepts and the relationships between them, independent of how models are drawn or written down. (Kolovos treats the two terms as interchangeable.) Metamodels are themselves written in metamodelling languages. The most widely used are Ecore, part of the Eclipse Modeling Framework (EMF), and MOF, a standard of the Object Management Group.

This series uses one language throughout: a small language for component-and-connector architectures. An architecture contains components. Each component has input and output ports. Connectors carry a signal from an output port to an input port. The running example follows the component-and-port metamodel that Dimitris Kolovos developed with ChatGPT in [*Metamodelling with ChatGPT*](https://www-users.york.ac.uk/dimitris.kolovos/blog/metamodelling-with-chatgpt/) (2022); Module 2 builds it up step by step.

The first example below shows the metamodel written in Emfatic, a textual notation for Ecore. You will learn to write Emfatic in Module 2. For now, read it like a set of class declarations:

- `class Component { … }` declares a kind of model element. `abstract class Port` declares a kind that cannot be created directly, and `class InPort extends Port {}` declares a more specific kind of port.
- `attr String name;` declares an attribute, which holds a plain value.
- `val Component[*] components;` declares a **containment** reference: an architecture owns its components, and `[*]` means that it can own any number of them.
- `ref OutPort source;` declares a plain reference: a connector points at a port that a component owns.

The model is written in Flexmi, a compact XML-based notation for EMF models. Each XML element creates an element of the model: `<architecture>` creates an `Architecture`, `<component>` a `Component`, and `<inPort>` an `InPort`. XML attributes such as `name="OrGate"` set the attributes of that element. These **model elements** are instances of the types that the metamodel defines. A model **conforms to** its metamodel when each of its elements is an instance of one of those types and uses only the features that its type declares.

The program is a short query in EOL, the base language of Epsilon. Read the three files, press **Open in Playground** and run the example, then compare what you see with the captured output below.

{{EXAMPLE:m01-tour}}

The output has one line per component, listing the names of its ports in order. `Component.all` gives every element of type `Component` in the model, so the query never mentions the alarm itself. It would work on any model that conforms to the same metamodel; Exercise 6 asks you to try exactly that.

Look at how the connectors refer to ports. `Alarm.OrGate.open` is a fully qualified name: it starts at the root element, follows the names of the elements that contain the port, and ends at the port itself. Flexmi resolves references by name, so two ports can share the name `open` as long as their full paths differ.

::: pitfall
Say that a model *conforms to* its metamodel, or that it is an *instance of* it. Kolovos notes that writers often say a model "implements", "depends on" or "uses" its metamodel. Those verbs describe other relationships and confuse readers.
:::

What happens when a model does not conform? The next example uses the same metamodel and the same program, but its model contains a typo in the last connector: the target is `Alarm.Siren.sond` instead of `Alarm.Siren.sound`.

{{EXAMPLE:m01-conformance}}

Read the captured output from the top. Flexmi could not find an element called `Alarm.Siren.sond`, so it reports a warning that names the line in the model and the reference it could not set. It then leaves that reference empty and carries on. The model loads, the program runs, and it prints exactly the same three lines as before. The connection to the siren is broken, but nothing in the query's own output reveals it.

That is worth remembering: a program can run on a model that does not conform and still produce plausible-looking results, so treat every warning as a defect to fix. Flexmi is forgiving by design, which makes models quick to write. Module 3 shows where that helps and where it hides mistakes.

## Abstract and concrete syntax {#s4}

The metamodel says what an alarm model contains: components, ports, connectors and their names. It says nothing about how a model looks. That is the job of a **concrete syntax**, a notation for writing or showing the models of a language. In Kolovos's account, a language has one abstract syntax, its metamodel, and any number of concrete syntaxes: textual, diagrammatic, tabular, tree-based, or combinations of these.

The alarm already appears in several concrete forms in this module:

- as the Flexmi text you have just read;
- as a diagram: open the first example in the Playground and press the diagram button on the model panel, and the Playground draws the components, ports and connectors as boxes and lines;
- as a table: in Section 5, a template turns the model into an HTML parts list.

All three show the same model elements. Changing the notation changes nothing about what the model says.

This is why Kolovos argues that, strictly speaking, languages are not textual or graphical: only their concrete syntaxes are. Calling a language textual or graphical is a useful shorthand: it means that its default or dominant concrete syntax is textual or graphical. SysML v2 makes the point well: one abstract syntax has both a textual and a graphical notation (see the site's [SysML v2 series](../sysml/SysMLv2_Module1_Foundations_EN.html)).

What, then, separates a modelling language from a programming language? It is tempting to say that modelling languages are graphical and programming languages textual, or that programs run and models do not. Neither holds up. BPEL is graphical and Turing-complete, while SQL-92 is textual and is not. Kolovos proposes a distinction based on intent instead. Call a language a modelling language if people mostly use it without intending to get something executable out of their work: to understand a domain, explore a design or explain it to others. Call it a programming language if people mostly use it intending to produce something that runs. Under this view, the same language can serve either purpose. You can write a few Java classes just to understand a domain, and you can generate executable code from a UML class diagram.

(Adapted from Dimitris Kolovos, [*Model-Driven Engineering Terminology*](https://www-users.york.ac.uk/dimitris.kolovos/blog/mde-terminology/), 2022.)

## Model management with Epsilon {#s5}

Once models are precise enough for tools to read, you can automate the work around them. MDE calls this **model management**. Four tasks are at its core:

- **Querying**: extracting information from a model, such as which components have no outputs.
- **Validation**: checking rules that a well-formed model must follow but that the metamodel cannot express on its own.
- **Model-to-text transformation**: generating text, such as code, documentation or reports, from a model.
- **Model-to-model transformation**: producing a model in another language from a model.

Further tasks build on these: comparing two models, merging them, and migrating models when their metamodel changes. Module 9 points to Epsilon's languages for them.

Eclipse Epsilon is a family of languages for model management. Each language is designed for one task, and all of them build on one base language, EOL (the Epsilon Object Language). Expressions you learn in one of them therefore work in all the others.

| Task | Epsilon language | Taught in |
|---|---|---|
| Querying | EOL | Module 4 |
| Validation | EVL | Module 5 |
| Model-to-text transformation | EGL, EGX | Module 6 |
| Model-to-model transformation | ETL | Module 7 |

You have already seen a query. The three examples below preview validation and the two kinds of transformation. Do not worry about every detail of their syntax yet: each later module teaches one language properly.

The first example is a validation program written in EVL. Its model is a variant of the alarm with a wiring mistake: the second connector feeds the AND gate's output back into its own `armed` input.

{{EXAMPLE:m01-validate}}

An EVL program groups its rules by the type they apply to: `context Connector` and `context InPort`. Each rule has a `check`, an expression that must be true for every element of that type, and a `message` to report for each element where it is false. When a **constraint** fails, EVL reports an error. When a **critique** fails, it reports a warning, for problems that deserve attention but do not make the model wrong.

The captured output shows one error and three warnings. The error is the self-loop. `Siren.sound` is not connected any more, because the faulty connector goes to the AND gate instead. `OrGate.door` and `OrGate.window` are flagged too, although they are meant to be fed by sensors outside the architecture: the language has no way to say so, and Exercise 5 asks you to fix that. In the Playground, the problems are also marked on a diagram of the model.

The next example generates text from the original, correctly wired alarm.

{{EXAMPLE:m01-generate}}

An EGL template is text with dynamic sections. Everything outside `[% %]` is copied to the output unchanged. Code inside `[% %]` runs; here it is a loop over the components. And `[%= %]` inserts the value of an expression. The template therefore produces one table row per component, counting its input and output ports with the same kind of expression as the query in Section 3. The Playground renders the generated HTML as a table; the captured output below shows the HTML itself.

This is the idea behind JHipster on a small scale. The output is derived from the model, so when the model changes, you generate the output again instead of editing it by hand.

The last example transforms the alarm into a model of a different language: a plain directed graph, whose metamodel is shown under the program.

{{EXAMPLE:m01-transform}}

ETL rules say how elements of the source model become elements of the target model. `Source!Component` and `Target!Node` name types in the two models. The rule `Component2Node` turns each component into a node with the same name, and `Connector2Edge` turns each connector into an edge between the nodes for the two components it joins. The operator `::=` assigns the transformed counterpart of an element, made by whichever rule transforms it, so `g.nodes ::= a.components` fills the graph with the nodes made from the components.

The captured output prints the target model as a tree: one graph, three nodes and two edges. The ports have disappeared, because the graph language has no use for them. Model-to-model transformation lets each task work in the language that suits it: a graph algorithm needs nodes and edges, not ports.

## Working in the Playground {#s6}

Every example in this series opens in the Epsilon Playground, a version of Epsilon that runs in your browser with nothing to install. When you press **Open in Playground**, the example's files load into panels:

- the **program** panel holds the Epsilon program (EOL, EVL, EGL, EGX or ETL);
- the **model** panel holds the Flexmi model and the **metamodel** panel the Emfatic metamodel, and both can show a diagram instead of text;
- the **console** shows what the program prints, and any errors;
- depending on the language, further panels show generated text, rendered HTML, the validated model or the target model of a transformation.

To run the example, press the Run button on the program panel, or press Ctrl+S (Cmd+S on a Mac). You can edit any panel and run again as often as you like; trying a change and seeing what happens is the fastest way to learn. The Playground's examples menu lists every example in this series, grouped by module, so you can move between examples without returning to the lesson.

Keep two things in mind:

- Nothing you change is saved. Use the Download button to keep your work before you close the tab.
- The output printed under each example on these pages was captured from Epsilon 2.8.0 when the page was built. The Playground may run a newer version of Epsilon and word some messages differently. If a result surprises you, compare it with the captured output.

::: tip
Keep the lesson open in one browser tab and the Playground in another, and switch between them as you read.
:::

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=6
**Descriptive or prescriptive?** For each model, say whether it is descriptive or prescriptive. For each prescriptive model, also say whether it is a sketch, a blueprint or a program.

1. An architect's floor plan for a house that has not been built yet.
2. A class diagram reverse-engineered from an existing code base to help new developers find their way.
3. A Simulink model from which a car's cruise-control code is generated.
4. A whiteboard drawing a team makes while discussing how a new feature should work, photographed and then wiped.
:::

::: solution
1. **Prescriptive, blueprint.** It describes a house that does not exist yet, in enough detail for builders to work from, though they still settle many details themselves.
2. **Descriptive.** It records a system that already exists. The sketch–blueprint–program scale applies to prescriptive models, so it does not place this one.
3. **Prescriptive, program.** It is complete and precise enough for a tool to generate the code from it.
4. **Prescriptive, sketch.** It is about a feature that does not exist yet, and it captures just enough for one informal discussion.

Whether a model is descriptive or prescriptive depends on the purpose it is built for, not on how it looks: a floor plan can be either, depending on whether the house already exists.
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**Spot the misused terms.** Which statements use MDE vocabulary correctly? Rewrite the others.

1. "Our model implements the UML metamodel."
2. "`alarm.flexmi` conforms to `components.emf`."
3. "`Port` is a model element of the alarm model."
4. "The metamodel defines the abstract syntax of the components language."
:::

::: solution
1. **Misused.** Models *conform to* metamodels; "implements" describes a class and an interface in a programming language. Better: "Our model conforms to the UML metamodel."
2. **Correct.**
3. **Misused.** `Port` is a type (an abstract class) in the metamodel. The alarm model's elements are instances, such as the component `OrGate` or its input port `door`. Better: "`door` is a model element of the alarm model, and its type is `InPort`."
4. **Correct.**
:::

::: exercise #e3 level=1 kind=coding minutes=8
**Query: components with no outputs.** Open the first example of this module in the Playground and change the program so that it prints the names of the components that have no output ports. Hint: combine `select`, `exists` and `isTypeOf(OutPort)`.
:::

::: solution
Select the components for which no port is an output port, then collect their names:

{{EXAMPLE:m01-e3-solution}}

Only `Siren` qualifies: it receives a signal but produces none. Module 4 covers `select`, `exists` and `collect` in depth.
:::

::: exercise #e4 level=1 kind=coding minutes=4
**Repair the model.** Open the example "A model that does not conform" in the Playground. Fix the model so that the warning disappears, run it again, and compare the output with the original.
:::

::: solution
The last connector names a port that does not exist: `Alarm.Siren.sond` should be `Alarm.Siren.sound`. With the name corrected, Flexmi resolves the reference and the warning disappears:

{{EXAMPLE:m01-e4-solution}}

The program's own output does not change, because the program never looks at connectors. That is why conformance warnings matter: a program can run on a broken model and still produce plausible-looking results.
:::

::: exercise #e5 level=2 kind=project minutes=12
**Telling external inputs apart.** The `Connected` critique in "Validation: check the wiring" warns about `door` and `window`, but those inputs come from sensors outside the architecture, so they are not supposed to be connected. Change the metamodel so that a model can say which inputs are external, mark `door`, `window` and `armed` as external, and add a guard so that the critique skips external inputs. Use the correctly wired alarm from the first example as your model.
:::

::: solution
Add a boolean attribute to `InPort`, set it in the model, and guard the critique with it:

{{EXAMPLE:m01-e5-solution}}

The critique now applies only to internal inputs, and those are all connected, so every check passes. Notice the order of the changes. The rule needed information that the model could not express, so the metamodel changed first, and the model and the program followed. Much of MDE work goes in this direction.
:::

::: exercise #e6 level=2 kind=project minutes=10
**A second architecture.** Using the same metamodel, write a Flexmi model of a thermostat: a `Sensor` with an output port `reading`, a `Filter` with an input `raw` and an output `smoothed`, and a `Display` with an input `value`, wired in that order. Run the first example's query on your model.
:::

::: solution
{{EXAMPLE:m01-e6-solution}}

References use fully qualified names that start with the architecture's name, such as `Thermostat.Sensor.reading`. The same query works unchanged on a new model because it was written against the metamodel, not against one particular model.
:::

## Self-check quiz {#quiz}

```quiz
? A metamodel…
- [ ] is a model that has passed a validation tool's checks
- [x] defines the concepts, attributes and relationships that models in a language can use: the language's abstract syntax
- [ ] is the diagram notation that a modelling tool draws
- [ ] is a model of a model's file format
> A metamodel specifies a language's abstract syntax. Diagrams and text are concrete syntaxes for it.

? Which phrase describes the relationship between `alarm.flexmi` and `components.emf` correctly?
- [ ] The model implements the metamodel.
- [ ] The model inherits from the metamodel.
- [x] The model conforms to the metamodel.
- [ ] The model depends on the metamodel.
> Models conform to metamodels; their elements are instances of the metamodel's types.

? A team writes a model of a legacy payroll system to understand it before replacing it. What kind of model is it?
- [x] Descriptive
- [ ] Prescriptive
- [ ] A program
- [ ] A metamodel
> It describes a system that already exists.

? In the terminology this module uses, what separates a modelling language from a programming language?
- [ ] Modelling languages are graphical; programming languages are textual.
- [ ] Programming languages have a metamodel; modelling languages do not.
- [x] How engineers intend to use it, not a technical property of the language.
- [ ] Modelling languages cannot be executed.
> Kolovos argues that the difference lies in intent: understanding and communication, or producing executable artefacts.

? In EVL, what is the difference between a constraint and a critique?
- [ ] Constraints check attributes; critiques check references.
- [x] A failed constraint is an error; a failed critique is a warning.
- [ ] Critiques run before constraints.
- [ ] Constraints can have guards; critiques cannot.
> Both have a check and a message; critiques report less serious problems.

? You want to generate an HTML report from a model. Which Epsilon language fits?
- [ ] EVL
- [ ] ETL
- [x] EGL
- [ ] Flexmi
> EGL is Epsilon's model-to-text (template) language; ETL produces models, not text.

? In "A model that does not conform", the model refers to `Alarm.Siren.sond`. What happens when it runs?
- [ ] The program stops with an error before printing anything.
- [x] Flexmi reports a warning, leaves the reference unset, and the program still runs.
- [ ] Flexmi creates a new port called `sond`.
- [ ] Epsilon silently corrects the name to `sound`.
> The captured output shows the warning first and then the query's normal output.
```

## Further reading {#reading}

- Dimitris Kolovos, [*Model-Driven Engineering Terminology*](https://www-users.york.ac.uk/dimitris.kolovos/blog/mde-terminology/) (2022): the source of this module's vocabulary, with more on how the terms are commonly misused.
- Dimitris Kolovos, [*Metamodelling with ChatGPT*](https://www-users.york.ac.uk/dimitris.kolovos/blog/metamodelling-with-chatgpt/) (2022): how the component-and-port metamodel took shape. Module 2 builds on it.
- Dimitris Kolovos, [*Minimal JHipster JDL Monolith Example*](https://www-users.york.ac.uk/dimitris.kolovos/blog/jhipster-jdl-monolith-example/) (2021): a whole web application generated from a short textual model.
- Dimitris Kolovos, [public lectures](https://www.youtube.com/playlist?list=PLRwHao6Ue0YUecg7vEUQTrtySIWwrd_mI) (video playlist).
- The [Epsilon Playground documentation](https://eclipse.dev/epsilon/doc/articles/playground/) and the [Epsilon documentation](https://eclipse.dev/epsilon/doc/).
- Marco Brambilla, Jordi Cabot and Manuel Wimmer, *Model-Driven Software Engineering in Practice*, 2nd edition (Morgan & Claypool, 2017): a book-length introduction to the field.
