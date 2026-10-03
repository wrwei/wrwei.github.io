// The Claude Code workflow that produced Modules 01-05. It ran in a local copy of this folder
// (WS below) with the done markers in done/. To reuse it, set WS to this series root and pass the
// remaining modules as args (see HANDOVER.md).
export const meta = {
  name: 'ai-series-build',
  description: 'Finish the AI series module by module at a paced concurrency: write, edit, figures, widgets, labs, technical review, QA, Chinese translation and QA (resumable)',
  phases: [
    { title: 'Write', detail: 'missing parts only; concepts on Opus, labs/exercises/practice on Sonnet' },
    { title: 'Edit', detail: 'Opus editor per module' },
    { title: 'Verify', detail: 'figures (EN+ZH), widgets, lab runs, technical review and fix' },
    { title: 'QA', detail: 'apply reports, build and render the English page' },
    { title: 'Translate', detail: 'Chinese parts and metadata' },
    { title: 'QA-zh', detail: 'parity, build and render the Chinese page' },
  ],
}

const WS = '<this series root>'                      // set before running
const SRC = '<folder of the source tutorials>'      // in the author's private repository
const LABPY = 'tools/labpy.sh'          // commands run from the series root
const T = 'tools'
const pad = n => String(n).padStart(2, '0')
const LIMIT = args.limit || 5
const DONE = new Set(args.done || [])

// priority-ordered concurrency limiter: lower number runs first
let active = 0
let seq = 0
const waiting = []
function next() { while (active < LIMIT && waiting.length) waiting.shift().run() }
function limited(prio, fn) {
  return new Promise(resolve => {
    const run = async () => { active++; try { resolve(await fn()) } catch (e) { resolve(null) } finally { active--; next() } }
    waiting.push({ prio, seq: seq++, run })
    waiting.sort((a, b) => a.prio - b.prio || a.seq - b.seq)
    next()
  })
}

const RESULT = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    changes: { type: 'array', items: { type: 'string' } },
    issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'changes', 'issues'],
}
const doneFile = key => `${WS}\\done\\${key}.json`
function task(prio, key, prompt, opts) {
  if (DONE.has(key)) return Promise.resolve({ summary: `(completed in an earlier run; full report in ${doneFile(key)})`, changes: [], issues: [] })
  const full = `${prompt}

Resumability: this task's key is "${key}". Before anything else, check whether ${doneFile(key)} exists. If it does, read it and return its contents as your result without doing anything else. When you have finished, write your result (the same JSON object you return) to that file.`
  return limited(prio, () => agent(full, { label: key, schema: RESULT, ...opts }))
}

const head = m => `Module ${pad(m.n)} ("${m.title}") of the ten-module tutorial series "From Machine Learning to Large Language Models" on Ran Wei's academic home page`
const dir = m => `${WS}\\src\\en\\module_${pad(m.n)}`
const slice = (m, part) => `${WS}\\plan\\slices\\module_${pad(m.n)}\\${part.replace('.md', '.json')}`
const reportsOf = rs => rs.filter(Boolean).map(r => `- ${r.summary}${r.issues && r.issues.length ? ' | ISSUES: ' + r.issues.join(' | ') : ''}`).join('\n')

const QUALITY = `Quality bar: a ~10-hour self-study unit for engineers studying alone. Textbook depth: intuition before formalism, derivations written out step by step, worked examples with the plan's numbers, the reasons behind each choice, the failure modes. The source's voice: direct, precise, British spelling, no filler, no hype, no emoji. Verify every number, derivation and code snippet (compute with ${LABPY}); if the plan is wrong, write the correct version and say so in your result. Never invent citations, model sizes, results or prices. The machine is shared by parallel jobs: code may run 2-3x slower than on a laptop; do not shrink work because of that.`

function writerPrompt(m, p) {
  const common = `You are writing part of ${head(m)}.
Read ${WS}\\BRIEF.md (series decisions), ${WS}\\SPEC.md (how text is written down), your part's outline slice ${slice(m, p.part)} (module context plus your entries; the full plan ${WS}\\plan\\module_${pad(m.n)}.json is large, so open it only for a detail you need), and the source tutorial ${SRC}\\${m.file} (keep its good material and voice; replace platform-specific passages as generalised_refs say).
Your file: ${dir(m)}\\${p.part}. Other part files in that folder are written by other writers: read them if they exist (for continuity and to avoid repeating them), but edit only your own file.${p.partial ? `\nYour file ${p.partial}: read it, keep what is complete and good, verify it, and write the rest.` : `\nIf your file already exists from an interrupted attempt, read it, keep what is complete and good, and finish the rest.`}`
  const check = `node ${T}/check.mjs --module ${m.n} --lang en`
  if (p.kind === 'concepts') return `${common}

Write the concept sections ${p.ids.map(i => `{#${i}}`).join(', ')} in that order${p.includes_wrong ? `, then "## What goes wrong {#wrong}" from the slice's what_goes_wrong list (each item as symptom, cause and fix, about 900-1,300 words under ### subheadings)` : ''}. Follow the slice exactly: every must_cover item; every worked_example as a ::: worked box with the arithmetic step by step; every planned figure placed with ::: figure id=... and a caption that precisely describes it; the planned widget with ::: widget name=...; the planned checks as ::: check / ::: answer pairs at the end of each section. Hit each section's target_words within plus or minus 15% (about ${p.words} words in total). Write the file in a few large writes, not many small edits.

${QUALITY}

Before finishing run ${check} --words and fix every ERROR in your file. Result: summary (sections written, words), changes (plan corrections), issues.`
  if (p.kind === 'labs') return `${common}

Write the labs ${p.ids.map(i => `{#${i}}`).join(', ')} in that order, following the slice's labs entries and SPEC.md section 5: 25-50 minutes of hands-on work each, the code built up in steps (6-12 blocks) with an explanation before each block and its output after, plots titled and labelled, and "### What you should see" and "### Try this" at the end.
Run each lab after writing it: ${LABPY} ${T}/labrun.py --module ${m.n} --lab <labK> --update --add-missing
It executes the lab's python blocks in a fresh process, reports errors and differences, writes the real outputs into the output fences and captures plots. Iterate until it runs cleanly; then make every statement in your prose agree with the real output (the run is the truth). Downloads only as the slice lists.

${QUALITY}

Before finishing run ${check} and fix every ERROR in your file. Result: summary (labs written, measured runtimes, all outputs match?), changes (plan corrections), issues.`
  if (p.kind === 'exercises') return `${common}

Write "## Exercises {#exercises}": a short introduction (grading from one star to three, total time, solutions hidden until opened), then every exercise of the slice in order, each as ::: exercise (id, level, kind, minutes) followed by ::: solution (SPEC.md section 7). Prompts precise and self-contained; solutions complete: every derivation step, every number computed and checked with ${LABPY}, coding answers as complete code you have run, with its output. Say why each step is taken.

${QUALITY}

Before finishing run ${check} and fix every ERROR in your file. Result: summary, changes (plan corrections), issues.`
  return `${common}

Write, in order: "## Self-check quiz {#quiz}" (one sentence, then the slice's 10-12 questions in one quiz fence per SPEC.md section 7, polished: one unambiguous answer, distractors that capture real misconceptions, explanations covering every option; verify each answer); "## Guided reading {#reading}" (how to read a paper in two passes, then one ::: paper minutes=N per planned paper: full citation, Why read it, What to read and skip, 4-6 Questions to answer while reading, After reading); "## Summary {#summary}" (8-12 standalone bullets of the module's key results, then a paragraph pointing to ${m.n < 10 ? 'the next module' : 'the AI Agents series and back over the series'}); "## References {#refs}" (every reference and every paper cited in the slice, one per bullet with a one-line note). Verify citations; if unsure of a detail, use WebSearch (load it with ToolSearch) or give fewer details rather than wrong ones.

${QUALITY}

Before finishing run ${check} and fix every ERROR in your file. Result: summary, changes, issues.`
}

function editorPrompt(m, writes) {
  return `You are the editor of ${head(m)}. Its seven part files are in ${dir(m)} (concatenated in file-name order). Some were written in an earlier session, some just now.
Read ${WS}\\BRIEF.md, ${WS}\\SPEC.md, the plan ${WS}\\plan\\module_${pad(m.n)}.json, and the whole module in order.
Writers' reports:
${reportsOf(writes) || '- (none: all parts came from the earlier session)'}
Reports of writers from earlier runs are in ${WS}\done\m${pad(m.n)}-write-*.json; read them for plan corrections and issues.

Make the parts read as one module with targeted edits (Edit tool), never wholesale rewrites, never shortening:
1. Run node ${T}/check.mjs --module ${m.n} --lang en --words; fix every ERROR and every warning about this module's text (missing sections, broken anchors, study-plan refs). Warnings about undrawn figures and unbuilt widgets are expected.
2. Continuity and no duplication; every cross-reference (Section, Lab, Figure, Exercise, equation) points at what it claims.
3. Consistency: one symbol per quantity, the same terms, the running examples with the same numbers everywhere; apply writers' plan corrections everywhere they matter.
4. Coverage: everything the plan lists is present. If a part is missing or incomplete, write it.
5. Figures: keep at most 18 ::: figure blocks in the module, the ones that explain a mechanism or a key result; remove decorative or redundant ones (a figure that repeats a table or a lab plot) and fix references to them. Captions must say precisely what each figure shows.
6. BRIEF.md rules: voice, British spelling, no platform references, dated and conservative claims, USD instead of dollar signs.
7. If you change code in a lab section, re-run it with ${LABPY} ${T}/labrun.py --module ${m.n} --lab <labK> --update and reconcile the prose.
8. Polish the plan's display fields (lead, outcomes, prerequisites, software, sessions' titles and activities' "what") in the plan JSON: maths as $...$, no "By the end you can" prefix, one clear sentence each, and every activity's refs pointing at ids that exist on the page. Edit only those fields; keep the JSON valid.
Result: summary (errors remaining, concept words, figures kept), changes, issues.`
}

function figurePrompt(m, part) {
  return `You are drawing the figures placed in ${dir(m)}\\${part}, part of ${head(m)}.
Read ${WS}\\BRIEF.md and ${WS}\\FIGURES.md, and ${WS}\\GLOSSARY.md for Chinese labels. In ${part}, find every "::: figure id=..." and read its caption and the paragraphs around it: the figure must show exactly what they say, with the same symbols and numbers. The plan's description of each is in ${slice(m, part)} (sections[].figures).
For each figure: draw ${WS}\\src\\figures\\en\\<id>.svg (data plots through figstyle.py with a generator ${WS}\\src\\figures\\en\\_gen\\<id>.py that takes en|zh; schematics as hand-written SVG); render it with node ${T}/shot.mjs "<path to svg>" --out "${WS}\\shots\\<id>" --width 760 --height 520 and look at the PNG; iterate until it passes FIGURES.md's checks. Then make the Chinese version ${WS}\\src\\figures\\zh\\<id>.svg (the generator with zh, or a copy of the hand-written SVG with its visible text translated) and render and check it too. If a figure file already exists from an interrupted attempt, check it instead of redrawing.
Do not edit the Markdown. If a caption is wrong or cannot be drawn as written, put the exact replacement caption in issues ("<id>: replace caption with: ...").
Result: summary (figures drawn), changes, issues.`
}

function widgetPrompt(m, w) {
  const exists = m.widgetsExisting.includes(w)
  return `You are responsible for the interactive widget "${w}" of ${head(m)}.
Read ${WS}\\BRIEF.md and ${WS}\\WIDGETS.md, ${WS}\\src\\assets\\widgets-core.js and the widget classes in ${WS}\\src\\assets\\style.css. The specification is the widgets[] entry "${w}" in ${WS}\\plan\\module_${pad(m.n)}.json; read the module text around "::: widget name=${w}" in ${dir(m)} so the widget uses the same symbols, numbers and defaults, and ${WS}\\GLOSSARY.md for Chinese labels.
${exists ? `${WS}\\src\\widgets\\${w}.js was written in an interrupted earlier attempt and has not been verified: test it, finish it, and fix it.` : `Write ${WS}\\src\\widgets\\${w}.js.`}
Then verify it adversarially: implement the specification's maths independently in Python (${LABPY}) and compare with what the widget shows in its default state and at least three other states, set with node ${T}/widget-probe.mjs ${w} --set "..." (extremes and every select option included); any disagreement beyond display rounding is a bug. Run node ${T}/widget-test.mjs ${w} --lang en and --lang zh and read every screenshot (overlaps, clipping, untranslated Chinese, controls that change nothing, a default state that does not show the teaching point, 400 px layout). Fix and re-test until clean.
Result: summary (controls, default state, numbers checked: widget vs Python), changes, issues.`
}

function labPrompt(m, part) {
  return `You are verifying the labs in ${dir(m)}\\${part}, part of ${head(m)}. Read ${WS}\\SPEC.md section 5 and ${WS}\\BRIEF.md (lab environment).
Run every lab in that file: ${LABPY} ${T}/labrun.py --module ${m.n} --lab <labK>. For a lab that fails, times out or differs, find the cause; fix the code, or accept the real output with --update when the difference is the writer's guess; re-run until every lab matches, then run each once more without --update to confirm the outputs are reproducible. Read each lab's prose and make every statement about its outputs agree with the real outputs. Check SPEC compliance: self-contained, seeded, QUICK flag on a long training lab, plots titled and labelled, downloads only as listed, runtime near the plan's (state both). Edit only ${part}.
Result: summary (per lab: seconds, status), changes, issues.`
}

function reviewPrompt(m) {
  return `You are the technical reviewer of ${head(m)}. Read ${WS}\\BRIEF.md, ${WS}\\notes\\CANONICAL.md (series-wide numbers and conventions every module must follow), the plan ${WS}\\plan\\module_${pad(m.n)}.json, and the whole module in ${dir(m)}.
Review adversarially: assume errors until you have checked. Recompute every equation, derivation step, worked example and number in the concept sections, the exercises and solutions, and the quiz answers (use ${LABPY}). Check facts: citations (authors, titles, venues, years; use WebSearch via ToolSearch where unsure), historical claims, model, hardware and price figures (dated, labelled as assumptions), the case study's canonical numbers, links to other modules, the public-site rules, and BRIEF.md's topic ownership (derive once, recall elsewhere). Check that each quiz question has exactly one defensible answer.
Fix what you find directly with the Edit tool in the concept, exercise and practice files (10-*, 11-*, 12-*, 30-*, 40-*). Do not edit the lab files (20-*, 21-*): report lab problems in issues, quoting the text and the fix. Then run node ${T}/check.mjs --module ${m.n} --lang en and fix any ERROR you caused.
Result: summary (counts by kind), changes (each fix: location, before, after), issues.`
}

function qaPrompt(m, verify) {
  return `You are the English QA of ${head(m)}. The figure designers, widget owner, lab verifiers and technical reviewer have reported:
${reportsOf(verify) || '- (no reports)'}
Reports from earlier runs (figures, widgets, labs, review) are in ${WS}\done\m${pad(m.n)}-*.json: read the fig-, widget-, labs- and review files for issues to apply.
1. Apply the issues they raised that need an edit (caption replacements, lab-prose fixes the reviewer reported, mismatches between text and widgets). Check each before applying; skip and explain any that are wrong.
2. Run node ${T}/check.mjs --module ${m.n} --lang en and fix every ERROR.
3. Build and render: node ${T}/build.mjs --module ${m.n} --lang en; then node ${T}/shot.mjs "${WS}\\out\\ai\\module_${pad(m.n)}_EN.html" --out "${WS}\\shots\\m${pad(m.n)}-en" --pages 8. Fix every console error, KaTeX error, unrendered expression, broken image and failed widget at its source.
4. node ${T}/shot.mjs "${WS}\\out\\ai\\module_${pad(m.n)}_EN.html" --out "${WS}\\shots\\m${pad(m.n)}-fig" --elements "figure.fig, .widget-wrap" --max 30; look at each screenshot: every figure must match its caption and the text, nothing clipped or overlapping. Fix the caption or the figure (${WS}\\src\\figures\\en\\ and zh\\).
5. Look at the page screenshots for layout problems and fix them in the Markdown.
Result: summary, changes, issues.`
}

function translatePrompt(m, part) {
  return `You are translating ${dir(m)}\\${part} (part of ${head(m)}) into Simplified Chinese.
Read ${WS}\\TRANSLATION.md and follow it exactly, ${WS}\\GLOSSARY.md (use its terms everywhere), and the English file in full. Write ${WS}\\src\\zh\\module_${pad(m.n)}\\${part}: every paragraph translated faithfully and fluently; code blocks, output blocks, maths, section ids and container lines kept as TRANSLATION.md says. If the file already exists from an interrupted attempt, finish it.
Check: node ${T}/check.mjs --module ${m.n} --part ${part} — fix every error and every "looks untranslated" warning that is real.
Result: summary, changes (terms you had to choose that are not in the glossary), issues.`
}

function metaPrompt(m) {
  return `You are translating the display metadata of ${head(m)} into Simplified Chinese. Read ${WS}\\TRANSLATION.md section 5 and ${WS}\\GLOSSARY.md, then ${WS}\\plan\\module_${pad(m.n)}.json. Write ${WS}\\src\\zh\\module_${pad(m.n)}.meta.json with exactly the fields TRANSLATION.md section 5 lists (title, title_em, lead, prerequisites, outcomes, software, sessions with n/kind/minutes/refs unchanged, labs titles in plan order). Keep maths ($...$) as it is. Validate the JSON with ${LABPY}.
Result: summary, changes, issues.`
}

function qaZhPrompt(m, tr) {
  return `You are the Chinese QA of ${head(m)}. Translators reported:
${reportsOf(tr) || '- (no reports)'}
Reports of translators from earlier runs are in ${WS}\done\m${pad(m.n)}-zh-*.json.
1. Run node ${T}/check.mjs --module ${m.n} (both languages and their parity); fix every ERROR in the Chinese files (${WS}\\src\\zh\\module_${pad(m.n)}\\ and the meta file), never by changing the English.
2. Terminology: make every term follow ${WS}\\GLOSSARY.md across the whole module; make the Chinese read naturally (TRANSLATION.md style rules: full-width punctuation, spaces between Chinese and Latin or digits).
3. Build and render: node ${T}/build.mjs --module ${m.n} --lang zh; node ${T}/shot.mjs "${WS}\\out\\ai\\module_${pad(m.n)}_ZH.html" --out "${WS}\\shots\\m${pad(m.n)}-zh" --pages 6 and --elements "figure.fig" --max 30. Fix console or KaTeX errors, untranslated text, and Chinese figures whose labels overlap or overflow (${WS}\\src\\figures\\zh\\).
Result: summary, changes, issues.`
}

async function runModule(m) {
  const P = s => m.n * 10 - s
  const k = s => `m${pad(m.n)}-${s}`
  const writes = await Promise.all(m.missing.map(p => {
    const opts = p.kind === 'concepts' ? { phase: 'Write', effort: 'high' }
      : p.kind === 'exercises' ? { phase: 'Write', model: 'sonnet', effort: 'high' }
      : { phase: 'Write', model: 'sonnet', effort: 'medium' }
    return task(P(1), k(`write-${p.part.replace('.md', '')}`), writerPrompt(m, p), opts)
  }))
  const editor = await task(P(2), k('edit'), editorPrompt(m, writes), { phase: 'Edit', effort: 'high' })
  const verify = await Promise.all([
    ...m.conceptParts.map(part => task(P(3), k(`fig-${part.replace('.md', '')}`), figurePrompt(m, part), { phase: 'Verify', model: 'sonnet', effort: 'medium' })),
    ...m.widgets.map(w => task(P(3), k(`widget-${w}`), widgetPrompt(m, w), { phase: 'Verify', model: 'sonnet', effort: 'medium' })),
    ...m.labParts.map(part => task(P(3), k(`labs-${part.replace('.md', '')}`), labPrompt(m, part), { phase: 'Verify', model: 'sonnet', effort: 'medium' })),
    task(P(3), k('review'), reviewPrompt(m), { phase: 'Verify', effort: 'high' }),
  ])
  const qa = await task(P(4), k('qa-en'), qaPrompt(m, verify), { phase: 'QA', model: 'sonnet', effort: 'medium' })
  const tr = await Promise.all([
    ...m.allParts.map(part => task(P(5), k(`zh-${part.replace('.md', '')}`), translatePrompt(m, part), { phase: 'Translate', model: 'sonnet', effort: 'low' })),
    task(P(5), k('zh-meta'), metaPrompt(m), { phase: 'Translate', model: 'sonnet', effort: 'low' }),
  ])
  const qaZh = await task(P(6), k('qa-zh'), qaZhPrompt(m, tr), { phase: 'QA-zh', model: 'sonnet', effort: 'medium' })
  const all = [...writes, editor, ...verify, qa, ...tr, qaZh]
  return {
    module: m.n,
    failed: all.filter(x => !x).length,
    editor: editor && editor.summary, qa: qa && qa.summary, qaZh: qaZh && qaZh.summary,
    issues: all.filter(Boolean).flatMap(x => x.issues || []).slice(0, 40),
  }
}

const results = await Promise.all(args.modules.map(runModule))
log(`modules finished; failed tasks per module: ${results.map(r => `m${pad(r.module)}:${r.failed}`).join(' ')}`)
return results
