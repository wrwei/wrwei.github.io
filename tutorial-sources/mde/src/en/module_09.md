## Beyond the browser {#s1}

The Playground made the first eight modules easy to run. A project usually also needs versioned files, repeatable builds, local data, generated files on disk, and integration with other tools. Keep the same three inputs—metamodel, model, program—when moving out of the browser. Export a working example before changing its execution environment, then compare the local result with the captured result on this page.

The module's [download bundle](downloads/module_09.zip) contains its example files. The Playground's own **Download** button can package the currently open example as an Eclipse Ant, Maven, Gradle, or Java project, with a README; see the [Playground download guide](https://eclipse.dev/epsilon/doc/articles/playground/). For a local checkout of this tutorial, its [Maven runner source](https://github.com/wrwei/wrwei.github.io/tree/main/tutorial-sources/mde/runner) shows a tested Java embedding of EOL, EVL, EGL, EGX and ETL against the same files.

## Set up Eclipse Epsilon {#s2}

The [Epsilon download page](https://eclipse.dev/epsilon/download/) describes two routes: choose **Epsilon** in the Eclipse Installer, or use **Help → Install New Software** in an existing Eclipse with the stable update site `https://download.eclipse.org/epsilon/updates/2.8/`. The current stable Epsilon 2.8 line matches this tutorial's captured runs. Open a new project, extract the bundle, and inspect `components.emf`, `alarm.flexmi` and `inspect.eol`. Configure an EOL run with the model named `M`, the Flexmi file as its source and `components.emf` as its metamodel. The model name matters if the program qualifies types or uses named models.

Run the query first in the Playground, then locally. Both should list the alarm and its three components. If local loading fails, check the metamodel namespace, file paths and the full paths used by connector references before changing the EOL code.

{{EXAMPLE:m09-inspect}}

The example files are small on purpose. Use the output as a known reference while learning Eclipse's run configuration. The [Epsilon getting started guide](https://eclipse.dev/epsilon/) and the Playground's exported README give the current UI steps for the installation you use.

## Run with Ant and Maven {#s3}

An Ant workflow names the models to load and the programs to run. Epsilon supplies Ant tasks for EOL and other languages. A typical EMF model task loads an Ecore metamodel and a model, then the EOL task refers to the loaded model:

```xml
<epsilon.emf.loadModel name="M" modelFile="alarm.xmi" metamodelFile="components.ecore"/>
<epsilon.eol src="inspect.eol"><model ref="M"/></epsilon.eol>
```

This snippet assumes you have exported the Emfatic and Flexmi inputs as Ecore and XMI. For the tutorial's `.emf` and `.flexmi` files, start from the Playground's **Ant (Eclipse)** download, which includes the required setup, or use the complete [Epsilon command-line Ant example](https://eclipse.dev/epsilon/doc/articles/running-epsilon-ant-tasks-from-command-line/). A bare two-line task fragment does not install Ant tasks or convert file formats.

For Maven, choose **Maven** from the Playground download menu and run `mvn clean package` in the extracted project. The generated `pom.xml` supplies dependencies and invokes Epsilon tasks. Pin the Epsilon version in a real project; the [download page](https://eclipse.dev/epsilon/download/) shows Maven coordinates for version 2.8.0. Put validation before generation in the workflow so an invalid model does not quietly produce deliverables. This EVL gate checks connector signal types:

{{EXAMPLE:m09-validate}}

Inspect the results locally as well as the exit status. A validation finding needs an explicit build policy: report it, fail the build, or allow a documented exception.

## Run from Java {#s4}

Choose **Java (Maven)** from the Playground download menu to obtain a small Java project and the Epsilon API setup for the current example. The sequence in Java is: create a module such as `EolModule`, parse its program, load a model through an EMC driver, add that model to the module's repository, execute the module, then dispose of resources. The [tutorial runner's `Run.java`](https://github.com/wrwei/wrwei.github.io/blob/main/tutorial-sources/mde/runner/src/main/java/mde/Run.java) is a fuller implementation. Its `pom.xml` pins Epsilon 2.8.0, and the site build uses it to capture every example output.

The next EGL template is a useful embedding check: Java can capture its text, or a build can write it to a file. Compare the values with the model rather than assuming that a completed template emitted the intended data.

{{EXAMPLE:m09-generate}}

For multiple output files, EGX invokes an EGL template once per matching element. The local runtime must choose a writable output directory; the Playground shows the generated files in its output pane.

{{EXAMPLE:m09-batch}}

## Other model formats and tools {#s5}

Epsilon's **EMC** layer connects its languages to different model technologies. EMF is one driver, not the definition of a model. The [EMC guide](https://eclipse.dev/epsilon/doc/emc/) lists CSV, XML, JSON, YAML and other drivers. For example, the [CSV driver guide](https://eclipse.dev/epsilon/doc/articles/csv-emc/) uses `Row.all` in EOL and an `epsilon.csv.loadModel` Ant task. A CSV row is still an element you can query, but it does not have the component metamodel used in these Playground examples. Choose a driver and test its type names, feature names and persistence behaviour with a tiny sample before porting rules.

When a project changes shape, other Epsilon tools become relevant: [ECL](https://eclipse.dev/epsilon/doc/ecl/) compares models, [EML](https://eclipse.dev/epsilon/doc/eml/) merges them, [Flock](https://eclipse.dev/epsilon/doc/flock/) migrates old models, [EUnit](https://eclipse.dev/epsilon/doc/eunit/) tests Epsilon programs, and [Picto](https://eclipse.dev/epsilon/doc/picto/) displays model views in Eclipse. These are starting points for later study, not required for the capstone.

## Plan a real project {#s6}

Decide which model is authoritative, how it is validated, which outputs are regenerated, and what is checked into version control. Keep a small end-to-end example in continuous integration. If a transformation feeds a generator, validate the target model too. The ETL example below reuses the component-to-graph mapping: a local workflow could run EVL on the source, ETL, checks on the graph, then a graph report.

{{EXAMPLE:m09-transform}}

Record the tool version and the exact input files with generated outputs. Decide how to handle manual edits; Module 6 introduced protected regions, but a project should test regeneration on a disposable copy before trusting a merge. A useful first local milestone is simple: one command or Eclipse launch produces the same component count, validation result and report text as these pages.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**Choose a download.** Which Playground download should you choose for an Eclipse Ant workflow? Which for an API-driven Java program built with Maven?
:::

::: solution
Choose **Ant (Eclipse)** for the Eclipse workflow, and **Java (Maven)** for a Java API project with Maven dependencies. Read each exported README and check its paths.
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**Order the workflow.** Put model loading, validation, transformation and generation in a sensible order. Where would you inspect a transformed target?
:::

::: solution
Load the source, validate it, transform it, inspect or validate the target, then generate final text. Dispose of models after the workflow. A project can stop before transformation when source validation fails.
:::

::: exercise #e3 level=1 kind=conceptual minutes=5
**Choose a driver.** A team receives a CSV inventory and an XML configuration. Which Epsilon layer lets EOL access them, and what must be checked before reusing a component rule?
:::

::: solution
EMC provides CSV and XML model drivers. Check the driver's element and feature names and how it loads and stores data; a rule written for `Component` will not automatically apply to CSV `Row` elements or XML nodes.
:::

::: exercise #e4 level=2 kind=coding minutes=10
**Inspect exported files.** Write an EOL query that lists every output port as `Component.Port` so you can compare a local run with the Playground.
:::

::: solution
The query selects concrete output ports and prints their owning component names:

{{EXAMPLE:m09-e4-solution}}
:::

::: exercise #e5 level=2 kind=coding minutes=10
**Add a local gate.** Require component names to be unique before generation. Test the constraint on the alarm.
:::

::: solution
Each alarm component has a distinct name, so this EVL run passes:

{{EXAMPLE:m09-e5-solution}}
:::

::: exercise #e6 level=2 kind=coding minutes=10
**Create a handoff manifest.** Generate a short text manifest with the model name, component names and a reminder to run validation.
:::

::: solution
The EGL template reads names from the model and prints the validation step:

{{EXAMPLE:m09-e6-solution}}
:::

## Self-check quiz {#quiz}

```quiz
? What should be compared after moving an example out of the Playground?
- [x] The local result and this page's captured result
- [ ] Only the file extensions
- [ ] Only the Java version
- [ ] The colours in Eclipse
> A known output helps isolate setup errors.

? Which download contains a Java class that calls the Epsilon API?
- [ ] Ant (Eclipse)
- [x] Java (Maven)
- [ ] A PNG diagram
- [ ] Only the model XML
> The Java download includes API code and a Maven project.

? What does an Ant `model ref="M"` refer to?
- [ ] The model's file extension
- [x] A model already loaded under the name `M`
- [ ] The output directory
- [ ] The metamodel's first class
> Ant tasks share loaded models by their names.

? Why pin the Epsilon dependency version?
- [ ] To change the model's namespace
- [x] To make local and build runs reproducible
- [ ] To disable validation
- [ ] To avoid a metamodel
> A fixed tool version reduces behavioural drift.

? Which layer connects Epsilon languages to CSV and XML models?
- [ ] EGX
- [ ] ETL traces
- [x] EMC
- [ ] Picto alone
> EMC provides model drivers.

? What does Flock address?
- [ ] CSV delimiters
- [ ] Java compilation
- [x] Model migration after metamodel evolution
- [ ] One file per component
> Flock is Epsilon's migration language.

? What should happen before generating deliverables?
- [x] Validate the input and decide what failures mean for the build.
- [ ] Delete the metamodel.
- [ ] Trust that successful parsing means valid data.
- [ ] Merge generated output manually without a test.
> A repeatable workflow makes validation an explicit gate.
```

## Further reading {#reading}

- [Epsilon download and Eclipse installation](https://eclipse.dev/epsilon/download/); [Playground exports](https://eclipse.dev/epsilon/doc/articles/playground/).
- [Ant and Maven execution](https://eclipse.dev/epsilon/doc/articles/running-epsilon-ant-tasks-from-command-line/) and the [EMC guide](https://eclipse.dev/epsilon/doc/emc/).
- Dimitris Kolovos's [*Introduction to MDE, EMF and Epsilon* public lectures](https://www.youtube.com/playlist?list=PLRwHao6Ue0YUecg7vEUQTrtySIWwrd_mI) offer further viewing.
