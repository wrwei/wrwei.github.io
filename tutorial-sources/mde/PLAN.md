# Model-Driven Engineering Series: Tooling and Module 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared tooling of the bilingual MDE tutorial series (Epsilon runner, page builder, Playground bundle, browser and live checks) and publish-ready Module 1 in English and Chinese.

**Architecture:** Sources live in `tutorial-sources/mde/` and are built into `docs/tutorials/mde/`. A small Java runner executes every example on Eclipse Epsilon 2.8.0 during the build; Node tools render lessons with the AI series' Markdown dialect, embed the captured output, and write a Playground `examples.json` so every example opens in the Epsilon Playground with one click. Tests use `node:test`; browser checks use the AI tools' `puppeteer-core`.

**Tech Stack:** Java 17+ and Maven 3.9+ (Epsilon 2.8.0, Emfatic 1.1.0 from Maven Central); Node 22.2+ (`markdown-it` via `tutorial-sources/ai/tools`, `puppeteer-core`); Chrome or Edge; MkDocs (root `requirements.txt`).

**Spec:** `tutorial-sources/mde/SPEC.md` (approved 2026-10-06). Read it before starting.

**Provenance:** every code file in this plan was run in a scratch copy of the repository before the plan was written. All 17 tests passed, and `build.mjs` and `validate.mjs` passed on Module 1 with stand-in prose. Copy code exactly as given.

## Global Constraints

- Epsilon `2.8.0` and Emfatic `1.1.0`, from Maven Central only. Java 17 or later; Maven 3.9 or later; Node 22.2 or later (the zip writer uses `zlib.crc32`).
- Every module is bilingual: English (`en`) and Simplified Chinese (`zh`, HTML `lang="zh-CN"`), with the same structure (sections, examples, exercises, quiz answers).
- Outputs shown on pages come only from the build's runs. Never type expected output by hand.
- Reuse of Dimitris Kolovos's blog: ideas and examples are adapted and paraphrased, never copied. Every use carries an inline credit with a link. Quotations are at most two sentences, in quotation marks, with a citation. All example code is written for this series.
- Pages carry the site's CC BY 4.0 notice and footer, like the AI, CS and Maths series.
- Do not modify the AI series' shared files: `tutorial-sources/ai/tools/md.mjs`, `docs/tutorials/ai/assets/style.css`, `docs/tutorials/ai/assets/tutorial.js`.
- Example ids are `mNN-<slug>` and equal their folder names. EGX templates are named `template.egl`. Flexmi references use fully qualified names from the root element. No metamodel class named `System`; no feature named `from`.
- Progress keys start with `mde-series:`. The Playground bundle URL is `https://wrwei.github.io/tutorials/mde/playground/examples.json`.
- Work on branch `mde-series`. Commit after each task. **Do not push, merge into `main` or deploy unless the site owner explicitly asks** (Task 10).
- Commit messages end with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Run every command from the repository root unless a step says otherwise.

## Review Focus

1. **A model that silently fails to conform.** A typo in a Flexmi reference leaves it unset, yet the program still prints plausible output. Expected: the build stops unless the example sets `allowWarnings`. Pinned by `tests/examples.test.mjs` ("a run is compared with its declaration", Task 2) and `tests/series-examples.test.mjs` (Task 6).
2. **Build-machine details leaking into pages, or output that varies between builds.** Absolute paths, `file:` URIs and JVM object identities such as `DynamicEObjectImpl@72c927f1`. Expected: paths are removed, identities stop the build, and a rebuild changes no file. Pinned by `tests/examples.test.mjs` (sanitize and identity cases, Task 2), the zip determinism case in `tests/bundle.test.mjs` (Task 3), and the clean-rebuild step in Task 9.
3. **The Chinese edition drifting from the English one.** A missing example, re-ordered quiz answers, or an untranslated copy. Expected: the build stops and names the difference. Pinned by `tests/pages.test.mjs` (parity, Task 4) and `tests/build.test.mjs` (parity and copied source, Task 5).
4. **A Playground button that opens the wrong example or a missing file.** Bad URL encoding, an id not in the bundle, or a file not copied. Pinned by `tests/bundle.test.mjs` (link format, relative paths, copied files, Task 3), `tests/pages.test.mjs` (escaped link, Task 4) and `validate.mjs`, which checks every button against `examples.json` and every bundled file (Task 8).
5. **The Playground runs a different Epsilon from 2.8.0**, so an example that passes the build fails in the browser. For example, Flexmi accepts partially qualified names only from 2.9. Expected: the difference is found before learners meet it. Pinned by `live-check.mjs` after deployment (Task 10) and the README rules (Task 9).

## File Structure

```
tutorial-sources/mde/
  SPEC.md                      design (exists)
  PLAN.md                      this plan
  README.md                    build, check, authoring rules, reuse-permission record   (Task 9)
  GLOSSARY.md                  English–Chinese terminology                               (Task 7)
  .gitignore                   runner/target/, out/                                      (Task 1)
  runner/pom.xml               shaded jar mde-runner.jar                                 (Task 1)
  runner/src/main/java/mde/Run.java          runs one job per .properties file           (Task 1)
  runner/src/main/java/mde/ModelPrinter.java prints an ETL target model as a tree        (Task 1)
  tools/runner.mjs             ensureRunner, runJobs                                     (Task 1)
  tools/examples.mjs           loadExamples, checkDefinition, toJob, sanitize, problemsWithOutput (Task 2)
  tools/bundle.mjs             playgroundLink, writeBundle, zipEntries, writeZip         (Task 3)
  tools/pages.mjs              expandExamples, renderLesson, checkParity, checkContract, renderOverview (Task 4)
  build.mjs                    build({root, dest, bundleUrl, runnerDir}) + CLI           (Task 5)
  validate.mjs                 browser checks of the built pages                          (Task 8)
  live-check.mjs               after deployment: runs examples in the real Playground    (Task 9)
  plan/series.json             ten modules and overview text                              (Task 6)
  plan/module_01.json          Module 1 outcomes, sessions, contract                      (Task 6)
  assets/style.css, favicon.svg                                                          (Task 6)
  examples/module_01/<id>/     nine example folders                                       (Task 6)
  src/en/module_01.md, src/zh/module_01.md                                                (Task 7)
  tests/*.test.mjs, tests/fixtures/                                                       (Tasks 1–6)
docs/tutorials/mde/            generated: pages, assets, playground/, downloads/          (Task 7)
docs/tutorials/index.md        add the series card                                        (Task 9)
```

Test command used throughout (Node expands the quoted pattern itself, so it also works in PowerShell):

```
node --test --test-concurrency=1 "tutorial-sources/mde/tests/*.test.mjs"
```

`--test-concurrency=1` matters because several test files may build the Java runner, and parallel Maven builds of one project collide.

---

### Task 1: The Epsilon runner

**Files:**
- Create: `tutorial-sources/mde/.gitignore`
- Create: `tutorial-sources/mde/runner/pom.xml`
- Create: `tutorial-sources/mde/runner/src/main/java/mde/Run.java`
- Create: `tutorial-sources/mde/runner/src/main/java/mde/ModelPrinter.java`
- Create: `tutorial-sources/mde/tools/runner.mjs`
- Create: `tutorial-sources/mde/tests/runner.test.mjs`
- Create: `tutorial-sources/mde/tests/fixtures/epsilon/` (15 files below)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `ensureRunner(runnerDir: string): string`. Builds `runner/target/mde-runner.jar` with Maven when it is missing or older than `pom.xml` or any file under `runner/src`, and returns the jar path.
  - `runJobs(jar: string, jobs: Job[], workDir: string): Map<string, {status: 'ok'|'error', output: string}>`. `Job = {key, language: 'eol'|'evl'|'egl'|'egx'|'etl', program, secondProgram?, emfatic, secondEmfatic?, flexmi}` with absolute paths. `workDir` is deleted and recreated.
  - Runner output formats that later tasks and lessons rely on:
    - `Model warning (line N): <message>`: sorted by line, then message, with duplicates removed.
    - EVL: `Error [<Constraint>]: <message>`, `Warning [<Critique>]: <message>`, or `All constraints are satisfied.`
    - EGX: `--- <relative file> ---` then that file's contents, with files sorted by path.
    - ETL: the target model as an indented tree (`Graph name="Alarm"`, `  Edge source->OrGate target->AndGate`).
    - Failures: `Metamodel error in <file>: <message>` and `Parse error in <file> line N: <reason>` (first problem only); runtime errors give Epsilon's message.

- [ ] **Step 1: Create the working branch and install the shared Node packages**

```bash
git switch -c mde-series
npm ci --prefix tutorial-sources/ai/tools
```

Expected: `Switched to a new branch 'mde-series'`, then `added … packages`. `node_modules` is already ignored by `tutorial-sources/ai/.gitignore`.

- [ ] **Step 2: Create the runner fixtures**

These models and programs are also the core of Module 1's examples (Task 6).

`tutorial-sources/mde/tests/fixtures/epsilon/components.emf`:

`````emfatic
@namespace(uri="components", prefix="components")
package components;

// An architecture is a set of components wired together by connectors
class Architecture {
  attr String name;
  val Component[*] components;
  val Connector[*] connectors;
}

class Component {
  attr String name;
  val Port[*] ports;
}

abstract class Port {
  attr String name;
}

class InPort extends Port {}

class OutPort extends Port {}

// A connector carries a signal from an output port to an input port
class Connector {
  ref OutPort source;
  ref InPort target;
}
`````

`tutorial-sources/mde/tests/fixtures/epsilon/alarm.flexmi`:

`````xml
<?nsuri components?>
<architecture name="Alarm">
  <!-- The siren sounds when (door OR window) AND armed -->
  <component name="OrGate">
    <inPort name="door"/>
    <inPort name="window"/>
    <outPort name="open"/>
  </component>
  <component name="AndGate">
    <inPort name="open"/>
    <inPort name="armed"/>
    <outPort name="sound"/>
  </component>
  <component name="Siren">
    <inPort name="sound"/>
  </component>
  <connector source="Alarm.OrGate.open" target="Alarm.AndGate.open"/>
  <connector source="Alarm.AndGate.sound" target="Alarm.Siren.sound"/>
</architecture>
`````

`tutorial-sources/mde/tests/fixtures/epsilon/alarm-broken.flexmi`:

`````xml
<?nsuri components?>
<architecture name="Alarm">
  <!-- The siren sounds when (door OR window) AND armed -->
  <component name="OrGate">
    <inPort name="door"/>
    <inPort name="window"/>
    <outPort name="open"/>
  </component>
  <component name="AndGate">
    <inPort name="open"/>
    <inPort name="armed"/>
    <outPort name="sound"/>
  </component>
  <component name="Siren">
    <inPort name="sound"/>
  </component>
  <connector source="Alarm.OrGate.open" target="Alarm.AndGate.open"/>
  <connector source="Alarm.AndGate.sound" target="Alarm.Siren.sond"/>
</architecture>
`````

`tutorial-sources/mde/tests/fixtures/epsilon/alarm-loop.flexmi`:

`````xml
<?nsuri components?>
<architecture name="Alarm">
  <!-- The siren sounds when (door OR window) AND armed -->
  <component name="OrGate">
    <inPort name="door"/>
    <inPort name="window"/>
    <outPort name="open"/>
  </component>
  <component name="AndGate">
    <inPort name="open"/>
    <inPort name="armed"/>
    <outPort name="sound"/>
  </component>
  <component name="Siren">
    <inPort name="sound"/>
  </component>
  <connector source="Alarm.OrGate.open" target="Alarm.AndGate.open"/>
  <connector source="Alarm.AndGate.sound" target="Alarm.AndGate.armed"/>
</architecture>
`````

`tutorial-sources/mde/tests/fixtures/epsilon/tour.eol`:

`````eol
// Print every component with the names of its ports
for (c in Component.all) {
  (c.name + ": " + c.ports.collect(p | p.name).concat(", ")).println();
}
`````

`tutorial-sources/mde/tests/fixtures/epsilon/rules.evl`:

`````evl
// A connector must join two different components
context Connector {
  constraint NoSelfLoop {
    check: self.source.eContainer() <> self.target.eContainer()
    message: "A connector joins " + self.source.eContainer().name + " to itself"
  }
}

// Every input should be driven by something
context InPort {
  critique Connected {
    check: Connector.all.exists(c | c.target = self)
    message: self.eContainer().name + "." + self.name + " is not connected"
  }
}
`````

`tutorial-sources/mde/tests/fixtures/epsilon/parts.egl`:

`````egl
<h2>[%=Architecture.all.first().name%]: parts list</h2>
<table>
  <tr><th>Component</th><th>Inputs</th><th>Outputs</th></tr>
[% for (c in Component.all) { %]
  <tr><td>[%=c.name%]</td><td>[%=c.ports.select(p | p.isTypeOf(InPort)).size()%]</td><td>[%=c.ports.select(p | p.isTypeOf(OutPort)).size()%]</td></tr>
[% } %]
</table>
`````

`tutorial-sources/mde/tests/fixtures/epsilon/components.egx`:

`````egx
// One text file per component
rule Component2Text
  transform c : Component {
  template: "template.egl"
  target: c.name + ".txt"
}
`````

`tutorial-sources/mde/tests/fixtures/epsilon/template.egl`:

`````egl
Component [%=c.name%] has [%=c.ports.size()%] ports.
`````

`tutorial-sources/mde/tests/fixtures/epsilon/graph.emf`:

`````emfatic
@namespace(uri="graph", prefix="graph")
package graph;

// A plain directed graph
class Graph {
  attr String name;
  val Node[*] nodes;
  val Edge[*] edges;
}

class Node {
  attr String name;
}

class Edge {
  ref Node source;
  ref Node target;
}
`````

`tutorial-sources/mde/tests/fixtures/epsilon/components2graph.etl`:

`````etl
// Each architecture becomes a graph
rule Architecture2Graph
  transform a : Source!Architecture
  to g : Target!Graph {
  g.name = a.name;
  g.nodes ::= a.components;
  g.edges ::= a.connectors;
}

// Each component becomes a node
rule Component2Node
  transform c : Source!Component
  to n : Target!Node {
  n.name = c.name;
}

// Each connector becomes an edge between the components it joins
rule Connector2Edge
  transform c : Source!Connector
  to e : Target!Edge {
  e.source ::= c.source.eContainer();
  e.target ::= c.target.eContainer();
}
`````

`tutorial-sources/mde/tests/fixtures/epsilon/broken.emf`:

`````emfatic
@namespace(uri="components", prefix="components")
package components;
clas Component { attr String name; }
`````

`tutorial-sources/mde/tests/fixtures/epsilon/syntax.eol`:

`````eol
Component.all.select(c | c.name = ).println();
`````


- [ ] **Step 3: Write the failing test**

`tutorial-sources/mde/tests/runner.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ensureRunner, runJobs} from '../tools/runner.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const file = name => path.join(HERE, 'fixtures', 'epsilon', name);
const base = {emfatic: file('components.emf'), flexmi: file('alarm.flexmi')};

test('the runner runs each language and reports problems in plain words', () => {
  const jar = ensureRunner(path.join(HERE, '..', 'runner'));
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-runner-'));
  const results = runJobs(jar, [
    {key: 'eol', language: 'eol', program: file('tour.eol'), ...base},
    {key: 'evl', language: 'evl', program: file('rules.evl'), ...base, flexmi: file('alarm-loop.flexmi')},
    {key: 'egl', language: 'egl', program: file('parts.egl'), ...base},
    {key: 'egx', language: 'egx', program: file('components.egx'), secondProgram: file('template.egl'), ...base},
    {key: 'etl', language: 'etl', program: file('components2graph.etl'), secondEmfatic: file('graph.emf'), ...base},
    {key: 'dangling', language: 'eol', program: file('tour.eol'), ...base, flexmi: file('alarm-broken.flexmi')},
    {key: 'badMetamodel', language: 'eol', program: file('tour.eol'), ...base, emfatic: file('broken.emf')},
    {key: 'badProgram', language: 'eol', program: file('syntax.eol'), ...base},
  ], work);

  assert.deepEqual(results.get('eol'), {status: 'ok', output: 'OrGate: door, window, open\nAndGate: open, armed, sound\nSiren: sound\n'});
  assert.deepEqual(results.get('evl'), {status: 'ok', output: [
    'Error [NoSelfLoop]: A connector joins AndGate to itself',
    'Warning [Connected]: OrGate.door is not connected',
    'Warning [Connected]: OrGate.window is not connected',
    'Warning [Connected]: Siren.sound is not connected', ''].join('\n')});
  assert.equal(results.get('egl').status, 'ok');
  assert.match(results.get('egl').output, /<tr><td>Siren<\/td><td>1<\/td><td>0<\/td><\/tr>/);
  assert.deepEqual(results.get('egx'), {status: 'ok', output: [
    '--- AndGate.txt ---', 'Component AndGate has 3 ports.',
    '--- OrGate.txt ---', 'Component OrGate has 3 ports.',
    '--- Siren.txt ---', 'Component Siren has 1 ports.', ''].join('\n')});
  assert.deepEqual(results.get('etl'), {status: 'ok', output: [
    'Graph name="Alarm"', '  Node name="OrGate"', '  Node name="AndGate"', '  Node name="Siren"',
    '  Edge source->OrGate target->AndGate', '  Edge source->AndGate target->Siren', ''].join('\n')});
  assert.equal(results.get('dangling').status, 'ok');
  assert.match(results.get('dangling').output, /^Model warning \(line 18\): Could not resolve target Alarm\.Siren\.sond/);
  assert.equal(results.get('badMetamodel').status, 'error');
  assert.match(results.get('badMetamodel').output, /^Metamodel error in broken\.emf: .*line 3/);
  assert.equal(results.get('badProgram').status, 'error');
  assert.match(results.get('badProgram').output, /^Parse error in syntax\.eol line 1: /);
  assert.equal(results.get('badProgram').output.trim().split('\n').length, 1, 'only the first parse problem is reported');
});
`````


- [ ] **Step 4: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/mde/tests/runner.test.mjs"`
Expected: FAIL with `Cannot find module '…/tutorial-sources/mde/tools/runner.mjs'`.

- [ ] **Step 5: Write the runner and its Node wrapper**

`tutorial-sources/mde/.gitignore`:

`````text
runner/target/
out/
`````

`tutorial-sources/mde/runner/pom.xml`:

`````text
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>io.github.wrwei.mde</groupId>
  <artifactId>mde-runner</artifactId>
  <version>1.0.0</version>
  <properties>
    <epsilon.version>2.8.0</epsilon.version>
    <emfatic.version>1.1.0</emfatic.version>
    <maven.compiler.release>17</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency><groupId>org.eclipse.epsilon</groupId><artifactId>org.eclipse.epsilon.emc.emf</artifactId><version>${epsilon.version}</version></dependency>
    <dependency><groupId>org.eclipse.epsilon</groupId><artifactId>org.eclipse.epsilon.eol.engine</artifactId><version>${epsilon.version}</version></dependency>
    <dependency><groupId>org.eclipse.epsilon</groupId><artifactId>org.eclipse.epsilon.evl.engine</artifactId><version>${epsilon.version}</version></dependency>
    <dependency><groupId>org.eclipse.epsilon</groupId><artifactId>org.eclipse.epsilon.etl.engine</artifactId><version>${epsilon.version}</version></dependency>
    <dependency><groupId>org.eclipse.epsilon</groupId><artifactId>org.eclipse.epsilon.egl.engine</artifactId><version>${epsilon.version}</version></dependency>
    <dependency><groupId>org.eclipse.epsilon</groupId><artifactId>org.eclipse.epsilon.flexmi</artifactId><version>${epsilon.version}</version></dependency>
    <dependency><groupId>org.eclipse.emfatic</groupId><artifactId>org.eclipse.emfatic.core</artifactId><version>${emfatic.version}</version></dependency>
  </dependencies>
  <build>
    <finalName>mde-runner</finalName>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId><artifactId>maven-shade-plugin</artifactId><version>3.6.0</version>
        <executions><execution><phase>package</phase><goals><goal>shade</goal></goals>
          <configuration>
            <createDependencyReducedPom>false</createDependencyReducedPom>
            <transformers><transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer"><mainClass>mde.Run</mainClass></transformer>
              <transformer implementation="org.apache.maven.plugins.shade.resource.ServicesResourceTransformer"/></transformers>
            <filters><filter><artifact>*:*</artifact><excludes><exclude>META-INF/*.SF</exclude><exclude>META-INF/*.DSA</exclude><exclude>META-INF/*.RSA</exclude></excludes></filter></filters>
          </configuration></execution></executions>
      </plugin>
    </plugins>
  </build>
</project>
`````

`tutorial-sources/mde/runner/src/main/java/mde/Run.java`:

`````java
package mde;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.Properties;
import java.util.stream.Stream;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.emfatic.core.EmfaticResource;
import org.eclipse.emf.emfatic.core.EmfaticResourceFactory;
import org.eclipse.epsilon.common.parse.problem.ParseProblem;
import org.eclipse.epsilon.egl.EglTemplateFactoryModuleAdapter;
import org.eclipse.epsilon.egl.EgxModule;
import org.eclipse.epsilon.emc.emf.EmfModel;
import org.eclipse.epsilon.eol.IEolModule;
import org.eclipse.epsilon.eol.EolModule;
import org.eclipse.epsilon.etl.EtlModule;
import org.eclipse.epsilon.evl.EvlModule;
import org.eclipse.epsilon.evl.execute.UnsatisfiedConstraint;
import org.eclipse.epsilon.flexmi.FlexmiResourceFactory;
import org.eclipse.gymnast.runtime.core.parser.ParseContext;
import org.eclipse.gymnast.runtime.core.parser.ParseError;
import org.eclipse.gymnast.runtime.core.parser.ParseMessage;

/**
 * Runs Epsilon examples the way the Epsilon Playground does.
 * Usage: java -jar mde-runner.jar job1.properties [job2.properties ...]
 * Each job writes output.txt and status.txt into its "out" directory.
 */
public class Run {

  public static void main(String[] args) throws Exception {
    if (args.length == 0) {
      System.err.println("Usage: java -jar mde-runner.jar job.properties...");
      System.exit(2);
    }
    Resource.Factory.Registry.INSTANCE.getExtensionToFactoryMap().put("flexmi", new FlexmiResourceFactory());
    Resource.Factory.Registry.INSTANCE.getExtensionToFactoryMap().put("emf", new EmfaticResourceFactory());
    for (String arg : args) {
      Properties job = new Properties();
      try (var in = new InputStreamReader(new FileInputStream(arg), StandardCharsets.UTF_8)) { job.load(in); }
      Path out = Path.of(required(job, "out"));
      Files.createDirectories(out);
      ByteArrayOutputStream console = new ByteArrayOutputStream();
      String status;
      try (PrintStream stream = new PrintStream(console, true, StandardCharsets.UTF_8)) {
        try {
          run(job, stream, out);
          status = "ok";
        } catch (Throwable t) {
          String message = t.getMessage() == null ? t.toString() : t.getMessage();
          stream.println(message.strip());
          status = "error\n" + message.strip();
        }
      }
      Files.writeString(out.resolve("output.txt"), console.toString(StandardCharsets.UTF_8).replace("\r\n", "\n"), StandardCharsets.UTF_8);
      Files.writeString(out.resolve("status.txt"), status + "\n", StandardCharsets.UTF_8);
    }
  }

  static void run(Properties job, PrintStream console, Path out) throws Exception {
    String language = required(job, "language");
    IEolModule module = switch (language) {
      case "eol" -> new EolModule();
      case "evl" -> new EvlModule();
      case "etl" -> new EtlModule();
      case "egl" -> new EglTemplateFactoryModuleAdapter();
      case "egx" -> new EgxModule(out.resolve("gen").toAbsolutePath().toString());
      default -> throw new IllegalArgumentException("Unsupported language: " + language);
    };
    module.getContext().setOutputStream(console);
    module.getContext().setErrorStream(console);
    File program = new File(required(job, "program"));
    module.parse(program);
    if (!module.getParseProblems().isEmpty()) {
      ParseProblem p = module.getParseProblems().get(0);
      throw new IllegalStateException("Parse error in " + program.getName() + " line " + p.getLine() + ": " + p.getReason());
    }
    checkMetamodel(required(job, "emfatic"));
    if (language.equals("etl")) checkMetamodel(required(job, "secondEmfatic"));
    EmfModel source = loadModel(language.equals("etl") ? "Source" : "M", required(job, "flexmi"), required(job, "emfatic"), console);
    module.getContext().getModelRepository().addModel(source);
    EmfModel target = null;
    if (language.equals("etl")) {
      target = new EmfModel();
      target.setName("Target");
      target.setMetamodelFile(new File(required(job, "secondEmfatic")).getAbsolutePath());
      target.setModelFile(out.resolve("target.xmi").toAbsolutePath().toString());
      target.setReadOnLoad(false);
      target.setStoredOnDisposal(false);
      target.load();
      module.getContext().getModelRepository().addModel(target);
    }
    try {
      Object result = module.execute();
      switch (language) {
        case "evl" -> report(((EvlModule) module).getContext().getUnsatisfiedConstraints(), console);
        case "egl" -> console.print(result);
        case "egx" -> printGenerated(out.resolve("gen"), console);
        case "etl" -> ModelPrinter.print(target.getResource().getContents(), console);
        default -> { }
      }
    } finally {
      module.getContext().getModelRepository().dispose();
      module.getContext().dispose();
    }
  }

  /**
   * Emfatic keeps syntax errors in its own parse context rather than in Resource.getErrors(),
   * and they otherwise surface later as a misleading "Failed to locate EPackage".
   */
  static void checkMetamodel(String emfatic) throws Exception {
    File file = new File(emfatic);
    EmfaticResource resource = new EmfaticResource(URI.createFileURI(file.getAbsolutePath()));
    resource.load(null);
    ParseContext parse = resource.getParseContext();
    if (parse != null && parse.hasErrors()) {
      ParseMessage first = Arrays.stream(parse.getMessages()).filter(m -> m instanceof ParseError).findFirst().orElse(parse.getMessages()[0]);
      String message = first.getMessage().replaceAll("\\s*\\n\\s*", " ").strip();
      if (!message.contains(" at line ")) {
        String text = Files.readString(file.toPath(), StandardCharsets.UTF_8);
        long line = text.substring(0, Math.min(first.getOffset(), text.length())).chars().filter(c -> c == '\n').count() + 1;
        message = message + " (line " + line + ")";
      }
      throw new IllegalStateException("Metamodel error in " + file.getName() + ": " + message);
    }
  }

  static EmfModel loadModel(String name, String flexmi, String emfatic, PrintStream console) throws Exception {
    EmfModel model = new EmfModel();
    model.setName(name);
    model.setMetamodelFile(new File(emfatic).getAbsolutePath());
    model.setModelFile(new File(flexmi).getAbsolutePath());
    model.setReadOnLoad(true);
    model.setStoredOnDisposal(false);
    model.load();
    model.getResource().getWarnings().stream()
      .sorted(Comparator.comparingInt(Resource.Diagnostic::getLine).thenComparing(Resource.Diagnostic::getMessage))
      .map(w -> "Model warning (line " + w.getLine() + "): " + w.getMessage())
      .distinct()
      .forEach(console::println);
    return model;
  }

  static void report(Collection<UnsatisfiedConstraint> unsatisfied, PrintStream console) {
    if (unsatisfied.isEmpty()) {
      console.println("All constraints are satisfied.");
      return;
    }
    for (UnsatisfiedConstraint c : unsatisfied) {
      console.println((c.getConstraint().isCritique() ? "Warning" : "Error") + " [" + c.getConstraint().getName() + "]: " + c.getMessage());
    }
  }

  static void printGenerated(Path root, PrintStream console) throws Exception {
    if (!Files.exists(root)) return;
    try (Stream<Path> files = Files.walk(root)) {
      for (Path file : files.filter(Files::isRegularFile).sorted(Comparator.comparing(Path::toString)).toList()) {
        console.println("--- " + root.relativize(file).toString().replace('\\', '/') + " ---");
        console.println(Files.readString(file, StandardCharsets.UTF_8).stripTrailing());
      }
    }
  }

  static String required(Properties job, String key) {
    String value = job.getProperty(key);
    if (value == null || value.isBlank()) throw new IllegalArgumentException("Job is missing '" + key + "'");
    return value;
  }
}
`````

`tutorial-sources/mde/runner/src/main/java/mde/ModelPrinter.java`:

`````java
package mde;

import java.io.PrintStream;
import java.util.List;

import org.eclipse.emf.ecore.EAttribute;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EReference;
import org.eclipse.emf.ecore.EStructuralFeature;

/** Prints a model as an indented tree: one element per line, containment as nesting. */
final class ModelPrinter {

  static void print(List<EObject> roots, PrintStream console) {
    if (roots.isEmpty()) console.println("(the target model is empty)");
    for (EObject root : roots) print(root, 0, console);
  }

  private static void print(EObject object, int depth, PrintStream console) {
    StringBuilder line = new StringBuilder("  ".repeat(depth)).append(object.eClass().getName());
    for (EAttribute attribute : object.eClass().getEAllAttributes()) {
      if (object.eIsSet(attribute)) line.append(' ').append(attribute.getName()).append('=').append(format(object.eGet(attribute)));
    }
    for (EReference reference : object.eClass().getEAllReferences()) {
      if (reference.isContainment() || reference.isContainer() || !object.eIsSet(reference)) continue;
      Object value = object.eGet(reference);
      line.append(' ').append(reference.getName()).append("->");
      if (value instanceof List<?> list) {
        line.append('[');
        for (int i = 0; i < list.size(); i++) line.append(i == 0 ? "" : ", ").append(label((EObject) list.get(i)));
        line.append(']');
      } else {
        line.append(label((EObject) value));
      }
    }
    console.println(line);
    for (EObject child : object.eContents()) print(child, depth + 1, console);
  }

  private static String label(EObject object) {
    EStructuralFeature name = object.eClass().getEStructuralFeature("name");
    if (name != null && object.eGet(name) != null) return String.valueOf(object.eGet(name));
    return object.eClass().getName();
  }

  private static String format(Object value) {
    return value instanceof String s ? '"' + s + '"' : String.valueOf(value);
  }
}
`````

`tutorial-sources/mde/tools/runner.mjs`:

`````js
// Runs examples on Eclipse Epsilon through the Java runner in ../runner.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const windows = process.platform === 'win32';

/** Builds runner/target/mde-runner.jar when it is missing or older than its sources; returns its path. */
export function ensureRunner(runnerDir) {
  const jar = path.join(runnerDir, 'target', 'mde-runner.jar');
  const sources = [path.join(runnerDir, 'pom.xml'), ...listFiles(path.join(runnerDir, 'src'))];
  const stale = !fs.existsSync(jar) || sources.some(file => fs.statSync(file).mtimeMs > fs.statSync(jar).mtimeMs);
  if (stale) {
    const mvn = spawnSync(windows ? 'mvn.cmd' : 'mvn', ['-q', '-B', '-f', path.join(runnerDir, 'pom.xml'), 'package'], {encoding: 'utf8', shell: windows});
    if (mvn.error || mvn.status !== 0) throw new Error(`Building the Epsilon runner failed:\n${mvn.error || mvn.stdout + mvn.stderr}`);
  }
  return jar;
}

function listFiles(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry =>
    entry.isDirectory() ? listFiles(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}

/**
 * Runs jobs in one JVM. A job is {key, language, program, secondProgram?, emfatic, secondEmfatic?, flexmi}
 * with absolute file paths. Returns Map(key -> {status: 'ok' | 'error', output}).
 */
export function runJobs(jar, jobs, workDir) {
  fs.rmSync(workDir, {recursive: true, force: true});
  fs.mkdirSync(path.join(workDir, 'jobs'), {recursive: true});
  const files = jobs.map(job => {
    const out = path.join(workDir, 'out', job.key);
    const lines = Object.entries({...job, out})
      .filter(([key, value]) => key !== 'key' && value)
      .map(([key, value]) => `${key}=${String(value).replace(/\\/g, '\\\\')}`);
    const file = path.join(workDir, 'jobs', `${job.key}.properties`);
    fs.writeFileSync(file, lines.join('\n') + '\n');
    return file;
  });
  const java = spawnSync('java', ['-jar', jar, ...files], {encoding: 'utf8', timeout: 300000});
  if (java.error || java.status !== 0) throw new Error(`The Epsilon runner crashed:\n${java.error || java.stdout + java.stderr}`);
  return new Map(jobs.map(job => {
    const out = path.join(workDir, 'out', job.key);
    const status = fs.readFileSync(path.join(out, 'status.txt'), 'utf8').split('\n')[0];
    return [job.key, {status, output: fs.readFileSync(path.join(out, 'output.txt'), 'utf8')}];
  }));
}
`````


Why the runner looks like this (all found by running Epsilon 2.8.0, keep these behaviours):
- Emfatic keeps syntax errors in its own parse context, not in `Resource.getErrors()`, and they otherwise surface later as a misleading `Failed to locate EPackage`. That is why there is a separate `checkMetamodel`.
- Flexmi warnings arrive in a different order on each run, so they are sorted and de-duplicated.
- Parse errors are reported once (Epsilon repeats them), and the ETL models are named `Source` and `Target` as in the Playground.

- [ ] **Step 6: Run the test to see it pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/mde/tests/runner.test.mjs"`
Expected: PASS (`# pass 1`). The first run downloads Epsilon from Maven Central, which can take a few minutes.

- [ ] **Step 7: Commit**

```bash
git add tutorial-sources/mde/.gitignore tutorial-sources/mde/runner tutorial-sources/mde/tools/runner.mjs tutorial-sources/mde/tests
git status --short   # runner/target must not appear
git commit -m "MDE series: add the Epsilon example runner" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Example definitions

**Files:**
- Create: `tutorial-sources/mde/tools/examples.mjs`
- Create: `tutorial-sources/mde/tests/examples.test.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure functions plus `fs`).
- Produces:
  - `LANGUAGES = ['eol','evl','egl','egx','etl']`, `FILE_FIELDS = ['program','secondProgram','flexmi','emfatic','secondEmfatic']`.
  - `loadExamples(moduleDir: string, number: number): Example[]`. Reads `<moduleDir>/<id>/example.json` (sorted by folder), throws on any definition problem, and adds `dir`.
  - `checkDefinition(example, folder, number, dir): string[]` (problems; empty when valid).
  - `toJob(example): Job` (the `Job` of Task 1, `key = id`).
  - `sanitize(text: string, roots: string[]): string`. Removes `file:` URIs and paths under `roots` (POSIX and Windows forms), trims line ends, and ends with one newline.
  - `problemsWithOutput(example, result: {status, output}): string[]`.

- [ ] **Step 1: Write the failing test**

`tutorial-sources/mde/tests/examples.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {checkDefinition, sanitize, problemsWithOutput} from '../tools/examples.mjs';

function folder(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-example-'));
  for (const name of files) fs.writeFileSync(path.join(dir, name), '');
  return dir;
}
const valid = {id: 'm01-tour', title: {en: 'Tour', zh: '导览'}, language: 'eol', program: 'tour.eol', emfatic: 'c.emf', flexmi: 'a.flexmi', expect: 'ok'};

test('a complete definition has no problems', () => {
  assert.deepEqual(checkDefinition(valid, 'm01-tour', 1, folder(['tour.eol', 'c.emf', 'a.flexmi'])), []);
});

test('definitions are checked field by field', () => {
  const dir = folder(['tour.eol', 'c.emf', 'a.flexmi', 'gen.egx', 'page.egl']);
  const problems = (change, name = 'm01-tour', number = 1) => checkDefinition({...valid, ...change}, name, number, dir).join(' | ');
  assert.match(problems({}, 'm01-other'), /must equal its folder name/);
  assert.match(problems({}, 'm01-tour', 2), /must start with "m02-"/);
  assert.match(problems({title: {en: 'Tour'}}), /title needs "en" and "zh"/);
  assert.match(problems({language: 'ocl'}), /language must be one of/);
  assert.match(problems({flexmi: undefined}), /"flexmi" is required/);
  assert.match(problems({program: 'missing.eol'}), /does not exist/);
  assert.match(problems({language: 'etl'}), /secondEmfatic/);
  assert.match(problems({language: 'egx', program: 'gen.egx', secondProgram: 'page.egl'}), /template\.egl/);
  assert.match(problems({expect: 'maybe'}), /"expect" must be/);
  assert.match(problems({expect: 'error'}), /expectContains/);
  assert.match(problems({show: ['secondEmfatic']}), /"show" lists "secondEmfatic"/);
});

test('sanitize removes build-machine paths in POSIX and Windows form', () => {
  const posix = 'Error in file:/repo/ex/m01-a/query.eol and /repo/ex/m01-a/model.flexmi  \n\n';
  assert.equal(sanitize(posix, ['/repo/ex/m01-a']), 'Error in query.eol and model.flexmi\n');
  const windows = 'see file:/C:/repo/ex/m01-a/query.eol';
  assert.equal(sanitize(windows, ['C:\\repo\\ex\\m01-a']), 'see query.eol\n');
});

test('a run is compared with its declaration', () => {
  const ok = {status: 'ok', output: 'fine\n'};
  assert.deepEqual(problemsWithOutput(valid, ok), []);
  assert.match(problemsWithOutput(valid, {status: 'error', output: 'boom\n'}).join(), /expected "ok"/);
  const failing = {...valid, expect: 'error', expectContains: 'Parse error'};
  assert.deepEqual(problemsWithOutput(failing, {status: 'error', output: 'Parse error in q.eol line 1: x\n'}), []);
  assert.match(problemsWithOutput(failing, {status: 'error', output: 'Other\n'}).join(), /does not contain/);
  assert.match(problemsWithOutput(valid, {status: 'ok', output: 'Model warning (line 3): x\n'}).join(), /does not conform/);
  assert.deepEqual(problemsWithOutput({...valid, allowWarnings: true}, {status: 'ok', output: 'Model warning (line 3): x\n'}), []);
  assert.match(problemsWithOutput(valid, {status: 'ok', output: 'at /Users/me/x\n'}).join(), /file-system path/);
  assert.match(problemsWithOutput(valid, {status: 'ok', output: 'DynamicEObjectImpl@72c927f1\n'}).join(), /object identity/);
});
`````


- [ ] **Step 2: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/mde/tests/examples.test.mjs"`
Expected: FAIL with `Cannot find module '…/tools/examples.mjs'`.

- [ ] **Step 3: Write the implementation**

`tutorial-sources/mde/tools/examples.mjs`:

`````js
// Example definitions: one folder per runnable example, described by its example.json.
import fs from 'node:fs';
import path from 'node:path';

export const LANGUAGES = ['eol', 'evl', 'egl', 'egx', 'etl'];
export const FILE_FIELDS = ['program', 'secondProgram', 'flexmi', 'emfatic', 'secondEmfatic'];

/** Loads and checks every examples/module_NN/<id>/example.json; adds `dir` to each. */
export function loadExamples(moduleDir, number) {
  if (!fs.existsSync(moduleDir)) return [];
  return fs.readdirSync(moduleDir)
    .filter(name => fs.existsSync(path.join(moduleDir, name, 'example.json')))
    .sort()
    .map(name => {
      const dir = path.join(moduleDir, name);
      const example = JSON.parse(fs.readFileSync(path.join(dir, 'example.json'), 'utf8'));
      const problems = checkDefinition(example, name, number, dir);
      if (problems.length) throw new Error(`Example ${name}:\n- ${problems.join('\n- ')}`);
      return {...example, dir};
    });
}

export function checkDefinition(example, folder, number, dir) {
  const problems = [];
  const prefix = `m${String(number).padStart(2, '0')}-`;
  const id = String(example.id ?? '');
  if (id !== folder) problems.push(`id "${id}" must equal its folder name "${folder}"`);
  if (!id.startsWith(prefix)) problems.push(`id must start with "${prefix}"`);
  if (!/^[a-z0-9-]+$/.test(id)) problems.push('id may contain only lower-case letters, digits and hyphens');
  if (!example.title?.en || !example.title?.zh) problems.push('title needs "en" and "zh"');
  if (!LANGUAGES.includes(example.language)) problems.push(`language must be one of ${LANGUAGES.join(', ')}`);
  for (const field of ['program', 'emfatic', 'flexmi']) if (!example[field]) problems.push(`"${field}" is required`);
  if (example.language === 'etl' && !example.secondEmfatic) problems.push('ETL examples need "secondEmfatic" (the target metamodel)');
  // The Playground saves an EGX example's second program as template.egl, so the EGX rules must use that name.
  if (example.language === 'egx' && example.secondProgram !== 'template.egl') problems.push('EGX examples need "secondProgram": "template.egl"');
  for (const field of FILE_FIELDS) {
    if (example[field] && !fs.existsSync(path.join(dir, example[field]))) problems.push(`${field} file "${example[field]}" does not exist`);
  }
  if (!['ok', 'error'].includes(example.expect)) problems.push('"expect" must be "ok" or "error"');
  if (example.expect === 'error' && !example.expectContains) problems.push('"expect": "error" needs "expectContains"');
  if (!['example', 'solution'].includes(example.role ?? 'example')) problems.push('"role" must be "example" or "solution"');
  for (const field of example.show ?? []) if (!FILE_FIELDS.includes(field) || !example[field]) problems.push(`"show" lists "${field}", which this example does not have`);
  return problems;
}

export function toJob(example) {
  const job = {key: example.id, language: example.language};
  for (const field of FILE_FIELDS) if (example[field]) job[field] = path.join(example.dir, example[field]);
  return job;
}

/** Removes build-machine paths so outputs are the same on every machine. */
export function sanitize(text, roots) {
  let out = text.replace(/\r\n/g, '\n');
  for (const root of roots) {
    const forward = root.replace(/\\/g, '/');
    for (const prefix of [`file:${forward}/`, `file:/${forward}/`, `${forward}/`, `${root}${path.sep}`]) out = out.split(prefix).join('');
  }
  return out.split('\n').map(line => line.trimEnd()).join('\n').trimEnd() + '\n';
}

/** Lists the ways a run differs from what its example.json declares; empty when it behaved as declared. */
export function problemsWithOutput(example, result) {
  const problems = [];
  if (result.status !== example.expect) problems.push(`expected "${example.expect}" but the run ended with "${result.status}"`);
  if (example.expect === 'error' && !result.output.includes(example.expectContains)) problems.push(`output does not contain "${example.expectContains}"`);
  if (result.output.includes('Model warning') && !example.allowWarnings) problems.push('the model does not conform (set "allowWarnings": true only when that is the point of the example)');
  if (/(?:\b[A-Za-z]:[\\/]|\/(?:Users|home|private|tmp|var)\/|file:\/)/.test(result.output)) problems.push('output contains a file-system path');
  if (/@[0-9a-f]{6,8}\b/.test(result.output)) problems.push('output contains a Java object identity, which changes on every run; pick an error whose message does not print an object');
  if (/^`{4,}/m.test(result.output)) problems.push('output contains a line starting with four backticks, which would end its code block');
  return problems;
}
`````


- [ ] **Step 4: Run the test to see it pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/mde/tests/examples.test.mjs"`
Expected: PASS (`# pass 4`).

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/mde/tools/examples.mjs tutorial-sources/mde/tests/examples.test.mjs
git commit -m "MDE series: check example definitions and captured output" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Playground bundle and downloads

**Files:**
- Create: `tutorial-sources/mde/tools/bundle.mjs`
- Create: `tutorial-sources/mde/tests/bundle.test.mjs`

**Interfaces:**
- Consumes: `FILE_FIELDS` from `tools/examples.mjs` (Task 2).
- Produces:
  - `PLAYGROUND = 'https://eclipse.dev/epsilon/playground/'`.
  - `playgroundLink(bundleUrl, id): string` returns `${PLAYGROUND}?examples=${encodeURIComponent(bundleUrl)}&${id}`. The Playground selects the example whose id is a parameter with no value, and resolves file paths relative to `examples.json`.
  - `writeBundle(dest, modules: {number, title: {en}, examples}[])`. Replaces `dest/playground/`, writes `examples.json` (`{examples: [{title: 'Module NN: …', examples: [{id, title, language, program, …, outputType?, outputLanguage?}]}]}`), and copies files to `module_NN/<id>/<file>`. Modules without examples are left out.
  - `zipEntries(examples): {name, data}[]` gives each file as `<id>/<file>`.
  - `writeZip(file, entries)` writes stored entries with a fixed timestamp, so the same input gives the same bytes.

- [ ] **Step 1: Write the failing test**

`tutorial-sources/mde/tests/bundle.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {playgroundLink, writeBundle, writeZip, zipEntries} from '../tools/bundle.mjs';

test('Playground links name the bundle and select the example', () => {
  assert.equal(playgroundLink('https://wrwei.github.io/tutorials/mde/playground/examples.json', 'm01-tour'),
    'https://eclipse.dev/epsilon/playground/?examples=https%3A%2F%2Fwrwei.github.io%2Ftutorials%2Fmde%2Fplayground%2Fexamples.json&m01-tour');
});

function example() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-bundle-'));
  for (const name of ['tour.eol', 'c.emf', 'a.flexmi']) fs.writeFileSync(path.join(dir, name), `contents of ${name}\n`);
  return {id: 'm01-tour', title: {en: 'Tour', zh: '导览'}, language: 'egl', program: 'tour.eol', emfatic: 'c.emf', flexmi: 'a.flexmi', outputType: 'html', dir};
}

test('the bundle groups examples by module with paths relative to examples.json', () => {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-dest-'));
  writeBundle(dest, [{number: 1, title: {en: 'What is MDE?'}, examples: [example()]}, {number: 2, title: {en: 'Later'}, examples: []}]);
  const bundle = JSON.parse(fs.readFileSync(path.join(dest, 'playground', 'examples.json'), 'utf8'));
  assert.deepEqual(bundle, {examples: [{title: 'Module 01: What is MDE?', examples: [{
    id: 'm01-tour', title: 'Tour', language: 'egl',
    program: 'module_01/m01-tour/tour.eol', flexmi: 'module_01/m01-tour/a.flexmi', emfatic: 'module_01/m01-tour/c.emf', outputType: 'html'}]}]});
  assert.equal(fs.readFileSync(path.join(dest, 'playground', 'module_01', 'm01-tour', 'c.emf'), 'utf8'), 'contents of c.emf\n');
});

test('zip downloads open with the JDK jar tool', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'mde-zip-')), 'module_01.zip');
  writeZip(file, zipEntries([example()]));
  const listing = spawnSync('jar', ['tf', file], {encoding: 'utf8'});
  assert.equal(listing.status, 0, listing.stderr);
  assert.deepEqual(listing.stdout.trim().split(/\r?\n/), ['m01-tour/tour.eol', 'm01-tour/a.flexmi', 'm01-tour/c.emf']);
  const first = fs.readFileSync(file);
  writeZip(file, zipEntries([example()]));
  assert.deepEqual(fs.readFileSync(file), first, 'the same files give the same bytes');
});
`````


- [ ] **Step 2: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/mde/tests/bundle.test.mjs"`
Expected: FAIL with `Cannot find module '…/tools/bundle.mjs'`.

- [ ] **Step 3: Write the implementation**

`tutorial-sources/mde/tools/bundle.mjs`:

`````js
// The Epsilon Playground bundle (examples.json plus files) and per-module zip downloads.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {FILE_FIELDS} from './examples.mjs';

export const PLAYGROUND = 'https://eclipse.dev/epsilon/playground/';
const pad = n => String(n).padStart(2, '0');

/** The Playground selects an example by a query parameter with no value: ?examples=<bundle>&<id>. */
export function playgroundLink(bundleUrl, id) {
  return `${PLAYGROUND}?examples=${encodeURIComponent(bundleUrl)}&${id}`;
}

/** modules: [{number, title: {en}, examples}]. Writes dest/playground/; paths in examples.json are relative to it. */
export function writeBundle(dest, modules) {
  const root = path.join(dest, 'playground');
  fs.rmSync(root, {recursive: true, force: true});
  fs.mkdirSync(root, {recursive: true});
  const groups = modules.filter(m => m.examples.length).map(m => ({
    title: `Module ${pad(m.number)}: ${m.title.en}`,
    examples: m.examples.map(example => {
      const entry = {id: example.id, title: example.title.en, language: example.language};
      for (const field of FILE_FIELDS) {
        if (!example[field]) continue;
        const relative = `module_${pad(m.number)}/${example.id}/${example[field]}`;
        fs.mkdirSync(path.dirname(path.join(root, relative)), {recursive: true});
        fs.copyFileSync(path.join(example.dir, example[field]), path.join(root, relative));
        entry[field] = relative;
      }
      if (example.outputType) entry.outputType = example.outputType;
      if (example.outputLanguage) entry.outputLanguage = example.outputLanguage;
      return entry;
    }),
  }));
  fs.writeFileSync(path.join(root, 'examples.json'), JSON.stringify({examples: groups}, null, 2) + '\n');
  return groups;
}

/** Each example's files under <id>/, for running the examples in Eclipse. */
export function zipEntries(examples) {
  return examples.flatMap(example => FILE_FIELDS.filter(field => example[field]).map(field => ({
    name: `${example.id}/${example[field]}`,
    data: fs.readFileSync(path.join(example.dir, example[field])),
  })));
}

/** Stored (uncompressed) entries with a fixed 1980-01-01 timestamp, so the same files give the same bytes. */
export function writeZip(file, entries) {
  const parts = [];
  const central = [];
  let offset = 0;
  for (const {name, data} of entries) {
    const nameBytes = Buffer.from(name, 'utf8');
    const crc = zlib.crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0x21, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28);
    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50, 0);
    record.writeUInt16LE(20, 4);
    record.writeUInt16LE(20, 6);
    record.writeUInt16LE(0x0800, 8);
    record.writeUInt16LE(0, 10);
    record.writeUInt16LE(0, 12);
    record.writeUInt16LE(0x21, 14);
    record.writeUInt32LE(crc, 16);
    record.writeUInt32LE(data.length, 20);
    record.writeUInt32LE(data.length, 24);
    record.writeUInt16LE(nameBytes.length, 28);
    record.writeUInt32LE(offset, 42);
    parts.push(local, nameBytes, data);
    central.push(record, nameBytes);
    offset += local.length + nameBytes.length + data.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, Buffer.concat([...parts, directory, end]));
}
`````


- [ ] **Step 4: Run the test to see it pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/mde/tests/bundle.test.mjs"`
Expected: PASS (`# pass 3`). The zip test calls the JDK's `jar` tool; it must be on `PATH`.

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/mde/tools/bundle.mjs tutorial-sources/mde/tests/bundle.test.mjs
git commit -m "MDE series: write the Playground bundle and example downloads" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Page templates

**Files:**
- Create: `tutorial-sources/mde/tools/pages.mjs`
- Create: `tutorial-sources/mde/tests/pages.test.mjs`

**Interfaces:**
- Consumes: `makeMd`, `newEnv`, `escapeHtml` from `tutorial-sources/ai/tools/md.mjs` (existing, unchanged); `playgroundLink` from Task 3.
- Produces:
  - `EPSILON_VERSION = '2.8.0'`, `pad(n)`, `lessonFile(n, lang)` (`module_01_EN.html` / `module_01_ZH.html`), `overviewFile(lang)` (`index.html` / `index_ZH.html`), `UI` labels.
  - `expandExamples(source, byId: Map<id, Example & {result}>, lang, bundleUrl): {markdown, used: string[]}`. Each line that is exactly `{{EXAMPLE:<id>}}` becomes a `<div class="example" id="ex-<id>">` block with a Playground button, the files (`show` order open, the rest in `<details class="example-files">`), a caption, and the output as an ```` ```` ````output ```` fence.
  - `renderLesson({meta, lang, source, byId, bundleUrl, series, published}): {html, record}`, with `record = {sections, examples, exercises, solutions, quizAnswers}`. It rejects `<!-- BRIEF` notes, `$…$` read as maths, and sessions that do not add up.
  - `checkParity(en, zh, number)` and `checkContract(record, contract, examples, number)` throw with a message naming the problem.
  - `renderOverview({series, published, lang}): string`.

- [ ] **Step 1: Write the failing test**

`tutorial-sources/mde/tests/pages.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {expandExamples, renderLesson, checkParity, checkContract} from '../tools/pages.mjs';

const BUNDLE = 'https://example.test/pg/examples.json';
function fakeExample(extra = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-pages-'));
  fs.writeFileSync(path.join(dir, 'q.eol'), 'for (c in Component.all) {\n\n  c.name.println();\n}\n');
  fs.writeFileSync(path.join(dir, 'a.flexmi'), '<?nsuri components?>\n<architecture name="A"/>\n');
  fs.writeFileSync(path.join(dir, 'c.emf'), 'package components;\n');
  return {id: 'm01-q', title: {en: 'Query', zh: '查询'}, language: 'eol', program: 'q.eol', flexmi: 'a.flexmi', emfatic: 'c.emf', dir,
    result: {status: 'ok', output: '<b>OrGate</b>\n\nSiren\n'}, ...extra};
}

test('an example marker becomes code, a Playground link and the captured output', () => {
  const byId = new Map([['m01-q', fakeExample()]]);
  const {markdown, used} = expandExamples('Intro\n\n{{EXAMPLE:m01-q}}\n', byId, 'en', BUNDLE);
  assert.deepEqual(used, ['m01-q']);
  assert.match(markdown, /href="https:\/\/eclipse\.dev\/epsilon\/playground\/\?examples=https%3A%2F%2Fexample\.test%2Fpg%2Fexamples\.json&amp;m01-q"/);
  assert.match(markdown, /````eol\nfor \(c in Component\.all\) \{\n\n  c\.name\.println\(\);\n\}\n````/);
  assert.match(markdown, /<summary>More files: a\.flexmi, c\.emf<\/summary>/);
  assert.match(markdown, /````output\n<b>OrGate<\/b>\n\nSiren\n````/);
  assert.throws(() => expandExamples('{{EXAMPLE:m01-nope}}\n', byId, 'en', BUNDLE), /Unknown example "m01-nope"/);
  assert.throws(() => expandExamples('See {{EXAMPLE:m01-q}} inline.\n', byId, 'en', BUNDLE), /line of its own/);
});

const meta = {number: 1, hours: 1, title: {en: 'T', zh: 'T'}, lead: {en: 'L', zh: 'L'}, prerequisites: {en: 'P', zh: 'P'}, outcomes: {en: ['O'], zh: ['O']},
  sessions: [{minutes: 60, title: {en: 'S', zh: 'S'}, activities: [{kind: 'read', anchor: 's1', minutes: 60, text: {en: 'R', zh: 'R'}}]}]};
const series = {modules: [{number: 1, title: {en: 'T', zh: 'T'}}]};

test('a lesson page escapes captured output and reports its structure', () => {
  const byId = new Map([['m01-q', fakeExample()]]);
  const source = '## One {#s1}\n\n{{EXAMPLE:m01-q}}\n\n```quiz\n? Q\n- [x] A\n- [ ] B\n> E\n```\n';
  const {html, record} = renderLesson({meta, lang: 'en', source, byId, bundleUrl: BUNDLE, series, published: [1]});
  assert.match(html, /&lt;b&gt;OrGate&lt;\/b&gt;/);
  assert.match(html, /data-key="mde-series:m01:s1"/);
  assert.match(html, /href="module_01_ZH\.html"/);
  assert.deepEqual(record, {sections: ['s1'], examples: ['m01-q'], exercises: 0, solutions: 0, quizAnswers: [0]});
  assert.throws(() => renderLesson({meta, lang: 'en', source: '## One {#s1}\n\nCosts $5 and $x$ here.\n', byId, bundleUrl: BUNDLE, series, published: [1]}), /read as maths/);
  assert.throws(() => renderLesson({meta, lang: 'en', source: '## One {#s1}\n\n<!-- BRIEF write this -->\n', byId, bundleUrl: BUNDLE, series, published: [1]}), /BRIEF/);
  assert.throws(() => renderLesson({meta: {...meta, hours: 2}, lang: 'en', source: '## One {#s1}\n', byId, bundleUrl: BUNDLE, series, published: [1]}), /add up to 2 hours/);
});

test('parity and contract checks name what is wrong', () => {
  const en = {sections: ['s1', 'quiz'], examples: ['m01-q'], exercises: 1, solutions: 1, quizAnswers: [0, 2]};
  assert.doesNotThrow(() => checkParity(en, structuredClone(en), 1));
  assert.throws(() => checkParity(en, {...en, quizAnswers: [0, 1]}, 1), /quizAnswers differ/);
  const contract = {examples: [1, 2], exercises: 1, quiz: [2, 3], sections: ['s1', 'quiz']};
  assert.doesNotThrow(() => checkContract(en, contract, [{id: 'm01-q'}], 1));
  assert.throws(() => checkContract(en, {...contract, exercises: 2}, [{id: 'm01-q'}], 1), /the contract needs 2/);
  assert.throws(() => checkContract(en, contract, [{id: 'm01-q'}, {id: 'm01-r', role: 'solution'}], 1), /exactly once/);
  assert.throws(() => checkContract(en, {...contract, sections: ['reading']}, [{id: 'm01-q'}], 1), /\{#reading\} is missing/);
});
`````


- [ ] **Step 2: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/mde/tests/pages.test.mjs"`
Expected: FAIL with `Cannot find module '…/tools/pages.mjs'`.

- [ ] **Step 3: Write the implementation**

`tutorial-sources/mde/tools/pages.mjs`:

`````js
// Page templates for the MDE series. Reuses the AI series' Markdown dialect, styles and page script.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {makeMd, newEnv, escapeHtml as esc} from '../../ai/tools/md.mjs';
import {playgroundLink} from './bundle.mjs';

export const EPSILON_VERSION = '2.8.0';
export const pad = n => String(n).padStart(2, '0');
export const lessonFile = (n, lang) => `module_${pad(n)}_${lang === 'en' ? 'EN' : 'ZH'}.html`;
export const overviewFile = lang => (lang === 'en' ? 'index.html' : 'index_ZH.html');
const other = lang => (lang === 'en' ? 'zh' : 'en');
const htmlLang = lang => (lang === 'en' ? 'en' : 'zh-CN');
const NOTICE = '<!-- Created by Ran Wei · Licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/) -->';

export const UI = {
  en: {
    series: 'Model-Driven Engineering with Eclipse Epsilon', crumb: 'MDE Series', module: 'Module', contents: 'Contents',
    skip: 'Skip to content', outcomes: 'By the end you can', before: 'Before you start', progress: 'Progress',
    completed: 'sessions done', study: 'Study plan', session: 'Session', done: 'Done', min: 'min', hours: 'hours',
    language: '中文', roadmap: 'All modules', available: 'Available', planned: 'Planned', overview: 'Series overview',
    read: 'Read', examples: 'Examples', exercises: 'Exercises', quiz: 'Quiz', reading: 'Reading',
    example: 'Example', solution: 'Solution', open: 'Open in Playground', files: 'More files',
    captured: `Output captured from Epsilon ${EPSILON_VERSION} when this page was built. The Playground may word messages slightly differently.`,
    download: 'Download all examples of this module (zip)',
    planLead: 'Times are estimates and include running the examples. Progress is saved in this browser and shared by both language editions.',
  },
  zh: {
    series: '基于 Eclipse Epsilon 的模型驱动工程', crumb: 'MDE 系列', module: '模块', contents: '目录',
    skip: '跳到正文', outcomes: '完成后你能够', before: '开始之前', progress: '进度',
    completed: '个时段已完成', study: '学习计划', session: '时段', done: '已完成', min: '分钟', hours: '小时',
    language: 'English', roadmap: '全部模块', available: '已开放', planned: '计划中', overview: '系列概览',
    read: '阅读', examples: '示例', exercises: '练习', quiz: '自测', reading: '延伸阅读',
    example: '示例', solution: '参考解答', open: '在 Playground 中打开', files: '其他文件',
    captured: `以下输出由构建本页时的 Epsilon ${EPSILON_VERSION} 实际运行得到。Playground 中的提示措辞可能略有不同。`,
    download: '下载本模块全部示例（zip）',
    planLead: '时间为估计值，包含运行示例的时间。进度保存在当前浏览器，中英文版本共享。',
  },
};

const FENCE = {eol: 'eol', evl: 'evl', egl: 'egl', egx: 'egx', etl: 'etl', emf: 'emfatic', flexmi: 'flexmi'};
const ORDER = ['program', 'secondProgram', 'flexmi', 'emfatic', 'secondEmfatic'];

function fileBlock(example, field) {
  const text = fs.readFileSync(path.join(example.dir, example[field]), 'utf8').replace(/\r\n/g, '\n').trimEnd();
  assert(!/^`{4,}/m.test(text), `${example.id}/${example[field]}: a line starts with four backticks`);
  return [`<div class="example-file">${esc(example[field])}</div>`, '', `\`\`\`\`${FENCE[example[field].split('.').pop()] || 'text'}`, text, '````', ''];
}

/** Replaces each line "{{EXAMPLE:id}}" with the example's files, Playground link and captured output. */
export function expandExamples(source, byId, lang, bundleUrl) {
  const L = UI[lang];
  const used = [];
  const markdown = source.replace(/^\{\{EXAMPLE:([a-z0-9-]+)\}\}[ \t]*$/gm, (_, id) => {
    const example = byId.get(id);
    assert(example, `Unknown example "${id}"`);
    used.push(id);
    const present = ORDER.filter(field => example[field]);
    const shown = example.show ?? ['program'];
    const hidden = present.filter(field => !shown.includes(field));
    return [
      `<div class="example" id="ex-${id}">`,
      `<div class="example-head"><span class="example-label">${example.role === 'solution' ? L.solution : L.example}</span><span class="example-title">${esc(example.title[lang])}</span><a class="playground-btn" href="${esc(playgroundLink(bundleUrl, id))}" target="_blank" rel="noopener">${L.open} ↗</a></div>`,
      '',
      ...shown.flatMap(field => fileBlock(example, field)),
      ...(hidden.length ? [`<details class="example-files"><summary>${L.files}: ${hidden.map(field => esc(example[field])).join(', ')}</summary>`, '', ...hidden.flatMap(field => fileBlock(example, field)), '</details>', ''] : []),
      `<div class="example-caption">${esc(L.captured)}</div>`,
      '',
      '````output',
      example.result.output.trimEnd(),
      '````',
      '',
      '</div>',
    ].join('\n');
  });
  assert(!markdown.includes('{{EXAMPLE:'), 'Every {{EXAMPLE:id}} marker must be on a line of its own');
  return {markdown, used};
}

function head(title, lead, lang) {
  return `${NOTICE}\n<!DOCTYPE html><html lang="${htmlLang(lang)}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} — ${esc(UI[lang].series)}</title><meta name="description" content="${esc(lead)}"><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="stylesheet" href="assets/style.css"></head>`;
}

function footer(lang) {
  return `<footer class="site-footer">${lang === 'en' ? 'Created by' : '作者'} Ran Wei · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></footer>`;
}

function studyPlan(meta, lang) {
  const L = UI[lang];
  assert.equal(meta.sessions.reduce((sum, s) => sum + s.minutes, 0), meta.hours * 60, `Module ${meta.number}: sessions must add up to ${meta.hours} hours`);
  const cards = meta.sessions.map((session, index) => {
    assert.equal(session.activities.reduce((sum, a) => sum + a.minutes, 0), session.minutes, `Module ${meta.number} session ${index + 1}: activities must add up to the session`);
    const activities = session.activities.map(a => {
      assert(L[a.kind], `Unknown activity kind "${a.kind}"`);
      return `<li class="act act-${a.kind}"><span class="act-kind">${L[a.kind]}</span><span class="act-what"><a href="#${a.anchor}">${esc(a.text[lang])}</a></span><span class="act-min">${a.minutes}</span></li>`;
    }).join('');
    return `<div class="session"><div class="session-head"><span class="session-n">${L.session} ${index + 1}</span><span class="session-min">${session.minutes} ${L.min}</span></div><div class="session-title">${esc(session.title[lang])}</div><ul class="acts">${activities}</ul><label class="session-done"><input type="checkbox" data-key="mde-series:m${pad(meta.number)}:s${index + 1}"> ${L.done}</label></div>`;
  }).join('');
  return `<section class="plan" id="plan"><div class="plan-head"><h2 class="plan-title">${L.study}</h2><span class="plan-total">${meta.hours} ${L.hours}</span></div><p class="plan-lead">${esc(L.planLead)}</p><div class="sessions">${cards}</div></section>`;
}

/** Renders one lesson page. Returns the page and a record used for the English/Chinese parity check. */
export function renderLesson({meta, lang, source, byId, bundleUrl, series, published}) {
  const L = UI[lang];
  const file = lessonFile(meta.number, lang);
  assert(!source.includes('<!-- BRIEF'), `${file}: replace every <!-- BRIEF --> note with finished text`);
  const {markdown, used} = expandExamples(source, byId, lang, bundleUrl);
  const env = newEnv();
  const body = makeMd({lang}).render(markdown, env);
  assert.deepEqual(env.errors, [], `${file}: ${JSON.stringify(env.errors)}`);
  assert.equal(env.math.length, 0, `${file}: text between two "$" signs was read as maths; write \\$ for a literal dollar sign`);
  const record = {
    sections: env.sections.map(s => s.id),
    examples: used,
    exercises: env.counts.exercise,
    solutions: env.counts.solution,
    quizAnswers: [...body.matchAll(/class="quiz-q" data-answer="(\d+)"/g)].map(m => Number(m[1])),
  };
  const title = meta.title[lang];
  const toc = env.sections.map((s, i) => `<a href="#${s.id}"><span class="num">${i + 1}</span><span>${esc(s.title)}</span></a>`).join('');
  const mobile = env.sections.map(s => `<a href="#${s.id}">${esc(s.title)}</a>`).join('');
  const menu = published.map(n => {
    const m = series.modules.find(x => x.number === n);
    return `<a href="${lessonFile(n, lang)}"${n === meta.number ? ' class="active" aria-current="page"' : ''}>${pad(n)} · ${esc(m.title[lang])}</a>`;
  }).join('') + `<a href="${overviewFile(lang)}#modules">${L.roadmap}</a>`;
  const position = published.indexOf(meta.number);
  const previous = published[position - 1];
  const next = published[position + 1];
  const back = previous ? `<a href="${lessonFile(previous, lang)}">← ${L.module} ${pad(previous)}</a>` : `<a href="${overviewFile(lang)}">← ${L.overview}</a>`;
  const forward = next ? `<a href="${lessonFile(next, lang)}">${L.module} ${pad(next)} →</a>` : `<a href="${overviewFile(lang)}#modules">${L.roadmap} →</a>`;
  const chips = [`${meta.hours} ${L.hours}`, `${meta.sessions.length} ${lang === 'en' ? 'sessions' : '个时段'}`, `${used.length} ${lang === 'en' ? 'runnable examples' : '个可运行示例'}`, lang === 'en' ? 'Epsilon Playground' : 'Epsilon Playground'];
  const outcomes = meta.outcomes[lang].map(x => `<li>${esc(x)}</li>`).join('');
  const page = head(title, meta.lead[lang], lang)
    + `<body data-module="${meta.number}"><a class="skip-link" href="#main">${L.skip}</a><div id="progress-bar"></div>`
    + `<header id="topbar"><a href="../../tutorials/" class="brand">Ran <span>Wei</span></a><span class="sep">/</span><a href="${overviewFile(lang)}" class="crumb">${L.crumb}</a><div class="module-dropdown" id="moduleDropdown"><button class="badge" type="button" aria-expanded="false" aria-controls="module-menu">${L.module} ${pad(meta.number)}</button><div class="dropdown-menu" id="module-menu">${menu}</div></div><a class="lang-switch" href="${lessonFile(meta.number, other(lang))}" hreflang="${htmlLang(other(lang))}">${L.language}</a></header>`
    + `<div id="layout"><aside id="sidebar"><div class="side-progress"><div class="side-progress-label">${L.progress}: <span class="side-progress-n">0</span>/${meta.sessions.length} ${L.completed}</div><div class="side-progress-bar"><span></span></div></div><div class="sidebar-label">${L.contents}</div><nav aria-label="${L.contents}">${toc}</nav></aside>`
    + `<main id="main"><div class="module-hero"><div class="series">${L.series} — Ran Wei</div><h1 class="module-title">${esc(title)}</h1><p class="module-lead">${esc(meta.lead[lang])}</p><div class="hero-chips">${chips.map((c, i) => `<span class="chip${i === 0 ? ' chip-time' : ''}">${c}</span>`).join('')}</div></div>`
    + `<section class="glance"><div class="glance-col"><h2 class="glance-h">${L.outcomes}</h2><ul class="outcomes">${outcomes}</ul></div><div class="glance-col"><h2 class="glance-h">${L.before}</h2><p>${esc(meta.prerequisites[lang])}</p><p><a class="download-link" href="downloads/module_${pad(meta.number)}.zip" download>${L.download}</a></p></div></section>`
    + `<details class="mobile-toc"><summary>${L.contents}</summary><nav aria-label="${L.contents}">${mobile}</nav></details>${studyPlan(meta, lang)}<div class="content">${body}</div>`
    + `<nav class="module-nav" aria-label="${L.roadmap}">${back}${forward}</nav>${footer(lang)}</main></div><script src="../ai/assets/tutorial.js" defer></script></body></html>`;
  return {html: page, record};
}

/** English and Chinese editions must have the same structure. */
export function checkParity(en, zh, number) {
  for (const key of ['sections', 'examples', 'exercises', 'solutions', 'quizAnswers']) {
    assert.deepEqual(zh[key], en[key], `Module ${pad(number)}: the Chinese edition's ${key} differ from the English edition's`);
  }
}

/** A module's contract: plan/module_NN.json "contract". */
export function checkContract(record, contract, examples, number) {
  const where = `Module ${pad(number)}`;
  const teaching = examples.filter(e => (e.role ?? 'example') === 'example').length;
  assert(teaching >= contract.examples[0] && teaching <= contract.examples[1], `${where}: ${teaching} teaching examples; the contract allows ${contract.examples.join('–')}`);
  assert.deepEqual([...record.examples].sort(), examples.map(e => e.id).sort(), `${where}: every example and solution must be shown exactly once`);
  assert.equal(record.exercises, contract.exercises, `${where}: ${record.exercises} exercises; the contract needs ${contract.exercises}`);
  assert.equal(record.solutions, contract.exercises, `${where}: every exercise needs a worked solution`);
  const quiz = record.quizAnswers.length;
  assert(quiz >= contract.quiz[0] && quiz <= contract.quiz[1], `${where}: ${quiz} quiz questions; the contract allows ${contract.quiz.join('–')}`);
  for (const id of contract.sections) assert(record.sections.includes(id), `${where}: section {#${id}} is missing`);
}

/** The series overview: introduction, how to study, module cards and acknowledgements. */
export function renderOverview({series, published, lang}) {
  const L = UI[lang];
  const text = series.overview[lang];
  const cards = series.modules.map(m => {
    const available = published.includes(m.number);
    const tag = available ? 'a' : 'article';
    const href = available ? ` href="${lessonFile(m.number, lang)}"` : '';
    return `<${tag}${href} class="module-card${available ? '' : ' planned'}"><div class="card-num">${L.module} ${pad(m.number)}</div><div class="card-title">${esc(m.title[lang])}</div><div class="card-desc">${esc(m.summary[lang])}</div><div class="card-status">${available ? L.available : L.planned} · ${m.hours} ${L.hours}</div><div class="card-footer"><span class="card-theme">${esc(m.focus)}</span><span class="card-lang">EN · 中文</span></div></${tag}>`;
  }).join('');
  const hours = series.modules.reduce((sum, m) => sum + m.hours, 0);
  const paragraphs = list => list.map(p => `<p>${p}</p>`).join('');
  const body = `<body class="index-page"><a class="skip-link" href="#main">${L.skip}</a><nav class="site-nav" aria-label="${L.roadmap}"><a class="nav-brand" href="../../tutorials/">Ran <span>Wei</span></a><span class="nav-sep">/</span><span class="nav-crumb">${L.crumb}</span><a class="lang-switch" href="${overviewFile(other(lang))}" hreflang="${htmlLang(other(lang))}">${L.language}</a></nav>`
    + `<main id="main" style="max-width:none;padding:0"><div class="index-hero"><h1>${L.series}</h1><p class="lead">${esc(text.lead)}</p><div class="hero-tags"><span class="tag tag-module">${series.modules.length} ${lang === 'en' ? 'modules' : '个模块'}</span><span class="tag tag-time">${hours} ${L.hours}</span><span class="tag tag-theme">EN / 中文</span></div></div>`
    + `<div class="index-body"><h2>${lang === 'en' ? 'How to study' : '学习方式'}</h2>${paragraphs(text.study)}<h2 id="modules">${lang === 'en' ? 'The modules' : '模块列表'}</h2></div><div class="index-grid">${cards}</div>`
    + `<div class="index-body"><h2 id="acknowledgements">${lang === 'en' ? 'Acknowledgements' : '致谢'}</h2>${paragraphs(text.acknowledgements)}</div></main>${footer(lang)}</body></html>`;
  return head(L.series, text.lead, lang) + body;
}
`````


Notes: the page uses the shared `../ai/assets/tutorial.js`, which provides quizzes, copy buttons, progress and the module menu. KaTeX is not loaded, which is why maths is rejected. Example blocks put a blank line between raw HTML and fences so that `markdown-it` parses the fences.

- [ ] **Step 4: Run the test to see it pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/mde/tests/pages.test.mjs"`
Expected: PASS (`# pass 3`).

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/mde/tools/pages.mjs tutorial-sources/mde/tests/pages.test.mjs
git commit -m "MDE series: lesson and overview page templates" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: The build

**Files:**
- Create: `tutorial-sources/mde/build.mjs`
- Create: `tutorial-sources/mde/tests/build.test.mjs`
- Create: `tutorial-sources/mde/tests/fixtures/series/` (a two-module mini series, files below)

**Interfaces:**
- Consumes: Task 1 (`ensureRunner`, `runJobs`), Task 2 (`loadExamples`, `toJob`, `sanitize`, `problemsWithOutput`), Task 3 (`writeBundle`, `writeZip`, `zipEntries`), Task 4 (`renderLesson`, `renderOverview`, `checkParity`, `checkContract`, `lessonFile`, `overviewFile`, `pad`, `EPSILON_VERSION`).
- Produces:
  - `BUNDLE_URL`.
  - `build({root?, dest?, bundleUrl?, runnerDir?}): {published: number[], examples: number}`. A module is published when both `src/en` and `src/zh` exist. The build runs every published module's examples in one JVM (work folder `root/out`), checks them, writes both editions, the downloads, the overview pages and the Playground bundle, and copies `root/assets`.
  - CLI: `node tutorial-sources/mde/build.mjs` prints `Built modules … in English and Chinese; ran N examples on Epsilon 2.8.0.`

- [ ] **Step 1: Create the fixture series**

Copy the shared model files, then create the rest:

```bash
F=tutorial-sources/mde/tests/fixtures
for d in m01-hello m01-hello-solution; do
  mkdir -p $F/series/examples/module_01/$d
  cp $F/epsilon/components.emf $F/epsilon/alarm.flexmi $F/series/examples/module_01/$d/
done
```

`tutorial-sources/mde/tests/fixtures/series/examples/module_01/m01-hello/example.json`:

`````json
{
  "id": "m01-hello",
  "title": {"en": "Hello", "zh": "你好"},
  "language": "eol",
  "program": "hello.eol",
  "flexmi": "alarm.flexmi",
  "emfatic": "components.emf",
  "show": ["program", "flexmi"],
  "expect": "ok"
}
`````

`tutorial-sources/mde/tests/fixtures/series/examples/module_01/m01-hello/hello.eol`:

`````eol
"Hello from Epsilon".println();
`````

`tutorial-sources/mde/tests/fixtures/series/examples/module_01/m01-hello-solution/example.json`:

`````json
{
  "id": "m01-hello-solution",
  "role": "solution",
  "title": {"en": "Count the components", "zh": "统计组件"},
  "language": "eol",
  "program": "count.eol",
  "flexmi": "alarm.flexmi",
  "emfatic": "components.emf",
  "expect": "ok"
}
`````

`tutorial-sources/mde/tests/fixtures/series/examples/module_01/m01-hello-solution/count.eol`:

`````eol
Component.all.size().println();
`````

`tutorial-sources/mde/tests/fixtures/series/assets/style.css`:

`````css
/* fixture */
`````

`tutorial-sources/mde/tests/fixtures/series/plan/series.json`:

`````json
{
  "modules": [
    {"number": 1, "hours": 1, "focus": "Playground", "title": {"en": "First steps", "zh": "第一步"}, "summary": {"en": "Run a query.", "zh": "运行一个查询。"}},
    {"number": 2, "hours": 2, "focus": "Emfatic", "title": {"en": "Later", "zh": "稍后"}, "summary": {"en": "Not written yet.", "zh": "尚未编写。"}}
  ],
  "overview": {
    "en": {"lead": "A fixture series.", "study": ["Study well."], "acknowledgements": ["Thanks."]},
    "zh": {"lead": "测试系列。", "study": ["好好学习。"], "acknowledgements": ["致谢。"]}
  }
}
`````

`tutorial-sources/mde/tests/fixtures/series/plan/module_01.json`:

`````json
{
  "number": 1,
  "hours": 1,
  "title": {"en": "First steps", "zh": "第一步"},
  "lead": {"en": "Run a query.", "zh": "运行一个查询。"},
  "prerequisites": {"en": "None.", "zh": "无。"},
  "outcomes": {"en": ["Run a query."], "zh": ["运行一个查询。"]},
  "sessions": [
    {"minutes": 60, "title": {"en": "Everything", "zh": "全部"}, "activities": [
      {"kind": "read", "anchor": "s1", "minutes": 50, "text": {"en": "Read", "zh": "阅读"}},
      {"kind": "quiz", "anchor": "quiz", "minutes": 10, "text": {"en": "Quiz", "zh": "自测"}}
    ]}
  ],
  "contract": {"examples": [1, 1], "exercises": 1, "quiz": [1, 1], "sections": ["s1", "exercises", "quiz"]}
}
`````

`tutorial-sources/mde/tests/fixtures/series/src/en/module_01.md`:

`````markdown
## Hello {#s1}

{{EXAMPLE:m01-hello}}

## Exercises {#exercises}

::: exercise #e1 level=1 kind=coding minutes=5
Count the components.
:::

::: solution
{{EXAMPLE:m01-hello-solution}}
:::

## Quiz {#quiz}

```quiz
? Which one?
- [ ] This
- [x] That
> Because.
```
`````

`tutorial-sources/mde/tests/fixtures/series/src/zh/module_01.md`:

`````markdown
## 你好 {#s1}

{{EXAMPLE:m01-hello}}

## 练习 {#exercises}

::: exercise #e1 level=1 kind=coding minutes=5
统计组件。
:::

::: solution
{{EXAMPLE:m01-hello-solution}}
:::

## 自测 {#quiz}

```quiz
? 哪一个？
- [ ] 这个
- [x] 那个
> 因为。
```
`````


- [ ] **Step 2: Write the failing test**

`tutorial-sources/mde/tests/build.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from '../build.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNNER = path.join(HERE, '..', 'runner');
const BUNDLE = 'https://example.test/mde/playground/examples.json';

function copyFixture() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-build-'));
  const root = path.join(tmp, 'src');
  fs.cpSync(path.join(HERE, 'fixtures', 'series'), root, {recursive: true});
  return {root, dest: path.join(tmp, 'site')};
}

test('build writes both editions, the overview, the Playground bundle and the download', () => {
  const {root, dest} = copyFixture();
  assert.deepEqual(build({root, dest, bundleUrl: BUNDLE, runnerDir: RUNNER}), {published: [1], examples: 2});
  const en = fs.readFileSync(path.join(dest, 'module_01_EN.html'), 'utf8');
  assert.match(en, /Hello from Epsilon/);
  assert.match(en, /\?examples=https%3A%2F%2Fexample\.test%2Fmde%2Fplayground%2Fexamples\.json&amp;m01-hello"/);
  assert.match(fs.readFileSync(path.join(dest, 'module_01_ZH.html'), 'utf8'), /在 Playground 中打开/);
  const overview = fs.readFileSync(path.join(dest, 'index.html'), 'utf8');
  assert.equal((overview.match(/class="module-card/g) || []).length, 2);
  assert.equal((overview.match(/<a href="module_01_EN.html" class="module-card"/g) || []).length, 1);
  const bundle = JSON.parse(fs.readFileSync(path.join(dest, 'playground', 'examples.json'), 'utf8'));
  for (const entry of bundle.examples[0].examples) {
    for (const field of ['program', 'flexmi', 'emfatic']) assert(fs.existsSync(path.join(dest, 'playground', entry[field])), entry[field]);
  }
  assert(fs.existsSync(path.join(dest, 'downloads', 'module_01.zip')));
  assert(fs.existsSync(path.join(dest, 'assets', 'style.css')));
});

test('build rejects a Chinese edition whose structure differs', () => {
  const {root, dest} = copyFixture();
  const zh = path.join(root, 'src', 'zh', 'module_01.md');
  fs.writeFileSync(zh, fs.readFileSync(zh, 'utf8').replace('- [ ] 这个\n- [x] 那个', '- [x] 这个\n- [ ] 那个'));
  assert.throws(() => build({root, dest, bundleUrl: BUNDLE, runnerDir: RUNNER}), /Chinese edition's quizAnswers differ/);
});

test('build rejects a Chinese source that is a copy of the English one', () => {
  const {root, dest} = copyFixture();
  fs.copyFileSync(path.join(root, 'src', 'en', 'module_01.md'), path.join(root, 'src', 'zh', 'module_01.md'));
  assert.throws(() => build({root, dest, bundleUrl: BUNDLE, runnerDir: RUNNER}), /Chinese source is a copy/);
});

test('build rejects an example that does not behave as declared', () => {
  const {root, dest} = copyFixture();
  fs.writeFileSync(path.join(root, 'examples', 'module_01', 'm01-hello', 'hello.eol'), 'Component.all.first().nosuch.println();\n');
  assert.throws(() => build({root, dest, bundleUrl: BUNDLE, runnerDir: RUNNER}), /m01-hello:\n  - expected "ok" but the run ended with "error"/);
});
`````


- [ ] **Step 3: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/mde/tests/build.test.mjs"`
Expected: FAIL with `Cannot find module '…/tutorial-sources/mde/build.mjs'`.

- [ ] **Step 4: Write the build**

`tutorial-sources/mde/build.mjs`:

`````js
// Builds the Model-Driven Engineering series into docs/tutorials/mde. From the repository root:
//   node tutorial-sources/mde/build.mjs
// Every example runs on Eclipse Epsilon during the build; pages show that captured output.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {ensureRunner, runJobs} from './tools/runner.mjs';
import {loadExamples, toJob, sanitize, problemsWithOutput} from './tools/examples.mjs';
import {writeBundle, writeZip, zipEntries} from './tools/bundle.mjs';
import {renderLesson, renderOverview, checkParity, checkContract, lessonFile, overviewFile, pad, EPSILON_VERSION} from './tools/pages.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const BUNDLE_URL = 'https://wrwei.github.io/tutorials/mde/playground/examples.json';
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

export function build({root = HERE, dest = path.resolve(HERE, '../../docs/tutorials/mde'), bundleUrl = BUNDLE_URL, runnerDir = path.join(HERE, 'runner')} = {}) {
  const series = readJson(path.join(root, 'plan/series.json'));
  // A module is published once both language sources exist.
  const modules = series.modules.filter(m => ['en', 'zh'].every(lang => fs.existsSync(path.join(root, 'src', lang, `module_${pad(m.number)}.md`))));
  const published = modules.map(m => m.number);

  const examples = modules.flatMap(m => loadExamples(path.join(root, 'examples', `module_${pad(m.number)}`), m.number).map(e => ({...e, module: m.number})));
  const ids = examples.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length, 'Example ids must be unique');
  const workDir = path.join(root, 'out');
  const results = examples.length ? runJobs(ensureRunner(runnerDir), examples.map(toJob), workDir) : new Map();
  const failures = [];
  for (const example of examples) {
    const raw = results.get(example.id);
    example.result = {status: raw.status, output: sanitize(raw.output, [example.dir, workDir])};
    const problems = problemsWithOutput(example, example.result);
    if (problems.length) failures.push(`${example.id}:\n  - ${problems.join('\n  - ')}\n  output:\n${example.result.output.replace(/^/gm, '    ')}`);
  }
  assert.equal(failures.length, 0, `Examples did not behave as their example.json declares:\n${failures.join('\n')}`);

  fs.mkdirSync(dest, {recursive: true});
  fs.cpSync(path.join(root, 'assets'), path.join(dest, 'assets'), {recursive: true});
  const byId = new Map(examples.map(e => [e.id, e]));
  for (const m of modules) {
    const metaFile = path.join(root, 'plan', `module_${pad(m.number)}.json`);
    assert(fs.existsSync(metaFile), `plan/module_${pad(m.number)}.json is missing`);
    const meta = readJson(metaFile);
    const own = examples.filter(e => e.module === m.number);
    const sources = Object.fromEntries(['en', 'zh'].map(lang => [lang, fs.readFileSync(path.join(root, 'src', lang, `module_${pad(m.number)}.md`), 'utf8')]));
    assert.notEqual(sources.zh, sources.en, `Module ${pad(m.number)}: the Chinese source is a copy of the English one`);
    const records = {};
    for (const lang of ['en', 'zh']) {
      const {html, record} = renderLesson({meta, lang, source: sources[lang], byId, bundleUrl, series, published});
      fs.writeFileSync(path.join(dest, lessonFile(m.number, lang)), html);
      records[lang] = record;
    }
    checkParity(records.en, records.zh, m.number);
    if (meta.contract) checkContract(records.en, meta.contract, own, m.number);
    writeZip(path.join(dest, 'downloads', `module_${pad(m.number)}.zip`), zipEntries(own));
  }
  for (const lang of ['en', 'zh']) fs.writeFileSync(path.join(dest, overviewFile(lang)), renderOverview({series, published, lang}));
  writeBundle(dest, modules.map(m => ({...m, examples: examples.filter(e => e.module === m.number)})));
  return {published, examples: examples.length};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const {published, examples} = build();
  console.log(`Built modules ${published.map(pad).join(', ') || '(none)'} in English and Chinese; ran ${examples} examples on Epsilon ${EPSILON_VERSION}.`);
}
`````


- [ ] **Step 5: Run the whole suite**

Run: `node --test --test-concurrency=1 "tutorial-sources/mde/tests/*.test.mjs"`
Expected: PASS, `# tests 15`, `# pass 15`.

- [ ] **Step 6: Commit**

```bash
git add tutorial-sources/mde/build.mjs tutorial-sources/mde/tests
git status --short   # tutorial-sources/mde/out must not appear
git commit -m "MDE series: build pages, bundle and downloads from sources" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Series configuration, assets and Module 1 examples

**Files:**
- Create: `tutorial-sources/mde/plan/series.json`, `tutorial-sources/mde/plan/module_01.json`
- Create: `tutorial-sources/mde/assets/style.css`, `tutorial-sources/mde/assets/favicon.svg`
- Create: `tutorial-sources/mde/examples/module_01/` (nine folders)
- Create: `tutorial-sources/mde/tests/series-examples.test.mjs`

**Interfaces:**
- Consumes: Tasks 1 and 2.
- Produces: the nine example ids that the Module 1 lesson references (Task 7): `m01-tour`, `m01-conformance`, `m01-validate`, `m01-generate`, `m01-transform` (teaching examples) and `m01-e3-solution`, `m01-e4-solution`, `m01-e5-solution`, `m01-e6-solution` (solutions). Module 1's contract is 4–6 teaching examples, 6 exercises, a 6–8 question quiz and sections `s1`–`s6`, `exercises`, `quiz`, `reading`.

- [ ] **Step 1: Write the failing test**

It pins the exact outputs the lesson will discuss, so a later change to an example cannot silently contradict the text.

`tutorial-sources/mde/tests/series-examples.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ensureRunner, runJobs} from '../tools/runner.mjs';
import {loadExamples, toJob, sanitize, problemsWithOutput} from '../tools/examples.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let runs;
/** Runs every example of the series once and caches the results: id -> {example, result}. */
function series() {
  if (runs) return runs;
  const folders = fs.readdirSync(path.join(ROOT, 'examples')).filter(name => /^module_\d\d$/.test(name)).sort();
  const examples = folders.flatMap(name => loadExamples(path.join(ROOT, 'examples', name), Number(name.slice('module_'.length))));
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-series-'));
  const results = runJobs(ensureRunner(path.join(ROOT, 'runner')), examples.map(toJob), work);
  runs = new Map(examples.map(example => {
    const raw = results.get(example.id);
    return [example.id, {example, result: {status: raw.status, output: sanitize(raw.output, [example.dir, work])}}];
  }));
  return runs;
}
const output = id => series().get(id).result.output;

test('every example in examples/ behaves as its example.json declares', () => {
  for (const [id, {example, result}] of series()) assert.deepEqual(problemsWithOutput(example, result), [], `${id}:\n${result.output}`);
});

test('Module 1 examples print what the lesson describes', () => {
  const tour = 'OrGate: door, window, open\nAndGate: open, armed, sound\nSiren: sound\n';
  assert.equal(output('m01-tour'), tour);
  assert.equal(output('m01-conformance'), 'Model warning (line 18): Could not resolve target Alarm.Siren.sond for reference target (target)\n' + tour);
  assert.equal(output('m01-validate'), [
    'Error [NoSelfLoop]: A connector joins AndGate to itself',
    'Warning [Connected]: OrGate.door is not connected',
    'Warning [Connected]: OrGate.window is not connected',
    'Warning [Connected]: Siren.sound is not connected', ''].join('\n'));
  assert.match(output('m01-generate'), /<tr><td>Siren<\/td><td>1<\/td><td>0<\/td><\/tr>/);
  assert.equal(output('m01-transform'), [
    'Graph name="Alarm"', '  Node name="OrGate"', '  Node name="AndGate"', '  Node name="Siren"',
    '  Edge source->OrGate target->AndGate', '  Edge source->AndGate target->Siren', ''].join('\n'));
  assert.equal(output('m01-e3-solution'), 'Sequence {"Siren"}\n');
  assert.equal(output('m01-e4-solution'), tour);
  assert.equal(output('m01-e5-solution'), 'All constraints are satisfied.\n');
  assert.equal(output('m01-e6-solution'), 'Sensor: reading\nFilter: raw, smoothed\nDisplay: value\n');
});
`````


- [ ] **Step 2: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/mde/tests/series-examples.test.mjs"`
Expected: FAIL with `ENOENT: no such file or directory, scandir '…/tutorial-sources/mde/examples'`.

- [ ] **Step 3: Create the series and module configuration**

`tutorial-sources/mde/plan/series.json`:

`````json
{
  "modules": [
    {"number": 1, "hours": 3, "focus": "Playground", "title": {"en": "What is model-driven engineering?", "zh": "什么是模型驱动工程？"}, "summary": {"en": "Models, metamodels and conformance; why automate with models; the four model-management tasks; a first tour of the Epsilon Playground.", "zh": "模型、元模型与符合性；为何借助模型实现自动化；四类模型管理任务；初识 Epsilon Playground。"}},
    {"number": 2, "hours": 4, "focus": "Emfatic", "title": {"en": "Metamodelling", "zh": "元建模"}, "summary": {"en": "Design a metamodel in Emfatic: classes, attributes, references, containment, opposites, inheritance and enumerations.", "zh": "用 Emfatic 设计元模型：类、属性、引用、包含、反向引用、继承与枚举。"}},
    {"number": 3, "hours": 3, "focus": "Flexmi", "title": {"en": "Building and viewing models", "zh": "构建与查看模型"}, "summary": {"en": "Write models in Flexmi's XML and YAML flavours, resolve references by name, read conformance warnings and draw model diagrams.", "zh": "用 Flexmi 的 XML 与 YAML 写法编写模型，按名称解析引用，读懂符合性警告并生成模型图。"}},
    {"number": 4, "hours": 4, "focus": "EOL", "title": {"en": "Querying models", "zh": "查询模型"}, "summary": {"en": "Navigate and query models with EOL: collections, first-order operations, operations on types and model changes.", "zh": "用 EOL 导航和查询模型：集合、一阶操作、类型上的操作以及修改模型。"}},
    {"number": 5, "hours": 3, "focus": "EVL", "title": {"en": "Validating models", "zh": "验证模型"}, "summary": {"en": "Express well-formedness rules in EVL with constraints, critiques, guards and fixes.", "zh": "用 EVL 表达良构性规则：约束、建议性检查（critique）、守卫条件与修复。"}},
    {"number": 6, "hours": 4, "focus": "EGL · EGX", "title": {"en": "Generating code and text", "zh": "生成代码与文本"}, "summary": {"en": "Generate Java, HTML and diagrams from models with EGL templates and EGX rules.", "zh": "用 EGL 模板和 EGX 规则从模型生成 Java、HTML 和图。"}},
    {"number": 7, "hours": 4, "focus": "ETL", "title": {"en": "Model-to-model transformation", "zh": "模型到模型转换"}, "summary": {"en": "Map one metamodel onto another with ETL rules, guards, equivalents and lazy rules.", "zh": "用 ETL 规则、守卫条件、equivalent 与惰性规则在元模型之间转换。"}},
    {"number": 8, "hours": 3, "focus": "LLMs", "title": {"en": "MDE meets LLMs", "zh": "模型驱动工程与大语言模型"}, "summary": {"en": "Let a language model draft metamodels and programs, check the drafts with Epsilon, and generate prompts from models.", "zh": "让大语言模型起草元模型和程序，用 Epsilon 检查草稿，并从模型生成提示词。"}},
    {"number": 9, "hours": 4, "focus": "Eclipse", "title": {"en": "From Playground to real projects", "zh": "从 Playground 到真实项目"}, "summary": {"en": "Install Eclipse Epsilon, run programs from Ant, Maven and Java, and work with models that are not EMF models.", "zh": "安装 Eclipse Epsilon，通过 Ant、Maven 和 Java 运行程序，并处理非 EMF 模型。"}},
    {"number": 10, "hours": 4, "focus": "Capstone", "title": {"en": "Capstone: MiniJDL", "zh": "综合项目：MiniJDL"}, "summary": {"en": "Build a JHipster-style entity language end to end: metamodel, models, validation, generation and transformation.", "zh": "端到端构建一个 JHipster 风格的实体语言：元模型、模型、验证、生成与转换。"}}
  ],
  "overview": {
    "en": {
      "lead": "Learn model-driven engineering by doing it: describe systems as models, define the languages they are written in, and let tools query, check, transform and generate from them. Every example runs in your browser in the Eclipse Epsilon Playground.",
      "study": [
        "Each module takes three to four hours. Read a section, then press <strong>Open in Playground</strong> on its examples. The Epsilon Playground opens with the example loaded, so you can run it, change it and run it again. Nothing needs installing until Module 9.",
        "The output under each example was produced by Eclipse Epsilon 2.8.0 when the page was built. The Playground may run a newer Epsilon and word some messages differently. Changes you make in the Playground are not saved; use its Download button to keep your work.",
        "Every module ends with exercises with worked solutions and a short self-check quiz. Your progress is saved in this browser and shared by the English and Chinese editions."
      ],
      "acknowledgements": [
        "This series draws on Dimitris Kolovos's writing on model-driven engineering, adapted and credited where it is used: <a href=\"https://www-users.york.ac.uk/dimitris.kolovos/blog/mde-terminology/\">Model-Driven Engineering Terminology</a>, <a href=\"https://www-users.york.ac.uk/dimitris.kolovos/blog/metamodelling-with-chatgpt/\">Metamodelling with ChatGPT</a> and <a href=\"https://www-users.york.ac.uk/dimitris.kolovos/blog/jhipster-jdl-monolith-example/\">Minimal JHipster JDL Monolith Example</a>. The examples were written for this series. The running component-and-connector example was inspired by his metamodelling post and by the component example in the Epsilon Playground.",
        "<a href=\"https://eclipse.dev/epsilon/\">Eclipse Epsilon</a> is an open-source Eclipse Foundation project led from the University of York. Its <a href=\"https://eclipse.dev/epsilon/playground/\">Playground</a> makes every example in this series runnable in a browser."
      ]
    },
    "zh": {
      "lead": "在实践中学习模型驱动工程：把系统描述为模型，定义编写模型所用的语言，再让工具对模型进行查询、检查、转换和生成。所有示例都可以在浏览器中的 Eclipse Epsilon Playground 里运行。",
      "study": [
        "每个模块需要三到四小时。读完一节后，点击示例上的<strong>在 Playground 中打开</strong>。Epsilon Playground 会载入该示例，你可以运行、修改并再次运行。第 9 模块之前无需安装任何软件。",
        "每个示例下方的输出由构建页面时的 Eclipse Epsilon 2.8.0 实际运行得到。Playground 可能运行较新的 Epsilon，部分提示措辞会有所不同。你在 Playground 中的修改不会被保存；如需保留，请使用其 Download 按钮。",
        "每个模块最后都有附参考解答的练习和简短自测。学习进度保存在当前浏览器中，中英文版本共享。"
      ],
      "acknowledgements": [
        "本系列借鉴了 Dimitris Kolovos 关于模型驱动工程的文章，并在使用处注明出处：<a href=\"https://www-users.york.ac.uk/dimitris.kolovos/blog/mde-terminology/\">Model-Driven Engineering Terminology</a>、<a href=\"https://www-users.york.ac.uk/dimitris.kolovos/blog/metamodelling-with-chatgpt/\">Metamodelling with ChatGPT</a> 和 <a href=\"https://www-users.york.ac.uk/dimitris.kolovos/blog/jhipster-jdl-monolith-example/\">Minimal JHipster JDL Monolith Example</a>。示例均为本系列编写；贯穿全系列的组件与连接器示例受到他的元建模文章以及 Epsilon Playground 中组件示例的启发。",
        "<a href=\"https://eclipse.dev/epsilon/\">Eclipse Epsilon</a> 是 Eclipse 基金会的开源项目，由约克大学牵头开发。它的 <a href=\"https://eclipse.dev/epsilon/playground/\">Playground</a> 让本系列的每个示例都能直接在浏览器中运行。"
      ]
    }
  }
}
`````

`tutorial-sources/mde/plan/module_01.json`:

`````json
{
  "number": 1,
  "hours": 3,
  "title": {"en": "What is model-driven engineering?", "zh": "什么是模型驱动工程？"},
  "lead": {"en": "Meet the core ideas of MDE (models, metamodels, conformance and model management) and run your first Epsilon programs in the browser.", "zh": "认识模型驱动工程的核心概念（模型、元模型、符合性与模型管理），并在浏览器中运行你的第一个 Epsilon 程序。"},
  "prerequisites": {"en": "Some programming experience in any language, and a recent Chrome, Edge or Firefox. No modelling background and no installation are needed.", "zh": "具备任意一种语言的编程经验，并使用较新的 Chrome、Edge 或 Firefox 浏览器。无需建模背景，也无需安装软件。"},
  "outcomes": {
    "en": [
      "Explain what a model is, and tell descriptive models from prescriptive ones.",
      "Describe a metamodel as the abstract syntax of a modelling language, and say what it means for a model to conform to it.",
      "Distinguish abstract from concrete syntax, and modelling languages from programming languages.",
      "Name the four core model-management tasks and the Epsilon language for each.",
      "Open, run and change an example in the Epsilon Playground."
    ],
    "zh": [
      "解释什么是模型，并区分描述性模型与规约性模型。",
      "把元模型描述为建模语言的抽象语法，并说明模型“符合”元模型的含义。",
      "区分抽象语法与具体语法，以及建模语言与编程语言。",
      "说出四类核心模型管理任务以及各自对应的 Epsilon 语言。",
      "在 Epsilon Playground 中打开、运行并修改示例。"
    ]
  },
  "sessions": [
    {"minutes": 60, "title": {"en": "Models and metamodels", "zh": "模型与元模型"}, "activities": [
      {"kind": "read", "anchor": "s1", "minutes": 15, "text": {"en": "Why model-driven engineering?", "zh": "为什么需要模型驱动工程？"}},
      {"kind": "read", "anchor": "s2", "minutes": 15, "text": {"en": "Models", "zh": "模型"}},
      {"kind": "examples", "anchor": "s3", "minutes": 30, "text": {"en": "Metamodels and conformance", "zh": "元模型与符合性"}}
    ]},
    {"minutes": 60, "title": {"en": "Languages and model management", "zh": "语言与模型管理"}, "activities": [
      {"kind": "read", "anchor": "s4", "minutes": 15, "text": {"en": "Abstract and concrete syntax", "zh": "抽象语法与具体语法"}},
      {"kind": "examples", "anchor": "s5", "minutes": 35, "text": {"en": "Model management with Epsilon", "zh": "用 Epsilon 进行模型管理"}},
      {"kind": "read", "anchor": "s6", "minutes": 10, "text": {"en": "Working in the Playground", "zh": "使用 Playground"}}
    ]},
    {"minutes": 60, "title": {"en": "Practice", "zh": "练习"}, "activities": [
      {"kind": "exercises", "anchor": "exercises", "minutes": 45, "text": {"en": "Six exercises", "zh": "六道练习"}},
      {"kind": "quiz", "anchor": "quiz", "minutes": 15, "text": {"en": "Self-check quiz", "zh": "自测"}}
    ]}
  ],
  "contract": {"examples": [4, 6], "exercises": 6, "quiz": [6, 8], "sections": ["s1", "s2", "s3", "s4", "s5", "s6", "exercises", "quiz", "reading"]}
}
`````


- [ ] **Step 4: Create the assets**

`style.css` imports the AI series' design and adds the example block, skip link, planned cards and mobile contents. This follows the Maths series' additions.

`tutorial-sources/mde/assets/style.css`:

`````css
/* Model-Driven Engineering additions to the shared tutorial design. */
@import url('../../ai/assets/style.css');

.skip-link{position:fixed;top:-100px;left:1rem;z-index:2000;background:var(--white);padding:.6rem 1rem;border:2px solid var(--blue);border-radius:6px}.skip-link:focus{top:.5rem}
:focus-visible{outline:3px solid var(--sky);outline-offset:3px}
.module-card.planned:hover{transform:none;box-shadow:none;border-color:var(--border)}
.card-status{font-size:.78rem;color:var(--slate);margin-top:.75rem}
.mobile-toc{display:none}
.index-body{overflow-wrap:anywhere}.index-grid .module-card{min-width:0}.index-hero h1{font-size:clamp(2rem,5vw,3.5rem)}
.content{overflow-wrap:anywhere}.content table{width:100%}
.download-link{font-weight:600}

/* Runnable examples: files, a Playground button and the output captured at build time */
.example{border:1px solid var(--border);border-radius:12px;padding:1rem 1.1rem;margin:1.75rem 0;background:var(--white)}
.example-head{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .75rem;margin-bottom:.5rem}
.example-label{font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--purple)}
.example-title{flex:1 1 12rem;font-weight:600;color:var(--navy)}
.playground-btn{font-size:.85rem;font-weight:600;padding:.35rem .85rem;border-radius:999px;background:var(--navy);color:#fff!important;text-decoration:none;white-space:nowrap}
.playground-btn:hover{background:var(--blue)}
.example-file{font-family:var(--font-mono);font-size:.72rem;color:var(--slate);margin:.75rem 0 .25rem}
.example-files{margin:.5rem 0}.example-files summary{cursor:pointer;font-size:.88rem;color:var(--blue)}
.example-caption{font-size:.78rem;color:var(--slate);margin:.75rem 0 .5rem}
.example .output{margin-top:0}

@media(max-width:900px){.mobile-toc{display:block;margin:1rem 0}.mobile-toc nav{display:flex;flex-wrap:wrap;gap:.5rem;padding:1rem}.mobile-toc a{font-size:.85rem}#main{width:100%}}
@media(max-width:440px){#topbar{padding:0 .75rem;gap:.45rem}.module-dropdown .dropdown-menu{min-width:260px;max-width:calc(100vw - 20px)}.lang-switch{margin-left:0}.index-grid{grid-template-columns:1fr}.example{padding:.8rem}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{transition:none!important}}
@media print{.skip-link,.mobile-toc,.playground-btn{display:none!important}details:not([open])>.details-body{display:block!important}.quiz-expl[hidden]{display:block}}
`````

`tutorial-sources/mde/assets/favicon.svg`:

`````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0f172a"/>
  <rect x="8" y="22" width="18" height="20" rx="3" fill="#7dd3fc"/>
  <rect x="38" y="22" width="18" height="20" rx="3" fill="#7dd3fc"/>
  <path d="M26 32h12" stroke="#f8fafc" stroke-width="4" stroke-linecap="round"/>
</svg>
`````


- [ ] **Step 5: Create the nine example folders**

Most folders reuse the runner fixtures from Task 1 unchanged; copy them (the table shows the source of every file):

| Folder | Files (source) |
|---|---|
| `m01-tour` | `components.emf`, `alarm.flexmi`, `tour.eol` (fixtures) |
| `m01-conformance` | `components.emf`, `tour.eol` (fixtures); `alarm.flexmi` = fixture `alarm-broken.flexmi` |
| `m01-validate` | `components.emf`, `rules.evl` (fixtures); `alarm.flexmi` = fixture `alarm-loop.flexmi` |
| `m01-generate` | `components.emf`, `alarm.flexmi`, `parts.egl` (fixtures) |
| `m01-transform` | `components.emf`, `alarm.flexmi`, `graph.emf`, `components2graph.etl` (fixtures) |
| `m01-e3-solution` | `components.emf`, `alarm.flexmi` (fixtures); `no-outputs.eol` (below) |
| `m01-e4-solution` | `components.emf`, `alarm.flexmi`, `tour.eol` (fixtures) |
| `m01-e5-solution` | `components.emf`, `alarm.flexmi`, `rules.evl` (all three below) |
| `m01-e6-solution` | `components.emf`, `tour.eol` (fixtures); `thermostat.flexmi` (below) |

```bash
F=tutorial-sources/mde/tests/fixtures/epsilon
X=tutorial-sources/mde/examples/module_01
for d in m01-tour m01-conformance m01-validate m01-generate m01-transform m01-e3-solution m01-e4-solution m01-e5-solution m01-e6-solution; do mkdir -p $X/$d; done
for d in m01-tour m01-conformance m01-validate m01-generate m01-transform m01-e3-solution m01-e4-solution m01-e6-solution; do cp $F/components.emf $X/$d/; done
for d in m01-tour m01-generate m01-transform m01-e3-solution m01-e4-solution; do cp $F/alarm.flexmi $X/$d/; done
for d in m01-tour m01-conformance m01-e4-solution m01-e6-solution; do cp $F/tour.eol $X/$d/; done
cp $F/alarm-broken.flexmi $X/m01-conformance/alarm.flexmi
cp $F/alarm-loop.flexmi $X/m01-validate/alarm.flexmi
cp $F/rules.evl $X/m01-validate/
cp $F/parts.egl $X/m01-generate/
cp $F/graph.emf $F/components2graph.etl $X/m01-transform/
```

Then create the remaining files:

`tutorial-sources/mde/examples/module_01/m01-e3-solution/no-outputs.eol`:

`````eol
// Components that only receive signals: none of their ports is an output
var sinks = Component.all.select(c | not c.ports.exists(p | p.isTypeOf(OutPort)));
sinks.collect(c | c.name).println();
`````

`tutorial-sources/mde/examples/module_01/m01-e5-solution/components.emf`:

`````emfatic
@namespace(uri="components", prefix="components")
package components;

// An architecture is a set of components wired together by connectors
class Architecture {
  attr String name;
  val Component[*] components;
  val Connector[*] connectors;
}

class Component {
  attr String name;
  val Port[*] ports;
}

abstract class Port {
  attr String name;
}

class InPort extends Port {
  // True for inputs that come from outside the architecture
  attr boolean external;
}

class OutPort extends Port {}

// A connector carries a signal from an output port to an input port
class Connector {
  ref OutPort source;
  ref InPort target;
}
`````

`tutorial-sources/mde/examples/module_01/m01-e5-solution/alarm.flexmi`:

`````xml
<?nsuri components?>
<architecture name="Alarm">
  <!-- The siren sounds when (door OR window) AND armed -->
  <component name="OrGate">
    <inPort name="door" external="true"/>
    <inPort name="window" external="true"/>
    <outPort name="open"/>
  </component>
  <component name="AndGate">
    <inPort name="open"/>
    <inPort name="armed" external="true"/>
    <outPort name="sound"/>
  </component>
  <component name="Siren">
    <inPort name="sound"/>
  </component>
  <connector source="Alarm.OrGate.open" target="Alarm.AndGate.open"/>
  <connector source="Alarm.AndGate.sound" target="Alarm.Siren.sound"/>
</architecture>
`````

`tutorial-sources/mde/examples/module_01/m01-e5-solution/rules.evl`:

`````evl
// A connector must join two different components
context Connector {
  constraint NoSelfLoop {
    check: self.source.eContainer() <> self.target.eContainer()
    message: "A connector joins " + self.source.eContainer().name + " to itself"
  }
}

// Every internal input should be driven by something
context InPort {
  critique Connected {
    guard: not self.external
    check: Connector.all.exists(c | c.target = self)
    message: self.eContainer().name + "." + self.name + " is not connected"
  }
}
`````

`tutorial-sources/mde/examples/module_01/m01-e6-solution/thermostat.flexmi`:

`````xml
<?nsuri components?>
<architecture name="Thermostat">
  <!-- A sensor reading is smoothed and then shown on a display -->
  <component name="Sensor">
    <outPort name="reading"/>
  </component>
  <component name="Filter">
    <inPort name="raw"/>
    <outPort name="smoothed"/>
  </component>
  <component name="Display">
    <inPort name="value"/>
  </component>
  <connector source="Thermostat.Sensor.reading" target="Thermostat.Filter.raw"/>
  <connector source="Thermostat.Filter.smoothed" target="Thermostat.Display.value"/>
</architecture>
`````


And the nine `example.json` files:

`tutorial-sources/mde/examples/module_01/m01-tour/example.json`:

`````json
{
  "id": "m01-tour",
  "title": {"en": "A first model, metamodel and query", "zh": "第一个模型、元模型与查询"},
  "language": "eol",
  "program": "tour.eol",
  "flexmi": "alarm.flexmi",
  "emfatic": "components.emf",
  "show": ["emfatic", "flexmi", "program"],
  "expect": "ok"
}
`````

`tutorial-sources/mde/examples/module_01/m01-conformance/example.json`:

`````json
{
  "id": "m01-conformance",
  "title": {"en": "A model that does not conform", "zh": "不符合元模型的模型"},
  "language": "eol",
  "program": "tour.eol",
  "flexmi": "alarm.flexmi",
  "emfatic": "components.emf",
  "show": ["flexmi"],
  "allowWarnings": true,
  "expect": "ok"
}
`````

`tutorial-sources/mde/examples/module_01/m01-validate/example.json`:

`````json
{
  "id": "m01-validate",
  "title": {"en": "Validation: check the wiring", "zh": "验证：检查连线"},
  "language": "evl",
  "program": "rules.evl",
  "flexmi": "alarm.flexmi",
  "emfatic": "components.emf",
  "show": ["program", "flexmi"],
  "expect": "ok"
}
`````

`tutorial-sources/mde/examples/module_01/m01-generate/example.json`:

`````json
{
  "id": "m01-generate",
  "title": {"en": "Model-to-text: a parts list", "zh": "模型到文本：零件清单"},
  "language": "egl",
  "program": "parts.egl",
  "flexmi": "alarm.flexmi",
  "emfatic": "components.emf",
  "outputType": "html",
  "expect": "ok"
}
`````

`tutorial-sources/mde/examples/module_01/m01-transform/example.json`:

`````json
{
  "id": "m01-transform",
  "title": {"en": "Model-to-model: from components to a graph", "zh": "模型到模型：从组件到图"},
  "language": "etl",
  "program": "components2graph.etl",
  "flexmi": "alarm.flexmi",
  "emfatic": "components.emf",
  "secondEmfatic": "graph.emf",
  "show": ["program", "secondEmfatic"],
  "expect": "ok"
}
`````

`tutorial-sources/mde/examples/module_01/m01-e3-solution/example.json`:

`````json
{
  "id": "m01-e3-solution",
  "role": "solution",
  "title": {"en": "Components with no outputs", "zh": "没有输出端口的组件"},
  "language": "eol",
  "program": "no-outputs.eol",
  "flexmi": "alarm.flexmi",
  "emfatic": "components.emf",
  "expect": "ok"
}
`````

`tutorial-sources/mde/examples/module_01/m01-e4-solution/example.json`:

`````json
{
  "id": "m01-e4-solution",
  "role": "solution",
  "title": {"en": "The repaired model", "zh": "修复后的模型"},
  "language": "eol",
  "program": "tour.eol",
  "flexmi": "alarm.flexmi",
  "emfatic": "components.emf",
  "show": ["flexmi"],
  "expect": "ok"
}
`````

`tutorial-sources/mde/examples/module_01/m01-e5-solution/example.json`:

`````json
{
  "id": "m01-e5-solution",
  "role": "solution",
  "title": {"en": "Marking external inputs", "zh": "标记外部输入"},
  "language": "evl",
  "program": "rules.evl",
  "flexmi": "alarm.flexmi",
  "emfatic": "components.emf",
  "show": ["emfatic", "flexmi", "program"],
  "expect": "ok"
}
`````

`tutorial-sources/mde/examples/module_01/m01-e6-solution/example.json`:

`````json
{
  "id": "m01-e6-solution",
  "role": "solution",
  "title": {"en": "A second architecture: a thermostat", "zh": "第二个架构：恒温器"},
  "language": "eol",
  "program": "tour.eol",
  "flexmi": "thermostat.flexmi",
  "emfatic": "components.emf",
  "show": ["flexmi"],
  "expect": "ok"
}
`````


- [ ] **Step 6: Run the test to see it pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/mde/tests/*.test.mjs"`
Expected: PASS, `# tests 17`, `# pass 17`.

- [ ] **Step 7: Commit**

```bash
git add tutorial-sources/mde/plan tutorial-sources/mde/assets tutorial-sources/mde/examples tutorial-sources/mde/tests/series-examples.test.mjs
git commit -m "MDE series: roadmap, Module 1 configuration and its nine runnable examples" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Module 1 lesson in English and Chinese

**Files:**
- Create: `tutorial-sources/mde/GLOSSARY.md`
- Create: `tutorial-sources/mde/src/en/module_01.md`, `tutorial-sources/mde/src/zh/module_01.md`
- Generated (commit them): `docs/tutorials/mde/` (`index.html`, `index_ZH.html`, `module_01_EN.html`, `module_01_ZH.html`, `assets/`, `playground/`, `downloads/module_01.zip`)

**Interfaces:**
- Consumes: Tasks 5 and 6. The frames below reference exactly the nine example ids of Task 6, and their quiz answer positions are identical in both languages (`1, 2, 0, 2, 1, 2, 1`).
- Produces: a published Module 1.

The frames fix everything structural: headings and ids, where each example appears, the six exercises with worked solutions, the quiz and the reading list. The teaching prose is written in this task, replacing each `<!-- BRIEF … -->` note. The build refuses to run while any note remains.

- [ ] **Step 1: Read the sources being adapted**

Read in full: Kolovos's [*Model-Driven Engineering Terminology*](https://www-users.york.ac.uk/dimitris.kolovos/blog/mde-terminology/), [*Metamodelling with ChatGPT*](https://www-users.york.ac.uk/dimitris.kolovos/blog/metamodelling-with-chatgpt/) and [*Minimal JHipster JDL Monolith Example*](https://www-users.york.ac.uk/dimitris.kolovos/blog/jhipster-jdl-monolith-example/). Read the [Playground documentation](https://eclipse.dev/epsilon/doc/articles/playground/) too. Facts about his views must match the posts; paraphrase, credit, and quote at most two sentences.

- [ ] **Step 2: Create the glossary**

`tutorial-sources/mde/GLOSSARY.md`:

`````markdown
# English–Chinese glossary

Use these renderings in every Chinese page. On first use in a module, give the English term in parentheses, e.g. 元模型（metamodel）. Language and tool names (Epsilon, EOL, EVL, EGL, EGX, ETL, Emfatic, Flexmi, Ecore, EMF, Playground, JHipster, JDL, SysML) stay in English. Code, file names and captured output are never translated.

| English | 中文 | Notes |
|---|---|---|
| model-driven engineering (MDE) | 模型驱动工程 | |
| model | 模型 | |
| metamodel | 元模型 | |
| metamodelling | 元建模 | |
| model element | 模型元素 | |
| conform to / conformance | 符合 / 符合性 | never 实现 (implement) or 继承 (inherit) |
| instance | 实例 | |
| descriptive model | 描述性模型 | |
| prescriptive model | 规约性模型 | |
| sketch / blueprint / program | 草图 / 蓝图 / 程序 | |
| abstract syntax | 抽象语法 | |
| concrete syntax | 具体语法 | |
| textual / graphical (diagrammatic) / tabular syntax | 文本 / 图形 / 表格语法 | |
| modelling language | 建模语言 | |
| programming language | 编程语言 | |
| domain-specific language (DSL) | 领域特定语言 | |
| model management | 模型管理 | |
| query | 查询 | |
| validation | 验证 | |
| constraint | 约束 | EVL `constraint` |
| critique | 建议性检查 | EVL `critique`; first use: 建议性检查（critique） |
| guard | 守卫条件 | |
| well-formedness rule | 良构性规则 | |
| model-to-text transformation | 模型到文本转换 | |
| code generation | 代码生成 | |
| template | 模板 | |
| model-to-model transformation | 模型到模型转换 | |
| source model / target model | 源模型 / 目标模型 | |
| rule | 规则 | |
| lazy rule | 惰性规则 | |
| class / attribute / reference | 类 / 属性 / 引用 | |
| containment (reference) | 包含（引用） | |
| opposite (reference) | 反向引用 | |
| inheritance | 继承 | for classes in a metamodel only |
| abstract class | 抽象类 | |
| enumeration | 枚举 | |
| multiplicity | 多重性 | |
| fully qualified name | 完全限定名 | |
| component / port / connector | 组件 / 端口 / 连接器 | |
| input port / output port | 输入端口 / 输出端口 | |
| architecture | 架构 | the running example's root class |
| warning / error | 警告 / 错误 | |
| captured output | 实际输出 | |
`````


- [ ] **Step 3: Create the English source from its frame**

Save this as `tutorial-sources/mde/src/en/module_01.md`:

`tutorial-sources/mde/src/en/module_01.md`:

`````markdown
## Why model-driven engineering? {#s1}

<!-- BRIEF (about 450 words)
- Open with the problem: software and engineered systems have grown too large to manage only as code and documents that drift apart.
- MDE's answer: make models the primary artefacts and let tools process them (analyse, check, generate, transform). Abstraction plus automation.
- Motivating case: JHipster. A short textual model in its JDL language (a blog with Blog, Post and Tag entities and their relationships) is enough to generate a complete, runnable web application. Describe it in your own words; do not reproduce Kolovos's JDL listing. Credit: "(Adapted from Dimitris Kolovos, [*Minimal JHipster JDL Monolith Example*](https://www-users.york.ac.uk/dimitris.kolovos/blog/jhipster-jdl-monolith-example/), 2021.)"
- Where MDE appears in practice, kept general and uncontroversial: code generated from Simulink models in automotive and aerospace, SysML in systems engineering (link the site's [SysML v2](../sysml/SysMLv2_Module1_Foundations_EN.html) and [MBSE](../mbse/index.html) series), domain-specific languages such as JDL.
- End with a ::: keyidea callout: in MDE, models are inputs that tools process, not documentation that drifts out of date.
- Close by previewing the module: the vocabulary (s2–s4), the four model-management tasks (s5), the Playground (s6).
-->

## Models {#s2}

<!-- BRIEF (about 450 words)
- Before writing, read Kolovos's *Model-Driven Engineering Terminology* in full; this section and s3–s4 adapt it.
- A model is a description of a system of interest. You may quote that phrase (at most two sentences of quotation in this module, in quotation marks, with the citation).
- Descriptive models describe a system that exists; prescriptive models describe one to be built. Examples: a survey of an existing building vs an architect's plan.
- The sketch → blueprint → program continuum: how complete and precise a model is, and therefore what tools can do with it.
- Models are always partial: they keep what matters for a purpose and leave the rest out. Use a ::: analogy callout (maps: a metro map and a street map of the same city).
- Credit at the end of the section: "(Adapted from Dimitris Kolovos, [*Model-Driven Engineering Terminology*](https://www-users.york.ac.uk/dimitris.kolovos/blog/mde-terminology/), 2022.)"
-->

## Metamodels and conformance {#s3}

<!-- BRIEF part 1 (about 350 words)
- A metamodel is an object-oriented specification of a language's abstract syntax: which kinds of element exist, their attributes and how they relate. Metamodels are written in metamodelling languages such as Ecore (EMF) or MOF.
- Introduce the running example: a component-and-connector language. Components own input and output ports; connectors carry a signal from an output port to an input port. Credit its origin: "The running example follows the component-and-port metamodel that Dimitris Kolovos built in [*Metamodelling with ChatGPT*](https://www-users.york.ac.uk/dimitris.kolovos/blog/metamodelling-with-chatgpt/) (2022); Module 2 builds it up step by step."
- Read the metamodel in the next example at reading level only (Module 2 teaches writing it): Emfatic is a textual syntax for Ecore; `class`, `attr` (attributes), `val` (containment: the architecture owns its components), `ref` (plain references), `abstract`, `extends`.
- Model elements are instances of the metamodel's classes. A model conforms to its metamodel when every element is an instance of one of its types and respects its features.
- Tell the reader what to do: read the three files, press Open in Playground, run it, then look at the output below.
-->

{{EXAMPLE:m01-tour}}

<!-- BRIEF part 2 (about 200 words)
- Walk through the captured output line by line and connect it to the model: three components and the names of their ports.
- Point out the fully qualified references in the connectors: `Alarm.OrGate.open` starts at the root element's name.
- ::: pitfall callout: "implements", "inherits from" and "depends on" are wrong for the model–metamodel relationship; the correct term is "conforms to". Kolovos's terminology post discusses this misuse; credit it.
-->

{{EXAMPLE:m01-conformance}}

<!-- BRIEF part 3 (about 200 words)
- This model has a typo in its last connector (`sond` instead of `sound`).
- Read the captured output: Flexmi reports a warning naming the line and the unresolved target, leaves the reference unset, and the program still runs and prints the same three lines. A program can run on a non-conforming model and still produce plausible results.
- Flexmi is forgiving by design and sometimes guesses what you meant; Module 3 shows where that helps and where it hides mistakes.
-->

## Abstract and concrete syntax {#s4}

<!-- BRIEF (about 450 words)
- A modelling language = one abstract syntax (its metamodel) + one or more concrete syntaxes: textual, diagrammatic, tabular.
- The alarm can be shown as Flexmi text (s3), as a diagram (the Playground draws one from the model; mention the diagram buttons) or as a table (the parts list generated in s5).
- "Textual language" and "graphical language" really name a language's dominant concrete syntax, not the language itself.
- Modelling vs programming languages: the difference lies in how engineers intend to use them (understanding and communication versus producing executable artefacts), not in a technical property. A Java program can serve as a model; a sufficiently precise model can be executed.
- SysML v2 has both a textual and a graphical notation over one abstract syntax; link the site's [SysML v2 series](../sysml/SysMLv2_Module1_Foundations_EN.html).
- Credit: "(Adapted from Dimitris Kolovos, [*Model-Driven Engineering Terminology*](https://www-users.york.ac.uk/dimitris.kolovos/blog/mde-terminology/), 2022.)"
-->

## Model management with Epsilon {#s5}

<!-- BRIEF part 1 (about 250 words)
- Model management = automated tasks over models. The four core tasks: querying, validation, model-to-text transformation (generation), model-to-model transformation. Mention comparison, merging and migration as further tasks (Module 9 points to them).
- Eclipse Epsilon is a family of languages for these tasks, all built on one base language, EOL. Include a table: task | Epsilon language | taught in. Query | EOL | Module 4; Validation | EVL | Module 5; Model-to-text | EGL, EGX | Module 6; Model-to-model | ETL | Module 7.
- The examples below are a preview; each later module teaches one language properly.
-->

{{EXAMPLE:m01-validate}}

<!-- BRIEF part 2 (about 150 words)
- This variant of the alarm has a wiring mistake: the AND gate's output feeds its own `armed` input.
- A constraint (NoSelfLoop) reports an error; a critique (Connected) reports warnings. Read the four captured lines.
- Note that `door` and `window` are flagged although they are meant to come from outside; Exercise 5 fixes the language so they are not.
-->

{{EXAMPLE:m01-generate}}

<!-- BRIEF part 3 (about 150 words)
- EGL templates mix static text with dynamic sections in [% %] and [%= %]. This template produces an HTML parts list; the Playground renders it as a table, and the captured output shows the generated HTML.
- Connect back to JHipster: the same idea, at a much larger scale, generates whole applications.
-->

{{EXAMPLE:m01-transform}}

<!-- BRIEF part 4 (about 150 words)
- ETL maps a source model to a target model of a different metamodel (here a plain graph). `Source!` and `Target!` name the two models; `::=` places transformed elements, using whichever rule transforms them.
- Read the captured target model: one node per component and one edge per connector.
- One sentence on why model-to-model transformation matters: it lets each tool or analysis work with the language that suits it.
-->

## Working in the Playground {#s6}

<!-- BRIEF (about 300 words)
- What each panel shows: the program, the model (Flexmi), the metamodel (Emfatic), the console and, for some languages, an output or diagram panel. The model and metamodel panels can show diagrams.
- Running: the Run button or Ctrl/Cmd+S. Edit anything and run again.
- Opening an example from this series loads the whole series' examples into the Playground's examples menu, grouped by module.
- Nothing is saved: use the Download button to keep work.
- The output on these pages comes from Epsilon 2.8.0 when the page was built. The Playground may run a newer Epsilon and word messages differently; if a result looks different, compare it with the captured output.
- ::: tip: keep the lesson open in one tab and the Playground in another.
-->

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=6
**Descriptive or prescriptive?** For each model, say whether it is descriptive or prescriptive, and where it sits between sketch, blueprint and program.

1. An architect's floor plan for a house that has not been built yet.
2. A class diagram reverse-engineered from an existing code base to help new developers find their way.
3. A Simulink model from which a car's cruise-control code is generated.
4. A whiteboard drawing a team makes while discussing a bug, photographed and then wiped.
:::

::: solution
1. **Prescriptive, blueprint.** It describes a house that does not exist yet. Builders follow it closely but still fill in details.
2. **Descriptive, between sketch and blueprint.** It records a system that already exists. How detailed it is depends on how much the newcomers need.
3. **Prescriptive, program.** It is complete and precise enough for a tool to generate code from it.
4. **Descriptive, sketch.** It captures the team's current understanding for one conversation, and nobody maintains it.

The same notation can serve any of these purposes. What makes a model descriptive or prescriptive is how it is used, not how it looks.
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
`````


- [ ] **Step 4: Write the English prose**

Replace every `<!-- BRIEF … -->` note with finished text that meets its brief, about 3,200 words in total. Style: second person; short paragraphs; British spelling as elsewhere on the site; define a term before using it. Every sentence about an example's output must match the captured output, which the Task 6 test pins. Keep each credit line exactly where its brief puts it. Do not change the exercises, quiz or reading list.

- [ ] **Step 5: Create the Chinese source from its frame and translate**

Save this as `tutorial-sources/mde/src/zh/module_01.md`, then replace each note with a translation of the corresponding finished English text that follows `GLOSSARY.md`:

`tutorial-sources/mde/src/zh/module_01.md`:

`````markdown
## 为什么需要模型驱动工程？ {#s1}

<!-- BRIEF Translate the finished English section s1. Use the terms in GLOSSARY.md, keep every link (point SysML/MBSE links at the _ZH pages where they exist, e.g. ../sysml/SysMLv2_Module1_Foundations_ZH.html), keep the same callouts, and translate the Kolovos credit as "（改编自 Dimitris Kolovos，[*Minimal JHipster JDL Monolith Example*](…)，2021。）" with the English title unchanged. -->

## 模型 {#s2}

<!-- BRIEF Translate the finished English section s2, as above. Keep any quotation from Kolovos in English inside quotation marks and give a Chinese rendering after it in parentheses. -->

## 元模型与符合性 {#s3}

<!-- BRIEF Translate English s3 part 1. -->

{{EXAMPLE:m01-tour}}

<!-- BRIEF Translate English s3 part 2. Captured output and code stay in English; explain them in Chinese. -->

{{EXAMPLE:m01-conformance}}

<!-- BRIEF Translate English s3 part 3. -->

## 抽象语法与具体语法 {#s4}

<!-- BRIEF Translate the finished English section s4. -->

## 用 Epsilon 进行模型管理 {#s5}

<!-- BRIEF Translate English s5 part 1, including the table (column heads: 任务 | Epsilon 语言 | 讲授模块). -->

{{EXAMPLE:m01-validate}}

<!-- BRIEF Translate English s5 part 2. -->

{{EXAMPLE:m01-generate}}

<!-- BRIEF Translate English s5 part 3. -->

{{EXAMPLE:m01-transform}}

<!-- BRIEF Translate English s5 part 4. -->

## 使用 Playground {#s6}

<!-- BRIEF Translate the finished English section s6. Name Playground buttons as they appear in its English interface (Run, Download), with a Chinese gloss on first use. -->

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=6
**描述性还是规约性？** 判断下列模型是描述性的还是规约性的，并说明它处在草图、蓝图与程序之间的哪个位置。

1. 建筑师为一栋尚未建造的房子绘制的平面图。
2. 从现有代码库逆向得到、帮助新开发者熟悉系统的类图。
3. 用来生成汽车定速巡航代码的 Simulink 模型。
4. 团队讨论一个缺陷时在白板上画的图，拍照后就擦掉了。
:::

::: solution
1. **规约性，蓝图。**它描述一栋尚不存在的房子。施工人员严格按图施工，但仍需自行补充细节。
2. **描述性，介于草图与蓝图之间。**它记录一个已经存在的系统，详略取决于新成员需要多少信息。
3. **规约性，程序。**它足够完整和精确，工具可以据此生成代码。
4. **描述性，草图。**它只记录团队在一次讨论中的理解，没有人会维护它。

同一种记法可以服务于以上任何目的。模型是描述性还是规约性，取决于它的用法，而不是它的外观。
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**找出用错的术语。** 下列说法中哪些正确使用了模型驱动工程的术语？请改写用错的说法。

1. “我们的模型实现了 UML 元模型。”
2. “`alarm.flexmi` 符合 `components.emf`。”
3. “`Port` 是报警器模型中的一个模型元素。”
4. “元模型定义了组件语言的抽象语法。”
:::

::: solution
1. **用错了。**模型“符合”元模型；“实现”描述的是编程语言中类与接口之间的关系。应改为：“我们的模型符合 UML 元模型。”
2. **正确。**
3. **用错了。**`Port` 是元模型中的一个类型（抽象类）。报警器模型的元素是实例，例如组件 `OrGate` 或其输入端口 `door`。应改为：“`door` 是报警器模型中的一个模型元素，其类型是 `InPort`。”
4. **正确。**
:::

::: exercise #e3 level=1 kind=coding minutes=8
**查询：没有输出端口的组件。** 在 Playground 中打开本模块的第一个示例，修改程序，使其打印所有没有输出端口的组件名称。提示：组合使用 `select`、`exists` 和 `isTypeOf(OutPort)`。
:::

::: solution
先选出没有任何输出端口的组件，再收集它们的名称：

{{EXAMPLE:m01-e3-solution}}

只有 `Siren` 符合条件：它接收信号，但不产生信号。第 4 模块会深入讲解 `select`、`exists` 和 `collect`。
:::

::: exercise #e4 level=1 kind=coding minutes=4
**修复模型。** 在 Playground 中打开示例“不符合元模型的模型”。修复模型使警告消失，再次运行，并与原来的输出比较。
:::

::: solution
最后一个连接器引用了一个不存在的端口：`Alarm.Siren.sond` 应为 `Alarm.Siren.sound`。改正名称后，Flexmi 能够解析该引用，警告随之消失：

{{EXAMPLE:m01-e4-solution}}

程序本身的输出没有变化，因为程序根本不读取连接器。这正是符合性警告重要的原因：程序可以在有缺陷的模型上运行，并给出看似合理的结果。
:::

::: exercise #e5 level=2 kind=project minutes=12
**区分外部输入。** 示例“验证：检查连线”中的 `Connected` 建议性检查对 `door` 和 `window` 发出了警告，但这两个输入来自架构外部的传感器，本来就不应该被连接。请修改元模型，使模型能够标明哪些输入是外部输入；在模型中把 `door`、`window` 和 `armed` 标为外部输入；再添加守卫条件，使该检查跳过外部输入。以第一个示例中连线正确的报警器作为模型。
:::

::: solution
为 `InPort` 添加一个布尔属性，在模型中设置它，并用它作为该检查的守卫条件：

{{EXAMPLE:m01-e5-solution}}

现在该检查只作用于内部输入，而内部输入都已连接，因此所有检查都通过了。请注意修改的顺序：规则需要的信息模型无法表达，所以先修改元模型，再修改模型和程序。模型驱动工程中的许多工作都遵循这个方向。
:::

::: exercise #e6 level=2 kind=project minutes=10
**第二个架构。** 使用同一个元模型，用 Flexmi 编写一个恒温器模型：带输出端口 `reading` 的 `Sensor`、带输入 `raw` 和输出 `smoothed` 的 `Filter`，以及带输入 `value` 的 `Display`，按此顺序连接。在你的模型上运行第一个示例的查询。
:::

::: solution
{{EXAMPLE:m01-e6-solution}}

引用使用以架构名称开头的完全限定名，例如 `Thermostat.Sensor.reading`。同一个查询无需修改就能用于新模型，因为它是针对元模型编写的，而不是针对某一个具体模型。
:::

## 自测 {#quiz}

```quiz
? 元模型……
- [ ] 是已经通过验证工具检查的模型
- [x] 定义某种语言的模型可以使用的概念、属性和关系，即该语言的抽象语法
- [ ] 是建模工具绘制的图形记法
- [ ] 是描述模型文件格式的模型
> 元模型规定一种语言的抽象语法；图形和文本都是它的具体语法。

? 下列哪种说法正确描述了 `alarm.flexmi` 与 `components.emf` 之间的关系？
- [ ] 模型实现了元模型。
- [ ] 模型继承了元模型。
- [x] 模型符合元模型。
- [ ] 模型依赖于元模型。
> 模型符合元模型；模型中的元素是元模型中类型的实例。

? 一个团队为一套遗留的工资系统建立模型，以便在替换它之前理解它。这是哪种模型？
- [x] 描述性模型
- [ ] 规约性模型
- [ ] 程序
- [ ] 元模型
> 它描述的是一个已经存在的系统。

? 按照本模块采用的术语，建模语言与编程语言的区别在于什么？
- [ ] 建模语言是图形化的，编程语言是文本的。
- [ ] 编程语言有元模型，建模语言没有。
- [x] 工程师打算如何使用它，而不是语言本身的技术特性。
- [ ] 建模语言无法执行。
> Kolovos 认为区别在于意图：用于理解和交流，还是用于产出可执行的制品。

? 在 EVL 中，约束（constraint）与建议性检查（critique）有何区别？
- [ ] 约束检查属性，建议性检查检查引用。
- [x] 未满足的约束是错误，未满足的建议性检查是警告。
- [ ] 建议性检查在约束之前运行。
- [ ] 约束可以有守卫条件，建议性检查不能。
> 两者都有检查条件和消息；建议性检查报告的是较轻的问题。

? 你想从模型生成一份 HTML 报告。应使用哪种 Epsilon 语言？
- [ ] EVL
- [ ] ETL
- [x] EGL
- [ ] Flexmi
> EGL 是 Epsilon 的模型到文本（模板）语言；ETL 生成的是模型而不是文本。

? 在示例“不符合元模型的模型”中，模型引用了 `Alarm.Siren.sond`。运行时会发生什么？
- [ ] 程序在打印任何内容之前就因错误而停止。
- [x] Flexmi 报告一条警告，该引用保持未设置，程序照常运行。
- [ ] Flexmi 新建一个名为 `sond` 的端口。
- [ ] Epsilon 自动把名称改正为 `sound`。
> 实际输出先显示警告，随后是查询的正常输出。
```

## 延伸阅读 {#reading}

- Dimitris Kolovos，[*Model-Driven Engineering Terminology*](https://www-users.york.ac.uk/dimitris.kolovos/blog/mde-terminology/)（2022）：本模块术语的来源，并讨论了这些术语常见的误用。
- Dimitris Kolovos，[*Metamodelling with ChatGPT*](https://www-users.york.ac.uk/dimitris.kolovos/blog/metamodelling-with-chatgpt/)（2022）：组件与端口元模型的由来，第 2 模块以它为基础。
- Dimitris Kolovos，[*Minimal JHipster JDL Monolith Example*](https://www-users.york.ac.uk/dimitris.kolovos/blog/jhipster-jdl-monolith-example/)（2021）：从一个简短的文本模型生成完整的 Web 应用。
- Dimitris Kolovos，[公开讲座](https://www.youtube.com/playlist?list=PLRwHao6Ue0YUecg7vEUQTrtySIWwrd_mI)（视频列表）。
- [Epsilon Playground 文档](https://eclipse.dev/epsilon/doc/articles/playground/)与 [Epsilon 文档](https://eclipse.dev/epsilon/doc/)。
- Marco Brambilla、Jordi Cabot、Manuel Wimmer，*Model-Driven Software Engineering in Practice*，第 2 版（Morgan & Claypool，2017）：系统介绍该领域的专著。
`````


- [ ] **Step 6: Build**

Run: `node tutorial-sources/mde/build.mjs`
Expected: `Built modules 01 in English and Chinese; ran 9 examples on Epsilon 2.8.0.`
If the build stops, its message names the file and the problem: a BRIEF note left in, a parity difference, a broken contract, or an example that misbehaves. Fix the source, never the generated HTML.

- [ ] **Step 7: Read the result**

Open `docs/tutorials/mde/module_01_EN.html` and `module_01_ZH.html` in a browser through a local server, for example `python3 -m http.server -d docs 8000` and then `http://localhost:8000/tutorials/mde/module_01_EN.html`. Check the following:
- Each example shows its files, an Open in Playground button and the captured output.
- The prose agrees with the outputs.
- The credits are present.
- The Chinese page reads naturally and uses the glossary terms.

Playground buttons only work after publication.

- [ ] **Step 8: Reuse audit (spec §6, item 7)**

List every passage that adapts Kolovos's posts: the terminology in s2–s4, the running example in s3, JHipster in s1 and s5, and the quiz explanation of question 4. For each one, confirm that it carries its credit and link. Then compare its wording with the post and confirm it is paraphrased, apart from at most two quoted sentences in quotation marks. Fix both editions before committing.

- [ ] **Step 9: Commit**

```bash
git add tutorial-sources/mde/GLOSSARY.md tutorial-sources/mde/src docs/tutorials/mde
git commit -m "MDE series: Module 1 in English and Chinese" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Browser validation

**Files:**
- Create: `tutorial-sources/mde/validate.mjs`

**Interfaces:**
- Consumes: the built `docs/tutorials/mde/` (Task 7), `plan/series.json` and each published module's `contract` (Task 6).
- Produces: `node tutorial-sources/mde/validate.mjs` prints `PASS: …` or throws an assertion naming the page and check. Screenshots are saved as `wrwei-mde-*.png` in the system temp folder.

- [ ] **Step 1: Write the validator**

`tutorial-sources/mde/validate.mjs`:

`````js
/* Browser checks for the MDE series, using the AI tools' puppeteer-core. From the repository root,
   after build.mjs:   node tutorial-sources/mde/validate.mjs
   Set MDE_BROWSER_PATH to choose a Chromium-based browser. Screenshots go to the system temp folder. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {dirname, resolve, extname, sep, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(here, '../ai/tools/package.json'));
const puppeteer = require('puppeteer-core');
const docs = resolve(here, '../../docs');
const site = join(docs, 'tutorials', 'mde');
const BUNDLE_URL = 'https://wrwei.github.io/tutorials/mde/playground/examples.json';
const FILE_FIELDS = ['program', 'secondProgram', 'flexmi', 'emfatic', 'secondEmfatic'];
const pad = n => String(n).padStart(2, '0');
const executablePath = process.env.MDE_BROWSER_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium', '/usr/bin/google-chrome',
].find(fs.existsSync);
assert(executablePath, 'Set MDE_BROWSER_PATH to a Chromium-based browser');

const series = JSON.parse(fs.readFileSync(join(here, 'plan', 'series.json'), 'utf8'));
const published = series.modules.map(m => m.number).filter(n => fs.existsSync(join(site, `module_${pad(n)}_EN.html`)));
assert(published.length, 'No module pages found: run build.mjs first');
const bundle = JSON.parse(fs.readFileSync(join(site, 'playground', 'examples.json'), 'utf8'));
const groups = new Map(bundle.examples.map(g => [Number(g.title.match(/^Module (\d+)/)[1]), g.examples]));
for (const entry of [...groups.values()].flat()) {
  for (const field of FILE_FIELDS) if (entry[field]) assert(fs.existsSync(join(site, 'playground', entry[field])), `examples.json names a missing file: ${entry[field]}`);
}

const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.zip': 'application/zip'};
const server = createServer(async (req, res) => {
  const file = resolve(docs, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(docs + sep)) { res.writeHead(403).end(); return; }
  try { res.setHeader('Content-Type', types[extname(file)] || 'text/plain; charset=utf-8'); res.end(await readFile(file)); }
  catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/tutorials/mde/`;
let browser;
try {
  browser = await puppeteer.launch({executablePath, headless: true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const number of published) {
    const contract = JSON.parse(fs.readFileSync(join(here, 'plan', `module_${pad(number)}.json`), 'utf8')).contract;
    const expected = (groups.get(number) || []).map(e => e.id);
    for (const lang of ['EN', 'ZH']) {
      const file = `module_${pad(number)}_${lang}.html`;
      await page.setViewport({width: 1280, height: 900});
      await page.goto(base + file, {waitUntil: 'networkidle0'});
      const missing = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map(a => a.hash.slice(1)).filter(id => !document.getElementById(id)));
      assert.deepEqual(missing, [], `${file}: in-page links resolve`);
      const examples = await page.$$eval('.example', els => els.map(el => ({
        id: el.id.replace(/^ex-/, ''),
        href: el.querySelector('.playground-btn')?.href,
        output: el.querySelector('.output pre')?.textContent.trim() || '',
      })));
      assert.deepEqual(examples.map(e => e.id).sort(), [...expected].sort(), `${file}: shows every example of the module once`);
      for (const e of examples) {
        const url = new URL(e.href);
        assert.equal(url.origin + url.pathname, 'https://eclipse.dev/epsilon/playground/', `${file} ${e.id}: Playground address`);
        assert.equal(url.searchParams.get('examples'), BUNDLE_URL, `${file} ${e.id}: bundle address`);
        assert.deepEqual([...url.searchParams.keys()], ['examples', e.id], `${file} ${e.id}: selects its own example`);
        assert(e.output.length > 0, `${file} ${e.id}: has captured output`);
      }
      assert.equal(await page.$$eval('.exercise', els => els.length), contract.exercises, `${file}: exercises`);
      assert.equal(await page.$$eval('details.solution', els => els.length), contract.exercises, `${file}: solutions`);
      const questions = await page.$$eval('.quiz-q', els => els.length);
      assert(questions >= contract.quiz[0] && questions <= contract.quiz[1], `${file}: quiz length`);
      const download = await page.$eval('.download-link', a => a.href);
      assert.equal(await page.evaluate(async href => (await fetch(href)).status, download), 200, `${file}: download exists`);
      await page.click('#moduleDropdown .badge');
      assert.equal(await page.$eval('#moduleDropdown .badge', el => el.getAttribute('aria-expanded')), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#moduleDropdown', el => el.classList.contains('open')), false);
      for (const question of await page.$$('.quiz-q')) {
        const answer = await question.evaluate(el => el.dataset.answer);
        await question.$eval(`[data-i="${answer}"]`, el => el.click());
      }
      assert.match(await page.$eval('.quiz-score', el => el.textContent), new RegExp(`${questions} / ${questions}`), `${file}: full marks for right answers`);
      await page.$eval('details.solution summary', el => el.click());
      assert.equal(await page.$eval('details.solution', el => el.open), true, `${file}: solutions open`);
      await page.$eval('.session-done input', el => { el.checked = true; el.dispatchEvent(new Event('change')); });
      await page.reload({waitUntil: 'networkidle0'});
      assert.equal(await page.$eval('.session-done input', el => el.checked), true, `${file}: progress survives a reload`);
      await Promise.all([page.waitForNavigation({waitUntil: 'networkidle0'}), page.click('.lang-switch')]);
      assert(page.url().endsWith(`module_${pad(number)}_${lang === 'EN' ? 'ZH' : 'EN'}.html`), `${file}: language switch`);
      assert.equal(await page.$eval('.session-done input', el => el.checked), true, `${file}: progress is shared across languages`);
      await page.$eval('.session-done input', el => { el.checked = false; el.dispatchEvent(new Event('change')); });
      await page.goto(base + file, {waitUntil: 'networkidle0'});
      for (const width of [360, 390, 768, 1280]) {
        await page.setViewport({width, height: 900});
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${file}: no horizontal scrolling at ${width}px`);
        if (width < 900) assert.equal(await page.$eval('.mobile-toc', el => getComputedStyle(el).display), 'block', `${file}: mobile contents at ${width}px`);
      }
      await page.setViewport({width: 1280, height: 900});
      await page.screenshot({path: join(tmpdir(), `wrwei-mde-module-${pad(number)}-${lang}.png`)});
      await page.setViewport({width: 390, height: 844});
      await page.screenshot({path: join(tmpdir(), `wrwei-mde-module-${pad(number)}-${lang}-mobile.png`)});
    }
  }
  for (const lang of ['EN', 'ZH']) {
    const index = lang === 'EN' ? 'index.html' : 'index_ZH.html';
    await page.setViewport({width: 1280, height: 900});
    await page.goto(base + index, {waitUntil: 'networkidle0'});
    assert.equal(await page.$$eval('.module-card', els => els.length), series.modules.length, `${index}: one card per module`);
    assert.equal(await page.$$eval('a.module-card', els => els.length), published.length, `${index}: published modules are linked`);
    assert.equal(await page.$$eval('article.module-card.planned', els => els.length), series.modules.length - published.length, `${index}: other modules are marked planned`);
    assert.equal(await page.$$eval('#acknowledgements', els => els.length), 1, `${index}: acknowledgements`);
    for (const width of [360, 1280]) {
      await page.setViewport({width, height: 900});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${index}: fits ${width}px`);
    }
    await page.screenshot({path: join(tmpdir(), `wrwei-mde-overview-${lang}.png`), fullPage: true});
  }
  assert.deepEqual(errors, [], 'No browser runtime errors');
  console.log(`PASS: modules ${published.map(pad).join(', ')} in both languages, ${[...groups.values()].flat().length} Playground examples, overview pages, quiz, solutions, progress, language switch and layouts at 360–1280px.`);
  console.log(`Screenshots: ${join(tmpdir(), 'wrwei-mde-*.png')}`);
} finally {
  if (browser) await browser.close();
  server.close();
}
`````


- [ ] **Step 2: Show that it catches a broken page**

```bash
node -e "const f='docs/tutorials/mde/module_01_ZH.html',fs=require('fs');fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace('<div class=\"exercise\"','<div class=\"exercise-removed\"'))"
node tutorial-sources/mde/validate.mjs
```

Expected: FAIL with `AssertionError … module_01_ZH.html: exercises`.

- [ ] **Step 3: Restore the page and run the validator**

```bash
node tutorial-sources/mde/build.mjs
node tutorial-sources/mde/validate.mjs
```

Expected: `PASS: modules 01 in both languages, 9 Playground examples, overview pages, quiz, solutions, progress, language switch and layouts at 360–1280px.`

- [ ] **Step 4: Look at the screenshots**

Open `wrwei-mde-module-01-EN.png`, `…-ZH.png`, the two `-mobile.png` files and `wrwei-mde-overview-*.png` from the temp folder the validator printed. Check that nothing overlaps or is cut off and that the Chinese text is not garbled.

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/mde/validate.mjs
git status --short docs/tutorials/mde   # must be empty: the rebuild restored the page exactly
git commit -m "MDE series: browser validation of the built pages" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Site integration, live check and documentation

**Files:**
- Create: `tutorial-sources/mde/live-check.mjs`
- Create: `tutorial-sources/mde/README.md`
- Modify: `docs/tutorials/index.md` (insert a card after the MBSE card)

**Interfaces:**
- Consumes: `loadExamples` (Task 2), `playgroundLink` (Task 3).
- Produces: `node tutorial-sources/mde/live-check.mjs [moduleNumber]`, to run after deployment only. It fetches the published bundle, opens each example in the real Playground, calls the page's `window.runProgram()`, and reads the backend's JSON reply, which carries an `error` field when a run fails. It then compares that status with `expect` and pauses 3 seconds between runs.

- [ ] **Step 1: Write the live check**

`tutorial-sources/mde/live-check.mjs`:

`````js
/* After publication: runs every published example in the real Epsilon Playground and checks that it
   succeeds or fails as its example.json declares. It uses the Playground's public service, so it runs
   one example at a time with a pause between runs. From the repository root, after deployment:
     node tutorial-sources/mde/live-check.mjs        all published modules
     node tutorial-sources/mde/live-check.mjs 1      Module 01 only
   Set MDE_BROWSER_PATH to choose a Chromium-based browser. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dirname, resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {loadExamples} from './tools/examples.mjs';
import {playgroundLink} from './tools/bundle.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(here, '../ai/tools/package.json'));
const puppeteer = require('puppeteer-core');
const BUNDLE_URL = 'https://wrwei.github.io/tutorials/mde/playground/examples.json';
const PAUSE_MS = 3000;
const pad = n => String(n).padStart(2, '0');
const executablePath = process.env.MDE_BROWSER_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium', '/usr/bin/google-chrome',
].find(fs.existsSync);
assert(executablePath, 'Set MDE_BROWSER_PATH to a Chromium-based browser');

const live = await (await fetch(BUNDLE_URL, {cache: 'no-store'})).json();
const liveIds = new Set(live.examples.flatMap(group => group.examples.map(e => e.id)));
const only = process.argv[2] ? Number(process.argv[2]) : null;
const series = JSON.parse(fs.readFileSync(join(here, 'plan', 'series.json'), 'utf8'));
const modules = series.modules.map(m => m.number)
  .filter(n => (only === null || n === only) && fs.existsSync(join(here, 'src', 'en', `module_${pad(n)}.md`)));
const examples = modules.flatMap(n => loadExamples(join(here, 'examples', `module_${pad(n)}`), n));
const unpublished = examples.filter(e => !liveIds.has(e.id)).map(e => e.id);
assert.deepEqual(unpublished, [], `Not in the published bundle yet (deploy first): ${unpublished.join(', ')}`);

const browser = await puppeteer.launch({executablePath, headless: true});
const mismatches = [];
try {
  const page = await browser.newPage();
  for (const example of examples) {
    await page.goto(playgroundLink(BUNDLE_URL, example.id), {waitUntil: 'networkidle2', timeout: 90000});
    await page.waitForFunction(() => typeof window.runProgram === 'function', {timeout: 30000});
    const [response] = await Promise.all([
      page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/epsilon'), {timeout: 90000}),
      page.evaluate(() => window.runProgram()),
    ]);
    const result = await response.json();
    const status = 'error' in result ? 'error' : 'ok';
    const line = `${example.id}: ${status}${status === 'error' ? ` (${String(result.error).split('\n')[0]})` : ''}`;
    console.log(line);
    if (status !== example.expect) mismatches.push(`${line}; example.json expects "${example.expect}"`);
    await new Promise(r => setTimeout(r, PAUSE_MS));
  }
} finally {
  await browser.close();
}
assert.deepEqual(mismatches, [], `The Playground disagrees with the build:\n${mismatches.join('\n')}`);
console.log(`PASS: ${examples.length} examples behave in the Playground as their example.json declares.`);
`````


Check its syntax now (it can only run after deployment):

Run: `node --check tutorial-sources/mde/live-check.mjs`
Expected: no output, exit code 0.

- [ ] **Step 2: Write the README**

`tutorial-sources/mde/README.md`:

`````markdown
# Model-Driven Engineering with Eclipse Epsilon: sources

Published pages are built into `docs/tutorials/mde/`. Edit these sources, never the generated HTML.
`SPEC.md` is the design, `PLAN.md` the implementation plan for the shared tooling and Module 1, and
`GLOSSARY.md` the English–Chinese terminology.

## Requirements

- Java 17 or later and Maven 3.9 or later. The first build downloads Eclipse Epsilon 2.8.0 and
  Emfatic 1.1.0 from Maven Central.
- Node 22.2 or later, with the AI tools' packages installed: `npm ci --prefix tutorial-sources/ai/tools`.
- Chrome or Edge for the browser checks, or set `MDE_BROWSER_PATH` to another Chromium-based browser.
- Python with the repository's `requirements.txt` for the MkDocs build.

## Build and check

From the repository root:

```
node --test --test-concurrency=1 "tutorial-sources/mde/tests/*.test.mjs"
node tutorial-sources/mde/build.mjs
node tutorial-sources/mde/validate.mjs
python -m mkdocs build --strict
```

The tests run one file at a time because several of them may need to build the Java runner.
After the site has been deployed, `node tutorial-sources/mde/live-check.mjs` runs every published
example in the real Epsilon Playground.

## How a module is put together

- `plan/series.json`: all ten modules (titles, summaries, hours, focus) and the overview page text.
- `plan/module_NN.json`: outcomes, study sessions and the module's contract (how many teaching
  examples, exercises and quiz questions it has, and which sections it must contain).
- `src/en/module_NN.md` and `src/zh/module_NN.md`: the lesson, in the AI series' Markdown dialect
  (`tutorial-sources/ai/tools/md.mjs`). A module is published once both files exist.
- `examples/module_NN/<id>/`: one folder per runnable example or exercise solution. Its
  `example.json` has these fields:

  | Field | Meaning |
  |---|---|
  | `id` | `mNN-<slug>`, equal to the folder name |
  | `role` | `example` (default) or `solution` |
  | `title` | `{"en": …, "zh": …}`; the Playground shows the English title |
  | `language` | `eol`, `evl`, `egl`, `egx` or `etl` |
  | `program`, `flexmi`, `emfatic` | file names in the folder (required) |
  | `secondProgram` | EGX only: the template, which must be called `template.egl` |
  | `secondEmfatic` | ETL only: the target metamodel |
  | `outputType`, `outputLanguage` | passed to the Playground (for example `"outputType": "html"`) |
  | `show` | files shown open on the page, in order; the rest go under "More files" (default: the program) |
  | `expect` | `ok` or `error`; with `error`, `expectContains` names text the output must contain |
  | `allowWarnings` | `true` only when the example is about a model that does not conform |

- A line `{{EXAMPLE:<id>}}` in a lesson shows that example: its files, an Open in Playground button
  and the output captured during the build.

## Rules the build enforces

- Every example runs on Epsilon 2.8.0 during the build, and pages show that output. Never type
  expected output by hand.
- The build stops if a run differs from its `example.json`; if a model produces warnings without
  `allowWarnings`; if output contains a file path or a Java object identity; if the English and
  Chinese editions differ in sections, examples, exercises or quiz answers; if a lesson still
  contains a `<!-- BRIEF` note; if the Chinese source is a copy of the English one; or if a module
  breaks its contract.

## Things the tools do not catch

- Flexmi references must use fully qualified names that start at the root element
  (`Alarm.Siren.sound`). Epsilon 2.8.0 does not resolve partial names, although newer versions do,
  so a partial name may work in the Playground and fail in the build.
- Do not name a metamodel class `System` (it clashes with EOL's built-in `System` object) or a
  feature `from` (an ETL keyword).
- Flexmi guesses the meaning of unknown element names instead of always warning: a misspelt tag can
  silently become a different element.
- Playground links work only once the bundle is published at
  `https://wrwei.github.io/tutorials/mde/playground/examples.json`.

## Reuse of Dimitris Kolovos's blog

As set out in `SPEC.md` section 2: his ideas and examples are adapted and paraphrased, never
copied; each use carries an inline credit with a link; quotations are at most two sentences, in
quotation marks, with a citation; all example code is written for this series.

Permission for closer reuse: not requested. If the author grants it, record here who granted it,
when, and what it covers.

## Publishing

Publishing means pushing to `main`, which triggers the GitHub Pages deployment. Do it only when the
site owner asks. After the deployment finishes, run `live-check.mjs` and record the result.
`````


- [ ] **Step 3: Add the series card to the tutorials index**

In `docs/tutorials/index.md`, insert this block directly after the line `[:octicons-arrow-right-24: Go to MBSE Tutorials](mbse/index.html)` and its following `---` separator, so that it sits between the MBSE and AI Agents sections:

```markdown
## Model-Driven Engineering with Eclipse Epsilon

A hands-on 10-module series on model-driven engineering: metamodels, models, querying, validation, code generation and model-to-model transformation with Eclipse Epsilon. Every example runs in the browser in the Epsilon Playground, with nothing to install. English and Chinese editions. Module 1 is available now; the other modules are in preparation.

[:octicons-arrow-right-24: Go to MDE Tutorials](mde/index.html)

---
```

- [ ] **Step 4: Full verification**

```bash
node --test --test-concurrency=1 "tutorial-sources/mde/tests/*.test.mjs"
node tutorial-sources/mde/build.mjs
git status --short docs/tutorials/mde
node tutorial-sources/mde/validate.mjs
python -m mkdocs build --strict
```

Expected:
- The test command shows `# pass 17` and `# fail 0`.
- The build reports 9 examples.
- `git status --short docs/tutorials/mde` prints nothing, which proves the rebuild is byte-identical.
- The validator prints `PASS`.
- MkDocs exits 0. Use an environment with the root `requirements.txt` installed; for example, run `python3 -m venv ~/.venvs/wrwei && ~/.venvs/wrwei/bin/pip install -r requirements.txt` and then run `~/.venvs/wrwei/bin/mkdocs build --strict`.

Delete the generated `site/` folder afterwards, or leave it: it is ignored.

- [ ] **Step 5: Commit and stop**

```bash
git add tutorial-sources/mde/live-check.mjs tutorial-sources/mde/README.md docs/tutorials/index.md
git commit -m "MDE series: tutorials index card, live Playground check and README" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git log --oneline main..mde-series
```

Report to the site owner: the branch's commits, the verification results, and the screenshots' location. **Do not push or merge.** Module 1 is ready for review.

---

### Task 10: Publication (only when the site owner asks)

**Files:**
- Modify: `tutorial-sources/mde/README.md` (add a "Publication log" section)

- [ ] **Step 1: Merge and push as instructed**

Use the method the site owner chooses: a fast-forward merge into `main` and push, or a pull request from `mde-series`. Pushing `main` triggers `.github/workflows/deploy.yml` (`mkdocs gh-deploy`).

```bash
gh run list --workflow deploy.yml --limit 1
gh run watch <run-id> --exit-status
```

Expected: the deployment succeeds.

- [ ] **Step 2: Confirm the bundle is live and loadable cross-origin**

```bash
curl -sI https://wrwei.github.io/tutorials/mde/playground/examples.json | grep -i -E "^HTTP|access-control-allow-origin"
```

Expected: `HTTP/2 200` and `access-control-allow-origin: *`. GitHub Pages can take a minute to update; retry if you get a 404.

- [ ] **Step 3: Run the live Playground check**

Run: `node tutorial-sources/mde/live-check.mjs 1`
Expected: one line per example (`m01-tour: ok` and so on), then `PASS: 9 examples behave in the Playground as their example.json declares.` A mismatch means the Playground's Epsilon disagrees with 2.8.0. Change the example so that it behaves the same in both, rebuild and republish; do not edit the expectation to match only one of them.

- [ ] **Step 4: Open two examples by hand**

On the live page `https://wrwei.github.io/tutorials/mde/module_01_EN.html`, press Open in Playground on "A first model, metamodel and query" and on "Model-to-text: a parts list". In each, check that the example loads, runs and shows a diagram or rendered HTML.

- [ ] **Step 5: Record the publication**

Append to `tutorial-sources/mde/README.md`:

```markdown
## Publication log

- <YYYY-MM-DD>: Module 1 published (commit <sha>). Live Playground check: 9/9 examples as declared.
```

Commit and push it the same way as Step 1.
