## LLMs as drafting assistants {#s1}

A language model can suggest a metamodel, an example model or an Epsilon program. Its answer is a **draft**: the text may parse yet express the wrong domain rule, and a plausible explanation may disagree with the model. Use the metamodel to define structure, EVL to state constraints, and runnable examples to test the result. An LLM can help propose alternatives; evidence from the model decides which alternative works.

Adapted from Dimitris Kolovos, [*Metamodelling with ChatGPT*, Episode 2](https://www-users.york.ac.uk/~dk135/blog/metamodelling-with-chatgpt/episode-2/). In that experiment, an example of Emfatic helped the language model produce a syntactically usable draft; later feedback improved a generated EGL template. Our drafts below are **illustrations written for this tutorial**, not recorded outputs from that experiment or a live LLM. No example calls an LLM service.

## Review a metamodel draft {#s2}

The first illustrative draft widens `Connector.source` and `Connector.target` to the abstract `Port` type. It therefore accepts an input port as a source and an output port as a target. The EOL query runs successfully and prints a reversed connection. A successful parse and run show that the files are usable by Epsilon; they do not prove that the intended wiring rule holds.

{{EXAMPLE:m08-draft}}

Ask a drafting assistant for the classes, containment, multiplicities, endpoint direction and one valid and one invalid example. Review each answer against domain requirements. In particular, check `val` versus `ref`: connectors refer to ports owned by components; they do not contain new copies of those ports.

## Check a model draft {#s3}

EVL can make the direction rule executable. The next check rejects the reversed connector even though the broad draft metamodel accepts it. In the Playground, EVL findings appear as notes on the model diagram; the captured result below records the same validation run.

{{EXAMPLE:m08-check}}

The corrected metamodel narrows the source to `OutPort` and target to `InPort`. The corrected model also points from `OrGate.open` to `AndGate.open`. The same EVL check now passes.

{{EXAMPLE:m08-correct}}

These are two kinds of evidence. The metamodel restricts reference types; EVL checks a rule that can also be applied to the broad draft. A more realistic review would add uniqueness, signal-type compatibility and connection completeness checks from Module 5.

## Validate generated claims {#s4}

An assistant might describe the alarm as having three connectors. The model has two. This illustrative claim becomes a constraint so the disagreement is observable rather than a matter of confidence in prose.

{{EXAMPLE:m08-claims}}

Translate important claims into tests or queries: element counts, type membership, reachability, uniqueness, and generated-file contents. Keep the claim close to its check. A passing check supports only the property it tests; it is not a general proof that the entire design is correct.

## Generate prompts from models {#s5}

The flow can also run from a model to a prompt. EGX makes one review prompt per component, and EGL fills in the actual port names. These are generated text files for a person or a later tool to use; running this example does not send them anywhere.

{{EXAMPLE:m08-prompt}}

The prompt asks the reviewer to avoid inventing ports and to compare the answer with the source model. If an LLM later produces an answer, save the answer as a separate draft and run the appropriate Epsilon checks again. Do not silently copy a response into a trusted model.

## Use an evidence loop {#s6}

Start with a domain requirement, request or write a draft, run a parser and checks, inspect their output, then revise the draft. Record both the input and the exact check result. For generated programs, run them on at least a normal, an edge and an invalid model. For generated text, inspect the emitted files as well as whether the generator completed.

The tools test different things: Emfatic checks metamodel syntax, Flexmi loads instances, EVL checks domain constraints, ETL checks a mapping through its target, and EGL/EGX exposes generated text. Human review remains necessary for requirements that have not yet been formalised.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**Find the gap.** Why can the first draft run even though its first connector is reversed?
:::

::: solution
Both endpoint references are typed as the broad `Port` class, so either concrete port subtype is accepted. Successful execution does not imply that the intended output-to-input rule holds.
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**Separate evidence.** What does a successful Emfatic parse establish? What does the EVL direction constraint establish?
:::

::: solution
Parsing establishes that the metamodel syntax can be processed. The EVL constraint checks the direction of each connector in the loaded model. Neither alone establishes all domain requirements.
:::

::: exercise #e3 level=1 kind=conceptual minutes=5
**Review a claim.** A generated paragraph says there are three components and three connectors. Which part is true for the corrected alarm?
:::

::: solution
There are three components, `OrGate`, `AndGate` and `Siren`, but only two connectors. Check counts against the model, not the paragraph.
:::

::: exercise #e4 level=2 kind=coding minutes=10
**Check the draft's direction.** Add an EVL constraint to reject any connector whose source is not an `OutPort` or target is not an `InPort`.
:::

::: solution
The illustrative reversed draft fails the constraint:

{{EXAMPLE:m08-e4-solution}}
:::

::: exercise #e5 level=2 kind=coding minutes=10
**Verify a count.** Replace the false three-connector claim with a check that the corrected alarm has exactly two connectors.
:::

::: solution
The corrected model passes:

{{EXAMPLE:m08-e5-solution}}
:::

::: exercise #e6 level=2 kind=coding minutes=10
**Improve a prompt.** Add each port's signal type and concrete port class to the generated review prompt.
:::

::: solution
The template iterates the model's ports and emits their declared values:

{{EXAMPLE:m08-e6-solution}}
:::

## Self-check quiz {#quiz}

```quiz
? How should an LLM-suggested metamodel first be treated?
- [x] As a draft to check against requirements and examples
- [ ] As a validated domain definition
- [ ] As executable Java
- [ ] As a replacement for the model
> A fluent draft can encode the wrong structure or rules.

? What does the broad `Port` endpoint type allow?
- [ ] Only output-to-input connections
- [x] Input or output ports at either end
- [ ] No connectors
- [ ] Only external ports
> Both concrete port types extend `Port`.

? Which example exposes the reversed connection as a rule violation?
- [ ] The plain EOL printout alone
- [x] The EVL endpoint constraint
- [ ] The EGX prompt generator
- [ ] A Git commit
> The EVL check states the expected direction.

? How many connectors are in the corrected alarm model?
- [ ] One
- [x] Two
- [ ] Three
- [ ] Four
> The model contains two connector elements.

? What does the EGX example do?
- [x] Generate local text prompts from components
- [ ] Call an online LLM
- [ ] Validate all possible outputs
- [ ] Change the metamodel
> EGX produces files; no LLM call occurs.

? What should happen after receiving a later LLM response?
- [ ] Trust it if it is well written.
- [x] Save it as a draft and check its claims or artefacts.
- [ ] Delete the original model.
- [ ] Skip the invalid cases.
> Repeat the evidence loop on the response.

? What does a passing constraint prove?
- [ ] The whole system is correct.
- [x] The checked property holds for that run and model.
- [ ] The LLM was trained on the model.
- [ ] All generated code compiles.
> Checks have a defined, limited scope.
```

## Further reading {#reading}

- Dimitris Kolovos, [*Metamodelling with ChatGPT*, Episode 2](https://www-users.york.ac.uk/~dk135/blog/metamodelling-with-chatgpt/episode-2/), for the experiment adapted here.
- The [EVL reference](https://eclipse.dev/epsilon/doc/evl/) and [EGX reference](https://eclipse.dev/epsilon/doc/egx/) describe the two executable parts of this workflow.
