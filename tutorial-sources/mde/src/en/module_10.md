## MiniJDL brief {#s1}

The capstone asks you to design a small language for applications with entities, fields and directed relations. From one model, you will check domain rules, generate SQL DDL, Java data classes and HTML documentation, then transform the entities into a relational model. This **MiniJDL** is a teaching language, not JHipster's JDL, and its generated Java classes are simple data declarations rather than a working web application.

The idea of generating several coordinated artefacts from an entity description is adapted from Dimitris Kolovos, [*Minimal JHipster JDL Monolith Example*](https://www-users.york.ac.uk/dimitris.kolovos/blog/jhipster-jdl-monolith-example/) (2021). The MiniJDL metamodel, shop model and Epsilon programs here are written for this tutorial. You can use the [Module 10 bundle](downloads/module_10.zip) locally or open each example in the Playground.

Aim for a repeatable pipeline: a metamodel defines the language; a model records the application; EVL rejects bad data; EGL/EGX generate readable artefacts; ETL creates another model with explicit mappings. Each stage gives you evidence to inspect before trusting the next one.

## Define the language {#s2}

Open the first example's `minijdl.emf`. An `Application` contains `Entity` objects; an `Entity` contains `Field` and `Relation` objects. A field has a `FieldType` of `STRING`, `INTEGER` or `BOOLEAN`. A relation references a target entity. `val` makes ownership clear; `ref` means the relation points to an existing entity rather than owning another copy.

The Flexmi model describes `Shop`: `Customer` has `email` and `active`, `Product` has `title` and `price`, and `Purchase` has `quantity` plus relations to the other two entities. The EOL query prints the counts so you can check that the model loaded as intended.

{{EXAMPLE:m10-language}}

The metamodel captures structure, not every business rule. It does not, for example, prevent two fields in one entity from sharing a name. That rule belongs in validation. Adding a new field type later would require updating both the metamodel enum and every generator's type mapping.

## Build and validate a model {#s3}

The next model deliberately has two `Customer.email` fields. EVL checks uniqueness of entity names and of field names within each entity, and checks that each relation has a target. The duplicate field produces two findings because the constraint runs on both offending field elements. This is a validation result, not a parser failure.

{{EXAMPLE:m10-invalid}}

Repair the duplicate before generating deliverables. The worked solution in Exercise 4 runs the same rules on a corrected model. In a real project, add checks for identifier syntax, names reserved by target languages, relation-name clashes, required fields and cycles where relevant. A passing result from this small rule set does not imply those extra policies.

## Generate SQL, Java and HTML {#s4}

EGL maps the shop model to SQL DDL. Each entity becomes a table with an `id` column; fields map to SQL column types; relations become `_id` columns and foreign-key declarations. Inspect the generated SQL and verify that `Purchase` refers to `Customer` and `Product` by name. This template targets a simple, generic SQL dialect; database-specific types and naming rules would need a deliberate choice in a production generator.

{{EXAMPLE:m10-sql}}

EGX invokes an EGL template once per entity, producing `Customer.java`, `Product.java` and `Purchase.java`. The template maps field types to Java types and relations to typed references. These files illustrate generation; they are not compiled by the Playground, and relationship persistence is outside this small example.

{{EXAMPLE:m10-java}}

The HTML template provides a third view of the same model. It lists entities, fields and relation counts. Open its generated output and compare the names with the SQL and Java outputs. If one generator omits an entity, the common model makes the mismatch detectable.

{{EXAMPLE:m10-html}}

## Transform to a relational model {#s5}

Text generation is not the only route. The ETL program maps `Application` to `Schema`, `Entity` to `Table`, and `Field` to `Column`. The target conforms to its own `relational.emf` metamodel, which can be validated or consumed by another generator. The initial mapping leaves relations out deliberately so you can see what information is lost.

{{EXAMPLE:m10-relational}}

Compare the target tree with the source: three tables have five declared-field columns and three generated `id` columns, but no foreign keys. The ETL rule adds `id` after `t.columns ::= e.fields`, because that assignment replaces the earlier column collection. Exercise 6 adds relation key columns and a `Relation2ForeignKey` rule, attaching its products to the right table. A successful transformation run does not mean the mapping is complete; decide the target invariants before calling it done.

## Assess and extend the solution {#s6}

Use this checklist on your own MiniJDL variant:

- **Language:** Does every class, containment and reference have a purpose? Is each model element owned exactly where intended?
- **Model:** Do all named references resolve? Can a second, different application be written without changing the metamodel?
- **Validation:** Do invalid names and relations produce clear findings? Does the corrected model pass? Which rules remain unimplemented?
- **SQL:** Are all entities, fields and relation keys present? Is the output valid for the database you choose?
- **Java:** Are the expected files and types present? If you need compilable code, have you compiled it and addressed packages/imports?
- **HTML:** Does the documentation describe the same entities and relations as the model?
- **ETL:** Do table and column counts match? Does each foreign key point to the intended target table? Can the target be validated?
- **Repeatability:** Can you rerun the pipeline after a model edit and compare the outputs without manual patching?

The reference examples give a small end-to-end solution. They do not generate a complete JHipster application. Extending MiniJDL with multiplicities, constraints, application configuration and persistence choices would be a new design exercise.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**Trace ownership.** Why does an `Entity` contain its `Field` objects, while `Relation.target` is a reference?
:::

::: solution
Fields belong to the entity that declares them. A relation points at another entity already owned by the application; containing that target would duplicate or move it.
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**Trace one element.** Follow `Purchase.customer` through the SQL, Java and HTML examples. Which representation carries the target name, and what does the HTML example omit?
:::

::: solution
SQL declares `customer_id` with a foreign key to `Customer`; Java declares a `Customer customer` field. The HTML example reports two relations for `Purchase` but does not list their names or targets, so it is a summary rather than a full schema specification.
:::

::: exercise #e3 level=1 kind=conceptual minutes=5
**Find information loss.** What does the first relational ETL target omit, and why should that be checked even though ETL finishes?
:::

::: solution
It omits the two relations from `Purchase`, so the target has no foreign keys. ETL's successful execution confirms that its rules ran; it does not establish that every required source concept was mapped.
:::

::: exercise #e4 level=2 kind=coding minutes=10
**Repair the model.** Replace the duplicate `Customer.email` field with `active: BOOLEAN`, then run the same EVL rules.
:::

::: solution
The corrected model passes all three constraints in this reference rule set:

{{EXAMPLE:m10-e4-solution}}
:::

::: exercise #e5 level=2 kind=coding minutes=10
**Extend Java generation.** Add an `entityName()` method to every generated Java class that returns its entity name.
:::

::: solution
The EGX rule still creates one file per entity; the EGL template adds the method:

{{EXAMPLE:m10-e5-solution}}
:::

::: exercise #e6 level=3 kind=coding minutes=15
**Complete the relational mapping.** Add an ETL rule that makes a foreign key for each relation and resolves its target table via the transformation trace.
:::

::: solution
`Entity2Table` adds each `_id` column and attaches each transformed relation. `Relation2ForeignKey` maps its target entity to the corresponding table. The target tree now contains `customer` and `product` foreign keys under `Purchase`:

{{EXAMPLE:m10-e6-solution}}
:::

## Self-check quiz {#quiz}

```quiz
? What is MiniJDL in this module?
- [x] A small teaching language for entities, fields and relations
- [ ] The official JHipster JDL implementation
- [ ] A SQL database engine
- [ ] An Eclipse plugin
> The language is purpose-built for the capstone.

? Which feature owns a `Field`?
- [ ] `Relation.target`
- [x] `Entity.fields`
- [ ] `Schema.tables`
- [ ] `Column.sqlType`
> An entity contains its declared fields.

? Why does the invalid model produce a validation finding?
- [ ] The `Application` is unnamed.
- [x] `Customer` has two fields called `email`.
- [ ] There are no relations.
- [ ] SQL generation failed.
> EVL checks field-name uniqueness inside an entity.

? What does the SQL generator add for each relation?
- [ ] A Java method
- [x] An `_id` column and a foreign-key declaration
- [ ] A new application
- [ ] An HTML heading
> Relations map to database references.

? What does EGX contribute to Java generation?
- [x] Repeating the template for each entity and naming output files
- [ ] Compiling Java source
- [ ] Loading CSV automatically
- [ ] Migrating old models
> EGX coordinates one output file per matching entity.

? What is missing from the first relational target?
- [ ] The schema name
- [ ] Tables
- [ ] Field columns
- [x] Foreign keys for relations
> The first mapping intentionally omits relations.

? How does `Relation2ForeignKey` find the target table?
- [ ] It searches generated SQL.
- [x] It resolves the related entity's ETL equivalent.
- [ ] It copies the source entity into the target.
- [ ] It reads the HTML output.
> The ETL trace links source entities to target tables.

? Which check is needed before claiming production-ready Java output?
- [ ] Only count source entities.
- [x] Compile the generated files and address package and persistence needs.
- [ ] Open the model diagram once.
- [ ] Remove all validation rules.
> This tutorial's generated classes are illustrative data declarations.
```

## Further reading {#reading}

- Dimitris Kolovos, [*Minimal JHipster JDL Monolith Example*](https://www-users.york.ac.uk/dimitris.kolovos/blog/jhipster-jdl-monolith-example/) (2021), for the motivating whole-application example.
- [EVL](https://eclipse.dev/epsilon/doc/evl/), [EGL](https://eclipse.dev/epsilon/doc/egl/), [EGX](https://eclipse.dev/epsilon/doc/egx/) and [ETL](https://eclipse.dev/epsilon/doc/etl/) references for extending the pipeline.
