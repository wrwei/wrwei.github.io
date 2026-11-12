## Why validation needs rules {#s1}

A metamodel says that a connector has an output-port source and an input-port target. It cannot, by that structure alone, decide whether the two ports belong to different components or carry compatible signals. Module 4 could *query* those facts; this module states which ones a valid architecture must satisfy. Epsilon's **EVL** (Epsilon Validation Language) evaluates rules over model elements and reports violations.

EVL uses EOL expressions inside `check`, `guard` and `message` blocks. A `context Connector` applies its rules to each connector. A **constraint** reports an error when its check is false; a **critique** reports a warning for a less serious issue. The examples deliberately include both valid and invalid models. The captured output below each one is the local runner's readable report. In the Playground, the console stays empty for EVL and the findings appear as notes on the validated model diagram.

## Constraints and critiques {#s2}

This alarm has a wiring mistake: one connector runs from `AndGate.sound` back to `AndGate.armed`. The `NoSelfLoop` constraint compares the containing components of its source and target. The `Connected` critique asks whether any connector targets each input.

{{EXAMPLE:m05-basic}}

The error identifies the self-loop. The warnings name inputs without a connector. `OrGate.door` and `OrGate.window` are meant to receive signals from outside this model, so those two warnings are false positives for our intended architecture. The failed self-loop also leaves `Siren.sound` without a connection. A good validation set needs domain distinctions, not just more checks.

Rules should produce useful messages. `self.source.eContainer().name` names the component of a connector's source port. A bare message such as “invalid connector” would be harder to act on. Use a **critique** when a finding deserves review but does not necessarily invalidate the model, and a **constraint** when a violation makes the model unacceptable for the intended task.

## Guards and messages {#s3}

The metamodel in these examples gives `InPort` an `external` Boolean. A guard can then limit a rule to internal inputs. `guard: not self.external` skips the `Connected` critique for `door`, `window` and `armed`, while still checking the internal `open` and `sound` inputs.

{{EXAMPLE:m05-guards}}

The correctly wired alarm satisfies all checks. A guard answers **when to check**; a `check` answers **what must hold** for an applicable element. You can put a guard on one rule or on a whole context. Do not hide an actual error by writing a guard that is too broad. Exercise 4 asks you to compare the guarded and unguarded versions.

A different rule checks signal compatibility. The next model makes `Siren.sound` analog while the output feeding it is digital. Both ports are legal instances of the metamodel, and the connector is structurally well-typed; the domain rule still rejects the pairing.

{{EXAMPLE:m05-types}}

This is why validation is separate from basic loading. The model can be represented and queried, but a downstream generator should refuse to assume the connection is meaningful until the rule passes.

## Dependencies and fixes {#s4}

Sometimes one rule is meaningful only after another passes. In this draft model, one component has a two-letter name and another has no name. `HasName` checks the prerequisite; `LongEnough` checks length only if `self.satisfies("HasName")`. The prerequisite is marked `@lazy`, so it runs when requested by the dependent rule.

{{EXAMPLE:m05-dependencies}}

The output contains one message for the short name and one for the missing name. It does not try to calculate the length of a missing name. Dependencies make the report focused and avoid errors inside checks. The [EVL reference](https://eclipse.dev/epsilon/doc/evl/) also describes `satisfiesAll` and `satisfiesOne` for several prerequisites.

EVL rules may offer a **fix** with a title and EOL `do` block. The next critique spots a lowercase `siren` and offers a specific rename. The local runner reports the critique but does not apply the fix. In an Eclipse validation workflow, a user can select a proposed fix; the Playground's validated diagram shows the finding but does not provide that interactive Eclipse fix workflow.

{{EXAMPLE:m05-fix}}

A fix is executable code, so its author must ensure that it really repairs the problem. This one is intentionally specific to the `siren` exercise; it would be a poor general fix for every lowercase component. Do not assume that merely declaring a fix changes the model during validation.

## Run and inspect EVL {#s5}

For each example, first read the Flexmi model to predict which elements should fail. Then run it in the Playground and switch to the validated model diagram. Compare its notes with the captured text under the lesson example. The two surfaces present the same kind of result differently: the local runner prints `Error [RuleName]` and `Warning [RuleName]`; the Playground attaches findings to affected model elements.

If a model-loading warning appears in the captured output, investigate it before interpreting EVL results. A reference that never resolved may make an EVL expression fail for the wrong reason. This module's validation examples have resolved references; the deliberate failures are domain-rule violations, apart from the name-only draft model, which has no connectors.

## Design a validation set {#s6}

Write rules around decisions the project must make. For this architecture, a practical first set might require distinct components at connector ends, compatible signal types, and an incoming connection for every *internal* input. Give each rule a stable name and an actionable message. Mark advisory rules as critiques. Use guards to define applicability and dependencies when one check needs another to pass.

A passing EVL run is evidence for the rules you wrote, not proof of every possible property. A rule set can be incomplete. Review example models that should pass and models that should fail, including boundary cases such as external inputs and empty names. Module 6 will generate artefacts from models; validation should run before generation when the output depends on these assumptions.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=3
**Constraint or critique?** Classify a self-loop connector and an input intended to be external but lacking an internal connector. Explain your severity choices.
:::

::: solution
A self-loop violates the intended wiring rule and is a constraint error. An input without an internal connector may be external, so a warning or guarded critique is more suitable until the model states whether it is external.
:::

::: exercise #e2 level=1 kind=conceptual minutes=3
**Guard or check?** In `guard: not self.external` and `check: Connector.all.exists(c | c.target = self)`, which expression decides applicability, and which decides success?
:::

::: solution
The guard decides whether to evaluate the rule for this input. If the guard passes, the check decides whether the input satisfies the rule.
:::

::: exercise #e3 level=1 kind=conceptual minutes=3
**Dependency.** Why should the length rule depend on `HasName`? What two findings does the dependency example report?
:::

::: solution
A missing name has no useful length to test. The dependency reports that `AB` is shorter than three characters and that another component has no name, without a misleading length result for the unnamed component.
:::

::: exercise #e4 level=1 kind=coding minutes=4
**Ignore external inputs.** Start with the `Connected` critique from the bad-wiring example. Add a guard so external inputs are skipped, and use the correctly wired alarm. What does EVL report?
:::

::: solution
The guarded check applies only to internal inputs, which are connected in this model:

{{EXAMPLE:m05-e4-solution}}
:::

::: exercise #e5 level=2 kind=coding minutes=4
**Repair a signal type.** In the mismatch example, change `Siren.sound` to `DIGITAL` and rerun `CompatibleTypes`.
:::

::: solution
Both ends of each connector now have the same signal type, so the constraint passes:

{{EXAMPLE:m05-e5-solution}}
:::

::: exercise #e6 level=2 kind=coding minutes=4
**Inspect a fix.** In the naming example, predict the name after selecting the fix in an Eclipse workflow. Then edit the Flexmi model to that name and rerun the rule. Does merely declaring the fix repair the original model?
:::

::: solution
The fix's `do` block assigns `Siren`. Declaring it does not run it during validation; the reference model below applies the change explicitly and passes:

{{EXAMPLE:m05-e6-solution}}
:::

## Self-check quiz {#quiz}

```quiz
? What does `context Connector` select?
- [x] Connector instances to which its rules apply
- [ ] The Flexmi file name
- [ ] Only connectors with errors
- [ ] The target metamodel
> A context specifies the model-element type evaluated by its rules.

? A failed EVL constraint is reported as what?
- [x] An error
- [ ] A warning only
- [ ] A new model element
- [ ] A generated file
> Constraints represent violations severe enough to report as errors.

? What is a critique for?
- [ ] Replacing all constraints
- [x] Reporting a non-critical issue as a warning
- [ ] Converting XML to YAML
- [ ] Executing a fix automatically
> Critiques are advisory validation rules.

? What does a guard do?
- [ ] Change the metamodel
- [x] Limit the elements on which a rule is evaluated
- [ ] Print every EOL variable
- [ ] Save a Flexmi resource
> Guards define applicability before a check runs.

? Why use `self.satisfies("HasName")` before a name-length check?
- [ ] To rename the component
- [x] To test a prerequisite and avoid a meaningless length check
- [ ] To generate a file
- [ ] To turn a critique into a constraint
> Dependencies make later checks conditional on earlier results.

? Does declaring an EVL `fix` automatically change the model during the local build?
- [ ] Yes, on every run.
- [x] No; the runner reports findings without applying fixes.
- [ ] Yes, but only for critiques.
- [ ] It deletes the model.
> A fix is an offered action in an interactive workflow, not part of ordinary checking.

? Where are EVL findings shown in the Playground for these examples?
- [ ] Only in the program source
- [x] As notes on the validated model diagram
- [ ] In the Git commit message
- [ ] Only in the generated zip
> The local captured output prints them; the Playground displays diagram notes.
```

## Further reading {#reading}

- The [EVL reference](https://eclipse.dev/epsilon/doc/evl/) covers contexts, guards, dependencies, critiques and fixes.
- The [EOL reference](https://eclipse.dev/epsilon/doc/eol/) explains the expressions used inside EVL rules.
