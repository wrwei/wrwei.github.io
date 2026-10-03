# TRANSLATION — the Simplified Chinese edition of the AI series

Read `BRIEF.md` and `SPEC.md` first. The Chinese edition is a faithful, fluent translation of the
English one, for engineers who read papers in English and discuss them in Chinese. It is not a
summary: every paragraph, derivation, worked example, lab step, exercise and solution is
translated.

## Files

- English part `src/en/module_NN/<part>.md` → Chinese part `src/zh/module_NN/<part>.md`, same
  file name.
- Module metadata → `src/zh/module_NN.meta.json` (see section 5).
- Figures `src/figures/en/fig-NN-k.svg` → `src/figures/zh/fig-NN-k.svg` (see section 6).

## 1. What must stay byte-identical

The build checks these and fails if they differ:

- every code block, including ` ```output ` blocks and code inside exercises and solutions
  (comments in code stay in English, as in the site's other Chinese tutorials);
- every `##` heading id (`{#s3}`, `{#lab2}`, `{#exercises}`...) and the order of sections;
- container syntax and attributes: `::: exercise id=e3 level=2 kind=derivation minutes=15`,
  `::: figure id=fig-06-2`, `::: widget name=...`, `::: paper minutes=25` (only a `title="..."`
  value is translated);
- maths, except words inside `\text{...}`, which are translated;
- URLs. Links to other modules change from `module_NN_EN.html` to `module_NN_ZH.html`; links to the
  AI Agents series change from `module_NN_EN.html` to `module_NN_ZH.html` likewise.

Everything else is translated: headings (keep the id), prose, lists, tables, callouts, worked
examples, checks and answers, figure and widget captions, lab explanations, exercise prompts and
solutions (except code), the quiz (questions, options and explanations — the ` ```quiz ` block is
translated, keeping its `?`, `- [ ]`, `- [x]` and `>` markers), paper guides, the summary.
References keep their original (English) citations; a short Chinese note may follow.

## 2. Terminology

Use the canonical glossary `GLOSSARY.md` for every term in it, everywhere, so the same English
term gets the same Chinese term in all ten modules. At a key term's first use in a module, give the
English in full-width brackets: 梯度下降（gradient descent）. After that, Chinese only. Terms that
Chinese engineers normally say in English stay in English: Transformer, token, RoPE, LoRA, KV
cache, GPU, batch, PyTorch, Adam, softmax. If a term is not in the glossary, use the standard
rendering of the Chinese ML literature (e.g. the Chinese edition of *Dive into Deep Learning*,
《动手学深度学习》) and list it in your return value.

## 3. Style

- Natural technical Chinese, as a good Chinese textbook would write it — not word-for-word.
  Restructure sentences where English order reads badly in Chinese. Keep the English edition's
  directness: short sentences, no padding, no added hedging.
- Full-width punctuation in Chinese text: ，。：；？！“”（）、. Half-width inside maths, code,
  numbers and English terms.
- A space between Chinese characters and Latin letters or Arabic numerals: 使用 PyTorch 训练
  10 个周期；第 3 节；Figure → 图 6.2. No space next to full-width punctuation.
- Numbers, units and symbols as in the English: 7B、16 GB、1.5 × 10²²（in maths, as written).
- The callout labels, buttons and page chrome are translated by the build; do not add them.
- Section titles translated, concise: "What goes wrong" → "常见问题与排查", "Exercises" → "练习",
  "Self-check quiz" → "自测题", "Guided reading" → "论文导读", "Summary" → "小结",
  "References" → "参考文献", "Lab 2 — ..." → "实验 2 — ...".

## 4. Check before you finish

```bash
node tools/check.mjs --module N
```

It checks both languages and their parity. Fix every error that concerns your files (code blocks
that differ, section ids that differ, broken containers, KaTeX errors in translated `\text{}`).

## 5. Module metadata

`src/zh/module_NN.meta.json` translates these fields of `plan/module_NN.json` and nothing else:

```json
{
  "title": "...", "title_em": "a substring of the Chinese title to highlight", "lead": "...",
  "prerequisites": ["..."], "outcomes": ["..."], "software": ["..."],
  "sessions": [ { "n": 1, "title": "...", "activities": [ { "what": "...", "kind": "read", "minutes": 55, "refs": ["s1"] } ] } ],
  "labs": [ { "title": "..." } ]
}
```

Sessions keep `n`, `kind`, `minutes` and `refs` exactly; only `title` and `what` are translated.
`labs` lists the labs in plan order with translated titles.

## 6. Figures

Copy each English SVG and translate its visible text (`<text>` and `<tspan>` content). Keep
symbols, numbers and maths as they are. Chinese text is wider per character than you might expect:
render each figure and look at it, and adjust positions or font size (not below 11) so nothing
overlaps or overflows:

```bash
node tools/shot.mjs "src\figures\zh\fig-NN-k.svg" --out "shots\zh-fig-NN-k" --width 760 --height 520
```

Add `font-family="DM Sans, PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif"`
to the root `<svg>` of each Chinese figure.
