# WIDGETS — building the interactive demos of the AI series

Read `BRIEF.md` first. A widget is a small interactive demo that makes one idea visible: moving a
slider should show the learner something they could not see in a static figure. The plan
(`plan/module_NN.json`, `widgets[]`) gives each widget's teaching point, controls, displays,
defaults and a behavioural spec. If the module text exists, read the paragraphs around
`::: widget name=...` so the widget uses the same symbols, numbers and defaults as the text.

## Files and API

One file per widget: `src\widgets\<name>.js`. It is concatenated after
`src/assets/widgets-core.js` into one bundle, so it must not declare globals (wrap helpers inside
the register callback, or in an IIFE) and must not rely on load order between widgets.

```js
AIW.register('attention-calculator', function (el, opts) {
  // el: the empty <div class="widget">; opts: its data-* attributes (strings)
  var t = AIW.t                       // t('English', '中文') picks by page language
  ...
})
```

Read `src/assets/widgets-core.js` for the helpers. The important ones:

- `AIW.h(tag, attrs, ...children)` builds DOM (`class`, `text`, `style` object, `onclick`...).
- `AIW.slider({label, min, max, step, value, log, fmt, onInput})`, `AIW.select({label, options,
  value, onChange})`, `AIW.checkbox(label, checked, onChange)`, `AIW.button(label, onClick,
  secondary)` return labelled controls; put them in `AIW.h('div', {class: 'w-controls'})`.
- `AIW.canvas(parent, {aspect, maxHeight}, draw)` gives a crisp, responsive canvas;
  `draw(ctx, w, h)` is called on every resize and on `api.redraw()`.
- `AIW.axes(ctx, {w, h, x0, x1, y0, y1, xlabel, ylabel, logY, xfmt, yfmt})` draws axes and returns
  `{X, Y}` to map data to pixels.
- `AIW.C` (palette), `AIW.SERIES` (series colours), `AIW.fmt(x, digits)`, `AIW.rng(seed)` (seeded
  random numbers), `AIW.gauss(rand)`, `AIW.softmax(xs)`, `AIW.debounce(fn, ms)`.
- CSS classes from `style.css`: `w-row`, `w-col` (responsive columns), `w-controls`, `w-ctl`,
  `w-val`, `w-btn`, `w-canvas`, `w-readout` (monospace numbers), `w-note`, `w-legend`,
  `w-matrix` (a bracketed grid of number inputs), `w-table`.

## Rules

- Vanilla JavaScript (ES2017 is fine), no libraries, no network, no storage, no `innerHTML`
  (build DOM with `AIW.h` and `textContent`), no `eval`.
- Every label, button, readout and note goes through `AIW.t(en, zh)`. Use the Chinese terms of the
  module's plan (`terms`).
- Deterministic: random data comes from `AIW.rng(seed)`, so the demo looks the same on every visit.
- Fast: an input event must redraw within a frame or two. Heavy work (training a tiny network,
  running a simulation) runs in small chunks with `requestAnimationFrame`, behind Play/Pause and
  Reset buttons, and stops when it converges or after a bounded number of steps.
- The default state shows the teaching point immediately, without touching anything.
- Show numbers as well as pictures: a `w-readout` with the key quantities (the loss, the step
  size, the entropy, the memory in GB).
- Maths in static labels may be a `span` with class `math-i` and the TeX as its text (KaTeX
  renders it once after mounting); dynamic readouts use plain text and Unicode.
- Works at 400 px wide: stack with `w-row` / `w-col`, size canvases with `AIW.canvas`.
- The numbers must be right. Implement the maths exactly as the text states it, and check the
  default state against a hand or Python calculation (`tools/labpy.sh`).

## Test

```bash
node tools/widget-test.mjs <name> --lang en
node tools/widget-test.mjs <name> --lang zh
```

It mounts the widget in `tools/widget-harness.html`, drives every control, and prints JSON with
errors, which controls changed the output, and three screenshots (initial, after driving the
controls, at 400 px). Read the screenshots.

To check numbers in a particular state, set controls and read back the widget's text:

```bash
node tools/widget-probe.mjs <name> --set "0=0.5;2=cosine;4=click" --shot shots/probe.png
```

Controls are numbered in DOM order; the tool lists them before and after setting them. Done means: no errors; every control changes something;
the initial state shows the teaching point; nothing overlaps or overflows at 400 px; the Chinese
version is fully translated; the numbers match your independent calculation.
