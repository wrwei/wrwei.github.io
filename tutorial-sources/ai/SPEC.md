# SPEC — how a module of the AI series is written

Read `BRIEF.md` first (audience, voice, the 10-hour budget, public-site rules, lab environment,
topic ownership). This file says how the text is *written down* so the build can turn it into a
page. The plan for your module, `plan/module_NN.json`, is the contract for *what* is written.

## 1. Files

- You write Markdown into `src\en\module_NN\<part>.md`. Your task names the part
  file(s). Parts are concatenated in file-name order into one page, so a part starts with its
  first `##` heading and contains whole sections only.
- Do **not** write: front matter, a title, the hero, the "at a glance" box, the study plan, or the
  key-terms table. The build generates all of these from the plan.
- Never edit another writer's part file unless your task says so.

## 2. The page skeleton, with fixed ids

Every `##` heading ends with an id in braces. The build numbers the sections and lists them in
the sidebar. The ids are fixed so that links, the study plan and the translation line up.

| Heading | Id |
|---|---|
| each concept section, in plan order | `{#s1}` ... `{#sN}` (exactly the plan's ids and order) |
| What goes wrong | `{#wrong}` |
| each lab: `## Lab 1 — Title` | `{#lab1}` ... (the plan's lab ids) |
| Exercises | `{#exercises}` |
| Self-check quiz | `{#quiz}` |
| Guided reading | `{#reading}` |
| Summary | `{#summary}` |
| References | `{#refs}` |

Inside a section use `###` for subsections and `####` sparingly. Never use a single `#`.
The build injects the reading time under concept headings and the time, CPU runtime and download
size under lab headings (from the plan), so do not write those yourself.

## 3. Markdown

CommonMark plus GFM tables. **Bold** a term where it is defined. `Inline code` for identifiers,
shapes in code, file names and commands. Links: `[text](url)`. Do not use raw HTML.

Cross-references:
- within the page: `[Section 3](#s3)`, `[Lab 2](#lab2)`, `[Exercise 4](#e4)`, `Figure 6.2`;
- other modules: `[Module 02](module_02_EN.html)` or `[Module 06, Section 4](module_06_EN.html#s4)`;
- the AI Agents series: `[AI Agents, Module 08](../agent/module_08_EN.html)`.

## 4. Maths

Rendered by KaTeX. The build fails on any expression KaTeX cannot parse.

- Inline: `$\nabla_\theta \mathcal{L}$`. Display: `$$ ... $$`, with the `$$` lines on their own.
- The opening `$` must touch its content (`$x$`, not `$ x$`); so must the closing one.
- **A `$` always starts maths.** Never write a dollar sign for money: write `USD 2.50`.
- Multi-line: `$$\begin{aligned} a &= b \\ c &= d \end{aligned}$$`. Also available: `cases`,
  `pmatrix`, `bmatrix`, `array`, `\tag{3.2}` for an equation referred to later.
- Words inside maths go in `\text{...}`. Macros: `\R`, `\E`, `\argmin`, `\argmax`, `\KL`,
  `\softmax`.
- Keep maths out of headings except single symbols.

## 5. Code

- ` ```python ` for Python, ` ```bash ` for shell, ` ```text ` for anything else.
- ` ```output ` for what the code prints, directly after the block that prints it.
- ` ```python norun ` for code that must not be executed (a GPU-only variant, a fragment shown for
  explanation). Only `python` blocks inside lab sections are executed; elsewhere every block is
  display-only, but should still be correct.
- Style: lines of at most 88 characters; names that say what they hold; comments that say *why*;
  print with fixed decimals (`f"{loss:.4f}"`) so outputs are stable; never print large arrays.

### Labs

A lab is a section `## Lab k — Title {#labk}`. Inside it:

1. **Goal.** One paragraph: what the learner builds and what they will see.
2. Steps, as `###` subsections, alternating explanation and code. The code blocks of the lab, run
   in order in one fresh Python process, must reproduce every output shown. The first block
   imports and seeds (`np.random.seed(0)`, `torch.manual_seed(0)`).
3. After each block that prints, an ` ```output ` block. Write your best prediction of the exact
   output; the verification phase executes every lab and replaces it with the real output. So
   the prose may say "about 0.96" but must not hang an argument on the fourth decimal.
4. `plt.show()` to display a plot: the lab runner captures it and the page shows the image under
   the block. Label axes and give every plot a title.
5. **What you should see** and **Try this** subsections: observations and 2–4 extensions.
- Each lab is self-contained: no lab may need another lab's variables or files. If a lab builds on
  earlier code (a model from Module 06, say), include that code in the lab.
- Respect the runtime in the plan. A larger training lab has `QUICK = True` at the top that
  finishes in about three minutes on a laptop CPU.
- Downloads only as listed in BRIEF.md; say how big they are.

## 6. Containers

A container starts with `::: kind attributes` on its own line and ends with `:::` on its own line,
with a blank line before and after. The body is ordinary Markdown. Do not nest containers.

Callouts — use them for what they say, not for decoration:

```text
::: note
A fact the reader should not miss.
:::

::: tip
Practical advice.
:::

::: analogy
A comparison with something familiar.
:::

::: pitfall
A mistake people make, and its symptom.
:::

::: keyidea
The one sentence to remember from a section. At most one per section.
:::
```

Worked examples (every concept section with numbers has at least one):

```text
::: worked title="Three tokens through causal attention"
Step-by-step arithmetic with the actual numbers. End with the result and what it shows.
:::
```

Check your understanding (the plan's `checks`; at the end of a concept section or after a key
idea). A `check` is always followed by its `answer`:

```text
::: check
Why does dividing by $\sqrt{d_k}$ keep the softmax from saturating at initialisation?
:::

::: answer
Because ...
:::
```

Figures. The SVG is drawn separately, from the plan's description and your caption; you place it
and caption it. Ids are `fig-NN-k` as in the plan (an extra figure takes the next free number and
the caption must describe it precisely). Refer to it in the text as "Figure N.k".

```text
::: figure id=fig-06-2
Scaled dot-product attention for one query: scores against every key, a softmax, and a weighted
sum of the values.
:::
```

Interactive widgets, built separately from the plan's spec. The body tells the reader what to try:

```text
::: widget name=attention-calculator
Switch the causal mask off and watch row 1 start to attend to tokens 2 and 3.
:::
```

## 7. Exercises, quiz, reading, summary, references

Exercises: one `::: exercise` per exercise followed by its `::: solution`. Ids `e1`, `e2`, ...;
`level` is 1, 2 or 3 (★ to ★★★); `kind` is one of conceptual, derivation, calculation, coding,
project; `minutes` is the time it should take. Solutions are complete: every step of a derivation,
the final number, working code where code was asked for.

```text
::: exercise id=e3 level=2 kind=derivation minutes=15
Show that ...
:::

::: solution
Start from ...
:::
```

Quiz: one fenced block with the info string `quiz` inside the `{#quiz}` section. Each question
starts with `? `, options are `- [ ]` / `- [x]` (exactly one `[x]`), and the explanation is one or
more `> ` lines. Maths and Markdown work inside.

````text
```quiz
? Which loss follows from assuming Gaussian noise on the targets?
- [ ] Cross-entropy
- [x] Mean squared error
- [ ] Hinge loss
- [ ] Mean absolute error
> The negative log-likelihood of $y \sim \mathcal{N}(\hat y, \sigma^2)$ is
> $\frac{(y-\hat y)^2}{2\sigma^2}$ plus a constant, so maximising likelihood minimises squared error.
```
````

Guided reading: one `::: paper minutes=25` per paper. Body: the full citation as the first
paragraph, then **Why read it**, **What to read** (sections to read and to skip), and
**Questions to answer while reading** as a numbered list.

Summary: 8–12 bullets, each a sentence that stands alone, then a short paragraph pointing to the
next module.

References: a bulleted list, one reference per bullet, "Authors. "Title." *Venue*, Year." plus an
optional one-line note. Papers cited in the text appear here.

## 8. Before you finish

Run the checker on your module and fix every ERROR located in your part:

```bash
node tools/check.mjs --module N --lang en --words
```

While other writers are still working, warnings about missing sections, figures, widgets or
labs in other parts are expected. The `--words` table shows the word count of each concept
section against its target.
