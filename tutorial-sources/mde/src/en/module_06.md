## From models to text {#s1}

A model can serve as one source for several outputs. The alarm's component names and connections can become a parts list, an HTML report, a Graphviz diagram description or Java source. **Model-to-text generation** derives those outputs from the model so that a change can be reflected by regenerating. It does not make the output automatically correct: a generator must escape data, use valid identifiers and run only on models whose required properties have been checked.

Epsilon uses **EGL** (Epsilon Generation Language) for templates and **EGX** to coordinate template runs and target files. Both use the EOL navigation you learned in Module 4. In this module, the captured output is the generated text. For EGX, the local runner also names each generated file. Start with the small alarm; then try changing the model and rerunning a template.

## Write an EGL template {#s2}

An EGL template mixes text with dynamic regions. Text outside `[% ... %]` is copied unchanged. A block `[% ... %]` runs EOL statements, while `[%= expression %]` inserts an expression's value. In the first example, a loop visits each component and writes one line with its port count.

{{EXAMPLE:m06-text}}

The template has a fixed heading and a dynamic list. `Architecture.all.first().name` supplies the architecture name. If you add a component to the Flexmi model, another line appears without editing the template. The generated file is a *derived artefact*: keep the model and template as the sources of truth, then regenerate the artefact after changes.

::: keyidea
Static template text supplies the output's shape. Dynamic EOL expressions supply values taken from the model. Both parts are needed for a readable generated document.
:::

## Generate several formats {#s3}

EGL is not limited to one target language. This template uses HTML tags as its static text and inserts component names and counts into table cells.

{{EXAMPLE:m06-html}}

The Playground may render the HTML; the captured block shows the exact generated markup. In a real generator, escape names before inserting them into HTML. The teaching model uses simple names, so the example focuses on the EGL structure rather than a complete HTML escaping library.

The next template produces **Graphviz DOT**, a textual graph description. Each component becomes a node and each connector becomes an arrow between the components that own its endpoint ports.

{{EXAMPLE:m06-dot}}

DOT is another concrete output, not another model in the MDE sense used here. It omits port details: both the alarm model and an altered one with different port names could generate the same component-level graph. Decide deliberately which information the target artefact needs. A generated diagram can be helpful for review, but a text preview also makes the exact edge data easy to inspect.

## One file per element with EGX {#s4}

A single EGL template naturally makes one stream of text. **EGX** runs templates for selected model elements and chooses where each result goes. The rule below runs once per `Component`, passes that component as `c` to `template.egl`, and names the output file from `c.name`.

{{EXAMPLE:m06-java}}

The captured output has three file headers and three Java classes. `template` identifies the EGL template; `target` computes a file name. The template uses EOL's `select` to count input and output ports. For a production generator, validate that every component name is a safe, unique Java identifier and escape any text inserted into generated source. Here the fixed example names meet those conditions.

EGX rules can also have guards, parameters and additional workflow controls. The [EGX reference](https://eclipse.dev/epsilon/doc/egx/) describes them. Keep decisions about *which files to produce* in EGX and decisions about *what each file contains* in EGL; that makes each part easier to change.

## Protected regions {#s5}

Regeneration would normally overwrite hand edits in a generated file. EGL can mark a **protected region** so that a file-generating workflow may preserve a marked section from an existing destination. The example emits a region named `manual-note` using `out.preserve`.

{{EXAMPLE:m06-preserve}}

The captured output demonstrates the markers and initial content. It does **not** demonstrate a merge with an existing file: this lesson's local runner processes the template without an earlier destination to merge, and the Playground is not an Eclipse file-generation workflow. To test preservation in a local project, generate to a file, edit only the marked region, then regenerate to the same destination with merging enabled. Keep generated and hand-written responsibilities clear; protected regions are not a substitute for reviewing changes to the model or template. The [EGL merge documentation](https://eclipse.dev/epsilon/doc/egl/) explains the marker and merge behaviour.

## Review generated artefacts {#s6}

Before using generated text, ask what it assumes. The Java generator assumes names make valid class identifiers. The HTML generator assumes names can be inserted safely into markup. The Graphviz generator ignores ports and signal types. None of the templates alone verifies that a connector is sound; Module 5's EVL rules should check that first when those assumptions affect the output.

A useful generation workflow has three steps: validate the model, generate deterministically, then inspect or test the artefacts. The examples here make the inputs and outputs small enough to compare by eye. In a real project, include generated files in a build and test the code or documents in their target environment. Module 9 shows how to run Epsilon outside the Playground.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**Static or dynamic?** In an HTML table template, classify `<tr><td>`, `[%=c.name%]` and `[% for (c in Component.all) { %]` as static text, value insertion or executable template code.
:::

::: solution
`<tr><td>` is static text copied to the output. `[%=c.name%]` inserts a value from the current component. The `for` block is executable EOL code controlling how often subsequent text is emitted.
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**What is lost?** The Graphviz example creates one node per component and one edge per connector. Name two facts in the source model that the generated graph does not record.
:::

::: solution
It omits individual port names and their `DIGITAL`/`ANALOG` types. It also does not say which exact ports a connector joins. The generator intentionally selects a component-level view.
:::

::: exercise #e3 level=1 kind=conceptual minutes=5
**Who owns each decision?** In the Java example, which file decides the output file name, and which file decides the class body? What should be checked before using the generated classes?
:::

::: solution
The EGX rule computes `c.name + ".java"`; `template.egl` writes the class body. Validate unique, legal class names and the model rules the generated code assumes. Compile or otherwise test the produced Java in a real workflow.
:::

::: exercise #e4 level=1 kind=coding minutes=10
**Compact HTML.** Make an EGL template that produces an unordered list with one item per component and its port count.
:::

::: solution
The loop surrounds one static `<li>` line, while expressions insert its values:

{{EXAMPLE:m06-e4-solution}}
:::

::: exercise #e5 level=2 kind=coding minutes=10
**One summary per component.** Write an EGX rule that invokes `template.egl` once for each component and writes `<name>.txt`. Each file should report that component's port count.
:::

::: solution
The rule chooses targets; the template produces the contents. The local output shows three separate files:

{{EXAMPLE:m06-e5-solution}}
:::

::: exercise #e6 level=2 kind=coding minutes=10
**Label the edges.** Modify the DOT template so each connector arrow has a label naming its source and target ports.
:::

::: solution
The added `label` uses `wire.source.name` and `wire.target.name`:

{{EXAMPLE:m06-e6-solution}}
:::

## Self-check quiz {#quiz}

```quiz
? What happens to text outside EGL markers?
- [x] It is copied to the output.
- [ ] It is always executed as EOL.
- [ ] It is discarded.
- [ ] It becomes a metamodel class.
> Static template text defines the output's fixed shape.

? What does `[%=c.name%]` do?
- [ ] Declare a new class
- [x] Insert the value of an expression
- [ ] Save the model
- [ ] Start an EGX rule
> The equals form writes an expression result into the generated text.

? What is EGX responsible for in the Java example?
- [ ] Checking signal compatibility
- [x] Invoking a template per component and choosing each target file
- [ ] Defining the component metamodel
- [ ] Parsing Flexmi XML
> EGX orchestrates template executions and their destinations.

? Where is the body of each generated Java class defined?
- [ ] In the Flexmi model
- [ ] In the EGX target expression
- [x] In `template.egl`
- [ ] In the metamodel namespace
> EGL provides the text for each file.

? What does the DOT example omit?
- [ ] All components
- [x] Port-level details and signal types
- [ ] Every connection
- [ ] The architecture name from the file name
> The chosen graph view has component nodes and connector edges.

? Does the protected-region example prove that an edited destination was preserved?
- [ ] Yes, the local runner merged an existing file.
- [x] No, it only shows the generated markers and initial content.
- [ ] Yes, because every EGL template merges automatically.
- [ ] It does not generate text.
> Preservation requires regenerating to an existing destination in a merging workflow.

? Which step should precede generation when output assumes valid connections?
- [ ] Rename every component.
- [x] Run the relevant model validation rules.
- [ ] Convert all models to YAML.
- [ ] Remove every protected region.
> Generation inherits assumptions about its input model.
```

## Further reading {#reading}

- The [EGL reference](https://eclipse.dev/epsilon/doc/egl/) covers templates and protected regions.
- The [EGX reference](https://eclipse.dev/epsilon/doc/egx/) covers rule-based template orchestration.
- The [Epsilon code-generation tutorial](https://eclipse.dev/epsilon/doc/articles/code-generation-tutorial-egl/) develops a larger example.
